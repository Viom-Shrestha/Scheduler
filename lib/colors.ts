export interface Swatch {
  dot: string;
  soft: string;
  ink: string;
  shadow: string;
}

// Palette lifted from the design reference. Cycles for any project beyond
// the first five so a new free-text project name always gets a color.
const PALETTE: Swatch[] = [
  { dot: "#5B4BD6", soft: "#EFE0FB", ink: "#3B2E9B", shadow: "rgba(91, 75, 214, 0.35)" }, // violet
  { dot: "#00BFA6", soft: "#D2F4EF", ink: "#00695C", shadow: "rgba(0, 191, 166, 0.32)" }, // teal
  { dot: "#8E4EE0", soft: "#EFE0FB", ink: "#5B2A93", shadow: "rgba(142, 78, 224, 0.32)" }, // purple
  { dot: "#FF3F7F", soft: "#FFDCE8", ink: "#C21A55", shadow: "rgba(255, 63, 127, 0.32)" }, // pink
  { dot: "#2FA9F5", soft: "#DCEDFE", ink: "#0B5C9B", shadow: "rgba(47, 169, 245, 0.32)" }, // blue
];

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

export function projectSwatch(project: string): Swatch {
  return PALETTE[hashString(project) % PALETTE.length];
}

export function projectInitials(project: string): string {
  const words = project.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "??";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

export const GLYPH = {
  drop: "polygon(50% 0, 100% 55%, 50% 100%, 0 55%)",
  circle: "circle(50% at 50% 50%)",
  star: "polygon(50% 0, 61% 39%, 100% 50%, 61% 61%, 50% 100%, 39% 61%, 0 50%, 39% 39%)",
  check: "polygon(43% 73%, 88% 12%, 100% 26%, 47% 96%, 0 58%, 12% 42%)",
} as const;

export const LANE_META = {
  active: { color: "#5B4BD6", bg: "#EFE0FB", fg: "#3B2E9B", glyph: GLYPH.drop },
  waiting: { color: "#00BFA6", bg: "#D2F4EF", fg: "#00695C", glyph: GLYPH.circle },
  someday: { color: "#8E4EE0", bg: "#EFE0FB", fg: "#5B2A93", glyph: GLYPH.star },
  done: { color: "#2FA9F5", bg: "#DCEDFE", fg: "#0B5C9B", glyph: GLYPH.check },
} as const;
