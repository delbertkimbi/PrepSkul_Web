import { z } from 'zod';

export const offlineScheduleSchema = z.object({
  weeks: z.number().min(1).max(52),
  sessionsPerWeek: z.number().min(1).max(7),
  dayTimeSlots: z.array(z.object({ day: z.string(), time: z.string() })).min(1),
  durationMinutes: z.number().min(30).max(240),
  startDate: z.string().min(8),
  deliveryMode: z.enum(['online', 'onsite', 'hybrid']),
  subjects: z.array(z.string().min(1)).min(1),
  meetLink: z.string().nullable().optional(),
  onsiteLocation: z.string().nullable().optional(),
  onsitePhotoUrl: z.string().nullable().optional(),
  payPerMonthXaf: z.number().nullable().optional(),
  payMonthsCount: z.number().nullable().optional(),
  operationState: z.enum(['active', 'paused', 'stopped']).optional(),
  startMonthLabel: z.string().nullable().optional(),
  /** Per-month historical import: tutor for this billing month only */
  tutorUserId: z.string().uuid().optional(),
});

export const schedulePeriodBodySchema = z
  .object({
    learnerUserId: z.string().uuid().optional(),
    tutor: z.object({
      tutorUserId: z.string().uuid().optional(),
      tutorEmail: z.string().email().optional(),
    }),
    schedule: offlineScheduleSchema.optional(),
    monthlySchedules: z.array(offlineScheduleSchema).min(1).optional(),
    sendWelcomeEmail: z.boolean().optional(),
    isHistoricalImport: z.boolean().optional(),
  })
  .refine((data) => Boolean(data.schedule || data.monthlySchedules?.length), {
    message: 'Either schedule or monthlySchedules is required',
  });

export const addChildBodySchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email().optional(),
  phone: z.string().optional(),
});
