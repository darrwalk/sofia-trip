'use client';

import { flights } from '@/data/flights';

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function FlightsTab() {
  const confirmation = flights[0]?.confirmation;

  return (
    <div className="space-y-4">
      {/* Confirmation badge */}
      <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-wide font-medium">Booking Reference</p>
          <p className="text-2xl font-mono font-bold text-amber-400 mt-1">{confirmation}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-slate-400">{flights[0]?.airline}</p>
          <p className="text-sm text-slate-300 font-medium mt-0.5">👤 {flights[0]?.passenger}</p>
        </div>
      </div>

      {/* Flight cards */}
      {flights.map((flight, i) => (
        <div
          key={i}
          className="bg-slate-800/60 border border-slate-700 rounded-2xl p-5 hover:border-slate-600 transition-colors"
        >
          {/* Direction badge */}
          <div className="flex items-center gap-2 mb-4">
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${
                flight.direction === 'outbound'
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'bg-blue-500/20 text-blue-400'
              }`}
            >
              {flight.direction === 'outbound' ? '→ Outbound' : '← Return'}
            </span>
            <span className="text-xs text-slate-500">{flight.flightNumber}</span>
            <span className="text-xs text-slate-600 ml-auto">{formatDate(flight.date)}</span>
          </div>

          {/* Route */}
          <div className="flex items-center gap-4">
            {/* Departure */}
            <div className="text-center flex-1">
              <p className="text-3xl font-bold text-slate-100">{flight.departure.time}</p>
              <p className="text-lg font-semibold text-amber-400 mt-1">{flight.departure.code}</p>
              <p className="text-xs text-slate-500">{flight.departure.airport}</p>
            </div>

            {/* Arrow */}
            <div className="flex flex-col items-center gap-1 flex-shrink-0">
              <div className="w-16 sm:w-24 h-px bg-slate-600 relative">
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 border-l-[6px] border-l-slate-600 border-y-[4px] border-y-transparent" />
              </div>
              <p className="text-[10px] text-slate-600">
                {flight.direction === 'outbound' ? '3h 15m' : '2h 25m'}
              </p>
            </div>

            {/* Arrival */}
            <div className="text-center flex-1">
              <p className="text-3xl font-bold text-slate-100">{flight.arrival.time}</p>
              <p className="text-lg font-semibold text-amber-400 mt-1">{flight.arrival.code}</p>
              <p className="text-xs text-slate-500">{flight.arrival.airport}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
