type ActivityRow = {
  label: string;
  value: string | number;
  context?: string;
};

export default function ActivityTable({
  title,
  rows,
  emptyLabel = 'No data available yet',
}: {
  title: string;
  rows: ActivityRow[];
  emptyLabel?: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
      <h3 className="text-base font-semibold text-gray-900 mb-3">{title}</h3>
      {rows.length === 0 ? (
        <p className="text-sm text-gray-500">{emptyLabel}</p>
      ) : (
        <div className="divide-y divide-gray-100">
          {rows.map((row) => (
            <div key={row.label} className="py-2.5 flex items-start justify-between gap-3">
              <div>
                <p className="text-sm text-gray-700">{row.label}</p>
                {row.context && <p className="text-xs text-gray-500 mt-0.5">{row.context}</p>}
              </div>
              <p className="text-sm font-semibold text-gray-900">{row.value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
