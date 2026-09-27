import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';

const C={maxPlayers:8,roundSeconds:180,respawnSeconds:3};
const chars=[['Volt',0x43d9ff,'Speed Surge'],['Nova',0xff5f8f,'Energy Shield'],['Echo',0x8b7bff,'Decoy Drone'],['Flux',0x53f08a,'Gravity Pulse'],['Blaze',0xffa347,'Shockwave'],['Zero',0xdde8ff,'Phase Dash'],['Pixel',0xffe45c,'Repair Field'],['Orbit',0x72a7ff,'Jet Burst']].map(x=>({name:x[0],color:x[1],ability:x[2]}));

const s={score:0,tags:0,streak:0,time:0,yaw:0,keys:new Set(),locked:false,jump:0,grounded:true,dashing:0,tagReady:0,pulseReady:0,roundOver:false};
const scene=new THREE.Scene();
const camera=new THREE.PerspectiveCamera(64,innerWidth/innerHeight,.1,220);
const renderer=new THREE.WebGLRenderer({antialias:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setSize(innerWidth,innerHeight);renderer.shadowMap.enabled=true;
document.querySelector('#game').appendChild(renderer.domElement);
scene.add(new THREE.HemisphereLight(0x9ed7ff,0x101528,2));
const sun=new THREE.DirectionalLight(0xffffff,2.5);sun.position.set(25,35,10);sun.castShadow=true;scene.add(sun);
const world=new THREE.Group();scene.add(world);
const tags=[],effects=[],clock=new THREE.Clock();
const mat=(c,e=0,i=0)=>new THREE.MeshStandardMaterial({color:c,metalness:.2,roughness:.5,emissive:e,emissiveIntensity:i});
function box(x,y,z,w,h,d,c,e=0,i=0){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat(c,e,i));m.position.set(x,y,z);m.castShadow=m.receiveShadow=true;world.add(m);return m}
function buildArena(){
  box(0,-.5,0,80,1,80,0x111d33);
  const g=new THREE.GridHelper(80,40,0x36bde8,0x18304d);g.position.y=.03;world.add(g);
  for(const p of [[0,3,-39],[0,3,39],[-39,3,0],[39,3,0]])box(p[0],p[1],p[2],p[0]===0?80:1,6,p[2]===0?80:1,0x172942,0x165d9a,.5);
  for(let i=0;i<18;i++){const x=(Math.random()-.5)*64,z=(Math.random()-.5)*64,h=3+Math.random()*8;box(x,h/2,z,3+Math.random()*4,h,3+Math.random()*4,0x1a2942,0x163e67,.45)}
  for(let i=0;i<5;i++){const p=new THREE.Mesh(new THREE.CylinderGeometry(2,2,.24,20),mat(0x26d9b4,0x26d9b4,2));p.position.set((i-2)*14,.12,i%2?12:-12);world.add(p)}
}
function makeRunner(c){const g=new THREE.Group();g.userData={alive:true,char:c,nextTag:0,respawnAt:0,shieldUntil:0,ai:{cool:0}};const body=new THREE.Mesh(new THREE.CapsuleGeometry(.55,1.1,6,12),mat(c.color,c.color,.18));body.position.y=1.15;g.add(body);const head=new THREE.Mesh(new THREE.SphereGeometry(.48,20,16),mat(0xf1c7a7));head.position.y=2.15;g.add(head);return g}
buildArena();
let selectedChar=0;
const player=makeRunner(chars[0]);player.position.set(0,0,28);scene.add(player);
const bots=[];
for(let i=1;i<C.maxPlayers;i++){const b=makeRunner(chars[i]),a=(i-1)*Math.PI*2/7;b.position.set(Math.cos(a)*27,0,Math.sin(a)*27);scene.add(b);bots.push(b)}
const all=()=>[player,...bots];

function hud(){
  const left=Math.max(0,C.roundSeconds-s.time);
  const m=Math.floor(left/60),sec=Math.floor(left%60);
  document.querySelector('#score').textContent=s.score;
  document.querySelector('#tags').textContent=s.tags;
  document.querySelector('#round').textContent=m+':'+String(sec).padStart(2,'0');
  document.querySelector('#tagReady').textContent=s.time>=s.tagReady?'PULSE READY':'PULSE COOLDOWN';
  document.querySelector('#dashReady').textContent=s.dashing>0?'DASHING':'DASH READY';
  document.querySelector('#streak').textContent='STREAK ×'+s.streak;
  document.querySelector('#event').textContent=s.roundOver?'ROUND COMPLETE':(left<30?'FINAL PUSH':'CALM');
}
function resetRunner(t){
  t.userData.alive=true;t.userData.shieldUntil=0;t.visible=true;t.userData.nextTag=0;
  const a=Math.random()*Math.PI*2;t.position.set(Math.cos(a)*30,0,Math.sin(a)*30);
}
function tagRunner(target,owner){
  if(!target.userData.alive||target===owner)return;
  if(target.userData.shieldUntil>s.time)return;
  target.userData.alive=false;target.visible=false;target.userData.respawnAt=s.time+C.respawnSeconds;
  if(owner===player){s.score+=100;s.tags++;s.streak++;}else if(target===player){s.streak=0}
  const burst=new THREE.Mesh(new THREE.SphereGeometry(.25,12,12),new THREE.MeshBasicMaterial({color:0x8ff3ff,transparent:true,opacity:.9}));
  burst.position.copy(target.position);scene.add(burst);effects.push({m:burst,t:.5});
  hud();
}
function tagPulse(owner){
  if(!owner.userData.alive)return;
  if(owner===player && s.time<s.tagReady)return;
  if(owner===player)s.tagReady=s.time+.65;
  const dir=new THREE.Vector3(0,0,-1).applyAxisAngle(new THREE.Vector3(0,1,0),owner===player?s.yaw:owner.rotation.y);
  const o=owner.position.clone().add(new THREE.Vector3(0,1.35,0));
  const orb=new THREE.Mesh(new THREE.SphereGeometry(.14,10,10),mat(owner.userData.char.color,owner.userData.char.color,3));
  orb.position.copy(o);orb.userData={dir,owner,life:1.5};scene.add(orb);tags.push(orb);
}
function pulseAbility(){
  if(!player.userData.alive||s.time<s.pulseReady)return;
  s.pulseReady=s.time+8;
  for(const t of all()){if(t!==player&&t.userData.alive&&t.position.distanceTo(player.position)<6)tagRunner(t,player)}
  player.scale.setScalar(1.22);setTimeout(()=>player.scale.setScalar(1),280);
}
function dash(){
  if(!player.userData.alive||s.dashing>0)return;
  const dir=new THREE.Vector3((s.keys.has('KeyD')?1:0)-(s.keys.has('KeyA')?1:0),0,(s.keys.has('KeyS')?1:0)-(s.keys.has('KeyW')?1:0));
  if(!dir.lengthSq())dir.set(0,0,-1);
  dir.normalize().applyAxisAngle(new THREE.Vector3(0,1,0),s.yaw);
  player.position.addScaledVector(dir,8);s.dashing=.35;
}
function move(dt){
  if(!player.userData.alive){if(s.time>=player.userData.respawnAt)resetRunner(player);return}
  if(s.keys.has('Space')&&s.grounded&&!s.dashing){s.jump=7.5;s.grounded=false}
  s.jump-=18*dt;player.position.y+=s.jump*dt;
  if(player.position.y<=0){player.position.y=0;s.jump=0;s.grounded=true}
  const f=(s.keys.has('KeyW')?1:0)-(s.keys.has('KeyS')?1:0),x=(s.keys.has('KeyD')?1:0)-(s.keys.has('KeyA')?1:0);
  const v=new THREE.Vector3(x,0,-f);
  if(v.lengthSq()){v.normalize().applyAxisAngle(new THREE.Vector3(0,1,0),s.yaw);const speed=s.keys.has('ShiftLeft')||s.keys.has('ShiftRight')?13:8;player.position.addScaledVector(v,s.dashing>0?speed*1.5*dt:speed*dt)}
  player.position.x=THREE.MathUtils.clamp(player.position.x,-36,36);player.position.z=THREE.MathUtils.clamp(player.position.z,-36,36);
  if(s.dashing>0)s.dashing-=dt;
}
function botsUpdate(dt){
  for(const b of bots){
    if(!b.userData.alive){if(s.time>=b.userData.respawnAt)resetRunner(b);continue}
    const v=player.position.clone().sub(b.position);const d=v.length();v.y=0;
    if(d>10)b.position.addScaledVector(v.normalize(),dt*5.2);
    else if(d<5)b.position.addScaledVector(v.normalize(),-dt*3);
    b.lookAt(player.position.x,b.position.y+1,player.position.z);
    b.userData.ai.cool-=dt;
    if(d<18&&b.userData.ai.cool<=0){b.userData.ai.cool=1.1+Math.random()*1.4;tagPulse(b)}
  }
}
function tagsUpdate(dt){
  for(let i=tags.length-1;i>=0;i--){const p=tags[i];p.position.addScaledVector(p.userData.dir,24*dt);p.userData.life-=dt;
    for(const t of all()){if(t!==p.userData.owner&&t.userData.alive&&p.position.distanceTo(t.position)<1.15){tagRunner(t,p.userData.owner);p.userData.life=0;break}}
    if(p.userData.life<=0){scene.remove(p);tags.splice(i,1)}
  }
}
function effectsUpdate(dt){for(let i=effects.length-1;i>=0;i--){const e=effects[i];e.t-=dt;e.m.scale.multiplyScalar(1+dt*3);e.m.material.opacity=Math.max(0,e.t*2);if(e.t<=0){scene.remove(e.m);effects.splice(i,1)}}}
function cameraUpdate(){const t=player.position.clone().add(new THREE.Vector3(0,1.5,0));const d=s.locked?5.4:7.2;const o=new THREE.Vector3(Math.sin(s.yaw)*d,3.2,Math.cos(s.yaw)*d);camera.position.lerp(t.clone().add(o),.12);camera.lookAt(t)}
function worldUpdate(){scene.background=new THREE.Color().setHSL(.6,.65,.16+.08*(Math.sin(s.time/20)+1))}
function show(el){[menu,select,lobby].forEach(x=>x.classList.add('hidden'));el.classList.remove('hidden')}
const menu=document.querySelector('#menu'),select=document.querySelector('#select'),lobby=document.querySelector('#lobby'),game=document.querySelector('#game'),gameHud=document.querySelector('#gameHud');
const charGrid=document.querySelector('#characters'),slots=document.querySelector('#slots');
chars.forEach((c,i)=>{const b=document.createElement('button');b.className='character'+(i===0?' selected':'');b.innerHTML='<div class="orb" style="background:#'+c.color.toString(16).padStart(6,'0')+';color:#'+c.color.toString(16).padStart(6,'0')+'"></div><strong>'+c.name+'</strong><span>'+c.ability+'</span>';b.onclick=()=>{selectedChar=i;document.querySelectorAll('.character').forEach(x=>x.classList.remove('selected'));b.classList.add('selected')};charGrid.appendChild(b)});
chars.forEach((c,i)=>{const d=document.createElement('div');d.className='slot'+(i<3?' ready':'');d.innerHTML='<div class="dot">'+(i+1)+'</div><div><small>'+(i===0?'YOU':'BOT')+'</small><strong>'+c.name+'</strong></div>';slots.appendChild(d)});
document.querySelector('#playBtn').onclick=()=>show(select);
document.querySelector('#createBtn').onclick=()=>show(lobby);
document.querySelector('#joinBtn').onclick=()=>{const code=prompt('Enter room code');if(code)show(lobby)};
document.querySelector('#loadoutBtn').onclick=()=>show(select);
document.querySelector('#continueBtn').onclick=()=>show(lobby);
document.querySelectorAll('[data-back]').forEach(b=>b.onclick=()=>show(menu));
document.querySelector('#copyRoom').onclick=async()=>{try{await navigator.clipboard.writeText('NOVA-7X4')}catch{}};
document.querySelector('#launchBtn').onclick=()=>{[menu,select,lobby].forEach(x=>x.classList.add('hidden'));game.classList.remove('hidden');gameHud.classList.remove('hidden');const c=chars[selectedChar];player.userData.char=c;player.children[0].material.color.setHex(c.color);document.querySelector('#playerName').textContent=c.name;document.querySelector('#playerAbility').textContent=c.ability;hud()};

addEventListener('keydown',e=>{s.keys.add(e.code);if(e.code==='Space'){e.preventDefault();if(s.grounded){}else{} }if(e.code==='KeyQ')pulseAbility();if(e.code==='Space'&&e.repeat===false&&s.grounded===false){}if(e.code==='ShiftLeft'&&e.repeat===false)dash();hud()});
addEventListener('keyup',e=>s.keys.delete(e.code));
renderer.domElement.onclick=()=>{if(!s.locked)renderer.domElement.requestPointerLock?.();else tagPulse(player)};
document.addEventListener('pointerlockchange',()=>s.locked=document.pointerLockElement===renderer.domElement);
document.addEventListener('mousemove',e=>{if(s.locked)s.yaw-=e.movementX*.0024});
addEventListener('contextmenu',e=>e.preventDefault());
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});

function loop(){
  requestAnimationFrame(loop);
  const dt=Math.min(clock.getDelta(),.05);
  if(!s.roundOver){s.time+=dt;if(s.time>=C.roundSeconds)s.roundOver=true;move(dt);botsUpdate(dt);tagsUpdate(dt);effectsUpdate(dt);worldUpdate();cameraUpdate();hud()}
  renderer.render(scene,camera);
}
hud();loop();