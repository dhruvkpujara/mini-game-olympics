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
// Rivals are active participants too.
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
;renderer.domElement.addEventListener('click',shootTarget);
function updateTargetCamera(){camera.position.set(player.position.x,2.8,35);camera.lookAt(new THREE.Vector3(player.position.x,3.1,28))}
function updateRaceHUD(){if(secondGame){return}const h=document.querySelector('#raceHud'),b=document.querySelector('#raceBoard');if(!race.active&&!race.finished){h.style.display='block';b.style.display='none';document.querySelector('#raceState').textContent='Starting in '+Math.ceil(skyCountdown)+'s';document.querySelector('#raceTime').textContent='GET READY';document.querySelector('#raceCheckpoint').textContent='SKY COURSE · 8 CHECKPOINTS';document.querySelector('#raceStats').textContent='COINS 0 · BOOST READY';return}setRaceVisible(true);document.querySelector('#raceState').textContent=race.finished?'RESULTS':'RACE LIVE';document.querySelector('#raceTime').textContent=race.finished?race.time.toFixed(2)+'s':race.time.toFixed(2)+'s';document.querySelector('#raceCheckpoint').textContent='CHECKPOINT '+race.checkpoint+' / 8';document.querySelector('#raceStats').textContent='COINS '+(race.coinCount||0)+' · BOOST '+((race.boost||0)>0?race.boost.toFixed(1)+'s':'READY');if(race.finished){const board=skySprintLeaderboard(race);b.innerHTML='<b>LEADERBOARD</b>'+board.slice(0,6).map((x,i)=>'<div class="race-row '+(x.name==='YOU'?'you':'')+'"><span>'+(i+1)+'. '+x.name+'</span><span>'+(x.finished?x.time.toFixed(2)+'s':'--')+'</span></div>').join('')}}
function loop(){
  requestAnimationFrame(loop);
  const dt=Math.min(clock.getDelta(),.05);
  elapsed+=dt;
  gameState.tick(dt);

  try{
    switch(gameState.state){
      case 'SKY_COUNTDOWN':
        skyCountdown=Math.max(0,skyCountdown-dt);
        if(skyCountdown<=0){
          startSkySprint(player,race);
          gameState.set('SKY_SPRINT');
          showToast('GO! RUN TO THE FINISH!');
          setRaceVisible(true);
        }
        break;

      case 'SKY_SPRINT':
        updateSkySprint(player,keys,dt,yaw,race,showToast);
        if(race.playerFinished){
          race.finished=true;
          returnTimer=0;
          gameState.set('RACE_RESULTS');
          const board=skySprintLeaderboard(race);
          const place=board.findIndex(x=>x.name==='YOU')+1;
          showToast(place===1?'1ST PLACE! 🏆':'FINISHED — PLACE '+place);
        }
        break;

      case 'RACE_RESULTS':
        returnTimer+=dt;
        if(returnTimer>2){
          race.finished=false;
          race.playerFinished=false;
          race.playerFinishTime=null;
          race.rivalFinishTimes=[];
          returnTimer=0;
          startTargetMayhem();
          gameState.set('TARGET_MAYHEM');
        }
        break;

      case 'TARGET_MAYHEM':
        updateTargetMayhem(dt);
        break;

      case 'TARGET_RESULTS':
        targetResultTimer+=dt;
        if(targetResultTimer>1.5){
          document.querySelector('#eventName').textContent='NEXT EVENT';
          document.querySelector('#venue').innerHTML='<b>OLYMPIC PLAZA</b><span>Ready for the next mini-game</span>';
          setRaceVisible(false);
          targetResultTimer=0;
          gameState.set('HUB');
        }
        break;

      case 'HUB':
        updatePlayer(player,keys,dt,yaw,showToast);
        break;
    }

    if(gameState.state==='TARGET_MAYHEM'||gameState.state==='TARGET_RESULTS')updateTargetCamera();else updateCamera(camera,player,yaw,gameState.state==='SKY_SPRINT' ? .28 : pitch);

    if(gameState.state==='TARGET_MAYHEM'){
      document.querySelector('#raceHud').style.display='block';
      document.querySelector('#raceBoard').style.display='none';
      document.querySelector('#raceState').textContent='TARGET MAYHEM';
      document.querySelector('#raceTime').textContent=Math.max(0,targetTime).toFixed(1)+'s';
      document.querySelector('#raceCheckpoint').textContent='CLICK TARGETS';
      document.querySelector('#raceStats').textContent='SCORE '+targetScore+' · HITS '+targetHits;
    }

    updateUI(
      player,dt,
      gameState.state==='SKY_SPRINT'||gameState.state==='RACE_RESULTS',
      gameState.state==='TARGET_MAYHEM'||gameState.state==='TARGET_RESULTS'
    );
    updateRaceHUD();
    renderer.render(scene,camera);
    window.MGO_DEBUG.lastFrame=performance.now();
    window.MGO_DEBUG.lastError=null;
  }catch(err){
    window.MGO_DEBUG.lastError=String(err&&err.stack||err);
    console.error('Mini Game Olympics runtime error:',err);
    renderer.render(scene,camera);
    const e=document.querySelector('#debugError');
    if(e){
      e.style.display='block';
      e.textContent='RUNTIME ERROR\\n'+window.MGO_DEBUG.lastError;
    }
  }
}
window.MGO_DEBUG={
  getState:()=>gameState.state,
  getSnapshot:()=>({state:gameState.state,skyCountdown,targetTime,targetScore,raceActive:race.active,raceFinished:race.finished,playerFinished:race.playerFinished}),
  lastFrame:performance.now(),
  lastError:null
};
const debugError=document.createElement('pre');
debugError.id='debugError';
debugError.style='display:none;position:fixed;left:12px;right:12px;bottom:12px;max-height:40vh;overflow:auto;background:#2b1111;color:#fff;padding:12px;border:1px solid #f55;border-radius:10px;z-index:9999;font:12px monospace;white-space:pre-wrap';
document.body.appendChild(debugError);
loop()
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});