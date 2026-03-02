import { getAllRestaurantsWithVotes } from '@/lib/db';
import { SortFilter } from '@/components/SortFilter';

export const dynamic = 'force-dynamic';

export default function Home() {
  const restaurants = getAllRestaurantsWithVotes();

  const totalVoters = new Set(restaurants.flatMap(r => r.votes.map(v => v.voter_name))).size;

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="bg-slate-800/80 backdrop-blur sticky top-0 z-10 border-b border-slate-700">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-white">
                🇧🇬 Sofia Trip
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                May 15–18, 2026 · {totalVoters} voters · {restaurants.length} restaurants
              </p>
            </div>
            <div className="text-2xl">🌹</div>
          </div>

          {/* Nav Tabs */}
          <nav className="flex gap-1 mt-3">
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
            <span className="text-amber-400 font-semibold">Weekend trip to Sofia, Bulgaria</span>
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

      <footer className="text-center py-8 text-slate-600 text-xs">
        Built for the Sofia crew · May 2026 🇧🇬
      </footer>
    </div>
  );
}
