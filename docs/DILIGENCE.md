# Diligence runbook (web)

Clone: `https://github.com/delbertkimbi/PrepSkul_Web` (`main` = marketplace, `primar` = kids product).

```bash
cp .env.template .env.local   # or copy from .env.example if that is what you have
npm install
npm run dev
```

Env names: [ENV_SETUP_INSTRUCTIONS.md](ENV_SETUP_INSTRUCTIONS.md). Do not commit `.env.local`.

- Sandbox Fapshi: `FAPSHI_SANDBOX_*`
- Live Fapshi: collection/disburse live users and keys
- Group classes: `GROUP_CLASSES_ENABLED`
- Primar on www: keep `PRIMAR_ENABLED` unset/false; `skulmate.` host still serves the kids experiment
