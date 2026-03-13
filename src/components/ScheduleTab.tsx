"use client";

import { useState, useEffect, useCallback } from "react";

type ScheduleItem = {
  id: number;
  title: string;
  day: string;
  start_time: string | null;
  end_time: string | null;
  category: string;
  notes: string | null;
  linked_event_id: number | null;
  linked_restaurant_id: number | null;
  linked_event?: { name: string; url: string | null } | null;
  linked_restaurant?: { name: string; tripadvisor_url: string | null } | null;
};

const DAYS = [
  { date: "2026-05-15", label: "Thu, May 15", short: "Thu" },
  { date: "2026-05-16", label: "Fri, May 16", short: "Fri" },
  { date: "2026-05-17", label: "Sat, May 17", short: "Sat" },
  { date: "2026-05-18", label: "Sun, May 18", short: "Sun" },
  { date: "2026-05-19", label: "Mon, May 19", short: "Mon" },
];

const CATEGORIES = [
  { value: "restaurant", label: "Restaurant", emoji: "\ud83c\udf7d\ufe0f", bg: "bg-orange-100", border: "border-orange-300", text: "text-orange-800", dot: "bg-orange-400" },
  { value: "concert", label: "Concert", emoji: "\ud83c\udfb5", bg: "bg-purple-100", border: "border-purple-300", text: "text-purple-800", dot: "bg-purple-400" },
  { value: "sightseeing", label: "Sightseeing", emoji: "\ud83c\udfdb\ufe0f", bg: "bg-blue-100", border: "border-blue-300", text: "text-blue-800", dot: "bg-blue-400" },
  { value: "transport", label: "Transport", emoji: "\u2708\ufe0f", bg: "bg-gray-100", border: "border-gray-300", text: "text-gray-800", dot: "bg-gray-400" },
  { value: "nightlife", label: "Nightlife", emoji: "\ud83c\udf19", bg: "bg-indigo-100", border: "border-indigo-300", text: "text-indigo-800", dot: "bg-indigo-400" },
  { value: "free-time", label: "Free Time", emoji: "\u2600\ufe0f", bg: "bg-green-100", border: "border-green-300", text: "text-green-800", dot: "bg-green-400" },
];

function getCategoryStyle(cat: string) {
  return CATEGORIES.find((c) => c.value === cat) || CATEGORIES[5];
}

function formatTime(t: string | null) {
  if (!t) return "";
  return t;
}

type AddFormProps = {
  onAdd: (item: ScheduleItem) => void;
  defaultDay?: string;
};

function AddScheduleForm({ onAdd, defaultDay }: AddFormProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [day, setDay] = useState(defaultDay || DAYS[0].date);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [category, setCategory] = useState("free-time");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          day,
          startTime: startTime || null,
          endTime: endTime || null,
          category,
          notes: notes.trim() || null,
        }),
      });
      if (res.ok) {
        const item = await res.json();
        onAdd(item);
        setTitle("");
        setStartTime("");
        setEndTime("");
        setNotes("");
        setCategory("free-time");
        setOpen(false);
      }
    } finally {
      setSaving(false);
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full py-2 px-3 border-2 border-dashed border-gray-300 rounded-xl text-sm text-gray-500 hover:border-amber-400 hover:text-amber-600 transition-all"
      >
        + Add item
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-3 space-y-2">
      <input
        type="text"
        placeholder="What's happening?"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-amber-400"
        autoFocus
      />
      <div className="flex gap-2">
        <select
          value={day}
          onChange={(e) => setDay(e.target.value)}
          className="flex-1 px-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-amber-400"
        >
          {DAYS.map((d) => (
            <option key={d.date} value={d.date}>
              {d.label}
            </option>
          ))}
        </select>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="flex-1 px-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-amber-400"
        >
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.emoji} {c.label}
            </option>
          ))}
        </select>
      </div>
      <div className="flex gap-2">
        <input
          type="time"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          className="flex-1 px-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-amber-400"
          placeholder="Start"
        />
        <input
          type="time"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
          className="flex-1 px-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-amber-400"
          placeholder="End"
        />
      </div>
      <input
        type="text"
        placeholder="Notes (optional)"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-amber-400"
      />
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={saving || !title.trim()}
          className="flex-1 py-1.5 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600 disabled:opacity-50 transition-colors"
        >
          {saving ? "Adding..." : "Add"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-500 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

export function ScheduleTab() {
  const [items, setItems] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editNotes, setEditNotes] = useState("");
  const [editStartTime, setEditStartTime] = useState("");
  const [editEndTime, setEditEndTime] = useState("");

  const loadItems = useCallback(async () => {
    try {
      const res = await fetch("/api/schedule");
      const data = await res.json();
      setItems(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const handleAdd = (item: ScheduleItem) => {
    setItems((prev) => [...prev, item].sort((a, b) => {
      if (a.day !== b.day) return a.day.localeCompare(b.day);
      if (a.start_time && b.start_time) return a.start_time.localeCompare(b.start_time);
      if (a.start_time) return -1;
      if (b.start_time) return 1;
      return a.id - b.id;
    }));
  };

  const handleDelete = async (id: number) => {
    const res = await fetch(`/api/schedule/${id}`, { method: "DELETE" });
    if (res.ok) {
      setItems((prev) => prev.filter((i) => i.id !== id));
    }
  };

  const handleStartEdit = (item: ScheduleItem) => {
    setEditingId(item.id);
    setEditNotes(item.notes || "");
    setEditStartTime(item.start_time || "");
    setEditEndTime(item.end_time || "");
  };

  const handleSaveEdit = async (item: ScheduleItem) => {
    const res = await fetch(`/api/schedule/${item.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        startTime: editStartTime || null,
        endTime: editEndTime || null,
        notes: editNotes.trim() || null,
      }),
    });
    if (res.ok) {
      const updated = await res.json();
      setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, ...updated } : i)));
      setEditingId(null);
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-gray-400">Loading schedule...</div>;
  }

  return (
    <div>
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6">
        <p className="text-sm text-gray-700">
          <span className="text-amber-700 font-semibold">Day-by-day planner</span> — add items directly or use the
          {" "}<span className="text-amber-600">\ud83d\udcc6 Schedule</span> button on event and restaurant cards.
        </p>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-2 mb-6">
        {CATEGORIES.map((c) => (
          <span key={c.value} className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${c.bg} ${c.text}`}>
            <span className={`w-2 h-2 rounded-full ${c.dot}`} />
            {c.emoji} {c.label}
          </span>
        ))}
      </div>

      {/* Day columns */}
      <div className="flex flex-col lg:flex-row gap-4 lg:overflow-x-auto lg:pb-4">
        {DAYS.map((day) => {
          const dayItems = items.filter((i) => i.day === day.date);
          return (
            <div
              key={day.date}
              className="flex-shrink-0 lg:w-[260px] bg-white border border-gray-200 rounded-2xl overflow-hidden"
            >
              {/* Day header */}
              <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-3">
                <p className="text-white font-bold text-sm">{day.label}</p>
                <p className="text-amber-100 text-xs">{dayItems.length} item{dayItems.length !== 1 ? "s" : ""}</p>
              </div>

              {/* Items */}
              <div className="p-3 space-y-2 min-h-[120px]">
                {dayItems.length === 0 && (
                  <p className="text-xs text-gray-400 text-center py-4">No items yet</p>
                )}
                {dayItems.map((item) => {
                  const style = getCategoryStyle(item.category);
                  const isEditing = editingId === item.id;

                  return (
                    <div
                      key={item.id}
                      className={`${style.bg} ${style.border} border rounded-lg p-2.5 relative group`}
                    >
                      {/* Delete button */}
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-white/80 text-gray-400 hover:text-red-500 hover:bg-red-50 text-xs opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center"
                        title="Remove"
                      >
                        \u00d7
                      </button>

                      {/* Time */}
                      {isEditing ? (
                        <div className="flex gap-1 mb-1">
                          <input
                            type="time"
                            value={editStartTime}
                            onChange={(e) => setEditStartTime(e.target.value)}
                            className="w-[90px] px-1 py-0.5 border border-gray-200 rounded text-xs focus:outline-none focus:border-amber-400"
                          />
                          <span className="text-xs text-gray-400">\u2013</span>
                          <input
                            type="time"
                            value={editEndTime}
                            onChange={(e) => setEditEndTime(e.target.value)}
                            className="w-[90px] px-1 py-0.5 border border-gray-200 rounded text-xs focus:outline-none focus:border-amber-400"
                          />
                        </div>
                      ) : (
                        (item.start_time || item.end_time) && (
                          <p className={`text-xs font-semibold ${style.text} mb-0.5`}>
                            {formatTime(item.start_time)}
                            {item.end_time ? ` \u2013 ${formatTime(item.end_time)}` : ""}
                          </p>
                        )
                      )}

                      {/* Title */}
                      <p className={`text-sm font-medium ${style.text}`}>
                        {style.emoji} {item.title}
                      </p>

                      {/* Notes */}
                      {isEditing ? (
                        <div className="mt-1">
                          <input
                            type="text"
                            value={editNotes}
                            onChange={(e) => setEditNotes(e.target.value)}
                            placeholder="Notes..."
                            className="w-full px-2 py-0.5 border border-gray-200 rounded text-xs focus:outline-none focus:border-amber-400"
                          />
                          <div className="flex gap-1 mt-1">
                            <button
                              onClick={() => handleSaveEdit(item)}
                              className="px-2 py-0.5 bg-amber-500 text-white rounded text-xs hover:bg-amber-600"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="px-2 py-0.5 border border-gray-200 rounded text-xs text-gray-500 hover:bg-gray-50"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          {item.notes && (
                            <p className="text-xs text-gray-600 mt-0.5">{item.notes}</p>
                          )}
                          {item.linked_event && (
                            <p className="text-xs text-blue-600 mt-0.5">
                              \ud83d\udd17 {item.linked_event.name}
                            </p>
                          )}
                          {item.linked_restaurant && (
                            <p className="text-xs text-blue-600 mt-0.5">
                              \ud83d\udd17 {item.linked_restaurant.name}
                            </p>
                          )}
                          <button
                            onClick={() => handleStartEdit(item)}
                            className="text-xs text-gray-400 hover:text-amber-600 mt-1 opacity-0 group-hover:opacity-100 transition-all"
                          >
                            \u270f\ufe0f edit
                          </button>
                        </>
                      )}
                    </div>
                  );
                })}

                <AddScheduleForm onAdd={handleAdd} defaultDay={day.date} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
