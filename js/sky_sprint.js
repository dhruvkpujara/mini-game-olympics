function createSkySprint(scene){
  const root=new THREE.Group();root.name='SkySprint';
  const mat={boost:new THREE.MeshStandardMaterial({color:0x38d9ff,emissive:0x0b6b88,emissiveIntensity:1.2}),coin:new THREE.MeshStandardMaterial({color:0xffd43b,emissive:0x8a6500,emissiveIntensity:.7}),platform:new THREE.MeshStandardMaterial({color:0x4b7bec}),edge:new THREE.MeshStandardMaterial({color:0xf5c542}),white:new THREE.MeshStandardMaterial({color:0xffffff}),gold:new THREE.MeshStandardMaterial({color:0xf5c542}),red:new THREE.MeshStandardMaterial({color:0xe74c3c}),dark:new THREE.MeshStandardMaterial({color:0x182432}),green:new THREE.MeshStandardMaterial({color:0x43c46b})};
  function box(w,h,d,x,y,z,m){const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;root.add(o);return o}
  // Floating race path above the stadium: start -> finish along +Z.
  const segments=[-110,-94,-78,-62,-46,-30,-14,2,18];
  segments.forEach((z,i)=>{
    const x=Math.sin(i*1.7)*7;
    box(18,1.2,12,x,9,z,mat.platform);
    box(18.4,.18,.35,x,9.65,z-5.7,mat.edge);
  });
  // gaps / moving obstacle bars
  for(let i=1;i<segments.length-1;i++){
    const z=segments[i],x=Math.sin(i*1.7)*7;
    const bar=box(13,.7,.7,x,10.4,z, i%2?mat.red:mat.edge);
    bar.userData={obstacle:true,baseX:x,phase:i*1.4};
  }
  // interactive boost pads and collectible coins
  const boosts=[],coins=[];
  [1,2,4,5,7].forEach((i,j)=>{const z=segments[i],x=Math.sin(i*1.7)*7;const pad=box(7,.18,3,x,9.7,z,mat.boost);pad.userData={boost:true,cool:0};boosts.push(pad);const coin=new THREE.Mesh(new THREE.TorusGeometry(.65,.2,8,18),mat.coin);coin.position.set(x+(j%2?2.2:-2.2),11,z);coin.rotation.x=Math.PI/2;root.add(coin);coin.userData={coin:true,baseY:11,phase:j};coins.push(coin)});
  // floating rings/checkpoints
  [0,3,6].forEach(i=>{
    const z=segments[i+1],x=Math.sin((i+1)*1.7)*7;
    const ring=new THREE.Mesh(new THREE.TorusGeometry(5.2,.25,8,32),mat.white);
    ring.position.set(x,12,z);root.add(ring);
  });
  // finish gate
  const fz=18,fx=Math.sin(8*1.7)*7;
  box(.8,7,.8,fx-7,12.5,fz,mat.white);box(.8,7,.8,fx+7,12.5,fz,mat.white);box(15,1,1,fx,15.8,fz,mat.gold);
  box(15,.25,.8,fx,12,fz,mat.red);
  // Rival athletes use the exact same character model as the player.
  const rivals=[];
  const rivalColors=[0xe74c3c,0x16a085,0x8e44ad,0xf39c12,0x34495e];
  for(let i=0;i<5;i++){
    const rival=createPlayer(scene);
    rival.userData.rival=true;
    rival.visible=false;
    rival.traverse(o=>{if(o.isMesh&&o.material&&o.material.color&&o.material.color.getHex()===0x2458d6)o.material=o.material.clone(),o.material.color.setHex(rivalColors[i]);});
    rivals.push(rival);
  }
  scene.add(root);
  return {root,segments,finishZ:fz,finishX:fx,obstacles:root.children.filter(o=>o.userData.obstacle===true),boosts,coins,rivals};
}

function startSkySprint(player,race){
  race.active=true;race.finished=false;race.time=0;race.coinCount=0;race.boost=0;race.hitCount=0;race.startTime=performance.now();race.checkpoint=0;race.message='GO!';race.hitCooldown=0;race.playerFinished=false;race.rivalFinishTimes=[null,null,null,null,null];
  player.position.set(0,9.8,-110);
  race.rivals.forEach((r,i)=>{r.visible=true;r.position.set((i-2)*3,9.8,-110-Math.min(i,2)*1.5);r.userData.vy=0;r.userData.raceSpeed=7.4+i*.28;r.userData.racePhase=i*.9;r.userData.finished=false;});player.rotation.set(0,0,0);player.visible=true;
}

function updateSkySprint(player,keys,dt,yaw,race,toast){
  if(!race.active)return;
  race.time=(performance.now()-race.startTime)/1000;
  const u=player.userData;
  const f=new THREE.Vector3(Math.sin(yaw),0,Math.cos(yaw));
  const r=new THREE.Vector3(Math.cos(yaw),0,-Math.sin(yaw));
  const d=new THREE.Vector3();
  if(keys.KeyW)d.add(f);if(keys.KeyS)d.sub(f);if(keys.KeyA)d.add(r);if(keys.KeyD)d.sub(r);
  if(d.lengthSq()){d.normalize();let speed=(keys.ShiftLeft||keys.ShiftRight?15:8);if(race.boost>0){speed+=7;race.boost=Math.max(0,race.boost-dt)}player.position.addScaledVector(d,speed*dt);player.rotation.y=Math.atan2(d.x,d.z)}
  if(keys.Space&&u.ground){u.vy=9;u.ground=false}
  u.vy-=24*dt;player.position.y+=u.vy*dt;
  // Find nearest platform height under the player.
  let platformY=-999;
  for(const z of race.segments){
    const px=Math.sin(race.segments.indexOf(z)*1.7)*7;
    if(Math.abs(player.position.x-px)<9 && Math.abs(player.position.z-z)<6)platformY=9.6;
  }
  if(platformY>-999 && player.position.y<=platformY){player.position.y=platformY;u.vy=0;u.ground=true}
  if(player.position.y<-3){
    const idx=Math.max(0,race.checkpoint);
    const z=race.segments[idx];
    player.position.set(Math.sin(idx*1.7)*7,10,z);
    u.vy=0;u.ground=true;
    toast('Fell! Back to checkpoint '+idx);
  }
  if(race.checkpoint<race.segments.length-1 && player.position.z>race.segments[race.checkpoint+1]+3){race.checkpoint++;toast('CHECKPOINT '+race.checkpoint)}
  // Interactive boost pads and collectibles
  for(const pad of race.boosts){if(pad.userData.cool>0)pad.userData.cool-=dt;if(pad.userData.cool<=0&&Math.abs(player.position.x-pad.position.x)<4&&Math.abs(player.position.z-pad.position.z)<2&&Math.abs(player.position.y-pad.position.y)<2){pad.userData.cool=1.2;race.boost=2.2;toast('BOOST PAD! +SPEED')}}
  for(const c of race.coins){if(!c.visible)continue;c.rotation.z+=dt*4;c.position.y=c.userData.baseY+Math.sin(performance.now()/250+c.userData.phase)*.35;if(player.position.distanceTo(c.position)<1.6){c.visible=false;race.coinCount++;toast('COIN +1')}}
  // Solid obstacle collision: push the player away and apply a short slowdown.
  race.hitCooldown=Math.max(0,(race.hitCooldown||0)-dt);
  for(const o of race.obstacles){
    const dx=player.position.x-o.position.x;
    const dz=player.position.z-o.position.z;
    const hitX=Math.abs(dx)<7.0;
    const hitZ=Math.abs(dz)<1.2;
    const hitY=Math.abs(player.position.y-o.position.y)<2.0;
    if(hitX&&hitZ&&hitY){
      const push=dx>=0?1:-1;
      player.position.x=o.position.x+push*7.2;
      player.userData.vy=Math.max(player.userData.vy,2.5);
      if(race.hitCooldown<=0){race.time+=0.8;race.hitCooldown=.5;race.hitCount++;toast('OBSTACLE HIT! +0.8s');}
    }
  }
  if(player.position.z>race.finishZ-3 && !race.playerFinished){
    race.playerFinished=true;
    race.playerFinishTime=race.time;
    race.active=false;
    toast('FINISH! '+race.time.toFixed(2)+'s');
    player.position.z=race.finishZ-2;
  }
  for(const o of race.obstacles){o.position.x=o.userData.baseX+Math.sin(performance.now()/600+o.userData.phase)*3}
  race.rivals.forEach((r,i)=>{
    if(!r.visible)return;
    r.position.z += r.userData.raceSpeed*dt;
    r.position.x += Math.sin(elapsed*1.8+r.userData.racePhase)*dt*1.5;
    r.position.y=9.8;
    r.rotation.y=Math.PI;
    if(r.position.z>race.finishZ && !r.userData.finished){
      r.position.z=race.finishZ;
      r.userData.finished=true;
      race.rivalFinishTimes[i]=(performance.now()-race.startTime)/1000;
    }
  });
}

function skySprintLeaderboard(race){
  const rows=[{name:'YOU',time:race.playerFinishTime??Infinity,finished:race.playerFinished}];
  const names=['Bolt','Nova','Dash','Rocket','Flash'];
  race.rivalFinishTimes.forEach((t,i)=>rows.push({name:names[i],time:t??Infinity,finished:t!==null}));
  return rows.sort((a,b)=>a.time-b.time);
}
