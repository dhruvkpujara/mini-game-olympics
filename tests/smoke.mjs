import { readFile } from "node:fs/promises";
import { access } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import path from "node:path";
import assert from "node:assert/strict";

const root = process.cwd();
const files = [
  "index.html",
  "js/boot.js",
  "js/game_state.js",
  "js/main.js",
  "js/tournament.js",
  "js/ui.js",
  "js/player.js",
  "js/camera.js",
  "js/world.js",
  "js/sky_sprint.js"
];

for (const file of files) {
  await access(path.join(root, file));
}

const jsFiles = files.filter(f => f.endsWith(".js"));
for (const file of jsFiles) {
  execFileSync(process.execPath, ["--check", path.join(root, file)], { stdio: "inherit" });
}

const index = await readFile(path.join(root, "index.html"), "utf8");
const main = await readFile(path.join(root, "js/main.js"), "utf8");
const tournament = await readFile(path.join(root, "js/tournament.js"), "utf8");
const sky = await readFile(path.join(root, "js/sky_sprint.js"), "utf8");
const state = await readFile(path.join(root, "js/game_state.js"), "utf8");
const ui = await readFile(path.join(root, "js/ui.js"), "utf8");
const boot = await readFile(path.join(root, "js/boot.js"), "utf8");

assert(index.includes("js/boot.js"), "Boot loader missing");
assert(index.includes('id="bootScreen"'), "Loading screen missing");
assert(boot.includes("cdn.jsdelivr.net/npm/three@0.160.0"), "Primary Three.js CDN missing");
assert(boot.includes("unpkg.com/three@0.160.0"), "Three.js fallback CDN missing");
assert(boot.includes("MGO_DEBUG"), "Boot loader readiness check missing");
for (const script of [
  'js/player.js',
  'js/camera.js',
  'js/world.js',
  'js/sky_sprint.js',
  'js/ui.js',
  'js/game_state.js',
  'js/main.js'
]) {
  assert(boot.includes(script), `Boot loader missing script: ${script}`);
}

assert(tournament.includes("POINTS=[10,7,5,3,2,1]"), "Tournament scoring table missing");
assert(tournament.includes("addEventResult"), "Tournament event result handler missing");
assert(main.includes("MGOGameState"), "Main loop is not using the game state machine");
for (const eventState of ["SKY_COUNTDOWN","SKY_SPRINT","RACE_RESULTS","TARGET_MAYHEM","TARGET_RESULTS"]) {
  assert(state.includes(eventState), `Game state missing: ${eventState}`);
}
assert(main.includes("setRaceVisible"), "Race HUD visibility helper missing");
assert(main.includes("addEventListener('blur'"), "Input reset on window blur missing");
assert(main.includes("document.addEventListener('visibilitychange'"), "Input reset on tab visibility change missing");
assert(main.includes("targetMeshes=[]"), "Target mesh hit list missing");
assert(main.includes("targetRay.intersectObjects(targetMeshes,false)"), "Target raycast must only hit target faces");
assert(main.includes("target.userData.hitTarget=true"), "Target hit metadata missing");
assert(!main.includes("race.active?.28"), "Known invalid camera expression still present");
assert(!main.includes("skyCountdown===0"), "Fragile exact-zero countdown check still present");
assert(ui.includes("if(!inRace&&!inTarget)"), "Hub timer must pause during mini-games");
assert(sky.includes("userData={obstacle:true"), "Obstacles must be tagged explicitly");
assert(sky.includes("o.userData.obstacle"), "Obstacle list must exclude coins and other objects");
assert(sky.includes("race.coinCount=0"), "Race coin count must not overwrite coin objects");
assert(!sky.includes("race.coins=0"), "Race coin object array must not be overwritten");
assert(sky.includes("race.coinCount++"), "Collected coins must increment coin count");
assert(!main.includes("race.coins=0"), "Main must not overwrite Sky Sprint coin array");
assert(state.includes("function create"), "State factory missing");

const vm = await import("node:vm");
const sandbox = { window: {}, globalThis: {}, console };
sandbox.globalThis = sandbox.window;
vm.runInNewContext(state, sandbox);
const s = sandbox.window.MGOGameState.create("SKY_COUNTDOWN");
assert.equal(s.state, "SKY_COUNTDOWN");
s.tick(0.5);
assert.equal(s.age, 0.5);
s.set("SKY_SPRINT");
assert.equal(s.state, "SKY_SPRINT");
assert.equal(s.age, 0);
s.tick(1);
assert.equal(s.age, 1);
assert.throws(() => s.set("NOT_A_STATE"), /Unknown game state/);

console.log("✅ Mini Game Olympics smoke tests passed");
console.log("✅ Syntax checks passed");
console.log("✅ State-machine checks passed");
console.log("✅ HUD/timer isolation checks passed");
console.log("✅ Sky Sprint obstacle checks passed");

assert(main.includes("targetHits=0"), "Target Mayhem hit counter must initialize");
assert(main.includes("targetHits++"), "Target hits must increment on successful hit");
assert(main.includes("targetHits"), "Target Mayhem hit feedback state missing");

assert(main.includes("back=new THREE.Mesh"), "Target backing mesh must be declared");
assert(main.includes("ring=new THREE.Mesh"), "Target ring mesh must be declared");

assert(main.includes("targetColors=["), "Target colour scoring table missing");
assert(main.includes("points:500"), "High-value purple target missing");
assert(main.includes("spawnTarget(g,i)"), "Target respawn/spawn helper missing");
assert(main.includes("targetScore+=pts"), "Colour-based target scoring missing");
assert(main.includes("updateTargetCamera()"), "Target Mayhem camera helper missing");
assert(main.includes("awardSkySprintTournament()"), "Sky Sprint tournament scoring missing");
assert(main.includes("awardTargetTournament()"), "Target Mayhem tournament scoring missing");
assert(main.includes("startNextTournamentEvent()"), "Tournament event progression missing");
assert(main.includes("TOURNAMENT COMPLETE"), "Tournament completion screen missing");
assert(main.includes("targetArenaPlayers"), "Target Mayhem participant list missing");
assert(main.includes("Rivals are active participants too"), "Rivals must participate in Target Mayhem");

assert(sky.includes("lastSafePlatform=0"), "Sky Sprint must start from the first safe platform");
assert(sky.includes("const idx=Math.max(0,race.lastSafePlatform||0)"), "Sky Sprint respawn must use the last safely landed platform");
assert(!sky.includes("race.segments[race.checkpoint+1]+3"), "Checkpoint must not advance just by crossing a Z threshold");

// Tournament/results regressions
assert(main.includes("resultHoldSeconds=7"), "Results must stay visible long enough to read");
assert(main.includes("if(returnTimer>resultHoldSeconds)"), "Sky Sprint must respect results hold time");
assert(main.includes("if(targetResultTimer>resultHoldSeconds)"), "Target Mayhem must respect results hold time");
assert(main.includes("you.score=targetScore"), "Player Target Mayhem score must feed tournament points");
assert(main.includes("const target=g.userData.targetMesh;if(!target.visible)"), "Target respawn timer must track the hit target mesh");
assert(main.includes("target.visible=false;g.userData.respawnTimer=.65"), "Hit targets must schedule a respawn without hiding the whole target group");
assert(!main.includes("target.visible=false;g.visible=false"), "Target group must remain active while its face respawns");
