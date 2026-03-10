'use client';

import { flights } from '@/data/flights';

export function FlightsTab() {
  const arrivals = flights
    .filter(f => f.direction === 'outbound')
    .sort((a, b) => a.arrival.time.localeCompare(b.arrival.time));
  
  const departures = flights
    .filter(f => f.direction === 'return')
    .sort((a, b) => a.departure.time.localeCompare(b.departure.time));

  return (
    <div className="space-y-8">
      {/* ARRIVALS */}
      <div>
        <h3 className="text-xl font-bold text-emerald-700 mb-4 flex items-center gap-2">
          <span>✈️</span> Arrivals in Sofia
          <span className="text-sm font-normal text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">Fri, May 15</span>
        </h3>
        <div className="bg-white border-2 border-emerald-200 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-emerald-100 text-xs text-emerald-700 uppercase bg-emerald-50">
                <th className="text-left py-3 px-4">Time</th>
                <th className="text-left py-3 px-4">Who</th>
                <th className="text-left py-3 px-4">From</th>
                <th className="text-left py-3 px-4 hidden sm:table-cell">Flight</th>
              </tr>
            </thead>
            <tbody>
              {arrivals.map((flight, i) => (
                <tr key={i} className="border-b border-emerald-50 last:border-0 hover:bg-emerald-50/50">
                  <td className="py-4 px-4">
                    <span className="text-2xl font-bold text-gray-800">{flight.arrival.time}</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="font-bold text-orange-600 text-lg">{flight.passenger}</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-gray-700 font-medium">{flight.departure.code}</span>
                    {flight.departure.code !== '???' && (
                      <span className="text-gray-500 text-sm ml-1">({flight.departure.airport})</span>
                    )}
                  </td>
                  <td className="py-4 px-4 hidden sm:table-cell">
                    {flight.flightNumber ? (
                      <span className="text-gray-600 font-mono bg-gray-100 px-2 py-1 rounded">{flight.flightNumber}</span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* DEPARTURES */}
      <div>
        <h3 className="text-xl font-bold text-blue-700 mb-4 flex items-center gap-2">
          <span>🛫</span> Departures from Sofia
        </h3>
        <div className="bg-white border-2 border-blue-200 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-blue-100 text-xs text-blue-700 uppercase bg-blue-50">
                <th className="text-left py-3 px-4">Date</th>
                <th className="text-left py-3 px-4">Time</th>
                <th className="text-left py-3 px-4">Who</th>
                <th className="text-left py-3 px-4">To</th>
                <th className="text-left py-3 px-4 hidden sm:table-cell">Flight</th>
              </tr>
            </thead>
            <tbody>
              {departures.map((flight, i) => {
                const d = new Date(flight.date + 'T00:00:00');
                const dateStr = d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
                return (
                  <tr key={i} className="border-b border-blue-50 last:border-0 hover:bg-blue-50/50">
                    <td className="py-4 px-4">
                      <span className="text-gray-700 font-medium">{dateStr}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-2xl font-bold text-gray-800">{flight.departure.time}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-bold text-orange-600 text-lg">{flight.passenger}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-gray-700 font-medium">{flight.arrival.code}</span>
                      <span className="text-gray-500 text-sm ml-1">({flight.arrival.airport})</span>
                    </td>
                    <td className="py-4 px-4 hidden sm:table-cell">
                      {flight.flightNumber ? (
                        <span className="text-gray-600 font-mono bg-gray-100 px-2 py-1 rounded">{flight.flightNumber}</span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="text-sm text-orange-700 mt-3 px-1 bg-orange-50 border border-orange-200 rounded-lg py-2 text-center">
          ⚠️ Stefan & Wassily return flights TBD
        </p>
      </div>

      {/* Booking references */}
      <div>
        <h3 className="text-sm font-semibold text-gray-500 mb-3">📋 Booking References</h3>
        <div className="flex flex-wrap gap-2">
          {[...new Set(flights.filter(f => f.confirmation).map(f => `${f.passenger}: ${f.confirmation}`))].map((ref, i) => (
            <span key={i} className="bg-white border-2 border-orange-200 rounded-lg px-3 py-2 text-sm shadow-sm">
              <span className="text-gray-600">{ref.split(': ')[0]}:</span>
              <span className="text-orange-600 font-mono font-bold ml-1">{ref.split(': ')[1]}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
