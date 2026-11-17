"use client";

import { useEffect, useState } from "react";

export type Lang = "en" | "hi";

const STRINGS = {
  en: {
    discover: "Discover",
    matches: "Matches",
    room: "Room",
    you: "You",
    rooms: "Rooms",
    people: "People",
    filters: "Filters",
    verifiedOnly: "Verified profiles only",
    hidden: "Number hidden until you match",
    brokerage: "Brokerage",
    zero: "₹0",
    notPledged: "Not pledged",
    brokerFlags: "Broker reports",
    match: "It's a match",
    send: "Send a message",
    keep: "Keep swiping",
    shareVisit: "Share my visit",
    shareNumber: "Share my number",
    language: "Language",
  },
  hi: {
    discover: "खोजें",
    matches: "मैच",
    room: "कमरा",
    you: "आप",
    rooms: "कमरे",
    people: "लोग",
    filters: "फ़िल्टर",
    verifiedOnly: "सिर्फ़ वेरिफ़ाइड प्रोफ़ाइल",
    hidden: "मैच से पहले नंबर छिपा है",
    brokerage: "दलाली",
    zero: "₹0",
    notPledged: "वाद नहीं",
    brokerFlags: "ब्रोकर रिपोर्ट",
    match: "मैच हो गया",
    send: "मैसेज भेजें",
    keep: "स्वाइप जारी रखें",
    shareVisit: "विज़िट शेयर करें",
    shareNumber: "नंबर शेयर करें",
    language: "भाषा",
  },
} as const;

export type StringKey = keyof (typeof STRINGS)["en"];

const listeners = new Set<(lang: Lang) => void>();

function readLang(): Lang {
  if (typeof window === "undefined") return "en";
  return window.localStorage.getItem("flatmatch-lang") === "hi" ? "hi" : "en";
}

export function useLang() {
  const [lang, setLang] = useState<Lang>("en");

  useEffect(() => {
    setLang(readLang());
    const onChange = (next: Lang) => setLang(next);
    listeners.add(onChange);
    return () => {
      listeners.delete(onChange);
    };
  }, []);

  function set(next: Lang) {
    window.localStorage.setItem("flatmatch-lang", next);
    listeners.forEach((listener) => listener(next));
  }

  function t(key: StringKey) {
    return STRINGS[lang][key];
  }

  return { lang, setLang: set, t };
}
