export type Flight = {
  confirmation?: string;
  airline: string;
  direction: 'outbound' | 'return';
  flightNumber?: string;
  date: string;
  passenger: string;
  departure: { airport: string; code: string; time: string };
  arrival: { airport: string; code: string; time: string };
};

export const flights: Flight[] = [
  // === OUTBOUND - Fri May 15 ===
  
  // Wassily arrives first
  {
    airline: 'TBD',
    direction: 'outbound',
    date: '2026-05-15',
    passenger: 'Wassily',
    departure: { airport: 'TBD', code: '???', time: '??:??' },
    arrival: { airport: 'Sofia', code: 'SOF', time: '10:05' },
  },
  
  // Arnd
  {
    confirmation: 'JNC77T',
    airline: 'Wizz Air',
    direction: 'outbound',
    flightNumber: 'W6 4416',
    date: '2026-05-15',
    passenger: 'Arnd',
    departure: { airport: 'Nice', code: 'NCE', time: '09:10' },
    arrival: { airport: 'Sofia', code: 'SOF', time: '12:25' },
  },
  
  // Tom
  {
    confirmation: '92LFQ5',
    airline: 'Lufthansa',
    direction: 'outbound',
    date: '2026-05-15',
    passenger: 'Tom',
    departure: { airport: 'Frankfurt', code: 'FRA', time: '10:10' },
    arrival: { airport: 'Sofia', code: 'SOF', time: '13:20' },
  },
  
  // Stefan arrives last
  {
    airline: 'TBD',
    direction: 'outbound',
    date: '2026-05-15',
    passenger: 'Stefan',
    departure: { airport: 'TBD', code: '???', time: '??:??' },
    arrival: { airport: 'Sofia', code: 'SOF', time: '18:40' },
  },

  // === RETURN ===
  
  // Tom leaves early - Sun May 18
  {
    confirmation: '92LFQ5',
    airline: 'Lufthansa',
    direction: 'return',
    flightNumber: 'LH1427',
    date: '2026-05-18',
    passenger: 'Tom',
    departure: { airport: 'Sofia', code: 'SOF', time: '14:20' },
    arrival: { airport: 'Frankfurt', code: 'FRA', time: '15:50' },
  },
  
  // Arnd - Mon May 19
  {
    confirmation: 'JNC77T',
    airline: 'Wizz Air',
    direction: 'return',
    flightNumber: 'W6 4415',
    date: '2026-05-19',
    passenger: 'Arnd',
    departure: { airport: 'Sofia', code: 'SOF', time: '13:00' },
    arrival: { airport: 'Nice', code: 'NCE', time: '14:25' },
  },
  
  // Wassily - TBD
  // Stefan - TBD
];
