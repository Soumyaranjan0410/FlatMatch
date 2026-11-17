# FlatMatch

## Quickstart

Works on Windows, macOS, and Linux. You need [Node.js 20 or newer](https://nodejs.org).

1. Unzip `flatmatch.zip`.
2. Open a terminal in that folder (Command Prompt, PowerShell, or Terminal).
3. Run:

```
npm install
npm run dev
```

The first `npm run dev` writes a local `.env` if you do not have one, creates the SQLite database, loads demo profiles for Bengaluru, Pune, Hyderabad, Mumbai, Delhi NCR and Chennai, and starts the app at [http://127.0.0.1:3847](http://127.0.0.1:3847).

Sign in with any Indian mobile number. The code is always `123456`. Or open a demo profile from the welcome screen. Ananya is `9845001001` and already has a chat.

FlatMatch is a mobile-first room and flatmate app for Indian cities. Seekers and listers swipe on people and listings. A chat opens only after a mutual like.

The working name is FlatMatch. A stronger India-facing name, if you rename it later, is **RoomSaathi** — saathi means companion, and it still says what the product is.

## Run it

Requires Node.js 20 or newer.

```bash
npm install
npm run dev
```

`npm run dev` creates the SQLite database, loads the six-city seed data, and starts the app at [http://127.0.0.1:3847](http://127.0.0.1:3847).

Other commands:

```bash
npm test          # compatibility and filter rules
npm run lint
npm run db:seed   # reload demo profiles without restarting
```

## Try the demo

Sign-up uses a mocked one-time code. The code is always **123456**. No SMS or email is sent.

Or skip that and open a seeded profile from the welcome screen:

| Who | Phone | What you'll see |
| --- | --- | --- |
| Ananya Sharma | 9845001001 | Seeker in Koramangala, with a live chat |
| Rohan Mehta | 9845001002 | Lists a 2BHK in Indiranagar |
| Aisha Khan | 9845001009 | Architecture student in Pune |
| Ishaan Kapoor | 9845001012 | Andheri West listing |
| Fatima Sheikh | 9845001015 | Women-only mode on |

Seed accounts can also sign in with `firstname@flatmatch.demo` (for example `ananya@flatmatch.demo`) and the same code.

The verified badge is a **mock DigiLocker-style step**. The only accepted demo number is `1234 1234 1234`, then OTP `123456`. Do not enter a real Aadhaar number. Nothing is sent to UIDAI or DigiLocker.

## After the November 2026 market check

The comparison, with sources, is in [docs/COMPETITION.md](docs/COMPETITION.md). The product changes that came out of it:

- Rent, deposit in months, and brokerage on every room card. A no-brokers pledge shows brokerage as ₹0.
- Broker reports are counted on the card and those people sort to the bottom. The seed includes a Koramangala token listing with two broker reports.
- Phone numbers stay off cards. After a match, sharing a number is a separate button.
- A verified-only filter on the deck.
- Share a visit plan from the chat. The copied note has the time and place, and no phone numbers.
- Office, hybrid, or work-from-home is part of the compatibility score.
- Hyderabad, Delhi NCR and Chennai sit beside Bengaluru, Pune and Mumbai.
- A Hindi toggle for the tab bar, deck, match screen and safety labels.

## What the MVP does

- Phone or email sign-up with a mocked OTP
- Role: seeker, lister, or both
- Profile: photo, age, gender, work or college, city and area, budget in INR, move-in date, and lifestyle tags used in Indian shared flats (veg / eggetarian / non-veg, smoking, drinking, pets, guests, day or night hours, cleanliness, languages)
- Listings: rent and deposit in INR, locality, furnished status, 1/2/3 BHK, PG or co-living, amenities, gender preference, photo
- Swipe deck with drag and buttons, filtered by city, budget, gender and move-in window
- A compatibility score on every card, from the lifestyle answers
- Mutual match screen, then 1:1 chat that polls every few seconds
- Women-only mode: a woman who turns it on only sees women, and men do not see her
- Report, block, and a separate "this is a broker" report
- No-brokers pledge on the profile

## Stack, and why

The UI is **Next.js (App Router) + TypeScript + Tailwind + shadcn/ui**. The screen is a phone-width column with a bottom tab bar, so a later Capacitor or React Native shell can wrap the same flows.

The API is Route Handlers under `src/app/api`. The client never talks to the database. That split is what you would keep if the phone app became native and this server stayed.

Data is **Prisma + SQLite** (`prisma/dev.db`). One file, no account, and `npm run dev` is enough. Moving to Postgres (including Supabase) is a datasource change in `prisma/schema.prisma` plus a new `DATABASE_URL`. The queries do not use SQLite-only SQL.

Chat is polling, not websockets. It is real messages in the database, refreshed every 2.5 seconds, which is enough to prove the match-then-chat path and easy to replace with a socket later.

Sessions are an HMAC cookie (`SESSION_SECRET` in `.env`). This is a local demo secret, not production auth.

## How matching works

`src/lib/matchmaking.ts` scores two lifestyles out of 100. Food is weighted highest, then smoking, drinking, schedule, cleanliness, pets, guests, and shared languages. Veg versus non-veg, and a smoker versus a non-smoker, pulls the score down on purpose.

The deck (`src/lib/deck.ts`) then drops anyone who fails a hard rule:

- city, unless the filter is "all three"
- budget overlap (for a room, the rent has to sit inside the budget)
- listing gender preference
- women-only visibility, enforced on the server even if the client asks otherwise
- move-in window: a room that opens more than 30 days after your date is hidden while that filter is on
- people you already swiped, and anyone on either side of a block

A right swipe matches immediately when the other person already liked you, or when their seed profile is marked as open to liking back. Otherwise the like waits. A pass just hides the card.

## Layout

```
src/app/api          auth, deck, swipe, matches, listings, safety, mock KYC
src/lib/matchmaking  pure scoring and filters (unit tested)
src/lib/deck.ts      who is allowed on the deck
src/lib/swipe-service.ts
prisma/schema.prisma users, listings, swipes, matches, messages, reports, blocks
prisma/seed.ts       Bengaluru, Pune, Hyderabad, Mumbai, Delhi NCR, Chennai
docs/COMPETITION.md  November 2026 competitor notes and sources
public/portraits     illustrated profiles
public/rooms         illustrated flats
```

## Next steps

1. **Real OTP.** Replace `src/app/api/auth/otp` with MSG91 or Firebase Phone Auth. Keep the verify route's session cookie so the rest of the app does not change. Add rate limits and a hashed code instead of the fixed demo code.
2. **Real KYC.** Swap the mock page for DigiLocker via a licensed partner (Setu, IDfy, or Digio). Store only a verification reference and a timestamp, never the Aadhaar number. The badge in the UI can stay.
3. **Payments.** Razorpay for a refundable visit hold or a membership, not for taking the whole deposit inside the app on day one. Keep the "no brokers" pledge as a separate trust signal from the payment.
4. **Push.** Firebase Cloud Messaging once there is a device token. The match and message writes are already the places to enqueue a notification.
5. **Native app.** The screens are a single column with safe-area padding. Capacitor can wrap this web app first. A React Native client can call the same Route Handlers, then replace polling with a small websocket on the match route.

Do not point the demo OTP or the mock Aadhaar step at production users. Both are labelled as mocks in the product.
