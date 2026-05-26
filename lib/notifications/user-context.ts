import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { normalizeRole, type UserRole } from './engagement-types';

export interface UserEngagementContext {
  userId: string;
  role: UserRole | null;
  fullName: string | null;
  lastSeen: string | null;
  subjects: string[];
  learningPath: string | null;
  goals: string | null;
  childName: string | null;
  tutorStatus: string | null;
  kycStatus: string | null;
  hasSkulMateStats: boolean;
  recentNoteUpload: boolean;
  recentGamePlay: boolean;
  browsedTutorsRecently: boolean;
  openBookingRequest: boolean;
  pendingPaymentRequest: boolean;
}

export async function loadUserEngagementContext(
  userId: string,
  profile?: { user_type?: string | null; full_name?: string | null; last_seen?: string | null }
): Promise<UserEngagementContext> {
  const supabase = getSupabaseAdmin();
  const role = normalizeRole(profile?.user_type ?? null);

  let subjects: string[] = [];
  let learningPath: string | null = null;
  let goals: string | null = null;
  let childName: string | null = null;
  let tutorStatus: string | null = null;
  let kycStatus: string | null = null;

  if (role === 'student' || role === 'learner') {
    const { data } = await supabase
      .from('learner_profiles')
      .select('subjects, learning_path, goals')
      .eq('user_id', userId)
      .maybeSingle();
    if (data) {
      subjects = Array.isArray(data.subjects) ? data.subjects : [];
      learningPath = data.learning_path ?? null;
      goals = data.goals ?? null;
    }
  } else if (role === 'parent') {
    const { data } = await supabase
      .from('parent_profiles')
      .select('subjects, learning_path, goals')
      .eq('user_id', userId)
      .maybeSingle();
    if (data) {
      subjects = Array.isArray(data.subjects) ? data.subjects : [];
      learningPath = data.learning_path ?? null;
      goals = data.goals ?? null;
    }
    const { data: child } = await supabase
      .from('parent_learners')
      .select('full_name')
      .eq('parent_id', userId)
      .limit(1)
      .maybeSingle();
    childName = (child as { full_name?: string } | null)?.full_name ?? null;
  } else if (role === 'tutor') {
    const { data } = await supabase
      .from('tutor_profiles')
      .select('subjects, status')
      .eq('user_id', userId)
      .maybeSingle();
    if (data) {
      subjects = Array.isArray(data.subjects) ? data.subjects : [];
      tutorStatus = data.status ?? null;
    }
  }

  const { data: kyc } = await supabase
    .from('identity_verifications')
    .select('status')
    .eq('account_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  kycStatus = kyc?.status ?? null;

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const { data: gameStats } = await supabase
    .from('user_game_stats')
    .select('user_id, last_played_at')
    .eq('user_id', userId)
    .maybeSingle();

  const { data: noteGames } = await supabase
    .from('skulmate_games')
    .select('id')
    .eq('user_id', userId)
    .in('source_type', ['pdf', 'image', 'text'])
    .gte('created_at', sevenDaysAgo)
    .limit(1);

  const recentGamePlay =
    !!gameStats?.last_played_at &&
    new Date(gameStats.last_played_at as string) >= new Date(sevenDaysAgo);

  const { data: views } = await supabase
    .from('tutor_profile_views')
    .select('id')
    .eq('viewer_id', userId)
      .gte('created_at', sevenDaysAgo)
    .limit(1);

  const { data: booking } = await supabase
    .from('booking_requests')
    .select('id')
    .or(`student_id.eq.${userId},parent_id.eq.${userId}`)
    .in('status', ['pending', 'open', 'submitted'])
    .limit(1);

  const { data: paymentReq } = await supabase
    .from('payment_requests')
    .select('id')
    .eq('student_id', userId)
    .eq('status', 'pending')
    .limit(1);

  return {
    userId,
    role,
    fullName: profile?.full_name ?? null,
    lastSeen: profile?.last_seen ?? null,
    subjects,
    learningPath,
    goals,
    childName,
    tutorStatus,
    kycStatus,
    hasSkulMateStats: !!gameStats,
    recentNoteUpload: (noteGames?.length ?? 0) > 0,
    recentGamePlay,
    browsedTutorsRecently: (views?.length ?? 0) > 0,
    openBookingRequest: (booking?.length ?? 0) > 0,
    pendingPaymentRequest: (paymentReq?.length ?? 0) > 0,
  };
}
