const scene=new THREE.Scene();scene.background=new THREE.Color(0xbfe7ff);scene.fog=new THREE.Fog(0xbfe7ff,80,220);
const camera=new THREE.PerspectiveCamera(58,innerWidth/innerHeight,.1,500);
const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.shadowMap.enabled=true;document.querySelector('#game').appendChild(renderer.domElement);
scene.add(new THREE.HemisphereLight(0xffffff,0x65815d,2.2));const sun=new THREE.DirectionalLight(0xffffff,3);sun.position.set(60,90,35);sun.castShadow=true;scene.add(sun);
const world=createWorld(scene),race=createSkySprint(scene),player=createPlayer(scene);player.position.set(0,.1,22);
const keys={};addEventListener('keydown',e=>{keys[e.code]=true;if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code))e.preventDefault()});addEventListener('keyup',e=>{keys[e.code]=false});addEventListener('blur',()=>{for(const k in keys)keys[k]=false});document.addEventListener('visibilitychange',()=>{if(document.hidden)for(const k in keys)keys[k]=false});
let yaw=.25,pitch=.48,drag=false,lx=0,ly=0;let penaltyGoal=null,penaltyKeeper=null,penaltyKeeperT=0,penaltyBall=null,penaltyShot=null,penaltyAimPlane=null,penaltyAimMarker=null,penaltyAimZones=[];renderer.domElement.onmousedown=e=>{drag=true;lx=e.clientX;ly=e.clientY};addEventListener('mouseup',()=>drag=false);addEventListener('mousemove',e=>{if(!drag)return;yaw-=(e.clientX-lx)*.006;pitch=Math.max(.2,Math.min(1.05,pitch-(e.clientY-ly)*.004));lx=e.clientX;ly=e.clientY});
let skyCountdown=5,returnTimer=0,resultHoldSeconds=7,elapsed=0,secondGame=false,targetTime=30,targetScore=0,targetHits=0,targetResultTimer=0,targetFlash=0,penaltyShots=0,penaltyGoals=0,penaltyTime=0,penaltyResultTimer=0,penaltyReady=false,penaltyCompleted=false,targets=[],targetMeshes=[],targetRay=new THREE.Raycaster(),mouse=new THREE.Vector2(),clock=new THREE.Clock();
const tournament=MGOTournament.create(['SKY SPRINT','TARGET MAYHEM','PENALTY KINGS']);
tournament.start();
const gameState=MGOGameState.create('SKY_COUNTDOWN');
function renderTournamentBoard(title,rows){const b=document.querySelector('#raceBoard');if(!b)return;b.style.display='block';b.innerHTML='<b>'+title+'</b>'+rows.map((x,i)=>'<div class="race-row '+(x.name==='YOU'?'you':'')+'"><span>'+(i+1)+'. '+x.name+'</span><span>'+x.points+' PTS</span></div>').join('')}
function awardSkySprintTournament(){const rows=skySprintLeaderboard(race).map(x=>({name:x.name,score:x.time,finished:x.finished}));rows.sort((a,b)=>a.score-b.score);tournament.addEventResult(rows);renderTournamentBoard('EVENT POINTS',Object.values(tournament.standings).sort((a,b)=>b.points-a.points))}
function awardTargetTournament(){const you=targetArenaPlayers.find(x=>x.name==='YOU');if(you){you.score=targetScore;you.hits=targetHits}const rows=targetArenaPlayers.map(x=>({name:x.name,score:x.score})).sort((a,b)=>b.score-a.score);tournament.addEventResult(rows);renderTournamentBoard('TOURNAMENT STANDINGS',Object.values(tournament.standings).sort((a,b)=>b.points-a.points))}
function renderFinalPodiumBoard(){const rows=Object.values(tournament.standings).sort((a,b)=>b.points-a.points||((b.events?.reduce((s,e)=>s+e.points,0)||0)-(a.events?.reduce((s,e)=>s+e.points,0)||0)));const b=document.querySelector('#finalPodium');if(!b)return;b.style.display='block';b.innerHTML='<b>🏆 FINAL PODIUM · COMBINED SCORE</b>'+rows.slice(0,3).map((x,i)=>{const medals=['🥇','🥈','🥉'];const g1=x.events?.find(e=>e.event==='SKY SPRINT')?.points||0;const g2=x.events?.find(e=>e.event==='TARGET MAYHEM')?.points||0;const g3=x.events?.find(e=>e.event==='PENALTY KINGS')?.points||0;return '<div class="podium-row '+(x.name==='YOU'?'you':'')+'"><span>'+medals[i]+' '+x.name+'</span><span>G1 '+g1+' + G2 '+g2+' + G3 '+g3+' = <b>'+x.points+'</b></span></div>'}).join('')+'<div class="podium-total">TOP 3 · COMBINED RESULTS FROM ALL 3 GAMES</div>';const raceBoard=document.querySelector('#raceBoard');if(raceBoard)raceBoard.style.display='none'}
function startPenaltyKings(){secondGame=false;penaltyShots=0;penaltyGoals=0;penaltyTime=0;penaltyResultTimer=0;penaltyReady=true;penaltyCompleted=false;penaltyKeeperT=0;penaltyShot=null;if(penaltyAimMarker)penaltyAimMarker.visible=false;document.querySelector('#eventName').textContent='PENALTY KINGS';document.querySelector('#venue').innerHTML='<b>FOOTBALL ARENA</b><span>5 shots · beat the AI goalkeeper</span>';setRaceVisible(true);buildPenaltyArena();player.position.set(0,.1,42);player.rotation.y=Math.PI;showToast('PENALTY KINGS! AIM FOR THE GOAL!');gameState.set('PENALTY_KINGS')}
function createPenaltyStadium(group){
  // Premium football pitch
  const grass=new THREE.Mesh(
    new THREE.PlaneGeometry(44,38),
    new THREE.MeshStandardMaterial({color:0x176b38,roughness:.92,metalness:.02})
  );
  grass.rotation.x=-Math.PI/2;grass.position.set(0,.02,30);grass.receiveShadow=true;group.add(grass);

  // Alternating pitch stripes
  for(let i=0;i<11;i++){
    const stripe=new THREE.Mesh(
      new THREE.PlaneGeometry(4,38),
      new THREE.MeshBasicMaterial({color:i%2?0x1d7a42:0x176b38})
    );
    stripe.rotation.x=-Math.PI/2;stripe.position.set(-20+i*4,0.025,30);group.add(stripe);
  }

  const lineMat=new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.9});
  const line=(w,h,x,y,z=29.96)=>{
    const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),lineMat);
    m.rotation.x=-Math.PI/2;m.position.set(x,.045,z);group.add(m);return m;
  };
  line(44,.09,0,0,11);
  line(44,.09,0,0,49);
  line(.09,38,-22,0,30);
  line(.09,38,22,0,30);
  line(16,.08,0,0,34);
  line(16,.08,0,0,26);

  const centerCircle=new THREE.Mesh(
    new THREE.RingGeometry(4.8,4.92,64),
    lineMat
  );
  centerCircle.rotation.x=-Math.PI/2;centerCircle.position.set(0,.05,30);group.add(centerCircle);

  // Penalty box and spot
  line(24,.08,0,0,35.5);line(24,.08,0,0,24.5);
  line(.08,11,-12,0,30);line(.08,11,12,0,30);
  const spot=new THREE.Mesh(new THREE.CircleGeometry(.14,20),lineMat);
  spot.rotation.x=-Math.PI/2;spot.position.set(0,.06,37);group.add(spot);

  // Stadium seating / crowd backdrop
  const standMat=new THREE.MeshStandardMaterial({color:0x17243a,roughness:.72});
  for(let side of [-1,1]){
    const stand=new THREE.Mesh(new THREE.BoxGeometry(6,5,34),standMat);
    stand.position.set(side*25,2.5,30);stand.castShadow=true;stand.receiveShadow=true;group.add(stand);
    for(let row=0;row<4;row++){
      const rail=new THREE.Mesh(new THREE.BoxGeometry(.18,.18,30),new THREE.MeshStandardMaterial({color:0xf5c542,metalness:.5,roughness:.35}));
      rail.position.set(side*(22.05-row*.7),1+row*.9,30);group.add(rail);
    }
  }

  // Floodlights
  for(const x of [-18,18]){
    const pole=new THREE.Mesh(new THREE.CylinderGeometry(.18,.24,14,12),new THREE.MeshStandardMaterial({color:0x344454,metalness:.7,roughness:.3}));
    pole.position.set(x,7,17);pole.castShadow=true;group.add(pole);
    const lamp=new THREE.Mesh(new THREE.BoxGeometry(2.2,.45,.5),new THREE.MeshStandardMaterial({color:0xffffff,emissive:0xffffff,emissiveIntensity:2}));
    lamp.position.set(x,14,17);group.add(lamp);
    const light=new THREE.SpotLight(0xffffff,18,65,Math.PI/5,.45,1.2);
    light.position.set(x,14,17);light.target.position.set(0,0,30);light.castShadow=true;
    group.add(light,light.target);
  }
}
function addGoalNetDetail(group){
  const netMat=new THREE.LineBasicMaterial({color:0xc8e9f5,transparent:true,opacity:.38});
  for(let x=-6;x<=6;x+=.75){
    const geo=new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(x,0,30.3),new THREE.Vector3(x,5,30.3)]);
    group.add(new THREE.Line(geo,netMat));
  }
  for(let y=0;y<=5;y+=.65){
    const geo=new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-6,y,30.3),new THREE.Vector3(6,y,30.3)]);
    group.add(new THREE.Line(geo,netMat));
  }
}
function buildPenaltyKeeperModel(){
  const k=new THREE.Group();
  const jersey=new THREE.MeshStandardMaterial({color:0xf59e0b,roughness:.6});
  const shorts=new THREE.MeshStandardMaterial({color:0x111827,roughness:.65});
  const skin=new THREE.MeshStandardMaterial({color:0xc98b68,roughness:.72});
  const glove=new THREE.MeshStandardMaterial({color:0x7dd3fc,roughness:.4});
  const body=new THREE.Mesh(new THREE.CapsuleGeometry(.55,1.05,6,12),jersey);
  const head=new THREE.Mesh(new THREE.SphereGeometry(.43,20,14),skin);
  const shortsMesh=new THREE.Mesh(new THREE.BoxGeometry(1.0,.45,.5),shorts);
  const armL=new THREE.Mesh(new THREE.CapsuleGeometry(.13,.75,5,10),jersey);
  const armR=armL.clone();
  const gloveL=new THREE.Mesh(new THREE.SphereGeometry(.2,12,8),glove),gloveR=gloveL.clone();
  const legL=new THREE.Mesh(new THREE.CapsuleGeometry(.16,.75,5,10),shorts),legR=legL.clone();
  body.position.y=1.45;head.position.y=2.55;shortsMesh.position.y=.82;
  armL.position.set(-.7,1.55,0);armR.position.set(.7,1.55,0);
  gloveL.position.set(-.88,1.55,0);gloveR.position.set(.88,1.55,0);
  legL.position.set(-.28,.35,0);legR.position.set(.28,.35,0);
  k.add(body,head,shortsMesh,armL,armR,gloveL,gloveR,legL,legR);
  k.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true}});
  return k;
}
function buildPenaltyArena(){
  if(penaltyGoal){scene.remove(penaltyGoal);penaltyGoal=null}
  if(penaltyKeeper){scene.remove(penaltyKeeper);penaltyKeeper=null}
  if(penaltyBall){scene.remove(penaltyBall);penaltyBall=null}
  if(penaltyAimPlane){scene.remove(penaltyAimPlane);penaltyAimPlane=null}
  if(penaltyAimMarker){scene.remove(penaltyAimMarker);penaltyAimMarker=null}
  penaltyAimZones.forEach(z=>scene.remove(z));penaltyAimZones=[];
  const group=new THREE.Group();
  createPenaltyStadium(group);
  const mat=new THREE.MeshStandardMaterial({color:0xffffff,roughness:.28,metalness:.35});
  const post=new THREE.Mesh(new THREE.BoxGeometry(.28,5,.28),mat),post2=post.clone(),bar=new THREE.Mesh(new THREE.BoxGeometry(12,.28,.28),mat);
  post.position.set(-6,2.5,30);post2.position.set(6,2.5,30);bar.position.set(0,5,30);
  const net=new THREE.Mesh(new THREE.PlaneGeometry(12,5),new THREE.MeshBasicMaterial({color:0x9bd5e8,transparent:true,opacity:.10,side:THREE.DoubleSide}));net.position.set(0,2.5,30.3);
  group.add(post,post2,bar,net);addGoalNetDetail(group);scene.add(group);penaltyGoal=group;

  // Invisible goal plane: clicks are converted into a real 3D point on the goal.
  penaltyAimPlane=new THREE.Mesh(
    new THREE.PlaneGeometry(12,5),
    new THREE.MeshBasicMaterial({transparent:true,opacity:0,side:THREE.DoubleSide,depthWrite:false})
  );
  penaltyAimPlane.position.set(0,2.5,30.05);
  scene.add(penaltyAimPlane);

  // 3x3 visual aim zones make it obvious where the player is choosing to shoot.
  const zoneMat=new THREE.MeshBasicMaterial({color:0x38bdf8,transparent:true,opacity:.08,side:THREE.DoubleSide,depthWrite:false});
  for(let row=0;row<3;row++){
    for(let col=0;col<3;col++){
      const zone=new THREE.Mesh(new THREE.PlaneGeometry(3.9,1.55),zoneMat.clone());
      zone.position.set(-4+col*4,1.25+row*1.65,29.98);
      zone.userData={row,col};
      penaltyGoal.add(zone);penaltyAimZones.push(zone);
    }
  }

  penaltyAimMarker=new THREE.Mesh(
    new THREE.RingGeometry(.22,.34,24),
    new THREE.MeshBasicMaterial({color:0xffd43b,transparent:true,opacity:.95,side:THREE.DoubleSide,depthWrite:false})
  );
  penaltyAimMarker.rotation.x=Math.PI/2;
  penaltyAimMarker.visible=false;
  scene.add(penaltyAimMarker);

  const ballMat=new THREE.MeshStandardMaterial({color:0xf8fafc,roughness:.3,metalness:.08});
  penaltyBall=new THREE.Mesh(new THREE.SphereGeometry(.34,24,18),ballMat);penaltyBall.position.set(0,.45,39.8);penaltyBall.castShadow=true;penaltyBall.receiveShadow=true;scene.add(penaltyBall);
  const k=buildPenaltyKeeperModel();k.position.set(0,0,29.35);scene.add(k);penaltyKeeper=k;
}
function updatePenaltyKeeper(dt){
  if(!penaltyKeeper)return;
  penaltyKeeperT+=dt;
  // The AI patrols the goal, then reacts to the selected target during the shot.
  const patrol=Math.sin(penaltyKeeperT*2.7)*3.4;
  if(penaltyShot&&penaltyShot.keeperTargetX!==undefined){
    const reaction=Math.min(1,penaltyShot.t*2.2);
    penaltyKeeper.position.x=THREE.MathUtils.lerp(patrol,penaltyShot.keeperTargetX,reaction);
    penaltyKeeper.rotation.z=Math.sin(reaction*Math.PI)*.12*(penaltyShot.keeperTargetX>=0? -1:1);
  }else{
    penaltyKeeper.position.x=patrol;
    penaltyKeeper.rotation.z=0;
  }
}
function updatePenaltyShot(dt){
  if(!penaltyShot||!penaltyBall)return;
  penaltyShot.t=Math.min(1,penaltyShot.t+dt/.72);
  const p=penaltyShot.t;
  const ease=1-Math.pow(1-p,2);
  penaltyBall.position.lerpVectors(penaltyShot.start,penaltyShot.end,ease);
  penaltyBall.position.y+=Math.sin(p*Math.PI)*penaltyShot.arc;
  if(p>=1){
    penaltyShot=null;
    penaltyBall.position.set(0,.45,39.8);
    if(penaltyAimMarker)penaltyAimMarker.visible=false;
  }
}
function updatePenaltyKings(dt){
  penaltyTime+=dt;updatePenaltyKeeper(dt);updatePenaltyShot(dt);
  const b=document.querySelector('#raceBoard');
  if(b){
    b.style.display='block';
    b.innerHTML='<b>PENALTY KINGS</b>'+
      '<div class="race-row"><span>SHOTS</span><span>'+penaltyShots+' / 5</span></div>'+
      '<div class="race-row"><span>GOALS</span><span>'+penaltyGoals+'</span></div>'+
      '<div class="race-row"><span>AIM</span><span>CLICK ANYWHERE ON GOAL</span></div>';
  }
  if(penaltyReady&&!penaltyCompleted&&penaltyShots===5){
    penaltyResultTimer+=dt;
    if(penaltyResultTimer>2){
      const rows=[
        {name:'YOU',score:penaltyGoals},
        {name:'BOLT',score:2},
        {name:'NOVA',score:3},
        {name:'DASH',score:1},
        {name:'ROCKET',score:2},
        {name:'FLASH',score:4}
      ].sort((a,b)=>b.score-a.score);
      tournament.addEventResult(rows);
      penaltyReady=false;
      penaltyCompleted=true;
      gameState.set('PENALTY_RESULTS');
      penaltyResultTimer=0;
      document.querySelector('#eventName').textContent='PENALTY KINGS RESULTS';
      document.querySelector('#venue').innerHTML='<b>FOOTBALL ARENA</b><span>5-shot challenge complete</span>';
    }
  }
}
function shootPenalty(e){
  if(gameState.state!=='PENALTY_KINGS'||!penaltyReady||penaltyCompleted||penaltyShots>=5||penaltyShot)return;
  const r=renderer.domElement.getBoundingClientRect();
  mouse.x=((e.clientX-r.left)/r.width)*2-1;
  mouse.y=-((e.clientY-r.top)/r.height)*2+1;
  targetRay.setFromCamera(mouse,camera);
  const hit=targetRay.intersectObject(penaltyAimPlane,false)[0];
  if(!hit)return;

  // The click becomes the exact 3D point the ball is sent toward.
  const target=hit.point.clone();
  target.x=THREE.MathUtils.clamp(target.x,-5.85,5.85);
  target.y=THREE.MathUtils.clamp(target.y,.15,4.85);
  target.z=30;
  penaltyShots++;

  const keeperX=penaltyKeeper?penaltyKeeper.position.x:0;
  const distanceToKeeper=Math.hypot(target.x-keeperX,target.y-2.2);
  const cornerSafety=Math.min(1,Math.abs(target.x)/5.85);
  const heightSafety=Math.min(1,Math.abs(target.y-2.5)/2.35);
  const saveChance=Math.max(.12,.78-distanceToKeeper*.075-cornerSafety*.22-heightSafety*.18);
  const saved=Math.random()<saveChance;

  if(penaltyAimMarker){
    penaltyAimMarker.position.copy(target);
    penaltyAimMarker.position.z=29.82;
    penaltyAimMarker.visible=true;
  }

  const end=new THREE.Vector3(target.x,target.y,30);
  penaltyShot={
    t:0,
    start:penaltyBall.position.clone(),
    end,
    arc:Math.min(2.4,.5+Math.abs(target.x)*.13),
    keeperTargetX:target.x
  };

  if(!saved){
    penaltyGoals++;
    showToast('GOAL! ⚽ EXACT TARGET HIT!');
  }else{
    showToast('SAVED! 🧤 THE GK READ YOUR AIM!');
  }
}
renderer.domElement.addEventListener('click',shootPenalty);
function startNextTournamentEvent(){if(tournament.complete){gameState.set('HUB');document.querySelector('#eventName').textContent='TOURNAMENT COMPLETE';document.querySelector('#venue').innerHTML='<b>OLYMPIC PODIUM</b><span>Final standings across all completed games</span>';setRaceVisible(true);renderFinalPodiumBoard();return}document.querySelector('#raceBoard').style.display='none';if(tournament.current==='PENALTY KINGS'){startPenaltyKings();return}document.querySelector('#eventName').textContent=tournament.current;document.querySelector('#venue').innerHTML='<b>OLYMPIC PLAZA</b><span>Round '+tournament.round+' / '+tournament.totalRounds+'</span>';skyCountdown=3;gameState.set('SKY_COUNTDOWN')}
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
function updateRaceHUD(){const h=document.querySelector('#raceHud'),b=document.querySelector('#raceBoard');if(gameState.state==='TARGET_MAYHEM'){setRaceVisible(true);renderTargetLeaderboard();return}if(gameState.state==='TARGET_RESULTS'){setRaceVisible(true);renderTargetResultsBoard();document.querySelector('#raceState').textContent='EVENT COMPLETE';document.querySelector('#raceTime').textContent=targetScore+' PTS';document.querySelector('#raceCheckpoint').textContent='POINTS AWARDED';document.querySelector('#raceStats').textContent='TOURNAMENT ROUND '+tournament.index+' / '+tournament.totalRounds;return}if(gameState.state==='PENALTY_RESULTS'){setRaceVisible(true);renderTournamentBoard('GAME 3 RESULTS',Object.values(tournament.standings).sort((a,b)=>b.points-a.points));document.querySelector('#raceState').textContent='EVENT COMPLETE';document.querySelector('#raceTime').textContent=penaltyGoals+' GOALS';document.querySelector('#raceCheckpoint').textContent='POINTS AWARDED';document.querySelector('#raceStats').textContent='TOURNAMENT ROUND '+tournament.index+' / '+tournament.totalRounds;return}if(gameState.state==='HUB'&&tournament.complete){setRaceVisible(true);renderFinalPodiumBoard();return}if(secondGame){return}if(gameState.state==='RACE_RESULTS'){setRaceVisible(true);renderTournamentBoard('TOURNAMENT STANDINGS',Object.values(tournament.standings).sort((a,b)=>b.points-a.points));document.querySelector('#raceState').textContent='EVENT COMPLETE';document.querySelector('#raceTime').textContent=race.time.toFixed(2)+'s';document.querySelector('#raceCheckpoint').textContent='POINTS AWARDED';document.querySelector('#raceStats').textContent='TOURNAMENT ROUND '+tournament.index+' / '+tournament.totalRounds;return}if(!race.active&&!race.finished){h.style.display='block';b.style.display='none';document.querySelector('#raceState').textContent='Starting in '+Math.ceil(skyCountdown)+'s';document.querySelector('#raceTime').textContent='GET READY';document.querySelector('#raceCheckpoint').textContent='SKY COURSE · 8 CHECKPOINTS';document.querySelector('#raceStats').textContent='COINS 0 · BOOST READY';return}setRaceVisible(true);document.querySelector('#raceState').textContent=race.finished?'RESULTS':'RACE LIVE';document.querySelector('#raceTime').textContent=race.finished?race.time.toFixed(2)+'s':race.time.toFixed(2)+'s';document.querySelector('#raceCheckpoint').textContent='CHECKPOINT '+race.checkpoint+' / 8';document.querySelector('#raceStats').textContent='COINS '+(race.coinCount||0)+' · BOOST '+((race.boost||0)>0?race.boost.toFixed(1)+'s':'READY');if(race.finished){const board=skySprintLeaderboard(race);b.innerHTML='<b>LEADERBOARD</b>'+board.slice(0,6).map((x,i)=>'<div class="race-row '+(x.name==='YOU'?'you':'')+'"><span>'+(i+1)+'. '+x.name+'</span><span>'+(x.finished?x.time.toFixed(2)+'s':'--')+'</span></div>').join('')}}
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
          if(tournament.current==='PENALTY KINGS'){startPenaltyKings();}else{startNextTournamentEvent();}
        }
        break;

      case 'PENALTY_KINGS': updatePenaltyKings(dt); break;
      case 'PENALTY_RESULTS': penaltyResultTimer+=dt;if(penaltyResultTimer>resultHoldSeconds){penaltyResultTimer=0;startNextTournamentEvent();}break;

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
      gameState.state==='TARGET_MAYHEM'||gameState.state==='TARGET_RESULTS',
      gameState.state==='PENALTY_KINGS'||gameState.state==='PENALTY_RESULTS'
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