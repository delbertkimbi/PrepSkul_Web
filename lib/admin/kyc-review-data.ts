import type { SupabaseClient } from '@supabase/supabase-js';

export type KycVerificationRow = {
  id: string;
  account_id: string;
  document_type: string;
  whose_id: string;
  relationship: string | null;
  front_url: string;
  back_url: string | null;
  holding_id_url: string | null;
  location_photo_url: string | null;
  booking_request_id: string | null;
  status: string;
  rejection_reason: string | null;
  created_at: string;
  verified_at: string | null;
};

export type KycReviewListItem = KycVerificationRow & {
  account: {
    name: string;
    email: string;
    avatarUrl: string | null;
    userType: string | null;
    phone: string | null;
    city: string | null;
  };
  bookingSummary: {
    id: string | null;
    location: string | null;
    tutorName: string | null;
    scheduleLabel: string | null;
    subjectsLabel: string | null;
  };
};

export type KycReviewDetail = KycReviewListItem & {
  learningContext: {
    learningPath: string | null;
    subjects: string[];
    goals: string[];
    challenges: string[];
    preferredLocation: string | null;
  };
  booking: {
    id: string;
    status: string;
    frequency: number;
    days: string[];
    times: Record<string, string>;
    location: string;
    address: string | null;
    locationDescription: string | null;
    paymentPlan: string;
    monthlyTotal: number | null;
    learnerLabels: string[] | null;
    learnerSubjects: Record<string, string[]> | null;
    estimatedTransportationCost: number | null;
    createdAt: string;
    studentName: string | null;
    studentType: string | null;
  } | null;
  tutor: {
    profileId: string | null;
    userId: string | null;
    name: string;
    email: string | null;
    avatarUrl: string | null;
    subjects: string[];
    rating: number | null;
  } | null;
};

export function documentTypeLabel(type: string): string {
  const map: Record<string, string> = {
    national_id: 'National ID',
    passport: 'Passport',
    voter_card: 'Voter card',
    drivers_licence: "Driver's licence",
    residence_permit: 'Residence permit',
    school_id: 'School ID',
    other: 'Other',
  };
  return map[type] ?? type;
}

export function whoseIdLabel(whose: string): string {
  if (whose === 'self') return 'Account owner';
  if (whose === 'parent_guardian') return 'Parent / guardian';
  if (whose === 'other_adult') return 'Other adult';
  return whose;
}

export function locationBadge(location: string | null | undefined): string {
  if (!location) return '—';
  const l = location.toLowerCase();
  if (l === 'onsite') return 'Onsite';
  if (l === 'hybrid') return 'Hybrid';
  if (l === 'online') return 'Online';
  return location;
}

function formatSchedule(days: unknown, times: unknown): string {
  const dayList = Array.isArray(days) ? (days as string[]) : [];
  const timeMap =
    times && typeof times === 'object' && !Array.isArray(times)
      ? (times as Record<string, string>)
      : {};
  if (dayList.length === 0) return '—';
  return dayList
    .map((d) => {
      const t = timeMap[d];
      return t ? `${d} · ${t}` : d;
    })
    .join(', ');
}

function parseLearnerSubjects(raw: unknown): Record<string, string[]> | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const out: Record<string, string[]> = {};
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    if (Array.isArray(v)) out[k] = v.map(String);
  }
  return Object.keys(out).length ? out : null;
}

function subjectsFromBooking(booking: Record<string, unknown> | null): string {
  if (!booking) return '—';
  const learnerSubjects = parseLearnerSubjects(booking.learner_subjects);
  if (learnerSubjects) {
    return Object.entries(learnerSubjects)
      .map(([name, subs]) => `${name}: ${subs.join(', ')}`)
      .join(' · ');
  }
  return '—';
}

async function loadAccountContext(
  supabase: SupabaseClient,
  accountId: string
): Promise<{
  name: string;
  email: string;
  avatarUrl: string | null;
  userType: string | null;
  phone: string | null;
  city: string | null;
  learningPath: string | null;
  subjects: string[];
  goals: string[];
  challenges: string[];
  preferredLocation: string | null;
}> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, full_name, email, avatar_url, user_type, phone_number')
    .eq('id', accountId)
    .maybeSingle();

  let city: string | null = null;
  let learningPath: string | null = null;
  let subjects: string[] = [];
  let goals: string[] = [];
  let challenges: string[] = [];
  let preferredLocation: string | null = null;

  const userType = (profile?.user_type as string) ?? null;

  if (userType === 'parent') {
    const { data: parentProfile } = await supabase
      .from('parent_profiles')
      .select('preferred_location, city')
      .eq('user_id', accountId)
      .maybeSingle();
    preferredLocation = (parentProfile?.preferred_location as string) ?? null;
    city = (parentProfile?.city as string) ?? null;

    const { data: children } = await supabase
      .from('parent_learners')
      .select(
        'learning_path, subjects, skills, exam_subjects, learning_goals, challenges, preferred_location'
      )
      .eq('parent_id', accountId);

    for (const c of children || []) {
      const row = c as Record<string, unknown>;
      if (!learningPath && row.learning_path) learningPath = String(row.learning_path);
      subjects.push(...((row.subjects as string[]) || []));
      subjects.push(...((row.skills as string[]) || []));
      subjects.push(...((row.exam_subjects as string[]) || []));
      goals.push(...((row.learning_goals as string[]) || []));
      challenges.push(...((row.challenges as string[]) || []));
      if (!preferredLocation && row.preferred_location) {
        preferredLocation = String(row.preferred_location);
      }
    }
  } else {
    const { data: learner } = await supabase
      .from('learner_profiles')
      .select(
        'subjects, learning_goals, challenges, preferred_location, learning_path, city'
      )
      .eq('user_id', accountId)
      .maybeSingle();

    if (learner) {
      city = (learner.city as string) ?? null;
      learningPath = (learner.learning_path as string) ?? null;
      subjects = (learner.subjects as string[]) || [];
      goals = (learner.learning_goals as string[]) || [];
      challenges = (learner.challenges as string[]) || [];
      preferredLocation = (learner.preferred_location as string) ?? null;
    }
  }

  return {
    name: (profile?.full_name as string) || (profile?.email as string) || '—',
    email: (profile?.email as string) || '—',
    avatarUrl: (profile?.avatar_url as string) ?? null,
    userType,
    phone: (profile?.phone_number as string) ?? null,
    city,
    learningPath,
    subjects: [...new Set(subjects.filter(Boolean))],
    goals: [...new Set(goals.filter(Boolean))],
    challenges: [...new Set(challenges.filter(Boolean))],
    preferredLocation,
  };
}

async function loadBooking(
  supabase: SupabaseClient,
  bookingRequestId: string | null,
  accountId: string
): Promise<Record<string, unknown> | null> {
  if (bookingRequestId) {
    const { data } = await supabase
      .from('booking_requests')
      .select('*')
      .eq('id', bookingRequestId)
      .maybeSingle();
    if (data) return data as Record<string, unknown>;
  }

  const { data: latest } = await supabase
    .from('booking_requests')
    .select('*')
    .eq('student_id', accountId)
    .in('location', ['onsite', 'hybrid'])
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  return (latest as Record<string, unknown>) ?? null;
}

async function loadTutor(
  supabase: SupabaseClient,
  tutorUserId: string | null
) {
  if (!tutorUserId) return null;

  const { data: tp } = await supabase
    .from('tutor_profiles')
    .select('id, user_id, subjects, admin_approved_rating')
    .eq('user_id', tutorUserId)
    .maybeSingle();

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, email, avatar_url')
    .eq('id', tutorUserId)
    .maybeSingle();

  const subjectsRaw = (tp?.subjects as string) || '';
  const subjects =
    typeof subjectsRaw === 'string' && subjectsRaw.includes(',')
      ? subjectsRaw.split(',').map((s) => s.trim()).filter(Boolean)
      : Array.isArray(tp?.subjects)
        ? (tp?.subjects as string[])
        : subjectsRaw
          ? [subjectsRaw]
          : [];

  return {
    profileId: (tp?.id as string) ?? null,
    userId: tutorUserId,
    name: (profile?.full_name as string) || 'Tutor',
    email: (profile?.email as string) ?? null,
    avatarUrl: (profile?.avatar_url as string) ?? null,
    subjects,
    rating: (tp?.admin_approved_rating as number) ?? null,
  };
}

export async function enrichVerificationList(
  supabase: SupabaseClient,
  rows: KycVerificationRow[]
): Promise<KycReviewListItem[]> {
  const out: KycReviewListItem[] = [];

  for (const v of rows) {
    const account = await loadAccountContext(supabase, v.account_id);
    const booking = await loadBooking(supabase, v.booking_request_id, v.account_id);
    const tutorUserId = booking ? (booking.tutor_id as string) : null;
    const tutorProfile = tutorUserId
      ? await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', tutorUserId)
          .maybeSingle()
      : null;

    out.push({
      ...v,
      account: {
        name: account.name,
        email: account.email,
        avatarUrl: account.avatarUrl,
        userType: account.userType,
        phone: account.phone,
        city: account.city,
      },
      bookingSummary: {
        id: booking ? (booking.id as string) : null,
        location: booking ? (booking.location as string) : null,
        tutorName: (tutorProfile?.data?.full_name as string) ?? (booking?.tutor_name as string) ?? null,
        scheduleLabel: booking
          ? formatSchedule(booking.days, booking.times)
          : null,
        subjectsLabel: subjectsFromBooking(booking),
      },
    });
  }

  return out;
}

export async function loadKycReviewDetail(
  supabase: SupabaseClient,
  verificationId: string
): Promise<KycReviewDetail | null> {
  const { data: v } = await supabase
    .from('identity_verifications')
    .select(
      `
        id,
        account_id,
        document_type,
        whose_id,
        relationship,
        front_url,
        back_url,
        holding_id_url,
        location_photo_url,
        booking_request_id,
        status,
        rejection_reason,
        created_at,
        verified_at
      `
    )
    .eq('id', verificationId)
    .maybeSingle();

  if (!v) return null;

  const row = v as KycVerificationRow;
  const account = await loadAccountContext(supabase, row.account_id);
  const bookingRaw = await loadBooking(
    supabase,
    row.booking_request_id,
    row.account_id
  );
  const tutor = await loadTutor(
    supabase,
    bookingRaw ? (bookingRaw.tutor_id as string) : null
  );

  const booking = bookingRaw
    ? {
        id: bookingRaw.id as string,
        status: String(bookingRaw.status ?? ''),
        frequency: Number(bookingRaw.frequency ?? 0),
        days: (bookingRaw.days as string[]) || [],
        times: (bookingRaw.times as Record<string, string>) || {},
        location: String(bookingRaw.location ?? ''),
        address: (bookingRaw.address as string) ?? null,
        locationDescription: (bookingRaw.location_description as string) ?? null,
        paymentPlan: String(bookingRaw.payment_plan ?? ''),
        monthlyTotal: bookingRaw.monthly_total != null ? Number(bookingRaw.monthly_total) : null,
        learnerLabels: (bookingRaw.learner_labels as string[]) ?? null,
        learnerSubjects: parseLearnerSubjects(bookingRaw.learner_subjects),
        estimatedTransportationCost:
          bookingRaw.estimated_transportation_cost != null
            ? Number(bookingRaw.estimated_transportation_cost)
            : null,
        createdAt: String(bookingRaw.created_at ?? ''),
        studentName: (bookingRaw.student_name as string) ?? null,
        studentType: (bookingRaw.student_type as string) ?? null,
      }
    : null;

  return {
    ...row,
    account: {
      name: account.name,
      email: account.email,
      avatarUrl: account.avatarUrl,
      userType: account.userType,
      phone: account.phone,
      city: account.city,
    },
    bookingSummary: {
      id: booking?.id ?? null,
      location: booking?.location ?? null,
      tutorName: tutor?.name ?? null,
      scheduleLabel: booking ? formatSchedule(booking.days, booking.times) : null,
      subjectsLabel: subjectsFromBooking(bookingRaw),
    },
    learningContext: {
      learningPath: account.learningPath,
      subjects: account.subjects,
      goals: account.goals,
      challenges: account.challenges,
      preferredLocation: account.preferredLocation,
    },
    booking,
    tutor,
  };
}
