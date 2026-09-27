import fs from 'node:fs';
import assert from 'node:assert/strict';
const html=fs.readFileSync(new URL('./index.html',import.meta.url),'utf8');
const js=fs.readFileSync(new URL('./main.js',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('./style.css',import.meta.url),'utf8');
for(const token of ['NEON ARENA','RIFT//8','main.js','style.css','PLAY ARENA','CREATE ROOM','JOIN ROOM','LOADOUT','characters','RIFT LOBBY','LAUNCH MATCH','gameHud','WASD MOVE','MOUSE AIM/FIRE']) assert.ok(html.includes(token),`missing ${token}`);
for(const token of ['maxPlayers:8','respawnSeconds:5','RARITIES','WEAPONS','CHARACTERS','bomb','ability','botsUpdate','projectilesUpdate','state.grounded','state.sliding','function respawn','ARENA ','selectedChar','show(el)','launchBtn']) assert.ok(js.includes(token),`missing ${token}`);
for(const token of ['.crosshair','.weapon','.menu-grid','.character-grid','.lobby-layout']) assert.ok(css.includes(token),`missing ${token}`);
console.log('arena smoke: PASS');