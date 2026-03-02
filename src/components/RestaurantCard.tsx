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
  category: string;
  tripadvisor_url: string | null;
  google_maps_url: string | null;
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
  const isDinnerClub = restaurant.category === 'dinner_club';
  const isLunch = restaurant.category === 'lunch';
  const isSnack = restaurant.category === 'snack';
  const isBar = restaurant.category === 'bar';

  const rankBg = isDinnerClub
    ? 'bg-purple-400'
    : isLunch
    ? 'bg-emerald-400'
    : isSnack
    ? 'bg-orange-400'
    : isBar
    ? 'bg-blue-400'
    : 'bg-amber-500';

  const priceColor = isDinnerClub
    ? 'text-purple-300'
    : isLunch
    ? 'text-emerald-400'
    : isSnack
    ? 'text-orange-400'
    : isBar
    ? 'text-blue-400'
    : 'text-amber-400';

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4 flex flex-col gap-3 hover:border-slate-600 transition-colors">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-slate-900 font-bold text-sm ${rankBg}`}>
          #{restaurant.rank}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-bold text-white text-base leading-tight">{restaurant.name}</h3>
            {isDinnerClub && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-medium">
                🍸 Dinner + Club
              </span>
            )}
            {isLunch && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-medium">
                ☀️ Lunch & Views
              </span>
            )}
            {isSnack && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-orange-400/15 text-orange-400 border border-orange-400/30 font-medium">
                🥙 Quick Bite
              </span>
            )}
            {isBar && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/30 font-medium">
                🍺 Bar
              </span>
            )}
          </div>
          <p className="text-slate-400 text-xs mt-0.5">
            📍 {restaurant.address}
          </p>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className={`text-xs font-semibold ${priceColor}`}>
              {restaurant.price_range}
            </span>
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
            {restaurant.tripadvisor_url && (
              <a
                href={restaurant.tripadvisor_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-medium transition-colors hover:opacity-80"
                style={{ color: '#34E0A1' }}
              >
                🦎 TripAdvisor
              </a>
            )}
            {restaurant.google_maps_url && (
              <a
                href={restaurant.google_maps_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-medium inline-flex items-center gap-1 text-slate-300 hover:text-white transition-colors"
              >
                📍 Maps
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3 opacity-70">
                  <path d="M14 3h7v7" />
                  <path d="M10 14L21 3" />
                  <path d="M21 14v7h-7" />
                  <path d="M3 10v11h11" />
                </svg>
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
            : isDinnerClub
            ? 'bg-purple-500/10 text-purple-200 border border-purple-500/20'
            : isLunch
            ? 'bg-emerald-500/10 text-emerald-200 border border-emerald-500/20'
            : isSnack
            ? 'bg-orange-400/10 text-orange-200 border border-orange-400/20'
            : isBar
            ? 'bg-blue-500/10 text-blue-200 border border-blue-500/20'
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
