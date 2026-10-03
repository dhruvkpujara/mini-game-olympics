# Mini Game Olympics — Project Handoff

## Current baseline
Repository: dhruvkpujara/mini-game-olympics
Main baseline: c75b4d29b9d5d9e25d0d933eb6183898b381ab1b
Commit: Add timed intermissions between tournament games

## Project goal
Build a polished browser-based 3D Olympic mini-game tournament.
Current flow: 3D athlete draft → Olympic Village intro → Sky Sprint → Target Mayhem → Penalty Kings → final podium.

## Current technology
- Three.js
- Vanilla JavaScript
- HTML/CSS
- GitHub Actions
- GitHub Pages

Real online multiplayer with Node.js + Socket.io is planned future work. The current prototype is a single-browser game with AI rivals.

## Important decisions
### State machine
`MGOGameState` is the authoritative state model. Avoid multiple independent booleans that can contradict each other.

### Tournament
`MGOTournament` owns event results and standings.
Keep the pipeline separate: mini-game score → event ranking → tournament points → final standings.

### Intermissions
The current baseline includes a timed break between tournament games. It must not accidentally start the next event early.

### Characters
The eight athletes are procedural cartoon archetypes with distinct silhouettes. Keep them original rather than exact copies of copyrighted characters.

### Startup
If the boot screen freezes, inspect the exact status text and browser console first. Verify Three.js, script order, network requests and cache versions before replacing the architecture.

## Safe continuation order
1. Verify c75b4d2 in a browser.
2. Confirm character selection.
3. Confirm village intro.
4. Confirm Sky Sprint.
5. Confirm Target Mayhem.
6. Confirm Penalty Kings.
7. Confirm intermissions.
8. Confirm final podium.
9. Repair or expand automated regression tests.
10. Only then start the next feature.

## Suggested architecture improvement
Move each mini-game toward an explicit lifecycle: `enter()`, `update()`, `exit()`, `getResult()`.
Then let one tournament controller own the event sequence so `main.js` does not become a giant collection of unrelated conditions.

## Git rule
Do risky experiments on branches, not directly on `main`. Use names such as `feature/...`, `fix/...` and `experiment/...`. Create a backup branch before major refactors.