import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { PrismaClient } from "@prisma/client";

function loadEnvFile() {
  const envFile = path.resolve(process.cwd(), ".env");
  if (!existsSync(envFile)) return;
  const text = readFileSync(envFile, "utf8");
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

loadEnvFile();
if (!process.env.DATABASE_URL) process.env.DATABASE_URL = "file:./dev.db";

const prisma = new PrismaClient();

type Person = {
  key: string;
  phone: string;
  name: string;
  age: number;
  gender: string;
  role: string;
  occupation: string;
  city: string;
  area: string;
  budgetMin: number;
  budgetMax: number;
  moveInDate: string;
  bio: string;
  diet: string;
  smoking: string;
  drinking: string;
  pets: string;
  guests: string;
  schedule: string;
  cleanliness: number;
  languages: string;
  verified?: boolean;
  womenOnly?: boolean;
  noBrokers?: boolean;
  likesBack?: boolean;
};

const people: Person[] = [
  {
    key: "ananya", phone: "9845001001", name: "Ananya Sharma", age: 26, gender: "woman", role: "seeker",
    occupation: "Product designer at a fintech", city: "Bengaluru", area: "Koramangala",
    budgetMin: 18000, budgetMax: 28000, moveInDate: "2026-12-05",
    bio: "I cook most weeknights and I'm usually home by eight unless a critique runs long. Looking for a quiet-ish flat in Koramangala, not a party house.",
    diet: "veg", smoking: "no", drinking: "socially", pets: "ok", guests: "sometimes", schedule: "hybrid", cleanliness: 4,
    languages: "Hindi,English,Kannada", verified: true, noBrokers: true,
  },
  {
    key: "rohan", phone: "9845001002", name: "Rohan Mehta", age: 28, gender: "man", role: "lister",
    occupation: "Senior engineer", city: "Bengaluru", area: "Indiranagar",
    budgetMin: 20000, budgetMax: 32000, moveInDate: "2026-11-20",
    bio: "I work from the Indiranagar flat three days a week. The second bedroom opens on the 20th — my current flatmate is moving to Hyderabad.",
    diet: "eggetarian", smoking: "no", drinking: "socially", pets: "no", guests: "rare", schedule: "standard", cleanliness: 4,
    languages: "Hindi,English,Gujarati", verified: true, noBrokers: true, likesBack: true,
  },
  {
    key: "meera", phone: "9845001003", name: "Meera Iyer", age: 24, gender: "woman", role: "seeker",
    occupation: "MSc student, IISc", city: "Bengaluru", area: "Malleshwaram",
    budgetMin: 10000, budgetMax: 16000, moveInDate: "2026-12-10",
    bio: "Lab days run long, so I want somewhere calm near Malleshwaram or Sadashivanagar. I keep a vegetarian kitchen and I'm in by eleven.",
    diet: "veg", smoking: "no", drinking: "no", pets: "no", guests: "rare", schedule: "standard", cleanliness: 5,
    languages: "Tamil,English,Kannada,Hindi", noBrokers: true, likesBack: true,
  },
  {
    key: "kabir", phone: "9845001004", name: "Kabir Hussain", age: 27, gender: "man", role: "seeker",
    occupation: "Support engineer, night shift", city: "Bengaluru", area: "Whitefield",
    budgetMin: 14000, budgetMax: 22000, moveInDate: "2026-12-01",
    bio: "I sleep through the morning after a US shift. Need flatmates who won't mind a quiet afternoon and a late dinner.",
    diet: "nonveg", smoking: "occasionally", drinking: "socially", pets: "no", guests: "sometimes", schedule: "night", cleanliness: 3,
    languages: "Hindi,English,Urdu", noBrokers: true, likesBack: true,
  },
  {
    key: "sneha", phone: "9845001005", name: "Sneha Reddy", age: 25, gender: "woman", role: "both",
    occupation: "Data analyst", city: "Bengaluru", area: "HSR Layout",
    budgetMin: 15000, budgetMax: 24000, moveInDate: "2026-12-01",
    bio: "Sharing a 3BHK in HSR with one flatmate and a very polite cat. I'd like another woman who is fine with pets and a hybrid week.",
    diet: "veg", smoking: "no", drinking: "no", pets: "have", guests: "sometimes", schedule: "hybrid", cleanliness: 4,
    languages: "Telugu,English,Hindi", verified: true, womenOnly: true, noBrokers: true, likesBack: true,
  },
  {
    key: "vikram", phone: "9845001006", name: "Vikram Rao", age: 29, gender: "man", role: "lister",
    occupation: "Engineering manager", city: "Bengaluru", area: "Jayanagar",
    budgetMin: 18000, budgetMax: 28000, moveInDate: "2026-11-28",
    bio: "The master bedroom in our Jayanagar 4th Block flat is free. We cook non-veg on weekends and have people over for cricket.",
    diet: "nonveg", smoking: "no", drinking: "socially", pets: "no", guests: "often", schedule: "standard", cleanliness: 3,
    languages: "Kannada,English,Hindi", noBrokers: true,
  },
  {
    key: "diya", phone: "9845001007", name: "Diya Menon", age: 23, gender: "woman", role: "seeker",
    occupation: "UX intern", city: "Bengaluru", area: "BTM Layout",
    budgetMin: 12000, budgetMax: 18000, moveInDate: "2026-11-28",
    bio: "First job, first flat that isn't a PG if the rent works. I'm easy about food as long as the kitchen stays clean.",
    diet: "eggetarian", smoking: "no", drinking: "no", pets: "no", guests: "rare", schedule: "standard", cleanliness: 4,
    languages: "Malayalam,English,Hindi", noBrokers: true,
  },
  {
    key: "arjun", phone: "9845001008", name: "Arjun Kulkarni", age: 26, gender: "man", role: "lister",
    occupation: "Software engineer", city: "Pune", area: "Baner",
    budgetMin: 14000, budgetMax: 22000, moveInDate: "2026-12-01",
    bio: "Furnished room near Balewadi, ten minutes from the office. Separate shelves in the fridge, and the balcony actually gets sun.",
    diet: "eggetarian", smoking: "no", drinking: "socially", pets: "ok", guests: "sometimes", schedule: "hybrid", cleanliness: 4,
    languages: "Marathi,Hindi,English", verified: true, noBrokers: true, likesBack: true,
  },
  {
    key: "aisha", phone: "9845001009", name: "Aisha Khan", age: 23, gender: "woman", role: "seeker",
    occupation: "Architecture student, BNCA", city: "Pune", area: "Kothrud",
    budgetMin: 12000, budgetMax: 18000, moveInDate: "2026-12-08",
    bio: "Studio deadlines are real, so I need a desk and flatmates who don't mind the smell of fevicol. Eggetarian, home most evenings.",
    diet: "eggetarian", smoking: "no", drinking: "no", pets: "no", guests: "rare", schedule: "standard", cleanliness: 4,
    languages: "Hindi,English,Urdu", noBrokers: true,
  },
  {
    key: "pooja", phone: "9845001010", name: "Pooja Patil", age: 27, gender: "woman", role: "seeker",
    occupation: "School teacher", city: "Pune", area: "Viman Nagar",
    budgetMin: 14000, budgetMax: 20000, moveInDate: "2026-12-15",
    bio: "I leave by 7:30 and I'm back by 4. Looking for a tidy vegetarian flat around Viman Nagar, ideally with other working women.",
    diet: "veg", smoking: "no", drinking: "no", pets: "no", guests: "rare", schedule: "standard", cleanliness: 5,
    languages: "Marathi,Hindi,English", noBrokers: true, likesBack: true,
  },
  {
    key: "neel", phone: "9845001011", name: "Neel Deshpande", age: 24, gender: "man", role: "seeker",
    occupation: "SDE intern", city: "Pune", area: "Hinjewadi",
    budgetMin: 10000, budgetMax: 16000, moveInDate: "2026-11-20",
    bio: "Internship just got extended. I need a bed near Hinjewadi phase 1 and I'm honest: my room will not be spotless.",
    diet: "nonveg", smoking: "occasionally", drinking: "socially", pets: "no", guests: "often", schedule: "hybrid", cleanliness: 2,
    languages: "Marathi,Hindi,English", noBrokers: true,
  },
  {
    key: "ishaan", phone: "9845001012", name: "Ishaan Kapoor", age: 30, gender: "man", role: "lister",
    occupation: "Management consultant", city: "Mumbai", area: "Andheri West",
    budgetMin: 28000, budgetMax: 40000, moveInDate: "2026-12-01",
    bio: "Travel three days a week, so the flat is often empty. Room is an eight-minute walk from Andheri metro. No broker, two months deposit.",
    diet: "nonveg", smoking: "no", drinking: "socially", pets: "no", guests: "rare", schedule: "standard", cleanliness: 4,
    languages: "Hindi,English,Punjabi", verified: true, noBrokers: true, likesBack: true,
  },
  {
    key: "zara", phone: "9845001013", name: "Zara D'Souza", age: 25, gender: "woman", role: "seeker",
    occupation: "Brand marketer", city: "Mumbai", area: "Bandra West",
    budgetMin: 30000, budgetMax: 45000, moveInDate: "2026-12-05",
    bio: "Bandra rents laughed at me. Open to Andheri or Powai if the flat is bright and the flatmates cook. I travel light and talk a lot.",
    diet: "eggetarian", smoking: "no", drinking: "socially", pets: "ok", guests: "sometimes", schedule: "hybrid", cleanliness: 4,
    languages: "English,Hindi", verified: true, noBrokers: true, likesBack: true,
  },
  {
    key: "rahul", phone: "9845001014", name: "Rahul Nair", age: 28, gender: "man", role: "both",
    occupation: "Product manager", city: "Mumbai", area: "Powai",
    budgetMin: 25000, budgetMax: 35000, moveInDate: "2026-12-10",
    bio: "Lake-facing 2BHK, one room free. I might also move if I find the right people closer to Lower Parel.",
    diet: "nonveg", smoking: "no", drinking: "socially", pets: "no", guests: "sometimes", schedule: "standard", cleanliness: 3,
    languages: "Malayalam,English,Hindi", noBrokers: true,
  },
  {
    key: "fatima", phone: "9845001015", name: "Fatima Sheikh", age: 26, gender: "woman", role: "seeker",
    occupation: "Graphic designer", city: "Mumbai", area: "Goregaon East",
    budgetMin: 16000, budgetMax: 24000, moveInDate: "2026-12-01",
    bio: "I keep women-only mode on. Freelance hours, vegetarian kitchen, and I'd like a flat where guests are planned, not constant.",
    diet: "veg", smoking: "no", drinking: "no", pets: "no", guests: "rare", schedule: "hybrid", cleanliness: 5,
    languages: "Hindi,English,Urdu", womenOnly: true, noBrokers: true, likesBack: true,
  },
  {
    key: "nikhil", phone: "9845001016", name: "Nikhil Joshi", age: 27, gender: "man", role: "lister",
    occupation: "CA articleship", city: "Mumbai", area: "Dadar East",
    budgetMin: 12000, budgetMax: 18000, moveInDate: "2026-11-22",
    bio: "A bed just opened in our men's PG near Dadar station. Curfew is soft, the food is vegetarian, and the wifi actually holds a call.",
    diet: "veg", smoking: "no", drinking: "no", pets: "no", guests: "rare", schedule: "standard", cleanliness: 4,
    languages: "Gujarati,Hindi,English", noBrokers: true,
  },
  {
    key: "kavya", phone: "9845001017", name: "Kavya Natarajan", age: 22, gender: "woman", role: "seeker",
    occupation: "Engineering student, PES", city: "Bengaluru", area: "JP Nagar",
    budgetMin: 8000, budgetMax: 14000, moveInDate: "2026-11-25",
    bio: "Final year. I want a women's PG or a shared room in JP Nagar or Jayanagar, close enough to cycle to college.",
    diet: "veg", smoking: "no", drinking: "no", pets: "no", guests: "rare", schedule: "standard", cleanliness: 4,
    languages: "Tamil,Kannada,English", womenOnly: true, noBrokers: true,
  },
  {
    key: "imran", phone: "9845001018", name: "Imran Qureshi", age: 29, gender: "man", role: "lister",
    occupation: "Restaurant manager", city: "Pune", area: "Koregaon Park",
    budgetMin: 18000, budgetMax: 28000, moveInDate: "2026-12-01",
    bio: "I finish service after midnight, so this co-living studio suits someone on a late clock. I smoke, and I'm upfront about that.",
    diet: "nonveg", smoking: "yes", drinking: "socially", pets: "no", guests: "often", schedule: "night", cleanliness: 3,
    languages: "Hindi,English,Urdu", noBrokers: true,
  },
  {
    key: "harpreet", phone: "9845001019", name: "Harpreet Singh", age: 31, gender: "man", role: "lister",
    occupation: "Product ops", city: "Bengaluru", area: "Whitefield",
    budgetMin: 16000, budgetMax: 26000, moveInDate: "2026-11-18",
    bio: "Independent room in a 2BHK. Moti, a very friendly indie, lives here too — please only swipe right if you actually like dogs.",
    diet: "eggetarian", smoking: "no", drinking: "socially", pets: "have", guests: "sometimes", schedule: "standard", cleanliness: 3,
    languages: "Hindi,English,Punjabi", noBrokers: true,
  },
  {
    key: "tanvi", phone: "9845001020", name: "Tanvi Kulkarni", age: 24, gender: "woman", role: "seeker",
    occupation: "Content lead at a D2C brand", city: "Pune", area: "Kalyani Nagar",
    budgetMin: 18000, budgetMax: 26000, moveInDate: "2026-12-12",
    bio: "Moving out of a family place for the first time. Vegetarian, hybrid hours, and I'd like one flatmate who will actually split the groceries.",
    diet: "veg", smoking: "no", drinking: "socially", pets: "ok", guests: "sometimes", schedule: "hybrid", cleanliness: 4,
    languages: "Marathi,English,Hindi", noBrokers: true,
  },
  {
    key: "nandini", phone: "9845001021", name: "Nandini Rao", age: 30, gender: "woman", role: "lister",
    occupation: "Software engineer", city: "Bengaluru", area: "Koramangala",
    budgetMin: 12000, budgetMax: 18000, moveInDate: "2026-11-25",
    bio: "I stay in a small women's PG in 5th Block and a bed just freed up. Owner is a family friend, not a broker. Veg meals included on weekdays.",
    diet: "veg", smoking: "no", drinking: "no", pets: "no", guests: "rare", schedule: "standard", cleanliness: 5,
    languages: "Kannada,Hindi,English", verified: true, womenOnly: true, noBrokers: true, likesBack: true,
  },
];

const listings = [
  {
    seedKey: "indiranagar", owner: "rohan", title: "Sunny room in a 2BHK, Indiranagar",
    description: "Second bedroom on 12th Main, with a wardrobe and a window that isn't a wall. Flatmate is a designer who travels one week a month. Two months deposit, paid to me, not a broker.",
    rent: 26000, deposit: 52000, city: "Bengaluru", locality: "Indiranagar", furnished: "furnished", flatType: "2BHK",
    amenities: "Wi-Fi,AC,Washing machine,Geyser,Fridge,Lift,Security,Balcony", genderPreference: "any",
    photo: "/rooms/indiranagar.svg", availableFrom: "2026-11-20",
  },
  {
    seedKey: "hsr", owner: "sneha", title: "Room in a 3BHK with a cat, HSR",
    description: "Sector 2, women only. Semi-furnished room, shared hall, and a cat named Ilai who sleeps on the sofa and nowhere else if you ask nicely.",
    rent: 18000, deposit: 36000, city: "Bengaluru", locality: "HSR Layout", furnished: "semi", flatType: "3BHK",
    amenities: "Wi-Fi,Washing machine,Geyser,Fridge,Power backup,Lift,Balcony", genderPreference: "women",
    photo: "/rooms/hsr.svg", availableFrom: "2026-12-01",
  },
  {
    seedKey: "jayanagar", owner: "vikram", title: "Master bedroom, Jayanagar 4th Block",
    description: "Attached bath, two other working men in the flat. We're fine with guests on weekends. Society has a lift and a slightly strict watchman.",
    rent: 22000, deposit: 44000, city: "Bengaluru", locality: "Jayanagar", furnished: "furnished", flatType: "3BHK",
    amenities: "Wi-Fi,AC,Washing machine,Geyser,Fridge,Lift,Security,Attached bath,Parking", genderPreference: "any",
    photo: "/rooms/jayanagar.svg", availableFrom: "2026-11-28",
  },
  {
    seedKey: "baner", owner: "arjun", title: "Furnished room, Baner near Balewadi",
    description: "2BHK shared with one engineer. Balcony, covered parking for a bike, and a maid three mornings a week. Direct from me.",
    rent: 17000, deposit: 34000, city: "Pune", locality: "Baner", furnished: "furnished", flatType: "2BHK",
    amenities: "Wi-Fi,Washing machine,Geyser,Fridge,Parking,Balcony,House help", genderPreference: "any",
    photo: "/rooms/baner.svg", availableFrom: "2026-12-01",
  },
  {
    seedKey: "andheri", owner: "ishaan", title: "Room in a 2BHK, Andheri West",
    description: "Eight minutes from the metro. Semi-furnished, AC in the room, deposit is two months. I'm away Monday to Wednesday most weeks.",
    rent: 32000, deposit: 64000, city: "Mumbai", locality: "Andheri West", furnished: "semi", flatType: "2BHK",
    amenities: "Wi-Fi,AC,Washing machine,Geyser,Fridge,Lift,Security", genderPreference: "any",
    photo: "/rooms/andheri.svg", availableFrom: "2026-12-01",
  },
  {
    seedKey: "powai", owner: "rahul", title: "Lake-side room in a Powai 2BHK",
    description: "You can see the lake if you lean. Furnished, two of us now, looking for a third who won't ghost the electricity bill.",
    rent: 30000, deposit: 60000, city: "Mumbai", locality: "Powai", furnished: "furnished", flatType: "2BHK",
    amenities: "Wi-Fi,AC,Washing machine,Geyser,Fridge,Power backup,Lift,Security,Balcony", genderPreference: "any",
    photo: "/rooms/powai.svg", availableFrom: "2026-12-05",
  },
  {
    seedKey: "dadar", owner: "nikhil", title: "Bed in a tidy men's PG, Dadar East",
    description: "Twin sharing, veg meals, walking distance to Dadar station. Deposit is one month. The PG is run by the family that owns the floor, not a brokerage.",
    rent: 15000, deposit: 15000, city: "Mumbai", locality: "Dadar East", furnished: "furnished", flatType: "PG",
    amenities: "Wi-Fi,Geyser,Fridge,Security,House help", genderPreference: "men",
    photo: "/rooms/dadar.svg", availableFrom: "2026-11-22",
  },
  {
    seedKey: "kp", owner: "imran", title: "Co-living studio, Koregaon Park",
    description: "Private studio inside a shared house. Late-night kitchen access. I smoke on the terrace, not indoors. Rent includes wifi and housekeeping.",
    rent: 24000, deposit: 24000, city: "Pune", locality: "Koregaon Park", furnished: "furnished", flatType: "coliving",
    amenities: "Wi-Fi,AC,Washing machine,Geyser,House help,Security", genderPreference: "any",
    photo: "/rooms/kp.svg", availableFrom: "2026-12-01",
  },
  {
    seedKey: "whitefield", owner: "harpreet", title: "Room in a 2BHK with a dog, Whitefield",
    description: "Semi-furnished room near the ITPL side. Moti is an indie, vaccinated, and will sit on your feet. Society allows pets.",
    rent: 20000, deposit: 40000, city: "Bengaluru", locality: "Whitefield", furnished: "semi", flatType: "2BHK",
    amenities: "Wi-Fi,Washing machine,Geyser,Fridge,Power backup,Parking,Balcony", genderPreference: "any",
    photo: "/rooms/whitefield.svg", availableFrom: "2026-11-18",
  },
  {
    seedKey: "koramangala-pg", owner: "nandini", title: "Bed in a women's PG, Koramangala",
    description: "5th Block, women only. Weekday veg meals, wifi, and a geyser that works before 8am if you're second in line. No brokerage.",
    rent: 14000, deposit: 14000, city: "Bengaluru", locality: "Koramangala", furnished: "furnished", flatType: "PG",
    amenities: "Wi-Fi,Geyser,Fridge,Security,House help", genderPreference: "women",
    photo: "/rooms/koramangala-pg.svg", availableFrom: "2026-11-25",
  },
];

const threads = [
  {
    key: "ananya-rohan", a: "ananya", b: "rohan", listing: "indiranagar",
    messages: [
      { from: "rohan", body: "Hey Ananya — the Indiranagar room is still open. My flatmate is a designer too, and she's in Goa one week a month.", hoursAgo: 50 },
      { from: "ananya", body: "That's a good overlap. Is the society strict about guests? I work hybrid and I'm usually home by 8.", hoursAgo: 48 },
      { from: "rohan", body: "Weekend guests are fine. Deposit is two months, paid to me. No broker involved.", hoursAgo: 47 },
      { from: "ananya", body: "Perfect. Could I see it this Saturday late morning?", hoursAgo: 30 },
    ],
  },
  {
    key: "aisha-arjun", a: "aisha", b: "arjun", listing: "baner",
    messages: [
      { from: "arjun", body: "Hi Aisha, saw you're around Kothrud. The Baner room has a balcony and a real desk.", hoursAgo: 26 },
      { from: "aisha", body: "A desk is the whole dream. I'm eggetarian — is sharing the kitchen okay?", hoursAgo: 24 },
      { from: "arjun", body: "We keep separate shelves. Eggetarian is completely fine. Want to visit Thursday after studio?", hoursAgo: 22 },
    ],
  },
  {
    key: "zara-ishaan", a: "zara", b: "ishaan", listing: "andheri",
    messages: [
      { from: "zara", body: "Ishaan, is the Andheri room still free in the first week of December? Bandra finally defeated me.", hoursAgo: 12 },
      { from: "ishaan", body: "It is. I'm in Delhi Mon–Wed, so you'd mostly have the place then. Deposit is two months, direct.", hoursAgo: 10 },
      { from: "zara", body: "Direct is the magic word. I'll swipe through the photos again and message a time.", hoursAgo: 9 },
    ],
  },
];

function pair(a: string, b: string) {
  return a < b ? [a, b] : [b, a];
}

async function main() {
  const ids = new Map<string, string>();

  for (const person of people) {
    const data = {
      loginId: person.phone,
      phone: person.phone,
      email: `${person.key}@flatmatch.demo`,
      name: person.name,
      role: person.role,
      age: person.age,
      gender: person.gender,
      occupation: person.occupation,
      city: person.city,
      area: person.area,
      budgetMin: person.budgetMin,
      budgetMax: person.budgetMax,
      moveInDate: person.moveInDate,
      bio: person.bio,
      diet: person.diet,
      smoking: person.smoking,
      drinking: person.drinking,
      pets: person.pets,
      guests: person.guests,
      schedule: person.schedule,
      cleanliness: person.cleanliness,
      languages: person.languages,
      photo: `/portraits/${person.key}.svg`,
      verified: Boolean(person.verified),
      womenOnly: Boolean(person.womenOnly),
      noBrokers: person.noBrokers !== false,
      likesBack: Boolean(person.likesBack),
      onboardingDone: true,
      isSeed: true,
    };
    const user = await prisma.user.upsert({
      where: { loginId: person.phone },
      update: data,
      create: data,
    });
    ids.set(person.key, user.id);
  }

  const listingIds = new Map<string, string>();
  for (const listing of listings) {
    const userId = ids.get(listing.owner);
    if (!userId) throw new Error(`Missing owner ${listing.owner}`);
    const data = {
      userId,
      title: listing.title,
      description: listing.description,
      rent: listing.rent,
      deposit: listing.deposit,
      city: listing.city,
      locality: listing.locality,
      furnished: listing.furnished,
      flatType: listing.flatType,
      amenities: listing.amenities,
      genderPreference: listing.genderPreference,
      photo: listing.photo,
      availableFrom: listing.availableFrom,
      active: true,
    };
    const saved = await prisma.listing.upsert({
      where: { seedKey: listing.seedKey },
      update: data,
      create: { seedKey: listing.seedKey, ...data },
    });
    listingIds.set(listing.seedKey, saved.id);
  }

  for (const thread of threads) {
    const a = ids.get(thread.a);
    const b = ids.get(thread.b);
    const listingId = listingIds.get(thread.listing) || "";
    if (!a || !b) throw new Error(`Missing thread users ${thread.key}`);
    const [low, high] = pair(a, b);
    const match = await prisma.match.upsert({
      where: { seedKey: thread.key },
      update: { userLowId: low, userHighId: high, listingId },
      create: { seedKey: thread.key, userLowId: low, userHighId: high, listingId },
    });

    await prisma.swipe.upsert({
      where: { swiperId_targetType_targetId: { swiperId: a, targetType: "listing", targetId: listingId } },
      update: { direction: "like" },
      create: { swiperId: a, targetType: "listing", targetId: listingId, direction: "like" },
    });
    await prisma.swipe.upsert({
      where: { swiperId_targetType_targetId: { swiperId: b, targetType: "user", targetId: a } },
      update: { direction: "like" },
      create: { swiperId: b, targetType: "user", targetId: a, direction: "like" },
    });

    for (const [index, message] of thread.messages.entries()) {
      const senderId = ids.get(message.from);
      if (!senderId) continue;
      const createdAt = new Date(Date.now() - message.hoursAgo * 60 * 60 * 1000);
      await prisma.message.upsert({
        where: { seedKey: `${thread.key}-${index}` },
        update: { body: message.body, senderId, matchId: match.id },
        create: {
          seedKey: `${thread.key}-${index}`,
          body: message.body,
          senderId,
          matchId: match.id,
          createdAt,
        },
      });
    }
  }

  console.log(`Seeded ${people.length} people, ${listings.length} listings, ${threads.length} chats.`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
