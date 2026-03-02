'use client';

import { useState } from 'react';
import { ScoreBar } from './ScoreBar';
import { VoteButtons } from './VoteButtons';

type Vote = {
  voter_name: string;
  vote_type: 'up' | 'down';
};

type Restaurant = {
  id: number;
  rank: number;
  name: string;
  address: string;
  price_range: string;
  description: string;
  website: string | null;
  phone: string | null;
  note: string | null;
  score_authenticity: number;
  score_experience: number;
  score_food_quality: number;
  score_exclusivity: number;
  score_value: number;
  votes: Vote[];
  upCount: number;
  downCount: number;
};

export function RestaurantCard({ restaurant }: { restaurant: Restaurant }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = restaurant.description.length > 180;
  const displayDesc = expanded || !isLong
    ? restaurant.description
    : restaurant.description.slice(0, 180) + '…';

  const isUrgent = restaurant.note?.startsWith('⚠️');

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4 flex flex-col gap-3 hover:border-slate-600 transition-colors">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-9 h-9 rounded-full bg-amber-500 flex items-center justify-center text-slate-900 font-bold text-sm">
          #{restaurant.rank}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-white text-base leading-tight">{restaurant.name}</h3>
          <p className="text-slate-400 text-xs mt-0.5">
            📍 {restaurant.address}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-amber-400 text-xs font-semibold">{restaurant.price_range}</span>
            {restaurant.website && (
              <a
                href={restaurant.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-slate-500 hover:text-amber-400 transition-colors"
              >
                🔗 Website
              </a>
            )}
            {restaurant.phone && (
              <a
                href={`tel:${restaurant.phone}`}
                className="text-xs text-slate-500 hover:text-amber-400 transition-colors"
              >
                📞 {restaurant.phone}
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Note */}
      {restaurant.note && (
        <div className={`text-xs px-3 py-2 rounded-lg font-medium ${
          isUrgent
            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
            : 'bg-slate-700/60 text-slate-300'
        }`}>
          {restaurant.note}
        </div>
      )}

      {/* Description */}
      <div>
        <p className="text-slate-300 text-sm leading-relaxed">{displayDesc}</p>
        {isLong && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-amber-400 text-xs mt-1 hover:text-amber-300"
          >
            {expanded ? 'show less' : 'read more'}
          </button>
        )}
      </div>

      {/* Scores */}
      <div className="border-t border-slate-700 pt-3">
        <ScoreBar
          score_authenticity={restaurant.score_authenticity}
          score_experience={restaurant.score_experience}
          score_food_quality={restaurant.score_food_quality}
          score_exclusivity={restaurant.score_exclusivity}
          score_value={restaurant.score_value}
        />
      </div>

      {/* Voting */}
      <div className="border-t border-slate-700 pt-3">
        <VoteButtons
          restaurantId={restaurant.id}
          initialVotes={restaurant.votes}
          upCount={restaurant.upCount}
          downCount={restaurant.downCount}
        />
      </div>
    </div>
  );
}
