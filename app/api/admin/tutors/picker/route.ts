import { NextRequest, NextResponse } from 'next/server';
import { getServerSession, isAdmin } from '@/lib/supabase-server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export const runtime = 'nodejs';

type TutorRow = Record<string, unknown> & {
  user_id?: string;
  status?: string | null;
  is_hidden?: boolean | null;
  subjects?: string[] | null;
  tutoring_areas?: string[] | null;
  bio?: string | null;
  hourly_rate?: number | string | null;
  location?: string | null;
  city?: string | null;
};

function pickSubjects(row: TutorRow): string[] {
  if (Array.isArray(row.tutoring_areas) && row.tutoring_areas.length) return row.tutoring_areas;
  if (Array.isArray(row.subjects) && row.subjects.length) return row.subjects;
  return [];
}

function pickLocation(row: TutorRow): string {
  const loc = row.location ?? row.city ?? row.teaching_location;
  return typeof loc === 'string' ? loc : '';
}

function isVisibleTutor(row: TutorRow): boolean {
  return String(row.status || '').toLowerCase() === 'approved' && row.is_hidden !== true;
}

async function fetchTutorRows(supabase: ReturnType<typeof getSupabaseAdmin>) {
  const attempts = [
    'user_id, status, is_hidden, tutoring_areas, subjects, hourly_rate, bio',
    'user_id, status, is_hidden, tutoring_areas, hourly_rate, bio',
    'user_id, status, is_hidden, tutoring_areas',
    'user_id, status, is_hidden',
  ];

  let lastError: { message?: string } | null = null;
  for (const fields of attempts) {
    const { data, error } = await supabase
      .from('tutor_profiles')
      .select(fields)
      .eq('status', 'approved')
      .limit(300);

    if (!error) return (data || []) as TutorRow[];
    lastError = error;
    if (!/does not exist/i.test(error.message || '')) break;
  }

  throw lastError || new Error('Failed to load tutor_profiles');
}

export async function GET(request: NextRequest) {
  try {
    const user = await getServerSession();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!(await isAdmin(user.id))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const q = (request.nextUrl.searchParams.get('q') || '').trim().toLowerCase();
    const supabase = getSupabaseAdmin();

    const tutorRows = (await fetchTutorRows(supabase)).filter(isVisibleTutor);

    const userIds = tutorRows.map((t) => t.user_id).filter(Boolean) as string[];
    if (!userIds.length) return NextResponse.json({ tutors: [] });

    const { data: profiles, error: profileErr } = await supabase
      .from('profiles')
      .select('id, full_name, email, phone_number, avatar_url, user_type')
      .in('id', userIds)
      .eq('user_type', 'tutor');

    if (profileErr) throw profileErr;

    const byId = new Map((profiles || []).map((p) => [p.id, p]));

    let tutors = tutorRows
      .map((tp) => {
        const uid = tp.user_id as string;
        const p = byId.get(uid);
        if (!p) return null;
        const subjects = pickSubjects(tp);
        const location = pickLocation(tp);
        return {
          userId: uid,
          fullName: p.full_name || 'Tutor',
          email: p.email || '',
          phone: p.phone_number || '',
          avatarUrl: p.avatar_url || null,
          subjects,
          location,
          hourlyRate: tp.hourly_rate ?? null,
          bio: typeof tp.bio === 'string' ? tp.bio : '',
        };
      })
      .filter(Boolean) as Array<{
      userId: string;
      fullName: string;
      email: string;
      phone: string;
      avatarUrl: string | null;
      subjects: string[];
      location: string;
      hourlyRate: unknown;
      bio: string;
    }>;

    if (q) {
      tutors = tutors.filter(
        (t) =>
          t.fullName.toLowerCase().includes(q) ||
          t.email.toLowerCase().includes(q) ||
          t.location.toLowerCase().includes(q) ||
          t.subjects.some((s) => s.toLowerCase().includes(q))
      );
    }

    tutors.sort((a, b) => a.fullName.localeCompare(b.fullName));

    return NextResponse.json({ tutors: tutors.slice(0, 80) });
  } catch (e: unknown) {
    console.error('tutor picker error', e);
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Failed to load tutors' }, { status: 500 });
  }
}
