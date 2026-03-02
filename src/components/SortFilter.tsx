'use client';

import { useState, useMemo } from 'react';
import { RestaurantCard } from './RestaurantCard';

type Vote = { voter_name: string; vote_type: 'up' | 'down' };
type Restaurant = {
  id: number; rank: number; name: string; address: string;
  price_range: string; description: string; website: string | null;
  phone: string | null; note: string | null;
  score_authenticity: number; score_experience: number;
  score_food_quality: number; score_exclusivity: number; score_value: number;
  votes: Vote[]; upCount: number; downCount: number;
};

type SortKey = 'rank' | 'votes' | 'authenticity' | 'experience';
type FilterKey = 'all' | 'authentic' | 'shows';

export function SortFilter({ restaurants }: { restaurants: Restaurant[] }) {
  const [sort, setSort] = useState<SortKey>('rank');
  const [filter, setFilter] = useState<FilterKey>('all');

  const processed = useMemo(() => {
    let items = [...restaurants];

    if (filter === 'authentic') items = items.filter(r => r.score_authenticity >= 4);
    if (filter === 'shows') items = items.filter(r => r.score_experience >= 4);

    items.sort((a, b) => {
      if (sort === 'rank') return a.rank - b.rank;
      if (sort === 'votes') return (b.upCount - b.downCount) - (a.upCount - a.downCount);
      if (sort === 'authenticity') return b.score_authenticity - a.score_authenticity;
      if (sort === 'experience') return b.score_experience - a.score_experience;
      return 0;
    });

    return items;
  }, [restaurants, sort, filter]);

  const sortButtons: { key: SortKey; label: string }[] = [
    { key: 'rank', label: 'By Rank' },
    { key: 'votes', label: '👍 Votes' },
    { key: 'authenticity', label: '🏺 Authentic' },
    { key: 'experience', label: '🎭 Experience' },
  ];

  const filterButtons: { key: FilterKey; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'authentic', label: '🏺 Traditional' },
    { key: 'shows', label: '🎭 Best Shows' },
  ];

  return (
    <div>
      {/* Controls */}
      <div className="flex flex-col gap-3 mb-6">
        <div>
          <p className="text-xs text-slate-500 mb-1.5 font-medium uppercase tracking-wide">Sort by</p>
          <div className="flex flex-wrap gap-2">
            {sortButtons.map(b => (
              <button
                key={b.key}
                onClick={() => setSort(b.key)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  sort === b.key
                    ? 'bg-amber-500 text-slate-900'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {b.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs text-slate-500 mb-1.5 font-medium uppercase tracking-wide">Filter</p>
          <div className="flex flex-wrap gap-2">
            {filterButtons.map(b => (
              <button
                key={b.key}
                onClick={() => setFilter(b.key)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  filter === b.key
                    ? 'bg-amber-500 text-slate-900'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {b.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Count */}
      <p className="text-xs text-slate-500 mb-4">
        Showing {processed.length} of {restaurants.length} restaurants
      </p>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {processed.map(r => (
          <RestaurantCard key={r.id} restaurant={r} />
        ))}
      </div>

      {processed.length === 0 && (
        <div className="text-center py-12 text-slate-500">
          No restaurants match this filter.
        </div>
      )}
    </div>
  );
}
