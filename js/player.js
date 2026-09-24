// Original cartoon athlete roster. Each style is distinct and intentionally not a pixel-for-pixel copy of any copyrighted character.
const MGO_CHARACTERS={
  mario:{name:'Fire Hero',inspired:'classic platform hero',skin:0xc9825b,jersey:0xe53935,dark:0x8e1b1b,hair:0x3b2115,accent:0xf5c542,shoe:0x6b1d18,type:'cap'},
  duck:{name:'Duck Captain',inspired:'classic sailor duck',skin:0xf7f7f0,jersey:0x2563eb,dark:0x153e9c,hair:0x17324d,accent:0xf59e0b,shoe:0x7c2d12,type:'duck'},
  bheem:{name:'Power Kid',inspired:'Indian cartoon strong kid',skin:0x8b5438,jersey:0xf59e0b,dark:0x9a3412,hair:0x24160f,accent:0xffd43b,shoe:0x7c2d12,type:'bheem'},
  raju:{name:'Super Kid',inspired:'Indian superhero kid',skin:0x9b6045,jersey:0xdc2626,dark:0x7f1d1d,hair:0x171717,accent:0xfacc15,shoe:0x111827,type:'raju'},
  ninja:{name:'Ninja Runner',inspired:'anime ninja',skin:0xf0b38c,jersey:0x334155,dark:0x172033,hair:0xf4c430,accent:0x60a5fa,shoe:0x111827,type:'ninja'},
  sonic:{name:'Blue Speedster',inspired:'fast blue game hero',skin:0xe8b98c,jersey:0x2563eb,dark:0x123a9a,hair:0x1769e0,accent:0xf8fafc,shoe:0xe53935,type:'sonic'},
  panda:{name:'Panda Brawler',inspired:'martial-arts panda hero',skin:0xf8fafc,jersey:0x111827,dark:0x050505,hair:0x111111,accent:0x22c55e,shoe:0x111111,type:'panda'},
  robot:{name:'Mecha Racer',inspired:'cartoon robot racer',skin:0x94a3b8,jersey:0x7c3aed,dark:0x312e81,hair:0x334155,accent:0x22d3ee,shoe:0x111827,type:'robot'}
};
const MGO_CHARACTER_IDS=Object.keys(MGO_CHARACTERS);

function createPlayer(scene,characterId='sonic'){
  const c=MGO_CHARACTERS[characterId]||MGO_CHARACTERS.sonic;
  const p=new THREE.Group(); p.name='CartoonAthlete_'+characterId; p.userData.characterId=characterId;

  const mats={
    jersey:new THREE.MeshStandardMaterial({color:c.jersey,roughness:.5}),
    dark:new THREE.MeshStandardMaterial({color:c.dark,roughness:.58}),
    skin:new THREE.MeshStandardMaterial({color:c.skin,roughness:.78}),
    hair:new THREE.MeshStandardMaterial({color:c.hair,roughness:.88}),
    white:new THREE.MeshStandardMaterial({color:0xf8fafc,roughness:.35}),
    black:new THREE.MeshStandardMaterial({color:0x101827,roughness:.55}),
    accent:new THREE.MeshStandardMaterial({color:c.accent,metalness:.15,roughness:.35}),
    shoe:new THREE.MeshStandardMaterial({color:c.shoe,roughness:.3}),
    sole:new THREE.MeshStandardMaterial({color:0x171717,roughness:.55}),
    mouth:new THREE.MeshStandardMaterial({color:0x5b2020,roughness:.55}),
    orange:new THREE.MeshStandardMaterial({color:0xf59e0b,roughness:.45})
  };
  const add=(o,g=p)=>{o.castShadow=true;o.receiveShadow=true;g.add(o);return o};
  const sphere=(r,x,y,z,m,sw=18,sh=12,g=p)=>{const o=add(new THREE.Mesh(new THREE.SphereGeometry(r,sw,sh)),g);o.position.set(x,y,z);return o};
  const capsule=(r,l,x,y,z,m,g=p)=>{const o=add(new THREE.Mesh(new THREE.CapsuleGeometry(r,l,6,12),m),g);o.position.set(x,y,z);return o};
  const box=(w,h,d,x,y,z,m,g=p)=>{const o=add(new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m),g);o.position.set(x,y,z);return o};

  // Strong shared body silhouette.
  const footL=box(.62,.28,1.15,-.43,.12,.24,mats.shoe),footR=box(.62,.28,1.15,.43,.12,.24,mats.shoe);
  box(.66,.09,1.18,-.43,.0,.24,mats.sole);box(.66,.09,1.18,.43,.0,.24,mats.sole);
  const pelvis=capsule(.35,.62,0,1.05,0,mats.dark);
  box(1.42,.62,.82,0,1.38,0,mats.black);
  box(.46,.58,.86,-.39,1.38,.02,mats.jersey);box(.46,.58,.86,.39,1.38,.02,mats.jersey);
  const torso=capsule(.66,1.05,0,2.55,0,mats.jersey);
  box(1.15,.16,.75,0,2.45,.56,mats.white);
  box(1.15,.16,.75,0,2.45,-.56,mats.accent);
  capsule(.2,.25,0,3.45,0,mats.skin);

  // Character-specific head, hair and facial structure.
  if(c.type==='panda'){
    sphere(.8,0,4.18,0,mats.white,24,18);
    sphere(.28,-.58,4.66,-.05,mats.black,16,12);sphere(.28,.58,4.66,-.05,mats.black,16,12);
    for(const x of [-.28,.28]){const patch=sphere(.22,x,4.25,.66,mats.black,16,12);patch.scale.set(.85,1.25,.45);sphere(.07,x,4.26,.85,mats.white,12,10)}
    sphere(.12,0,4.05,.83,mats.black,14,10);
    const smile=new THREE.Mesh(new THREE.TorusGeometry(.16,.035,8,16,Math.PI),mats.mouth);smile.position.set(0,3.92,.79);smile.rotation.x=Math.PI/2;add(smile);
  }else if(c.type==='robot'){
    const head=box(1.35,1.25,1.12,0,4.18,0,mats.dark);head.rotation.z=.02;
    box(1.02,.32,.10,0,4.28,.61,mats.black);
    for(const x of [-.28,.28]){const eye=box(.22,.12,.06,x,4.28,.69,mats.accent);eye.material.emissive=new THREE.Color(c.accent);eye.material.emissiveIntensity=1.5}
    box(.5,.08,.06,0,3.95,.69,mats.white);
    const antenna=capsule(.055,.36,0,4.95,0,mats.accent);sphere(.12,0,5.18,0,mats.accent,12,8);
  }else if(c.type==='duck'){
    sphere(.8,0,4.18,0,mats.white,24,18);
    sphere(.18,-.77,4.18,0,mats.white,14,10);sphere(.18,.77,4.18,0,mats.white,14,10);
    const hat=sphere(.63,0,4.67,0,mats.dark,22,12);hat.scale.y=.35;
    box(.95,.12,.55,0,4.52,.05,mats.accent);
    for(const x of [-.25,.25]){sphere(.15,x,4.28,.68,mats.white,16,12);sphere(.07,x,4.28,.82,mats.black,12,10)}
    const beak=sphere(.27,0,4.02,.78,mats.orange,16,10);beak.scale.set(1,.55,1.15);
    box(.42,.08,.08,0,3.93,.99,mats.orange);
  }else if(c.type==='sonic'){
    sphere(.79,0,4.18,0,mats.hair,24,18);
    // Large swept quills create a very different silhouette.
    for(let i=0;i<7;i++){const q=capsule(.16,.62,-.62+i*.21,4.48,-.02,mats.hair);q.rotation.z=(i-3)*.28;q.rotation.x=-.3}
    sphere(.52,0,4.02,.52,mats.skin,20,14);
    for(const x of [-.26,.26]){sphere(.18,x,4.30,.72,mats.white,16,12);sphere(.07,x,4.30,.86,mats.black,12,10)}
    const nose=sphere(.14,0,4.08,.88,mats.black,14,10);
    const smile=new THREE.Mesh(new THREE.TorusGeometry(.16,.035,8,16,Math.PI),mats.mouth);smile.position.set(0,3.92,.79);smile.rotation.x=Math.PI/2;add(smile);
  }else{
    sphere(.78,0,4.15,0,mats.skin,24,18);
    sphere(.16,-.76,4.18,0,mats.skin,14,10);sphere(.16,.76,4.18,0,mats.skin,14,10);
    if(c.type==='ninja'){
      // Spiky blonde ninja hair + headband + cheek marks.
      for(let i=0;i<9;i++){const q=capsule(.13,.62,-.58+i*.145,4.57,-.02,mats.hair);q.rotation.z=(i-4)*.22;q.rotation.x=-.25}
      box(1.05,.18,.18,0,4.48,.62,mats.dark);box(.55,.12,.08,0,4.48,.75,mats.accent);
      for(const x of [-.27,.27]){sphere(.13,x,4.23,.70,mats.white,16,12);sphere(.06,x,4.23,.82,mats.black,12,10)}
      for(const x of [-.36,.36])for(let j=0;j<3;j++)box(.16,.025,.025,x,4.02+j*.07,.72,mats.dark);
    }else{
      const cap=sphere(.76,0,4.49,-.02,mats.hair,24,16);cap.scale.set(1,.55,1);
      if(c.type==='cap'){
        const brim=box(1.0,.12,.45,0,4.39,.58,mats.jersey);
        sphere(.23,0,4.78,.02,mats.jersey,14,10);
      }
      for(const x of [-.27,.27]){sphere(.13,x,4.25,.70,mats.white,16,12);sphere(.062,x,4.25,.82,mats.black,12,10)}
      if(c.type==='cap'){
        capsule(.13,.30,0,4.02,.74,mats.skin); // large cartoon nose
        for(const x of [-.22,.22])capsule(.075,.25,x,3.86,.70,mats.hair);
      }else{
        sphere(.07,0,4.05,.75,mats.skin,12,8);
      }
      const smile=new THREE.Mesh(new THREE.TorusGeometry(.17,.035,8,16,Math.PI),mats.mouth);smile.position.set(0,3.91,.71);smile.rotation.x=Math.PI/2;add(smile);
    }
  }

  // Arms and legs.
  const armL=capsule(.2,.72,-.83,2.48,0,mats.jersey),armR=capsule(.2,.72,.83,2.48,0,mats.jersey);
  armL.rotation.z=-.12;armR.rotation.z=.12;
  capsule(.14,.62,-.9,1.72,0,mats.skin);capsule(.14,.62,.9,1.72,0,mats.skin);
  sphere(.18,-.92,1.35,0,mats.skin,14,10);sphere(.18,.92,1.35,0,mats.skin,14,10);
  box(.32,.13,.34,-.9,1.62,0,mats.white);box(.32,.13,.34,.9,1.62,0,mats.white);
  const collar=new THREE.Mesh(new THREE.TorusGeometry(.34,.065,8,24),mats.accent);collar.position.set(0,3.03,0);collar.rotation.x=Math.PI/2;add(collar);
  box(.38,.48,.04,0,2.52,.68,mats.white);

  // Distinctive costume accents.
  if(c.type==='duck'){box(1.1,.14,.08,0,2.85,.64,mats.accent)}
  if(c.type==='raju'){box(1.2,.18,.06,0,2.62,.69,mats.accent);sphere(.13,0,2.88,.68,mats.accent,12,8)}
  if(c.type==='bheem'){sphere(.14,0,2.83,.7,mats.accent,12,8);box(.8,.12,.06,0,2.62,.7,mats.accent)}
  if(c.type==='ninja'){box(1.0,.12,.06,0,2.62,.69,mats.accent)}
  if(c.type==='panda'){box(1.1,.16,.06,0,2.62,.69,mats.accent)}
  if(c.type==='robot'){box(1.15,.2,.08,0,2.62,.69,mats.accent);sphere(.14,0,2.86,.72,mats.accent,12,8)}

  const leftLeg=capsule(.23,.72,-.4,.72,0,mats.skin),rightLeg=capsule(.23,.72,.4,.72,0,mats.skin);
  p.userData={vy:0,ground:true,slide:0,cool:0,l:leftLeg,r:rightLeg,torso,pelvis,runTime:0,leftArm:armL,rightArm:armR,characterId};
  scene.add(p);return p;
}

function replacePlayerCharacter(scene,oldPlayer,characterId){
  const pos=oldPlayer.position.clone(),rot=oldPlayer.rotation.clone(),scale=oldPlayer.scale.clone(),visible=oldPlayer.visible;
  scene.remove(oldPlayer);
  const next=createPlayer(scene,characterId);next.position.copy(pos);next.rotation.copy(rot);next.scale.copy(scale);next.visible=visible;
  return next;
}
function applyRivalCharacters(rivals,chosenId){
  const ids=MGO_CHARACTER_IDS.filter(id=>id!==chosenId);
  rivals.forEach((r,i)=>{
    const id=ids[i%ids.length];
    const pos=r.position.clone(),vis=r.visible,old=r;
    const next=replacePlayerCharacter(r.parent||r.scene||window.scene,old,id);
    next.position.copy(pos);next.visible=vis;next.userData.rival=true;next.userData.raceSpeed=old.userData.raceSpeed;
    rivals[i]=next;
  });
}

function updatePlayer(player,keys,dt,yaw,toast){
  const u=player.userData;u.cool=Math.max(0,(u.cool||0)-dt);u.runTime=(u.runTime||0)+dt;
  const forward=new THREE.Vector3(Math.sin(yaw),0,Math.cos(yaw)),right=new THREE.Vector3(Math.cos(yaw),0,-Math.sin(yaw)),move=new THREE.Vector3();
  if(keys.KeyW)move.add(forward);if(keys.KeyS)move.sub(forward);if(keys.KeyD)move.add(right);if(keys.KeyA)move.sub(right);
  const moving=move.lengthSq()>0;
  if(moving){move.normalize();const speed=(keys.ShiftLeft||keys.ShiftRight)?11:6;player.position.addScaledVector(move,speed*dt);player.rotation.y=Math.atan2(move.x,move.z)}
  if(keys.Space&&u.ground){u.vy=8.5;u.ground=false}
  u.vy-=22*dt;player.position.y+=u.vy*dt;
  if(player.position.y<=.1){player.position.y=.1;u.vy=0;u.ground=true}
  player.position.x=THREE.MathUtils.clamp(player.position.x,-105,105);player.position.z=THREE.MathUtils.clamp(player.position.z,-105,105);
  const stride=moving?Math.sin(u.runTime*12)*.48:0;
  if(u.l)u.l.rotation.x=stride;if(u.r)u.r.rotation.x=-stride;if(u.leftArm)u.leftArm.rotation.x=-stride*.72;if(u.rightArm)u.rightArm.rotation.x=stride*.72;
  if(keys.KeyC&&!u.slide){u.slide=.45;toast('SLIDE!')}
  if(u.slide>0){u.slide-=dt;player.scale.y=THREE.MathUtils.lerp(player.scale.y,.72,.22)}else player.scale.y=THREE.MathUtils.lerp(player.scale.y,1,.18);
}
