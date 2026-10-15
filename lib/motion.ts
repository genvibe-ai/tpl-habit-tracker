/** Shared motion: one easing curve and a few springs, so everything moves alike. */
import { Easing } from "react-native-reanimated";

/** Soft ease-out for things that arrive. */
export const EASE = Easing.bezier(0.22, 1, 0.36, 1);
/** Quick, firm spring for presses and toggles. */
export const SNAP = { damping: 22, stiffness: 320, mass: 0.7 };
/** Bouncy spring for the satisfying moments (a habit checked off). */
export const POP = { damping: 11, stiffness: 240, mass: 0.7 };
/** Calm spring for layout and sliding indicators. */
export const GLIDE = { damping: 24, stiffness: 210, mass: 0.9 };
