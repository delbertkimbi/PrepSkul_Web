# PrepSkul Web — structure & naming

Marketplace site (`main`). Kids Primar is on the `primar` branch.

## Layout

| Path | Role |
| --- | --- |
| `app/` | Next.js App Router pages and `app/api/*` |
| `components/` | UI |
| `lib/` | Shared server/client libraries |
| `docs/` | Setup / diligence (start with `DILIGENCE.md`, `ENV_SETUP_INSTRUCTIONS.md`) |

## Naming

| Name | Routes / folders | Notes |
| --- | --- | --- |
| Marketplace | `/[locale]/*`, tutor/learner portals, payments | Buyer demo surface |
| SkulMate | `/api/skulmate/*` | Revision games backend for the Flutter SkulMate feature |
| Primar | `/primar`, `/api/primar/*`, `components/primar`, `lib/primar` | Kids product; www redirects home unless `PRIMAR_ENABLED=true` or `skulmate.` host |

## Do not commit

- `.env*` / `secrets.txt`
- `.next*`, `node_modules`
- Firebase service account JSON
