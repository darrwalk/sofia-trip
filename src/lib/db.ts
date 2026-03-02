import Database from 'better-sqlite3';
import path from 'path';
import { mkdirSync } from 'fs';

const DB_DIR = process.env.DB_DIR || '/app/data';
const DB_PATH = process.env.DB_PATH || path.join(DB_DIR, 'sofia-trip.db');

let _db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (_db) return _db;
  // Ensure data directory exists (runs at runtime only, not build time)
  mkdirSync(path.dirname(DB_PATH), { recursive: true });
  _db = new Database(DB_PATH);
  _db.pragma('journal_mode = WAL');
  initSchema(_db);
  return _db;
}

function initSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS restaurants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      rank INTEGER NOT NULL,
      name TEXT NOT NULL,
      address TEXT NOT NULL,
      price_range TEXT NOT NULL,
      description TEXT NOT NULL,
      website TEXT,
      phone TEXT,
      note TEXT,
      category TEXT NOT NULL DEFAULT 'traditional',
      tripadvisor_url TEXT,
      score_authenticity INTEGER NOT NULL,
      score_experience INTEGER NOT NULL,
      score_food_quality INTEGER NOT NULL,
      score_exclusivity INTEGER NOT NULL,
      score_value INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS votes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      restaurant_id INTEGER NOT NULL,
      voter_name TEXT NOT NULL,
      vote_type TEXT NOT NULL CHECK(vote_type IN ('up', 'down')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(restaurant_id, voter_name),
      FOREIGN KEY(restaurant_id) REFERENCES restaurants(id)
    );
  `);

  // Migration: add new columns if they don't exist (for existing DBs)
  const cols = db.prepare('PRAGMA table_info(restaurants)').all() as { name: string }[];
  const colNames = cols.map(c => c.name);
  if (!colNames.includes('category')) {
    db.exec("ALTER TABLE restaurants ADD COLUMN category TEXT NOT NULL DEFAULT 'traditional'");
  }
  if (!colNames.includes('tripadvisor_url')) {
    db.exec('ALTER TABLE restaurants ADD COLUMN tripadvisor_url TEXT');
  }

  // Seed if empty
  const count = (db.prepare('SELECT COUNT(*) as c FROM restaurants').get() as { c: number }).c;
  if (count === 0) {
    seedRestaurants(db);
  } else if (count < 18) {
    // Add missing restaurants (dinner+club and lunch)
    addMissingRestaurants(db);
    updateExistingTripadvisor(db);
  } else {
    // Ensure tripadvisor_url is set on existing rows
    updateExistingTripadvisor(db);
  }
}

const TRIPADVISOR_URLS: Record<string, string> = {
  'Secret by Chef Petrov': 'https://www.tripadvisor.com/Restaurant_Review-g294452-d10249063-Reviews-Secret_Chef_Table-Sofia_Sofia_Region.html',
  'Pod Lipite': 'https://www.tripadvisor.com/Restaurant_Review-g294452-d941696-Reviews-Pod_Lipite-Sofia_Sofia_Region.html',
  'Hadjidraganovite Izbi': 'https://www.tripadvisor.com/Search?q=Hadjidraganovite+Izbi+Sofia+Bulgaria',
  'Manastirska Magernitsa': 'https://www.tripadvisor.com/Search?q=Manastirska+Magernitsa+Sofia+Bulgaria',
  'Cosmos': 'https://www.tripadvisor.com/Search?q=Cosmos+Restaurant+Sofia+Bulgaria',
  'Chevermeto': 'https://www.tripadvisor.com/Search?q=Chevermeto+Sofia+Bulgaria',
  'Izbata Tavern': 'https://www.tripadvisor.com/Search?q=Izbata+Tavern+Sofia+Bulgaria',
  'MOMA Bulgarian Food & Wine': 'https://www.tripadvisor.com/Search?q=MOMA+Bulgarian+Food+Wine+Sofia',
  'Raketa Raki': 'https://www.tripadvisor.com/Search?q=Raketa+Raki+Sofia+Bulgaria',
  'Staria Chinar': 'https://www.tripadvisor.com/Search?q=Staria+Chinar+Sofia+Bulgaria',
  'Magnito Piano Bar & Sushi': 'https://www.tripadvisor.com/Search?q=Magnito+Piano+Bar+Sushi+Sofia',
  'Jazu': 'https://www.tripadvisor.com/Search?q=Jazu+Restaurant+Sofia+Bulgaria',
  'Chalga Club': 'https://www.tripadvisor.com/Search?q=Chalga+Club+Sofia+Bulgaria',
  'Sense Rooftop Bar & Restaurant': 'https://www.tripadvisor.com/Search?q=Sense+Rooftop+Bar+Sofia+Bulgaria',
  'La Terrazza di Serdica': 'https://www.tripadvisor.com/Search?q=La+Terrazza+di+Serdica+Sofia+Bulgaria',
  'BojanaVitosha Restaurant': 'https://www.tripadvisor.com/Search?q=BojanaVitosha+Restaurant+Sofia+Bulgaria',
  'National Theatre Restaurant': 'https://www.tripadvisor.com/Search?q=National+Theatre+Restaurant+Sofia+Bulgaria',
  'The Corner Bar & Dinner': 'https://www.tripadvisor.com/Search?q=The+Corner+Bar+Dinner+Sofia+Lozenets',
};

function updateExistingTripadvisor(db: Database.Database) {
  const update = db.prepare('UPDATE restaurants SET tripadvisor_url = ? WHERE name = ? AND (tripadvisor_url IS NULL OR tripadvisor_url = \'\')');
  for (const [name, url] of Object.entries(TRIPADVISOR_URLS)) {
    update.run(url, name);
  }
}

function addMissingRestaurants(db: Database.Database) {
  const existing = (db.prepare('SELECT rank FROM restaurants').all() as { rank: number }[]).map(r => r.rank);
  const newRestaurants = [
    {
      rank: 11,
      name: 'Magnito Piano Bar & Sushi',
      address: 'ul. Lege 8, Sofia Center',
      price_range: '€20–35/person',
      category: 'dinner_club',
      tripadvisor_url: 'https://www.tripadvisor.com/Search?q=Magnito+Piano+Bar+Sushi+Sofia',
      description: "Two-floor venue that starts as a proper restaurant and ends as a full club. Live Bulgarian and international pop bands perform Wednesday–Saturday from 8pm. Sushi and a full food menu until late. Fits 200 people. The vibe shifts from dinner to dancing around midnight — you never have to leave to get the full night.",
      website: null, phone: null,
      note: '🎹 Live bands Wed–Sat · Opens 8pm',
      score_authenticity: 2, score_experience: 5, score_food_quality: 3, score_exclusivity: 3, score_value: 4
    },
    {
      rank: 12,
      name: 'Jazu',
      address: 'Sofia (near Hotel Marinela)',
      price_range: '€25–45/person',
      category: 'dinner_club',
      tripadvisor_url: 'https://www.tripadvisor.com/Search?q=Jazu+Restaurant+Sofia+Bulgaria',
      description: "Upscale Japanese restaurant that regularly features live music and resident DJs, morphing into a sophisticated lounge-club as the evening progresses. Highly recommended by long-term Sofia expats as the best 'dinner that becomes a night out' option. Cocktails, sushi, and Japanese mains. Smart crowd, excellent service.",
      website: null, phone: null,
      note: '🎵 Often has live music — check schedule before going',
      score_authenticity: 2, score_experience: 4, score_food_quality: 5, score_exclusivity: 4, score_value: 3
    },
    {
      rank: 13,
      name: 'Chalga Club',
      address: 'Central Sofia',
      price_range: '€20–30/person',
      category: 'dinner_club',
      tripadvisor_url: 'https://www.tripadvisor.com/Search?q=Chalga+Club+Sofia+Bulgaria',
      description: "'Chalga' is the Balkan pop-folk hybrid — synth beats woven through traditional folk melodies, belly dancers, a crowd in sequins, and music so loud you feel it in your chest. Bulgarians have a complicated love-hate relationship with it, but experiencing it once is unmissable. This is the most quintessentially Sofia night you can have. Dinner + full club show included. Not for the faint-hearted.",
      website: null, phone: null,
      note: "🪗 The most Bulgarian night you'll ever have. Controversial. Unmissable.",
      score_authenticity: 4, score_experience: 5, score_food_quality: 2, score_exclusivity: 1, score_value: 4
    },
    {
      rank: 14,
      name: 'Sense Rooftop Bar & Restaurant',
      address: '16 Tsar Osvoboditel Blvd, Sense Hotel Sofia',
      price_range: '€18–35/person',
      category: 'lunch',
      tripadvisor_url: 'https://www.tripadvisor.com/Search?q=Sense+Rooftop+Bar+Sofia+Bulgaria',
      description: 'The most iconic outdoor spot in Sofia — a rooftop terrace with a direct panoramic view of the Alexander Nevsky Cathedral, one of the largest Orthodox cathedrals in the world. Elegant modern setting, cocktails and food that match the setting. Smart casual dress code. Book ahead on weekends — locals and tourists both know this one.',
      website: null, phone: null,
      note: '👗 Smart casual required · Book ahead on weekends',
      score_authenticity: 2, score_experience: 5, score_food_quality: 4, score_exclusivity: 4, score_value: 3
    },
    {
      rank: 15,
      name: 'La Terrazza di Serdica',
      address: '2 Budapeshta St, Arena di Serdica Hotel',
      price_range: '€15–28/person',
      category: 'lunch',
      tripadvisor_url: 'https://www.tripadvisor.com/Search?q=La+Terrazza+di+Serdica+Sofia+Bulgaria',
      description: "Panoramic rooftop restaurant in the heart of Sofia with sweeping views over the city's most beautiful old rooftops and Vitosha Mountain in the background. Italian-influenced menu in a setting that feels like Rome-meets-Sofia. One of the best architecture views in the city — you can see Roman ruins, Ottoman mosques, and Orthodox domes all in one sweep.",
      website: null, phone: null,
      note: '🏛️ Best architecture panorama in Sofia · Roman ruins visible below',
      score_authenticity: 3, score_experience: 5, score_food_quality: 4, score_exclusivity: 3, score_value: 3
    },
    {
      rank: 16,
      name: 'BojanaVitosha Restaurant',
      address: 'ul. Kumata 75, Boyana district',
      price_range: '€12–25/person',
      category: 'lunch',
      tripadvisor_url: 'https://www.tripadvisor.com/Search?q=BojanaVitosha+Restaurant+Sofia+Bulgaria',
      description: 'Set in the Boyana foothills at the base of Vitosha mountain, this restaurant has a large garden terrace with views directly up into the forested mountain — completely different energy from the city rooftops. Seasonal menu, regional produce, summer terrace under the trees. Perfect if the group wants to escape downtown and feel the mountain. 15 min by taxi from center.',
      website: null, phone: null,
      note: '🏔️ Vitosha mountain backdrop · 15 min from center · Garden terrace',
      score_authenticity: 4, score_experience: 4, score_food_quality: 4, score_exclusivity: 3, score_value: 4
    },
    {
      rank: 17,
      name: 'National Theatre Restaurant',
      address: 'Atop Ivan Vazov National Theatre, 5 Dyakon Ignatiy St',
      price_range: '€14–26/person',
      category: 'lunch',
      tripadvisor_url: 'https://www.tripadvisor.com/Search?q=National+Theatre+Restaurant+Sofia+Bulgaria',
      description: "Sofia's best-kept secret: a restaurant literally on top of the Ivan Vazov National Theatre, Sofia's most beloved landmark. Not a city panorama view — the view IS the theatre itself, surrounded by Belle Époque architecture and the fountain garden below. Barely known to tourists and even many locals. The kind of place that makes you feel like you discovered something.",
      website: null, phone: null,
      note: "🎭 Hidden gem — most locals don't know it exists",
      score_authenticity: 5, score_experience: 5, score_food_quality: 3, score_exclusivity: 5, score_value: 3
    },
    {
      rank: 18,
      name: 'The Corner Bar & Dinner',
      address: '35 Nikola Vaptsarov Blvd, 8th floor, Lozenets',
      price_range: '€15–28/person',
      category: 'lunch',
      tripadvisor_url: 'https://www.tripadvisor.com/Search?q=The+Corner+Bar+Dinner+Sofia+Lozenets',
      description: "8th-floor rooftop terrace at the corner of two major boulevards in the upscale Lozenets district. Breathtaking 360° city views — Vitosha mountain on one side, city skyline on the other. Versatile venue that works for lunch, dinner, and events. Great for a long lazy afternoon with cocktails and good food. Popular with Sofia's business crowd at lunch.",
      website: null, phone: null,
      note: '🌆 360° city + mountain view · Great for a lazy afternoon',
      score_authenticity: 2, score_experience: 4, score_food_quality: 3, score_exclusivity: 3, score_value: 3
    }
  ];

  const insert = db.prepare(`
    INSERT INTO restaurants (rank, name, address, price_range, category, tripadvisor_url, description, website, phone, note,
      score_authenticity, score_experience, score_food_quality, score_exclusivity, score_value)
    VALUES (@rank, @name, @address, @price_range, @category, @tripadvisor_url, @description, @website, @phone, @note,
      @score_authenticity, @score_experience, @score_food_quality, @score_exclusivity, @score_value)
  `);

  for (const r of newRestaurants) {
    if (!existing.includes(r.rank)) {
      insert.run(r);
    }
  }
}

function seedRestaurants(db: Database.Database) {
  const restaurants = [
    {
      rank: 1,
      name: 'Secret by Chef Petrov',
      address: 'Makedonia Blvd 12, Sofia',
      price_range: '€113/person',
      category: 'traditional',
      tripadvisor_url: 'https://www.tripadvisor.com/Restaurant_Review-g294452-d10249063-Reviews-Secret_Chef_Table-Sofia_Sofia_Region.html',
      description: '23-course tasting menu narrated by the chef as a journey through Bulgarian culinary history — from the ancient Thracians to today. One sitting per night, max 12 people, ~4 hours. Chef trained in Spain; co-chef worked at Fat Duck and Waldorf Astoria. Includes 4 wines. Not just a meal — a full theatrical performance.',
      website: 'https://chefpetrov.com/en/',
      phone: '+359 885 111 541',
      note: '⚠️ Book immediately — sells out weeks in advance',
      score_authenticity: 5, score_experience: 5, score_food_quality: 5, score_exclusivity: 5, score_value: 3
    },
    {
      rank: 2,
      name: 'Hadjidraganovite Izbi',
      address: 'Hristo Belchev St 18, Sofia',
      price_range: '€15–25/person',
      category: 'traditional',
      tripadvisor_url: 'https://www.tripadvisor.com/Search?q=Hadjidraganovite+Izbi+Sofia+Bulgaria',
      description: "Medieval wine cellar with stone walls, carved wood, and 18th-century Bulgarian artifacts. Live folk music every evening as part of the atmosphere (not a ticketed show — just the vibe). Regional Bulgarian recipes, big wine list from local vineyards, summer garden. One of the most consistently recommended places by locals.",
      website: null, phone: null, note: null,
      score_authenticity: 5, score_experience: 4, score_food_quality: 4, score_exclusivity: 2, score_value: 4
    },
    {
      rank: 3,
      name: 'Chevermeto',
      address: 'Sofia (central)',
      price_range: '€20–35/person',
      category: 'traditional',
      tripadvisor_url: 'https://www.tripadvisor.com/Search?q=Chevermeto+Sofia+Bulgaria',
      description: "The folkloric dinner show experience. 'Cheverme' is a whole lamb slow-roasted on a spit — a Bulgarian village wedding tradition. Live folk dancers and musicians in full costume perform while you eat. High-energy, communal, loud. Best place to bring a group for 'we're really in Bulgaria' energy.",
      website: null, phone: null,
      note: 'Best for groups — high fun factor',
      score_authenticity: 4, score_experience: 5, score_food_quality: 3, score_exclusivity: 2, score_value: 4
    },
    {
      rank: 4,
      name: 'Pod Lipite',
      address: 'Frederick Joliot-Curie St 1, Sofia',
      price_range: '€15–25/person',
      category: 'traditional',
      tripadvisor_url: 'https://www.tripadvisor.com/Restaurant_Review-g294452-d941696-Reviews-Pod_Lipite-Sofia_Sofia_Region.html',
      description: "The oldest restaurant in Sofia, open since 1926. Named by Bulgarian literary legend Elin Pelin. Designated a Bulgarian Cultural Monument. All food comes from their own farm (cheese, eggs, meat, vegetables). The interior fixtures are literally 90+ years old. Dishes include lamb's head, clay-pot kavarma, legendary chicken soup. Quiet, intellectual, local crowd.",
      website: null, phone: null,
      note: 'Oldest restaurant in Sofia (since 1926) 🏛️',
      score_authenticity: 5, score_experience: 4, score_food_quality: 4, score_exclusivity: 4, score_value: 4
    },
    {
      rank: 5,
      name: 'Manastirska Magernitsa',
      address: 'Han Asparuh St 67, Sofia',
      price_range: '€15–25/person',
      category: 'traditional',
      tripadvisor_url: 'https://www.tripadvisor.com/Search?q=Manastirska+Magernitsa+Sofia+Bulgaria',
      description: 'Every recipe collected from monasteries around Bulgaria — places that preserved medieval cooking during 500 years of Ottoman rule. Guests are welcomed with homemade bread before ordering. Rustic interior with embroidered tablecloths, folk art, carved wood. Specialities: kavarma in clay pots, monastery bean dish, banitsa, stuffed peppers. Enormous portions.',
      website: null, phone: null,
      note: 'Best value on the list 🍞',
      score_authenticity: 5, score_experience: 4, score_food_quality: 4, score_exclusivity: 3, score_value: 5
    },
    {
      rank: 6,
      name: 'Izbata Tavern',
      address: 'Central Sofia',
      price_range: '€15–25/person',
      category: 'traditional',
      tripadvisor_url: 'https://www.tripadvisor.com/Search?q=Izbata+Tavern+Sofia+Bulgaria',
      description: '18 years ago the founders drove across Bulgaria collecting forgotten regional recipes that were disappearing. They assembled a menu from those finds, and they\'ve been serving it since. Artsy local crowd — actors, painters, musicians. Less touristy than the big mehanas, more of a local cult following. Warm and slightly theatrical atmosphere.',
      website: null, phone: null, note: null,
      score_authenticity: 5, score_experience: 4, score_food_quality: 4, score_exclusivity: 4, score_value: 5
    },
    {
      rank: 7,
      name: 'Cosmos',
      address: 'Lavele St 19, Sofia',
      price_range: '€30–50/person',
      category: 'traditional',
      tripadvisor_url: 'https://www.tripadvisor.com/Search?q=Cosmos+Restaurant+Sofia+Bulgaria',
      description: 'Bulgarian cuisine meets molecular gastronomy. Traditional dishes deconstructed and rebuilt beautifully — flaming desserts, cosmic interior design. Tasting menus with exceptional wine pairings. The creative upscale slot: not as exclusive as Chef Petrov but more accessible. Recommended by a 7-year Sofia resident as the best splurge tasting menu in the city.',
      website: null, phone: null, note: null,
      score_authenticity: 3, score_experience: 4, score_food_quality: 5, score_exclusivity: 3, score_value: 3
    },
    {
      rank: 8,
      name: 'MOMA Bulgarian Food & Wine',
      address: 'Central Sofia',
      price_range: '€15–25/person',
      category: 'traditional',
      tripadvisor_url: 'https://www.tripadvisor.com/Search?q=MOMA+Bulgarian+Food+Wine+Sofia',
      description: 'The modern face of Bulgarian cuisine. Each dining hall has a different theme from Bulgarian folk culture. Traditional recipes with a contemporary touch — refined, not deconstructed. Well-regarded for pairing food with region-specific drinks. Slightly more polished than the mehanas. Reservations recommended for dinner.',
      website: null, phone: null,
      note: 'Reservations recommended',
      score_authenticity: 4, score_experience: 3, score_food_quality: 4, score_exclusivity: 2, score_value: 4
    },
    {
      rank: 9,
      name: 'Raketa Raki',
      address: 'Central Sofia (near Sputnik bar)',
      price_range: '€12–20/person',
      category: 'traditional',
      tripadvisor_url: 'https://www.tripadvisor.com/Search?q=Raketa+Raki+Sofia+Bulgaria',
      description: "Soviet-era retro communist décor (name means 'Raki Rocket') with 150 types of rakia — Bulgaria's national spirit — treated like a serious wine list. Modern Bulgarian food alongside. Every foreign guest gets taken here by locals. Pair with a drink at the adjoining Sputnik cocktail bar. This is the late-night spot, not the main dinner.",
      website: null, phone: null,
      note: 'Best late-night spot 🚀',
      score_authenticity: 3, score_experience: 5, score_food_quality: 3, score_exclusivity: 3, score_value: 5
    },
    {
      rank: 10,
      name: 'Staria Chinar',
      address: 'Knyaz Alexander Dondukov Blvd 71, Sofia',
      price_range: '€15–25/person',
      category: 'traditional',
      tripadvisor_url: 'https://www.tripadvisor.com/Search?q=Staria+Chinar+Sofia+Bulgaria',
      description: 'In a historic 1922 building in central Sofia. Famous for the smell of freshly roasted game meats wafting into the street. Traditional Bulgarian recipes, cozy 1920s ambiance. Consistently ranked in Sofia\'s top 15. Strong local following. Good fallback if other places are fully booked.',
      website: null, phone: null, note: null,
      score_authenticity: 4, score_experience: 3, score_food_quality: 4, score_exclusivity: 2, score_value: 4
    },
    {
      rank: 11,
      name: 'Magnito Piano Bar & Sushi',
      address: 'ul. Lege 8, Sofia Center',
      price_range: '€20–35/person',
      category: 'dinner_club',
      tripadvisor_url: 'https://www.tripadvisor.com/Search?q=Magnito+Piano+Bar+Sushi+Sofia',
      description: "Two-floor venue that starts as a proper restaurant and ends as a full club. Live Bulgarian and international pop bands perform Wednesday–Saturday from 8pm. Sushi and a full food menu until late. Fits 200 people. The vibe shifts from dinner to dancing around midnight — you never have to leave to get the full night.",
      website: null, phone: null,
      note: '🎹 Live bands Wed–Sat · Opens 8pm',
      score_authenticity: 2, score_experience: 5, score_food_quality: 3, score_exclusivity: 3, score_value: 4
    },
    {
      rank: 12,
      name: 'Jazu',
      address: 'Sofia (near Hotel Marinela)',
      price_range: '€25–45/person',
      category: 'dinner_club',
      tripadvisor_url: 'https://www.tripadvisor.com/Search?q=Jazu+Restaurant+Sofia+Bulgaria',
      description: "Upscale Japanese restaurant that regularly features live music and resident DJs, morphing into a sophisticated lounge-club as the evening progresses. Highly recommended by long-term Sofia expats as the best 'dinner that becomes a night out' option. Cocktails, sushi, and Japanese mains. Smart crowd, excellent service.",
      website: null, phone: null,
      note: '🎵 Often has live music — check schedule before going',
      score_authenticity: 2, score_experience: 4, score_food_quality: 5, score_exclusivity: 4, score_value: 3
    },
    {
      rank: 13,
      name: 'Chalga Club',
      address: 'Central Sofia',
      price_range: '€20–30/person',
      category: 'dinner_club',
      tripadvisor_url: 'https://www.tripadvisor.com/Search?q=Chalga+Club+Sofia+Bulgaria',
      description: "'Chalga' is the Balkan pop-folk hybrid — synth beats woven through traditional folk melodies, belly dancers, a crowd in sequins, and music so loud you feel it in your chest. Bulgarians have a complicated love-hate relationship with it, but experiencing it once is unmissable. This is the most quintessentially Sofia night you can have. Dinner + full club show included. Not for the faint-hearted.",
      website: null, phone: null,
      note: "🪗 The most Bulgarian night you'll ever have. Controversial. Unmissable.",
      score_authenticity: 4, score_experience: 5, score_food_quality: 2, score_exclusivity: 1, score_value: 4
    },
    {
      rank: 14,
      name: 'Sense Rooftop Bar & Restaurant',
      address: '16 Tsar Osvoboditel Blvd, Sense Hotel Sofia',
      price_range: '€18–35/person',
      category: 'lunch',
      tripadvisor_url: 'https://www.tripadvisor.com/Search?q=Sense+Rooftop+Bar+Sofia+Bulgaria',
      description: 'The most iconic outdoor spot in Sofia — a rooftop terrace with a direct panoramic view of the Alexander Nevsky Cathedral, one of the largest Orthodox cathedrals in the world. Elegant modern setting, cocktails and food that match the setting. Smart casual dress code. Book ahead on weekends — locals and tourists both know this one.',
      website: null, phone: null,
      note: '👗 Smart casual required · Book ahead on weekends',
      score_authenticity: 2, score_experience: 5, score_food_quality: 4, score_exclusivity: 4, score_value: 3
    },
    {
      rank: 15,
      name: 'La Terrazza di Serdica',
      address: '2 Budapeshta St, Arena di Serdica Hotel',
      price_range: '€15–28/person',
      category: 'lunch',
      tripadvisor_url: 'https://www.tripadvisor.com/Search?q=La+Terrazza+di+Serdica+Sofia+Bulgaria',
      description: "Panoramic rooftop restaurant in the heart of Sofia with sweeping views over the city's most beautiful old rooftops and Vitosha Mountain in the background. Italian-influenced menu in a setting that feels like Rome-meets-Sofia. One of the best architecture views in the city — you can see Roman ruins, Ottoman mosques, and Orthodox domes all in one sweep.",
      website: null, phone: null,
      note: '🏛️ Best architecture panorama in Sofia · Roman ruins visible below',
      score_authenticity: 3, score_experience: 5, score_food_quality: 4, score_exclusivity: 3, score_value: 3
    },
    {
      rank: 16,
      name: 'BojanaVitosha Restaurant',
      address: 'ul. Kumata 75, Boyana district',
      price_range: '€12–25/person',
      category: 'lunch',
      tripadvisor_url: 'https://www.tripadvisor.com/Search?q=BojanaVitosha+Restaurant+Sofia+Bulgaria',
      description: 'Set in the Boyana foothills at the base of Vitosha mountain, this restaurant has a large garden terrace with views directly up into the forested mountain — completely different energy from the city rooftops. Seasonal menu, regional produce, summer terrace under the trees. Perfect if the group wants to escape downtown and feel the mountain. 15 min by taxi from center.',
      website: null, phone: null,
      note: '🏔️ Vitosha mountain backdrop · 15 min from center · Garden terrace',
      score_authenticity: 4, score_experience: 4, score_food_quality: 4, score_exclusivity: 3, score_value: 4
    },
    {
      rank: 17,
      name: 'National Theatre Restaurant',
      address: 'Atop Ivan Vazov National Theatre, 5 Dyakon Ignatiy St',
      price_range: '€14–26/person',
      category: 'lunch',
      tripadvisor_url: 'https://www.tripadvisor.com/Search?q=National+Theatre+Restaurant+Sofia+Bulgaria',
      description: "Sofia's best-kept secret: a restaurant literally on top of the Ivan Vazov National Theatre, Sofia's most beloved landmark. Not a city panorama view — the view IS the theatre itself, surrounded by Belle Époque architecture and the fountain garden below. Barely known to tourists and even many locals. The kind of place that makes you feel like you discovered something.",
      website: null, phone: null,
      note: "🎭 Hidden gem — most locals don't know it exists",
      score_authenticity: 5, score_experience: 5, score_food_quality: 3, score_exclusivity: 5, score_value: 3
    },
    {
      rank: 18,
      name: 'The Corner Bar & Dinner',
      address: '35 Nikola Vaptsarov Blvd, 8th floor, Lozenets',
      price_range: '€15–28/person',
      category: 'lunch',
      tripadvisor_url: 'https://www.tripadvisor.com/Search?q=The+Corner+Bar+Dinner+Sofia+Lozenets',
      description: "8th-floor rooftop terrace at the corner of two major boulevards in the upscale Lozenets district. Breathtaking 360° city views — Vitosha mountain on one side, city skyline on the other. Versatile venue that works for lunch, dinner, and events. Great for a long lazy afternoon with cocktails and good food. Popular with Sofia's business crowd at lunch.",
      website: null, phone: null,
      note: '🌆 360° city + mountain view · Great for a lazy afternoon',
      score_authenticity: 2, score_experience: 4, score_food_quality: 3, score_exclusivity: 3, score_value: 3
    }
  ];

  const insert = db.prepare(`
    INSERT INTO restaurants (rank, name, address, price_range, category, tripadvisor_url, description, website, phone, note,
      score_authenticity, score_experience, score_food_quality, score_exclusivity, score_value)
    VALUES (@rank, @name, @address, @price_range, @category, @tripadvisor_url, @description, @website, @phone, @note,
      @score_authenticity, @score_experience, @score_food_quality, @score_exclusivity, @score_value)
  `);

  const insertMany = db.transaction((items: typeof restaurants) => {
    for (const item of items) insert.run(item);
  });

  insertMany(restaurants);
}

export type Restaurant = {
  id: number;
  rank: number;
  name: string;
  address: string;
  price_range: string;
  description: string;
  website: string | null;
  phone: string | null;
  note: string | null;
  category: string;
  tripadvisor_url: string | null;
  score_authenticity: number;
  score_experience: number;
  score_food_quality: number;
  score_exclusivity: number;
  score_value: number;
};

export type Vote = {
  id: number;
  restaurant_id: number;
  voter_name: string;
  vote_type: 'up' | 'down';
};

export type RestaurantWithVotes = Restaurant & {
  votes: Vote[];
  upCount: number;
  downCount: number;
};

export function getAllRestaurantsWithVotes(): RestaurantWithVotes[] {
  const db = getDb();
  const restaurants = db.prepare('SELECT * FROM restaurants ORDER BY rank').all() as Restaurant[];
  const votes = db.prepare('SELECT * FROM votes').all() as Vote[];

  return restaurants.map(r => {
    const restaurantVotes = votes.filter(v => v.restaurant_id === r.id);
    return {
      ...r,
      votes: restaurantVotes,
      upCount: restaurantVotes.filter(v => v.vote_type === 'up').length,
      downCount: restaurantVotes.filter(v => v.vote_type === 'down').length,
    };
  });
}

export function upsertVote(restaurantId: number, voterName: string, voteType: 'up' | 'down') {
  const db = getDb();
  const existing = db.prepare(
    'SELECT * FROM votes WHERE restaurant_id = ? AND voter_name = ?'
  ).get(restaurantId, voterName) as Vote | undefined;

  if (existing) {
    if (existing.vote_type === voteType) {
      // Same vote — remove it (toggle off)
      db.prepare('DELETE FROM votes WHERE id = ?').run(existing.id);
    } else {
      // Different vote — update it
      db.prepare('UPDATE votes SET vote_type = ? WHERE id = ?').run(voteType, existing.id);
    }
  } else {
    db.prepare(
      'INSERT INTO votes (restaurant_id, voter_name, vote_type) VALUES (?, ?, ?)'
    ).run(restaurantId, voterName, voteType);
  }
}
