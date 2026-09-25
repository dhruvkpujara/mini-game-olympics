// Stylized 3D human athlete roster.
// Character themes are original interpretations rather than pixel-for-pixel copies of existing copyrighted characters.
const MGO_CHARACTERS={
  mario:{name:'Fire Hero',skin:0xc9825b,jersey:0xe53935,dark:0x8e1b1b,hair:0x3b2115,accent:0xf5c542,shoe:0x6b1d18,type:'cap'},
  duck:{name:'Duck Captain',skin:0xf2d1b3,jersey:0x2563eb,dark:0x153e9c,hair:0x17324d,accent:0xf59e0b,shoe:0x7c2d12,type:'sailor'},
  bheem:{name:'Power Kid',skin:0x8b5438,jersey:0xf59e0b,dark:0x9a3412,hair:0x24160f,accent:0xffd43b,shoe:0x7c2d12,type:'power'},
  raju:{name:'Super Kid',skin:0x9b6045,jersey:0xdc2626,dark:0x7f1d1d,hair:0x171717,accent:0xfacc15,shoe:0x111827,type:'hero'},
  ninja:{name:'Ninja Runner',skin:0xf0b38c,jersey:0x334155,dark:0x172033,hair:0xf4c430,accent:0x60a5fa,shoe:0x111827,type:'ninja'},
  sonic:{name:'Blue Speedster',skin:0xe8b98c,jersey:0x2563eb,dark:0x123a9a,hair:0x1769e0,accent:0xf8fafc,shoe:0xe53935,type:'speed'},
  panda:{name:'Panda Brawler',skin:0xc9825b,jersey:0x111827,dark:0x050505,hair:0x111111,accent:0x22c55e,shoe:0x111111,type:'panda'},
  robot:{name:'Mecha Racer',skin:0x94a3b8,jersey:0x7c3aed,dark:0x312e81,hair:0x334155,accent:0x22d3ee,shoe:0x111827,type:'robot'}
};
const MGO_CHARACTER_IDS=Object.keys(MGO_CHARACTERS);

function createPlayer(scene,characterId='sonic'){
  const c=MGO_CHARACTERS[characterId]||MGO_CHARACTERS.sonic;
  const p=new THREE.Group();
  p.name='HumanAthlete_'+characterId;
  p.userData.characterId=characterId;

  const mat=(color,rough=.55,metal=0)=>new THREE.MeshStandardMaterial({color,roughness:rough,metalness:metal});
  const mats={
    jersey:mat(c.jersey,.42),dark:mat(c.dark,.5),skin:mat(c.skin,.72),
    hair:mat(c.hair,.78),white:mat(0xf8fafc,.3),black:mat(0x111827,.5),
    accent:mat(c.accent,.3,.15),shoe:mat(c.shoe,.28),sole:mat(0x171717,.6),
    mouth:mat(0x681f2a,.5),eye:mat(0xffffff,.22),pupil:mat(0x111827,.35),
    metal:mat(0xb7c3d0,.25,.55)
  };
  const add=(o,g=p)=>{o.castShadow=true;o.receiveShadow=true;g.add(o);return o};
  const sphere=(r,x,y,z,m,sw=20,sh=14,g=p)=>{const o=add(new THREE.Mesh(new THREE.SphereGeometry(r,sw,sh),m),g);o.position.set(x,y,z);return o};
  const capsule=(r,l,x,y,z,m,g=p)=>{const o=add(new THREE.Mesh(new THREE.CapsuleGeometry(r,l,6,14),m),g);o.position.set(x,y,z);return o};
  const box=(w,h,d,x,y,z,m,g=p)=>{const o=add(new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m),g);o.position.set(x,y,z);return o};
  const cyl=(r,h,x,y,z,m,g=p)=>{const o=add(new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,16),m),g);o.position.set(x,y,z);return o};

  // More human proportions: feet → calves → knees → thighs → hips → torso → neck → head.
  const footL=box(.48,.24,.92,-.34,.16,.12,mats.shoe),footR=box(.48,.24,.92,.34,.16,.12,mats.shoe);
  box(.5,.07,.95,-.34,.035,.12,mats.sole);box(.5,.07,.95,.34,.035,.12,mats.sole);
  const calfL=capsule(.18,.48,-.34,.55,0,mats.skin),calfR=capsule(.18,.48,.34,.55,0,mats.skin);
  const thighL=capsule(.23,.62,-.34,1.05,0,mats.skin),thighR=capsule(.23,.62,.34,1.05,0,mats.skin);
  const pelvis=capsule(.36,.48,0,1.45,0,mats.dark);
  const waist=box(1.02,.38,.62,0,1.72,0,mats.dark);
  const torso=capsule(.57,1.05,0,2.48,0,mats.jersey);
  // Shoulder line makes the silhouette read as a human athlete rather than a stack of blocks.
  const shoulder=capsule(.27,.98,0,2.92,0,mats.jersey);shoulder.rotation.z=Math.PI/2;
  capsule(.16,.25,0,3.48,0,mats.skin);

  // Head, ears, eyes, brows, nose and smile.
  const head=sphere(.68,0,4.12,0,mats.skin,24,18);
  const earL=sphere(.14,-.67,4.12,0,mats.skin,14,10),earR=sphere(.14,.67,4.12,0,mats.skin,14,10);
  earL.scale.set(.7,1,1);earR.scale.set(.7,1,1);

  // Hair uses a cap plus individual locks/quills, depending on the athlete.
  const hairCap=sphere(.69,0,4.43,0,mats.hair,24,16);hairCap.scale.y=.55;
  function hairLocks(count,spread=.72){
    for(let i=0;i<count;i++){
      const x=-spread/2+i*(spread/(count-1));
      const lock=capsule(.09,.42,x,4.68,-.03,mats.hair, p);
      lock.rotation.z=(i-(count-1)/2)*.22;
      lock.rotation.x=-.25;
    }
  }
  if(c.type==='speed'){hairLocks(9,.92)}
  else if(c.type==='ninja'){hairLocks(8,.86)}
  else if(c.type==='cap'){box(1.08,.16,.55,0,4.39,.45,mats.jersey);sphere(.24,0,4.75,.0,mats.jersey,16,10)}
  else if(c.type==='sailor'){cyl(.61,.22,0,4.72,0,mats.dark);box(.94,.12,.42,0,4.55,.08,mats.accent)}
  else hairLocks(7,.8);

  for(const x of [-.25,.25]){
    sphere(.145,x,4.23,.61,mats.eye,16,12);
    sphere(.065,x,4.23,.73,mats.pupil,12,10);
    const brow=box(.22,.045,.06,x,4.43,.69,mats.hair);brow.rotation.z=x<0?-0.12:0.12;
  }
  const nose=sphere(.10,0,4.05,.68,mats.skin,12,9);
  const mouth=new THREE.Mesh(new THREE.TorusGeometry(.16,.032,8,18,Math.PI),mats.mouth);
  mouth.position.set(0,3.88,.65);mouth.rotation.x=Math.PI/2;add(mouth);

  // Character identity accents.
  if(c.type==='sailor'){
    box(1.1,.16,.08,0,2.92,.54,mats.white);box(.95,.1,.08,0,2.78,.57,mats.accent);
    const necker=cyl(.18,.12,0,3.2,.48,mats.accent);necker.rotation.x=Math.PI/2;
  }
  if(c.type==='power'){sphere(.13,0,2.98,.59,mats.accent,12,8);box(.72,.1,.06,0,2.75,.58,mats.accent)}
  if(c.type==='hero'){box(1.0,.12,.06,0,2.72,.58,mats.accent);sphere(.13,0,2.92,.6,mats.accent,12,8)}
  if(c.type==='ninja'){box(1.02,.13,.08,0,2.84,.56,mats.accent);box(.62,.08,.05,0,2.98,.58,mats.dark)}
  if(c.type==='speed'){box(.75,.1,.06,0,2.78,.58,mats.white)}
  if(c.type==='panda'){box(1.0,.14,.06,0,2.78,.58,mats.accent);sphere(.12,-.45,4.55,.4,mats.dark,12,8);sphere(.12,.45,4.55,.4,mats.dark,12,8)}
  if(c.type==='robot'){
    // Human-shaped android: plated head/torso, but normal arms and legs.
    head.material=mats.metal;earL.material=mats.metal;earR.material=mats.metal;
    hairCap.material=mats.dark;
    box(.8,.12,.08,0,4.05,.68,mats.accent);
    sphere(.09,-.25,4.24,.75,mats.accent,12,8);sphere(.09,.25,4.24,.75,mats.accent,12,8);
    box(1.05,.18,.08,0,2.78,.59,mats.accent);
  }

  // Human arms: upper arm, elbow/forearm, hand, wristband.
  const armL=capsule(.18,.58,-.78,2.55,0,mats.jersey),armR=capsule(.18,.58,.78,2.55,0,mats.jersey);
  armL.rotation.z=-.14;armR.rotation.z=.14;
  const foreL=capsule(.13,.52,-.88,2.0,0,mats.skin),foreR=capsule(.13,.52,.88,2.0,0,mats.skin);
  const handL=sphere(.16,-.9,1.67,0,mats.skin,14,10),handR=sphere(.16,.9,1.67,0,mats.skin,14,10);
  box(.28,.11,.28,-.88,2.24,0,mats.accent);box(.28,.11,.28,.88,2.24,0,mats.accent);

  // Jersey collar + number panel.
  const collar=new THREE.Mesh(new THREE.TorusGeometry(.31,.055,8,24),mats.accent);
  collar.position.set(0,3.03,0);collar.rotation.x=Math.PI/2;add(collar);
  box(.34,.44,.035,0,2.5,.59,mats.white);

  // Legs move independently for a convincing run cycle.
  p.userData={
    vy:0,ground:true,slide:0,cool:0,
    l:thighL,r:thighR,calfL,calfR,torso,pelvis,
    runTime:0,leftArm:armL,rightArm:armR,
    foreL,foreR,footL,footR,characterId
  };
  scene.add(p);
  return p;
}

function replacePlayerCharacter(scene,oldPlayer,characterId){
  const pos=oldPlayer.position.clone(),rot=oldPlayer.rotation.clone(),scale=oldPlayer.scale.clone(),visible=oldPlayer.visible;
  scene.remove(oldPlayer);
  const next=createPlayer(scene,characterId);
  next.position.copy(pos);next.rotation.copy(rot);next.scale.copy(scale);next.visible=visible;
  return next;
}

function updatePlayer(player,keys,dt,yaw,toast){
  const u=player.userData;
  u.cool=Math.max(0,(u.cool||0)-dt);
  u.runTime=(u.runTime||0)+dt;
  const forward=new THREE.Vector3(Math.sin(yaw),0,Math.cos(yaw));
  const right=new THREE.Vector3(Math.cos(yaw),0,-Math.sin(yaw));
  const move=new THREE.Vector3();
  if(keys.KeyW)move.add(forward);if(keys.KeyS)move.sub(forward);
  if(keys.KeyD)move.add(right);if(keys.KeyA)move.sub(right);
  const moving=move.lengthSq()>0;
  if(moving){
    move.normalize();
    const speed=(keys.ShiftLeft||keys.ShiftRight)?11:6;
    player.position.addScaledVector(move,speed*dt);
    player.rotation.y=Math.atan2(move.x,move.z);
  }
  if(keys.Space&&u.ground){u.vy=8.5;u.ground=false}
  u.vy-=22*dt;player.position.y+=u.vy*dt;
  if(player.position.y<=.1){player.position.y=.1;u.vy=0;u.ground=true}
  player.position.x=THREE.MathUtils.clamp(player.position.x,-105,105);
  player.position.z=THREE.MathUtils.clamp(player.position.z,-105,105);

  const stride=moving?Math.sin(u.runTime*12)*.48:0;
  if(u.l)u.l.rotation.x=stride;
  if(u.r)u.r.rotation.x=-stride;
  if(u.calfL)u.calfL.rotation.x=-stride*.55;
  if(u.calfR)u.calfR.rotation.x=stride*.55;
  if(u.leftArm)u.leftArm.rotation.x=-stride*.72;
  if(u.rightArm)u.rightArm.rotation.x=stride*.72;
  if(u.foreL)u.foreL.rotation.x=-stride*.55;
  if(u.foreR)u.foreR.rotation.x=stride*.55;

  if(keys.KeyC&&!u.slide){u.slide=.45;toast('SLIDE!')}
  if(u.slide>0){u.slide-=dt;player.scale.y=THREE.MathUtils.lerp(player.scale.y,.72,.22)}
  else player.scale.y=THREE.MathUtils.lerp(player.scale.y,1,.18);
}
