# Champions Damage Calc

A clean damage calculator for **Pokémon Champions**, covering Singles and Doubles.

- **Engine:** [`@smogon/calc`](https://github.com/smogon/damage-calc), which models Champions as generation `0`: Level 50, Stat Points, Champions Megas and abilities. Abilities, items, weather, terrain, screens, crits and spread moves are all handled by the engine.
- **Data:** species, moves, items and abilities come from `@smogon/calc`. Legal abilities and learnsets come from Pokémon Showdown's `champions` mod via `npm run data`.
- **UI:** React, Vite, TypeScript, Tailwind and Zustand. Calcs are encoded in the URL hash, so you can share one with the **Share** button.

## Scripts

```bash
npm install
npm run dev      # start the app
npm test         # engine tests (Vitest)
npm run data     # regenerate src/data/champions.json from the pokemon-showdown package
npm run build    # production build to dist/
```

To pick up new Showdown data, update `pokemon-showdown` and `@smogon/calc`, then run `npm run data`.

## Layout

```
scripts/build-data.ts     learnsets and abilities from Showdown's champions mod
src/data/champions.json   generated data (committed)
src/engine/               calc wrapper, defaults, types and tests
src/state/store.ts        Zustand store and URL-hash sync
src/components/           FieldBar, PokemonCard, SpEditor, MoveSlot, ResultsPanel, ui/
```
