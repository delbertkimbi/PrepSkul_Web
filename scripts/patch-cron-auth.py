import re
from pathlib import Path

root = Path(__file__).resolve().parents[1] / "app" / "api" / "cron"
pattern = re.compile(
    r"    const authHeader = request\.headers\.get\('authorization'\);\s*"
    r"const cronSecret = process\.env\.CRON_SECRET;\s*"
    r"if \(cronSecret\) \{\s*"
    r"const isVercelCron =[\s\S]*?"
    r"\}\s*"
    r"\}\s*",
    re.MULTILINE,
)
replacement = (
    "    const authError = verifyExternalCron(request);\n"
    "    if (authError) return authError;\n\n"
)

for path in root.rglob("route.ts"):
    text = path.read_text(encoding="utf-8")
    if "verifyExternalCron" in text:
        continue
    if "CRON_SECRET" not in text:
        continue
    new_text, n = pattern.subn(replacement, text)
    if n == 0:
        print("no match", path)
        continue
    if "from '@/lib/cron-auth'" not in new_text:
        new_text = new_text.replace(
            "import { NextRequest, NextResponse } from 'next/server';",
            "import { NextRequest, NextResponse } from 'next/server';\n"
            "import { verifyExternalCron } from '@/lib/cron-auth';",
            1,
        )
    path.write_text(new_text, encoding="utf-8")
    print("patched", path)
