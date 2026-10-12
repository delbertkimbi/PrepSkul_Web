import { NextRequest } from 'next/server'
import { GET } from '@/app/api/cron/session-approval-reminders/route'
jest.mock('@/lib/supabase-admin',()=>({getSupabaseAdmin:jest.fn(()=>{throw new Error('Database must not be reached')})}))
jest.mock('@/lib/ops-email',()=>({sendOpsAlertEmail:jest.fn()}))
const previous=process.env.CRON_SECRET
afterAll(()=>{if(previous===undefined)delete process.env.CRON_SECRET;else process.env.CRON_SECRET=previous})
it('rejects forged Vercel headers',async()=>{
 process.env.CRON_SECRET='test-only-cron-secret'
 const res=await GET(new NextRequest('https://www.prepskul.com/api/cron/session-approval-reminders',{headers:{'user-agent':'vercel-cron/1.0','x-vercel-cron':'1'}}))
 expect(res.status).toBe(401)
})
it('fails closed when the secret is missing',async()=>{
 delete process.env.CRON_SECRET
 expect((await GET(new NextRequest('https://www.prepskul.com/api/cron/session-approval-reminders'))).status).toBe(401)
})
