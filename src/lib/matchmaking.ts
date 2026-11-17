import type { Filters, Lifestyle } from "./types";

const SMOKE = ["no", "occasionally", "yes"];
const DRINK = ["no", "socially", "yes"];
const GUESTS = ["rare", "sometimes", "often"];
const SCHEDULE = ["standard", "hybrid", "night"];
const WORK = ["office", "hybrid", "wfh"];

function scalePoints(scale: string[], a: string, b: string, points: number) {
  const d = Math.abs(scale.indexOf(a) - scale.indexOf(b));
  if (d < 0) return 0;
  if (scale.indexOf(a) < 0 || scale.indexOf(b) < 0) return 0;
  if (d === 0) return points;
  if (d === 1) return Math.round(points * 0.45);
  return 0;
}

function petsPoints(a: string, b: string) {
  if (a === b) return 12;
  if ((a === "have" && b === "no") || (b === "have" && a === "no")) return 0;
  if (a === "ok" || b === "ok") return 7;
  return 4;
}

export function compatibility(a: Lifestyle, b: Lifestyle) {
  let score = 0;
  if (a.diet === b.diet) score += 22;
  else if (a.diet === "eggetarian" || b.diet === "eggetarian") score += 11;
  score += scalePoints(SMOKE, a.smoking, b.smoking, 16);
  score += scalePoints(DRINK, a.drinking, b.drinking, 14);
  score += petsPoints(a.pets, b.pets);
  score += scalePoints(GUESTS, a.guests, b.guests, 10);
  score += scalePoints(SCHEDULE, a.schedule, b.schedule, 12);
  score += scalePoints(WORK, a.workSetup || "hybrid", b.workSetup || "hybrid", 10);
  const cleanDiff = Math.abs((a.cleanliness || 3) - (b.cleanliness || 3));
  score += cleanDiff === 0 ? 14 : cleanDiff === 1 ? 9 : cleanDiff === 2 ? 4 : 0;
  const overlap = a.languages.filter((language) => b.languages.includes(language)).length;
  score += Math.min(10, overlap * 5);
  return Math.max(1, Math.min(99, Math.round((score / 120) * 100)));
}

const DIET_LABEL: Record<string, string> = {
  veg: "vegetarian",
  eggetarian: "eggetarian",
  nonveg: "non-vegetarian",
};

export function compatibilityNotes(a: Lifestyle, b: Lifestyle) {
  const notes: string[] = [];
  if (a.diet === b.diet) notes.push(`You both eat ${DIET_LABEL[a.diet] || a.diet}`);
  else if (
    (a.diet === "veg" && b.diet === "nonveg") ||
    (b.diet === "veg" && a.diet === "nonveg")
  ) {
    notes.push("Kitchen mismatch: vegetarian and non-vegetarian");
  } else notes.push("Eggetarian is a workable middle ground");

  if (a.smoking === "no" && b.smoking === "no") notes.push("Neither of you smokes");
  else if (a.smoking === "yes" || b.smoking === "yes") notes.push("Smoking habits differ");

  if ((a.workSetup || "hybrid") === "wfh" && (b.workSetup || "hybrid") === "wfh") {
    notes.push("You both work from home");
  } else if ((a.workSetup || "hybrid") === "wfh" || (b.workSetup || "hybrid") === "wfh") {
    notes.push("One of you works from home most days");
  }

  if (a.schedule === "night" || b.schedule === "night") {
    notes.push(a.schedule === b.schedule ? "You both keep night hours" : "One of you works nights");
  } else if (a.schedule === b.schedule) {
    notes.push(a.schedule === "hybrid" ? "Hybrid routines line up" : "Similar daytime hours");
  }

  if (Math.abs(a.cleanliness - b.cleanliness) <= 1) notes.push("Close on cleanliness");
  else notes.push("Different cleanliness standards");

  const shared = a.languages.filter((language) => b.languages.includes(language));
  if (shared.length) notes.push(`In common: ${shared.slice(0, 3).join(", ")}`);

  if (a.pets === "have" || b.pets === "have") {
    notes.push(a.pets === "no" || b.pets === "no" ? "A pet may be a dealbreaker" : "Fine with pets");
  }

  return notes.slice(0, 4);
}

export function womenOnlyAllows(
  viewer: { gender: string; womenOnly: boolean },
  other: { gender: string; womenOnly: boolean },
) {
  if (!viewer.womenOnly && !other.womenOnly) return true;
  return viewer.gender === "woman" && other.gender === "woman";
}

export function genderAllowed(viewerGender: string, preference: string) {
  if (!preference || preference === "any") return true;
  if (preference === "women") return viewerGender === "woman";
  if (preference === "men") return viewerGender === "man";
  return false;
}

export function budgetOverlaps(aMin: number, aMax: number, bMin: number, bMax: number) {
  return aMin <= bMax && bMin <= aMax;
}

function parseDay(iso: string) {
  const time = Date.parse(`${iso}T00:00:00Z`);
  return Number.isNaN(time) ? null : time;
}

export function moveInClose(a: string, b: string, days: number) {
  const left = parseDay(a);
  const right = parseDay(b);
  if (left == null || right == null) return true;
  return Math.abs(left - right) <= days * 86400000;
}

export function listingDateOk(availableFrom: string, moveIn: string, strict: boolean) {
  if (!strict) return true;
  const available = parseDay(availableFrom);
  const move = parseDay(moveIn);
  if (available == null || move == null) return true;
  return available <= move + 30 * 86400000;
}

export function defaultFilters(user: {
  city: string;
  budgetMin: number;
  budgetMax: number;
  womenOnly: boolean;
}): Filters {
  return {
    city: user.city || "Bengaluru",
    budgetMin: Math.max(4000, (user.budgetMin || 10000) - 8000),
    budgetMax: (user.budgetMax || 30000) + 8000,
    gender: user.womenOnly ? "woman" : "any",
    moveInStrict: true,
    verifiedOnly: false,
  };
}
