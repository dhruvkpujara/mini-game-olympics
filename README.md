# 🏅 Mini Game Olympics

A fast, social 3D multiplayer mini-game tournament built with **Three.js**, with a low-poly Olympic-sports aesthetic.

## 🎮 Current Vision

**Mini Game Olympics** is designed for 3–8 players competing across short, skill-based events.

### Core experience
- 🏟️ Walkable Olympic Village hub
- 🏃 Short 1–3 minute mini-games
- 🏆 Tournament progression and podium
- ⚡ Skill-based scoring
- 🎨 Cosmetic progression only
- 🌐 Multiplayer with Socket.io
- 💻 PC-first, mobile later
- 😂 Fast, social and chaotic

## 🗺️ World

The hub contains recognizable sports facilities:

- Main Olympic Stadium
- Athletics Centre
- Football Arena
- Challenge Arena
- Racing Circuit
- Athlete Village
- Central Olympic Plaza

## 🕹️ Controls

| Key | Action |
|---|---|
| W / S | Move forward / backward |
| A / D | Move left / right |
| Shift | Sprint |
| Space | Jump |
| C | Slide |
| Mouse | Camera |

## 🏃 Planned Mini-Games

1. **Sky Sprint** — platform race with obstacles, checkpoints, boosts and coins.
2. **Target Mayhem** — moving-target accuracy challenge.
3. **Penalty Kings** — football penalty challenge.
4. **Memory Mayhem** — memory / pattern challenge.
5. **Tower Balance** — balance and timing challenge.
6. **Bonus Challenge** — high-risk comeback event.
7. **Final Gauntlet** — multi-stage final.

## 🧮 Scoring

Events can award points using:
- Placement
- Speed
- Accuracy
- Streaks
- Bonus objectives

Comebacks should come from optional risky challenges rather than automatic catch-up bonuses.

## 🏗️ Architecture

Current front-end prototype:

```
index.html
css/
  style.css
js/
  main.js
  player.js
  camera.js
  world.js
  sky_sprint.js
  ui.js
.github/
  workflows/
    pages.yml
```

### Planned architecture

```
client/
  core/
    GameState.js
    GameLoop.js
    Input.js
    Audio.js
  player/
  world/
  mini-games/
    SkySprint/
    TargetMayhem/
    PenaltyKings/
    MemoryMayhem/
    TowerBalance/
  ui/
server/
  socket.js
  rooms.js
  matches.js
```

## 🔄 Event State Machine

The project should use one authoritative state:

```
HUB
  ↓
SKY_COUNTDOWN
  ↓
SKY_SPRINT
  ↓
RACE_RESULTS
  ↓
TARGET_MAYHEM
  ↓
TARGET_RESULTS
  ↓
NEXT_EVENT
```

Avoid controlling the same transition with several independent booleans. Every event should have explicit enter, update and exit behavior.

## 🌐 Multiplayer Plan

Planned stack:
- Three.js
- Node.js
- Socket.io
- HTML/CSS UI
- Physics engine where useful

Target capacity: **3–8 players**.

Network synchronization will eventually cover:
- Player positions
- Player actions
- Event state
- Countdown
- Scores
- Results
- Room state

## 🎨 Design Rules

### Visual
- Low-poly 3D
- Recognizable sports venues
- Cartoon/detailed athletes
- Strong event identity
- Clear readable HUD

### Gameplay
- Events should be easy to understand quickly.
- Skill should matter more than random outcomes.
- Power-ups are unique to each event.
- Cosmetics never provide gameplay stat advantages.

## 🛠️ Local Development

The current prototype is static and can be served from any simple local web server.

Example:

```bash
python3 -m http.server 8000
```

Then open:

```
http://localhost:8000
```

Do not open the HTML directly with `file://` when testing CDN scripts or future networking features.

## 🚀 GitHub Pages

The repository contains a GitHub Actions Pages workflow.

After pushing to `main`:

1. GitHub Actions builds/deploys the Pages artifact.
2. GitHub Pages serves the repository.
3. Use a hard refresh after JavaScript changes if the browser has cached an older script.

## 🧪 Development Priority

### Phase 1 — Stability
- Fix event-state architecture
- Remove render-loop freezes
- Add debug/smoke testing
- Stabilize Sky Sprint

### Phase 2 — Playable MVP
- Complete Target Mayhem
- Add results screen
- Add tournament scoring
- Add podium

### Phase 3 — More Events
- Penalty Kings
- Memory Mayhem
- Tower Balance
- Bonus challenge
- Final Gauntlet

### Phase 4 — Multiplayer
- Rooms
- Player synchronization
- Event synchronization
- Results synchronization
- Reconnect handling

### Phase 5 — Polish
- Audio
- Better animations
- NPC athletes
- Cosmetics
- Mobile controls
- Performance optimization

## 📋 GitHub Issues

The repository Issues tab is the development task board. Each major bug or feature should have:
- Clear goal
- Requirements
- Acceptance criteria
- Technical notes where needed

Keep issues small enough to implement and test independently.

## 🤝 Development Philosophy

Build one playable system at a time.

**Implement → test → fix → polish → then add the next mini-game.**

The priority is a stable playable foundation rather than adding many unfinished features at once.

---

**Mini Game Olympics** 🏅  
*Run. Compete. Win the podium.*
