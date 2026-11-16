import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  budgetOverlaps,
  compatibility,
  genderAllowed,
  listingDateOk,
  moveInClose,
  womenOnlyAllows,
} from "./matchmaking";
import type { Lifestyle } from "./types";

const base: Lifestyle = {
  diet: "veg",
  smoking: "no",
  drinking: "no",
  pets: "no",
  guests: "rare",
  schedule: "standard",
  cleanliness: 4,
  languages: ["Hindi", "English"],
};

describe("compatibility", () => {
  it("scores a near-identical lifestyle very high", () => {
    const score = compatibility(base, { ...base, languages: ["Hindi", "English", "Kannada"] });
    assert.ok(score >= 90, `expected >= 90, got ${score}`);
  });

  it("scores a vegetarian non-smoker against a smoking non-vegetarian much lower", () => {
    const clash: Lifestyle = {
      ...base,
      diet: "nonveg",
      smoking: "yes",
      drinking: "yes",
      pets: "have",
      guests: "often",
      schedule: "night",
      cleanliness: 1,
      languages: ["Punjabi"],
    };
    const score = compatibility(base, clash);
    assert.ok(score <= 35, `expected <= 35, got ${score}`);
  });

  it("treats eggetarian as a partial diet match", () => {
    const egg = compatibility(base, { ...base, diet: "eggetarian" });
    const clash = compatibility(base, { ...base, diet: "nonveg" });
    assert.ok(egg > clash);
  });
});

describe("visibility", () => {
  it("keeps women-only profiles between women", () => {
    assert.equal(
      womenOnlyAllows({ gender: "woman", womenOnly: true }, { gender: "woman", womenOnly: false }),
      true,
    );
    assert.equal(
      womenOnlyAllows({ gender: "man", womenOnly: false }, { gender: "woman", womenOnly: true }),
      false,
    );
    assert.equal(
      womenOnlyAllows({ gender: "woman", womenOnly: true }, { gender: "man", womenOnly: false }),
      false,
    );
  });

  it("applies listing gender preference", () => {
    assert.equal(genderAllowed("woman", "women"), true);
    assert.equal(genderAllowed("man", "women"), false);
    assert.equal(genderAllowed("nonbinary", "any"), true);
    assert.equal(genderAllowed("nonbinary", "men"), false);
  });
});

describe("filters", () => {
  it("detects overlapping budgets", () => {
    assert.equal(budgetOverlaps(15000, 25000, 20000, 30000), true);
    assert.equal(budgetOverlaps(10000, 14000, 20000, 30000), false);
  });

  it("keeps move-in dates that are close", () => {
    assert.equal(moveInClose("2026-12-01", "2026-12-20", 60), true);
    assert.equal(moveInClose("2026-12-01", "2026-06-01", 60), false);
  });

  it("hides rooms that open too long after the move-in date", () => {
    assert.equal(listingDateOk("2026-12-15", "2026-12-01", true), true);
    assert.equal(listingDateOk("2027-03-01", "2026-12-01", true), false);
    assert.equal(listingDateOk("2027-03-01", "2026-12-01", false), true);
  });
});
