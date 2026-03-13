"use client";

export type TabId = "restaurants" | "flights" | "things-to-do" | "schedule";

type Tab = { id: TabId; emoji: string; label: string; shortLabel: string };

const tabs: Tab[] = [
  { id: "restaurants", emoji: "🍽️", label: "Restaurants", shortLabel: "Food" },
  { id: "flights", emoji: "✈️", label: "Flights", shortLabel: "Flights" },
  { id: "things-to-do", emoji: "📅", label: "Things To Do", shortLabel: "To Do" },
  { id: "schedule", emoji: "📆", label: "Schedule", shortLabel: "Schedule" },
];

export function TabSwitcher({
  activeTab,
  onTabChange,
}: {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}) {
  return (
    <nav className="grid grid-cols-4 gap-1 mt-4">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`px-2 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap min-h-[44px] ${
            activeTab === tab.id
              ? "bg-white text-orange-700 shadow-sm"
              : "text-orange-100 hover:text-white hover:bg-orange-600/50"
          }`}
        >
          <span className="hidden sm:inline">{tab.emoji} {tab.label}</span>
          <span className="sm:hidden">{tab.emoji}<br /><span className="text-[11px]">{tab.shortLabel}</span></span>
        </button>
      ))}
    </nav>
  );
}
