/**
 * Every icon in the app, from Lucide (lucide.dev, ISC license), drawn with
 * react-native-svg so they look the same on iPhone, Android and the web.
 *
 * Import each icon from "lucide-react-native/icons/<name>" (never from the
 * package root, which would bundle all 3,700 icons). Habits save their icon
 * by key, so keep existing keys when you add new ones.
 */
import type { LucideIcon } from "lucide-react-native";
import Apple from "lucide-react-native/icons/apple";
import Archive from "lucide-react-native/icons/archive";
import ArchiveRestore from "lucide-react-native/icons/archive-restore";
import Bean from "lucide-react-native/icons/bean";
import Bed from "lucide-react-native/icons/bed";
import Bell from "lucide-react-native/icons/bell";
import BellRing from "lucide-react-native/icons/bell-ring";
import Bike from "lucide-react-native/icons/bike";
import BookOpen from "lucide-react-native/icons/book-open";
import Brain from "lucide-react-native/icons/brain";
import Calendar from "lucide-react-native/icons/calendar";
import CalendarCheck from "lucide-react-native/icons/calendar-check";
import Camera from "lucide-react-native/icons/camera";
import ChartColumn from "lucide-react-native/icons/chart-column";
import Check from "lucide-react-native/icons/check";
import ChefHat from "lucide-react-native/icons/chef-hat";
import ChevronDown from "lucide-react-native/icons/chevron-down";
import ChevronLeft from "lucide-react-native/icons/chevron-left";
import ChevronRight from "lucide-react-native/icons/chevron-right";
import Clock from "lucide-react-native/icons/clock";
import Code from "lucide-react-native/icons/code";
import Coffee from "lucide-react-native/icons/coffee";
import Dog from "lucide-react-native/icons/dog";
import Dumbbell from "lucide-react-native/icons/dumbbell";
import Flame from "lucide-react-native/icons/flame";
import Flower2 from "lucide-react-native/icons/flower-2";
import Footprints from "lucide-react-native/icons/footprints";
import GlassWater from "lucide-react-native/icons/glass-water";
import GraduationCap from "lucide-react-native/icons/graduation-cap";
import Guitar from "lucide-react-native/icons/guitar";
import HandHeart from "lucide-react-native/icons/hand-heart";
import HeartPulse from "lucide-react-native/icons/heart-pulse";
import House from "lucide-react-native/icons/house";
import Languages from "lucide-react-native/icons/languages";
import Leaf from "lucide-react-native/icons/leaf";
import Lightbulb from "lucide-react-native/icons/lightbulb";
import Minus from "lucide-react-native/icons/minus";
import Moon from "lucide-react-native/icons/moon";
import Music from "lucide-react-native/icons/music";
import NotebookPen from "lucide-react-native/icons/notebook-pen";
import Palette from "lucide-react-native/icons/palette";
import PenLine from "lucide-react-native/icons/pen-line";
import Pencil from "lucide-react-native/icons/pencil";
import PersonStanding from "lucide-react-native/icons/person-standing";
import PhoneOff from "lucide-react-native/icons/phone-off";
import PiggyBank from "lucide-react-native/icons/piggy-bank";
import Pill from "lucide-react-native/icons/pill";
import Plus from "lucide-react-native/icons/plus";
import RotateCcw from "lucide-react-native/icons/rotate-ccw";
import Salad from "lucide-react-native/icons/salad";
import Settings2 from "lucide-react-native/icons/settings-2";
import ShieldCheck from "lucide-react-native/icons/shield-check";
import Shrub from "lucide-react-native/icons/shrub";
import Sparkles from "lucide-react-native/icons/sparkles";
import Sprout from "lucide-react-native/icons/sprout";
import Sun from "lucide-react-native/icons/sun";
import SunMoon from "lucide-react-native/icons/sun-moon";
import Sunrise from "lucide-react-native/icons/sunrise";
import Sunset from "lucide-react-native/icons/sunset";
import Target from "lucide-react-native/icons/target";
import Timer from "lucide-react-native/icons/timer";
import Trash from "lucide-react-native/icons/trash";
import TreeDeciduous from "lucide-react-native/icons/tree-deciduous";
import Trophy from "lucide-react-native/icons/trophy";
import UserRound from "lucide-react-native/icons/user-round";
import Vibrate from "lucide-react-native/icons/vibrate";
import Wind from "lucide-react-native/icons/wind";
import X from "lucide-react-native/icons/x";

export const ICONS = {
  // Habit icons (the picker shows the ones listed in content.ts → habitIcons)
  apple: Apple,
  bed: Bed,
  bike: Bike,
  "book-open": BookOpen,
  brain: Brain,
  camera: Camera,
  "chef-hat": ChefHat,
  code: Code,
  coffee: Coffee,
  dog: Dog,
  dumbbell: Dumbbell,
  "flower-2": Flower2,
  footprints: Footprints,
  "glass-water": GlassWater,
  "graduation-cap": GraduationCap,
  guitar: Guitar,
  "hand-heart": HandHeart,
  "heart-pulse": HeartPulse,
  house: House,
  languages: Languages,
  leaf: Leaf,
  lightbulb: Lightbulb,
  moon: Moon,
  music: Music,
  "notebook-pen": NotebookPen,
  palette: Palette,
  "pen-line": PenLine,
  "person-standing": PersonStanding,
  "phone-off": PhoneOff,
  "piggy-bank": PiggyBank,
  pill: Pill,
  salad: Salad,
  sparkles: Sparkles,
  sprout: Sprout,
  sun: Sun,
  sunrise: Sunrise,
  target: Target,
  timer: Timer,
  wind: Wind,

  // Interface
  archive: Archive,
  "archive-restore": ArchiveRestore,
  bell: Bell,
  "bell-ring": BellRing,
  calendar: Calendar,
  "calendar-check": CalendarCheck,
  "chart-column": ChartColumn,
  check: Check,
  "chevron-down": ChevronDown,
  "chevron-left": ChevronLeft,
  "chevron-right": ChevronRight,
  clock: Clock,
  flame: Flame,
  minus: Minus,
  pencil: Pencil,
  plus: Plus,
  "rotate-ccw": RotateCcw,
  "settings-2": Settings2,
  "shield-check": ShieldCheck,
  "sun-moon": SunMoon,
  sunset: Sunset,
  trash: Trash,
  trophy: Trophy,
  "user-round": UserRound,
  vibrate: Vibrate,
  x: X,

  // Growth stages (content.ts → growth)
  bean: Bean,
  shrub: Shrub,
  "tree-deciduous": TreeDeciduous,
} satisfies Record<string, LucideIcon>;

export type IconName = keyof typeof ICONS;
