#!/usr/bin/env python3
"""Replace invalid motionless JSX tags with div."""
import sys
from pathlib import Path

BAD_OPEN = "<" + "motionless"
BAD_CLOSE = "</" + "motionless>"
GOOD_OPEN = "<div"
GOOD_CLOSE = "</motionless>".replace("motionless", "div")


def fix(path: Path) -> None:
    text = path.read_text(encoding="utf-8")
    updated = text.replace(BAD_OPEN, GOOD_OPEN).replace(BAD_CLOSE, GOOD_CLOSE)
    if updated != text:
        path.write_text(updated, encoding="utf-8")
        print(f"fixed {path}")


if __name__ == "__main__":
    root = Path(__file__).resolve().parents[1]
    targets = sys.argv[1:] or [
        "components/admin/offline-ops/StartMonthPicker.tsx",
    ]
    for rel in targets:
        fix(root / rel)
