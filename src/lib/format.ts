export function inr(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function prettyDate(iso: string) {
  if (!iso) return "";
  const date = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export function shortDate(iso: string) {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const now = new Date();
  const sameDay = date.toDateString() === now.toDateString();
  if (sameDay) {
    return date.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });
  }
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export function flatLabel(id: string) {
  if (id === "coliving") return "Co-living";
  if (id === "PG") return "PG";
  if (id.endsWith("BHK")) return id.replace("BHK", " BHK");
  return id;
}

export function furnishedLabel(id: string) {
  if (id === "semi") return "Semi-furnished";
  if (id === "furnished") return "Furnished";
  if (id === "unfurnished") return "Unfurnished";
  return id;
}

export function phoneLabel(phone: string) {
  if (!phone || phone.length !== 10) return phone;
  return `+91 ${phone.slice(0, 5)} ${phone.slice(5)}`;
}
