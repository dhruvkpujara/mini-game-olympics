const scene=new THREE.Scene();scene.background=new THREE.Color(0xbfe7ff);scene.fog=new THREE.Fog(0xbfe7ff,80,220);
const camera=new THREE.PerspectiveCamera(58,innerWidth/innerHeight,.1,500);
const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.shadowMap.enabled=true;document.querySelector('#game').appendChild(renderer.domElement);
scene.add(new THREE.HemisphereLight(0xffffff,0x65815d,2.2));const sun=new THREE.DirectionalLight(0xffffff,3);sun.position.set(60,90,35);sun.castShadow=true;scene.add(sun);
const world=createWorld(scene),race=createSkySprint(scene),player=createPlayer(scene);player.position.set(0,.1,22);
const keys={};addEventListener('keydown',e=>{keys[e.code]=true;if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code))e.preventDefault()});addEventListener('keyup',e=>{keys[e.code]=false});addEventListener('blur',()=>{for(const k in keys)keys[k]=false});document.addEventListener('visibilitychange',()=>{if(document.hidden)for(const k in keys)keys[k]=false});
let yaw=.25,pitch=.48,drag=false,lx=0,ly=0;renderer.domElement.onmousedown=e=>{drag=true;lx=e.clientX;ly=e.clientY};addEventListener('mouseup',()=>drag=false);addEventListener('mousemove',e=>{if(!drag)return;yaw-=(e.clientX-lx)*.006;pitch=Math.max(.2,Math.min(1.05,pitch-(e.clientY-ly)*.004));lx=e.clientX;ly=e.clientY});
let skyCountdown=5,returnTimer=0,resultHoldSeconds=7,elapsed=0,secondGame=false,targetTime=30,targetScore=0,targetHits=0,targetResultTimer=0,targetFlash=0,targets=[],targetMeshes=[],targetRay=new THREE.Raycaster(),mouse=new THREE.Vector2(),clock=new THREE.Clock();
const tournament=MGOTournament.create(['SKY SPRINT','TARGET MAYHEM']);
tournament.start();
const gameState=MGOGameState.create('SKY_COUNTDOWN');
function renderTournamentBoard(title,rows){const b=document.querySelector('#raceBoard');if(!b)return;b.style.display='block';b.innerHTML='<b>'+title+'</b>'+rows.map((x,i)=>'<div class="race-row '+(x.name==='YOU'?'you':'')+'"><span>'+(i+1)+'. '+x.name+'</span><span>'+x.points+' PTS</span></div>').join('')}
function awardSkySprintTournament(){const rows=skySprintLeaderboard(race).map(x=>({name:x.name,score:x.time,finished:x.finished}));rows.sort((a,b)=>a.score-b.score);tournament.addEventResult(rows);renderTournamentBoard('EVENT POINTS',Object.values(tournament.standings).sort((a,b)=>b.points-a.points))}
function awardTargetTournament(){const you=targetArenaPlayers.find(x=>x.name==='YOU');if(you){you.score=targetScore;you.hits=targetHits}const rows=targetArenaPlayers.map(x=>({name:x.name,score:x.score})).sort((a,b)=>b.score-a.score);tournament.addEventResult(rows);renderTournamentBoard('TOURNAMENT STANDINGS',Object.values(tournament.standings).sort((a,b)=>b.points-a.points))}
function renderFinalPodiumBoard(){const rows=Object.values(tournament.standings).sort((a,b)=>b.points-a.points||((b.events?.at(-1)?.score||0)-(a.events?.at(-1)?.score||0)));const b=document.querySelector('#finalPodium');if(!b)return;b.style.display='block';b.innerHTML='<b>🏆 FINAL PODIUM · COMBINED SCORE</b>'+rows.slice(0,3).map((x,i)=>{const medals=['🥇','🥈','🥉'];const g1=x.events?.find(e=>e.event==='SKY SPRINT')?.points||0;const g2=x.events?.find(e=>e.event==='TARGET MAYHEM')?.points||0;return '<div class="podium-row '+(x.name==='YOU'?'you':'')+'"><span>'+medals[i]+' '+x.name+'</span><span>G1 '+g1+' + G2 '+g2+' = <b>'+x.points+'</b></span></div>'}).join('')+'<div class="podium-total">TOP 3 · COMBINED RESULTS FROM BOTH GAMES</div>';const raceBoard=document.querySelector('#raceBoard');if(raceBoard)raceBoard.style.display='none';}
function startNextTournamentEvent(){if(tournament.complete){gameState.set('HUB');document.querySelector('#eventName').textContent='TOURNAMENT COMPLETE';document.querySelector('#venue').innerHTML='<b>OLYMPIC PODIUM</b><span>Top 3 decided by combined Game 1 + Game 2 points</span>';setRaceVisible(true);renderFinalPodiumBoard();return}document.querySelector('#raceBoard').style.display='none';document.querySelector('#eventName').textContent=tournament.current;document.querySelector('#venue').innerHTML='<b>OLYMPIC PLAZA</b><span>Round '+tournament.round+' / '+tournament.totalRounds+'</span>';skyCountdown=3;gameState.set('SKY_COUNTDOWN')}
function setRaceVisible(v){const h=document.querySelector('#raceHud');if(h)h.style.display=v?'block':'none'}
function clearTargets(){for(const t of targets)scene.remove(t);targets=[];targetMeshes=[]}
function respawnTarget(g,i){if(!secondGame)return;spawnTarget(g,i);g.userData.respawnTimer=0;g.userData.hit=false}
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
  g.visible=true;target.visible=true;g.userData.hit=false;
}
// Rivals are active participants too.
function setupTargetArenaPlayers(){
  targetArenaPlayers=[{name:'YOU',score:0,hits:0,color:0x2458d6,skill:1}];
  race.rivals.forEach((r,i)=>targetArenaPlayers.push({name:['BOLT','NOVA','DASH','ROCKET','FLASH'][i],score:0,hits:0,color:[0xe74c3c,0x16a085,0x8e44ad,0xf39c12,0x34495e][i],skill:[.76,.84,.9,.8,.87][i]}));
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
    target.userData.hitTarget=true;g.userData={target:true,phase:i,targetMesh:target,respawnTimer:0,hit:false};g.add(pole,back,target,ring);scene.add(g);targets.push(g);targetMeshes.push(target);spawnTarget(g,i);
  }
  showToast('TARGET MAYHEM! HIT COLOURED TARGETS!');
}
function updateTargetMayhem(dt){if(!secondGame)return;targetTime-=dt;targetFlash=Math.max(0,targetFlash-dt);for(const p of targetArenaPlayers.slice(1)){p.aiTimer=(p.aiTimer||0)-dt;if(p.aiTimer<=0){const skill=p.skill||.8;const hit=Math.random()<skill;if(hit){const values=[50,100,150,250,500],weights=[.28,.3,.22,.15,.05];let roll=Math.random(),pts=50;for(let j=0;j<weights.length;j++){if((roll-=weights[j])<=0){pts=values[j];break}}p.score+=pts;p.hits=(p.hits||0)+1}p.aiTimer=.48+Math.random()*.32}}
  for(const g of targets){const target=g.userData.targetMesh;if(g.userData.hit){g.userData.respawnTimer-=dt;if(g.userData.respawnTimer<=0)respawnTarget(g,g.userData.phase);continue}g.rotation.y+=dt*1.5;g.position.x=Math.max(-12,Math.min(12,g.position.x+Math.sin(elapsed*2+g.userData.phase)*dt*2));g.position.y=Math.sin(elapsed*1.8+g.userData.phase)*.25}if(targetTime<=0){targetTime=0;secondGame=false;awardTargetTournament();renderTargetResultsBoard();gameState.set('TARGET_RESULTS');targetResultTimer=0;showToast('TIME! SCORE '+targetScore);clearTargets();document.querySelector('#eventName').textContent='RESULTS';document.querySelector('#venue').innerHTML='<b>CHALLENGE ARENA</b><span>Target Mayhem complete · Score '+targetScore+'</span>';setTimeout(()=>{document.querySelector('#eventName').textContent='NEXT EVENT';document.querySelector('#venue').innerHTML='<b>OLYMPIC PLAZA</b><span>Ready for the next mini-game</span>'},1500)}}
function shootTarget(e){
  if(!secondGame)return;
  const r=renderer.domElement.getBoundingClientRect();mouse.x=((e.clientX-r.left)/r.width)*2-1;mouse.y=-((e.clientY-r.top)/r.height)*2+1;
  targetRay.setFromCamera(mouse,camera);const hits=targetRay.intersectObjects(targetMeshes,false);
  if(hits.length){
    const target=hits[0].object;if(target.visible){
      const g=targets.find(x=>x.userData.targetMesh===target&&!x.userData.hit);
      if(g){target.visible=false;g.userData.hit=true;g.userData.respawnTimer=.65;const pts=g.userData.points||100;targetScore+=pts;targetHits++;if(targetArenaPlayers[0]){targetArenaPlayers[0].score=targetScore;targetArenaPlayers[0].hits=targetHits}targetFlash=.25;showToast('🎯 '+g.userData.colorName+' TARGET! +'+pts+' · SCORE '+targetScore);}
    }
  }else{targetFlash=.08;showToast('MISS')}
}
;renderer.domElement.addEventListener('click',shootTarget);
function updateTargetCamera(){camera.position.set(player.position.x,2.8,35);camera.lookAt(new THREE.Vector3(player.position.x,3.1,28))}
function renderTargetLeaderboard(){const rows=[...targetArenaPlayers].sort((a,b)=>b.score-a.score);renderTournamentBoard('TARGET MAYHEM',rows.map(x=>({name:x.name,points:Math.round(x.score)})))}
function renderTargetResultsBoard(){const rows=[...targetArenaPlayers].sort((a,b)=>b.score-a.score);const b=document.querySelector('#raceBoard');if(!b)return;b.style.display='block';b.innerHTML='<b>GAME 2 RESULTS</b>'+rows.map((x,i)=>'<div class="race-row '+(x.name==='YOU'?'you':'')+'"><span>'+(i+1)+'. '+x.name+'</span><span>'+Math.round(x.score)+' · +'+(tournament.standings[x.name]?.events?.at(-1)?.points||0)+' PTS</span></div>').join('')}
function updateRaceHUD(){const h=document.querySelector('#raceHud'),b=document.querySelector('#raceBoard');if(gameState.state==='TARGET_MAYHEM'){setRaceVisible(true);renderTargetLeaderboard();return}if(gameState.state==='TARGET_RESULTS'){setRaceVisible(true);renderTargetResultsBoard();document.querySelector('#raceState').textContent='EVENT COMPLETE';document.querySelector('#raceTime').textContent=targetScore+' PTS';document.querySelector('#raceCheckpoint').textContent='POINTS AWARDED';document.querySelector('#raceStats').textContent='TOURNAMENT ROUND '+tournament.index+' / '+tournament.totalRounds;return}if(gameState.state==='HUB'&&tournament.complete){setRaceVisible(true);renderFinalPodiumBoard();return}if(secondGame){return}if(gameState.state==='RACE_RESULTS'){setRaceVisible(true);renderTournamentBoard('TOURNAMENT STANDINGS',Object.values(tournament.standings).sort((a,b)=>b.points-a.points));document.querySelector('#raceState').textContent='EVENT COMPLETE';document.querySelector('#raceTime').textContent=race.time.toFixed(2)+'s';document.querySelector('#raceCheckpoint').textContent='POINTS AWARDED';document.querySelector('#raceStats').textContent='TOURNAMENT ROUND '+tournament.index+' / '+tournament.totalRounds;return}if(!race.active&&!race.finished){h.style.display='block';b.style.display='none';document.querySelector('#raceState').textContent='Starting in '+Math.ceil(skyCountdown)+'s';document.querySelector('#raceTime').textContent='GET READY';document.querySelector('#raceCheckpoint').textContent='SKY COURSE · 8 CHECKPOINTS';document.querySelector('#raceStats').textContent='COINS 0 · BOOST READY';return}setRaceVisible(true);document.querySelector('#raceState').textContent=race.finished?'RESULTS':'RACE LIVE';document.querySelector('#raceTime').textContent=race.finished?race.time.toFixed(2)+'s':race.time.toFixed(2)+'s';document.querySelector('#raceCheckpoint').textContent='CHECKPOINT '+race.checkpoint+' / 8';document.querySelector('#raceStats').textContent='COINS '+(race.coinCount||0)+' · BOOST '+((race.boost||0)>0?race.boost.toFixed(1)+'s':'READY');if(race.finished){const board=skySprintLeaderboard(race);b.innerHTML='<b>LEADERBOARD</b>'+board.slice(0,6).map((x,i)=>'<div class="race-row '+(x.name==='YOU'?'you':'')+'"><span>'+(i+1)+'. '+x.name+'</span><span>'+(x.finished?x.time.toFixed(2)+'s':'--')+'</span></div>').join('')}}
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
          awardSkySprintTournament();
          const place=board.findIndex(x=>x.name==='YOU')+1;
          showToast(place===1?'1ST PLACE! 🏆':'FINISHED — PLACE '+place);
        }
        break;

      case 'RACE_RESULTS':
        returnTimer+=dt;
        const allRivalsFinished=race.rivalFinishTimes.length===race.rivals.length&&race.rivalFinishTimes.every(t=>t!==null);
        if((allRivalsFinished&&returnTimer>resultHoldSeconds)||returnTimer>15){
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
        if(targetResultTimer>resultHoldSeconds){
          targetResultTimer=0;
          startNextTournamentEvent();
        }
        break;

      case 'HUB':
        updatePlayer(player,keys,dt,yaw,showToast);
        break;
    }

    if(gameState.state==='TARGET_MAYHEM'||gameState.state==='TARGET_RESULTS')updateTargetCamera();else updateCamera(camera,player,yaw,gameState.state==='SKY_SPRINT' ? .28 : pitch);

    if(gameState.state==='TARGET_MAYHEM'){
      document.querySelector('#raceHud').style.display='block';
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
    if(tournament.complete&&gameState.state==='HUB'){setRaceVisible(true);renderFinalPodiumBoard();}
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