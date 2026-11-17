"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Choice } from "@/components/bits";
import { AppFrame } from "@/components/shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  AMENITIES,
  CITIES,
  DIETS,
  DRINKING,
  FLAT_TYPES,
  FURNISHED,
  GENDER_PREFS,
  GENDERS,
  GUESTS,
  LANGUAGES,
  PETS,
  PRESET_PORTRAITS,
  ROLES,
  ROOM_PRESETS,
  SCHEDULES,
  SMOKING,
  WORK_SETUPS,
} from "@/lib/constants";
import { api } from "@/lib/client";
import { useSession } from "@/lib/session-client";

const STEPS = ["You", "Role", "City", "Work", "Budget", "Life", "Languages", "Photo", "Pledge", "Room"];

export default function OnboardingPage() {
  const router = useRouter();
  const { state, refresh } = useSession();
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    name: "",
    age: "24",
    gender: "woman",
    role: "seeker",
    city: "Bengaluru",
    area: "",
    occupation: "",
    budgetMin: "15000",
    budgetMax: "25000",
    moveInDate: "2026-12-15",
    diet: "veg",
    smoking: "no",
    drinking: "socially",
    pets: "ok",
    guests: "sometimes",
    schedule: "hybrid",
    workSetup: "hybrid",
    cleanliness: 4,
    languages: ["Hindi", "English"] as string[],
    photo: PRESET_PORTRAITS[0] as string,
    bio: "",
    womenOnly: false,
    noBrokers: true,
    addListing: false,
    title: "",
    description: "",
    rent: "18000",
    deposit: "36000",
    locality: "",
    furnished: "semi",
    flatType: "2BHK",
    genderPreference: "any",
    availableFrom: "2026-12-01",
    amenities: ["Wi-Fi", "Geyser", "Fridge"] as string[],
    roomPhoto: ROOM_PRESETS[0] as string,
  });

  const visibleSteps = useMemo(
    () => (form.role === "seeker" ? STEPS.filter((item) => item !== "Room") : STEPS),
    [form.role],
  );
  const current = visibleSteps[step] || "You";

  function patch(partial: Partial<typeof form>) {
    setForm((currentForm) => ({ ...currentForm, ...partial }));
  }

  function toggle(list: string[], value: string, key: "languages" | "amenities") {
    const next = list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
    patch({ [key]: next });
  }

  function next() {
    const problem = validate(current, form);
    if (problem) {
      toast.error(problem);
      return;
    }
    if (step === visibleSteps.length - 1) {
      void finish(form.role !== "seeker");
      return;
    }
    setStep((value) => value + 1);
  }

  async function finish(includeListing: boolean) {
    setBusy(true);
    try {
      await api("/api/onboarding", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          age: Number(form.age),
          budgetMin: Number(form.budgetMin),
          budgetMax: Number(form.budgetMax),
          womenOnly: form.gender === "woman" && form.womenOnly,
          listing: includeListing
            ? {
                title: form.title,
                description: form.description,
                rent: Number(form.rent),
                deposit: Number(form.deposit),
                city: form.city,
                locality: form.locality || form.area,
                furnished: form.furnished,
                flatType: form.flatType,
                genderPreference: form.genderPreference,
                availableFrom: form.availableFrom,
                amenities: form.amenities,
                photo: form.roomPhoto,
              }
            : null,
        }),
      });
      await refresh();
      router.push("/discover");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Couldn't save your profile.");
    } finally {
      setBusy(false);
    }
  }

  async function upload(file: File, kind: "photo" | "roomPhoto") {
    const body = new FormData();
    body.set("file", file);
    try {
      const data = await api<{ url: string }>("/api/upload", { method: "POST", body });
      patch({ [kind]: data.url });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Couldn't upload that photo.");
    }
  }

  return (
    <AppFrame allow="onboarding">
      <main className="flex min-h-0 flex-1 flex-col px-5 pt-[max(1rem,env(safe-area-inset-top))] pb-4">
        <div className="mb-4 h-1.5 overflow-hidden rounded-full bg-muted">
          <div className="h-full bg-primary transition-all" style={{ width: `${((step + 1) / visibleSteps.length) * 100}%` }} />
        </div>
        <p className="text-xs font-semibold tracking-[0.14em] text-primary uppercase">
          Step {step + 1} of {visibleSteps.length}
          {state.status === "onboarding" && state.phone ? ` · +91 ${state.phone}` : ""}
        </p>
        <div className="mt-3 min-h-0 flex-1 overflow-y-auto pb-4">
          {current === "You" ? (
            <section className="grid gap-3">
              <h1 className="font-display text-4xl tracking-tight">What should we call you?</h1>
              <Input value={form.name} onChange={(event) => patch({ name: event.target.value })} placeholder="Your name" className="h-12 rounded-xl px-3 text-base" />
              <div className="grid grid-cols-2 gap-3">
                <Input inputMode="numeric" value={form.age} onChange={(event) => patch({ age: event.target.value })} placeholder="Age" className="h-12 rounded-xl px-3 text-base" />
                <div className="flex flex-wrap gap-2">
                  {GENDERS.map((gender) => (
                    <Choice key={gender.id} selected={form.gender === gender.id} onClick={() => patch({ gender: gender.id, womenOnly: gender.id === "woman" ? form.womenOnly : false })}>
                      {gender.label}
                    </Choice>
                  ))}
                </div>
              </div>
            </section>
          ) : null}
          {current === "Role" ? (
            <section className="grid gap-3">
              <h1 className="font-display text-4xl tracking-tight">What are you here for?</h1>
              {ROLES.map((role) => (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => patch({ role: role.id })}
                  className={`rounded-2xl border p-4 text-left ${form.role === role.id ? "border-primary bg-primary/5" : "border-border"}`}
                >
                  <span className="block font-medium">{role.title}</span>
                  <span className="text-sm text-muted-foreground">{role.copy}</span>
                </button>
              ))}
            </section>
          ) : null}
          {current === "City" ? (
            <section className="grid gap-3">
              <h1 className="font-display text-4xl tracking-tight">Where do you want to live?</h1>
              <div className="flex flex-wrap gap-2">
                {CITIES.map((city) => (
                  <Choice key={city} selected={form.city === city} onClick={() => patch({ city })}>{city}</Choice>
                ))}
              </div>
              <Input value={form.area} onChange={(event) => patch({ area: event.target.value })} placeholder="Area, like Koramangala or Baner" className="h-12 rounded-xl px-3 text-base" />
            </section>
          ) : null}
          {current === "Work" ? (
            <section className="grid gap-3">
              <h1 className="font-display text-4xl tracking-tight">Work or college?</h1>
              <Input value={form.occupation} onChange={(event) => patch({ occupation: event.target.value })} placeholder="Designer at a fintech, or BA at Christ" className="h-12 rounded-xl px-3 text-base" />
            </section>
          ) : null}
          {current === "Budget" ? (
            <section className="grid gap-3">
              <h1 className="font-display text-4xl tracking-tight">Budget and move-in</h1>
              <p className="text-sm text-muted-foreground">Monthly rent you can pay, in rupees. Listers: what you'd accept for a room.</p>
              <div className="grid grid-cols-2 gap-3">
                <Input inputMode="numeric" value={form.budgetMin} onChange={(event) => patch({ budgetMin: event.target.value })} className="h-12 rounded-xl px-3 text-base" />
                <Input inputMode="numeric" value={form.budgetMax} onChange={(event) => patch({ budgetMax: event.target.value })} className="h-12 rounded-xl px-3 text-base" />
              </div>
              <label className="text-sm">
                Move-in date
                <Input type="date" value={form.moveInDate} onChange={(event) => patch({ moveInDate: event.target.value })} className="mt-1 h-12 rounded-xl px-3 text-base" />
              </label>
            </section>
          ) : null}
          {current === "Life" ? (
            <section className="grid gap-4">
              <h1 className="font-display text-4xl tracking-tight">How you live</h1>
              <Group label="Food" value={form.diet} options={DIETS} onChange={(diet) => patch({ diet })} />
              <Group label="Smoking" value={form.smoking} options={SMOKING} onChange={(smoking) => patch({ smoking })} />
              <Group label="Drinking" value={form.drinking} options={DRINKING} onChange={(drinking) => patch({ drinking })} />
              <Group label="Pets" value={form.pets} options={PETS} onChange={(pets) => patch({ pets })} />
              <Group label="Guests" value={form.guests} options={GUESTS} onChange={(guests) => patch({ guests })} />
              <Group label="Hours" value={form.schedule} options={SCHEDULES} onChange={(schedule) => patch({ schedule })} />
              <Group label="Work setup" value={form.workSetup} options={WORK_SETUPS} onChange={(workSetup) => patch({ workSetup })} />
              <label className="text-sm">
                Cleanliness · {form.cleanliness}/5
                <input
                  type="range"
                  min={1}
                  max={5}
                  value={form.cleanliness}
                  onChange={(event) => patch({ cleanliness: Number(event.target.value) })}
                  className="mt-2 w-full accent-[#C24D2C]"
                />
                <span className="flex justify-between text-xs text-muted-foreground"><span>Lived-in</span><span>Spotless</span></span>
              </label>
            </section>
          ) : null}
          {current === "Languages" ? (
            <section>
              <h1 className="font-display text-4xl tracking-tight">Languages at home</h1>
              <div className="mt-4 flex flex-wrap gap-2">
                {LANGUAGES.map((language) => (
                  <Choice key={language} selected={form.languages.includes(language)} onClick={() => toggle(form.languages, language, "languages")}>
                    {language}
                  </Choice>
                ))}
              </div>
            </section>
          ) : null}
          {current === "Photo" ? (
            <section>
              <h1 className="font-display text-4xl tracking-tight">Pick a portrait</h1>
              <p className="mt-2 text-sm text-muted-foreground">Illustrated for the demo, or upload your own.</p>
              <div className="mt-4 grid grid-cols-4 gap-2">
                {PRESET_PORTRAITS.map((photo) => (
                  <button key={photo} type="button" onClick={() => patch({ photo })} className={`overflow-hidden rounded-2xl border-2 ${form.photo === photo ? "border-primary" : "border-transparent"}`}>
                    <img src={photo} alt="" className="aspect-[3/4] w-full object-cover" />
                  </button>
                ))}
              </div>
              <label className="mt-3 block text-sm font-medium text-primary">
                Upload a photo
                <input type="file" accept="image/*" className="mt-1 block text-xs text-muted-foreground" onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) void upload(file, "photo");
                }} />
              </label>
            </section>
          ) : null}
          {current === "Pledge" ? (
            <section className="grid gap-3">
              <h1 className="font-display text-4xl tracking-tight">A few promises</h1>
              <Textarea value={form.bio} onChange={(event) => patch({ bio: event.target.value })} placeholder="A couple of lines a flatmate should know." className="min-h-28 rounded-2xl text-base" />
              {form.gender === "woman" ? (
                <label className="flex items-start gap-3 rounded-2xl border p-3 text-sm">
                  <input type="checkbox" checked={form.womenOnly} onChange={(event) => patch({ womenOnly: event.target.checked })} className="mt-1" />
                  <span>
                    <span className="block font-medium">Women-only mode</span>
                    You'll only see women, and only women will see you. Rooms listed for men stay hidden.
                  </span>
                </label>
              ) : null}
              <label className="flex items-start gap-3 rounded-2xl border p-3 text-sm">
                <input type="checkbox" checked={form.noBrokers} onChange={(event) => patch({ noBrokers: event.target.checked })} className="mt-1" />
                <span>
                  <span className="block font-medium">No-brokers pledge</span>
                  I'm searching or listing for myself. I won't charge a brokerage.
                </span>
              </label>
            </section>
          ) : null}
          {current === "Room" ? (
            <section className="grid gap-3">
              <h1 className="font-display text-4xl tracking-tight">The room</h1>
              <p className="text-sm text-muted-foreground">You can skip this and add it later.</p>
              <Input value={form.title} onChange={(event) => patch({ title: event.target.value })} placeholder="Sunny room in a 2BHK, Indiranagar" className="h-12 rounded-xl px-3" />
              <Textarea value={form.description} onChange={(event) => patch({ description: event.target.value })} placeholder="Who lives there, the deposit, and that it's direct." className="min-h-24 rounded-2xl" />
              <div className="grid grid-cols-2 gap-2">
                <Input inputMode="numeric" value={form.rent} onChange={(event) => patch({ rent: event.target.value })} placeholder="Rent" className="h-12 rounded-xl px-3" />
                <Input inputMode="numeric" value={form.deposit} onChange={(event) => patch({ deposit: event.target.value })} placeholder="Deposit" className="h-12 rounded-xl px-3" />
              </div>
              <Input value={form.locality} onChange={(event) => patch({ locality: event.target.value })} placeholder="Locality" className="h-12 rounded-xl px-3" />
              <Group label="Flat" value={form.flatType} options={FLAT_TYPES} onChange={(flatType) => patch({ flatType })} />
              <Group label="Furnished" value={form.furnished} options={FURNISHED} onChange={(furnished) => patch({ furnished })} />
              <Group label="Open to" value={form.genderPreference} options={GENDER_PREFS} onChange={(genderPreference) => patch({ genderPreference })} />
              <Input type="date" value={form.availableFrom} onChange={(event) => patch({ availableFrom: event.target.value })} className="h-12 rounded-xl px-3" />
              <div className="flex flex-wrap gap-2">
                {AMENITIES.map((amenity) => (
                  <Choice key={amenity} selected={form.amenities.includes(amenity)} onClick={() => toggle(form.amenities, amenity, "amenities")}>{amenity}</Choice>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-2">
                {ROOM_PRESETS.map((photo) => (
                  <button key={photo} type="button" onClick={() => patch({ roomPhoto: photo })} className={`overflow-hidden rounded-xl border-2 ${form.roomPhoto === photo ? "border-primary" : "border-transparent"}`}>
                    <img src={photo} alt="" className="aspect-[3/4] w-full object-cover" />
                  </button>
                ))}
              </div>
              <label className="text-sm font-medium text-primary">
                Upload a room photo
                <input type="file" accept="image/*" className="mt-1 block text-xs text-muted-foreground" onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) void upload(file, "roomPhoto");
                }} />
              </label>
            </section>
          ) : null}
        </div>
        <div className="grid grid-cols-[auto_1fr] gap-2">
          <Button variant="outline" size="xl" disabled={step === 0 || busy} onClick={() => setStep((value) => Math.max(0, value - 1))}>
            Back
          </Button>
          {current === "Room" ? (
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="xl" disabled={busy} onClick={() => finish(false)}>Skip</Button>
              <Button size="xl" disabled={busy} onClick={next}>{busy ? "Saving…" : "Publish"}</Button>
            </div>
          ) : (
            <Button size="xl" disabled={busy} onClick={next}>{busy ? "Saving…" : step === visibleSteps.length - 1 ? "Enter FlatMatch" : "Continue"}</Button>
          )}
        </div>
      </main>
    </AppFrame>
  );
}

function Group({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: readonly { id: string; label: string }[];
  onChange: (id: string) => void;
}) {
  return (
    <div>
      <p className="mb-2 text-sm font-medium">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <Choice key={option.id} selected={value === option.id} onClick={() => onChange(option.id)}>
            {option.label}
          </Choice>
        ))}
      </div>
    </div>
  );
}

function validate(step: string, form: { name: string; age: string; area: string; occupation: string; budgetMin: string; budgetMax: string; languages: string[]; title: string; description: string; locality: string; area2?: string }) {
  if (step === "You" && form.name.trim().length < 2) return "Add your name.";
  if (step === "You" && (Number(form.age) < 18 || Number(form.age) > 70)) return "Age should be between 18 and 70.";
  if (step === "City" && form.area.trim().length < 2) return "Add your neighbourhood.";
  if (step === "Work" && form.occupation.trim().length < 2) return "Add work or college.";
  if (step === "Budget" && Number(form.budgetMin) > Number(form.budgetMax)) return "The minimum budget is higher than the maximum.";
  if (step === "Languages" && form.languages.length === 0) return "Pick at least one language.";
  if (step === "Room") {
    if (form.title.trim().length < 4) return "Give the room a title, or skip for now.";
    if (form.description.trim().length < 10) return "Describe the room in a sentence, or skip.";
    if (form.locality.trim().length < 2) return "Add the locality, or skip.";
  }
  return "";
}
