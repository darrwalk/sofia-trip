export type EventItem = {
  name: string;
  category: 'concert' | 'festival' | 'rooftop' | 'nightlife' | 'market' | 'experience' | 'landmark' | 'museum' | 'day_trip' | 'wild';
  description: string;
  date?: string;
  location?: string;
  url?: string;
  mapUrl?: string;
  note?: string;
};

export const events: EventItem[] = [
  // === CONCERTS & FESTIVALS ===

  {
    name: 'Tinariwen',
    category: 'concert',
    description: 'Desert blues legends from Mali — hypnotic Saharan guitar grooves. You arrive the same night. Perfect way to start the trip.',
    date: '2026-05-15',
    location: 'NDK Hall 3',
    url: 'https://www.songkick.com/concerts/42859614-tinariwen-at-hall-3-ndk-sofia-bulgaria',
    mapUrl: 'https://maps.google.com/?q=NDK+Hall+3+Sofia',
  },
  {
    name: 'SoFest 2026 Spring — Jazz & World Music',
    category: 'festival',
    description: 'Multi-day music festival at City Stage. Teodosii Spassov (legendary Bulgarian kaval player) + BalkanAmericana, Miroslav Tadić (Bosnian guitar virtuoso), Ostava (beloved indie-rock — think Bulgarian Radiohead), Marius Kurkinski theatre show. World-class acts in an intimate venue.',
    date: '2026-05-14',
    location: 'City Stage, Sofia',
    url: 'https://programata.bg/muzika/festivali-muzika/sofest-2026-proletno-izdanie/',
    note: 'Runs May 14–17 — overlaps perfectly with our trip! Check lineup for per-night schedule.',
  },
  {
    name: 'Balkan Ruby 2026',
    category: 'festival',
    description: 'Ruby programming conference with "hot takes" theme — held inside the National Museum of Earth and Man, surrounded by 20,000 mineral specimens. Even if you skip the talks, the venue (crystal galleries!) is worth a walk-through.',
    date: '2026-05-15',
    location: 'National Museum "Earth and Man", 4 Cherni Vrah Blvd',
    url: 'https://balkanruby.com/',
    mapUrl: 'https://maps.google.com/?q=National+Museum+Earth+and+Man+Sofia',
    note: 'May 15–16. Tech nerds only, but the museum itself is incredible.',
  },

  // === MARKETS ===

  {
    name: 'Alexander Nevsky Flea Market',
    category: 'market',
    description: 'Iconic open-air market right next to the cathedral. Soviet memorabilia, antique icons, communist medals, vintage cameras, handmade jewelry, old maps. THE place for unique souvenirs.',
    location: 'Alexander Nevsky Square',
    mapUrl: 'https://maps.google.com/?q=Alexander+Nevsky+Flea+Market+Sofia',
    note: 'Daily but best on weekends — bigger selection, more stalls.',
  },
  {
    name: 'Women\'s Market (Zhenski Pazar)',
    category: 'market',
    description: 'Sofia\'s largest and oldest open-air market. Chaotic, colorful, cheap. Fresh produce, spices, cheese, nuts, household goods. The real Sofia, no filter. Operating since the 1800s.',
    location: 'Stefan Stambolov Blvd',
    url: 'https://maps.google.com/?q=Zhenski+Pazar+Sofia',
    mapUrl: 'https://maps.google.com/?q=Zhenski+Pazar+Sofia',
    note: 'Go in the morning for the full experience. Great for picnic supplies.',
  },
  {
    name: 'Central Market Hall (Tsentralni Hali)',
    category: 'market',
    description: 'Beautiful neo-Renaissance building from 1911. Indoor food hall with local meats, cheeses, wines, and snacks. Think European market hall vibes. Good for lunch or buying local delicacies.',
    location: 'Knyaginya Maria Luiza Blvd',
    url: 'https://www.tripadvisor.com/Attraction_Review-g294452-d4937710-Reviews-Central_Sofia_Market_Hall-Sofia_Sofia_Region.html',
    mapUrl: 'https://maps.google.com/?q=Central+Market+Hall+Sofia',
  },

  // === EXPERIENCES ===

  {
    name: 'Free Walking Tour',
    category: 'experience',
    description: 'Highly-rated 2-hour guided walk through Sofia\'s highlights: Roman ruins, Ottoman mosques, Soviet architecture, and Orthodox churches — all within walking distance. Great way to orient on Day 1.',
    location: 'Palace of Justice (meeting point)',
    url: 'https://freesofiatour.com/',
    mapUrl: 'https://maps.google.com/?q=Palace+of+Justice+Sofia',
    note: 'Runs daily. Tip-based. Also offer Communism Tour & Food Tour.',
  },
  {
    name: 'Sofia Pub Crawl',
    category: 'experience',
    description: 'Guided bar-hopping tour through Sofia\'s hidden underground bars. Meet other travelers, hear nightlife stories, discover spots you\'d never find alone. Includes welcome shots.',
    url: 'https://freesofiatour.com/tour/sofia-pub-crawl/',
    note: 'Runs most evenings. Good ice-breaker night for the group.',
  },
  {
    name: 'Sofia Wine Walk',
    category: 'experience',
    description: 'Guided tasting walk through Sofia\'s wine bars and cellars. Bulgaria has incredible and underrated wines — Mavrud, Gamza, Melnik. Learn the local varietals over 4-5 stops.',
    url: 'https://www.byfood.com/experiences/sofia-wine-walk-29277',
    note: 'Book in advance. Bulgarian wine is seriously good and ridiculously cheap.',
  },
  {
    name: 'Christo & Jean-Claude Exhibition',
    category: 'experience',
    description: 'Major exhibition of works by Christo (born in Bulgaria!) and Jean-Claude at Vivacom Art Hall. Wrapped buildings, floating piers, valley curtains — the large-scale installation artists.',
    location: 'Vivacom Art Hall',
    url: 'https://programata.bg/izlozhbi/izlozhba/new-works-kristo-i-zhan-klod-vav-vivacom-art-hall/',
    mapUrl: 'https://maps.google.com/?q=Vivacom+Art+Hall+Sofia',
    note: 'Christo was Bulgarian — this is a homecoming show. Check if still running in May.',
  },

  // === ROOFTOP BARS ===

  {
    name: 'The Scene Rooftop',
    category: 'rooftop',
    description: 'Sofia\'s top-rated rooftop. Cathedral views, creative cocktails inspired by Europe & Middle East. On top of Hyatt Regency.',
    location: 'Hyatt Regency Sofia',
    url: 'https://www.tripadvisor.com/Restaurant_Review-g294452-d21232672-Reviews-The_Scene_Rooftop_Bar_Terrace-Sofia_Sofia_Region.html',
    mapUrl: 'https://maps.google.com/?q=Hyatt+Regency+Sofia+Rooftop',
    note: 'Reserve for sunset.',
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
    url: 'https://www.tripadvisor.com/Restaurant_Review-g294452-d21211664-Reviews-Ozone_Skybar_Lounge-Sofia_Sofia_Region.html',
    mapUrl: 'https://maps.google.com/?q=Grand+Hotel+Millennium+Sofia',
  },

  // === NIGHTLIFE ===

  {
    name: 'Hambara',
    category: 'nightlife',
    description: 'THE legendary hidden bar. Candle-lit ancient barn, no sign outside — find the hidden door. Fantastic cocktails, endless shot creativity.',
    url: 'https://www.tripadvisor.com/Attraction_Review-g294452-d2644403-Reviews-Hambara_Bar-Sofia_Sofia_Region.html',
    mapUrl: 'https://maps.google.com/?q=Hambara+Bar+Sofia',
    note: 'Look for the hidden door on Yanko Sakuzov Blvd.',
  },
  {
    name: 'Raketa Rakia Bar',
    category: 'nightlife',
    description: '60+ rakia varieties in a Soviet-retro living room. Like drinking in your communist grandma\'s house. Great food too.',
    url: 'https://www.tripadvisor.com/Restaurant_Review-g294452-d5484891-Reviews-Raketa_Rakia_Bar-Sofia_Sofia_Region.html',
    mapUrl: 'https://maps.google.com/?q=Raketa+Rakia+Bar+Sofia',
    note: 'Try the apple and Williamovka rakias.',
  },
  {
    name: 'FOMO Club',
    category: 'nightlife',
    description: 'Sofia\'s proper dance club. Electronic beats, late-night energy. Free entry, budget-friendly drinks.',
    location: 'Tsar Kaloyan 6',
    url: 'https://www.tripadvisor.com/Attraction_Review-g294452-d28826303-Reviews-Fomo_The_Club-Sofia_Sofia_Region.html',
    mapUrl: 'https://maps.google.com/?q=FOMO+Club+Sofia',
  },
  {
    name: 'Underground Techno Scene',
    category: 'nightlife',
    description: 'Sofia has a raw, unpolished techno scene. "Porno BPM" parties — Jeff Mills, Ben Sims, Ellen Allien have all played. No advance tickets, word of mouth.',
    url: 'https://www.residentadvisor.net/events/bg/sofia',
    note: 'Check RA listings closer to the date.',
  },

  // === WILD CARDS ===

  {
    name: 'AK-47 Shooting Range',
    category: 'wild',
    description: 'Fire Soviet-era weapons in the Bulgarian countryside. AK-47, Glock, shotguns. 200 rounds each. Transport from Sofia included.',
    url: 'https://www.tripadvisor.com/AttractionProductReview-g294452-d17404201-3_Hours_VIP_Shooting_Range_Package-Sofia_Sofia_Region.html',
    note: '3-hour VIP package • €80–120/person.',
  },
  {
    name: 'Buzludzha UFO Monument',
    category: 'wild',
    description: 'The most insane abandoned building in Europe. Communist flying saucer on a mountain peak. Graffiti-covered, crumbling, utterly surreal.',
    url: 'https://www.atlasobscura.com/places/buzludzha-monument',
    mapUrl: 'https://maps.google.com/?q=Buzludzha+Monument+Bulgaria',
    note: '3h from Sofia • Hire a 4x4 or join a tour.',
  },
  {
    name: 'Secret Police Bunker Tour',
    category: 'wild',
    description: 'Walk the tunnels where the communist secret police operated. Underground bunkers, some still classified. The paranoid architecture of a surveillance state.',
    url: 'https://freesofiatour.com/tours/communism-tour/',
    note: 'Book the extended Communism Tour.',
  },
  {
    name: 'Princess Casino',
    category: 'wild',
    description: 'Bulgaria\'s best casino. Proper Vegas energy in Eastern Europe. Blackjack, roulette, poker.',
    url: 'https://www.tripadvisor.com/Attraction_Review-g294452-d10506795-Reviews-Princess_Casino_Sofia-Sofia_Sofia_Region.html',
    mapUrl: 'https://maps.google.com/?q=Princess+Casino+Sofia',
    note: 'Open 24/7 • Smart casual required.',
  },
  {
    name: 'Night Club Simona',
    category: 'wild',
    description: 'Sofia\'s most-recommended gentlemen\'s club. Disco lights, full shows, private rooms. The Bulgarian lev makes it very affordable.',
    location: 'bul. Cherni Vrah 100',
    url: 'https://bulgaria-infoguide.com/sofia/night-club-simona/',
    note: 'Call ahead for groups • Bottle service available.',
  },
  {
    name: 'Mineral Baths Day',
    category: 'wild',
    description: 'Sofia sits on natural hot springs. Sapareva Banya (1.5h) has outdoor mineral pools: 103°F thermal water, ice plunges, saunas. Combine with Rila Monastery.',
    url: 'https://www.getyourguide.com/sapareva-banya-l136373/from-sofia-borovets-resort-and-thermal-bath-day-trip-t409375/',
    note: 'Book the Rila + Spa combo tour.',
  },

  // === LANDMARKS ===

  {
    name: 'Alexander Nevsky Cathedral',
    category: 'landmark',
    description: 'Sofia\'s icon. Neo-Byzantine cathedral with golden domes, stunning interior. Walk in free, light a candle.',
    url: 'https://www.tripadvisor.com/Attraction_Review-g294452-d547282-Reviews-St_Alexander_Nevski_Cathedral-Sofia_Sofia_Region.html',
    mapUrl: 'https://maps.google.com/?q=Alexander+Nevsky+Cathedral+Sofia',
  },
  {
    name: 'Boyana Church',
    category: 'landmark',
    description: 'UNESCO gem. 13th-century frescoes so detailed they predate the Renaissance masters. Small church, huge impact.',
    url: 'https://www.getyourguide.com/boyana-church-l75415/',
    mapUrl: 'https://maps.google.com/?q=Boyana+Church+Sofia',
    note: 'Book tickets online — limited entry slots.',
  },
  {
    name: 'Vitosha Mountain',
    category: 'landmark',
    description: 'Sofia\'s backyard mountain. Gondola up for hiking trails and panoramic views. 30 min from city center. Perfect May weather for hiking.',
    url: 'https://beatthetrail.com/2023/11/13/explore-sofias-back-garden-5-scenic-day-hikes-on-vitosha-mountain/',
    mapUrl: 'https://maps.google.com/?q=Vitosha+Gondola+Sofia',
    note: 'Multiple difficulty levels. Aleko hut is a 2h walk. Check gondola times.',
  },

  // === MUSEUMS ===

  {
    name: 'Museum of Socialist Art',
    category: 'museum',
    description: 'Communist statues, propaganda posters, and Soviet-era art in an outdoor park. Unique and slightly surreal.',
    url: 'https://www.tripadvisor.com/Attraction_Review-g294452-d2463199-Reviews-Museum_of_Socialist_Art-Sofia_Sofia_Region.html',
    mapUrl: 'https://maps.google.com/?q=Museum+of+Socialist+Art+Sofia',
    note: 'Don\'t miss the giant Lenin head.',
  },
  {
    name: 'National Museum of Military History',
    category: 'museum',
    description: 'Outdoor yard filled with tanks, jets, artillery from WWI through Cold War. Indoor exhibits on Bulgaria\'s military history. Surprisingly fascinating.',
    url: 'https://militarymuseum.bg/en/exhibitions/',
    mapUrl: 'https://maps.google.com/?q=National+Museum+of+Military+History+Sofia',
    note: 'Cheap entry, allow 1-2 hours.',
  },

  // === DAY TRIPS ===

  {
    name: 'Rila Monastery',
    category: 'day_trip',
    description: 'Bulgaria\'s spiritual heart. UNESCO World Heritage, 10th-century fortress monastery in the mountains. Mind-blowing frescoes.',
    url: 'https://www.tripadvisor.com/Attraction_Review-g1136508-d317916-Reviews-Rila_Monastery-Rila_Sofia_Region.html',
    mapUrl: 'https://maps.google.com/?q=Rila+Monastery+Bulgaria',
    note: '~2h drive from Sofia — leave early.',
  },
  {
    name: 'Seven Rila Lakes Hike',
    category: 'day_trip',
    description: 'Stunning glacial lakes at 2,500m altitude in the Rila Mountains. Take the chairlift up, hike between pristine alpine lakes. One of Bulgaria\'s most beautiful natural sites.',
    url: 'https://www.tripadvisor.com/Attraction_Review-g294451-d1785116-Reviews-Seven_Rila_Lakes-Bulgaria.html',
    mapUrl: 'https://maps.google.com/?q=Seven+Rila+Lakes+Bulgaria',
    note: 'Full day trip. Combine with Rila Monastery or do separately. Check if chairlift is running in May.',
  },
];

export const categoryLabels: Record<EventItem['category'], { emoji: string; label: string }> = {
  concert: { emoji: '🎵', label: 'Concerts' },
  festival: { emoji: '🎪', label: 'Festivals' },
  rooftop: { emoji: '🌇', label: 'Rooftop Bars' },
  nightlife: { emoji: '🌙', label: 'Nightlife' },
  market: { emoji: '🛒', label: 'Markets' },
  experience: { emoji: '🎯', label: 'Experiences' },
  landmark: { emoji: '🏛️', label: 'Landmarks' },
  museum: { emoji: '🖼️', label: 'Museums' },
  day_trip: { emoji: '🏔️', label: 'Day Trips' },
  wild: { emoji: '🔥', label: 'Wild Cards' },
};
