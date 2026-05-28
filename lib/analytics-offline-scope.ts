/**
 * On-platform vs off-platform is determined per session:
 * - Off-platform session: linked to an offline_scheduling_period (admin offline match / import).
 * - On-platform session: no offline_scheduling_period_id (app booking), even if the tutor also does offline work.
 */

export type SessionOfflineProbe = {
  offline_scheduling_period_id?: string | null;
};

/** True when this session row is part of offline ops (not an app booking). */
export function sessionBelongsToOfflineOps(session: SessionOfflineProbe) {
  return Boolean(session.offline_scheduling_period_id);
}