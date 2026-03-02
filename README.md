# 🇧🇬 Sofia Trip 2026

A beautiful, mobile-friendly travel planning app for a group weekend trip to Sofia, Bulgaria — **May 15–18, 2026**.

## 🌐 Live App

**[sofia-trip.vercel.app](https://sofia-trip.vercel.app)**

## 📸 Features

- **10 curated restaurants** with detailed descriptions and scores
- **5-category scoring system**: Authenticity 🏺 · Experience 🎭 · Food Quality 🍽️ · Exclusivity 🤫 · Value 💰
- **Group voting** — enter your name once (saved in localStorage), then 👍/👎 any restaurant
- **Real-time vote counts** with voter avatar bubbles (initials)
- **Sort**: By rank · Most votes · Authenticity · Experience
- **Filter**: All restaurants · Traditional only (authenticity ≥ 4) · Best shows (experience ≥ 4)
- **Mobile-first** dark mode UI (slate background, gold/amber accents)
- Placeholder tabs for Flights & Itinerary (coming soon)

## 🍽️ The Restaurants

| # | Restaurant | Price | Highlight |
|---|-----------|-------|-----------|
| 1 | Secret by Chef Petrov | €113/person | ⚠️ 23-course theatrical tasting menu, book NOW |
| 2 | Hadjidraganovite Izbi | €15–25 | Medieval wine cellar, live folk music |
| 3 | Chevermeto | €20–35 | Whole lamb on spit + folk dancers |
| 4 | Pod Lipite | €15–25 | Oldest restaurant in Sofia (1926) 🏛️ |
| 5 | Manastirska Magernitsa | €15–25 | Monastery recipes, best value 🍞 |
| 6 | Izbata Tavern | €15–25 | Forgotten regional recipes, artsy crowd |
| 7 | Cosmos | €30–50 | Bulgarian molecular gastronomy |
| 8 | MOMA Bulgarian Food & Wine | €15–25 | Modern Bulgarian, folk-themed halls |
| 9 | Raketa Raki | €12–20 | 150 rakias, Soviet décor, late-night 🚀 |
| 10 | Staria Chinar | €15–25 | 1922 building, roasted game meats |

## 🛠️ Tech Stack

- **[Next.js 14](https://nextjs.org/)** (App Router, React Server Components, Server Actions)
- **[Tailwind CSS](https://tailwindcss.com/)** for styling
- **[better-sqlite3](https://github.com/WiseLibs/better-sqlite3)** for vote persistence
- Deployed on **[Vercel](https://vercel.com)**

## ⚠️ Database Note

This app uses **SQLite via better-sqlite3** stored in `/tmp` on Vercel's serverless functions. This means:
- Votes **persist within a warm Lambda container** but may reset on cold starts
- For production persistence, upgrade to **Vercel Postgres (Neon)** or **Upstash Redis**

See below for upgrade instructions.

## 🚀 Local Development

```bash
git clone https://github.com/darrwalk/sofia-trip.git
cd sofia-trip
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The SQLite database is auto-created at `/tmp/sofia-trip-data/sofia-trip.db` and seeded with all 10 restaurants on first run.

## 🔧 Upgrading to Persistent DB

### Option A: Vercel Postgres (Neon)

```bash
vercel postgres create
```

Then update `src/lib/db.ts` to use `@vercel/postgres` instead of better-sqlite3.

### Option B: Upstash Redis

```bash
npm install @upstash/redis
```

Set env vars: `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`

## 📁 Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout with dark mode
│   ├── page.tsx            # Main page (server component)
│   └── globals.css
├── components/
│   ├── RestaurantCard.tsx  # Individual restaurant card
│   ├── ScoreBar.tsx        # Visual score bars
│   ├── SortFilter.tsx      # Sort/filter controls + grid
│   ├── VoteButtons.tsx     # 👍/👎 voting UI
│   └── VoterBubbles.tsx    # Voter avatar bubbles
└── lib/
    ├── db.ts               # SQLite setup + queries
    └── actions.ts          # Server Action for voting
```

## 👥 Built For

The Sofia crew — Arnd, and friends. Planning the perfect Bulgarian weekend 🌹

---

*Built with ❤️ using Next.js 14 + Tailwind CSS*
