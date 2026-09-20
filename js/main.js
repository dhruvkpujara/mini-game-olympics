const scene=new THREE.Scene();scene.background=new THREE.Color(0xbfe7ff);scene.fog=new THREE.Fog(0xbfe7ff,80,220);
const camera=new THREE.PerspectiveCamera(58,innerWidth/innerHeight,.1,500);
const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.shadowMap.enabled=true;document.querySelector('#game').appendChild(renderer.domElement);
scene.add(new THREE.HemisphereLight(0xffffff,0x65815d,2.2));const sun=new THREE.DirectionalLight(0xffffff,3);sun.position.set(60,90,35);sun.castShadow=true;scene.add(sun);
const world=createWorld(scene),race=createSkySprint(scene),player=createPlayer(scene);player.position.set(0,.1,22);
const keys={};addEventListener('keydown',e=>{keys[e.code]=true;if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code))e.preventDefault()});addEventListener('keyup',e=>{keys[e.code]=false});addEventListener('blur',()=>{for(const k in keys)keys[k]=false});document.addEventListener('visibilitychange',()=>{if(document.hidden)for(const k in keys)keys[k]=false});
let yaw=.25,pitch=.48,drag=false,lx=0,ly=0;renderer.domElement.onmousedown=e=>{drag=true;lx=e.clientX;ly=e.clientY};addEventListener('mouseup',()=>drag=false);addEventListener('mousemove',e=>{if(!drag)return;yaw-=(e.clientX-lx)*.006;pitch=Math.max(.2,Math.min(1.05,pitch-(e.clientY-ly)*.004));lx=e.clientX;ly=e.clientY});
let skyCountdown=5,returnTimer=0,elapsed=0,secondGame=false,targetTime=30,targetScore=0,targetHits=0,targetResultTimer=0,targetFlash=0,targets=[],targetMeshes=[],targetRay=new THREE.Raycaster(),mouse=new THREE.Vector2(),clock=new THREE.Clock();
const gameState=MGOGameState.create('SKY_COUNTDOWN');
function setRaceVisible(v){const h=document.querySelector('#raceHud');const b=document.querySelector('#raceBoard');if(h)h.style.display=v?'block':'none';if(b)b.style.display=(v&&race&&race.finished)?'block':'none'}
function clearTargets(){for(const t of targets)scene.remove(t);targets=[];targetMeshes=[]}
const targetColors=[
  {name:'GREEN',color:0x43d17a,points:50},
  {name:'BLUE',color:0x3b82f6,points:100},
  {name:'YELLOW',color:0xf5c542,points:150},
  {name:'RED',color:0xe74c3c,points:250},
  {name:'PURPLE',color:0xa855f7,points:500}
];
let targetArenaPlayers=[];
function spawnTarget(g,i){
  const data=targetColors[(i+Math.floor(Math.random()*targetColors.length))%targetColors.length];
  const target=g.userData.targetMesh;
  target.material.color.setHex(data.color);
  target.material.emissive.setHex(data.color);
  target.material.emissiveIntensity=.28;
  g.userData.points=data.points;g.userData.colorName=data.name;
  g.position.set((Math.random()*2-1)*12,Math.random()*.9,25-Math.floor(i/3)*10);
  g.visible=true;target.visible=true;
}
function setupTargetArenaPlayers(){
  targetArenaPlayers=[{name:'YOU',score:0,hits:0,color:0x2458d6}];
  race.rivals.forEach((r,i)=>targetArenaPlayers.push({name:['BOLT','NOVA','DASH','ROCKET','FLASH'][i],score:0,hits:0,color:[0xe74c3c,0x16a085,0x8e44ad,0xf39c12,0x34495e][i]}));
  race.rivals.forEach(r=>{r.visible=true;r.position.set((Math.random()*2-1)*14,.1,39+Math.random()*4);r.rotation.y=Math.PI});
}
function startTargetMayhem(){
  secondGame=true;targetResultTimer=0;targetTime=30;targetScore=0;targetHits=0;targetFlash=0;clearTargets();player.position.set(0,.1,48);player.rotation.y=Math.PI;
  document.querySelector('#eventName').textContent='TARGET MAYHEM';
  document.querySelector('#venue').innerHTML='<b>CHALLENGE ARENA</b><span>Hit targets · different colours = different points</span>';
  setRaceVisible(false);setupTargetArenaPlayers();
  for(let i=0;i<9;i++){
    const g=new THREE.Group(),pole=new THREE.Mesh(new THREE.CylinderGeometry(.12,.12,4,8),new THREE.MeshStandardMaterial({color:0x263746})),back=new THREE.Mesh(new THREE.CylinderGeometry(2.35,2.35,.2,24),new THREE.MeshStandardMaterial({color:0x182432})),target=new THREE.Mesh(new THREE.CylinderGeometry(2,2,.35,24),new THREE.MeshStandardMaterial({color:0xffffff})),ring=new THREE.Mesh(new THREE.TorusGeometry(1.25,.16,8,24),new THREE.MeshStandardMaterial({color:0xffffff,emissive:0x555555,emissiveIntensity:.35}));
    pole.position.y=2;back.position.y=4;target.position.y=4;ring.position.y=4;target.rotation.x=Math.PI/2;back.rotation.x=Math.PI/2;ring.rotation.x=Math.PI/2;
    target.userData.hitTarget=true;g.userData={target:true,phase:i,targetMesh:target};g.add(pole,back,target,ring);scene.add(g);targets.push(g);targetMeshes.push(target);spawnTarget(g,i);
  }
  showToast('TARGET MAYHEM! HIT COLOURED TARGETS!');
}
function updateTargetMayhem(dt){if(!secondGame)return;targetTime-=dt;targetFlash=Math.max(0,targetFlash-dt);for(const g of targets){if(!g.visible)continue;g.rotation.y+=dt*1.5;g.position.x=Math.max(-12,Math.min(12,g.position.x+Math.sin(elapsed*2+g.userData.phase)*dt*2));g.position.y=Math.sin(elapsed*1.8+g.userData.phase)*.25}if(targetTime<=0){targetTime=0;secondGame=false;gameState.set('TARGET_RESULTS');targetResultTimer=0;showToast('TIME! SCORE '+targetScore);clearTargets();document.querySelector('#eventName').textContent='RESULTS';document.querySelector('#venue').innerHTML='<b>CHALLENGE ARENA</b><span>Target Mayhem complete · Score '+targetScore+'</span>';setTimeout(()=>{document.querySelector('#eventName').textContent='NEXT EVENT';document.querySelector('#venue').innerHTML='<b>OLYMPIC PLAZA</b><span>Ready for the next mini-game</span>'},1500)}}
function shootTarget(e){
  if(!secondGame)return;
  const r=renderer.domElement.getBoundingClientRect();mouse.x=((e.clientX-r.left)/r.width)*2-1;mouse.y=-((e.clientY-r.top)/r.height)*2+1;
  targetRay.setFromCamera(mouse,camera);const hits=targetRay.intersectObjects(targetMeshes,false);
  if(hits.length){
    const target=hits[0].object;if(target.visible){
      const g=targets.find(x=>x.userData.targetMesh===target&&x.visible);
      if(g){target.visible=false;g.visible=false;const pts=g.userData.points||100;targetScore+=pts;targetHits++;targetFlash=.25;showToast('🎯 '+g.userData.colorName+' TARGET! +'+pts+' · SCORE '+targetScore);}
    }
  }else{targetFlash=.08;showToast('MISS')}
}
;