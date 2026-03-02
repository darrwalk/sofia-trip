import { getAllRestaurantsWithVotes } from '@/lib/db';
import { SortFilter } from '@/components/SortFilter';
import Image from 'next/image';

export const dynamic = 'force-dynamic';

export default function Home() {
  const restaurants = getAllRestaurantsWithVotes();

  const totalVoters = new Set(restaurants.flatMap(r => r.votes.map(v => v.voter_name))).size;

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Branded Header */}
      <header style={{ background: '#1a1a2e' }} className="border-b border-amber-900/40 sticky top-0 z-10 backdrop-blur">
        <div className="max-w-4xl mx-auto px-4 py-4">
          {/* Top branding row */}
          <div className="flex flex-col sm:flex-row items-center gap-4">
            {/* Logo */}
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

            {/* Series title text */}
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

            {/* Spacer + voter count on desktop */}
            <div className="hidden sm:flex ml-auto text-right">
              <div>
                <p className="text-xs text-slate-400">{totalVoters} voters</p>
                <p className="text-xs text-slate-500">{restaurants.length} restaurants</p>
              </div>
            </div>
          </div>

          {/* Nav Tabs */}
          <nav className="flex gap-1 mt-4">
            <button className="px-4 py-1.5 rounded-lg text-sm font-medium bg-amber-500 text-slate-900">
              🍽️ Restaurants
            </button>
            <button className="px-4 py-1.5 rounded-lg text-sm font-medium text-slate-500 cursor-not-allowed" disabled>
              ✈️ Flights
            </button>
            <button className="px-4 py-1.5 rounded-lg text-sm font-medium text-slate-500 cursor-not-allowed" disabled>
              📅 Itinerary
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Trip summary banner */}
        <div className="bg-gradient-to-r from-amber-500/10 to-rose-500/10 border border-amber-500/20 rounded-2xl p-4 mb-6">
          <p className="text-sm text-slate-300">
            <span className="text-amber-400 font-semibold">Good Old Boys Trips · Sofia 🇧🇬 · May 15–18, 2026</span>
            {' '}— Vote on where you want to eat! The best picks rise to the top.
            Your name is saved locally, so you only need to enter it once.
          </p>
        </div>

        {/* Category legend */}
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 mb-6 bg-slate-800/50 rounded-xl p-3">
          <span title="How deeply rooted in real Bulgarian culinary tradition">🏺 Authenticity</span>
          <span title="The show, theater, the story you'll tell people about">🎭 Experience</span>
          <span title="Actual cooking excellence">🍽️ Food Quality</span>
          <span title="Hard to get into, intimate, not tourist-trap">🤫 Exclusivity</span>
          <span title="Bang for the buck">💰 Value</span>
        </div>

        <SortFilter restaurants={restaurants} />
      </main>

      {/* Footer */}
      <footer className="text-center py-8 text-slate-500 text-xs">
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
      </footer>
    </div>
  );
}
