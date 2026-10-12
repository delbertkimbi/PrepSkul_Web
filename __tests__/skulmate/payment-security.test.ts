import { normalizePhone, resolvePaymentQuote, startPayment, ownedTransaction, verifiedTransaction } from '@/lib/payments/fapshi'
import { getServiceSupabaseAdmin } from '@/lib/skulmate/billing'
jest.mock('@/lib/skulmate/billing', () => ({getServiceSupabaseAdmin:jest.fn()}))
const id = '00000000-0000-0000-0000-000000000001'
function database(rows: Record<string, unknown>) {
 const queries: Record<string,any> = {}
 const from = jest.fn((name:string) => {
   const query:any = {}
   for (const method of ['select','eq','insert','update']) query[method]=jest.fn(()=>query)
   query.maybeSingle = query.single = jest.fn(async()=>({data:rows[name]??null,error:null}))
   queries[name]=query
   return query
 })
 ;(getServiceSupabaseAdmin as jest.Mock).mockReturnValue({from})
 return queries
}
beforeEach(()=>{jest.clearAllMocks();process.env.ENABLE_SECURE_FAPSHI_PAYMENTS='true'})
it('normalizes supported numbers and rejects injection',()=>{
 expect(normalizePhone('+237 670-000-000')).toBe('670000000')
 expect(()=>normalizePhone('670000000&amount=1')).toThrow()
})
it('rejects another account’s trial', async()=>{
 database({trial_sessions:{id,learner_id:'other',status:'accepted'}})
 await expect(resolvePaymentQuote('owner',`trial_${id}`)).rejects.toMatchObject({status:404})
})
it('derives trial prices from pricing records',async()=>{
 database({trial_sessions:{id,learner_id:'owner',duration_minutes:30,status:'accepted',payment_status:'unpaid'},trial_session_pricing:{price_xaf:2000,discount_percent:10}})
 await expect(resolvePaymentQuote('owner',`trial_${id}`)).resolves.toMatchObject({amount:1800,userId:'owner'})
})
it('refuses a changed amount before initiating a provider charge',async()=>{
 database({trial_sessions:{id,learner_id:'owner',status:'accepted'},trial_session_pricing:{price_xaf:2000}})
 await expect(startPayment('owner',{phone:'670000000',externalId:`trial_${id}`,amount:100})).rejects.toMatchObject({status:409})
})
it('scopes transaction reads to the authenticated user',async()=>{
 const queries=database({})
 await expect(ownedTransaction('owner','trans-1')).rejects.toMatchObject({status:404})
 expect(queries.secure_payment_attempts.eq).toHaveBeenCalledWith('user_id','owner')
})
it('rejects unmatched transactions before contacting the provider',async()=>{
 database({})
 const fetchMock=jest.spyOn(global,'fetch')
 await expect(verifiedTransaction('forged')).rejects.toMatchObject({status:404})
 expect(fetchMock).not.toHaveBeenCalled()
 fetchMock.mockRestore()
})
it('fails closed while payments are disabled',async()=>{
 process.env.ENABLE_SECURE_FAPSHI_PAYMENTS='false'
 await expect(startPayment('owner',{})).rejects.toMatchObject({status:503})
 expect(getServiceSupabaseAdmin).not.toHaveBeenCalled()
})
