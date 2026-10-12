import { rateLimited } from '@/lib/skulmate/rate-limit'
import { NextRequest } from 'next/server'
import { guardApi, ApiInputError } from '@/lib/skulmate/api-input'
import { resolveSkulMateUserId } from '@/lib/skulmate/auth'
import { jsonWithCors, skulmatePreflight } from '@/lib/skulmate/http'
import { startPayment, ownedTransaction, verifiedTransaction, providerRequest } from '@/lib/payments/fapshi'
export const OPTIONS = skulmatePreflight
export const POST = guardApi(async (request: NextRequest) => {
  const userId = await resolveSkulMateUserId(request)
  if (!userId) throw new ApiInputError('Sign in to manage payments',401)
  const limited = await rateLimited(request, `payment:${userId}`, 10, 60000)
  if (limited) return limited
  const body = await request.json()
  if (body.action === 'expire') {
    if (typeof body.transId !== 'string') throw new ApiInputError('Invalid transaction')
    await ownedTransaction(userId,body.transId)
    await providerRequest('/expire-pay',{transId:body.transId})
    return jsonWithCors(request,{message:'Payment expiry requested'})
  }
  if (body.action && body.action !== 'initiate') throw new ApiInputError('Unknown payment action')
  return jsonWithCors(request,await startPayment(userId,body))
})
export const GET = guardApi(async (request: NextRequest) => {
  const userId = await resolveSkulMateUserId(request)
  if (!userId) throw new ApiInputError('Sign in to view payments',401)
  const limited = await rateLimited(request, `payment-status:${userId}`, 120, 60000)
  if (limited) return limited
  const transId = new URL(request.url).searchParams.get('transId') || ''
  await ownedTransaction(userId,transId)
  const {provider,attempt} = await verifiedTransaction(transId)
  return jsonWithCors(request,{transId,status:provider.status,amount:Number(attempt.amount),dateInitiated:provider.dateInitiated||attempt.created_at,dateCompleted:provider.dateCompleted||null})
})
