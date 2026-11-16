"use client";

import { BadgeCheck, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { DIETS, DRINKING, FURNISHED, GUESTS, PETS, SCHEDULES } from "@/lib/constants";
import { flatLabel } from "@/lib/format";

export function optionLabel(list: readonly { id: string; label: string }[], id: string) {
  return list.find((item) => item.id === id)?.label || id;
}

export function Choice({
  selected,
  children,
  onClick,
}: {
  selected: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3.5 py-2 text-left text-sm transition active:scale-[0.98]",
        selected
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-foreground hover:border-primary/40",
      )}
    >
      {children}
    </button>
  );
}

export function VerifiedBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-[#E7F3EC] px-2 py-0.5 text-[11px] font-semibold text-[#1F6B4A]">
      <BadgeCheck className="size-3.5" />
      Verified
    </span>
  );
}

export function NoBrokerBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-[#F8EFE2] px-2 py-0.5 text-[11px] font-semibold text-[#8A5A12]">
      <Shield className="size-3.5" />
      No brokers
    </span>
  );
}

export function lifestyleLine(person: {
  diet: string;
  smoking: string;
  schedule: string;
  pets: string;
}) {
  const parts = [
    optionLabel(DIETS, person.diet),
    person.smoking === "no" ? "Non-smoker" : person.smoking === "yes" ? "Smokes" : "Smokes sometimes",
    optionLabel(SCHEDULES, person.schedule),
  ];
  if (person.pets === "have") parts.push("Has pets");
  return parts;
}

export function roomLine(listing: { flatType: string; furnished: string; locality: string }) {
  return `${flatLabel(listing.flatType)} · ${optionLabel(FURNISHED, listing.furnished)} · ${listing.locality}`;
}

export { DRINKING, GUESTS, PETS };
