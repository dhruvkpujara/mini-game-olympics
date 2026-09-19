function createSkySprint(scene){
  const root=new THREE.Group();root.name='SkySprint';
  const mat={platform:new THREE.MeshStandardMaterial({color:0x4b7bec}),edge:new THREE.MeshStandardMaterial({color:0xf5c542}),white:new THREE.MeshStandardMaterial({color:0xffffff}),gold:new THREE.MeshStandardMaterial({color:0xf5c542}),red:new THREE.MeshStandardMaterial({color:0xe74c3c}),dark:new THREE.MeshStandardMaterial({color:0x182432}),green:new THREE.MeshStandardMaterial({color:0x43c46b})};
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
    bar.userData={baseX:x,phase:i*1.4};
  }
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
  scene.add(root);
  return {root,segments,finishZ:fz,finishX:fx,obstacles:root.children.filter(o=>o.userData.phase!==undefined)};
}

function startSkySprint(player,race){
  race.active=true;race.finished=false;race.time=0;race.startTime=performance.now();race.checkpoint=0;race.message='GO!';
  player.position.set(0,9.8,-110);player.rotation.set(0,0,0);player.visible=true;
}

function updateSkySprint(player,keys,dt,yaw,race,toast){
  if(!race.active)return;
  race.time=(performance.now()-race.startTime)/1000;
  const u=player.userData;
  const f=new THREE.Vector3(Math.sin(yaw),0,Math.cos(yaw));
  const r=new THREE.Vector3(Math.cos(yaw),0,-Math.sin(yaw));
  const d=new THREE.Vector3();
  if(keys.KeyW)d.add(f);if(keys.KeyS)d.sub(f);if(keys.KeyD)d.add(r);if(keys.KeyA)d.sub(r);
  if(d.lengthSq()){d.normalize();player.position.addScaledVector(d,(keys.ShiftLeft||keys.ShiftRight?15:8)*dt);player.rotation.y=Math.atan2(d.x,d.z)}
  if(keys.Space&&u.ground){u.vy=9;u.ground=false}
  u.vy-=24*dt;player.position.y+=u.vy*dt;
  // Find nearest platform height under the player.
  let platformY=-999;
  for(const z of race.segments){
    const px=Math.sin(race.segments.indexOf(z)*1.7)*7;
    if(Math.abs(player.position.x-px)<9 && Math.abs(player.position.z-z)<6)platformY=9.6;
  }
  if(platformY>-999 && player.position.y<=platformY){player.position.y=platformY;u.vy=0;u.ground=true}
  if(player.position.y<-3){toast('Fell! Respawning at checkpoint');const idx=Math.max(0,race.checkpoint);const z=race.segments[idx];player.position.set(Math.sin(idx*1.7)*7,10,z);u.vy=0;u.ground=true}
  if(race.checkpoint<race.segments.length-1 && player.position.z>race.segments[race.checkpoint+1]-5){race.checkpoint++;toast('CHECKPOINT '+race.checkpoint)}
  if(player.position.z>race.finishZ-3){race.finished=true;race.active=false;toast('FINISH! '+race.time.toFixed(2)+'s');player.position.z=race.finishZ-2}
  for(const o of race.obstacles){o.position.x=o.userData.baseX+Math.sin(performance.now()/600+o.userData.phase)*3}
}

function skySprintLeaderboard(time){
  const base=[Math.max(8.8,time+1.1),Math.max(9.4,time+1.8),Math.max(10.1,time+2.4),Math.max(10.8,time+3.2),Math.max(11.5,time+4.1)];
  return [{name:'YOU',time:time}].concat(base.map((t,i)=>({name:['Bolt','Nova','Dash','Rocket','Flash'][i],time:t}))).sort((a,b)=>a.time-b.time);
}