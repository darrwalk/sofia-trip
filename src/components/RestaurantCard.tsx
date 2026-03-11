'use client';

import { useState } from 'react';
import { ScoreBar } from './ScoreBar';
import { VoteButtons } from './VoteButtons';

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
    ? 'bg-purple-500'
    : isLunch
    ? 'bg-emerald-500'
    : isSnack
    ? 'bg-orange-400'
    : isBar
    ? 'bg-blue-500'
    : 'bg-amber-500';

  const priceColor = isDinnerClub
    ? 'text-purple-600'
    : isLunch
    ? 'text-emerald-600'
    : isSnack
    ? 'text-orange-600'
    : isBar
    ? 'text-blue-600'
    : 'text-amber-600';

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4 flex flex-col gap-3 hover:border-gray-300 hover:shadow-sm transition-all">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm ${rankBg}`}>
          #{restaurant.rank}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-bold text-gray-900 text-base leading-tight">{restaurant.name}</h3>
            {isDinnerClub && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 font-medium">
                🍸 Dinner + Club
              </span>
            )}
            {isLunch && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
                ☀️ Lunch & Views
              </span>
            )}
            {isSnack && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-orange-50 text-orange-700 border border-orange-200 font-medium">
                🥙 Quick Bite
              </span>
            )}
            {isBar && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-medium">
                🍺 Bar
              </span>
            )}
          </div>
          <p className="text-gray-500 text-xs mt-0.5">
            📍 {restaurant.address}
          </p>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className={`text-xs font-semibold ${priceColor}`}>
              {restaurant.price_range}
            </span>
            {restaurant.website && (
              <a href={restaurant.website} target="_blank" rel="noopener noreferrer"
                className="text-xs text-gray-400 hover:text-amber-600 transition-colors">
                🔗 Website
              </a>
            )}
            {restaurant.phone && (
              <a href={`tel:${restaurant.phone}`}
                className="text-xs text-gray-400 hover:text-amber-600 transition-colors">
                📞 {restaurant.phone}
              </a>
            )}
            {restaurant.tripadvisor_url && (
              <a href={restaurant.tripadvisor_url} target="_blank" rel="noopener noreferrer"
                className="text-xs font-medium text-green-600 hover:text-green-500 transition-colors">
                🦎 TripAdvisor
              </a>
            )}
            {restaurant.google_maps_url && (
              <a href={restaurant.google_maps_url} target="_blank" rel="noopener noreferrer"
                className="text-xs font-medium inline-flex items-center gap-1 text-gray-600 hover:text-gray-900 transition-colors">
                📍 Maps
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Note */}
      {restaurant.note && (
        <div className={`text-xs px-3 py-2 rounded-lg font-medium ${
          isUrgent
            ? 'bg-amber-50 text-amber-800 border border-amber-200'
            : isDinnerClub
            ? 'bg-purple-50 text-purple-700 border border-purple-200'
            : isLunch
            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            : isSnack
            ? 'bg-orange-50 text-orange-700 border border-orange-200'
            : isBar
            ? 'bg-blue-50 text-blue-700 border border-blue-200'
            : 'bg-gray-50 text-gray-600'
        }`}>
          {restaurant.note}
        </div>
      )}

      {/* Description */}
      <div>
        <p className="text-gray-700 text-sm leading-relaxed">{displayDesc}</p>
        {isLong && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-amber-600 text-xs mt-1 hover:text-amber-500"
          >
            {expanded ? 'show less' : 'read more'}
          </button>
        )}
      </div>

      {/* Scores */}
      <div className="border-t border-gray-100 pt-3">
        <ScoreBar
          score_authenticity={restaurant.score_authenticity}
          score_experience={restaurant.score_experience}
          score_food_quality={restaurant.score_food_quality}
          score_exclusivity={restaurant.score_exclusivity}
          score_value={restaurant.score_value}
        />
      </div>

      {/* Voting */}
      <div className="border-t border-gray-100 pt-3">
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
