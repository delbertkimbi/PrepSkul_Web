import pathlib
import sys

BAD_OPEN = "<" + "motionless"
BAD_CLOSE = "</" + "motionless>"

for path in sys.argv[1:]:
    p = pathlib.Path(path)
    t = p.read_text(encoding="utf-8")
    t = t.replace(BAD_OPEN, "<div").replace(BAD_CLOSE, "</" + "div>")
    p.write_text(t, encoding="utf-8")
