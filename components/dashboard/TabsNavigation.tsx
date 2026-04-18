'use client';

type TabKey = 'overview' | 'users' | 'logins' | 'sessions' | 'payments' | 'growth';

export type TabsNavigationProps = {
  active: TabKey;
  onChange: (next: TabKey) => void;
};

const tabs: Array<{ key: TabKey; label: string }> = [
  { key: 'overview', label: 'Overview' },
  { key: 'users', label: 'Users' },
  { key: 'logins', label: 'Logins' },
  { key: 'sessions', label: 'Sessions' },
  { key: 'payments', label: 'Payments' },
  { key: 'growth', label: 'Growth Analytics' },
];

export default function TabsNavigation({ active, onChange }: TabsNavigationProps) {
  return (
    <div className="border-b border-gray-200 overflow-x-auto">
      <nav className="-mb-px flex space-x-6 min-w-max">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => onChange(tab.key)}
            className={`py-3 px-1 border-b-2 text-sm font-medium transition-colors ${
              active === tab.key
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
