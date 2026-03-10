'use client';

export type TabId = 'restaurants' | 'flights' | 'things-to-do';

type Tab = { id: TabId; emoji: string; label: string };

const tabs: Tab[] = [
  { id: 'restaurants', emoji: '🍽️', label: 'Restaurants' },
  { id: 'flights', emoji: '✈️', label: 'Flights' },
  { id: 'things-to-do', emoji: '📅', label: 'Things To Do' },
];

export function TabSwitcher({
  activeTab,
  onTabChange,
}: {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}) {
  return (
    <nav className="flex gap-1 mt-4">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
            activeTab === tab.id
              ? 'bg-amber-500 text-slate-900'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
          }`}
        >
          {tab.emoji} {tab.label}
        </button>
      ))}
    </nav>
  );
}
