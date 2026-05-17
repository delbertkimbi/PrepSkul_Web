import { redirect } from 'next/navigation';

import Link from 'next/link';

import { getServerSession, isAdmin } from '@/lib/supabase-server';

import { getSupabaseAdmin } from '@/lib/supabase-admin';

import { getOfflineUserContext } from '@/lib/services/offline-user-hub-service';

import AdminNav from '../../../components/AdminNav';

import OfflineUserHubClient from '@/components/admin/offline-ops/OfflineUserHubClient';



export default async function OfflineUserHubPage({

  params,

}: {

  params: Promise<{ primaryUserId: string }>;

}) {

  const user = await getServerSession();

  if (!user) redirect('/admin/login');

  if (!(await isAdmin(user.id))) redirect('/admin/login');



  const { primaryUserId } = await params;

  const supabase = getSupabaseAdmin();



  let ctx;

  try {

    ctx = await getOfflineUserContext(supabase, primaryUserId);

  } catch {

    redirect('/admin/offline-ops/users');

  }



  const { profile, run, learners, offlineOperationId } = ctx;



  return (

    <div className="min-h-screen bg-slate-50">

      <AdminNav />

      <main className="w-full px-4 sm:px-6 lg:px-10 py-6 max-w-[1600px] mx-auto space-y-6">

        <div className="border-b border-[#1B2C4F]/15 pb-5">

          <Link href="/admin/offline-ops/users" className="text-sm text-[#4A6FBF] hover:underline">

            ← Offline users

          </Link>

          <h1 className="text-2xl font-bold text-[#1B2C4F] mt-2">{profile.full_name}</h1>

          <p className="text-sm text-slate-600">{profile.email}</p>

        </div>



        <OfflineUserHubClient

          primaryUserId={primaryUserId}

          fullName={profile.full_name || ''}

          email={profile.email || ''}

          userType={profile.user_type}

          offlineOperationId={offlineOperationId}

          learners={learners}

          defaultLearnerUserId={run?.learner_user_id || learners[0]?.id || null}

          defaultTutorUserId={run?.tutor_user_id || null}

        />

      </main>

    </div>

  );

}


