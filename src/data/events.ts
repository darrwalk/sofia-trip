export type EventItem = {
  name: string;
  category: 'concert' | 'rooftop' | 'nightlife' | 'landmark' | 'museum' | 'day_trip';
  description: string;
  date?: string;
  location?: string;
  url?: string;
  mapUrl?: string;
  note?: string;
};

export const events: EventItem[] = [
  // Concert — arrives same night!
  {
    name: 'Tinariwen',
    category: 'concert',
    description: 'Desert blues legends from Mali — hypnotic Saharan guitar grooves. You arrive the same night. Perfect way to start the trip.',
    date: '2026-05-15',
    location: 'NDK Hall 3',
    url: 'https://www.songkick.com/concerts/42859614-tinariwen-at-hall-3-ndk-sofia-bulgaria',
    mapUrl: 'https://maps.google.com/?q=NDK+Hall+3+Sofia',
  },

  // Rooftop Bars — verified from The Rooftop Guide 2026
  {
    name: 'The Scene Rooftop',
    category: 'rooftop',
    description: 'Sofia\'s top-rated rooftop. Cathedral views, creative cocktails inspired by Europe & Middle East. On top of Hyatt Regency.',
    location: 'Hyatt Regency Sofia',
    url: 'https://www.tripadvisor.com/Restaurant_Review-g294452-d23456521-Reviews-The_Scene_Rooftop_Bar_Terrace-Sofia_Sofia_Region.html',
    mapUrl: 'https://maps.google.com/?q=Hyatt+Regency+Sofia+Rooftop',
    note: 'Reserve for sunset',
  },
  {
    name: 'Sense Rooftop',
    category: 'rooftop',
    description: 'Panoramic terrace with views of Alexander Nevsky Cathedral. Craft cocktails, premium wines, elegant but relaxed.',
    location: 'Sense Hotel',
    url: 'https://www.tripadvisor.com/Attraction_Review-g294452-d4923166-Reviews-Sense_Hotel_Rooftop_Bar-Sofia_Sofia_Region.html',
    mapUrl: 'https://maps.google.com/?q=Sense+Hotel+Sofia',
  },
  {
    name: 'Ozone Skybar',
    category: 'rooftop',
    description: 'Sofia\'s highest bar — 29th floor with 360° views over the city and Vitosha Mountain. Modern lounge vibes.',
    location: 'Grand Hotel Millennium, 29th floor',
    url: 'https://www.tripadvisor.com/Attraction_Review-g294452-d23199543-Reviews-Ozone_Skybar_Lounge-Sofia_Sofia_Region.html',
    mapUrl: 'https://maps.google.com/?q=Grand+Hotel+Millennium+Sofia',
  },

  // Nightlife — the gems
  {
    name: 'Hambara',
    category: 'nightlife',
    description: 'THE legendary hidden bar. Candle-lit ancient barn, no sign outside — find the hidden door. Fantastic cocktails, endless shot creativity.',
    url: 'https://www.tripadvisor.com/Attraction_Review-g294452-d2644403-Reviews-Hambara_Bar-Sofia_Sofia_Region.html',
    mapUrl: 'https://maps.google.com/?q=Hambara+Bar+Sofia',
    note: 'Look for the hidden door on Yanko Sakuzov Blvd',
  },
  {
    name: 'Raketa Rakia Bar',
    category: 'nightlife',
    description: '60+ rakia varieties in a Soviet-retro living room. Like drinking in your communist grandma\'s house. Great food too.',
    url: 'https://www.tripadvisor.com/Restaurant_Review-g294452-d5484891-Reviews-Raketa_Rakia_Bar-Sofia_Sofia_Region.html',
    mapUrl: 'https://maps.google.com/?q=Raketa+Rakia+Bar+Sofia',
    note: 'Try the apple and Williamovka rakias',
  },
  {
    name: 'FOMO Club',
    category: 'nightlife',
    description: 'Sofia\'s proper dance club. Electronic beats, late-night energy. Free entry, budget-friendly drinks.',
    location: 'Tsar Kaloyan 6',
    url: 'https://www.tripadvisor.com/Attraction_Review-g294452-d28826303-Reviews-Fomo_The_Club-Sofia_Sofia_Region.html',
    mapUrl: 'https://maps.google.com/?q=FOMO+Club+Sofia',
  },

  // Landmarks
  {
    name: 'Alexander Nevsky Cathedral',
    category: 'landmark',
    description: 'Sofia\'s icon. Neo-Byzantine cathedral with golden domes, stunning interior. Walk in free, light a candle.',
    url: 'https://www.tripadvisor.com/Attraction_Review-g294452-d317771-Reviews-Alexander_Nevsky_Cathedral-Sofia_Sofia_Region.html',
    mapUrl: 'https://maps.google.com/?q=Alexander+Nevsky+Cathedral+Sofia',
  },
  {
    name: 'Boyana Church',
    category: 'landmark',
    description: 'UNESCO gem. 13th-century frescoes so detailed they predate the Renaissance masters. Small church, huge impact.',
    url: 'https://www.getyourguide.com/boyana-church-l75415/',
    mapUrl: 'https://maps.google.com/?q=Boyana+Church+Sofia',
    note: 'Book tickets online — limited entry slots',
  },
  {
    name: 'Vitosha Mountain',
    category: 'landmark',
    description: 'Sofia\'s backyard mountain. Take the gondola up for hiking trails and panoramic views. 30 min from city center.',
    url: 'https://www.tripadvisor.com/Attraction_Review-g294452-d311570-Reviews-Vitosha_Mountain-Sofia_Sofia_Region.html',
    mapUrl: 'https://maps.google.com/?q=Vitosha+Gondola+Sofia',
    note: 'Check gondola times before going',
  },

  // Museum — the unique one
  {
    name: 'Museum of Socialist Art',
    category: 'museum',
    description: 'Communist statues, propaganda posters, and Soviet-era art in an outdoor park. Unique and slightly surreal.',
    url: 'https://www.tripadvisor.com/Attraction_Review-g294452-d2463199-Reviews-Museum_of_Socialist_Art-Sofia_Sofia_Region.html',
    mapUrl: 'https://maps.google.com/?q=Museum+of+Socialist+Art+Sofia',
    note: 'Don\'t miss the giant Lenin head',
  },

  // Day Trip
  {
    name: 'Rila Monastery',
    category: 'day_trip',
    description: 'Bulgaria\'s spiritual heart. UNESCO World Heritage, 10th-century fortress monastery in the mountains. Mind-blowing frescoes.',
    url: 'https://www.tripadvisor.com/Attraction_Review-g1573109-d311566-Reviews-Rila_Monastery-Rila_Kyustendil_Province.html',
    mapUrl: 'https://maps.google.com/?q=Rila+Monastery+Bulgaria',
    note: '~2h drive from Sofia — leave early',
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
