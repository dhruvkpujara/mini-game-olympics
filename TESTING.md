# 🧪 Mini Game Olympics — Testing

The project now treats **stability as a feature**. Every gameplay change should pass the smoke tests before it is considered complete.

## Run tests locally

From the repository root:

```bash
node tests/smoke.mjs
```

The smoke suite checks:

- All required game files exist.
- Every JavaScript file passes Node syntax validation.
- The Three.js dependency is present.
- Script loading order is present in `index.html`.
- The main loop uses the central game-state machine.
- All required event states exist.
- The known broken camera expression is absent.
- The countdown does not depend on fragile exact-zero comparison.
- The hub timer cannot overwrite mini-game timers.
- Sky Sprint obstacles are explicitly separated from coins.
- The state machine transitions and timer reset behavior work.

## Manual browser test cases

### TC-01 — Boot
**Steps:** Open the game and wait 2–3 seconds.  
**Expected:** 3D scene renders, HUD is visible, browser console has no startup exception.

### TC-02 — Countdown
**Steps:** Stay idle through the opening countdown.  
**Expected:** Countdown changes continuously and reaches GO exactly once.

### TC-03 — Sky Sprint start
**Steps:** After GO, press W.  
**Expected:** Player moves forward and race time increases continuously.

### TC-04 — Movement
**Steps:** Test W, S, A, D, Shift, Space and C.  
**Expected:** W/S move forward/backward, A/D move left/right, Shift sprints, Space jumps, C slides.

### TC-05 — Checkpoint recovery
**Steps:** Fall from a platform after reaching a checkpoint.  
**Expected:** Player respawns at the current checkpoint and the game continues.

### TC-06 — Race completion
**Steps:** Reach the finish gate.  
**Expected:** Race stops, finish time appears, leaderboard appears, and the game does not freeze.

### TC-07 — Target Mayhem
**Steps:** Wait through the race-results transition.  
**Expected:** Target Mayhem loads with moving targets and a 30-second timer.

### TC-08 — Target scoring
**Steps:** Click visible targets.  
**Expected:** Each successful hit adds 100 points and removes that target.

### TC-09 — Event timer isolation
**Steps:** Compare the large event HUD timer while a mini-game is active.  
**Expected:** Hub event timer does not overwrite the active mini-game timer.

### TC-10 — Recoverable runtime error
**Steps:** Use browser developer tools during testing.  
**Expected:** Any runtime exception is visible in the console/debug overlay rather than silently looking like a frozen timer.

## Definition of done

A gameplay task is not complete until:

1. Automated smoke tests pass.
2. The relevant manual test cases pass.
3. Existing controls and completed mini-games still work.
4. No browser-console runtime error is introduced.

**Rule:** implement → test → verify → then add the next feature.
