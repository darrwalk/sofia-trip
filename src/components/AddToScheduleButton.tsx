'use client';

import { useState } from 'react';

const DAYS = [
  { date: '2026-05-15', label: 'Thu, May 15' },
  { date: '2026-05-16', label: 'Fri, May 16' },
  { date: '2026-05-17', label: 'Sat, May 17' },
  { date: '2026-05-18', label: 'Sun, May 18' },
  { date: '2026-05-19', label: 'Mon, May 19' },
];

const CATEGORIES = [
  { value: 'restaurant', label: '🍽️ Restaurant' },
  { value: 'concert', label: '🎵 Concert' },
  { value: 'sightseeing', label: '🏛️ Sightseeing' },
  { value: 'transport', label: '✈️ Transport' },
  { value: 'nightlife', label: '🌙 Nightlife' },
  { value: 'free-time', label: '☀️ Free Time' },
];

type Props = {
  title: string;
  linkedEventId?: number;
  linkedRestaurantId?: number;
  defaultCategory?: string;
};

export function AddToScheduleButton({ title, linkedEventId, linkedRestaurantId, defaultCategory }: Props) {
  const [open, setOpen] = useState(false);
  const [day, setDay] = useState(DAYS[0].date);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [category, setCategory] = useState(defaultCategory || 'sightseeing');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [added, setAdded] = useState(false);

  const handleAdd = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          day,
          startTime: startTime || null,
          endTime: endTime || null,
          category,
          notes: notes.trim() || null,
          linkedEventId: linkedEventId || null,
          linkedRestaurantId: linkedRestaurantId || null,
        }),
      });
      if (res.ok) {
        setAdded(true);
        setOpen(false);
        setTimeout(() => setAdded(false), 3000);
      }
    } finally {
      setSaving(false);
    }
  };

  if (added) {
    return (
      <span className="text-xs text-green-600 font-medium px-2 py-1 bg-green-50 rounded-lg">
        ✓ Added
      </span>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="text-xs text-amber-600 hover:text-amber-700 font-medium px-2 py-1 hover:bg-amber-50 rounded-lg transition-all whitespace-nowrap"
        title="Add to Schedule"
      >
        📆 Schedule
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 z-50 bg-white border border-gray-200 rounded-xl shadow-lg p-3 w-64">
          <p className="text-xs font-semibold text-gray-700 mb-2 truncate">{title}</p>
          
          <select
            value={day}
            onChange={(e) => setDay(e.target.value)}
            className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs mb-2 focus:outline-none focus:border-amber-400"
          >
            {DAYS.map((d) => (
              <option key={d.date} value={d.date}>{d.label}</option>
            ))}
          </select>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs mb-2 focus:outline-none focus:border-amber-400"
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>

          <div className="flex gap-2 mb-2">
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="flex-1 px-2 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-amber-400"
              placeholder="Start"
            />
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="flex-1 px-2 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-amber-400"
              placeholder="End"
            />
          </div>

          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Notes (optional)"
            className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs mb-2 focus:outline-none focus:border-amber-400"
          />

          <div className="flex gap-2">
            <button
              onClick={handleAdd}
              disabled={saving}
              className="flex-1 py-1.5 bg-amber-500 text-white rounded-lg text-xs font-medium hover:bg-amber-600 disabled:opacity-50 transition-colors"
            >
              {saving ? 'Adding...' : 'Add to Schedule'}
            </button>
            <button
              onClick={() => setOpen(false)}
              className="px-2 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-500 hover:bg-gray-50 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
