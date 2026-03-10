export type EventItem = {
  name: string;
  category: 'concert' | 'rooftop' | 'nightlife' | 'landmark' | 'museum' | 'day_trip';
  description: string;
  date?: string;
  location?: string;
  url?: string;
};

export const events: EventItem[] = [
  // Concert
  {
    name: 'Tinariwen',
    category: 'concert',
    description: 'Desert blues legends from the Sahara — live in Sofia.',
    date: '2026-05-15',
    location: 'NDK Hall 3',
  },

  // Rooftop bars
  {
    name: 'Sense Rooftop',
    category: 'rooftop',
    description: 'Panoramic rooftop bar with Vitosha views and craft cocktails.',
  },
  {
    name: 'Sky Garden',
    category: 'rooftop',
    description: 'Open-air garden bar on the top floor with DJ sets.',
  },
  {
    name: 'Cosmos',
    category: 'rooftop',
    description: 'Sleek rooftop lounge with sunset vibes over the city.',
  },

  // Nightlife
  {
    name: 'Raketa Rakia Bar',
    category: 'nightlife',
    description: 'The best rakia selection in Sofia — dozens of varieties, Soviet-retro decor.',
  },
  {
    name: 'Hambara',
    category: 'nightlife',
    description: 'Hidden speakeasy vibes, candle-lit, legendary cocktails.',
  },
  {
    name: 'FOMO Club',
    category: 'nightlife',
    description: 'Electronic music and late-night energy — Sofia\'s club scene.',
  },

  // Landmarks
  {
    name: 'Alexander Nevsky Cathedral',
    category: 'landmark',
    description: 'Iconic neo-Byzantine cathedral — Sofia\'s most recognizable landmark.',
  },
  {
    name: 'Boyana Church',
    category: 'landmark',
    description: 'UNESCO World Heritage medieval church with stunning 13th-century frescoes.',
  },
  {
    name: 'Vitosha Mountain',
    category: 'landmark',
    description: 'Sofia\'s backyard mountain — hiking trails just 30 min from the center.',
  },

  // Museums
  {
    name: 'National Art Gallery',
    category: 'museum',
    description: 'Bulgaria\'s premier art collection housed in the former Royal Palace.',
  },
  {
    name: 'National History Museum',
    category: 'museum',
    description: 'Thracian gold, medieval treasures — 7,000 years of Bulgarian history.',
  },
  {
    name: 'Museum of Socialist Art',
    category: 'museum',
    description: 'Communist-era statues, paintings, and propaganda in an outdoor park + gallery.',
  },

  // Day trips
  {
    name: 'Rila Monastery',
    category: 'day_trip',
    description: 'UNESCO World Heritage — Bulgaria\'s most famous monastery, ~2h drive from Sofia.',
  },
  {
    name: 'Seven Rila Lakes',
    category: 'day_trip',
    description: 'Stunning glacial lakes in the Rila Mountains — hiking paradise.',
  },
];

export const categoryLabels: Record<EventItem['category'], { emoji: string; label: string }> = {
  concert: { emoji: '🎵', label: 'Concerts' },
  rooftop: { emoji: '🌇', label: 'Rooftop Bars' },
  nightlife: { emoji: '🌙', label: 'Nightlife' },
  landmark: { emoji: '🏛️', label: 'Landmarks' },
  museum: { emoji: '🖼️', label: 'Museums' },
  day_trip: { emoji: '🏔️', label: 'Day Trips' },
};
