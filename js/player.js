// High-detail stylized 3D human athlete roster.
// Built as original characters with a polished animated-movie/cartoon-human look.
const MGO_CHARACTERS={
  mario:{name:'Fire Hero',skin:0xc9825b,jersey:0xe53935,dark:0x8e1b1b,hair:0x3b2115,accent:0xf5c542,shoe:0x6b1d18,type:'cap'},
  duck:{name:'Blue Captain',skin:0xf2c7a5,jersey:0x2563eb,dark:0x153e9c,hair:0x17324d,accent:0xf59e0b,shoe:0x7c2d12,type:'sailor'},
  bheem:{name:'Power Kid',skin:0x8b5438,jersey:0xf59e0b,dark:0x6b2b18,hair:0x24160f,accent:0xffd43b,shoe:0x7c2d12,type:'power'},
  raju:{name:'Super Kid',skin:0x9b6045,jersey:0xdc2626,dark:0x7f1d1d,hair:0x171717,accent:0xfacc15,shoe:0x111827,type:'hero'},
  ninja:{name:'Ninja Runner',skin:0xf0b38c,jersey:0x334155,dark:0x172033,hair:0x24160f,accent:0x60a5fa,shoe:0x111827,type:'ninja'},
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
    jacket:mat(c.jersey,.36),shirt:mat(c.dark,.52),pants:mat(0x263241,.62),
    skin:mat(c.skin,.68),hair:mat(c.hair,.78),white:mat(0xf8fafc,.25),
    black:mat(0x11151d,.48),accent:mat(c.accent,.28,.1),shoe:mat(c.shoe,.25),
    sole:mat(0x171717,.62),mouth:mat(0x7a2530,.48),eye:mat(0xffffff,.18),
    pupil:mat(0x17120f,.25),metal:mat(0xb7c3d0,.2,.6)
  };
  const add=(o,g=p)=>{o.castShadow=true;o.receiveShadow=true;g.add(o);return o};
  const sphere=(r,x,y,z,m,sw=24,sh=18,g=p)=>{const o=add(new THREE.Mesh(new THREE.SphereGeometry(r,sw,sh),m),g);o.position.set(x,y,z);return o};
  const capsule=(r,l,x,y,z,m,g=p)=>{const o=add(new THREE.Mesh(new THREE.CapsuleGeometry(r,l,8,16),m),g);o.position.set(x,y,z);return o};
  const box=(w,h,d,x,y,z,m,g=p)=>{const o=add(new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m),g);o.position.set(x,y,z);return o};
  const cyl=(r,h,x,y,z,m,g=p)=>{const o=add(new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,20),m),g);o.position.set(x,y,z);return o};

  // Animated-movie proportions: oversized expressive head, narrow waist, rounded shoulders.
  const footL=box(.56,.25,1.02,-.35,.14,.10,mats.shoe),footR=box(.56,.25,1.02,.35,.14,.10,mats.shoe);
  box(.58,.07,1.04,-.35,.025,.10,mats.sole);box(.58,.07,1.04,.35,.025,.10,mats.sole);
  const shinL=capsule(.18,.46,-.35,.56,0,mats.pants),shinR=capsule(.18,.46,.35,.56,0,mats.pants);
  const thighL=capsule(.22,.58,-.35,1.05,0,mats.pants),thighR=capsule(.22,.58,.35,1.05,0,mats.pants);
  const pelvis=capsule(.36,.45,0,1.48,0,mats.pants);
  const waist=capsule(.40,.30,0,1.75,0,mats.shirt);
  const torso=capsule(.58,1.02,0,2.43,0,mats.jacket);
  const chest=box(1.02,.55,.66,0,2.53,.02,mats.jacket);
  const shoulder=capsule(.27,1.02,0,2.91,0,mats.jacket);shoulder.rotation.z=Math.PI/2;
  capsule(.16,.25,0,3.45,0,mats.skin);

  // Hoodie/jacket details inspired by the supplied reference.
  const hoodOuter=new THREE.Mesh(new THREE.TorusGeometry(.47,.12,10,24,Math.PI*1.25),mats.jacket);
  hoodOuter.position.set(0,3.13,-.03);hoodOuter.rotation.x=Math.PI/2;add(hoodOuter);
  box(.07,.78,.05,-.04,2.62,.62,mats.accent);
  box(.07,.78,.05,.04,2.62,.62,mats.accent);
  box(.34,.54,.04,0,2.48,.65,mats.shirt);
  for(const x of [-.29,.29]){
    const cord=capsule(.025,.40,x,2.91,.63,mats.white);cord.rotation.z=x<0?.05:-.05;
    sphere(.055,x,2.69,.63,mats.accent,12,10);
  }

  // Large friendly human head.
  const head=sphere(.76,0,4.15,0,mats.skin,28,20);
  const earL=sphere(.15,-.75,4.14,0,mats.skin,16,12),earR=sphere(.15,.75,4.14,0,mats.skin,16,12);
  earL.scale.set(.72,1,1);earR.scale.set(.72,1,1);

  // Hair cap + layered locks. Each character gets a different silhouette.
  const hairCap=sphere(.74,0,4.49,-.02,mats.hair,28,18);hairCap.scale.y=.58;
  const locks=[];
  function addLocks(count,spread=.95){
    for(let i=0;i<count;i++){
      const t=count===1?.5:i/(count-1),x=(t-.5)*spread;
      const lock=capsule(.095,.46,x,4.70,-.01,mats.hair);
      lock.rotation.z=(t-.5)*.42;lock.rotation.x=-.24;
      locks.push(lock);
    }
  }
  if(c.type==='speed')addLocks(11,1.05);
  else if(c.type==='ninja')addLocks(9,.95);
  else if(c.type==='cap'){
    box(1.12,.16,.54,0,4.46,.42,mats.jacket);
    sphere(.25,0,4.80,.02,mats.jacket,16,12);
  }else if(c.type==='sailor'){
    cyl(.62,.20,0,4.77,0,mats.dark);
    box(1.0,.12,.45,0,4.60,.05,mats.accent);
    addLocks(7,.78);
  }else addLocks(8,.9);

  // Eyes: big glossy pupils + highlights, brows, cheeks and nose.
  for(const x of [-.27,.27]){
    sphere(.19,x,4.22,.66,mats.eye,18,14);
    sphere(.082,x,4.22,.81,mats.pupil,14,12);
    sphere(.028,x-.025,4.25,.88,mats.white,10,8);
    const brow=box(.25,.055,.07,x,4.48,.69,mats.hair);brow.rotation.z=x<0?-0.1:0.1;
    sphere(.10,x,3.99,.64,mat(0xf08a86,.8),14,10);
  }
  sphere(.105,0,4.04,.74,mats.skin,14,10);
  const mouth=new THREE.Mesh(new THREE.TorusGeometry(.18,.035,8,20,Math.PI),mats.mouth);
  mouth.position.set(0,3.88,.72);mouth.rotation.x=Math.PI/2;add(mouth);

  // Individual character face/costume identity.
  if(c.type==='panda'){
    // Keep a human silhouette while adding panda facial markings.
    for(const x of [-.38,.38]){const patch=sphere(.20,x,4.22,.70,mats.black,16,12);patch.scale.set(.85,1.25,.3)}
    box(1.0,.14,.06,0,2.77,.65,mats.accent);
  }
  if(c.type==='robot'){
    head.material=mats.metal;earL.material=mats.metal;earR.material=mats.metal;
    hairCap.material=mats.dark;
    box(.75,.11,.06,0,4.08,.77,mats.accent);
    sphere(.09,-.27,4.22,.83,mats.accent,12,10);sphere(.09,.27,4.22,.83,mats.accent,12,10);
    box(1.0,.16,.07,0,2.78,.66,mats.accent);
  }
  if(c.type==='sailor'){
    box(1.0,.12,.06,0,2.92,.62,mats.white);
    box(.82,.09,.05,0,2.78,.64,mats.accent);
  }
  if(c.type==='power'){sphere(.13,0,2.98,.64,mats.accent,12,10)}
  if(c.type==='hero'){box(1.0,.11,.05,0,2.78,.65,mats.accent);sphere(.12,0,2.95,.67,mats.accent,12,10)}
  if(c.type==='ninja'){box(1.02,.12,.06,0,2.84,.63,mats.accent);box(.58,.08,.05,0,2.98,.64,mats.dark)}
  if(c.type==='speed'){box(.74,.09,.05,0,2.79,.65,mats.white)}

  // Rounded human arms with jacket sleeves, forearms and hands.
  const armL=capsule(.19,.62,-.80,2.54,0,mats.jacket),armR=capsule(.19,.62,.80,2.54,0,mats.jacket);
  armL.rotation.z=-.13;armR.rotation.z=.13;
  const foreL=capsule(.135,.50,-.88,2.00,0,mats.skin),foreR=capsule(.135,.50,.88,2.00,0,mats.skin);
  const handL=sphere(.17,-.91,1.68,0,mats.skin,16,12),handR=sphere(.17,.91,1.68,0,mats.skin,16,12);
  box(.30,.10,.28,-.88,2.24,0,mats.accent);box(.30,.10,.28,.88,2.24,0,mats.accent);

  // Small fingers/knuckles make the hands read more clearly at close camera distance.
  for(const side of [-1,1]) for(let i=0;i<3;i++) sphere(.035,side*(.87+i*.045),1.60+i*.025,.10,mats.skin,8,6);

  const collar=new THREE.Mesh(new THREE.TorusGeometry(.31,.055,8,24),mats.accent);
  collar.position.set(0,3.03,0);collar.rotation.x=Math.PI/2;add(collar);
  box(.34,.44,.035,0,2.49,.66,mats.white);

  p.userData={
    vy:0,ground:true,slide:0,cool:0,l:thighL,r:thighR,calfL:shinL,calfR:shinR,
    torso,pelvis,runTime:0,leftArm:armL,rightArm:armR,foreL,foreR,footL,footR,characterId
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
  if(moving){move.normalize();const speed=(keys.ShiftLeft||keys.ShiftRight)?11:6;player.position.addScaledVector(move,speed*dt);player.rotation.y=Math.atan2(move.x,move.z)}
  if(keys.Space&&u.ground){u.vy=8.5;u.ground=false}
  u.vy-=22*dt;player.position.y+=u.vy*dt;
  if(player.position.y<=.1){player.position.y=.1;u.vy=0;u.ground=true}
  player.position.x=THREE.MathUtils.clamp(player.position.x,-105,105);
  player.position.z=THREE.MathUtils.clamp(player.position.z,-105,105);
  const stride=moving?Math.sin(u.runTime*12)*.48:0;
  if(u.l)u.l.rotation.x=stride;if(u.r)u.r.rotation.x=-stride;
  if(u.calfL)u.calfL.rotation.x=-stride*.55;if(u.calfR)u.calfR.rotation.x=stride*.55;
  if(u.leftArm)u.leftArm.rotation.x=-stride*.72;if(u.rightArm)u.rightArm.rotation.x=stride*.72;
  if(u.foreL)u.foreL.rotation.x=-stride*.55;if(u.foreR)u.foreR.rotation.x=stride*.55;
  if(keys.KeyC&&!u.slide){u.slide=.45;toast('SLIDE!')}
  if(u.slide>0){u.slide-=dt;player.scale.y=THREE.MathUtils.lerp(player.scale.y,.72,.22)}
  else player.scale.y=THREE.MathUtils.lerp(player.scale.y,1,.18);
}
