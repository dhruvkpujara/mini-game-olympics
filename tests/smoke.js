const fs = require('node:fs');
const vm = require('node:vm');
const { execFileSync } = require('node:child_process');

const read=p=>fs.readFileSync(p,'utf8');
const required=[
  'index.html','js/boot.js','js/gltf_characters.js','js/player.js','js/camera.js',
  'js/world.js','js/sky_sprint.js','js/ui.js','js/game_state.js','js/tournament.js','js/main.js'
];
for(const p of required)if(!fs.existsSync(p))throw new Error('Missing required file: '+p);
for(const p of required.filter(p=>p.endsWith('.js')))execFileSync(process.execPath,['--check',p],{stdio:'inherit'});

const index=read('index.html'),boot=read('js/boot.js'),main=read('js/main.js');
const tournamentSource=read('js/tournament.js'),stateSource=read('js/game_state.js');
const invariants=[
  ['classic Three CDN loader',boot,'three@0.160.0/build/three.min.js'],
  ['Three CDN fallback',boot,'unpkg.com/three@0.160.0/build/three.min.js'],
  ['classic GLTF loader',boot,'examples/js/loaders/GLTFLoader.js'],
  ['global Three check',boot,'window.THREE'],
  ['boot cache main v42',boot,'js/main.js?v=42'],
  ['boot cache player v21',boot,'js/player.js?v=21'],
  ['8-player roster',main,"'PANDA','MECHA'"],
  ['three tournament games',main,"['SKY SPRINT','TARGET MAYHEM','PENALTY KINGS']"],
  ['draft state',stateSource,'CHARACTER_SELECT'],
  ['game break state',stateSource,'GAME_BREAK'],
  ['penalty results state',stateSource,'PENALTY_RESULTS'],
  ['8-point values',tournamentSource,'[10,8,6,5,4,3,2,1]'],
  ['sky course state gate',main,"gameState.state==='SKY_COUNTDOWN'||gameState.state==='SKY_SPRINT'||gameState.state==='RACE_RESULTS'"],
  ['draft hides race HUD',main,"if(gameState.state==='CHARACTER_SELECT')"],
  ['penalty has all rivals',main,"...race.rivals.map((_,i)=>({name:PLAYER_NAMES[i+1]"],
  ['target rival colors',main,'0xe05aa6,0x31d9ef']
];
for(const [name,src,needle] of invariants)if(!src.includes(needle))throw new Error('Missing invariant: '+name);
if(/importmap|three\.module\.js|three\/addons\//.test(index+boot+read('js/gltf_characters.js')))throw new Error('Module-based Three.js startup path is still present.');

const ctx={console};ctx.window=ctx;vm.createContext(ctx);
vm.runInContext(tournamentSource,ctx,{filename:'js/tournament.js'});
vm.runInContext(stateSource,ctx,{filename:'js/game_state.js'});
const t=ctx.MGOTournament.create(['SKY SPRINT','TARGET MAYHEM','PENALTY KINGS']);t.start();
const names=['YOU','BOLT','NOVA','DASH','ROCKET','FLASH','PANDA','MECHA'];
for(let round=0;round<3;round++)t.addEventResult(names.map((name,i)=>({name,score:i+round})));
if(Object.keys(t.standings).length!==8)throw new Error('Tournament did not retain all 8 athletes.');
if(!t.complete)throw new Error('Tournament did not complete after 3 events.');
if(t.standings.YOU.points<=0)throw new Error('Tournament points were not awarded.');
const s=ctx.MGOGameState.create('CHARACTER_SELECT');
for(const state of ['VILLAGE_INTRO','GAME_BREAK','SKY_COUNTDOWN','SKY_SPRINT','RACE_RESULTS','TARGET_MAYHEM','TARGET_RESULTS','PENALTY_KINGS','PENALTY_RESULTS','HUB'])s.set(state);
if(s.state!=='HUB')throw new Error('Game state transition smoke test failed.');
console.log('SMOKE PASS: syntax, startup wiring, 8-player scoring, 3-event tournament, and state transitions');