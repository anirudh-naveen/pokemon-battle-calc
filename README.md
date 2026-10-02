# PokéBattleCalc

**A fast, visual damage calculator for Pokémon Champions, the official competitive Pokémon game, in Singles and Doubles.**

[**▶ Live demo**](https://anirudh-naveen.github.io/poke-battle-calc/) · React · TypeScript · Vite · Tailwind CSS · Zustand · Vitest · GitHub Actions

Competitive Pokémon damage depends on dozens of interacting factors: stats, natures, abilities, items, weather, terrain, screens, critical hits, spread moves, status conditions and stat stages. Existing calculators expose all of them at once in dense forms. PokéBattleCalc keeps the full mechanics but organises them so a player can answer *"does this attack KO?"* at a glance:

- **Damage you can read at a glance.** Every move shows a colour-coded HP bar (OHKO / 2HKO / 3HKO+), its % range and its KO probability, in both directions with one click.
- **Every modifier explained.** Each result is tagged with exactly how much each condition changed it, e.g. ☀ ×1.5, Reflect ×0.67, Helping Hand ×1.5.
- **Battle state you can see.** Weather and terrain animate the results panel. Status conditions animate the Pokémon (flames for burn, ice for freeze, "z"s for sleep). Side conditions draw animated rings around that Pokémon's card.
- **Always current.** A scheduled pipeline detects each new Champions season (regulation) and updates the data and the live site automatically.

---

## Highlights

### Accurate mechanics without reinventing them
The damage formula comes from [`@smogon/calc`](https://github.com/smogon/damage-calc), the battle-tested engine behind Pokémon Showdown's calculator. It models Champions-specific rules: Level 50, the **Stat Points** system (66 total, 32 per stat) that replaces EVs, and the new Mega Evolutions and abilities. A thin typed adapter ([`src/engine/calc.ts`](src/engine/calc.ts)) turns UI state into engine objects, so the app's own code focuses on data and UX rather than re-deriving hundreds of edge cases.

### Measuring each modifier by recalculating without it
The engine reports a final number, not how much each factor contributed. To show tags like "Reflect ×0.67", the app recalculates each move with that one condition switched off and compares the results. Small rounding differences are snapped to the familiar game multipliers (×0.5, ×0.67, ×1.3, ×1.5). This works for indirect effects too, like Sand boosting Rock types' Special Defense, without hard-coding any rules.

### Data pipeline that follows the live game
[`scripts/build-data.ts`](scripts/build-data.ts) reads Pokémon Showdown's data and:
- finds the **current regulation** (the newest active VGC Champions format) and loads that season's rules
- builds each species' legal abilities and full learnset, following forms and pre-evolutions so Megas inherit their moves
- records the regulation and the package versions the data came from, and produces identical output when nothing changed, so updates only happen when something real changed

### CI/CD and automatic season updates
- **[`deploy.yml`](.github/workflows/deploy.yml)** runs the tests and publishes to GitHub Pages on every push to `main`.
- **[`update-data.yml`](.github/workflows/update-data.yml)** runs weekly. It upgrades the data sources, regenerates the data for the current season, runs the tests and a build, then commits and redeploys only if something changed. Commits made by a workflow don't trigger other workflows, so it calls the deploy workflow directly as a reusable workflow.

### Responsive layout that adapts to the space available
- **Container queries** let each Pokémon's column decide for itself whether its HP, status and boosts panel fits beside the card, or folds into it.
- The same layout works from a 320px phone to a 1920px full-screen monitor with no horizontal scrolling and no cut-off text.
- Phones held upright get a rotate-to-landscape prompt, and desktop users get a one-time full-screen suggestion that uses the Fullscreen API, with Safari support.

### Polished, accessible UI
- A searchable combobox with keyboard navigation.
- ARIA states on all toggles.
- A light/dark theme with no flash on load.
- `prefers-reduced-motion` turns off every animation.
- All effects are pure CSS with fixed per-particle placement, so particles don't jump between redraws.

### Shareable state
The whole calc (both Pokémon, field and side conditions) is compressed into the URL hash with `lz-string`. Any setup can be shared as a link, with no backend.

---

## Features

| | |
|---|---|
| **Pokémon** | All Champions species and Megas, legal abilities, items, natures, Stat Point sliders with live Lv. 50 stats, learnset-filtered moves, a crit toggle per move |
| **Battle state** | Drag-to-set HP bar with presets, 6 status conditions, −6 to +6 stat stages |
| **Field** | Singles / Doubles (spread-move reduction), Sun / Rain / Sand / Snow, Electric / Grassy / Psychic / Misty Terrain |
| **Side conditions** | Reflect, Light Screen, Aurora Veil, Tailwind, Helping Hand and Friend Guard (the last two only in Doubles) |
| **Results** | Damage range, % of HP, KO chance, all 16 damage rolls, a copyable Showdown-style description, a speed comparison with Tailwind, items, abilities and paralysis |

## Architecture

```
scripts/build-data.ts      Showdown → current regulation → learnsets/abilities JSON
src/data/champions.json    generated, committed data (regulation + versions included)
src/engine/                typed adapter over @smogon/calc, defaults, unit tests
src/state/store.ts         Zustand store + URL-hash sync
src/components/            results, Pokémon cards, battle-state panel, condition tiles,
                           animated effects (Particles, CardAura, Sprite), UI primitives
.github/workflows/         deploy to Pages · weekly season update
```

Data flows one way: **data → engine → store → components**. The engine layer has no UI code and is covered by Vitest tests: Stat Point formula, spread reduction, screens per side, weather and terrain multipliers, Doubles-only conditions, Champions-only Mega abilities, and Tailwind speed.

## Running locally

```bash
npm install
npm run dev      # http://localhost:5175
npm test         # engine tests
npm run data     # regenerate data for the current regulation
npm run build    # production build (served under /poke-battle-calc/)
```

To preview the production build exactly as GitHub Pages serves it:

```bash
npm run build && npx vite preview --port 5176
```

Then open http://localhost:5176/poke-battle-calc/.

## Deployment

1. In the GitHub repo, open **Settings → Pages** and set **Source** to **GitHub Actions**.
2. Push to `main`. The site publishes to `https://anirudh-naveen.github.io/poke-battle-calc/`.

The weekly update job needs to push to `main`, so it fails if `main` has branch protection. If the repo is renamed, update `base` in `vite.config.ts`.

## Credits

Damage engine: [@smogon/calc](https://github.com/smogon/damage-calc) (MIT). Data and sprites: [Pokémon Showdown](https://github.com/smogon/pokemon-showdown) (MIT) and [@pkmn/img](https://github.com/pkmn/img).
Pokémon and all related names are © Nintendo / Game Freak / The Pokémon Company. This is an unofficial fan project and is not affiliated with or endorsed by them.
