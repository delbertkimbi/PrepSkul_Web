import { getWatDateParts } from './timezone-wat';
import type { UserRole } from './engagement-types';

export interface CalendarDayEvent {
  id: string;
  month: number;
  day: number;
  roles: UserRole[];
  priority: number;
  title: string;
  actionText: string;
  messageFor: (
    role: UserRole | null,
    theme: 'studies' | 'career' | 'exams',
    subject: string,
    childLabel: string
  ) => string;
  actionUrl: (role: UserRole | null) => string;
}

const CALENDAR_CM: CalendarDayEvent[] = [
  {
    id: 'youth_day',
    month: 2,
    day: 11,
    roles: ['student', 'learner', 'parent', 'tutor'],
    priority: 95,
    title: 'Youth Day – keep learning',
    actionText: 'Open PrepSkul',
    messageFor: (role, theme, subject) => {
      if (role === 'tutor') {
        return 'On Youth Day, encourage your students with one focused revision tip for the week ahead.';
      }
      if (role === 'parent') {
        return `Celebrate Youth Day by setting one learning goal with your child in ${subject} this week.`;
      }
      if (theme === 'exams') {
        return `Youth Day is a good moment to plan your next ${subject} revision block on PrepSkul.`;
      }
      return 'Youth Day reminds us to invest in education. Open PrepSkul and take one step forward today.';
    },
    actionUrl: (role) =>
      role === 'tutor' ? '/tutor-nav' : role === 'parent' ? '/parent-nav' : '/student-nav',
  },
  {
    id: 'national_day',
    month: 5,
    day: 20,
    roles: ['student', 'learner', 'parent', 'tutor'],
    priority: 96,
    title: 'National Day – proud to learn',
    actionText: 'Open PrepSkul',
    messageFor: (role, _theme, subject) => {
      if (role === 'tutor') {
        return 'On Cameroon National Day, thank your students and confirm your sessions for the week.';
      }
      if (role === 'parent') {
        return 'National Day is a chance to celebrate progress. Review your child’s sessions on PrepSkul.';
      }
      return `Celebrate National Day by advancing your studies in ${subject} with one focused session or quiz.`;
    },
    actionUrl: (role) =>
      role === 'tutor' ? '/tutor-nav' : role === 'parent' ? '/parent-nav' : '/student-nav',
  },
  {
    id: 'back_to_school_sep',
    month: 9,
    day: 5,
    roles: ['student', 'learner', 'parent'],
    priority: 90,
    title: 'Back to school',
    actionText: 'Get started',
    messageFor: (role, theme, subject, child) => {
      if (role === 'parent') {
        return `School is back. Book a tutor for ${child} in ${subject} and start the term with support.`;
      }
      if (theme === 'exams') {
        return `New school year: map your ${subject} goals and book help before exams pile up.`;
      }
      return `Welcome back to school. Set your ${subject} goals and find a tutor on PrepSkul.`;
    },
    actionUrl: () => '/discovery',
  },
];

export function getCalendarEventToday(date: Date = new Date()): CalendarDayEvent | null {
  const { month, day } = getWatDateParts(date);
  const matches = CALENDAR_CM.filter((e) => e.month === month && e.day === day);
  if (!matches.length) return null;
  return matches.sort((a, b) => b.priority - a.priority)[0];
}

export function getCalendarEventById(id: string): CalendarDayEvent | undefined {
  return CALENDAR_CM.find((e) => e.id === id);
}
