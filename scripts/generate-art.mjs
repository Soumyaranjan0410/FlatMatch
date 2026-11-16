import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");

const portraits = [
  { id: "ananya", skin: "#E0B08A", shadow: "#C48A62", hair: "#2A1B14", shirt: "#1F4D3A", bgA: "#F6D3BF", bgB: "#E07A5F", hairStyle: "long", blush: "#E39A8C", lip: "#A85A58", bindi: true, smile: "soft", look: 0, seed: 2 },
  { id: "rohan", skin: "#C48A62", shadow: "#A56B45", hair: "#1A120E", shirt: "#24344A", bgA: "#E4E8F0", bgB: "#8AA0C4", hairStyle: "beard", blush: "#D08978", lip: "#8C4E48", smile: "soft", look: 1, seed: 3 },
  { id: "meera", skin: "#A56B45", shadow: "#8D5A3C", hair: "#1A120E", shirt: "#6E3B4A", bgA: "#F3E2C4", bgB: "#D7A15E", hairStyle: "bun", blush: "#C47A68", lip: "#7A3E3A", bindi: true, smile: "grin", look: 0, seed: 4 },
  { id: "kabir", skin: "#C48A62", shadow: "#A56B45", hair: "#24180F", shirt: "#3E342C", bgA: "#E7DFD4", bgB: "#8C7B6B", hairStyle: "short", blush: "#D08978", lip: "#8C4E48", smile: "soft", look: -1, seed: 5 },
  { id: "sneha", skin: "#D9A679", shadow: "#C48A62", hair: "#2A1B14", shirt: "#C24D2C", bgA: "#F8E0D4", bgB: "#E39B78", hairStyle: "wavy", blush: "#E39A8C", lip: "#A85A58", smile: "grin", look: 0, seed: 6 },
  { id: "vikram", skin: "#A56B45", shadow: "#8D5A3C", hair: "#1A120E", shirt: "#1F3A34", bgA: "#DCE7E1", bgB: "#7FA392", hairStyle: "beard", blush: "#C47A68", lip: "#7A3E3A", smile: "soft", glasses: true, look: 0, seed: 7 },
  { id: "diya", skin: "#E6C2A2", shadow: "#D9A679", hair: "#3B2A22", shirt: "#E8B86D", bgA: "#F7E7C8", bgB: "#E2B15A", hairStyle: "bob", blush: "#E8A898", lip: "#B56A64", smile: "grin", look: 1, seed: 8 },
  { id: "arjun", skin: "#D9A679", shadow: "#C48A62", hair: "#24180F", shirt: "#1F4D3A", bgA: "#E5F0E8", bgB: "#8FB89A", hairStyle: "short", blush: "#E39A8C", lip: "#A85A58", smile: "grin", look: 0, seed: 9 },
  { id: "aisha", skin: "#E0B08A", shadow: "#C48A62", hair: "#1A120E", shirt: "#F4E7D4", bgA: "#F6E4D8", bgB: "#D9A08A", hairStyle: "hijab", hijab: "#6E3B4A", hijabEdge: "#F6E7DC", blush: "#E39A8C", lip: "#A85A58", smile: "soft", look: 0, seed: 10 },
  { id: "pooja", skin: "#C48A62", shadow: "#A56B45", hair: "#2A1B14", shirt: "#8C3E4A", bgA: "#F8DDE4", bgB: "#D9899A", hairStyle: "long", blush: "#D08978", lip: "#8C4E48", bindi: true, smile: "soft", look: -1, seed: 11 },
  { id: "neel", skin: "#E6C2A2", shadow: "#D9A679", hair: "#3B2A22", shirt: "#3D5568", bgA: "#E7EEF4", bgB: "#9BB0C4", hairStyle: "curly", blush: "#E8A898", lip: "#B56A64", smile: "grin", look: 0, seed: 12 },
  { id: "ishaan", skin: "#D9A679", shadow: "#C48A62", hair: "#1A120E", shirt: "#24344A", bgA: "#E8E4DC", bgB: "#B7A48A", hairStyle: "beard", blush: "#E39A8C", lip: "#A85A58", smile: "soft", glasses: true, look: 1, seed: 13 },
  { id: "zara", skin: "#E6C2A2", shadow: "#D9A679", hair: "#5C4033", shirt: "#1C1915", bgA: "#F3E6F0", bgB: "#C9A4C4", hairStyle: "wavy", blush: "#E8A898", lip: "#B56A64", smile: "soft", look: 0, seed: 14 },
  { id: "rahul", skin: "#A56B45", shadow: "#8D5A3C", hair: "#1A120E", shirt: "#C24D2C", bgA: "#F6DDD2", bgB: "#D98A6A", hairStyle: "short", blush: "#C47A68", lip: "#7A3E3A", smile: "grin", look: 0, seed: 15 },
  { id: "fatima", skin: "#C48A62", shadow: "#A56B45", hair: "#1A120E", shirt: "#F7F1EA", bgA: "#EFE6D8", bgB: "#C9B59A", hairStyle: "hijab", hijab: "#1F4D3A", hijabEdge: "#E7F0EA", blush: "#D08978", lip: "#8C4E48", smile: "soft", look: 1, seed: 16 },
  { id: "nikhil", skin: "#E0B08A", shadow: "#C48A62", hair: "#2A1B14", shirt: "#EFE6D4", bgA: "#F7F1E6", bgB: "#D9C4A4", hairStyle: "short", blush: "#E39A8C", lip: "#A85A58", glasses: true, smile: "soft", look: 0, seed: 17 },
  { id: "kavya", skin: "#A56B45", shadow: "#8D5A3C", hair: "#1A120E", shirt: "#F2C14E", bgA: "#F8E7C4", bgB: "#E2B15A", hairStyle: "bob", blush: "#C47A68", lip: "#7A3E3A", bindi: true, smile: "grin", look: 0, seed: 18 },
  { id: "imran", skin: "#8D5A3C", shadow: "#704830", hair: "#140E0C", shirt: "#3E342C", bgA: "#2C3338", bgB: "#6A5A4A", hairStyle: "beard", blush: "#A86A58", lip: "#6E3A36", smile: "soft", look: -1, seed: 19 },
  { id: "harpreet", skin: "#D9A679", shadow: "#C48A62", hair: "#1A120E", shirt: "#1F3A5F", bgA: "#E4EAF2", bgB: "#8FA4C0", hairStyle: "beard", blush: "#E39A8C", lip: "#A85A58", smile: "grin", look: 0, seed: 20 },
  { id: "tanvi", skin: "#E0B08A", shadow: "#C48A62", hair: "#2A1B14", shirt: "#F7F1EA", bgA: "#F8E8DC", bgB: "#E2B8A0", hairStyle: "bun", blush: "#E39A8C", lip: "#A85A58", smile: "grin", look: 1, seed: 21 },
  { id: "nandini", skin: "#C48A62", shadow: "#A56B45", hair: "#24180F", shirt: "#6E3B4A", bgA: "#F6E0D8", bgB: "#D98B78", hairStyle: "long", blush: "#D08978", lip: "#8C4E48", bindi: true, smile: "soft", look: 0, seed: 22 },
  { id: "preset1", skin: "#E6C2A2", shadow: "#D9A679", hair: "#2A1B14", shirt: "#C24D2C", bgA: "#F8E0D4", bgB: "#E39B78", hairStyle: "bob", blush: "#E8A898", lip: "#B56A64", smile: "grin", look: 0, seed: 31 },
  { id: "preset2", skin: "#C48A62", shadow: "#A56B45", hair: "#1A120E", shirt: "#1F4D3A", bgA: "#E5F0E8", bgB: "#8FB89A", hairStyle: "beard", blush: "#D08978", lip: "#8C4E48", smile: "soft", look: 1, seed: 32 },
  { id: "preset3", skin: "#A56B45", shadow: "#8D5A3C", hair: "#1A120E", shirt: "#24344A", bgA: "#E4E8F0", bgB: "#8AA0C4", hairStyle: "bun", blush: "#C47A68", lip: "#7A3E3A", bindi: true, smile: "soft", look: 0, seed: 33 },
  { id: "preset4", skin: "#D9A679", shadow: "#C48A62", hair: "#3B2A22", shirt: "#E8B86D", bgA: "#F7E7C8", bgB: "#E2B15A", hairStyle: "curly", blush: "#E39A8C", lip: "#A85A58", smile: "grin", look: -1, seed: 34 },
  { id: "preset5", skin: "#E0B08A", shadow: "#C48A62", hair: "#1A120E", shirt: "#F4E7D4", bgA: "#EFE6D8", bgB: "#C9B59A", hairStyle: "hijab", hijab: "#24344A", hijabEdge: "#F4EFE6", blush: "#E39A8C", lip: "#A85A58", smile: "soft", look: 0, seed: 35 },
  { id: "preset6", skin: "#8D5A3C", shadow: "#704830", hair: "#140E0C", shirt: "#1C1915", bgA: "#E7DFD4", bgB: "#8C7B6B", hairStyle: "short", blush: "#A86A58", lip: "#6E3A36", smile: "soft", look: 0, seed: 36 },
  { id: "preset7", skin: "#E6C2A2", shadow: "#D9A679", hair: "#5C4033", shirt: "#6E3B4A", bgA: "#F3E6F0", bgB: "#C9A4C4", hairStyle: "wavy", blush: "#E8A898", lip: "#B56A64", smile: "grin", look: 1, seed: 37 },
  { id: "preset8", skin: "#C48A62", shadow: "#A56B45", hair: "#24180F", shirt: "#1F3A5F", bgA: "#F6D3BF", bgB: "#E07A5F", hairStyle: "long", blush: "#D08978", lip: "#8C4E48", glasses: true, smile: "soft", look: 0, seed: 38 },
];

const rooms = [
  { id: "indiranagar", wall: "#F4E7D8", wall2: "#E7CDB4", floor: "#C4A484", wood: "#8C5A3C", linen: "#F7F1EA", accent: "#C24D2C", sky: "#F2C14E", kind: "bed" },
  { id: "hsr", wall: "#F7F1EA", wall2: "#E4D5C4", floor: "#D8C3A5", wood: "#6E4B38", linen: "#FFFFFF", accent: "#1F4D3A", sky: "#9EC4E0", kind: "bed" },
  { id: "jayanagar", wall: "#E7EEF2", wall2: "#D5E0E6", floor: "#C8B79A", wood: "#5C4636", linen: "#F4EFE6", accent: "#3D5568", sky: "#F6E3A1", kind: "bed" },
  { id: "baner", wall: "#E7F0EA", wall2: "#D3E4D8", floor: "#CDB892", wood: "#6B4A34", linen: "#FBF8F2", accent: "#E07A5F", sky: "#B7D4C4", kind: "bed" },
  { id: "andheri", wall: "#F3E6DC", wall2: "#E4CBBA", floor: "#B99674", wood: "#4E382C", linen: "#F7F3EC", accent: "#1F3A5F", sky: "#F0B56A", kind: "bed" },
  { id: "powai", wall: "#E8EEF4", wall2: "#D4DEE8", floor: "#C9B48E", wood: "#6A5344", linen: "#F8F5EF", accent: "#2F6B4A", sky: "#8FB4D4", kind: "bed" },
  { id: "dadar", wall: "#F6EFE4", wall2: "#E6D5C0", floor: "#D2B48C", wood: "#7A5A40", linen: "#FFFDF8", accent: "#6E3B4A", sky: "#F2D48A", kind: "pg" },
  { id: "kp", wall: "#2E3438", wall2: "#3E474C", floor: "#5C5148", wood: "#C4A484", linen: "#E7D7C4", accent: "#E2B15A", sky: "#1C2430", kind: "studio" },
  { id: "whitefield", wall: "#F8F1E6", wall2: "#EADCC8", floor: "#CDB892", wood: "#8A6248", linen: "#FFFFFF", accent: "#C24D2C", sky: "#F6D78A", kind: "bed" },
  { id: "koramangala-pg", wall: "#F8E4E0", wall2: "#F0D0C8", floor: "#E0C2A4", wood: "#A86B52", linen: "#FFF8F4", accent: "#1F4D3A", sky: "#F2C9A0", kind: "pg" },
];

function portrait(p) {
  const bangs = ["bob", "long", "wavy"].includes(p.hairStyle);
  const hairBack = {
    short: `<ellipse cx="180" cy="168" rx="84" ry="72" fill="${p.hair}"/>`,
    bob: `<path d="M96 190 C92 112 124 92 180 90 C236 92 268 112 264 190 C270 270 248 330 228 352 L132 352 C112 330 90 270 96 190Z" fill="${p.hair}"/>`,
    long: `<path d="M88 186 C78 104 122 80 180 78 C238 80 282 104 272 186 C286 310 268 430 236 468 L124 468 C92 430 74 310 88 186Z" fill="${p.hair}"/>`,
    bun: `<circle cx="180" cy="84" r="32" fill="${p.hair}"/><ellipse cx="180" cy="172" rx="86" ry="74" fill="${p.hair}"/>`,
    wavy: `<path d="M72 220 C62 118 124 82 180 80 C236 82 298 118 288 220 C308 330 274 440 246 472 L114 472 C86 440 52 330 72 220Z" fill="${p.hair}"/>`,
    curly:
      Array.from({ length: 9 }, (_, i) => {
        const a = -2.5 + (i / 8) * 2.7;
        const cx = 180 + Math.cos(a) * 90;
        const cy = 170 + Math.sin(a) * 76;
        return `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="28" fill="${p.hair}"/>`;
      }).join("") + `<ellipse cx="180" cy="176" rx="76" ry="68" fill="${p.hair}"/>`,
    beard: `<ellipse cx="180" cy="164" rx="82" ry="68" fill="${p.hair}"/>`,
    hijab: "",
  }[p.hairStyle];

  const beard =
    p.hairStyle === "beard"
      ? `<path d="M126 246 C132 312 152 332 180 334 C208 332 228 312 234 246 C214 278 196 286 180 286 C164 286 146 278 126 246Z" fill="${p.hair}"/>`
      : "";
  const hijab =
    p.hairStyle === "hijab"
      ? `<path d="M64 236 C62 96 108 54 180 50 C252 54 298 96 296 236 L280 470 L80 470 Z" fill="${p.hijab}"/>`
      : "";
  const look = p.look || 0;
  const eyeY = 200;
  const mouth =
    p.smile === "grin"
      ? `<path d="M156 244 Q180 266 204 244 Q182 258 156 244Z" fill="${p.lip}"/>`
      : `<path d="M160 246 Q180 258 200 246" fill="none" stroke="${p.lip}" stroke-width="3.4" stroke-linecap="round"/>`;
  const glasses = p.glasses
    ? `<g fill="none" stroke="#1C1915" stroke-width="3" stroke-linecap="round"><circle cx="152" cy="${eyeY}" r="18"/><circle cx="208" cy="${eyeY}" r="18"/><path d="M170 ${eyeY} H190"/><path d="M134 ${eyeY - 2} H116"/><path d="M226 ${eyeY - 2} H244"/></g>`
    : "";
  const bangsPath = bangs
    ? `<path d="M118 150 Q152 178 180 152 Q208 178 242 150 L240 128 Q180 108 120 128 Z" fill="${p.hair}"/>`
    : "";

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 480" role="img">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${p.bgA}"/><stop offset="1" stop-color="${p.bgB}"/>
    </linearGradient>
    <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" seed="${p.seed}"/><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncA type="linear" slope="0.22"/></feComponentTransfer></filter>
  </defs>
  <rect width="360" height="480" fill="url(#bg)"/>
  <rect width="360" height="480" filter="url(#grain)"/>
  <circle cx="28" cy="36" r="78" fill="#fff" opacity="0.16"/>
  <circle cx="330" cy="430" r="110" fill="#1C1915" opacity="0.06"/>
  <ellipse cx="180" cy="548" rx="190" ry="180" fill="${p.shirt}"/>
  <path d="M118 330 Q180 300 242 330 L260 470 L100 470 Z" fill="${p.skin}" opacity="0.0"/>
  <rect x="158" y="292" width="44" height="40" rx="16" fill="${p.skin}"/>
  ${hijab || hairBack}
  ${p.hairStyle === "hijab" ? "" : `<ellipse cx="102" cy="216" rx="12" ry="16" fill="${p.shadow}"/><ellipse cx="258" cy="216" rx="12" ry="16" fill="${p.shadow}"/>`}
  <ellipse cx="180" cy="208" rx="72" ry="84" fill="${p.skin}"/>
  ${beard}
  <ellipse cx="136" cy="228" rx="16" ry="8" fill="${p.blush}" opacity="0.5"/>
  <ellipse cx="224" cy="228" rx="16" ry="8" fill="${p.blush}" opacity="0.5"/>
  <path d="M132 178 Q150 170 166 180" fill="none" stroke="${p.hairStyle === "hijab" ? p.shadow : p.hair}" stroke-width="3.5" stroke-linecap="round"/>
  <path d="M194 180 Q210 170 228 178" fill="none" stroke="${p.hairStyle === "hijab" ? p.shadow : p.hair}" stroke-width="3.5" stroke-linecap="round"/>
  <ellipse cx="152" cy="${eyeY}" rx="13" ry="8.5" fill="#fff"/>
  <ellipse cx="208" cy="${eyeY}" rx="13" ry="8.5" fill="#fff"/>
  <circle cx="${152 + look}" cy="${eyeY + 1}" r="5.1" fill="#24180F"/>
  <circle cx="${208 + look}" cy="${eyeY + 1}" r="5.1" fill="#24180F"/>
  <circle cx="${153 + look}" cy="${eyeY - 1.2}" r="1.5" fill="#fff"/>
  <circle cx="${209 + look}" cy="${eyeY - 1.2}" r="1.5" fill="#fff"/>
  <path d="M176 208 Q186 226 168 232" fill="none" stroke="${p.shadow}" stroke-width="2.5" stroke-linecap="round"/>
  ${mouth}
  ${bangsPath}
  ${p.bindi ? `<circle cx="180" cy="176" r="3.1" fill="#9D2C3A"/>` : ""}
  ${glasses}
  ${p.hairStyle === "hijab" ? `<path d="M112 176 C132 138 228 138 248 176" fill="none" stroke="${p.hijabEdge}" stroke-width="7" stroke-linecap="round"/>` : ""}
</svg>`;
}

function room(r) {
  const skyGlow = r.kind === "studio" ? "#F2D48A" : "#FFF6D8";
  const bed =
    r.kind === "pg"
      ? `<rect x="48" y="168" width="168" height="28" rx="6" fill="${r.wood}"/>
         <rect x="56" y="150" width="152" height="22" rx="6" fill="${r.linen}"/>
         <rect x="64" y="156" width="40" height="12" rx="3" fill="${r.accent}"/>
         <rect x="48" y="268" width="168" height="36" rx="6" fill="${r.wood}"/>
         <rect x="56" y="248" width="152" height="26" rx="6" fill="${r.linen}"/>
         <rect x="64" y="254" width="40" height="14" rx="3" fill="${r.accent}"/>
         <rect x="40" y="196" width="10" height="110" rx="3" fill="${r.wood}"/>`
      : r.kind === "studio"
        ? `<rect x="40" y="250" width="150" height="78" rx="16" fill="${r.wood}"/>
           <rect x="52" y="236" width="126" height="58" rx="12" fill="${r.linen}"/>
           <rect x="64" y="248" width="46" height="24" rx="6" fill="${r.accent}"/>
           <rect x="210" y="280" width="110" height="46" rx="12" fill="#3A4248"/>
           <rect x="224" y="268" width="36" height="16" rx="4" fill="${r.accent}"/>
           <circle cx="250" cy="120" r="10" fill="${skyGlow}"/>
           <line x1="250" y1="130" x2="250" y2="210" stroke="${skyGlow}" stroke-width="2" opacity="0.7"/>`
        : `<rect x="36" y="248" width="210" height="120" rx="18" fill="${r.wood}"/>
           <rect x="48" y="228" width="186" height="92" rx="14" fill="${r.linen}"/>
           <rect x="60" y="242" width="58" height="34" rx="8" fill="#fff" opacity="0.92"/>
           <rect x="128" y="268" width="86" height="20" rx="8" fill="${r.accent}"/>
           <rect x="36" y="210" width="210" height="28" rx="8" fill="${r.wood}"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 480" role="img">
  <defs>
    <linearGradient id="w" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${r.wall}"/><stop offset="1" stop-color="${r.wall2}"/>
    </linearGradient>
  </defs>
  <rect width="360" height="480" fill="url(#w)"/>
  <rect y="340" width="360" height="140" fill="${r.floor}"/>
  <rect x="188" y="58" width="128" height="150" rx="10" fill="${r.sky}"/>
  <circle cx="292" cy="104" r="18" fill="${skyGlow}" opacity="${r.kind === "studio" ? 0.95 : 0.85}"/>
  <rect x="188" y="58" width="128" height="150" rx="10" fill="none" stroke="#1C1915" stroke-opacity="0.35" stroke-width="7"/>
  <path d="M252 58 V208 M188 132 H316" stroke="#1C1915" stroke-opacity="0.28" stroke-width="4"/>
  <ellipse cx="170" cy="410" rx="130" ry="26" fill="${r.accent}" opacity="0.55"/>
  ${bed}
  <rect x="286" y="300" width="26" height="36" rx="6" fill="#C46B4A"/>
  <ellipse cx="299" cy="292" rx="28" ry="16" fill="#2F6B4A"/>
  <ellipse cx="282" cy="278" rx="16" ry="12" fill="#3E8A60"/>
  <ellipse cx="316" cy="274" rx="14" ry="11" fill="#245C3E"/>
  <path d="M78 228 V176" stroke="#1C1915" stroke-width="3" stroke-linecap="round" opacity="${r.kind === "pg" ? 0 : 0.8}"/>
  <path d="M56 176 H100 L94 196 H62 Z" fill="#F2D48A" opacity="${r.kind === "pg" ? 0 : 1}"/>
</svg>`;
}

await mkdir(path.join(root, "public/portraits"), { recursive: true });
await mkdir(path.join(root, "public/rooms"), { recursive: true });
await mkdir(path.join(root, "public/uploads"), { recursive: true });

for (const person of portraits) {
  await writeFile(path.join(root, "public/portraits", `${person.id}.svg`), portrait(person));
}
for (const item of rooms) {
  await writeFile(path.join(root, "public/rooms", `${item.id}.svg`), room(item));
}
await writeFile(path.join(root, "public/uploads/.gitkeep"), "");
await writeFile(
  path.join(root, "src/app/icon.svg"),
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="8" fill="#C24D2C"/><path d="M7 17.5 16 9l9 8.5" fill="none" stroke="#fff" stroke-width="2.2" stroke-linejoin="round"/><path d="M11 16.8V24h10v-7.2" fill="none" stroke="#fff" stroke-width="2.2" stroke-linejoin="round"/></svg>`,
);
console.log(`wrote ${portraits.length} portraits and ${rooms.length} rooms`);
