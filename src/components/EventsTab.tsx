'use client';

import { events, categoryLabels, type EventItem } from '@/data/events';
import { useState } from 'react';

type CategoryFilter = EventItem['category'] | 'all';

export function EventsTab() {
  const [filter, setFilter] = useState<CategoryFilter>('all');

  const categories = Object.entries(categoryLabels) as [EventItem['category'], { emoji: string; label: string }][];

  const filtered = filter === 'all' ? events : events.filter((e) => e.category === filter);

  // Group by category for display
  const grouped = categories
    .map(([cat, meta]) => ({
      category: cat,
      ...meta,
      items: filtered.filter((e) => e.category === cat),
    }))
    .filter((g) => g.items.length > 0);

  return (
    <div>
      {/* Filter pills */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
            filter === 'all'
              ? 'bg-amber-500 text-slate-900'
              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
        >
          All ({events.length})
        </button>
        {categories.map(([cat, meta]) => {
          const count = events.filter((e) => e.category === cat).length;
          return (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                filter === cat
                  ? 'bg-amber-500 text-slate-900'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {meta.emoji} {meta.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Grouped display */}
      <div className="space-y-8">
        {grouped.map((group) => (
          <div key={group.category}>
            <h3 className="text-lg font-semibold text-amber-400 mb-3 flex items-center gap-2">
              <span>{group.emoji}</span>
              <span>{group.label}</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {group.items.map((item) => (
                <div
                  key={item.name}
                  className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 hover:border-slate-600 transition-colors"
                >
                  <h4 className="font-semibold text-slate-100">{item.name}</h4>
                  <p className="text-sm text-slate-400 mt-1">{item.description}</p>
                  {item.date && (
                    <p className="text-xs text-amber-400/80 mt-2">
                      📅 {new Date(item.date + 'T00:00:00').toLocaleDateString('en-GB', {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'long',
                      })}
                    </p>
                  )}
                  {item.location && (
                    <p className="text-xs text-slate-500 mt-1">📍 {item.location}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
