// Premium stylized 3D human athletes.
// Original characters designed around the supplied animated-movie reference:
// oversized expressive head, soft rounded forms, layered hair, hoodie/jacket clothing,
// natural hands/feet, smooth materials and strong silhouettes.
const MGO_CHARACTERS={
  mario:{name:'Fire Hero',skin:0xc9825b,jersey:0xe84b2f,dark:0x51332b,hair:0x4a2618,accent:0xf5c542,shoe:0x9f2f23,type:'cap'},
  duck:{name:'Blue Captain',skin:0xf0c3a1,jersey:0x2868d8,dark:0x243b70,hair:0x302319,accent:0xf3a61b,shoe:0x8a4b25,type:'sailor'},
  bheem:{name:'Power Kid',skin:0x8b5438,jersey:0xf0a52b,dark:0x5a2b19,hair:0x21150f,accent:0xffd85a,shoe:0x7b431f,type:'power'},
  raju:{name:'Super Kid',skin:0x9b6045,jersey:0xd93632,dark:0x5a2020,hair:0x171313,accent:0xf5cf42,shoe:0x242833,type:'hero'},
  ninja:{name:'Ninja Runner',skin:0xf0b38c,jersey:0x3c4657,dark:0x202735,hair:0x241b16,accent:0x66b8ff,shoe:0x171b24,type:'ninja'},
  sonic:{name:'Blue Speedster',skin:0xe8b98c,jersey:0x2774dc,dark:0x19366c,hair:0x1260d1,accent:0xf8fafc,shoe:0xe63e32,type:'speed'},
  panda:{name:'Panda Brawler',skin:0xb97755,jersey:0x20252b,dark:0x111318,hair:0x111318,accent:0x4edb7b,shoe:0x111318,type:'panda'},
  robot:{name:'Mecha Racer',skin:0xb7c2ce,jersey:0x7551d9,dark:0x303044,hair:0x596475,accent:0x31d9ef,shoe:0x171b24,type:'robot'}
};
const MGO_CHARACTER_IDS=Object.keys(MGO_CHARACTERS);

function createPlayer(scene,characterId='sonic'){
  const c=MGO_CHARACTERS[characterId]||MGO_CHARACTERS.sonic;
  const p=new THREE.Group();
  p.name='PremiumHuman_'+characterId;
  p.userData.characterId=characterId;

  const material=(color,roughness=.55,metalness=0)=>{
    const m=new THREE.MeshStandardMaterial({color,roughness,metalness});
    m.flatShading=false;
    return m;
  };
  const mats={
    skin:material(c.skin,.64),hair:material(c.hair,.8),
    jacket:material(c.jersey,.34),shirt:material(c.dark,.52),
    pants:material(0x303744,.64),shoe:material(c.shoe,.26),
    sole:material(0x16181d,.62),white:material(0xffffff,.18),
    eye:material(0xf9fbff,.12),pupil:material(0x17120f,.22),
    black:material(0x14161b,.48),accent:material(c.accent,.3,.08),
    mouth:material(0x762732,.48),blush:material(0xf28b83,.82),
    metal:material(0xb8c5d1,.18,.55)
  };

  const add=(o,g=p)=>{o.castShadow=true;o.receiveShadow=true;g.add(o);return o};
  const sphere=(r,x,y,z,m,sw=32,sh=22,g=p)=>{
    const o=add(new THREE.Mesh(new THREE.SphereGeometry(r,sw,sh),m),g);
    o.position.set(x,y,z);return o;
  };
  const capsule=(r,l,x,y,z,m,g=p)=>{
    const o=add(new THREE.Mesh(new THREE.CapsuleGeometry(r,l,10,20),m),g);
    o.position.set(x,y,z);return o;
  };
  const box=(w,h,d,x,y,z,m,g=p)=>{
    const o=add(new THREE.Mesh(new THREE.BoxGeometry(w,h,d,3,3,3),m),g);
    o.position.set(x,y,z);return o;
  };
  const cyl=(r,h,x,y,z,m,g=p)=>{
    const o=add(new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,24),m),g);
    o.position.set(x,y,z);return o;
  };

  // REFERENCE-LIKE SILHOUETTE
  // Larger head, shorter torso, rounded shoulders, slightly oversized shoes.
  const footL=box(.62,.27,1.08,-.38,.15,.13,mats.shoe);
  const footR=box(.62,.27,1.08,.38,.15,.13,mats.shoe);
  box(.64,.07,1.09,-.38,.025,.13,mats.sole);
  box(.64,.07,1.09,.38,.025,.13,mats.sole);

  const shinL=capsule(.19,.48,-.38,.58,0,mats.pants);
  const shinR=capsule(.19,.48,.38,.58,0,mats.pants);
  const thighL=capsule(.235,.58,-.38,1.08,0,mats.pants);
  const thighR=capsule(.235,.58,.38,1.08,0,mats.pants);

  const pelvis=capsule(.39,.48,0,1.50,0,mats.pants);
  const waist=capsule(.43,.28,0,1.77,0,mats.shirt);

  // Rounded jacket body, deliberately not a rectangular torso.
  const torso=capsule(.62,1.00,0,2.45,0,mats.jacket);
  torso.scale.set(1.08,1,0.78);
  const chest=box(1.02,.58,.62,0,2.53,.02,mats.jacket);
  chest.scale.set(.95,1,.92);
  const shoulder=capsule(.29,1.04,0,2.91,0,mats.jacket);
  shoulder.rotation.z=Math.PI/2;

  // Hoodie hood behind the neck.
  const hood=capsule(.44,.40,0,3.17,-.15,mats.jacket);
  hood.scale.set(1.12,.72,.72);

  capsule(.17,.25,0,3.52,0,mats.skin);

  // LARGE SOFT CARTOON HEAD
  const head=sphere(.88,0,4.23,0,mats.skin,40,28);
  head.scale.set(1.02,1.04,.94);
  const earL=sphere(.17,-.87,4.23,0,mats.skin,20,14);
  const earR=sphere(.17,.87,4.23,0,mats.skin,20,14);
  earL.scale.set(.65,1,1);earR.scale.set(.65,1,1);

  // Sculpted-looking layered hair: cap + broad locks + side locks.
  const hairCap=sphere(.84,0,4.63,-.03,mats.hair,40,24);
  hairCap.scale.set(1.04,.62,.94);
  const hairLocks=[];
  function lock(x,y,z,sx,sy,sz,rz){
    const h=capsule(.115,.58,x,y,z,mats.hair);
    h.scale.set(sx,sy,sz);h.rotation.z=rz;h.rotation.x=-.22;
    hairLocks.push(h);return h;
  }
  if(c.type==='speed'){
    for(let i=0;i<11;i++){const x=-.62+i*.124;lock(x,4.83,-.02,1.0,1.0,1.25,(i-5)*.16)}
    lock(-.72,4.52,.05,1.15,1.0,1.35,-.65);
    lock(.72,4.54,.05,1.15,1.0,1.35,.65);
  }else if(c.type==='cap'){
    box(1.28,.18,.58,0,4.55,.43,mats.jacket);
    sphere(.27,0,4.88,.02,mats.jacket,20,14);
    for(let i=0;i<6;i++)lock(-.42+i*.168,4.76,-.03,1,1,1.05,(i-2.5)*.10);
  }else if(c.type==='sailor'){
    cyl(.66,.22,0,4.92,0,mats.dark);
    box(1.04,.13,.46,0,4.72,.04,mats.accent);
    for(let i=0;i<7;i++)lock(-.42+i*.14,4.77,-.03,1,1,1.05,(i-3)*.08);
  }else if(c.type==='ninja'){
    for(let i=0;i<10;i++){const x=-.58+i*.129;lock(x,4.82,-.02,1,1,1.18,(i-4.5)*.13)}
    box(1.22,.16,.08,0,4.55,.69,mats.accent);
  }else{
    for(let i=0;i<9;i++){const x=-.52+i*.13;lock(x,4.78,-.02,1,1,1.12,(i-4)*.10)}
  }

  // Huge friendly eyes: the most important reference feature.
  for(const x of [-.31,.31]){
    sphere(.245,x,4.30,.77,mats.eye,24,18);
    sphere(.108,x,4.29,.965,mats.pupil,20,16);
    sphere(.045,x-.035,4.35,1.02,mats.white,12,10);
    const brow=box(.30,.065,.08,x,4.63,.80,mats.hair);
    brow.rotation.z=x<0?-0.08:.08;
    sphere(.12,x,4.00,.70,mats.blush,16,12);
  }

  // Small rounded nose and smiling mouth.
  sphere(.115,0,4.08,.82,mats.skin,18,14);
  const mouth=new THREE.Mesh(new THREE.TorusGeometry(.19,.038,10,24,Math.PI),mats.mouth);
  mouth.position.set(0,3.91,.78);mouth.rotation.x=Math.PI/2;add(mouth);

  // Jacket front, zipper, cuffs, pockets and shirt.
  box(.38,.58,.04,0,2.53,.62,mats.shirt);
  box(.045,.72,.055,0,2.60,.67,mats.accent);
  for(const side of [-1,1]){
    const cord=capsule(.027,.42,side*.12,3.02,.66,mats.white);
    cord.rotation.z=side*.04;
    sphere(.055,side*.12,2.78,.67,mats.accent,12,10);
    box(.34,.055,.05,side*.47,2.05,.66,mats.accent);
  }

  // Human arms with rounded jacket sleeves, exposed forearms and chunky hands.
  const armL=capsule(.205,.66,-.84,2.53,0,mats.jacket);
  const armR=capsule(.205,.66,.84,2.53,0,mats.jacket);
  armL.rotation.z=-.12;armR.rotation.z=.12;
  const foreL=capsule(.145,.52,-.92,1.98,0,mats.skin);
  const foreR=capsule(.145,.52,.92,1.98,0,mats.skin);
  const handL=sphere(.20,-.95,1.64,0,mats.skin,20,14);
  const handR=sphere(.20,.95,1.64,0,mats.skin,20,14);
  for(const side of [-1,1]){
    box(.31,.11,.29,side*.90,2.27,0,mats.accent);
    for(let i=0;i<3;i++)sphere(.038,side*(.90+i*.045),1.57+i*.025,.13,mats.skin,10,8);
  }

  // Hoodie hem and collar.
  const collar=new THREE.Mesh(new THREE.TorusGeometry(.34,.06,10,28),mats.accent);
  collar.position.set(0,3.04,0);collar.rotation.x=Math.PI/2;add(collar);

  // Character-specific visual language while preserving the same human base.
  if(c.type==='panda'){
    for(const x of [-.38,.38]){
      const patch=sphere(.22,x,4.28,.79,mats.black,20,14);
      patch.scale.set(.9,1.25,.28);
    }
    sphere(.11,0,4.04,.90,mats.black,14,10);
  }
  if(c.type==='robot'){
    head.material=mats.metal;earL.material=mats.metal;earR.material=mats.metal;
    hairCap.material=mats.dark;
    box(.72,.12,.08,0,4.16,.96,mats.accent);
    sphere(.10,-.30,4.30,.99,mats.accent,14,10);
    sphere(.10,.30,4.30,.99,mats.accent,14,10);
  }
  if(c.type==='sailor')box(1.0,.13,.06,0,2.92,.66,mats.white);
  if(c.type==='power')sphere(.14,0,2.99,.68,mats.accent,14,10);
  if(c.type==='hero'){box(1.0,.12,.05,0,2.78,.68,mats.accent);sphere(.12,0,2.98,.70,mats.accent,14,10)}
  if(c.type==='speed')box(.78,.09,.05,0,2.79,.68,mats.white);
  if(c.type==='ninja'){box(1.05,.12,.06,0,2.84,.68,mats.accent);box(.58,.07,.05,0,2.98,.69,mats.dark)}

  p.userData={
    vy:0,ground:true,slide:0,cool:0,
    l:thighL,r:thighR,calfL:shinL,calfR:shinR,
    torso,pelvis,runTime:0,leftArm:armL,rightArm:armR,
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
  if(moving){move.normalize();const speed=(keys.ShiftLeft||keys.ShiftRight)?11:6;player.position.addScaledVector(move,speed*dt);player.rotation.y=Math.atan2(move.x,move.z)}
  if(keys.Space&&u.ground){u.vy=8.5;u.ground=false}
  u.vy-=22*dt;player.position.y+=u.vy*dt;
  if(player.position.y<=.1){player.position.y=.1;u.vy=0;u.ground=true}
  player.position.x=THREE.MathUtils.clamp(player.position.x,-105,105);
  player.position.z=THREE.MathUtils.clamp(player.position.z,-105,105);

  const stride=moving?Math.sin(u.runTime*12)*.46:0;
  if(u.l)u.l.rotation.x=stride;if(u.r)u.r.rotation.x=-stride;
  if(u.calfL)u.calfL.rotation.x=-stride*.55;if(u.calfR)u.calfR.rotation.x=stride*.55;
  if(u.leftArm)u.leftArm.rotation.x=-stride*.68;if(u.rightArm)u.rightArm.rotation.x=stride*.68;
  if(u.foreL)u.foreL.rotation.x=-stride*.5;if(u.foreR)u.foreR.rotation.x=stride*.5;

  if(keys.KeyC&&!u.slide){u.slide=.45;toast('SLIDE!')}
  if(u.slide>0){u.slide-=dt;player.scale.y=THREE.MathUtils.lerp(player.scale.y,.72,.22)}
  else player.scale.y=THREE.MathUtils.lerp(player.scale.y,1,.18);
}
