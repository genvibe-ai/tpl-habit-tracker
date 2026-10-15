# Notice

Rootwell is based on **Open-Source Habit Tracker App** by Hasib Haque (MIT,
https://github.com/hasibhaque07/open-source-habit-tracker-app), © 2026 Hasib Haque. The original MIT
license is kept in [LICENSE-UPSTREAM](LICENSE-UPSTREAM). This template is released under the MIT license
in [LICENSE](LICENSE).

## What changed

- Upgraded from Expo SDK 54 to Expo SDK 57 (React 19.2.3, react-native 0.86.3, Reanimated 4 with
  react-native-worklets, Expo Router 57) so it runs in the Expo Go app and in the web preview.
- Rewritten as "Rootwell", habits that grow: three-step onboarding; Today with a progress ring, week strip,
  animated check-off with haptics, counted habits, streak flames and an all-done celebration; a habit page
  with a 12-month heatmap, streaks, completion, strength stage, weekly and weekday charts; Add/Edit habit
  (name, note, icon, color, daily goal, schedule, time of day, reminder time); Stats; Settings; dark and light
  themes. 120 days of seeded sample history are created on first launch.
- Storage: SQLite on iOS and Android (expo-sqlite, behind a small `GardenStorage` interface in `lib/`) with a
  localStorage/in-memory fallback on the web (`lib/storage.web.ts`), because SQLite in the browser needs
  cross-origin isolation headers.
- Removed: NativeWind/Tailwind (plain StyleSheet now), `@shopify/react-native-skia`, luxon, react-query,
  expo-secure-store, react-native-draggable-flatlist, flash-list, expo-image, expo-symbols, the upstream
  components, hooks, services, demo images and README media.
- Brand, colors, copy and sample data live in `constants/content.ts`; fonts, type scale and radii in
  `constants/theme.ts`; the icon map in `constants/icons.ts`.

## Fonts, icons and images

- Fonts: Bricolage Grotesque and Figtree, SIL Open Font License 1.1, bundled through the
  `@expo-google-fonts/bricolage-grotesque` and `@expo-google-fonts/figtree` packages (MIT and OFL-1.1).
- Icons: Lucide (ISC license) through `lucide-react-native`, drawn with react-native-svg.
- Brand mark, app icon, adaptive icon, splash and favicon (`assets/images/`): original vector artwork made
  for GenVibe (`components/brand/mark.ts`, rendered to PNG). The app ships no photos; `public/` holds only
  the web `index.html`.

Rootwell, Maya, the sample habits and every streak, number and quote in the app are fictional. No real
company, person, logo or trademark appears in the code, copy or data.

Dependencies keep their own licenses. Parts of the project scaffold (root layout, Metro and Babel
configuration) follow the Expo project template:

```
The MIT License (MIT)

Copyright (c) 2015-present 650 Industries, Inc. (aka Expo)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
