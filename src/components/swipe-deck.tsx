"use client";

import { animate, motion, useMotionValue, useTransform } from "framer-motion";
import { BadgeCheck, Heart, Info, Shield, SlidersHorizontal, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { NoBrokerBadge, VerifiedBadge, lifestyleLine, optionLabel, roomLine } from "@/components/bits";
import { SafetyDialog } from "@/components/safety-dialog";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { CITIES, DIETS, DRINKING, GUESTS, PETS, SCHEDULES, SMOKING } from "@/lib/constants";
import { api } from "@/lib/client";
import { depositMonths, flatLabel, furnishedLabel, inr, prettyDate } from "@/lib/format";
import { useLang } from "@/lib/i18n";
import { defaultFilters } from "@/lib/matchmaking";
import type { DeckCard, Filters, Me, PublicListing } from "@/lib/types";
import { cn } from "@/lib/utils";

type MatchHit = {
  id: string;
  other: { name: string; photo: string; age: number };
  listing: PublicListing | null;
};

function scoreTone(score: number) {
  if (score >= 80) return "bg-[#1F6B4A]";
  if (score >= 65) return "bg-[#8A5A12]";
  return "bg-[#1C1915]/75";
}

function CardFace({ card }: { card: DeckCard }) {
  const { t } = useLang();
  const photo = card.type === "listing" && card.listing ? card.listing.photo : card.person.photo;
  const title = card.type === "listing" && card.listing ? card.listing.title : card.person.name;
  return (
    <article className="relative h-full overflow-hidden rounded-[28px] bg-[#1c1915] shadow-[0_18px_50px_rgba(28,25,21,0.18)]">
      <img src={photo} alt="" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#1c1915] via-[#1c1915]/15 to-transparent" />
      <div className="absolute top-4 right-4 left-4 flex items-start justify-between gap-2">
        <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold text-white", scoreTone(card.score))}>
          {card.score}% match
        </span>
        <span className="rounded-full bg-white/90 px-2.5 py-1 text-xs font-medium text-[#1c1915]">
          {card.type === "listing" ? "Room" : "Person"}
        </span>
      </div>
      <div className="absolute right-0 bottom-0 left-0 p-5 text-white">
        <div className="mb-2 flex flex-wrap gap-1.5">
          {card.person.verified ? <VerifiedBadge /> : null}
          {card.person.noBrokers ? <NoBrokerBadge /> : null}
          {card.person.womenOnly ? (
            <span className="rounded-full bg-white/15 px-2 py-0.5 text-[11px] font-semibold">Women only</span>
          ) : null}
          {card.brokerReports > 0 ? (
            <span className="rounded-full bg-[#9F2D2D] px-2 py-0.5 text-[11px] font-semibold">
              {t("brokerFlags")}: {card.brokerReports}
            </span>
          ) : null}
        </div>
        <h2 className="font-display text-[1.85rem] leading-none tracking-tight text-balance">{title}</h2>
        <p className="mt-2 text-sm text-white/85">
          {card.type === "listing" && card.listing
            ? `${inr(card.listing.rent)} rent · ${inr(card.listing.deposit)} deposit (${depositMonths(card.listing.rent, card.listing.deposit)} mo) · ${t("brokerage")} ${card.person.noBrokers ? t("zero") : t("notPledged")}`
            : `${card.person.age} · ${card.person.occupation}`}
        </p>
        {card.type === "listing" && card.listing ? (
          <p className="mt-1 text-xs text-white/70">{roomLine(card.listing)} · {t("hidden")}</p>
        ) : (
          <p className="mt-1 text-xs text-white/70">{t("hidden")}</p>
        )}
        <p className="text-sm text-white/75">
          {card.person.area}, {card.person.city}
          {card.type === "person" ? ` · ${inr(card.person.budgetMin)}–${inr(card.person.budgetMax)}` : ""}
        </p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {lifestyleLine(card.person).slice(0, 3).map((tag) => (
            <span key={tag} className="rounded-full bg-white/15 px-2 py-1 text-[11px]">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}

function SwipeCard({
  card,
  active,
  index,
  command,
  onSwipe,
}: {
  card: DeckCard;
  active: boolean;
  index: number;
  command: { dir: "like" | "pass"; n: number } | null;
  onSwipe: (dir: "like" | "pass") => void;
}) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-220, 220], [-12, 12]);
  const likeOpacity = useTransform(x, [30, 120], [0, 1]);
  const passOpacity = useTransform(x, [-120, -30], [1, 0]);
  const dragging = useRef(false);
  const origin = useRef(0);
  const fired = useRef(false);
  const onSwipeRef = useRef(onSwipe);

  useEffect(() => {
    onSwipeRef.current = onSwipe;
  }, [onSwipe]);

  useEffect(() => {
    if (!active || !command) return;
    fired.current = false;
    const to = command.dir === "like" ? 460 : -460;
    animate(x, to, { duration: 0.22 });
    const timer = window.setTimeout(() => {
      if (!fired.current) {
        fired.current = true;
        onSwipeRef.current(command.dir);
      }
    }, 200);
    return () => window.clearTimeout(timer);
  }, [active, command, x]);

  function finish(dir: "like" | "pass") {
    if (fired.current) return;
    fired.current = true;
    onSwipe(dir);
  }

  return (
    <motion.div
      className="absolute inset-0"
      style={{
        x: active ? x : 0,
        rotate: active ? rotate : 0,
        zIndex: 30 - index,
        scale: 1 - index * 0.04,
        y: index * 10,
        touchAction: "none",
      }}
      onPointerDown={(event) => {
        if (!active) return;
        dragging.current = true;
        origin.current = event.clientX;
        event.currentTarget.setPointerCapture(event.pointerId);
      }}
      onPointerMove={(event) => {
        if (!dragging.current) return;
        x.set(event.clientX - origin.current);
      }}
      onPointerUp={() => {
        if (!dragging.current) return;
        dragging.current = false;
        const dx = x.get();
        if (dx > 110) {
          animate(x, 460, { duration: 0.2 });
          window.setTimeout(() => finish("like"), 180);
        } else if (dx < -110) {
          animate(x, -460, { duration: 0.2 });
          window.setTimeout(() => finish("pass"), 180);
        } else {
          animate(x, 0, { type: "spring", stiffness: 420, damping: 32 });
        }
      }}
      onPointerCancel={() => {
        dragging.current = false;
        animate(x, 0, { type: "spring", stiffness: 420, damping: 32 });
      }}
    >
      <CardFace card={card} />
      {active ? (
        <>
          <motion.span
            style={{ opacity: likeOpacity }}
            className="pointer-events-none absolute top-16 left-5 rounded-xl border-4 border-[#1F6B4A] px-3 py-1 text-2xl font-black tracking-wide text-[#1F6B4A] uppercase"
          >
            Like
          </motion.span>
          <motion.span
            style={{ opacity: passOpacity }}
            className="pointer-events-none absolute top-16 right-5 rounded-xl border-4 border-[#9F2D2D] px-3 py-1 text-2xl font-black tracking-wide text-[#9F2D2D] uppercase"
          >
            Pass
          </motion.span>
        </>
      ) : null}
    </motion.div>
  );
}

export function SwipeDeck({ me }: { me: Me }) {
  const [mode, setMode] = useState<"rooms" | "people">(me.role === "lister" ? "people" : "rooms");
  const [filters, setFilters] = useState<Filters>(() => defaultFilters(me));
  const [draft, setDraft] = useState<Filters>(filters);
  const [cards, setCards] = useState<DeckCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [detail, setDetail] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [safetyOpen, setSafetyOpen] = useState(false);
  const [command, setCommand] = useState<{ dir: "like" | "pass"; n: number } | null>(null);
  const [match, setMatch] = useState<MatchHit | null>(null);
  const [hint, setHint] = useState(true);
  const { t } = useLang();
  const busy = useRef(false);

  async function load(nextFilters = filters, nextMode = mode) {
    setLoading(true);
    setError("");
    const params = new URLSearchParams({
      mode: nextMode,
      city: nextFilters.city,
      budgetMin: String(nextFilters.budgetMin),
      budgetMax: String(nextFilters.budgetMax),
      gender: nextFilters.gender,
      moveInStrict: nextFilters.moveInStrict ? "1" : "0",
      verifiedOnly: nextFilters.verifiedOnly ? "1" : "0",
    });
    try {
      const data = await api<{ cards: DeckCard[] }>(`/api/deck?${params.toString()}`);
      setCards(data.cards);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't load the deck.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load(filters, mode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, filters.city, filters.budgetMin, filters.budgetMax, filters.gender, filters.moveInStrict, filters.verifiedOnly]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "ArrowLeft") nudge("pass");
      if (event.key === "ArrowRight") nudge("like");
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  function nudge(dir: "like" | "pass") {
    if (!cards[0] || busy.current || match) return;
    setHint(false);
    setCommand({ dir, n: Date.now() });
  }

  async function onSwipe(dir: "like" | "pass") {
    const card = cards[0];
    if (!card || busy.current) return;
    busy.current = true;
    setCards((current) => current.slice(1));
    setCommand(null);
    setDetail(false);
    try {
      const result = await api<{
        matched: boolean;
        already?: boolean;
        match?: MatchHit;
      }>("/api/swipe", {
        method: "POST",
        body: JSON.stringify({
          targetType: card.type === "listing" ? "listing" : "user",
          targetId: card.type === "listing" ? card.listing?.id : card.person.id,
          direction: dir,
        }),
      });
      if (result.matched && !result.already && result.match) setMatch(result.match);
      else if (dir === "like") toast("Liked. A chat opens if they like you back.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't save that swipe.");
      setCards((current) => [card, ...current]);
    } finally {
      busy.current = false;
    }
  }

  const top = cards[0];

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="flex items-center justify-between px-4 pt-[max(0.8rem,env(safe-area-inset-top))] pb-2">
        <div>
          <p className="font-display text-2xl leading-none tracking-tight">{t("discover")}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {filters.city === "all" ? "All cities" : filters.city} · {inr(filters.budgetMin)}–{inr(filters.budgetMax)}
          </p>
        </div>
        <Button variant="outline" size="icon" className="rounded-full" onClick={() => { setDraft(filters); setFiltersOpen(true); }} aria-label="Filters">
          <SlidersHorizontal />
        </Button>
      </header>

      <div className="mx-4 mb-3 grid grid-cols-2 rounded-full bg-muted p-1 text-sm font-medium">
        {(["rooms", "people"] as const).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setMode(item)}
            className={cn("rounded-full py-2", mode === item ? "bg-card shadow-sm" : "text-muted-foreground")}
          >
            {item === "rooms" ? t("rooms") : t("people")}
          </button>
        ))}
      </div>

      <div className="relative mx-4 min-h-0 flex-1">
        {loading ? (
          <div className="absolute inset-0 animate-pulse rounded-[28px] bg-muted" />
        ) : error ? (
          <div className="absolute inset-0 grid content-center gap-3 rounded-[28px] border border-dashed px-6 text-center">
            <p className="font-display text-2xl">The deck didn't load</p>
            <p className="text-sm text-muted-foreground">{error}</p>
            <Button className="mx-auto w-fit" size="xl" onClick={() => load()}>Try again</Button>
          </div>
        ) : cards.length === 0 ? (
          <div className="absolute inset-0 grid content-center gap-3 rounded-[28px] border border-dashed px-6 text-center">
            <p className="font-display text-3xl tracking-tight">You've seen this city</p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Nobody left matches these filters. Widen the budget, include a later move-in, or look at another city.
            </p>
            <Button
              className="mx-auto w-fit"
              size="xl"
              onClick={() =>
                setFilters((current) => ({
                  ...current,
                  budgetMax: current.budgetMax + 10000,
                  moveInStrict: false,
                  city: "all",
                }))
              }
            >
              Relax filters
            </Button>
          </div>
        ) : (
          cards.slice(0, 3).reverse().map((card) => {
            const index = cards.indexOf(card);
            return (
              <SwipeCard
                key={card.key}
                card={card}
                index={index}
                active={index === 0}
                command={index === 0 ? command : null}
                onSwipe={onSwipe}
              />
            );
          })
        )}
        {hint && top && !loading ? (
          <p className="pointer-events-none absolute bottom-3 left-0 right-0 text-center text-xs text-white/90 drop-shadow">
            Swipe right to like, left to pass
          </p>
        ) : null}
      </div>

      <div className="flex items-center justify-center gap-5 py-4">
        <button
          type="button"
          aria-label="Pass"
          disabled={!top}
          onClick={() => nudge("pass")}
          className="grid size-16 place-items-center rounded-full border border-border bg-card text-[#9F2D2D] shadow-sm disabled:opacity-40"
        >
          <X className="size-7" />
        </button>
        <button
          type="button"
          aria-label="Details"
          disabled={!top}
          onClick={() => setDetail(true)}
          className="grid size-12 place-items-center rounded-full border border-border bg-card disabled:opacity-40"
        >
          <Info className="size-5" />
        </button>
        <button
          type="button"
          aria-label="Like"
          disabled={!top}
          onClick={() => nudge("like")}
          className="grid size-16 place-items-center rounded-full bg-primary text-primary-foreground shadow-sm disabled:opacity-40"
        >
          <Heart className="size-7" fill="currentColor" />
        </button>
      </div>

      <Sheet open={detail} onOpenChange={setDetail}>
        <SheetContent side="bottom" className="max-h-[88dvh] overflow-y-auto rounded-t-3xl pb-8">
          {top ? <CardDetail card={top} onReport={() => setSafetyOpen(true)} /> : null}
        </SheetContent>
      </Sheet>

      <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
        <SheetContent side="bottom" className="max-h-[88dvh] overflow-y-auto rounded-t-3xl">
          <SheetHeader>
            <SheetTitle className="font-display text-2xl">{t("filters")}</SheetTitle>
          </SheetHeader>
          <div className="space-y-4 px-4 pb-6">
            <fieldset>
              <legend className="mb-2 text-sm font-medium">City</legend>
              <div className="flex flex-wrap gap-2">
                {["all", ...CITIES].map((city) => (
                  <button
                    key={city}
                    type="button"
                    onClick={() => setDraft((current) => ({ ...current, city }))}
                    className={cn("rounded-full border px-3 py-1.5 text-sm", draft.city === city ? "border-primary bg-primary text-primary-foreground" : "")}
                  >
                    {city === "all" ? "All three" : city}
                  </button>
                ))}
              </div>
            </fieldset>
            <div className="grid grid-cols-2 gap-3">
              <label className="text-sm">
                Budget from
                <input
                  type="number"
                  className="mt-1 h-11 w-full rounded-xl border px-3"
                  value={draft.budgetMin}
                  onChange={(event) => setDraft((current) => ({ ...current, budgetMin: Number(event.target.value) }))}
                />
              </label>
              <label className="text-sm">
                Budget to
                <input
                  type="number"
                  className="mt-1 h-11 w-full rounded-xl border px-3"
                  value={draft.budgetMax}
                  onChange={(event) => setDraft((current) => ({ ...current, budgetMax: Number(event.target.value) }))}
                />
              </label>
            </div>
            <fieldset>
              <legend className="mb-2 text-sm font-medium">Show</legend>
              <div className="flex gap-2">
                {([
                  ["any", "Anyone"],
                  ["woman", "Women"],
                  ["man", "Men"],
                ] as const).map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    disabled={me.womenOnly && id !== "woman"}
                    onClick={() => setDraft((current) => ({ ...current, gender: id }))}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-sm disabled:opacity-40",
                      draft.gender === id ? "border-primary bg-primary text-primary-foreground" : "",
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
              {me.womenOnly ? <p className="mt-2 text-xs text-muted-foreground">Women-only mode keeps this on Women.</p> : null}
            </fieldset>
            <label className="flex items-center justify-between gap-3 text-sm">
              <span>{t("verifiedOnly")}</span>
              <input
                type="checkbox"
                checked={draft.verifiedOnly}
                onChange={(event) => setDraft((current) => ({ ...current, verifiedOnly: event.target.checked }))}
              />
            </label>
            <label className="flex items-center justify-between gap-3 text-sm">
              <span>Only places around my move-in ({prettyDate(me.moveInDate)})</span>
              <input
                type="checkbox"
                checked={draft.moveInStrict}
                onChange={(event) => setDraft((current) => ({ ...current, moveInStrict: event.target.checked }))}
              />
            </label>
            <Button
              size="xl"
              className="w-full"
              onClick={() => {
                setFilters(draft);
                setFiltersOpen(false);
              }}
            >
              Show matches
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {top ? (
        <SafetyDialog
          open={safetyOpen}
          onOpenChange={setSafetyOpen}
          targetUserId={top.person.id}
          name={top.person.name.split(" ")[0]}
          onBlocked={() => {
            setCards((current) => current.filter((card) => card.person.id !== top.person.id));
            setDetail(false);
          }}
        />
      ) : null}

      {match ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[#1c1915]/80 p-6">
          <div className="w-full max-w-sm rounded-[28px] bg-[#fbf7f2] p-6 text-center shadow-2xl">
            <p className="text-xs font-semibold tracking-[0.18em] text-primary uppercase">{t("match")}</p>
            <h2 className="mt-2 font-display text-4xl tracking-tight">You and {match.other.name.split(" ")[0]}</h2>
            <div className="my-5 flex justify-center">
              <img src={me.photo} alt="" className="size-24 rounded-full border-4 border-white object-cover shadow" />
              <img src={match.other.photo} alt="" className="-ml-4 size-24 rounded-full border-4 border-white object-cover shadow" />
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {match.listing
                ? `${match.listing.title} · ${inr(match.listing.rent)} a month. Chat is open.`
                : "You both swiped right. Chat is open."}
            </p>
            <div className="mt-5 grid gap-2">
              <a href={`/matches/${match.id}`} className="inline-flex h-12 items-center justify-center rounded-full bg-primary px-5 font-medium text-primary-foreground">
                {t("send")}
              </a>
              <button type="button" className="h-12 rounded-full text-sm font-medium" onClick={() => setMatch(null)}>
                {t("keep")}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function CardDetail({ card, onReport }: { card: DeckCard; onReport: () => void }) {
  const person = card.person;
  const listing = card.listing;
  return (
    <div className="px-4 pb-4">
      <SheetHeader className="px-0">
        <SheetTitle className="font-display text-3xl tracking-tight">
          {listing && card.type === "listing" ? listing.title : person.name}
        </SheetTitle>
      </SheetHeader>
      <p className="text-sm text-muted-foreground">{card.score}% lifestyle match · {card.context}</p>
      <img
        src={card.type === "listing" && listing ? listing.photo : person.photo}
        alt=""
        className="mt-3 h-52 w-full rounded-2xl object-cover"
      />
      <div className="mt-3 flex flex-wrap gap-1.5">
        {person.verified ? (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#1F6B4A]"><BadgeCheck className="size-3.5" /> Mock verified</span>
        ) : null}
        {person.noBrokers ? (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#8A5A12]"><Shield className="size-3.5" /> No-brokers pledge</span>
        ) : null}
      </div>
      <p className="mt-3 text-sm leading-relaxed">{person.bio}</p>
      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div><dt className="text-muted-foreground">Work</dt><dd>{person.occupation}</dd></div>
        <div><dt className="text-muted-foreground">Move-in</dt><dd>{prettyDate(person.moveInDate)}</dd></div>
        <div><dt className="text-muted-foreground">Budget</dt><dd>{inr(person.budgetMin)}–{inr(person.budgetMax)}</dd></div>
        <div><dt className="text-muted-foreground">Languages</dt><dd>{person.languages.join(", ")}</dd></div>
        <div><dt className="text-muted-foreground">Food</dt><dd>{optionLabel(DIETS, person.diet)}</dd></div>
        <div><dt className="text-muted-foreground">Smoking</dt><dd>{optionLabel(SMOKING, person.smoking)}</dd></div>
        <div><dt className="text-muted-foreground">Drinking</dt><dd>{optionLabel(DRINKING, person.drinking)}</dd></div>
        <div><dt className="text-muted-foreground">Pets</dt><dd>{optionLabel(PETS, person.pets)}</dd></div>
        <div><dt className="text-muted-foreground">Guests</dt><dd>{optionLabel(GUESTS, person.guests)}</dd></div>
        <div><dt className="text-muted-foreground">Hours</dt><dd>{optionLabel(SCHEDULES, person.schedule)}</dd></div>
        <div><dt className="text-muted-foreground">Cleanliness</dt><dd>{person.cleanliness} / 5</dd></div>
      </dl>
      <ul className="mt-4 space-y-1 text-sm">
        {card.notes.map((note) => (
          <li key={note}>· {note}</li>
        ))}
      </ul>
      {listing ? (
        <section className="mt-4 rounded-2xl bg-muted p-3 text-sm">
          <p className="font-medium">{listing.title}</p>
          <p className="mt-1">{inr(listing.rent)} rent · {inr(listing.deposit)} deposit</p>
          <p className="mt-1 text-muted-foreground">
            {flatLabel(listing.flatType)} · {furnishedLabel(listing.furnished)} · {listing.locality} · free {prettyDate(listing.availableFrom)}
          </p>
          <p className="mt-2 leading-relaxed">{listing.description}</p>
          <p className="mt-2">
            {inr(listing.rent)} rent · {inr(listing.deposit)} deposit ({depositMonths(listing.rent, listing.deposit)} months) · Brokerage {person.noBrokers ? "₹0" : "not pledged"}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">{listing.amenities.join(" · ")} · Prefers {listing.genderPreference}</p>
        </section>
      ) : null}
      <Button variant="outline" className="mt-4 h-11 w-full rounded-full" onClick={onReport}>
        Report or block
      </Button>
    </div>
  );
}
