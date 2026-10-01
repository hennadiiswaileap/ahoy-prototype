# Ahoy · sailing app prototype

An interactive MVP prototype of a social app for cruising sailors on the Baltic. The app opens on a live map of Kiel Fjord that shows nearby boats, and each boat can be contacted in one tap. Everything runs in the browser. There's no backend, no API keys and no environment variables.

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

## Demo tips

- **Demo controls:** long-press the round logo (on the Welcome screen or the map), or open the URL with `?demo`. From there you can reset onboarding, jump to the map, simulate offline, speed up the simulation (4x), or add a boat nearby.
- **Skip onboarding:** `?screen=map` opens the map directly. You can combine it with `?demo`, for example `/?screen=map&demo`.
- **Desktop vs phone:** on a desktop the app renders in a phone frame next to the name and tagline. On a phone it runs full screen. In Safari or Chrome, "Add to Home Screen" installs it like an app.
- Boats move 40x faster than real time so the movement is visible. You can change this in `src/config.ts` (`SIM.factor`).

## Where to change things

| What | File |
| --- | --- |
| App name, tagline, palette, simulation speed, map tiles | `src/config.ts` |
| Boats, people, routes, feed posts, ports, chats, challenge | `src/demoData.ts` |
| PWA name and colours | `public/manifest.webmanifest`, `index.html` |
| App icon | `public/icon.svg`, `public/icon-*.png` |

## How it works

- **Stack:** React 18, TypeScript, Vite, Tailwind CSS v4, zustand (in-memory state), lucide-react icons, MapLibre GL.
- **Map:** free OpenStreetMap raster tiles with the OpenSeaMap seamark overlay. The layers button toggles Standard and Nautical. The OSM public tile server is fine for a demo. Before real traffic, switch to a tile provider in `src/config.ts`.
- **Simulation** (`src/sim.ts`): each boat sails an elliptical loop. Positions are computed analytically from a continuous clock, so markers update on every animation frame at 60 fps. Distances and "last seen" values refresh every 2 seconds.
- **Water only:** every route was generated against OpenStreetMap-derived coastline data and checked to stay at least about 120 m off land.
- **Screens:** `src/screens/` holds onboarding, the map, the boat card and contact sheet, profile and settings, and the Feed, Ports and Chats teasers.

All people, boats, posts, ports, restaurants and the partner magazine are fictional.
