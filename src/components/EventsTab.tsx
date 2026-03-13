'use client';

import { useState, useEffect } from 'react';
import { categoryLabels, type EventCategory } from '../data/events';
import { AddToScheduleButton } from './AddToScheduleButton';

type EventItem = {
  id: number;
  name: string;
  category: string;
  description: string;
  date: string | null;
  location: string | null;
  url: string | null;
  map_url: string | null;
  note: string | null;
};

type CategoryFilter = EventCategory | 'all';

export function EventsTab() {
  const [filter, setFilter] = useState<CategoryFilter>('all');
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/events')
      .then(res => res.json())
      .then(data => {
        setEvents(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const categories = Object.entries(categoryLabels) as [EventCategory, { emoji: string; label: string }][];

  const filtered = filter === 'all' ? events : events.filter((e) => e.category === filter);

  const grouped = categories
    .map(([cat, meta]) => ({
      category: cat,
      ...meta,
      items: filtered.filter((e) => e.category === cat),
    }))
    .filter((g) => g.items.length > 0);

  if (loading) {
    return <div className="text-center py-12 text-gray-400">Loading events...</div>;
  }

  return (
    <div>
      {/* Filter pills */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
            filter === 'all'
              ? 'bg-amber-500 text-white'
              : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
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
                  ? 'bg-amber-500 text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
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
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <span>{group.emoji}</span>
              <span>{group.label}</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {group.items.map((item) => (
                <div
                  key={item.id}
                  className="bg-white border border-gray-200 rounded-xl p-4 hover:border-gray-300 hover:shadow-sm transition-all"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-semibold text-gray-900 flex-1">
                      {item.url ? (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-amber-600 transition-colors inline-flex items-center gap-1.5"
                        >
                          {item.name}
                          <svg className="w-3.5 h-3.5 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      ) : (
                        item.name
                      )}
                    </h4>
                    <AddToScheduleButton
                      title={item.name}
                      linkedEventId={item.id}
                      defaultCategory={
                        item.category === 'concert' ? 'concert' :
                        item.category === 'nightlife' ? 'nightlife' :
                        'sightseeing'
                      }
                    />
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                  {item.note && (
                    <p className="text-xs text-amber-700 mt-2 font-medium">
                      ⚠️ {item.note}
                    </p>
                  )}
                  {item.date && (
                    <p className="text-xs text-gray-500 mt-2">
                      📅 {new Date(item.date + 'T00:00:00').toLocaleDateString('en-GB', {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'long',
                      })}
                    </p>
                  )}
                  {item.location && (
                    <p className="text-xs text-gray-400 mt-1">📍 {item.location}</p>
                  )}
                  {item.map_url && (
                    <a
                      href={item.map_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-500 mt-2"
                    >
                      🗺️ Open in Maps
                    </a>
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
