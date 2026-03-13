"use client";

export type TabId = "restaurants" | "flights" | "things-to-do" | "schedule";

type Tab = { id: TabId; emoji: string; label: string };

const tabs: Tab[] = [
  { id: "restaurants", emoji: "🍽️", label: "Restaurants" },
  { id: "flights", emoji: "✈️", label: "Flights" },
  { id: "things-to-do", emoji: "📅", label: "Things To Do" },
  { id: "schedule", emoji: "📆", label: "Schedule" },
];

export function TabSwitcher({
  activeTab,
  onTabChange,
}: {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}) {
  return (
    <nav className="flex gap-1 mt-4 overflow-x-auto">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`px-3 sm:px-4 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
            activeTab === tab.id
              ? "bg-white text-orange-700 shadow-sm"
              : "text-orange-100 hover:text-white hover:bg-orange-600/50"
          }`}
        >
          {tab.emoji} {tab.label}
        </button>
      ))}
    </nav>
  );
}
