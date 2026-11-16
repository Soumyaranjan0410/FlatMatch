"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Choice } from "@/components/bits";
import { AppFrame } from "@/components/shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AMENITIES, CITIES, FLAT_TYPES, FURNISHED, GENDER_PREFS, ROOM_PRESETS } from "@/lib/constants";
import { api } from "@/lib/client";
import { flatLabel, furnishedLabel, inr, prettyDate } from "@/lib/format";
import { useSession } from "@/lib/session-client";
import type { PublicListing } from "@/lib/types";

type Mine = PublicListing & { active: boolean };

const empty = {
  title: "",
  description: "",
  rent: "20000",
  deposit: "40000",
  city: "Bengaluru",
  locality: "",
  furnished: "furnished",
  flatType: "2BHK",
  genderPreference: "any",
  availableFrom: "2026-12-01",
  amenities: ["Wi-Fi", "Geyser"] as string[],
  photo: ROOM_PRESETS[0] as string,
};

export default function ListPage() {
  const { state, refresh } = useSession();
  const [listings, setListings] = useState<Mine[] | null>(null);
  const [error, setError] = useState("");
  const [form, setForm] = useState(empty);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  async function load() {
    try {
      const data = await api<{ listings: Mine[] }>("/api/listings");
      setListings(data.listings);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't load your rooms.");
    }
  }

  useEffect(() => {
    void load();
  }, []);

  useEffect(() => {
    if (state.status === "app" && state.user.city) {
      setForm((current) => ({ ...current, city: state.user.city, locality: current.locality || state.user.area }));
    }
  }, [state]);

  async function publish() {
    setBusy(true);
    try {
      await api("/api/listings", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          rent: Number(form.rent),
          deposit: Number(form.deposit),
        }),
      });
      toast.success("Room listed. Seekers in your city can swipe it.");
      setOpen(false);
      setForm(empty);
      await load();
      await refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't publish.");
    } finally {
      setBusy(false);
    }
  }

  async function toggle(listing: Mine) {
    try {
      await api("/api/listings", { method: "PATCH", body: JSON.stringify({ id: listing.id, active: !listing.active }) });
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't update the listing.");
    }
  }

  return (
    <AppFrame allow="app">
      <main className="min-h-0 flex-1 overflow-y-auto px-5 pt-[max(1rem,env(safe-area-inset-top))] pb-8">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl tracking-tight">Your room</h1>
            <p className="text-sm text-muted-foreground">List it yourself. The no-brokers pledge is on your profile.</p>
          </div>
        </div>
        {error ? <p className="mt-4 text-sm text-destructive">{error}</p> : null}
        {listings === null && !error ? <div className="mt-4 h-28 animate-pulse rounded-3xl bg-muted" /> : null}
        {listings?.length === 0 && !open ? (
          <div className="mt-4 rounded-3xl border border-dashed px-4 py-8 text-center">
            <p className="font-display text-2xl">No room listed yet</p>
            <p className="mt-2 text-sm text-muted-foreground">A seeker can't swipe a place you haven't described.</p>
          </div>
        ) : null}
        <div className="mt-4 grid gap-3">
          {listings?.map((listing) => (
            <article key={listing.id} className="overflow-hidden rounded-3xl border">
              <img src={listing.photo} alt="" className="h-36 w-full object-cover" />
              <div className="p-3">
                <p className="font-medium">{listing.title}</p>
                <p className="text-sm text-muted-foreground">
                  {inr(listing.rent)} · {flatLabel(listing.flatType)} · {furnishedLabel(listing.furnished)} · {listing.locality}
                </p>
                <p className="text-xs text-muted-foreground">Free {prettyDate(listing.availableFrom)} · {listing.active ? "Live" : "Paused"}</p>
                <Button variant="outline" className="mt-2 h-10 rounded-full" onClick={() => toggle(listing)}>
                  {listing.active ? "Pause listing" : "Make it live"}
                </Button>
              </div>
            </article>
          ))}
        </div>
        {!open ? (
          <Button size="xl" className="mt-4 w-full" onClick={() => setOpen(true)}>Add a room</Button>
        ) : (
          <form
            className="mt-4 grid gap-3"
            onSubmit={(event) => {
              event.preventDefault();
              void publish();
            }}
          >
            <Input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="Title" className="h-12 rounded-xl px-3" required />
            <Textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="Who lives there, deposit, and that it's direct." className="min-h-24 rounded-2xl" required />
            <div className="grid grid-cols-2 gap-2">
              <Input inputMode="numeric" value={form.rent} onChange={(event) => setForm({ ...form, rent: event.target.value })} className="h-12 rounded-xl px-3" />
              <Input inputMode="numeric" value={form.deposit} onChange={(event) => setForm({ ...form, deposit: event.target.value })} className="h-12 rounded-xl px-3" />
            </div>
            <div className="flex flex-wrap gap-2">
              {CITIES.map((city) => (
                <Choice key={city} selected={form.city === city} onClick={() => setForm({ ...form, city })}>{city}</Choice>
              ))}
            </div>
            <Input value={form.locality} onChange={(event) => setForm({ ...form, locality: event.target.value })} placeholder="Locality" className="h-12 rounded-xl px-3" />
            <div className="flex flex-wrap gap-2">
              {FLAT_TYPES.map((type) => (
                <Choice key={type.id} selected={form.flatType === type.id} onClick={() => setForm({ ...form, flatType: type.id })}>{type.label}</Choice>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {FURNISHED.map((item) => (
                <Choice key={item.id} selected={form.furnished === item.id} onClick={() => setForm({ ...form, furnished: item.id })}>{item.label}</Choice>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {GENDER_PREFS.map((item) => (
                <Choice key={item.id} selected={form.genderPreference === item.id} onClick={() => setForm({ ...form, genderPreference: item.id })}>{item.label}</Choice>
              ))}
            </div>
            <Input type="date" value={form.availableFrom} onChange={(event) => setForm({ ...form, availableFrom: event.target.value })} className="h-12 rounded-xl px-3" />
            <div className="flex flex-wrap gap-2">
              {AMENITIES.map((amenity) => (
                <Choice
                  key={amenity}
                  selected={form.amenities.includes(amenity)}
                  onClick={() =>
                    setForm({
                      ...form,
                      amenities: form.amenities.includes(amenity)
                        ? form.amenities.filter((item) => item !== amenity)
                        : [...form.amenities, amenity],
                    })
                  }
                >
                  {amenity}
                </Choice>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-2">
              {ROOM_PRESETS.map((photo) => (
                <button key={photo} type="button" onClick={() => setForm({ ...form, photo })} className={`overflow-hidden rounded-xl border-2 ${form.photo === photo ? "border-primary" : "border-transparent"}`}>
                  <img src={photo} alt="" className="aspect-[3/4] object-cover" />
                </button>
              ))}
            </div>
            <label className="text-sm text-primary">
              Upload a room photo
              <input
                type="file"
                accept="image/*"
                className="mt-1 block text-xs text-muted-foreground"
                onChange={async (event) => {
                  const file = event.target.files?.[0];
                  if (!file) return;
                  const body = new FormData();
                  body.set("file", file);
                  try {
                    const data = await api<{ url: string }>("/api/upload", { method: "POST", body });
                    setForm((current) => ({ ...current, photo: data.url }));
                  } catch (err) {
                    toast.error(err instanceof Error ? err.message : "Upload failed.");
                  }
                }}
              />
            </label>
            <div className="grid grid-cols-2 gap-2">
              <Button type="button" variant="outline" size="xl" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" size="xl" disabled={busy}>{busy ? "Publishing…" : "Publish"}</Button>
            </div>
          </form>
        )}
      </main>
    </AppFrame>
  );
}
