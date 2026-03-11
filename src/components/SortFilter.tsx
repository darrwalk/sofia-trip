'use client';

import { useState, useMemo } from 'react';
import { RestaurantCard } from './RestaurantCard';

type Vote = { voter_name: string; vote_type: 'up' | 'down' };
type Restaurant = {
  id: number; rank: number; name: string; address: string;
  price_range: string; description: string; website: string | null;
  phone: string | null; note: string | null;
  category: string; tripadvisor_url: string | null;
  google_maps_url: string | null;
  score_authenticity: number; score_experience: number;
  score_food_quality: number; score_exclusivity: number; score_value: number;
  votes: Vote[]; upCount: number; downCount: number;
};

type SortKey = 'rank' | 'votes' | 'authenticity' | 'experience';
type FilterKey = 'all' | 'authentic' | 'shows';
type CategoryKey = 'all' | 'traditional' | 'dinner_club' | 'lunch' | 'snack' | 'bar';

export function SortFilter({ restaurants }: { restaurants: Restaurant[] }) {
  const [sort, setSort] = useState<SortKey>('rank');
  const [filter, setFilter] = useState<FilterKey>('all');
  const [category, setCategory] = useState<CategoryKey>('all');

  const traditionalCount = restaurants.filter(r => r.category === 'traditional').length;
  const dinnerClubCount = restaurants.filter(r => r.category === 'dinner_club').length;
  const lunchCount = restaurants.filter(r => r.category === 'lunch').length;
  const snackCount = restaurants.filter(r => r.category === 'snack').length;
  const barCount = restaurants.filter(r => r.category === 'bar').length;

  const processed = useMemo(() => {
    let items = [...restaurants];
    if (category === 'traditional') items = items.filter(r => r.category === 'traditional');
    if (category === 'dinner_club') items = items.filter(r => r.category === 'dinner_club');
    if (category === 'lunch') items = items.filter(r => r.category === 'lunch');
    if (category === 'snack') items = items.filter(r => r.category === 'snack');
    if (category === 'bar') items = items.filter(r => r.category === 'bar');
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
  }, [restaurants, sort, filter, category]);

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

  const catBtn = (key: CategoryKey, label: string, activeColor: string) => (
    <button
      key={key}
      onClick={() => setCategory(key)}
      className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all border ${
        category === key
          ? `${activeColor} border-transparent`
          : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div>
      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 mb-5">
        {catBtn('all', `All (${restaurants.length})`, 'bg-amber-500 text-white')}
        {catBtn('traditional', `🍽️ Traditional (${traditionalCount})`, 'bg-amber-500 text-white')}
        {catBtn('dinner_club', `🍸 Dinner + Club (${dinnerClubCount})`, 'bg-purple-500 text-white')}
        {catBtn('lunch', `☀️ Lunch & Views (${lunchCount})`, 'bg-emerald-500 text-white')}
        {catBtn('snack', `🥙 Quick Bites (${snackCount})`, 'bg-orange-400 text-white')}
        {catBtn('bar', `🍺 Beer & Bars (${barCount})`, 'bg-blue-500 text-white')}
      </div>

      {/* Category Banners */}
      {category === 'dinner_club' && (
        <div className="mb-5 bg-purple-50 border border-purple-200 rounded-xl px-4 py-3 text-sm text-purple-800">
          🌙 These places start as restaurants and end as clubs — no venue change needed.
        </div>
      )}
      {category === 'lunch' && (
        <div className="mb-5 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-sm text-emerald-800">
          ☀️ Outdoor terraces and rooftops — best enjoyed between noon and 4pm.
        </div>
      )}
      {category === 'snack' && (
        <div className="mb-5 bg-orange-50 border border-orange-200 rounded-xl px-4 py-3 text-sm text-orange-800">
          🥙 Street food and bakeries — Sofia&apos;s cheapest and most authentic bites.
        </div>
      )}
      {category === 'bar' && (
        <div className="mb-5 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-sm text-blue-800">
          🍺 Cool bars and craft beer spots — afternoon drinks to midnight cocktails.
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-col gap-3 mb-6">
        <div>
          <p className="text-xs text-gray-400 mb-1.5 font-medium uppercase tracking-wide">Sort by</p>
          <div className="flex flex-wrap gap-2">
            {sortButtons.map(b => (
              <button
                key={b.key}
                onClick={() => setSort(b.key)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  sort === b.key
                    ? 'bg-amber-500 text-white'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
                }`}
              >
                {b.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs text-gray-400 mb-1.5 font-medium uppercase tracking-wide">Filter</p>
          <div className="flex flex-wrap gap-2">
            {filterButtons.map(b => (
              <button
                key={b.key}
                onClick={() => setFilter(b.key)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  filter === b.key
                    ? 'bg-amber-500 text-white'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
                }`}
              >
                {b.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <p className="text-xs text-gray-400 mb-4">
        Showing {processed.length} of {restaurants.length} restaurants
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {processed.map(r => (
          <RestaurantCard key={r.id} restaurant={r} />
        ))}
      </div>

      {processed.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          No restaurants match this filter.
        </div>
      )}
    </div>
  );
}
