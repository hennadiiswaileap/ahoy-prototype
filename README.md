# Ahoy · sailing app prototype

An interactive MVP prototype of a social app for cruising sailors on the Baltic. The app opens on a live map of Kiel Fjord that shows nearby boats and marinas, and each boat can be contacted in one tap. Everything runs in the browser. There's no backend, no API keys and no environment variables.

## Run locally

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build into dist/
npm run preview    # serve the production build
```

## Deploy to Vercel

1. Push this folder to a GitHub repo.
2. In Vercel, choose **Add New → Project** and import the repo. Vercel detects Vite. `vercel.json` already sets the build command, the output folder and SPA rewrites.
3. Deploy. You don't need any environment variables.

Or from the CLI: `npx vercel --prod`.

## Two scopes

The prototype shows two layers of the product. Switch between them in the demo panel or with `?scope=a` / `?scope=b`. Scope B is the default.

- **Scope A (MVP):** the agreed MVP. Tabs: Nearby, Feed (teaser), Chats (teaser), Profile. Friends, and visibility for everyone, friends only or nobody.
- **Scope B (MVP+):** adds groups. Tabs: Map, Groups, Feed, Profile. Everything that belongs to Scope B carries an "MVP+" badge.
  - Groups come in three types: community (Sailing), region (Baltic, Kiel Fjord) and private (Family Crew, Pier 7 Friends). Friends become a private group.
  - Each group has a feed (posting works) and a chat (sending works, and members reply with canned messages after a few seconds).
  - Create a group (with invite code and link), or join one by code (demo code `LABOE-24`) or from region suggestions.
  - Visibility: everyone, selected groups, or invisible.
  - Map filter by group. Members of your private groups get a teak ring.
  - Optional ski trip scenario in the demo panel: Family Crew in the Alps, shown as people, distances in km.

## Demo tips

- **Demo controls:** long-press the round logo (on the Welcome screen or the map), or open the URL with `?demo`. From there you can switch scope and theme, reset onboarding, jump to the map, simulate offline, speed up the simulation (4x), add a boat nearby, and start the ski trip (Scope B).
- **URL flags:** `?screen=map` skips onboarding, `?scope=a|b` picks the scope, `?theme=light|dark|system` picks the theme, `?demo` opens the demo panel. They combine, for example `/?screen=map&scope=a&demo`.
- **Theme:** follows the device by default. Profile → Appearance overrides it (System, Light, Dark), and the choice is remembered on that device.
- **Desktop vs phone:** on a desktop the app renders in a phone frame next to the name and tagline. On a phone it runs full screen. In Safari or Chrome, "Add to Home Screen" installs it like an app.
- Boats move 40x faster than real time so the movement is visible. You can change this in `src/config.ts` (`SIM.factor`).

## Where to change things

| What | File |
| --- | --- |
| Colours (light and dark), map colours | `src/theme.ts` |
| App name, tagline, simulation speed, map tiles | `src/config.ts` |
| Boats, people, routes, marinas, feed posts, chats, challenge, ski trip people | `src/demoData.ts` |
| Groups, group posts, group chats, canned replies, join codes | `src/demoGroups.ts` |
| PWA name and colours | `public/manifest.webmanifest`, `index.html` |
| App icon | `public/icon.svg`, `public/icon-*.png` |

## How it works

- **Stack:** React 18, TypeScript, Vite, Tailwind CSS v4, zustand (in-memory state), lucide-react icons, MapLibre GL.
- **Colours:** `src/theme.ts` holds the palette from the client's boat in a light and a dark version. At startup it writes CSS variables, and Tailwind's colour names (`bg-ink`, `text-ocean`, ...) point at them. All text and button pairs pass WCAG AA in both themes.
- **Map:** free OpenStreetMap raster tiles with the OpenSeaMap seamark overlay. In dark mode the same tiles are inverted and hue-rotated, so there's no second tile provider. The layers button toggles Standard and Nautical, and Show marinas. The OSM public tile server is fine for a demo. Before real traffic, switch to a tile provider in `src/config.ts`.
- **Simulation** (`src/sim.ts`): each boat sails an elliptical loop. Positions are computed analytically from a continuous clock, so markers update on every animation frame at 60 fps. Distances and "last seen" values refresh every 2 seconds.
- **Water only:** every route was generated against OpenStreetMap-derived coastline data and checked to stay at least about 120 m off land.
- **Screens:** `src/screens/` holds onboarding (including the community step), the map, the boat card, marina and contact sheets, Groups (Scope B), profile and settings, and the Feed and Chats tabs.

All people, boats, groups, posts, events and the partner magazine are fictional. Marina positions are the real harbours as mapped in OpenStreetMap.
