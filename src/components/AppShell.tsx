'use client';

import { useState } from 'react';
import Image from 'next/image';
import { TabSwitcher, type TabId } from './TabSwitcher';
import { SortFilter } from './SortFilter';
import { FlightsTab } from './FlightsTab';
import { EventsTab } from './EventsTab';

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

export function AppShell({ restaurants }: { restaurants: Restaurant[] }) {
  const [activeTab, setActiveTab] = useState<TabId>('restaurants');

  const totalVoters = new Set(restaurants.flatMap(r => r.votes.map(v => v.voter_name))).size;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
      {/* Branded Header */}
      <header style={{ background: 'linear-gradient(to right, #f97316, #f59e0b)' }} className="border-b border-amber-900/40 sticky top-0 z-10 backdrop-blur">
        <div className="max-w-4xl mx-auto px-4 py-4">
          {/* Top branding row */}
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="flex-shrink-0">
              <Image
                src="/sofia-summit-logo.jpg"
                alt="Sofia Summit 2026 Logo"
                width={90}
                height={90}
                className="rounded-lg sm:w-[90px] sm:h-[90px] w-[64px] h-[64px] object-contain"
                priority
              />
            </div>

            <div className="text-center sm:text-left">
              <p
                className="text-amber-400 font-semibold uppercase tracking-widest"
                style={{ fontSize: '11px', letterSpacing: '0.2em' }}
              >
                Good Old Boys Trips
              </p>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-amber-100 leading-tight mt-0.5">
                Sofia Summit 2026
              </h1>
              <p className="text-sm text-amber-300/70 mt-0.5">
                May 15–18, 2026 · Bulgaria 🇧🇬
              </p>
            </div>

            <div className="hidden sm:flex ml-auto text-right">
              <div>
                <p className="text-xs text-gray-400">{totalVoters} voters</p>
                <p className="text-xs text-gray-500">{restaurants.length} restaurants</p>
              </div>
            </div>
          </div>

          {/* Nav Tabs */}
          <TabSwitcher activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        {activeTab === 'restaurants' && (
          <>
            {/* Trip summary banner */}
            <div className="bg-gradient-to-r from-amber-500/10 to-rose-500/10 border border-amber-500/20 rounded-2xl p-4 mb-6">
              <p className="text-sm text-gray-300">
                <span className="text-amber-400 font-semibold">Good Old Boys Trips · Sofia 🇧🇬 · May 15–18, 2026</span>
                {' '}— Vote on where you want to eat! The best picks rise to the top.
                Your name is saved locally, so you only need to enter it once.
              </p>
            </div>

            {/* Category legend */}
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 mb-6 bg-white/50 rounded-xl p-3">
              <span title="How deeply rooted in real Bulgarian culinary tradition">🏺 Authenticity</span>
              <span title="The show, theater, the story you'll tell people about">🎭 Experience</span>
              <span title="Actual cooking excellence">🍽️ Food Quality</span>
              <span title="Hard to get into, intimate, not tourist-trap">🤫 Exclusivity</span>
              <span title="Bang for the buck">💰 Value</span>
            </div>

            <SortFilter restaurants={restaurants} />
          </>
        )}

        {activeTab === 'flights' && <FlightsTab />}

        {activeTab === 'things-to-do' && <EventsTab />}
      </main>

      {/* Footer */}
      <footer className="text-center py-8 text-gray-500 text-xs">
        <p>
          Made with ✨ by{' '}
          <a
            href="https://x.com/ClaudiaVeyral"
            target="_blank"
            rel="noopener noreferrer"
            className="text-amber-400 hover:text-amber-300 italic font-light transition-colors"
          >
            Claudia
          </a>
        </p>
              <p className="text-gray-600 mt-1">Last updated: March 10, 2026 (v7 - summer vibes)</p>
      </footer>
    </div>
  );
}
