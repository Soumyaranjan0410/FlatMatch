"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppFrame } from "@/components/shell";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/client";
import { inr, shortDate } from "@/lib/format";
import type { MatchPreview } from "@/lib/types";

export default function MatchesPage() {
  const [matches, setMatches] = useState<MatchPreview[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api<{ matches: MatchPreview[] }>("/api/matches")
      .then((data) => setMatches(data.matches))
      .catch((err: Error) => setError(err.message));
  }, []);

  return (
    <AppFrame allow="app">
      <main className="flex min-h-0 flex-1 flex-col">
        <header className="px-5 pt-[max(1rem,env(safe-area-inset-top))] pb-3">
          <h1 className="font-display text-3xl tracking-tight">Matches</h1>
          <p className="text-sm text-muted-foreground">Chat opens only after you both swipe right.</p>
        </header>
        {error ? (
          <div className="px-5">
            <p className="text-sm text-destructive">{error}</p>
            <Button className="mt-3" size="xl" onClick={() => location.reload()}>Reload</Button>
          </div>
        ) : matches === null ? (
          <div className="mx-5 h-24 animate-pulse rounded-2xl bg-muted" />
        ) : matches.length === 0 ? (
          <div className="mx-5 rounded-3xl border border-dashed px-5 py-10 text-center">
            <p className="font-display text-3xl tracking-tight">No matches yet</p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Keep swiping. When someone likes you back, they'll land here and you can talk.
            </p>
            <Link href="/discover" className="mt-4 inline-flex h-12 items-center rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground">
              Back to the deck
            </Link>
          </div>
        ) : (
          <ul className="min-h-0 flex-1 overflow-y-auto">
            {matches.map((match) => (
              <li key={match.id}>
                <Link href={`/matches/${match.id}`} className="flex items-center gap-3 px-5 py-3 hover:bg-muted/60">
                  <img src={match.other.photo} alt="" className="size-14 rounded-full object-cover" />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-baseline justify-between gap-2">
                      <span className="truncate font-medium">
                        {match.other.name}
                        {match.blocked ? <span className="ml-2 text-xs text-destructive">Blocked</span> : null}
                      </span>
                      <span className="shrink-0 text-xs text-muted-foreground">{shortDate(match.lastAt)}</span>
                    </span>
                    <span className="block truncate text-sm text-muted-foreground">{match.lastMessage}</span>
                    {match.listing ? (
                      <span className="block truncate text-xs text-muted-foreground">
                        {match.listing.locality} · {inr(match.listing.rent)}
                      </span>
                    ) : null}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </AppFrame>
  );
}
