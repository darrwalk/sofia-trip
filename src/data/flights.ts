export type Flight = {
  confirmation: string;
  airline: string;
  direction: 'outbound' | 'return';
  flightNumber: string;
  date: string;
  departure: { airport: string; code: string; time: string };
  arrival: { airport: string; code: string; time: string };
};

export const flights: Flight[] = [
  {
    confirmation: 'JNC77T',
    airline: 'Wizz Air',
    direction: 'outbound',
    flightNumber: 'W6 4416',
    date: '2026-05-15',
    departure: { airport: 'Nice', code: 'NCE', time: '09:10' },
    arrival: { airport: 'Sofia', code: 'SOF', time: '12:25' },
  },
  {
    confirmation: 'JNC77T',
    airline: 'Wizz Air',
    direction: 'return',
    flightNumber: 'W6 4415',
    date: '2026-05-19',
    departure: { airport: 'Sofia', code: 'SOF', time: '13:00' },
    arrival: { airport: 'Nice', code: 'NCE', time: '14:25' },
  },
];
