from pathlib import Path

p = Path(__file__).resolve().parents[1] / "components/admin/offline-ops/OfflineSchedulePeriodFields.tsx"
t = p.read_text(encoding="utf-8")

start_marker = '        <div>\n          <Label>Start date *</Label>'
end_marker = "\n      <DeliveryModeFields"

i = t.find(start_marker)
j = t.find(end_marker, i)
if i < 0 or j < 0:
    raise SystemExit("markers not found")

insert = """        {!historicalDefaults && (
          <div>
            <Label>Start date *</Label>
            <Input
              type="date"
              value={state.startDate}
              onChange={(e) => onChange({ startDate: e.target.value })}
              className="mt-1 border-[#1B2C4F]/20"
            />
          </div>
        )}
      </motionless>

      {historicalDefaults && (
        <div>
          <p className="text-xs text-slate-600 mb-2">
            Pick the calendar month when this period started. Sessions are generated from your weekly schedule and stored
            as past (evaluated) records for analytics and tutor session counts.
          </p>
          <StartMonthPicker
            value={state.startMonthYear}
            onChange={(startMonthYear) => onChange({ startMonthYear })}
          />
        </div>
      )}
"""
insert = insert.replace("</motionless>", "</div>").replace("<motionless>", "<motionless>")

# remove erroneous motionless open in insert
insert = insert.replace("      </motionless>\n\n      {historical", "      </div>\n\n      {historical")

# find grid close before DeliveryModeFields - replace block from start_marker through closing </div> of grid
block_end = t.rfind("      </div>", i, j)
new_t = t[:i] + insert + t[j:]
p.write_text(new_t, encoding="utf-8")
print("patched")
