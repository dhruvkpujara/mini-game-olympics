# Mini Game Olympics — Architecture

## Baseline
This describes the c75b4d2 baseline. The current playable prototype is a static browser game with no required backend.

## Runtime
`index.html` contains the shell and HUD. `js/boot.js` loads Three.js and then the local scripts in dependency order. `js/main.js` creates the scene and coordinates the running game.

Runtime flow:
`index.html` → `boot.js` → Three.js → player/camera/world/events/UI/state/tournament → `main.js`

## Module responsibilities

`index.html` — boot screen, game container, HUD, controls, character selection and result/podium containers.

`js/boot.js` — startup loader, Three.js loading, backup CDN path, progress and visible startup errors.

`js/player.js` — procedural athlete roster, character construction, replacement, movement, jump, sprint, slide and running animation.

`js/camera.js` — third-person follow camera.

`js/world.js` — shared Olympic Village built from Three.js primitives.

`js/sky_sprint.js` — Sky Sprint course, obstacles, boosts, coins, checkpoints, respawn, AI rivals, finish detection and leaderboard data.

`js/ui.js` — lightweight HUD, venue labels and toast messages.

`js/game_state.js` — named states and current-state timing.

`js/tournament.js` — event results, placement points and standings.

`js/main.js` — current orchestration layer for scene, renderer, player, world, events, input, state transitions and the main update/render loop.

## Current states
CHARACTER_SELECT, VILLAGE_INTRO, GAME_BREAK, HUB, SKY_COUNTDOWN, SKY_SPRINT, RACE_RESULTS, TARGET_MAYHEM, TARGET_RESULTS, PENALTY_KINGS, PENALTY_RESULTS.

## Preferred data flow
Input → gameplay state → event result → tournament state → UI.
The DOM should display state, not become the source of truth for scores, timers or transitions.

## Preferred future event API
Each mini-game should eventually expose `enter(context)`, `update(context, dt)`, `exit(context)` and `getResult()`.

## Tournament flow
CHARACTER_SELECT → VILLAGE_INTRO → SKY_COUNTDOWN → SKY_SPRINT → RACE_RESULTS → GAME_BREAK → TARGET_MAYHEM → TARGET_RESULTS → GAME_BREAK → PENALTY_KINGS → PENALTY_RESULTS → FINAL PODIUM.

## Multiplayer roadmap
Future architecture: browser clients ↔ Socket.io ↔ Node.js server, with rooms, players, event state, scores and results.
The eventual server should be authoritative for shared match state.

## Performance
Watch draw calls, geometry/material counts, texture size, shadows, dynamic lights and pixel ratio. Prefer simple primitives and shared resources first. Profile before adding expensive effects.

## Cleanup
Every event needs a cleanup path. Temporary meshes, timers, listeners, arrays, HUD and AI state must not leak into the next event.