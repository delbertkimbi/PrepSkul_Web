/**
 * Group classes rollout flag (v1 launch: default OFF).
 *
 * Set GROUP_CLASSES_ENABLED=true in Vercel/env to enable online group classes post-launch.
 * When unset or false, all /api/group-classes/* routes return 503.
 */
export function groupClassesEnabled(): boolean {
  const v = (process.env.GROUP_CLASSES_ENABLED || 'false').toLowerCase()
  return v === 'true' || v === '1' || v === 'yes'
}
