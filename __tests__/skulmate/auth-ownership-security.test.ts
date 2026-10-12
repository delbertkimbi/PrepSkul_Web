import { NextRequest } from 'next/server'
import { resolveSkulMateUserId, assertOwnedChild } from '@/lib/skulmate/auth'
import { createClient } from '@supabase/supabase-js'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { getServiceSupabaseAdmin } from '@/lib/skulmate/billing'
jest.mock('@supabase/supabase-js',()=>({createClient:jest.fn()}))
jest.mock('@/lib/supabase-server',()=>({createServerSupabaseClient:jest.fn()}))
jest.mock('@/lib/skulmate/billing',()=>({getServiceSupabaseAdmin:jest.fn()}))
beforeEach(()=>{jest.clearAllMocks();process.env.NEXT_PUBLIC_SUPABASE_URL='https://example.supabase.co';process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY='public-test-key'})
it('never falls back from a rejected bearer token to a cookie identity',async()=>{
 ;(createClient as jest.Mock).mockReturnValue({auth:{getUser:async()=>({data:{user:null}})}})
 ;(createServerSupabaseClient as jest.Mock).mockResolvedValue({auth:{getUser:async()=>({data:{user:{id:'cookie-user'}}})}})
 const req=new NextRequest('https://www.prepskul.com/api/test',{headers:{authorization:'Bearer invalid'}})
 expect(await resolveSkulMateUserId(req)).toBeUndefined()
 expect(createServerSupabaseClient).not.toHaveBeenCalled()
})
it('rejects a claimed identity that differs from the verified identity',async()=>{
 ;(createClient as jest.Mock).mockReturnValue({auth:{getUser:async()=>({data:{user:{id:'actual'}}})}})
 const req=new NextRequest('https://www.prepskul.com/api/test',{headers:{authorization:'Bearer valid'}})
 expect(await resolveSkulMateUserId(req,'victim')).toBeUndefined()
})
it('requires the child to belong to the authenticated parent',async()=>{
 const query:any={select:jest.fn(()=>query),eq:jest.fn(()=>query),maybeSingle:async()=>({data:null,error:null})}
 ;(getServiceSupabaseAdmin as jest.Mock).mockReturnValue({from:()=>query})
 await expect(assertOwnedChild('parent','00000000-0000-0000-0000-000000000001')).rejects.toThrow('not found')
 expect(query.eq).toHaveBeenCalledWith('parent_id','parent')
})
