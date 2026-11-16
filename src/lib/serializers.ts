import type { Listing, User } from "@prisma/client";
import type { ChatMessage, Lifestyle, MatchPreview, Me, PublicListing, PublicPerson } from "./types";

export function splitList(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function lifestyleOf(user: User): Lifestyle {
  return {
    diet: user.diet,
    smoking: user.smoking,
    drinking: user.drinking,
    pets: user.pets,
    guests: user.guests,
    schedule: user.schedule,
    cleanliness: user.cleanliness,
    languages: splitList(user.languages),
  };
}

export function toPerson(user: User): PublicPerson {
  return {
    id: user.id,
    name: user.name,
    age: user.age,
    gender: user.gender,
    occupation: user.occupation,
    city: user.city,
    area: user.area,
    budgetMin: user.budgetMin,
    budgetMax: user.budgetMax,
    moveInDate: user.moveInDate,
    bio: user.bio,
    photo: user.photo,
    verified: user.verified,
    womenOnly: user.womenOnly,
    noBrokers: user.noBrokers,
    role: user.role,
    ...lifestyleOf(user),
  };
}

export function toMe(user: User, matchCount: number, listingCount: number): Me {
  return {
    ...toPerson(user),
    phone: user.phone,
    email: user.email,
    matchCount,
    listingCount,
    onboardingDone: user.onboardingDone,
  };
}

export function toListing(listing: Listing): PublicListing {
  return {
    id: listing.id,
    title: listing.title,
    description: listing.description,
    rent: listing.rent,
    deposit: listing.deposit,
    city: listing.city,
    locality: listing.locality,
    furnished: listing.furnished,
    flatType: listing.flatType,
    amenities: splitList(listing.amenities),
    genderPreference: listing.genderPreference,
    photo: listing.photo,
    availableFrom: listing.availableFrom,
  };
}

export function toMessage(message: { id: string; senderId: string; body: string; createdAt: Date }, meId: string): ChatMessage {
  return {
    id: message.id,
    senderId: message.senderId,
    body: message.body,
    createdAt: message.createdAt.toISOString(),
    mine: message.senderId === meId,
  };
}

export function toMatchPreview(
  id: string,
  other: User,
  listing: Listing | null,
  lastMessage: string,
  lastAt: Date,
  blocked: boolean,
): MatchPreview {
  return {
    id,
    other: toPerson(other),
    listing: listing ? toListing(listing) : null,
    lastMessage,
    lastAt: lastAt.toISOString(),
    blocked,
  };
}
