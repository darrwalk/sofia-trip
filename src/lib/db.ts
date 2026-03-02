import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_DIR = process.env.DB_DIR || '/tmp/sofia-trip-data';
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}
const DB_PATH = path.join(DB_DIR, 'sofia-trip.db');

let _db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (_db) return _db;
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

  // Seed if empty
  const count = (db.prepare('SELECT COUNT(*) as c FROM restaurants').get() as { c: number }).c;
  if (count === 0) {
    seedRestaurants(db);
  }
}

function seedRestaurants(db: Database.Database) {
  const restaurants = [
    {
      rank: 1,
      name: "Secret by Chef Petrov",
      address: "Makedonia Blvd 12, Sofia",
      price_range: "€113/person",
      description: "23-course tasting menu narrated by the chef as a journey through Bulgarian culinary history — from the ancient Thracians to today. One sitting per night, max 12 people, ~4 hours. Chef trained in Spain; co-chef worked at Fat Duck and Waldorf Astoria. Includes 4 wines. Not just a meal — a full theatrical performance.",
      website: "https://chefpetrov.com/en/",
      phone: "+359 885 111 541",
      note: "⚠️ Book immediately — sells out weeks in advance",
      score_authenticity: 5, score_experience: 5, score_food_quality: 5, score_exclusivity: 5, score_value: 3
    },
    {
      rank: 2,
      name: "Hadjidraganovite Izbi",
      address: "Hristo Belchev St 18, Sofia",
      price_range: "€15–25/person",
      description: "Medieval wine cellar with stone walls, carved wood, and 18th-century Bulgarian artifacts. Live folk music every evening as part of the atmosphere (not a ticketed show — just the vibe). Regional Bulgarian recipes, big wine list from local vineyards, summer garden. One of the most consistently recommended places by locals.",
      website: null, phone: null, note: null,
      score_authenticity: 5, score_experience: 4, score_food_quality: 4, score_exclusivity: 2, score_value: 4
    },
    {
      rank: 3,
      name: "Chevermeto",
      address: "Sofia (central)",
      price_range: "€20–35/person",
      description: "The folkloric dinner show experience. 'Cheverme' is a whole lamb slow-roasted on a spit — a Bulgarian village wedding tradition. Live folk dancers and musicians in full costume perform while you eat. High-energy, communal, loud. Best place to bring a group for 'we're really in Bulgaria' energy.",
      website: null, phone: null,
      note: "Best for groups — high fun factor",
      score_authenticity: 4, score_experience: 5, score_food_quality: 3, score_exclusivity: 2, score_value: 4
    },
    {
      rank: 4,
      name: "Pod Lipite",
      address: "Frederick Joliot-Curie St 1, Sofia",
      price_range: "€15–25/person",
      description: "The oldest restaurant in Sofia, open since 1926. Named by Bulgarian literary legend Elin Pelin. Designated a Bulgarian Cultural Monument. All food comes from their own farm (cheese, eggs, meat, vegetables). The interior fixtures are literally 90+ years old. Dishes include lamb's head, clay-pot kavarma, legendary chicken soup. Quiet, intellectual, local crowd.",
      website: null, phone: null,
      note: "Oldest restaurant in Sofia (since 1926) 🏛️",
      score_authenticity: 5, score_experience: 4, score_food_quality: 4, score_exclusivity: 4, score_value: 4
    },
    {
      rank: 5,
      name: "Manastirska Magernitsa",
      address: "Han Asparuh St 67, Sofia",
      price_range: "€15–25/person",
      description: "Every recipe collected from monasteries around Bulgaria — places that preserved medieval cooking during 500 years of Ottoman rule. Guests are welcomed with homemade bread before ordering. Rustic interior with embroidered tablecloths, folk art, carved wood. Specialities: kavarma in clay pots, monastery bean dish, banitsa, stuffed peppers. Enormous portions.",
      website: null, phone: null,
      note: "Best value on the list 🍞",
      score_authenticity: 5, score_experience: 4, score_food_quality: 4, score_exclusivity: 3, score_value: 5
    },
    {
      rank: 6,
      name: "Izbata Tavern",
      address: "Central Sofia",
      price_range: "€15–25/person",
      description: "18 years ago the founders drove across Bulgaria collecting forgotten regional recipes that were disappearing. They assembled a menu from those finds, and they've been serving it since. Artsy local crowd — actors, painters, musicians. Less touristy than the big mehanas, more of a local cult following. Warm and slightly theatrical atmosphere.",
      website: null, phone: null, note: null,
      score_authenticity: 5, score_experience: 4, score_food_quality: 4, score_exclusivity: 4, score_value: 5
    },
    {
      rank: 7,
      name: "Cosmos",
      address: "Lavele St 19, Sofia",
      price_range: "€30–50/person",
      description: "Bulgarian cuisine meets molecular gastronomy. Traditional dishes deconstructed and rebuilt beautifully — flaming desserts, cosmic interior design. Tasting menus with exceptional wine pairings. The creative upscale slot: not as exclusive as Chef Petrov but more accessible. Recommended by a 7-year Sofia resident as the best splurge tasting menu in the city.",
      website: null, phone: null, note: null,
      score_authenticity: 3, score_experience: 4, score_food_quality: 5, score_exclusivity: 3, score_value: 3
    },
    {
      rank: 8,
      name: "MOMA Bulgarian Food & Wine",
      address: "Central Sofia",
      price_range: "€15–25/person",
      description: "The modern face of Bulgarian cuisine. Each dining hall has a different theme from Bulgarian folk culture. Traditional recipes with a contemporary touch — refined, not deconstructed. Well-regarded for pairing food with region-specific drinks. Slightly more polished than the mehanas. Reservations recommended for dinner.",
      website: null, phone: null,
      note: "Reservations recommended",
      score_authenticity: 4, score_experience: 3, score_food_quality: 4, score_exclusivity: 2, score_value: 4
    },
    {
      rank: 9,
      name: "Raketa Raki",
      address: "Central Sofia (near Sputnik bar)",
      price_range: "€12–20/person",
      description: "Soviet-era retro communist décor (name means 'Raki Rocket') with 150 types of rakia — Bulgaria's national spirit — treated like a serious wine list. Modern Bulgarian food alongside. Every foreign guest gets taken here by locals. Pair with a drink at the adjoining Sputnik cocktail bar. This is the late-night spot, not the main dinner.",
      website: null, phone: null,
      note: "Best late-night spot 🚀",
      score_authenticity: 3, score_experience: 5, score_food_quality: 3, score_exclusivity: 3, score_value: 5
    },
    {
      rank: 10,
      name: "Staria Chinar",
      address: "Knyaz Alexander Dondukov Blvd 71, Sofia",
      price_range: "€15–25/person",
      description: "In a historic 1922 building in central Sofia. Famous for the smell of freshly roasted game meats wafting into the street. Traditional Bulgarian recipes, cozy 1920s ambiance. Consistently ranked in Sofia's top 15. Strong local following. Good fallback if other places are fully booked.",
      website: null, phone: null, note: null,
      score_authenticity: 4, score_experience: 3, score_food_quality: 4, score_exclusivity: 2, score_value: 4
    }
  ];

  const insert = db.prepare(`
    INSERT INTO restaurants (rank, name, address, price_range, description, website, phone, note,
      score_authenticity, score_experience, score_food_quality, score_exclusivity, score_value)
    VALUES (@rank, @name, @address, @price_range, @description, @website, @phone, @note,
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
