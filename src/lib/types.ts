export type Lifestyle = {
  diet: string;
  smoking: string;
  drinking: string;
  pets: string;
  guests: string;
  schedule: string;
  workSetup: string;
  cleanliness: number;
  languages: string[];
};

export type PublicPerson = Lifestyle & {
  id: string;
  name: string;
  age: number;
  gender: string;
  occupation: string;
  city: string;
  area: string;
  budgetMin: number;
  budgetMax: number;
  moveInDate: string;
  bio: string;
  photo: string;
  verified: boolean;
  womenOnly: boolean;
  noBrokers: boolean;
  role: string;
};

export type PublicListing = {
  id: string;
  title: string;
  description: string;
  rent: number;
  deposit: number;
  city: string;
  locality: string;
  furnished: string;
  flatType: string;
  amenities: string[];
  genderPreference: string;
  photo: string;
  availableFrom: string;
};

export type DeckCard = {
  key: string;
  type: "listing" | "person";
  score: number;
  notes: string[];
  brokerReports: number;
  person: PublicPerson;
  listing: PublicListing | null;
  context: string;
};

export type Me = PublicPerson & {
  phone: string;
  email: string;
  matchCount: number;
  listingCount: number;
  onboardingDone: boolean;
};

export type MatchPreview = {
  id: string;
  other: PublicPerson;
  listing: PublicListing | null;
  lastMessage: string;
  lastAt: string;
  blocked: boolean;
};

export type ChatMessage = {
  id: string;
  senderId: string;
  body: string;
  createdAt: string;
  mine: boolean;
};

export type Filters = {
  city: string;
  budgetMin: number;
  budgetMax: number;
  gender: "any" | "woman" | "man";
  moveInStrict: boolean;
  verifiedOnly: boolean;
};
