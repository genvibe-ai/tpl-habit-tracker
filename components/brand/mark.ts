/**
 * The Tendril mark: a sprout whose stem curls into a tendril. Drawn in a
 * 120 × 120 box; the same shapes make the app icon (assets/images).
 */
export const MARK = {
  /** A square box around the sprout, for drawing it without the icon background. */
  viewBox: "12 14 96 96",
  box: { x: 12, y: 14, size: 96 },
  stem: "M60 104 C60 90 54 80 56 67 C58 54 68 47 68 35 C68 23 57 18 50 24 C44 29 47 38 54 37 C59 36 60 30 56 29",
  /** Measured with getTotalLength(), for the drawing animation. */
  stemLength: 129,
  leftLeaf: "M57 74 Q37 77 31 57 Q51 54 57 74 Z",
  leftVein: "M56 72 Q46 66 36 60",
  rightLeaf: "M62 58 Q78 64 89 46 Q70 41 62 58 Z",
  rightVein: "M63.5 56 Q74 52 84 47.5",
  /** Where each leaf joins the stem (they grow from here). */
  leftBase: { x: 57, y: 74 },
  rightBase: { x: 62, y: 58 },
  colors: {
    stem: ["#2DD4BF", "#4ADE80", "#C2F57A"],
    leftLeaf: ["#2FCB8E", "#5BE38A"],
    rightLeaf: ["#4ADE80", "#B8F26E"],
    vein: "#0B0F0C",
  },
};
