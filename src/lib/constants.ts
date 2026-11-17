export const CITIES = ["Bengaluru", "Pune", "Hyderabad", "Mumbai", "Delhi NCR", "Chennai"] as const;

export const AREAS: Record<(typeof CITIES)[number], string[]> = {
  Bengaluru: ["Koramangala", "Indiranagar", "HSR Layout", "Whitefield", "Jayanagar", "BTM Layout", "JP Nagar", "Malleshwaram"],
  Pune: ["Kothrud", "Baner", "Viman Nagar", "Hinjewadi", "Koregaon Park", "Kalyani Nagar"],
  Hyderabad: ["Gachibowli", "Madhapur", "Kondapur", "Hitech City"],
  Mumbai: ["Andheri West", "Bandra West", "Powai", "Goregaon East", "Dadar East", "Lower Parel"],
  "Delhi NCR": ["Gurugram", "Noida", "Dwarka", "Hauz Khas"],
  Chennai: ["Adyar", "OMR", "Velachery", "T Nagar"],
};

export const ROLES = [
  { id: "seeker", title: "Find a room", copy: "I'm looking for a place, a flatmate, or both." },
  { id: "lister", title: "List a room", copy: "I have a vacancy and want to choose who moves in." },
  { id: "both", title: "A bit of both", copy: "I might list my room and I'm open to moving." },
] as const;

export const GENDERS = [
  { id: "woman", label: "Woman" },
  { id: "man", label: "Man" },
  { id: "nonbinary", label: "Non-binary" },
] as const;

export const DIETS = [
  { id: "veg", label: "Vegetarian" },
  { id: "eggetarian", label: "Eggetarian" },
  { id: "nonveg", label: "Non-vegetarian" },
] as const;

export const SMOKING = [
  { id: "no", label: "No" },
  { id: "occasionally", label: "Occasionally" },
  { id: "yes", label: "Yes" },
] as const;

export const DRINKING = [
  { id: "no", label: "No" },
  { id: "socially", label: "Socially" },
  { id: "yes", label: "Yes" },
] as const;

export const PETS = [
  { id: "no", label: "No pets" },
  { id: "ok", label: "Pets are ok" },
  { id: "have", label: "I have pets" },
] as const;

export const GUESTS = [
  { id: "rare", label: "Rarely" },
  { id: "sometimes", label: "Sometimes" },
  { id: "often", label: "Often" },
] as const;

export const SCHEDULES = [
  { id: "standard", label: "Daytime" },
  { id: "hybrid", label: "Hybrid" },
  { id: "night", label: "Night shift" },
] as const;

export const WORK_SETUPS = [
  { id: "office", label: "Office" },
  { id: "hybrid", label: "Hybrid" },
  { id: "wfh", label: "Work from home" },
] as const;

export const LANGUAGES = [
  "Hindi",
  "English",
  "Kannada",
  "Marathi",
  "Tamil",
  "Telugu",
  "Malayalam",
  "Bengali",
  "Gujarati",
  "Punjabi",
  "Urdu",
] as const;

export const AMENITIES = [
  "Wi-Fi",
  "AC",
  "Washing machine",
  "Geyser",
  "Fridge",
  "Power backup",
  "Lift",
  "Parking",
  "Security",
  "Balcony",
  "Attached bath",
  "House help",
] as const;

export const FLAT_TYPES = [
  { id: "1BHK", label: "1 BHK" },
  { id: "2BHK", label: "2 BHK" },
  { id: "3BHK", label: "3 BHK" },
  { id: "PG", label: "PG" },
  { id: "coliving", label: "Co-living" },
] as const;

export const FURNISHED = [
  { id: "furnished", label: "Furnished" },
  { id: "semi", label: "Semi-furnished" },
  { id: "unfurnished", label: "Unfurnished" },
] as const;

export const GENDER_PREFS = [
  { id: "any", label: "Anyone" },
  { id: "women", label: "Women" },
  { id: "men", label: "Men" },
] as const;

export const PRESET_PORTRAITS = [
  "/portraits/preset1.svg",
  "/portraits/preset2.svg",
  "/portraits/preset3.svg",
  "/portraits/preset4.svg",
  "/portraits/preset5.svg",
  "/portraits/preset6.svg",
  "/portraits/preset7.svg",
  "/portraits/preset8.svg",
] as const;

export const ROOM_PRESETS = [
  "/rooms/indiranagar.svg",
  "/rooms/hsr.svg",
  "/rooms/baner.svg",
  "/rooms/andheri.svg",
  "/rooms/powai.svg",
  "/rooms/koramangala-pg.svg",
] as const;

export const DEMO_ACCOUNTS = [
  { loginId: "9845001001", name: "Ananya", role: "Seeker", city: "Bengaluru", blurb: "Has a live chat with Rohan" },
  { loginId: "9845001002", name: "Rohan", role: "Lister", city: "Bengaluru", blurb: "2BHK in Indiranagar" },
  { loginId: "9845001009", name: "Aisha", role: "Seeker", city: "Pune", blurb: "Student, matched in Baner" },
  { loginId: "9845001012", name: "Ishaan", role: "Lister", city: "Mumbai", blurb: "Andheri West, verified" },
  { loginId: "9845001015", name: "Fatima", role: "Seeker", city: "Mumbai", blurb: "Women-only mode on" },
] as const;

export const DEMO_OTP = "123456";
export const DEMO_AADHAAR = "123412341234";

export const ICEBREAKERS = [
  "Is the room still available?",
  "How many people live there now?",
  "Would a weekday evening visit work?",
  "Is this direct, with no broker?",
];
