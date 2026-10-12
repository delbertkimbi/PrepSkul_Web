import { getServiceSupabaseAdmin } from '@/lib/skulmate/billing'
import { ApiInputError } from '@/lib/skulmate/api-input'

export type Quote = { externalId: string; table: 'trial_sessions' | 'payment_requests'; id: string; userId: string; amount: number }
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
function adminClient() {
  const admin = getServiceSupabaseAdmin()
  if (!admin) throw new ApiInputError('Payments are temporarily unavailable', 503)
  return admin
}
export function normalizePhone(raw: unknown): string {
  if (typeof raw !== 'string') throw new ApiInputError('A mobile money phone number is required')
  const phone = raw.replace(/[\s()+-]/g,'').replace(/^237/,'')
  if (!/^6\d{8}$/.test(phone)) throw new ApiInputError('Enter a valid Cameroon mobile number')
  return phone
}
export async function resolvePaymentQuote(userId: string, externalId: string): Promise<Quote> {
  const admin = adminClient()
  const match = /^(trial|payment_request|booking)_(.+)$/.exec(externalId)
  if (!match || !uuid.test(match[2])) throw new ApiInputError('Invalid payment reference')
  const [,kind,id] = match
  if (kind === 'trial') {
    const {data: row,error} = await admin.from('trial_sessions').select('id,learner_id,parent_id,requester_id,duration_minutes,status,payment_status').eq('id',id).maybeSingle()
    if (error || !row || ![row.learner_id,row.parent_id,row.requester_id].includes(userId)) throw new ApiInputError('Payment not found',404)
    if (row.status !== 'accepted' || row.payment_status === 'paid') throw new ApiInputError('This trial cannot be paid',409)
    const {data: price,error: pricingError} = await admin.from('trial_session_pricing').select('price_xaf,discount_percent,discount_amount').eq('duration_minutes',row.duration_minutes).eq('is_active',true).single()
    if (pricingError || !price) throw new ApiInputError('Trial price is unavailable',503)
    const base = Number(price.price_xaf)
    const amount = Math.round((Number(price.discount_percent)>0 ? base*(1-Number(price.discount_percent)/100) : base-Number(price.discount_amount||0))/100)*100
    if (!Number.isSafeInteger(amount) || amount < 100) throw new ApiInputError('Trial price needs review',409)
    return {externalId,table:'trial_sessions',id,userId,amount}
  }
  let query = admin.from('payment_requests').select('id,student_id,amount,status,due_date,booking_request_id')
  query = kind === 'booking' ? query.eq('booking_request_id',id).eq('status','pending') : query.eq('id',id)
  const {data: row,error} = await query.eq('student_id',userId).maybeSingle()
  if (error || !row) throw new ApiInputError('Payment not found',404)
  if (row.status !== 'pending' || new Date(row.due_date).getTime() < Date.now()) throw new ApiInputError('This payment request is no longer payable',409)
  const {data: booking} = await admin.from('booking_requests').select('status,tutor_id').eq('id',row.booking_request_id).eq('student_id',userId).maybeSingle()
  if (!booking || !['accepted','approved'].includes(booking.status)) throw new ApiInputError('Booking has not been approved',409)
  const amount = Number(row.amount)
  if (!Number.isSafeInteger(amount) || amount < 100) throw new ApiInputError('Payment amount needs review',409)
  return {externalId:`payment_request_${row.id}`,table:'payment_requests',id:row.id,userId,amount}
}
export async function providerRequest(endpoint: string, body?: unknown): Promise<Record<string, any>> {
  const live = process.env.FAPSHI_ENVIRONMENT !== 'sandbox'
  const apiuser = live ? process.env.FAPSHI_COLLECTION_API_USER_LIVE : process.env.FAPSHI_SANDBOX_API_USER
  const apikey = live ? process.env.FAPSHI_COLLECTION_API_KEY_LIVE : process.env.FAPSHI_SANDBOX_API_KEY
  if (!apiuser || !apikey) throw new ApiInputError('Payments are temporarily unavailable',503)
  const base = live ? 'https://live.fapshi.com' : 'https://sandbox.fapshi.com'
  const response = await fetch(base+endpoint, {method:body ? 'POST':'GET',headers:{'Content-Type':'application/json',apiuser,apikey},
    ...(body ? {body:JSON.stringify(body)}:{}), signal:AbortSignal.timeout(20000), redirect:'error'})
  if (!response.ok) throw new ApiInputError('Payment provider could not complete the request',502)
  const json = await response.json()
  if (!json || typeof json !== 'object' || Array.isArray(json)) throw new ApiInputError('Invalid provider response',502)
  return json
}
export async function startPayment(userId: string, body: Record<string, any>) {
  if (process.env.ENABLE_SECURE_FAPSHI_PAYMENTS !== 'true') throw new ApiInputError('Payments are temporarily unavailable',503)
  const phone = normalizePhone(body.phone)
  const quote = await resolvePaymentQuote(userId,String(body.externalId||''))
  // The displayed amount is a consent check only. The server quote sets the charge.
  if (body.amount !== quote.amount) throw new ApiInputError('The price changed. Refresh and review the payment before continuing.',409)
  const admin = adminClient()
  const {data: inserted,error} = await admin.from('secure_payment_attempts').insert({external_id:quote.externalId,user_id:userId,amount:quote.amount,resource_table:quote.table,resource_id:quote.id,state:'initiating'}).select('external_id').single()
  if (error || !inserted) {
    const {data: existing} = await admin.from('secure_payment_attempts').select('user_id,amount,trans_id,created_at,state').eq('external_id',quote.externalId).eq('user_id',userId).maybeSingle()
    if (existing?.trans_id && existing.amount === quote.amount) return {message:'Payment already initiated',transId:existing.trans_id,dateInitiated:existing.created_at}
    // A timeout could mean the provider accepted the charge. Never blindly retry.
    throw new ApiInputError('A payment is being checked. Please wait or contact support before retrying.',409)
  }
  const result = await providerRequest('/direct-pay',{phone,amount:quote.amount,externalId:quote.externalId,userId,message:'PrepSkul session payment'})
  if (typeof result.transId !== 'string' || !/^[A-Za-z0-9_-]{1,100}$/.test(result.transId)) throw new ApiInputError('Payment confirmation is pending. Do not retry the charge.',502)
  const {error: saveError} = await admin.from('secure_payment_attempts').update({trans_id:result.transId,state:'pending'}).eq('external_id',quote.externalId).eq('user_id',userId)
  if (saveError) throw new ApiInputError('Payment confirmation is pending. Do not retry the charge.',503)
  const {error: linkError} = await admin.from(quote.table).update({fapshi_trans_id:result.transId}).eq('id',quote.id)
  if (linkError) throw new ApiInputError('Payment confirmation is pending. Do not retry the charge.',503)
  return {message:'Payment initiated',transId:result.transId,dateInitiated:result.dateInitiated || new Date().toISOString()}
}
export async function ownedTransaction(userId: string, transId: string) {
  if (!/^[A-Za-z0-9_-]{1,100}$/.test(transId)) throw new ApiInputError('Invalid transaction')
  const {data,error} = await adminClient().from('secure_payment_attempts').select('*').eq('trans_id',transId).eq('user_id',userId).maybeSingle()
  if (error || !data) throw new ApiInputError('Payment not found',404)
  return data
}
export async function verifiedTransaction(transId: string) {
  if (!/^[A-Za-z0-9_-]{1,100}$/.test(transId)) throw new ApiInputError('Invalid transaction')
  const admin = adminClient()
  const {data: stored,error} = await admin.from('secure_payment_attempts').select('*').eq('trans_id',transId).maybeSingle()
  if (error) throw new ApiInputError('Payment store unavailable',503)
  let attempt = stored
  // Honour already-issued transactions only when the legacy record is linked to this exact provider ID.
  if (!attempt) {
    const {data: trial} = await admin.from('trial_sessions').select('id,trial_fee,learner_id,created_at').eq('fapshi_trans_id',transId).maybeSingle()
    const {data: invoice} = await admin.from('payment_requests').select('id,amount,student_id,created_at').eq('fapshi_trans_id',transId).maybeSingle()
    if (trial && invoice) throw new ApiInputError('Payment requires reconciliation',409)
    if (trial) attempt = {external_id:`trial_${trial.id}`,amount:Number(trial.trial_fee),user_id:trial.learner_id,created_at:trial.created_at}
    if (invoice) attempt = {external_id:`payment_request_${invoice.id}`,amount:Number(invoice.amount),user_id:invoice.student_id,created_at:invoice.created_at}
  }
  if (!attempt) throw new ApiInputError('Payment not found',404)
  const provider = await providerRequest('/payment-status/'+encodeURIComponent(transId))
  if (provider.transId !== transId || Number(provider.amount) !== Number(attempt.amount) || provider.externalId !== attempt.external_id) throw new ApiInputError('Payment verification failed',409)
  return {attempt,provider}
}
