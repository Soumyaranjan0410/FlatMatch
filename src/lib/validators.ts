const DIETS = new Set(["veg", "eggetarian", "nonveg"]);
const SMOKING = new Set(["no", "occasionally", "yes"]);
const DRINKING = new Set(["no", "socially", "yes"]);
const PETS = new Set(["no", "ok", "have"]);
const GUESTS = new Set(["rare", "sometimes", "often"]);
const SCHEDULES = new Set(["standard", "hybrid", "night"]);
const ROLES = new Set(["seeker", "lister", "both"]);
const GENDERS = new Set(["woman", "man", "nonbinary"]);
const CITIES = new Set(["Bengaluru", "Pune", "Mumbai"]);
const FLATS = new Set(["1BHK", "2BHK", "3BHK", "PG", "coliving"]);
const FURNISHED = new Set(["furnished", "semi", "unfurnished"]);
const GPREF = new Set(["any", "women", "men"]);

export function normalizeLogin(input: string) {
  const raw = input.trim();
  if (raw.includes("@")) {
    const email = raw.toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null;
    return { loginId: `email:${email}`, phone: "", email, channel: "email" as const };
  }
  let digits = raw.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) digits = digits.slice(2);
  if (digits.length === 11 && digits.startsWith("0")) digits = digits.slice(1);
  if (!/^[6-9]\d{9}$/.test(digits)) return null;
  return { loginId: digits, phone: digits, email: "", channel: "phone" as const };
}

function str(value: unknown, max = 80) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

type Ok<T> = { ok: true; value: T };
type Err = { ok: false; error: string };

export function parseProfile(body: unknown): Ok<{
  name: string;
  age: number;
  gender: string;
  role: string;
  city: string;
  area: string;
  occupation: string;
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
  photo: string;
  womenOnly: boolean;
  noBrokers: boolean;
  onboardingDone: boolean;
}> | Err {
  if (!body || typeof body !== "object") return { ok: false, error: "Missing profile." };
  const data = body as Record<string, unknown>;
  const name = str(data.name, 40);
  const age = Number(data.age);
  const gender = str(data.gender, 20);
  const role = str(data.role, 20);
  const city = str(data.city, 40);
  const area = str(data.area, 60);
  const occupation = str(data.occupation, 80);
  const budgetMin = Number(data.budgetMin);
  const budgetMax = Number(data.budgetMax);
  const moveInDate = str(data.moveInDate, 20);
  const bio = str(data.bio, 400);
  const diet = str(data.diet, 20);
  const smoking = str(data.smoking, 20);
  const drinking = str(data.drinking, 20);
  const pets = str(data.pets, 20);
  const guests = str(data.guests, 20);
  const schedule = str(data.schedule, 20);
  const cleanliness = Number(data.cleanliness);
  const photo = str(data.photo, 200);
  const languages = Array.isArray(data.languages)
    ? data.languages.map((item) => str(item, 20)).filter(Boolean).slice(0, 6)
    : [];

  if (name.length < 2) return { ok: false, error: "Add your name." };
  if (!Number.isInteger(age) || age < 18 || age > 70) return { ok: false, error: "Age should be between 18 and 70." };
  if (!GENDERS.has(gender)) return { ok: false, error: "Choose a gender." };
  if (!ROLES.has(role)) return { ok: false, error: "Choose how you want to use FlatMatch." };
  if (!CITIES.has(city)) return { ok: false, error: "Choose Bengaluru, Pune or Mumbai." };
  if (area.length < 2) return { ok: false, error: "Add your area or neighbourhood." };
  if (occupation.length < 2) return { ok: false, error: "Add your work or college." };
  if (!Number.isFinite(budgetMin) || !Number.isFinite(budgetMax) || budgetMin < 3000 || budgetMax > 200000 || budgetMin > budgetMax) {
    return { ok: false, error: "Set a budget range in rupees." };
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(moveInDate)) return { ok: false, error: "Pick a move-in date." };
  if (!DIETS.has(diet) || !SMOKING.has(smoking) || !DRINKING.has(drinking) || !PETS.has(pets) || !GUESTS.has(guests) || !SCHEDULES.has(schedule)) {
    return { ok: false, error: "Finish the lifestyle questions." };
  }
  if (!Number.isInteger(cleanliness) || cleanliness < 1 || cleanliness > 5) return { ok: false, error: "Set cleanliness from 1 to 5." };
  if (languages.length === 0) return { ok: false, error: "Pick at least one language." };
  if (!photo.startsWith("/portraits/") && !photo.startsWith("/uploads/") && !photo.startsWith("/photos/")) {
    return { ok: false, error: "Choose a photo." };
  }
  const womenOnly = Boolean(data.womenOnly) && gender === "woman";
  const noBrokers = Boolean(data.noBrokers);

  return {
    ok: true as const,
    value: {
      name,
      age,
      gender,
      role,
      city,
      area,
      occupation,
      budgetMin: Math.round(budgetMin),
      budgetMax: Math.round(budgetMax),
      moveInDate,
      bio,
      diet,
      smoking,
      drinking,
      pets,
      guests,
      schedule,
      cleanliness,
      languages: languages.join(","),
      photo,
      womenOnly,
      noBrokers,
      onboardingDone: true,
    },
  };
}

export function parseListing(body: unknown): Ok<{
  title: string;
  description: string;
  rent: number;
  deposit: number;
  city: string;
  locality: string;
  furnished: string;
  flatType: string;
  genderPreference: string;
  availableFrom: string;
  photo: string;
  amenities: string;
  active: boolean;
}> | Err {
  if (!body || typeof body !== "object") return { ok: false, error: "Missing listing." };
  const data = body as Record<string, unknown>;
  const title = str(data.title, 80);
  const description = str(data.description, 600);
  const rent = Number(data.rent);
  const deposit = Number(data.deposit);
  const city = str(data.city, 40);
  const locality = str(data.locality, 60);
  const furnished = str(data.furnished, 20);
  const flatType = str(data.flatType, 20);
  const genderPreference = str(data.genderPreference, 20);
  const availableFrom = str(data.availableFrom, 20);
  const photo = str(data.photo, 200);
  const amenities = Array.isArray(data.amenities)
    ? data.amenities.map((item) => str(item, 30)).filter(Boolean).slice(0, 12)
    : [];
  if (title.length < 4) return { ok: false, error: "Give the room a short title." };
  if (description.length < 10) return { ok: false, error: "Describe the room in a sentence or two." };
  if (!Number.isFinite(rent) || rent < 3000 || rent > 300000) return { ok: false, error: "Enter a monthly rent in rupees." };
  if (!Number.isFinite(deposit) || deposit < 0 || deposit > 1000000) return { ok: false, error: "Enter a deposit amount." };
  if (!CITIES.has(city)) return { ok: false, error: "Choose a city." };
  if (locality.length < 2) return { ok: false, error: "Add the locality." };
  if (!FURNISHED.has(furnished) || !FLATS.has(flatType) || !GPREF.has(genderPreference)) {
    return { ok: false, error: "Finish the flat details." };
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(availableFrom)) return { ok: false, error: "Pick the date the room is free." };
  if (!photo.startsWith("/rooms/") && !photo.startsWith("/uploads/") && !photo.startsWith("/photos/")) {
    return { ok: false, error: "Add a photo of the room." };
  }
  return {
    ok: true,
    value: {
      title,
      description,
      rent: Math.round(rent),
      deposit: Math.round(deposit),
      city,
      locality,
      furnished,
      flatType,
      genderPreference,
      availableFrom,
      photo,
      amenities: amenities.join(","),
      active: true,
    },
  };
}

export function safePhoto(photo: string) {
  return photo.startsWith("/portraits/") || photo.startsWith("/uploads/") || photo.startsWith("/photos/") || photo.startsWith("/rooms/");
}
