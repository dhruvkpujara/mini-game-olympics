function createPlayer(scene){
  const p=new THREE.Group();
  p.name='CartoonAthlete';

  const mats={
    jersey:new THREE.MeshStandardMaterial({color:0x2458d6,roughness:.52,metalness:.02}),
    jerseyDark:new THREE.MeshStandardMaterial({color:0x173c9c,roughness:.55}),
    skin:new THREE.MeshStandardMaterial({color:0xb97852,roughness:.78}),
    skinDark:new THREE.MeshStandardMaterial({color:0x8f5438,roughness:.8}),
    hair:new THREE.MeshStandardMaterial({color:0x24160f,roughness:.9}),
    white:new THREE.MeshStandardMaterial({color:0xf8fafc,roughness:.42}),
    black:new THREE.MeshStandardMaterial({color:0x101827,roughness:.62}),
    gold:new THREE.MeshStandardMaterial({color:0xf5c542,metalness:.35,roughness:.3}),
    shoe:new THREE.MeshStandardMaterial({color:0xf4f7ff,roughness:.3,metalness:.08}),
    sole:new THREE.MeshStandardMaterial({color:0x172033,roughness:.55}),
    eye:new THREE.MeshStandardMaterial({color:0x101010,roughness:.2}),
    mouth:new THREE.MeshStandardMaterial({color:0x5b2020,roughness:.55})
  };

  const add=(o,g=p)=>{
    o.castShadow=true;o.receiveShadow=true;g.add(o);return o;
  };
  const sphere=(r,x,y,z,m,sw=18,sh=12,g=p)=>{
    const o=add(new THREE.Mesh(new THREE.SphereGeometry(r,sw,sh,m)),g);
    o.position.set(x,y,z);return o;
  };
  const capsule=(radius,length,x,y,z,m,g=p)=>{
    const o=add(new THREE.Mesh(new THREE.CapsuleGeometry(radius,length,6,12),g));
    o.position.set(x,y,z);return o;
  };
  const box=(w,h,d,x,y,z,m,g=p)=>{
    const o=add(new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m),g);
    o.position.set(x,y,z);return o;
  };

  // Shoes: chunky cartoon football/running silhouette.
  const footL=box(.62,.28,1.15,-.43,.12,.24,mats.shoe);
  const footR=box(.62,.28,1.15,.43,.12,.24,mats.shoe);
  box(.66,.09,1.18,-.43,.0,.24,mats.sole);
  box(.66,.09,1.18,.43,.0,.24,mats.sole);
  sphere(.22,-.43,.2,.7,mats.white,16,10);
  sphere(.22,.43,.2,.7,mats.white,16,10);

  // Lower body and shorts.
  capsule(.32,.7,0,1.0,0,mats.jerseyDark);
  box(1.42,.62,.82,0,1.38,0,mats.black);
  box(.46,.58,.86,-.39,1.38,.02,mats.jersey);
  box(.46,.58,.86,.39,1.38,.02,mats.jersey);

  // Torso with rounded chest.
  capsule(.62,1.0,0,2.55,0,mats.jersey);
  box(1.15,.16,.75,0,2.45,.56,mats.white);
  box(1.15,.16,.75,0,2.45,-.56,mats.gold);

  // Neck and head.
  capsule(.2,.25,0,3.45,0,mats.skin);
  sphere(.78,0,4.15,0,mats.skin,24,18);

  // Ears.
  sphere(.16,-.76,4.18,0,mats.skin,14,10);
  sphere(.16,.76,4.18,0,mats.skin,14,10);
  sphere(.105,-.77,4.18,.04,mats.skinDark,12,8);
  sphere(.105,.77,4.18,.04,mats.skinDark,12,8);

  // Cartoon hair cap / hairstyle.
  const hair=sphere(.76,0,4.48,-.02,mats.hair,24,16);
  hair.scale.set(1.01,.55,1.0);
  for(let i=0;i<5;i++)sphere(.2,-.48+i*.24,4.67,.03,mats.hair,14,10);

  // Face: large friendly eyes, brows, nose and smile.
  for(const x of [-.27,.27]){
    sphere(.13,x,4.25,.70,mats.white,16,12);
    sphere(.062,x,4.25,.815,mats.eye,12,10);
    sphere(.025,x-.02,4.28,.87,mats.white,8,6);
    box(.20,.055,.04,x,4.46,.71,mats.hair);
  }
  sphere(.075,0,4.05,.73,mats.skinDark,12,8);
  const smile=new THREE.Mesh(new THREE.TorusGeometry(.17,.035,8,16,Math.PI),mats.mouth);
  smile.position.set(0,3.91,.71);smile.rotation.x=Math.PI/2;add(smile);
  // Small cheek highlights.
  sphere(.09,-.48,4.0,.69,new THREE.MeshStandardMaterial({color:0xe99b86,roughness:.8}),12,8);
  sphere(.09,.48,4.0,.69,new THREE.MeshStandardMaterial({color:0xe99b86,roughness:.8}),12,8);

  // Arms with rounded sleeves, forearms and hands.
  const armL=capsule(.19,.72,-.83,2.48,0,mats.jersey);
  const armR=capsule(.19,.72,.83,2.48,0,mats.jersey);
  armL.rotation.z=-.12;armR.rotation.z=.12;
  capsule(.14,.62,-.9,1.72,0,mats.skin);
  capsule(.14,.62,.9,1.72,0,mats.skin);
  sphere(.18,-.92,1.35,0,mats.skin,14,10);
  sphere(.18,.92,1.35,0,mats.skin,14,10);
  // Wrist bands.
  box(.32,.13,.34,-.9,1.62,0,mats.white);
  box(.32,.13,.34,.9,1.62,0,mats.white);

  // Jersey collar, number panel and shoulder accents.
  const collar=new THREE.Mesh(new THREE.TorusGeometry(.34,.065,8,24),mats.gold);
  collar.position.set(0,3.03,0);collar.rotation.x=Math.PI/2;add(collar);
  box(.38,.48,.04,0,2.52,.68,mats.white);
  box(.14,.58,.04,-.58,2.55,.66,mats.gold);
  box(.14,.58,.04,.58,2.55,.66,mats.gold);

  // Tiny shoulder badges.
  sphere(.12,-.67,2.8,.25,mats.gold,12,8);
  sphere(.12,.67,2.8,.25,mats.gold,12,8);

  // Animator-friendly body references.
  const leftLeg=capsule(.2,.7,-.4,.72,0,mats.skin);
  const rightLeg=capsule(.2,.7,.4,.72,0,mats.skin);
  p.userData={
    vy:0,ground:true,slide:0,cool:0,
    l:leftLeg,r:rightLeg,runTime:0,
    leftArm:armL,rightArm:armR,
    head:p.children.find(o=>o.position?.y===4.15),
    shoeL:footL,shoeR:footR
  };
  scene.add(p);
  return p;
}

function updatePlayer(player,keys,dt,yaw,toast){
  const u=player.userData;
  u.cool=Math.max(0,(u.cool||0)-dt);
  u.runTime=(u.runTime||0)+dt;

  const forward=new THREE.Vector3(Math.sin(yaw),0,Math.cos(yaw));
  const right=new THREE.Vector3(Math.cos(yaw),0,-Math.sin(yaw));
  const move=new THREE.Vector3();
  if(keys.KeyW)move.add(forward);
  if(keys.KeyS)move.sub(forward);
  if(keys.KeyD)move.add(right);
  if(keys.KeyA)move.sub(right);

  const moving=move.lengthSq()>0;
  if(moving){
    move.normalize();
    const speed=(keys.ShiftLeft||keys.ShiftRight)?11:6;
    player.position.addScaledVector(move,speed*dt);
    player.rotation.y=Math.atan2(move.x,move.z);
  }

  if(keys.Space&&u.ground){
    u.vy=8.5;
    u.ground=false;
  }
  u.vy-=22*dt;
  player.position.y+=u.vy*dt;
  if(player.position.y<=.1){
    player.position.y=.1;
    u.vy=0;
    u.ground=true;
  }

  // Keep the hub athlete inside the playable village.
  player.position.x=THREE.MathUtils.clamp(player.position.x,-105,105);
  player.position.z=THREE.MathUtils.clamp(player.position.z,-105,105);

  // Simple squash-and-swing animation that works with the upgraded cartoon rig.
  const stride=moving?Math.sin(u.runTime*12)*.48:0;
  if(u.l)u.l.rotation.x=stride;
  if(u.r)u.r.rotation.x=-stride;
  if(u.leftArm)u.leftArm.rotation.x=-stride*.72;
  if(u.rightArm)u.rightArm.rotation.x=stride*.72;
  if(u.head)u.head.rotation.z=moving?Math.sin(u.runTime*6)*.025:0;

  if(keys.KeyC&&!u.slide){
    u.slide=0.45;
    toast('SLIDE!');
  }
  if(u.slide>0){
    u.slide-=dt;
    player.scale.y=THREE.MathUtils.lerp(player.scale.y,.72,.22);
  }else{
    player.scale.y=THREE.MathUtils.lerp(player.scale.y,1,.18);
  }
}