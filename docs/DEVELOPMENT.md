# Mini Game Olympics — Development Guide

## Before changing code
Read README.md, docs/ARCHITECTURE.md and docs/PROJECT_HANDOFF.md. Find the smallest module that owns the behaviour being changed.

## Make focused changes
Prefer one focused change at a time. Small commits are easier to test, review and revert.

Example commit messages:
- Fix Sky Sprint checkpoint respawn
- Prevent duplicate tournament scoring
- Add Target Mayhem hit feedback
- Improve Penalty Kings goalkeeper movement
- Add tournament intermission screen

## Test in layers
1. Static checks — verify expected files, script paths, state names and workflow paths.
2. Browser smoke test — verify boot, Three.js rendering, console errors, character draft and movement.
3. Full tournament — draft → village → Sky Sprint → results → intermission → Target Mayhem → results → intermission → Penalty Kings → results → podium.
4. Regression — repeat the affected event and full tournament after shared-code changes.

## Startup debugging
1. Read the exact boot status.
2. Check the browser console.
3. Identify the last script loaded.
4. Check its Network request.
5. Verify `window.THREE`.
6. Verify script order.
7. Check syntax errors.
8. Check cache-busting versions.
9. Only then change architecture.

## State debugging
Search for every `gameState.set(...)` call. Each event should have one owner for start, completion, result recording, tournament advancement, intermission and next-event transition.

## Three.js practices
- Reuse geometry/materials where practical.
- Keep dynamic lights and shadows under control.
- Cap pixel ratio.
- Avoid unnecessary per-frame allocations.
- Clean up temporary objects and listeners.
- Profile before large rendering changes.

## UI practices
The UI should display game state, not define it. When changing a HUD label, check whether another update function overwrites it every frame.

## Git workflow
main → feature/fix branch → implement → test → review diff → merge.
Keep main stable and preserve experiments on branches.

## Deployment
GitHub Pages is the current target. When deployment looks stale, verify the Pages workflow, deployed commit, browser cache and script query versions before modifying gameplay code.

## Documentation rule
If a change affects architecture, controls, state names, deployment, testing or project scope, update the relevant documentation in the same change.