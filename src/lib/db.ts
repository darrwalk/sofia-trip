import Database from 'better-sqlite3';
import path from 'path';
import { mkdirSync } from 'fs';

const DB_PATH = process.env.DATABASE_PATH || path.join(process.env.DB_DIR || './data', 'sofia.db');

let _db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (_db) return _db;
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
      google_maps_url TEXT,
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

    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      description TEXT NOT NULL,
      date TEXT,
      location TEXT,
      url TEXT,
      map_url TEXT,
      note TEXT
    );

    CREATE TABLE IF NOT EXISTS schedule_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      day TEXT NOT NULL,
      start_time TEXT,
      end_time TEXT,
      category TEXT NOT NULL DEFAULT 'free-time',
      notes TEXT,
      linked_event_id INTEGER,
      linked_restaurant_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(linked_event_id) REFERENCES events(id),
      FOREIGN KEY(linked_restaurant_id) REFERENCES restaurants(id)
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
  if (!colNames.includes('google_maps_url')) {
    db.exec('ALTER TABLE restaurants ADD COLUMN google_maps_url TEXT');
  }

  // Seed restaurants if empty
  const rCount = (db.prepare('SELECT COUNT(*) as c FROM restaurants').get() as { c: number }).c;
  if (rCount === 0) {
    seedRestaurants(db);
  }

  // Seed events if empty
  const eCount = (db.prepare('SELECT COUNT(*) as c FROM events').get() as { c: number }).c;
  if (eCount === 0) {
    seedEvents(db);
  }

  // Seed schedule if empty
  const sCount = (db.prepare('SELECT COUNT(*) as c FROM schedule_items').get() as { c: number }).c;
  if (sCount === 0) {
    seedSchedule(db);
  }
}

function buildGoogleMapsUrl(name: string, address: string) {
  return 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(name + ' ' + address);
}

// ==================== EVENTS ====================

export type EventRow = {
  id: number;
  name: string;
  category: string;
  description: string;
  date: string | null;
  location: string | null;
  url: string | null;
  map_url: string | null;
  note: string | null;
};

export function getAllEvents(): EventRow[] {
  const db = getDb();
  return db.prepare('SELECT * FROM events ORDER BY id').all() as EventRow[];
}

export function getEventById(id: number): EventRow | undefined {
  const db = getDb();
  return db.prepare('SELECT * FROM events WHERE id = ?').get(id) as EventRow | undefined;
}

export function createEvent(data: Omit<EventRow, 'id'>): EventRow {
  const db = getDb();
  const result = db.prepare(`
    INSERT INTO events (name, category, description, date, location, url, map_url, note)
    VALUES (@name, @category, @description, @date, @location, @url, @map_url, @note)
  `).run(data);
  return { id: Number(result.lastInsertRowid), ...data };
}

export function updateEvent(id: number, data: Partial<Omit<EventRow, 'id'>>): EventRow | undefined {
  const db = getDb();
  const existing = getEventById(id);
  if (!existing) return undefined;

  const merged = { ...existing, ...data };
  db.prepare(`
    UPDATE events SET name=@name, category=@category, description=@description,
    date=@date, location=@location, url=@url, map_url=@map_url, note=@note
    WHERE id=@id
  `).run(merged);
  return merged;
}

export function deleteEvent(id: number): boolean {
  const db = getDb();
  const result = db.prepare('DELETE FROM events WHERE id = ?').run(id);
  return result.changes > 0;
}

// ==================== SCHEDULE ====================

export type ScheduleItem = {
  id: number;
  title: string;
  day: string;
  start_time: string | null;
  end_time: string | null;
  category: string;
  notes: string | null;
  linked_event_id: number | null;
  linked_restaurant_id: number | null;
  created_at: string;
};

export type ScheduleItemWithLinked = ScheduleItem & {
  linked_event?: EventRow | null;
  linked_restaurant?: Restaurant | null;
};

export function getAllScheduleItems(): ScheduleItemWithLinked[] {
  const db = getDb();
  const items = db.prepare('SELECT * FROM schedule_items ORDER BY day, start_time, id').all() as ScheduleItem[];
  return items.map(item => {
    const result: ScheduleItemWithLinked = { ...item };
    if (item.linked_event_id) {
      result.linked_event = getEventById(item.linked_event_id) || null;
    }
    if (item.linked_restaurant_id) {
      result.linked_restaurant = getRestaurantById(item.linked_restaurant_id) || null;
    }
    return result;
  });
}

export function getScheduleItemById(id: number): ScheduleItem | undefined {
  const db = getDb();
  return db.prepare('SELECT * FROM schedule_items WHERE id = ?').get(id) as ScheduleItem | undefined;
}

export function createScheduleItem(data: Omit<ScheduleItem, 'id' | 'created_at'>): ScheduleItem {
  const db = getDb();
  const result = db.prepare(`
    INSERT INTO schedule_items (title, day, start_time, end_time, category, notes, linked_event_id, linked_restaurant_id)
    VALUES (@title, @day, @start_time, @end_time, @category, @notes, @linked_event_id, @linked_restaurant_id)
  `).run(data);
  return db.prepare('SELECT * FROM schedule_items WHERE id = ?').get(Number(result.lastInsertRowid)) as ScheduleItem;
}

export function updateScheduleItem(id: number, data: Partial<Omit<ScheduleItem, 'id' | 'created_at'>>): ScheduleItem | undefined {
  const db = getDb();
  const existing = getScheduleItemById(id);
  if (!existing) return undefined;

  const merged = { ...existing, ...data };
  db.prepare(`
    UPDATE schedule_items SET title=@title, day=@day, start_time=@start_time, end_time=@end_time,
    category=@category, notes=@notes, linked_event_id=@linked_event_id, linked_restaurant_id=@linked_restaurant_id
    WHERE id=@id
  `).run(merged);
  return getScheduleItemById(id);
}

export function deleteScheduleItem(id: number): boolean {
  const db = getDb();
  const result = db.prepare('DELETE FROM schedule_items WHERE id = ?').run(id);
  return result.changes > 0;
}

// ==================== RESTAURANTS ====================

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
  google_maps_url: string | null;
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

export function getAllRestaurants(): Restaurant[] {
  const db = getDb();
  return db.prepare('SELECT * FROM restaurants ORDER BY rank').all() as Restaurant[];
}

export function getRestaurantById(id: number): Restaurant | undefined {
  const db = getDb();
  return db.prepare('SELECT * FROM restaurants WHERE id = ?').get(id) as Restaurant | undefined;
}

export function createRestaurant(data: Omit<Restaurant, 'id'>): Restaurant {
  const db = getDb();
  const result = db.prepare(`
    INSERT INTO restaurants (rank, name, address, price_range, description, website, phone, note,
      category, tripadvisor_url, google_maps_url,
      score_authenticity, score_experience, score_food_quality, score_exclusivity, score_value)
    VALUES (@rank, @name, @address, @price_range, @description, @website, @phone, @note,
      @category, @tripadvisor_url, @google_maps_url,
      @score_authenticity, @score_experience, @score_food_quality, @score_exclusivity, @score_value)
  `).run(data);
  return { id: Number(result.lastInsertRowid), ...data };
}

export function updateRestaurant(id: number, data: Partial<Omit<Restaurant, 'id'>>): Restaurant | undefined {
  const db = getDb();
  const existing = getRestaurantById(id);
  if (!existing) return undefined;

  const merged = { ...existing, ...data };
  db.prepare(`
    UPDATE restaurants SET rank=@rank, name=@name, address=@address, price_range=@price_range,
    description=@description, website=@website, phone=@phone, note=@note,
    category=@category, tripadvisor_url=@tripadvisor_url, google_maps_url=@google_maps_url,
    score_authenticity=@score_authenticity, score_experience=@score_experience,
    score_food_quality=@score_food_quality, score_exclusivity=@score_exclusivity, score_value=@score_value
    WHERE id=@id
  `).run(merged);
  return merged;
}

export function deleteRestaurant(id: number): boolean {
  const db = getDb();
  db.prepare('DELETE FROM votes WHERE restaurant_id = ?').run(id);
  const result = db.prepare('DELETE FROM restaurants WHERE id = ?').run(id);
  return result.changes > 0;
}

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
      db.prepare('DELETE FROM votes WHERE id = ?').run(existing.id);
    } else {
      db.prepare('UPDATE votes SET vote_type = ? WHERE id = ?').run(voteType, existing.id);
    }
  } else {
    db.prepare(
      'INSERT INTO votes (restaurant_id, voter_name, vote_type) VALUES (?, ?, ?)'
    ).run(restaurantId, voterName, voteType);
  }
}

// ==================== SEED DATA ====================

function seedSchedule(db: Database.Database) {
  const items = [
    {
      title: "Arnd arrives at SOF (Wizz Air W6 4416)",
      day: "2026-05-15",
      start_time: "12:25",
      end_time: null,
      category: "transport",
      notes: "Nice \u2192 Sofia, confirmation JNC77T",
      linked_event_id: null,
      linked_restaurant_id: null,
    },
    {
      title: "Tinariwen \u2014 Desert Blues Live",
      day: "2026-05-15",
      start_time: "20:00",
      end_time: "23:00",
      category: "concert",
      notes: "NDK Hall 3 \u2014 Tickets from \u043b\u043290 (~\u20ac46). Perfect way to start the trip!",
      linked_event_id: null,
      linked_restaurant_id: null,
    },
  ];

  const insert = db.prepare(`
    INSERT INTO schedule_items (title, day, start_time, end_time, category, notes, linked_event_id, linked_restaurant_id)
    VALUES (@title, @day, @start_time, @end_time, @category, @notes, @linked_event_id, @linked_restaurant_id)
  `);

  const insertMany = db.transaction((rows: typeof items) => {
    for (const row of rows) insert.run(row);
  });

  insertMany(items);
}

function seedEvents(db: Database.Database) {
  const events = [
    { name: 'Skillet', category: 'concert', description: 'American rock band with massive arena production. 20M+ albums sold. High-energy live show with pyrotechnics. Playing the night before you arrive.', date: '2026-05-14', location: 'Arena Armeec Sofia', url: 'https://concerts50.com/show/skillet-in-sofia-tickets-may-14-2026', map_url: 'https://maps.google.com/?q=Arena+Armeec+Sofia', note: 'Thu night \u2014 only if you arrive early. Tickets from \u043b\u0432109 (~\u20ac55).' },
    { name: 'Redman', category: 'concert', description: 'Hip-hop legend. One of the greatest MCs alive \u2014 raw, funny, chaotic live shows. Playing Joy Station the night before you arrive.', date: '2026-05-14', location: 'Joy Station', url: 'https://concerts50.com/show/redman-in-sofia-tickets-may-14-2026', map_url: 'https://maps.google.com/?q=Joy+Station+Sofia', note: 'Thu night. Tickets from \u043b\u0432113 (~\u20ac58). Intimate venue = incredible experience.' },
    { name: 'Tinariwen', category: 'concert', description: 'Desert blues legends from Mali \u2014 hypnotic Saharan guitar grooves. You arrive the same night. Perfect way to start the trip.', date: '2026-05-15', location: 'NDK Hall 3', url: 'https://concerts50.com/show/tinariwen-in-sofia-tickets-may-15-2026', map_url: 'https://maps.google.com/?q=NDK+Hall+3+Sofia', note: 'Tickets from \u043b\u043290 (~\u20ac46). Friday night arrival \u2192 straight to Tinariwen.' },
    { name: 'SoFest 2026 Spring \u2014 Jazz & World Music', category: 'festival', description: 'Multi-day music festival at City Stage. Teodosii Spassov (legendary Bulgarian kaval player) + BalkanAmericana, Miroslav Tadi\u0107 (Bosnian guitar virtuoso), Ostava (beloved indie-rock \u2014 think Bulgarian Radiohead), Marius Kurkinski theatre show. World-class acts in an intimate venue.', date: '2026-05-14', location: 'City Stage, Sofia', url: 'https://programata.bg/muzika/festivali-muzika/sofest-2026-proletno-izdanie/', map_url: null, note: 'Runs May 14\u201317 \u2014 overlaps perfectly with our trip! Check lineup for per-night schedule.' },
    { name: 'Balkan Ruby 2026', category: 'festival', description: 'Ruby programming conference with "hot takes" theme \u2014 held inside the National Museum of Earth and Man, surrounded by 20,000 mineral specimens. Even if you skip the talks, the venue (crystal galleries!) is worth a walk-through.', date: '2026-05-15', location: 'National Museum "Earth and Man", 4 Cherni Vrah Blvd', url: 'https://balkanruby.com/', map_url: 'https://maps.google.com/?q=National+Museum+Earth+and+Man+Sofia', note: 'May 15\u201316. Tech nerds only, but the museum itself is incredible.' },
    { name: 'Gabrovo Carnival', category: 'festival', description: "Bulgaria's famous Carnival of Humor \u2014 the whole town of Gabrovo becomes a massive street party with parades, costumes, satire floats, live music, and absurdist humor. Think Carnival meets Monty Python. One of Bulgaria's most beloved annual events.", date: '2026-05-16', location: 'Gabrovo (2.5h drive from Sofia)', url: 'https://carnival.gabrovo.bg/en/home/', map_url: 'https://maps.google.com/?q=Gabrovo+Bulgaria', note: 'Saturday! Perfect day trip. Gabrovo is also home to the Museum of Humor & Satire.' },
    { name: 'European Museum Night', category: 'festival', description: 'Annual pan-European event \u2014 museums across Bulgaria open their doors for FREE with special evening programs, performances, and installations. A magical night of culture.', date: '2026-05-18', location: 'Museums across Sofia', url: 'https://en.wikipedia.org/wiki/Night_of_Museums', map_url: null, note: 'Monday \u2014 your last evening. Free entry everywhere. Great way to end the trip.' },
    { name: 'Alexander Nevsky Flea Market', category: 'market', description: 'Iconic open-air market right next to the cathedral. Soviet memorabilia, antique icons, communist medals, vintage cameras, handmade jewelry, old maps. THE place for unique souvenirs.', date: null, location: 'Alexander Nevsky Square', url: null, map_url: 'https://maps.google.com/?q=Alexander+Nevsky+Flea+Market+Sofia', note: 'Daily but best on weekends \u2014 bigger selection, more stalls.' },
    { name: "Women's Market (Zhenski Pazar)", category: 'market', description: "Sofia's largest and oldest open-air market. Chaotic, colorful, cheap. Fresh produce, spices, cheese, nuts, household goods. The real Sofia, no filter. Operating since the 1800s.", date: null, location: 'Stefan Stambolov Blvd', url: 'https://maps.google.com/?q=Zhenski+Pazar+Sofia', map_url: 'https://maps.google.com/?q=Zhenski+Pazar+Sofia', note: 'Go in the morning for the full experience. Great for picnic supplies.' },
    { name: 'Central Market Hall (Tsentralni Hali)', category: 'market', description: 'Beautiful neo-Renaissance building from 1911. Indoor food hall with local meats, cheeses, wines, and snacks. Think European market hall vibes. Good for lunch or buying local delicacies.', date: null, location: 'Knyaginya Maria Luiza Blvd', url: 'https://www.tripadvisor.com/Attraction_Review-g294452-d4937710-Reviews-Central_Sofia_Market_Hall-Sofia_Sofia_Region.html', map_url: 'https://maps.google.com/?q=Central+Market+Hall+Sofia', note: null },
    { name: 'Free Walking Tour', category: 'experience', description: "Highly-rated 2-hour guided walk through Sofia's highlights: Roman ruins, Ottoman mosques, Soviet architecture, and Orthodox churches \u2014 all within walking distance. Great way to orient on Day 1.", date: null, location: 'Palace of Justice (meeting point)', url: 'https://freesofiatour.com/', map_url: 'https://maps.google.com/?q=Palace+of+Justice+Sofia', note: 'Runs daily. Tip-based. Also offer Communism Tour & Food Tour.' },
    { name: 'Sofia Pub Crawl', category: 'experience', description: "Guided bar-hopping tour through Sofia's hidden underground bars. Meet other travelers, hear nightlife stories, discover spots you'd never find alone. Includes welcome shots.", date: null, location: null, url: 'https://freesofiatour.com/tour/sofia-pub-crawl/', map_url: null, note: 'Runs most evenings. Good ice-breaker night for the group.' },
    { name: 'Sofia Wine Walk', category: 'experience', description: "Guided tasting walk through Sofia's wine bars and cellars. Bulgaria has incredible and underrated wines \u2014 Mavrud, Gamza, Melnik. Learn the local varietals over 4-5 stops.", date: null, location: null, url: 'https://www.byfood.com/experiences/sofia-wine-walk-29277', map_url: null, note: 'Book in advance. Bulgarian wine is seriously good and ridiculously cheap.' },
    { name: 'Christo & Jean-Claude Exhibition', category: 'experience', description: 'Major exhibition of works by Christo (born in Bulgaria!) and Jean-Claude at Vivacom Art Hall. Wrapped buildings, floating piers, valley curtains \u2014 the large-scale installation artists.', date: null, location: 'Vivacom Art Hall', url: 'https://programata.bg/izlozhbi/izlozhba/new-works-kristo-i-zhan-klod-vav-vivacom-art-hall/', map_url: 'https://maps.google.com/?q=Vivacom+Art+Hall+Sofia', note: 'Christo was Bulgarian \u2014 this is a homecoming show. Check if still running in May.' },
    { name: 'The Scene Rooftop', category: 'rooftop', description: "Sofia's top-rated rooftop. Cathedral views, creative cocktails inspired by Europe & Middle East. On top of Hyatt Regency.", date: null, location: 'Hyatt Regency Sofia', url: 'https://www.tripadvisor.com/Restaurant_Review-g294452-d21232672-Reviews-The_Scene_Rooftop_Bar_Terrace-Sofia_Sofia_Region.html', map_url: 'https://maps.google.com/?q=Hyatt+Regency+Sofia+Rooftop', note: 'Reserve for sunset.' },
    { name: 'Sense Rooftop', category: 'rooftop', description: 'Panoramic terrace with views of Alexander Nevsky Cathedral. Craft cocktails, premium wines, elegant but relaxed.', date: null, location: 'Sense Hotel', url: 'https://www.tripadvisor.com/Attraction_Review-g294452-d4923166-Reviews-Sense_Hotel_Rooftop_Bar-Sofia_Sofia_Region.html', map_url: 'https://maps.google.com/?q=Sense+Hotel+Sofia', note: null },
    { name: 'Ozone Skybar', category: 'rooftop', description: "Sofia's highest bar \u2014 29th floor with 360\u00b0 views over the city and Vitosha Mountain. Modern lounge vibes.", date: null, location: 'Grand Hotel Millennium, 29th floor', url: 'https://www.tripadvisor.com/Restaurant_Review-g294452-d21211664-Reviews-Ozone_Skybar_Lounge-Sofia_Sofia_Region.html', map_url: 'https://maps.google.com/?q=Grand+Hotel+Millennium+Sofia', note: null },
    { name: 'Hambara', category: 'nightlife', description: "THE legendary hidden bar. Candle-lit ancient barn, no sign outside \u2014 find the hidden door. Fantastic cocktails, endless shot creativity.", date: null, location: null, url: 'https://www.tripadvisor.com/Attraction_Review-g294452-d2644403-Reviews-Hambara_Bar-Sofia_Sofia_Region.html', map_url: 'https://maps.google.com/?q=Hambara+Bar+Sofia', note: 'Look for the hidden door on Yanko Sakuzov Blvd.' },
    { name: 'Raketa Rakia Bar', category: 'nightlife', description: "60+ rakia varieties in a Soviet-retro living room. Like drinking in your communist grandma's house. Great food too.", date: null, location: null, url: 'https://www.tripadvisor.com/Restaurant_Review-g294452-d5484891-Reviews-Raketa_Rakia_Bar-Sofia_Sofia_Region.html', map_url: 'https://maps.google.com/?q=Raketa+Rakia+Bar+Sofia', note: 'Try the apple and Williamovka rakias.' },
    { name: 'FOMO Club', category: 'nightlife', description: "Sofia's proper dance club. Electronic beats, late-night energy. Free entry, budget-friendly drinks.", date: null, location: 'Tsar Kaloyan 6', url: 'https://www.tripadvisor.com/Attraction_Review-g294452-d28826303-Reviews-Fomo_The_Club-Sofia_Sofia_Region.html', map_url: 'https://maps.google.com/?q=FOMO+Club+Sofia', note: null },
    { name: 'Yalta Club', category: 'nightlife', description: "LEGENDARY. Sofia's premier techno club since 1959 \u2014 one of Europe's oldest nightclubs. Two rooms: panoramic upstairs + raw underground basement. Ricardo Villalobos, Adam Beyer, Hernan Cattaneo have all played here. The underground room is where the magic happens.", date: null, location: 'bul. Tsar Osvoboditel 20', url: 'https://www.google.com/maps/place/Yalta/@42.6927904,23.3312852', map_url: 'https://maps.google.com/?q=Yalta+Club+Sofia', note: "Entry 10-20 BGN. Often goes until 6 AM. Check FB for that weekend's lineup." },
    { name: 'Kupe', category: 'nightlife', description: "Industrial-chic techno venue. Exposed brick, metal frameworks, atmospheric lighting. Different genres each night. The young, in-the-know crowd's favorite.", date: null, location: 'Slavyanska & Shesti Septemvri', url: 'https://www.google.com/maps/place/KUPE', map_url: 'https://maps.google.com/?q=Kupe+Club+Sofia', note: null },
    { name: 'Bar Petak (Friday Bar)', category: 'nightlife', description: "Running since 2008. Insanely eclectic music: reggae \u2192 funk \u2192 D&B \u2192 trap \u2192 soul in one night. The crowd is genuinely interesting people, not just partiers. Some of the best conversations in Sofia happen here.", date: null, location: 'ul. Stefan Karadzha 1', url: 'https://www.google.com/maps/place/Bar+Friday', map_url: 'https://maps.google.com/?q=Bar+Petak+Sofia', note: 'Opens 11 PM, goes until 4 AM.' },
    { name: 'Chalga Night \u2014 Club 33', category: 'nightlife', description: "You MUST experience chalga \u2014 Bulgaria's unique pop-folk genre. Euro-house beats + Balkan rhythms + powerful vocals. People throw napkins like confetti (it's tradition). Rakia shots flow. Pure chaos. Nothing like it anywhere else in Europe.", date: null, location: 'Studentski Grad', url: 'https://www.google.com/maps/place/Club+33+Sofia', map_url: 'https://maps.google.com/?q=Club+33+Sofia', note: 'This is THE authentic Bulgarian nightlife experience. Opens 11 PM. Embrace the madness.' },
    { name: 'AK-47 Shooting Range', category: 'wild', description: 'Fire Soviet-era weapons in the Bulgarian countryside. AK-47, Glock, shotguns. 200 rounds each. Transport from Sofia included.', date: null, location: null, url: 'https://www.tripadvisor.com/AttractionProductReview-g294452-d17404201-3_Hours_VIP_Shooting_Range_Package-Sofia_Sofia_Region.html', map_url: null, note: '3-hour VIP package \u2022 \u20ac80\u2013120/person.' },
    { name: 'Buzludzha UFO Monument', category: 'wild', description: 'The most insane abandoned building in Europe. Communist flying saucer on a mountain peak. Graffiti-covered, crumbling, utterly surreal.', date: null, location: null, url: 'https://www.atlasobscura.com/places/buzludzha-monument', map_url: 'https://maps.google.com/?q=Buzludzha+Monument+Bulgaria', note: '3h from Sofia \u2022 Hire a 4x4 or join a tour.' },
    { name: 'Secret Police Bunker Tour', category: 'wild', description: 'Walk the tunnels where the communist secret police operated. Underground bunkers, some still classified. The paranoid architecture of a surveillance state.', date: null, location: null, url: 'https://freesofiatour.com/tours/communism-tour/', map_url: null, note: 'Book the extended Communism Tour.' },
    { name: 'Princess Casino', category: 'wild', description: "Bulgaria's best casino. Proper Vegas energy in Eastern Europe. Blackjack, roulette, poker.", date: null, location: null, url: 'https://www.tripadvisor.com/Attraction_Review-g294452-d10506795-Reviews-Princess_Casino_Sofia-Sofia_Sofia_Region.html', map_url: 'https://maps.google.com/?q=Princess+Casino+Sofia', note: 'Open 24/7 \u2022 Smart casual required.' },
    { name: 'Night Club Simona', category: 'wild', description: "Sofia's most-recommended gentlemen's club. Disco lights, full shows, private rooms. The Bulgarian lev makes it very affordable.", date: null, location: 'bul. Cherni Vrah 100', url: 'https://bulgaria-infoguide.com/sofia/night-club-simona/', map_url: null, note: 'Call ahead for groups \u2022 Bottle service available.' },
    { name: 'Mineral Baths Day', category: 'wild', description: 'Sofia sits on natural hot springs. Sapareva Banya (1.5h) has outdoor mineral pools: 103\u00b0F thermal water, ice plunges, saunas. Combine with Rila Monastery.', date: null, location: null, url: 'https://www.getyourguide.com/sapareva-banya-l136373/from-sofia-borovets-resort-and-thermal-bath-day-trip-t409375/', map_url: null, note: 'Book the Rila + Spa combo tour.' },
    { name: 'Alexander Nevsky Cathedral', category: 'landmark', description: "Sofia's icon. Neo-Byzantine cathedral with golden domes, stunning interior. Walk in free, light a candle.", date: null, location: null, url: 'https://www.tripadvisor.com/Attraction_Review-g294452-d547282-Reviews-St_Alexander_Nevski_Cathedral-Sofia_Sofia_Region.html', map_url: 'https://maps.google.com/?q=Alexander+Nevsky+Cathedral+Sofia', note: null },
    { name: 'Boyana Church', category: 'landmark', description: 'UNESCO gem. 13th-century frescoes so detailed they predate the Renaissance masters. Small church, huge impact.', date: null, location: null, url: 'https://www.getyourguide.com/boyana-church-l75415/', map_url: 'https://maps.google.com/?q=Boyana+Church+Sofia', note: 'Book tickets online \u2014 limited entry slots.' },
    { name: 'Vitosha Mountain', category: 'landmark', description: "Sofia's backyard mountain. Gondola up for hiking trails and panoramic views. 30 min from city center. Perfect May weather for hiking.", date: null, location: null, url: 'https://beatthetrail.com/2023/11/13/explore-sofias-back-garden-5-scenic-day-hikes-on-vitosha-mountain/', map_url: 'https://maps.google.com/?q=Vitosha+Gondola+Sofia', note: 'Multiple difficulty levels. Aleko hut is a 2h walk. Check gondola times.' },
    { name: 'Museum of Socialist Art', category: 'museum', description: 'Communist statues, propaganda posters, and Soviet-era art in an outdoor park. Unique and slightly surreal.', date: null, location: null, url: 'https://www.tripadvisor.com/Attraction_Review-g294452-d2463199-Reviews-Museum_of_Socialist_Art-Sofia_Sofia_Region.html', map_url: 'https://maps.google.com/?q=Museum+of+Socialist+Art+Sofia', note: "Don't miss the giant Lenin head." },
    { name: 'National Museum of Military History', category: 'museum', description: "Outdoor yard filled with tanks, jets, artillery from WWI through Cold War. Indoor exhibits on Bulgaria's military history. Surprisingly fascinating.", date: null, location: null, url: 'https://militarymuseum.bg/en/exhibitions/', map_url: 'https://maps.google.com/?q=National+Museum+of+Military+History+Sofia', note: 'Cheap entry, allow 1-2 hours.' },
    { name: 'Rila Monastery', category: 'day_trip', description: "Bulgaria's spiritual heart. UNESCO World Heritage, 10th-century fortress monastery in the mountains. Mind-blowing frescoes.", date: null, location: null, url: 'https://www.tripadvisor.com/Attraction_Review-g1136508-d317916-Reviews-Rila_Monastery-Rila_Sofia_Region.html', map_url: 'https://maps.google.com/?q=Rila+Monastery+Bulgaria', note: '~2h drive from Sofia \u2014 leave early.' },
    { name: 'Seven Rila Lakes Hike', category: 'day_trip', description: "Stunning glacial lakes at 2,500m altitude in the Rila Mountains. Take the chairlift up, hike between pristine alpine lakes. One of Bulgaria's most beautiful natural sites.", date: null, location: null, url: 'https://www.tripadvisor.com/Attraction_Review-g294451-d1785116-Reviews-Seven_Rila_Lakes-Bulgaria.html', map_url: 'https://maps.google.com/?q=Seven+Rila+Lakes+Bulgaria', note: 'Full day trip. Combine with Rila Monastery or do separately. Check if chairlift is running in May.' },
  ];

  const insert = db.prepare(`
    INSERT INTO events (name, category, description, date, location, url, map_url, note)
    VALUES (@name, @category, @description, @date, @location, @url, @map_url, @note)
  `);

  const insertMany = db.transaction((items: typeof events) => {
    for (const item of items) insert.run(item);
  });

  insertMany(events);
}

function seedRestaurants(db: Database.Database) {
  const restaurants = [
    { rank: 1, name: 'Secret by Chef Petrov', address: 'Makedonia Blvd 12, Sofia', price_range: '\u20ac113/person', category: 'traditional', tripadvisor_url: 'https://www.tripadvisor.com/Restaurant_Review-g294452-d10249063-Reviews-Secret_Chef_Table-Sofia_Sofia_Region.html', description: '23-course tasting menu narrated by the chef as a journey through Bulgarian culinary history \u2014 from the ancient Thracians to today. One sitting per night, max 12 people, ~4 hours. Chef trained in Spain; co-chef worked at Fat Duck and Waldorf Astoria. Includes 4 wines. Not just a meal \u2014 a full theatrical performance.', website: 'https://chefpetrov.com/en/', phone: '+359 885 111 541', note: '\u26a0\ufe0f Book immediately \u2014 sells out weeks in advance', score_authenticity: 5, score_experience: 5, score_food_quality: 5, score_exclusivity: 5, score_value: 3 },
    { rank: 2, name: 'Hadjidraganovite Izbi', address: 'Hristo Belchev St 18, Sofia', price_range: '\u20ac15\u201325/person', category: 'traditional', tripadvisor_url: 'https://www.tripadvisor.com/Restaurant_Review-g294452-d2154976-Reviews-Hadjidraganov_s_Cellars-Sofia_Sofia_Region.html', description: 'Medieval wine cellar with stone walls, carved wood, and 18th-century Bulgarian artifacts. Live folk music every evening as part of the atmosphere (not a ticketed show \u2014 just the vibe). Regional Bulgarian recipes, big wine list from local vineyards, summer garden. One of the most consistently recommended places by locals.', website: null, phone: null, note: null, score_authenticity: 5, score_experience: 4, score_food_quality: 4, score_exclusivity: 2, score_value: 4 },
    { rank: 3, name: 'Chevermeto', address: 'Sofia (central)', price_range: '\u20ac20\u201335/person', category: 'traditional', tripadvisor_url: 'https://www.tripadvisor.com/Restaurant_Review-g294452-d691276-Reviews-Chevermeto_Traditional_Bulgarian_Restaurant-Sofia_Sofia_Region.html', description: "The folkloric dinner show experience. 'Cheverme' is a whole lamb slow-roasted on a spit \u2014 a Bulgarian village wedding tradition. Live folk dancers and musicians in full costume perform while you eat. High-energy, communal, loud. Best place to bring a group for 'we're really in Bulgaria' energy.", website: null, phone: null, note: 'Best for groups \u2014 high fun factor', score_authenticity: 4, score_experience: 5, score_food_quality: 3, score_exclusivity: 2, score_value: 4 },
    { rank: 4, name: 'Pod Lipite', address: 'Frederick Joliot-Curie St 1, Sofia', price_range: '\u20ac15\u201325/person', category: 'traditional', tripadvisor_url: 'https://www.tripadvisor.com/Restaurant_Review-g294452-d941696-Reviews-Pod_Lipite-Sofia_Sofia_Region.html', description: "The oldest restaurant in Sofia, open since 1926. Named by Bulgarian literary legend Elin Pelin. Designated a Bulgarian Cultural Monument. All food comes from their own farm (cheese, eggs, meat, vegetables). The interior fixtures are literally 90+ years old. Dishes include lamb's head, clay-pot kavarma, legendary chicken soup. Quiet, intellectual, local crowd.", website: null, phone: null, note: 'Oldest restaurant in Sofia (since 1926) \ud83c\udfdb\ufe0f', score_authenticity: 5, score_experience: 4, score_food_quality: 4, score_exclusivity: 4, score_value: 4 },
    { rank: 5, name: 'Manastirska Magernitsa', address: 'Han Asparuh St 67, Sofia', price_range: '\u20ac15\u201325/person', category: 'traditional', tripadvisor_url: 'https://www.tripadvisor.com/Restaurant_Review-g294452-d809254-Reviews-Manastirska_Magernitsa_Restaurant-Sofia_Sofia_Region.html', description: 'Every recipe collected from monasteries around Bulgaria \u2014 places that preserved medieval cooking during 500 years of Ottoman rule. Guests are welcomed with homemade bread before ordering. Rustic interior with embroidered tablecloths, folk art, carved wood. Specialities: kavarma in clay pots, monastery bean dish, banitsa, stuffed peppers. Enormous portions.', website: null, phone: null, note: 'Best value on the list \ud83c\udf5e', score_authenticity: 5, score_experience: 4, score_food_quality: 4, score_exclusivity: 3, score_value: 5 },
    { rank: 6, name: 'Izbata Tavern', address: 'Central Sofia', price_range: '\u20ac15\u201325/person', category: 'traditional', tripadvisor_url: 'https://www.tripadvisor.com/Restaurant_Review-g294452-d2190234-Reviews-Izbata_Tavern-Sofia_Sofia_Region.html', description: "18 years ago the founders drove across Bulgaria collecting forgotten regional recipes that were disappearing. They assembled a menu from those finds, and they've been serving it since. Artsy local crowd \u2014 actors, painters, musicians. Less touristy than the big mehanas, more of a local cult following. Warm and slightly theatrical atmosphere.", website: null, phone: null, note: null, score_authenticity: 5, score_experience: 4, score_food_quality: 4, score_exclusivity: 4, score_value: 5 },
    { rank: 7, name: 'Cosmos', address: 'Lavele St 19, Sofia', price_range: '\u20ac30\u201350/person', category: 'traditional', tripadvisor_url: 'https://www.tripadvisor.com/Restaurant_Review-g294452-d10136414-Reviews-Cosmos-Sofia_Sofia_Region.html', description: "Bulgarian cuisine meets molecular gastronomy. Traditional dishes deconstructed and rebuilt beautifully \u2014 flaming desserts, cosmic interior design. Tasting menus with exceptional wine pairings. The creative upscale slot: not as exclusive as Chef Petrov but more accessible. Recommended by a 7-year Sofia resident as the best splurge tasting menu in the city.", website: null, phone: null, note: null, score_authenticity: 3, score_experience: 4, score_food_quality: 5, score_exclusivity: 3, score_value: 3 },
    { rank: 8, name: 'MOMA Bulgarian Food & Wine', address: 'Central Sofia', price_range: '\u20ac15\u201325/person', category: 'traditional', tripadvisor_url: 'https://www.tripadvisor.com/Restaurant_Review-g294452-d7220671-Reviews-Moma_Bulgarian_Food_Wine-Sofia_Sofia_Region.html', description: 'The modern face of Bulgarian cuisine. Each dining hall has a different theme from Bulgarian folk culture. Traditional recipes with a contemporary touch \u2014 refined, not deconstructed. Well-regarded for pairing food with region-specific drinks. Slightly more polished than the mehanas. Reservations recommended for dinner.', website: null, phone: null, note: 'Reservations recommended', score_authenticity: 4, score_experience: 3, score_food_quality: 4, score_exclusivity: 2, score_value: 4 },
    { rank: 9, name: 'Raketa Raki', address: 'Central Sofia (near Sputnik bar)', price_range: '\u20ac12\u201320/person', category: 'traditional', tripadvisor_url: 'https://www.tripadvisor.com/Restaurant_Review-g294452-d5484891-Reviews-Raketa_Rakia_Bar-Sofia_Sofia_Region.html', description: "Soviet-era retro communist d\u00e9cor (name means 'Raki Rocket') with 150 types of rakia \u2014 Bulgaria's national spirit \u2014 treated like a serious wine list. Modern Bulgarian food alongside. Every foreign guest gets taken here by locals. Pair with a drink at the adjoining Sputnik cocktail bar. This is the late-night spot, not the main dinner.", website: null, phone: null, note: 'Best late-night spot \ud83d\ude80', score_authenticity: 3, score_experience: 5, score_food_quality: 3, score_exclusivity: 3, score_value: 5 },
    { rank: 10, name: 'Staria Chinar', address: 'Knyaz Alexander Dondukov Blvd 71, Sofia', price_range: '\u20ac15\u201325/person', category: 'traditional', tripadvisor_url: 'https://www.tripadvisor.com/Restaurant_Review-g294452-d11665946-Reviews-Staria_Chinar-Sofia_Sofia_Region.html', description: "In a historic 1922 building in central Sofia. Famous for the smell of freshly roasted game meats wafting into the street. Traditional Bulgarian recipes, cozy 1920s ambiance. Consistently ranked in Sofia's top 15. Strong local following. Good fallback if other places are fully booked.", website: null, phone: null, note: null, score_authenticity: 4, score_experience: 3, score_food_quality: 4, score_exclusivity: 2, score_value: 4 },
    { rank: 11, name: 'Magnito Piano Bar & Sushi', address: 'ul. Lege 8, Sofia Center', price_range: '\u20ac20\u201335/person', category: 'dinner_club', tripadvisor_url: 'https://www.tripadvisor.com/Restaurant_Review-g294452-d19433768-Reviews-Magnito_Piano_Sushi-Sofia_Sofia_Region.html', description: "Two-floor venue that starts as a proper restaurant and ends as a full club. Live Bulgarian and international pop bands perform Wednesday\u2013Saturday from 8pm. Sushi and a full food menu until late. Fits 200 people. The vibe shifts from dinner to dancing around midnight \u2014 you never have to leave to get the full night.", website: null, phone: null, note: '\ud83c\udfb9 Live bands Wed\u2013Sat \u00b7 Opens 8pm', score_authenticity: 2, score_experience: 5, score_food_quality: 3, score_exclusivity: 3, score_value: 4 },
    { rank: 12, name: 'Jazu', address: 'Sofia (near Hotel Marinela)', price_range: '\u20ac25\u201345/person', category: 'dinner_club', tripadvisor_url: 'https://www.tripadvisor.com/Restaurant_Review-g294452-d23675773-Reviews-Jazu_By_Hamachi-Sofia_Sofia_Region.html', description: "Upscale Japanese restaurant that regularly features live music and resident DJs, morphing into a sophisticated lounge-club as the evening progresses. Highly recommended by long-term Sofia expats as the best 'dinner that becomes a night out' option. Cocktails, sushi, and Japanese mains. Smart crowd, excellent service.", website: null, phone: null, note: '\ud83c\udfb5 Often has live music \u2014 check schedule before going', score_authenticity: 2, score_experience: 4, score_food_quality: 5, score_exclusivity: 4, score_value: 3 },
    { rank: 13, name: 'Chalga Club', address: 'Central Sofia', price_range: '\u20ac20\u201330/person', category: 'dinner_club', tripadvisor_url: 'https://www.google.com/maps/search/?api=1&query=Chalga+nightclub+Sofia+Bulgaria', description: "'Chalga' is the Balkan pop-folk hybrid \u2014 synth beats woven through traditional folk melodies, belly dancers, a crowd in sequins, and music so loud you feel it in your chest. Bulgarians have a complicated love-hate relationship with it, but experiencing it once is unmissable. This is the most quintessentially Sofia night you can have. Dinner + full club show included. Not for the faint-hearted.", website: null, phone: null, note: "\ud83eab97 The most Bulgarian night you'll ever have. Controversial. Unmissable.", score_authenticity: 4, score_experience: 5, score_food_quality: 2, score_exclusivity: 1, score_value: 4 },
    { rank: 14, name: 'Sense Rooftop Bar & Restaurant', address: '16 Tsar Osvoboditel Blvd, Sense Hotel Sofia', price_range: '\u20ac18\u201335/person', category: 'lunch', tripadvisor_url: 'https://www.tripadvisor.com/Restaurant_Review-g294452-d7974517-Reviews-Sense_Hotel_Rooftop_Restaurant-Sofia_Sofia_Region.html', description: 'The most iconic outdoor spot in Sofia \u2014 a rooftop terrace with a direct panoramic view of the Alexander Nevsky Cathedral, one of the largest Orthodox cathedrals in the world. Elegant modern setting, cocktails and food that match the setting. Smart casual dress code. Book ahead on weekends \u2014 locals and tourists both know this one.', website: null, phone: null, note: '\ud83d\udc57 Smart casual required \u00b7 Book ahead on weekends', score_authenticity: 2, score_experience: 5, score_food_quality: 4, score_exclusivity: 4, score_value: 3 },
    { rank: 15, name: 'La Terrazza di Serdica', address: '2 Budapeshta St, Arena di Serdica Hotel', price_range: '\u20ac15\u201328/person', category: 'lunch', tripadvisor_url: 'https://www.tripadvisor.com/Restaurant_Review-g294452-d1399883-Reviews-La_Terrazza_di_Serdica_Panorama_Restaurant-Sofia_Sofia_Region.html', description: "Panoramic rooftop restaurant in the heart of Sofia with sweeping views over the city's most beautiful old rooftops and Vitosha Mountain in the background. Italian-influenced menu in a setting that feels like Rome-meets-Sofia. One of the best architecture views in the city \u2014 you can see Roman ruins, Ottoman mosques, and Orthodox domes all in one sweep.", website: null, phone: null, note: '\ud83c\udfdb\ufe0f Best architecture panorama in Sofia \u00b7 Roman ruins visible below', score_authenticity: 3, score_experience: 5, score_food_quality: 4, score_exclusivity: 3, score_value: 3 },
    { rank: 16, name: 'BojanaVitosha Restaurant', address: 'ul. Kumata 75, Boyana district', price_range: '\u20ac12\u201325/person', category: 'lunch', tripadvisor_url: 'https://www.tripadvisor.com/RestaurantsNear-g294452-d319548-Boyana_Church-Sofia_Sofia_Region.html', description: 'Set in the Boyana foothills at the base of Vitosha mountain, this restaurant has a large garden terrace with views directly up into the forested mountain \u2014 completely different energy from the city rooftops. Seasonal menu, regional produce, summer terrace under the trees. Perfect if the group wants to escape downtown and feel the mountain. 15 min by taxi from center.', website: null, phone: null, note: '\ud83c\udfd4\ufe0f Vitosha mountain backdrop \u00b7 15 min from center \u00b7 Garden terrace', score_authenticity: 4, score_experience: 4, score_food_quality: 4, score_exclusivity: 3, score_value: 4 },
    { rank: 17, name: 'National Theatre Restaurant', address: 'Atop Ivan Vazov National Theatre, 5 Dyakon Ignatiy St', price_range: '\u20ac14\u201326/person', category: 'lunch', tripadvisor_url: 'https://www.tripadvisor.com/Restaurant_Review-g294452-d19656993-Reviews-Restaurant_National_theater-Sofia_Sofia_Region.html', description: "Sofia's best-kept secret: a restaurant literally on top of the Ivan Vazov National Theatre, Sofia's most beloved landmark. Not a city panorama view \u2014 the view IS the theatre itself, surrounded by Belle \u00c9poque architecture and the fountain garden below. Barely known to tourists and even many locals. The kind of place that makes you feel like you discovered something.", website: null, phone: null, note: "\ud83c\udfad Hidden gem \u2014 most locals don't know it exists", score_authenticity: 5, score_experience: 5, score_food_quality: 3, score_exclusivity: 5, score_value: 3 },
    { rank: 18, name: 'The Corner Bar & Dinner', address: '35 Nikola Vaptsarov Blvd, 8th floor, Lozenets', price_range: '\u20ac15\u201328/person', category: 'lunch', tripadvisor_url: 'https://www.tripadvisor.com/Restaurant_Review-g294452-d2734385-Reviews-The_Corner_bar_and_grill-Sofia_Sofia_Region.html', description: "8th-floor rooftop terrace at the corner of two major boulevards in the upscale Lozenets district. Breathtaking 360\u00b0 city views \u2014 Vitosha mountain on one side, city skyline on the other. Versatile venue that works for lunch, dinner, and events. Great for a long lazy afternoon with cocktails and good food. Popular with Sofia's business crowd at lunch.", website: null, phone: null, note: '\ud83c\udf06 360\u00b0 city + mountain view \u00b7 Great for a lazy afternoon', score_authenticity: 2, score_experience: 4, score_food_quality: 3, score_exclusivity: 3, score_value: 3 },
    { rank: 19, name: 'Central Market Hall (Halite)', address: 'Maria Luiza Blvd 25, Sofia Center', price_range: '\u20ac1\u20135/item', category: 'snack', tripadvisor_url: 'https://www.tripadvisor.com/Attraction_Review-g294452-d2099464-Reviews-Central_Hall-Sofia_Sofia_Region.html', description: "Sofia's stunning 1909 covered market \u2014 a neoclassical iron-and-glass hall that's the single best place to graze through Bulgarian street food. Inside: banitsa vendors pulling fresh pastries every 20 minutes, kebapche stalls with lyutenitsa spread, Bulgarian cheese by the slice, meze, ayran, and preserved goods. The building itself is worth the visit. Go hungry, snack your way through, leave with cheese.", website: null, phone: null, note: '\ud83c\udfdb\ufe0f Built 1909 \u00b7 The best single stop for all Bulgarian snacks', score_authenticity: 5, score_experience: 4, score_food_quality: 4, score_exclusivity: 2, score_value: 5 },
    { rank: 20, name: 'Sofiyska Banitsa', address: 'Multiple locations \u00b7 nearest: Vitosha Blvd / Slaveykov Square', price_range: '\u20ac0.50\u20131.50/piece', category: 'snack', tripadvisor_url: 'https://www.tripadvisor.com/Restaurant_Review-g294452-d28252341-Reviews-Sofiyska_Banitsa-Sofia_Sofia_Region.html', description: "Banitsa is Bulgaria's answer to breakfast, hangover cure, and mid-afternoon crisis \u2014 all in one flakey, cheese-filled pastry. Sofiyska Banitsa is the beloved local chain that does it best: crispy filo layered with eggs and sirene cheese, pulled hot from the oven every few minutes. Order the classic sirene (cheese), ask for a cup of boza (fermented malt drink, acquired taste) or ayran to wash it down. \u20ac0.80 and you're set for two hours.", website: null, phone: null, note: "\ud83e\udd50 Bulgaria's national snack \u00b7 Get it fresh, eat it standing up", score_authenticity: 5, score_experience: 3, score_food_quality: 4, score_exclusivity: 1, score_value: 5 },
    { rank: 21, name: 'Kebapche on Vitosha Blvd', address: 'Vitosha Boulevard (pedestrian zone), Sofia Center', price_range: '\u20ac1\u20133/portion', category: 'snack', tripadvisor_url: 'https://www.google.com/maps/search/?api=1&query=kebab+street+food+Vitosha+Boulevard+Sofia', description: "Walk the length of Vitosha, Sofia's main pedestrian boulevard, and you'll smell it before you see it \u2014 charcoal-grilled kebapche (spiced minced-meat sausages) at a dozen street stalls. Order a portion: three kebapche, a lump of lyutenitsa (roasted pepper-tomato spread), and a hunk of bread. Eat standing at the counter. Cost: about \u20ac2. This is 'the taste of Bulgaria' as every local will tell you. Pair with a cold Zagorka from the stand next door.", website: null, phone: null, note: '\ud83d\udd25 Eat standing \u00b7 Pair with cold Zagorka beer \u00b7 \u20ac2 total', score_authenticity: 5, score_experience: 3, score_food_quality: 4, score_exclusivity: 1, score_value: 5 },
    { rank: 22, name: 'Hambara', address: 'ul. 6-ti Septemvri 22 (hidden backyard)', price_range: '\u20ac3\u20138/drink', category: 'bar', tripadvisor_url: 'https://www.tripadvisor.com/Attraction_Review-g294452-d2644403-Reviews-Hambara_Bar-Sofia_Sofia_Region.html', description: "The most atmospheric bar in Sofia \u2014 and possibly in the Balkans. No sign. No electricity. Lit only by hundreds of candles. During Communist times this was the secret gathering place of Sofia's intellectual elite \u2014 philosophers, artists, and writers who came to speak freely. Today you still knock on the door (no app, no list \u2014 just knock and wait). Inside: two candlelit levels, medieval-barn-meets-hipster vibe, live music, creative shots. Finding it is half the experience.", website: null, phone: null, note: "\ud83d\udd6f\ufe0f No sign, no electricity \u00b7 Knock on the unmarked door \u00b7 Don't miss", score_authenticity: 5, score_experience: 5, score_food_quality: 2, score_exclusivity: 5, score_value: 4 },
    { rank: 23, name: '5L Speakeasy Bar', address: 'ul. Tsar Shishman 15, Sofia Center', price_range: '\u20ac4\u20139/drink', category: 'bar', tripadvisor_url: 'https://www.tripadvisor.com/Attraction_Review-g294452-d12350184-Reviews-5L_Speakeasy_Bar-Sofia_Sofia_Region.html', description: "Enter if you can. The door is locked \u2014 a ring of keys hangs nearby and you need to figure out which one opens it (no spoilers). Inside: prohibition-era d\u00e9cor, dark wood, mood lighting, two levels. The cocktail menu is exceptional \u2014 some of Sofia's best mixologists work here. Summer brings a rooftop terrace. Located on Tsar Shishman street, which is basically Sofia's best bar-hopping strip. Go early (from 4pm) to get a table.", website: null, phone: null, note: '\ud83d\udddd\ufe0f Solve the key puzzle to enter \u00b7 Best cocktails in Sofia', score_authenticity: 3, score_experience: 5, score_food_quality: 2, score_exclusivity: 4, score_value: 3 },
    { rank: 24, name: 'KANAAL Craft Beer Bar', address: 'ul. Tsar Shishman 12 area, Sofia Center', price_range: '\u20ac2\u20135/beer', category: 'bar', tripadvisor_url: 'https://www.tripadvisor.com/Restaurant_Review-g294452-d4054726-Reviews-Kanaal-Sofia_Sofia_Region.html', description: "Sofia's original craft beer bar, open since 2011 \u2014 way before craft beer was cool in Bulgaria. 20+ taps rotating local and international craft brews, knowledgeable staff who actually love beer, unpretentious atmosphere. This is where Sofia's craft beer community was born. Outdoor terrace in summer. If you want to have a proper afternoon beer session and explore Bulgarian craft brewing, this is the place.", website: null, phone: null, note: "\ud83c\udf7b Sofia's original craft beer spot since 2011 \u00b7 20+ taps", score_authenticity: 4, score_experience: 4, score_food_quality: 3, score_exclusivity: 3, score_value: 5 },
    { rank: 25, name: 'One More Bar', address: 'ul. Tsar Shishman 12, Sofia Center', price_range: '\u20ac2\u20137/drink', category: 'bar', tripadvisor_url: 'https://www.tripadvisor.com/Restaurant_Review-g294452-d3254611-Reviews-One_More_Bar-Sofia_Sofia_Region.html', description: "Named after what you'll keep saying all night. A former kindergarten turned beloved neighbourhood bar \u2014 street terrace in summer, warm interior in winter, great cocktails and an extensive beer and wine list. Located on Tsar Shishman, the best nightlife street in Sofia, right next to 5L Speakeasy. Start here from 8:30pm with a cocktail, then puzzle your way into 5L next door. The definition of a good first stop.", website: null, phone: null, note: '\ud83c\udfeb Former kindergarten \u00b7 Perfect first stop on Tsar Shishman strip', score_authenticity: 3, score_experience: 4, score_food_quality: 3, score_exclusivity: 3, score_value: 4 },
  ];

  const insert = db.prepare(`
    INSERT INTO restaurants (rank, name, address, price_range, category, tripadvisor_url, google_maps_url, description, website, phone, note,
      score_authenticity, score_experience, score_food_quality, score_exclusivity, score_value)
    VALUES (@rank, @name, @address, @price_range, @category, @tripadvisor_url, @google_maps_url, @description, @website, @phone, @note,
      @score_authenticity, @score_experience, @score_food_quality, @score_exclusivity, @score_value)
  `);

  const insertMany = db.transaction((items: typeof restaurants) => {
    for (const item of items) insert.run({ ...item, google_maps_url: buildGoogleMapsUrl(item.name, item.address) });
  });

  insertMany(restaurants);
}
