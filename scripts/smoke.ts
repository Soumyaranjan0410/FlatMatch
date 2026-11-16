const base = process.env.BASE_URL || "http://127.0.0.1:3847";

function jar() {
  const cookies = new Map<string, string>();
  return {
    async fetch(path: string, init: RequestInit = {}) {
      const headers = new Headers(init.headers);
      const cookie = [...cookies.entries()].map(([key, value]) => `${key}=${value}`).join("; ");
      if (cookie) headers.set("cookie", cookie);
      if (init.body && !headers.has("content-type")) headers.set("content-type", "application/json");
      const res = await fetch(`${base}${path}`, { ...init, headers });
      const setCookie = res.headers.getSetCookie?.() || [];
      for (const item of setCookie) {
        const [pair] = item.split(";");
        const eq = pair.indexOf("=");
        cookies.set(pair.slice(0, eq), pair.slice(eq + 1));
      }
      const text = await res.text();
      const data = text ? JSON.parse(text) : {};
      if (!res.ok) throw new Error(`${res.status} ${path} ${data.error || text}`);
      return data;
    },
  };
}

async function main() {
  const ananya = jar();
  await ananya.fetch("/api/auth/demo", { method: "POST", body: JSON.stringify({ loginId: "9845001001" }) });
  const me = await ananya.fetch("/api/me");
  if (me.user.name !== "Ananya Sharma") throw new Error("Demo login failed");
  const deck = await ananya.fetch("/api/deck?mode=rooms&city=Bengaluru&budgetMin=10000&budgetMax=36000&gender=any&moveInStrict=1");
  if (!deck.cards.length) throw new Error("Ananya has an empty deck");
  const hidden = deck.cards.some((card: { person: { name: string; gender: string } }) => card.person.gender === "man" && card.person.name === "should-not");
  void hidden;
  let matched = false;
  for (const card of deck.cards.slice(0, 8)) {
    const result = await ananya.fetch("/api/swipe", {
      method: "POST",
      body: JSON.stringify({
        targetType: "listing",
        targetId: card.listing.id,
        direction: "like",
      }),
    });
    if (result.matched && !result.already) {
      matched = true;
      const sent = await ananya.fetch(`/api/matches/${result.match.id}`, {
        method: "POST",
        body: JSON.stringify({ body: "Smoke test — is Saturday still good?" }),
      });
      if (!sent.message.body.includes("Saturday")) throw new Error("Message missing");
      const thread = await ananya.fetch(`/api/matches/${result.match.id}`);
      if (!thread.messages.some((message: { body: string }) => message.body.includes("Saturday"))) {
        throw new Error("Message not persisted");
      }
      break;
    }
  }
  if (!matched) throw new Error("No mutual match from the first rooms");

  const man = jar();
  const phone = `9${String(Date.now()).slice(-9)}`;
  await man.fetch("/api/auth/otp", { method: "POST", body: JSON.stringify({ identifier: phone }) });
  const verified = await man.fetch("/api/auth/verify", {
    method: "POST",
    body: JSON.stringify({ identifier: phone, code: "123456" }),
  });
  if (verified.next !== "onboarding") throw new Error("New user should onboard");
  await man.fetch("/api/onboarding", {
    method: "POST",
    body: JSON.stringify({
      name: "Smoke Tester",
      age: 27,
      gender: "man",
      role: "seeker",
      city: "Mumbai",
      area: "Andheri West",
      occupation: "QA engineer",
      budgetMin: 12000,
      budgetMax: 40000,
      moveInDate: "2026-12-01",
      diet: "nonveg",
      smoking: "no",
      drinking: "socially",
      pets: "no",
      guests: "sometimes",
      schedule: "standard",
      cleanliness: 3,
      languages: ["Hindi", "English"],
      photo: "/portraits/preset2.svg",
      bio: "Smoke test profile.",
      womenOnly: false,
      noBrokers: true,
    }),
  });
  const mumbai = await man.fetch("/api/deck?mode=people&city=all&budgetMin=4000&budgetMax=80000&gender=any&moveInStrict=0");
  const names = mumbai.cards.map((card: { person: { name: string } }) => card.person.name);
  for (const blocked of ["Fatima Sheikh", "Sneha Reddy", "Kavya Natarajan", "Nandini Rao"]) {
    if (names.includes(blocked)) throw new Error(`Man can see women-only profile ${blocked}`);
  }
  if (!names.includes("Ishaan Kapoor") && !names.includes("Rahul Nair")) {
    throw new Error(`Expected Mumbai men in deck, got ${names.join(", ")}`);
  }

  const woman = jar();
  await woman.fetch("/api/auth/demo", { method: "POST", body: JSON.stringify({ loginId: "9845001015" }) });
  const womenDeck = await woman.fetch("/api/deck?mode=people&city=all&budgetMin=4000&budgetMax=80000&gender=woman&moveInStrict=0");
  const genders = new Set(womenDeck.cards.map((card: { person: { gender: string } }) => card.person.gender));
  if (genders.has("man")) throw new Error("Women-only user can see men");

  console.log("Smoke test passed.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
