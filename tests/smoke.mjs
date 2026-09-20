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

assert(main.includes("MGOGameState"), "Main loop is not using the game state machine");
assert(main.includes("SKY_COUNTDOWN"), "Sky countdown state missing");
assert(main.includes("SKY_SPRINT"), "Sky Sprint state missing");
assert(main.includes("RACE_RESULTS"), "Race results state missing");
assert(main.includes("TARGET_MAYHEM"), "Target Mayhem state missing");
assert(main.includes("TARGET_RESULTS"), "Target results state missing");
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
assert(!m.result.content.includes("race.coins=0"), "Main must not overwrite Sky Sprint coin array");
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
assert(main.includes("SCORE '+targetScore+' · HITS '"), "Target HUD must expose hit feedback");

assert(main.includes("back=new THREE.Mesh"), "Target backing mesh must be declared");
assert(main.includes("ring=new THREE.Mesh"), "Target ring mesh must be declared");
