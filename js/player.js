// Mini Game Olympics character system
// Appearance is data-driven: update CHARACTER_DEFINITIONS to change the athlete
// without touching movement, cameras, races, or tournament logic.

const SHARED_CHARACTER_DEFAULTS = {
  name: 'Custom Athlete',
  inspired: 'original cartoon athlete',
  skin: 0xe8b98c,
  jersey: 0x2563eb,
  dark: 0x123a9a,
  hair: 0x3b2115,
  accent: 0xf5c542,
  shoe: 0x111827,
  type: 'human'
};

const CHARACTER_DEFINITIONS = {
  fireHero: {
    name: 'Fire Hero',
    inspired: 'original platform-hero archetype',
    skin: 0xc9825b, jersey: 0xe53935, dark: 0x8e1b1b,
    hair: 0x3b2115, accent: 0xf5c542, shoe: 0x6b1d18, type: 'cap'
  },
  duckCaptain: {
    name: 'Duck Captain',
    inspired: 'original sailor-duck archetype',
    skin: 0xf7f7f0, jersey: 0x2563eb, dark: 0x153e9c,
    hair: 0x17324d, accent: 0xf59e0b, shoe: 0x7c2d12, type: 'duck'
  },
  powerKid: {
    name: 'Power Kid',
    inspired: 'original Indian-cartoon-inspired strong kid archetype',
    skin: 0x8b5438, jersey: 0xf59e0b, dark: 0x9a3412,
    hair: 0x24160f, accent: 0xffd43b, shoe: 0x7c2d12, type: 'bheem'
  },
  superKid: {
    name: 'Super Kid',
    inspired: 'original superhero-kid archetype',
    skin: 0x9b6045, jersey: 0xdc2626, dark: 0x7f1d1d,
    hair: 0x171717, accent: 0xfacc15, shoe: 0x111827, type: 'raju'
  },
  ninjaRunner: {
    name: 'Ninja Runner',
    inspired: 'original anime-ninja archetype',
    skin: 0xf0b38c, jersey: 0x334155, dark: 0x172033,
    hair: 0xf4c430, accent: 0x60a5fa, shoe: 0x111827, type: 'ninja'
  },
  blueSpeedster: {
    name: 'Blue Speedster',
    inspired: 'original speed-hero archetype',
    skin: 0xe8b98c, jersey: 0x2563eb, dark: 0x123a9a,
    hair: 0x1769e0, accent: 0xf8fafc, shoe: 0xe53935, type: 'sonic'
  },
  pandaBrawler: {
    name: 'Panda Brawler',
    inspired: 'original martial-arts panda archetype',
    skin: 0xf8fafc, jersey: 0x111827, dark: 0x050505,
    hair: 0x111111, accent: 0x22c55e, shoe: 0x111111, type: 'panda'
  },
  mechaRacer: {
    name: 'Mecha Racer',
    inspired: 'original cartoon-robot racer archetype',
    skin: 0x94a3b8, jersey: 0x7c3aed, dark: 0x312e81,
    hair: 0x334155, accent: 0x22d3ee, shoe: 0x111827, type: 'robot'
  }
};

// Backwards-compatible aliases for the current main.js character ids.
// New UI/preferences should use CHARACTER_DEFINITIONS directly.
const MGO_CHARACTERS = {
  mario: CHARACTER_DEFINITIONS.fireHero,
  duck: CHARACTER_DEFINITIONS.duckCaptain,
  bheem: CHARACTER_DEFINITIONS.powerKid,
  raju: CHARACTER_DEFINITIONS.superKid,
  ninja: CHARACTER_DEFINITIONS.ninjaRunner,
  sonic: CHARACTER_DEFINITIONS.blueSpeedster,
  panda: CHARACTER_DEFINITIONS.pandaBrawler,
  robot: CHARACTER_DEFINITIONS.mechaRacer
};

const MGO_CHARACTER_IDS = Object.keys(MGO_CHARACTERS);

function mergeCharacterPreferences(preferences = {}) {
  const baseCharacter = MGO_CHARACTERS[preferences.base] || {};
  const base = { ...SHARED_CHARACTER_DEFAULTS, ...baseCharacter };
  const merged = { ...base, ...preferences };
  delete merged.base;
  // Appearance preferences can change colours/name, but the archetype remains stable.
  merged.type = base.type;
  return merged;
}

function createCharacterMaterials(character) {
  const glow = Number(character.glow ?? 0);
  const glowColor = new THREE.Color(character.glowColor ?? character.accent ?? 0x38d9ff);
  return {
    jersey: new THREE.MeshStandardMaterial({ color: character.jersey, roughness: .5, emissive: glow ? glowColor : 0x000000, emissiveIntensity: glow }),
    dark: new THREE.MeshStandardMaterial({ color: character.dark, roughness: .58 }),
    skin: new THREE.MeshStandardMaterial({ color: character.skin, roughness: .78 }),
    skinBody: new THREE.MeshStandardMaterial({ color: character.skinBody ?? character.skin, roughness: .78 }),
    skinHands: new THREE.MeshStandardMaterial({ color: character.skinHands ?? character.skinBody ?? character.skin, roughness: .8 }),
    skinLegs: new THREE.MeshStandardMaterial({ color: character.skinLegs ?? character.skinBody ?? character.skin, roughness: .8 }),
    hair: new THREE.MeshStandardMaterial({ color: character.hair, roughness: .88 }),
    white: new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: .35 }),
    black: new THREE.MeshStandardMaterial({ color: 0x101827, roughness: .55 }),
    accent: new THREE.MeshStandardMaterial({ color: character.accent, metalness: .15, roughness: .35 }),
    shoe: new THREE.MeshStandardMaterial({ color: character.shoe, roughness: .3 }),
    sole: new THREE.MeshStandardMaterial({ color: 0x171717, roughness: .55 }),
    mouth: new THREE.MeshStandardMaterial({ color: 0x5b2020, roughness: .55 }),
    orange: new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: .45 })
  };
}

function buildEditorAccessories(p, headGroup, mats, c, helpers) {
  const { box, sphere, add } = helpers;
  const accessory = c.accessory || 'none';
  if (accessory === 'visor') {
    const v = box(1.12, .12, .48, 0, 4.48, .58, mats.accent); v.rotation.x = -.08;
  } else if (accessory === 'headband') {
    box(1.12, .12, .08, 0, 4.43, .72, mats.accent);
  } else if (accessory === 'glasses') {
    for (const x of [-.27, .27]) {
      const g = sphere(.18, x, 4.28, .76, mats.black, 16, 10); g.scale.set(1.15, .55, .22);
    }
    box(.20, .045, .04, 0, 4.28, .79, mats.black);
  } else if (accessory === 'crown') {
    const crown = new THREE.Group();
    for (const x of [-.42, -.21, 0, .21, .42]) {
      const pike = new THREE.Mesh(new THREE.ConeGeometry(.10, .38, 6), mats.accent);
      pike.position.set(x, 4.82 + (Math.abs(x) * -.12), 0); crown.add(pike);
    }
    const band = new THREE.Mesh(new THREE.TorusGeometry(.58, .08, 8, 24), mats.accent);
    band.position.y = 4.66; band.rotation.x = Math.PI / 2; crown.add(band); add(crown);
  }
  if (c.jerseyNumber) {
    const canvas = document.createElement('canvas'); canvas.width = 256; canvas.height = 256;
    const ctx = canvas.getContext('2d'); ctx.clearRect(0,0,256,256);
    ctx.fillStyle = '#ffffff'; ctx.font = '900 150px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(String(c.jerseyNumber).slice(0,3), 128, 132);
    const tex = new THREE.CanvasTexture(canvas); tex.colorSpace = THREE.SRGBColorSpace;
    const mat = new THREE.MeshBasicMaterial({map: tex, transparent:true});
    const badge = new THREE.Mesh(new THREE.PlaneGeometry(.48,.48), mat);
    badge.position.set(0,2.53,.71); p.add(badge); p.userData.jerseyNumberMesh = badge;
  }
}

function buildEditorHair(p, mats, c, helpers) {
  const { sphere, capsule, add } = helpers;
  const style = c.hairStyle || 'classic';
  if (style === 'buzz') {
    const cap = sphere(.79, 0, 4.49, -.02, mats.hair, 24, 16);
    cap.scale.set(1, .42, 1);
  } else if (style === 'messy') {
    sphere(.79, 0, 4.46, -.02, mats.hair, 24, 16).scale.set(1, .58, 1);
    for (let i = 0; i < 9; i++) {
      const a = (i / 8) * Math.PI - Math.PI / 2;
      const q = capsule(.12, .42 + (i % 2) * .08, Math.cos(a) * .63, 4.55 + Math.sin(a) * .18, Math.sin(a) * .18, mats.hair);
      q.rotation.z = (i - 4) * .18;
      q.rotation.x = -.35;
    }
  } else if (style === 'fringe') {
    sphere(.79, 0, 4.47, -.02, mats.hair, 24, 16).scale.set(1, .58, 1);
    for (let i = 0; i < 7; i++) {
      const x = -.54 + i * .18;
      const q = capsule(.11, .42, x, 4.34 + Math.abs(x) * .10, .52, mats.hair);
      q.rotation.z = (x * -.35);
      q.rotation.x = -.55;
    }
  } else if (style === 'curly') {
    for (let i = 0; i < 15; i++) {
      const a = (i / 15) * Math.PI * 2;
      const r = i < 9 ? .58 : .38;
      sphere(.17, Math.cos(a) * r, 4.46 + (i % 3) * .13, Math.sin(a) * .24 - .02, mats.hair, 12, 8);
    }
    sphere(.62, 0, 4.48, -.02, mats.hair, 20, 12).scale.set(1, .5, .85);
  } else if (style === 'spiky') {
    sphere(.78, 0, 4.45, -.02, mats.hair, 24, 16).scale.set(1, .55, 1);
    for (let i = 0; i < 9; i++) {
      const x = -.68 + i * .17;
      const q = capsule(.12, .62, x, 4.70 + (i % 2) * .10, -.02, mats.hair);
      q.rotation.z = (i - 4) * .30;
      q.rotation.x = -.25;
    }
  } else if (style === 'long') {
    sphere(.79, 0, 4.47, -.02, mats.hair, 24, 16).scale.set(1, .58, 1);
    for (const x of [-.62, .62]) {
      const q = capsule(.14, 1.05, x, 4.05, -.02, mats.hair);
      q.rotation.z = x < 0 ? .08 : -.08;
    }
  } else {
    const cap = sphere(.76, 0, 4.49, -.02, mats.hair, 24, 16);
    cap.scale.set(1, .55, 1);
  }
}

function buildCharacterHead(p, mats, c, helpers) {
  const { sphere, capsule, box, add } = helpers;

  if (c.type === 'panda') {
    sphere(.8, 0, 4.18, 0, mats.white, 24, 18);
    sphere(.28, -.58, 4.66, -.05, mats.black, 16, 12);
    sphere(.28, .58, 4.66, -.05, mats.black, 16, 12);
    for (const x of [-.28, .28]) {
      const patch = sphere(.22, x, 4.25, .66, mats.black, 16, 12);
      patch.scale.set(.85, 1.25, .45);
      sphere(.07, x, 4.26, .85, mats.white, 12, 10);
    }
    sphere(.12, 0, 4.05, .83, mats.black, 14, 10);
    const smile = new THREE.Mesh(new THREE.TorusGeometry(.16, .035, 8, 16, Math.PI), mats.mouth);
    smile.position.set(0, 3.92, .79); smile.rotation.x = Math.PI / 2; add(smile);
  } else if (c.type === 'robot') {
    const head = box(1.35, 1.25, 1.12, 0, 4.18, 0, mats.dark);
    head.rotation.z = .02;
    box(1.02, .32, .10, 0, 4.28, .61, mats.black);
    for (const x of [-.28, .28]) {
      const eye = box(.22, .12, .06, x, 4.28, .69, mats.accent);
      eye.material.emissive = new THREE.Color(c.accent);
      eye.material.emissiveIntensity = 1.5;
    }
    box(.5, .08, .06, 0, 3.95, .69, mats.white);
    capsule(.055, .36, 0, 4.95, 0, mats.accent);
    sphere(.12, 0, 5.18, 0, mats.accent, 12, 8);
  } else if (c.type === 'duck') {
    sphere(.8, 0, 4.18, 0, mats.white, 24, 18);
    sphere(.18, -.77, 4.18, 0, mats.white, 14, 10);
    sphere(.18, .77, 4.18, 0, mats.white, 14, 10);
    const hat = sphere(.63, 0, 4.67, 0, mats.dark, 22, 12);
    hat.scale.y = .35;
    box(.95, .12, .55, 0, 4.52, .05, mats.accent);
    for (const x of [-.25, .25]) {
      sphere(.15, x, 4.28, .68, mats.white, 16, 12);
      sphere(.07, x, 4.28, .82, mats.black, 12, 10);
    }
    const beak = sphere(.27, 0, 4.02, .78, mats.orange, 16, 10);
    beak.scale.set(1, .55, 1.15);
    box(.42, .08, .08, 0, 3.93, .99, mats.orange);
  } else {
    sphere(.78, 0, 4.15, 0, mats.skinBody, 24, 18);
    sphere(.16, -.76, 4.18, 0, mats.skinBody, 14, 10);
    sphere(.16, .76, 4.18, 0, mats.skinBody, 14, 10);
    const customHair = c.hairStyle && c.hairStyle !== 'classic';
    if (customHair) {
      buildEditorHair(p, mats, c, { sphere, capsule, add });
    } else if (c.type === 'ninja') {
      for (let i = 0; i < 9; i++) {
        const q = capsule(.13, .62, -.58 + i * .145, 4.57, -.02, mats.hair);
        q.rotation.z = (i - 4) * .22; q.rotation.x = -.25;
      }
      box(1.05, .18, .18, 0, 4.48, .62, mats.dark);
      box(.55, .12, .08, 0, 4.48, .75, mats.accent);
    } else {
      buildEditorHair(p, mats, { ...c, hairStyle: 'classic' }, { sphere, capsule, add });
      if (c.type === 'cap') {
        box(1.0, .12, .45, 0, 4.39, .58, mats.jersey);
        sphere(.23, 0, 4.78, .02, mats.jersey, 14, 10);
      }
    }
    for (const x of [-.27, .27]) {
      sphere(.13, x, 4.25, .70, mats.white, 16, 12);
      sphere(.062, x, 4.25, .82, mats.black, 12, 10);
    }
    sphere(.07, 0, 4.05, .75, mats.skinBody, 12, 8);
    const smile = new THREE.Mesh(new THREE.TorusGeometry(.17, .035, 8, 16, Math.PI), mats.mouth);
    smile.position.set(0, 3.91, .71); smile.rotation.x = Math.PI / 2; add(smile);
  }
}

function buildEditorClothing(p, mats, c, helpers) {
  const { box, capsule, add } = helpers;
  const style = c.clothing || 'sport';
  if (style === 'hoodie') {
    const hood = new THREE.Mesh(new THREE.TorusGeometry(.52, .18, 10, 28, Math.PI * 1.65), mats.dark);
    hood.position.set(0, 3.0, -.05); hood.rotation.x = Math.PI / 2; add(hood);
    box(1.18, .72, .72, 0, 2.45, 0, mats.dark);
    box(.62, .26, .08, 0, 2.02, .40, mats.black);
  } else if (style === 'jacket') {
    box(1.18, 1.12, .76, 0, 2.48, 0, mats.dark);
    box(.10, 1.0, .80, 0, 2.48, .43, mats.accent);
  } else if (style === 'tee') {
    box(1.18, .98, .74, 0, 2.5, 0, mats.jersey);
  } else if (style === 'tracksuit') {
    box(1.20, 1.05, .76, 0, 2.5, 0, mats.dark);
    for (const x of [-.4, .4]) {
      const pant = capsule(.25, .55, x, .78, 0, mats.dark);
      pant.scale.set(.9, 1.05, .9);
    }
  } else {
    box(1.20, .96, .74, 0, 2.5, 0, mats.jersey);
  }
  // A simple collar makes the outfit read as clothing instead of a coloured body.
  const collar = new THREE.Mesh(new THREE.TorusGeometry(.35, .06, 8, 24), mats.accent);
  collar.position.set(0, 3.02, 0); collar.rotation.x = Math.PI / 2; add(collar);
}

function createPlayer(scene, characterId = 'sonic', preferences = {}) {
  const base = MGO_CHARACTERS[characterId] || MGO_CHARACTERS.sonic;
  const c = mergeCharacterPreferences({ ...preferences, base: characterId, type: base.type });
  c.skinBody = preferences.skinBody ?? preferences.skin ?? c.skin;
  c.skinHands = preferences.skinHands ?? c.skinBody;
  c.skinLegs = preferences.skinLegs ?? c.skinBody;
  c.skinBody = preferences.skinBody ?? preferences.skin ?? c.skin;
  c.skinHands = preferences.skinHands ?? c.skinBody;
  c.skinLegs = preferences.skinLegs ?? c.skinBody;

  const p = new THREE.Group();
  p.name = 'CartoonAthlete_' + characterId;
  p.userData.characterId = characterId;
  p.userData.characterPreferences = { ...preferences };

  const mats = createCharacterMaterials(c);
  const objects = [];
  const add = (o, g = p) => {
    o.castShadow = true;
    o.receiveShadow = true;
    g.add(o);
    objects.push(o);
    return o;
  };
  const sphere = (r, x, y, z, m, sw = 18, sh = 12, g = p) => {
    const o = add(new THREE.Mesh(new THREE.SphereGeometry(r, sw, sh), m), g);
    o.position.set(x, y, z);
    return o;
  };
  const capsule = (r, l, x, y, z, m, g = p) => {
    const o = add(new THREE.Mesh(new THREE.CapsuleGeometry(r, l, 6, 12), m), g);
    o.position.set(x, y, z);
    return o;
  };
  const box = (w, h, d, x, y, z, m, g = p) => {
    const o = add(new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m), g);
    o.position.set(x, y, z);
    return o;
  };

  // Shared athlete silhouette. Exposed areas use skin materials; clothing is layered separately.
  const bodyBuild = preferences.bodyType || 'athletic';
  const buildScale = bodyBuild === 'slim' ? .86 : bodyBuild === 'broad' ? 1.10 : bodyBuild === 'heavy' ? 1.22 : 1;
  const limbBuild = bodyBuild === 'slim' ? .90 : bodyBuild === 'broad' ? 1.08 : bodyBuild === 'heavy' ? 1.16 : 1;
  box(.62 * limbBuild, .28, 1.15 * limbBuild, -.43, .12, .24, mats.shoe);
  box(.62 * limbBuild, .28, 1.15 * limbBuild, .43, .12, .24, mats.shoe);
  box(.66 * limbBuild, .09, 1.18 * limbBuild, -.43, .0, .24, mats.sole);
  box(.66 * limbBuild, .09, 1.18 * limbBuild, .43, .0, .24, mats.sole);
  const pelvis = capsule(.35 * buildScale, .62, 0, 1.05, 0, mats.dark);
  const torso = capsule(.66 * buildScale, 1.05, 0, 2.55, 0, mats.jersey);
  capsule(.2, .25, 0, 3.45, 0, mats.skinBody);
  const headStart = objects.length;
  buildCharacterHead(p, mats, c, { sphere, capsule, box, add });
  const headGroup = new THREE.Group();
  headGroup.name = 'CharacterHeadControls';
  const headObjects = objects.slice(headStart);
  headObjects.forEach(o => headGroup.add(o));
  p.add(headGroup);

  const armL = capsule(.2 * limbBuild, .72, -.83 * buildScale, 2.48, 0, mats.jersey);
  const armR = capsule(.2 * limbBuild, .72, .83 * buildScale, 2.48, 0, mats.jersey);
  armL.rotation.z = -.12; armR.rotation.z = .12;
  capsule(.14, .62, -.9 * buildScale, 1.72, 0, mats.skinHands);
  capsule(.14, .62, .9 * buildScale, 1.72, 0, mats.skinHands);
  sphere(.18 * limbBuild, -.92 * buildScale, 1.35, 0, mats.skinHands, 14, 10);
  sphere(.18 * limbBuild, .92 * buildScale, 1.35, 0, mats.skinHands, 14, 10);
  box(.32, .13, .34, -.9, 1.62, 0, mats.white);
  box(.32, .13, .34, .9, 1.62, 0, mats.white);
  const collar = new THREE.Mesh(new THREE.TorusGeometry(.34, .065, 8, 24), mats.accent);
  collar.position.set(0, 3.03, 0); collar.rotation.x = Math.PI / 2; add(collar);
  box(.38, .48, .04, 0, 2.52, .68, mats.white);

  if (c.type === 'duck') box(1.1, .14, .08, 0, 2.85, .64, mats.accent);
  if (c.type === 'raju') {
    box(1.2, .18, .06, 0, 2.62, .69, mats.accent);
    sphere(.13, 0, 2.88, .68, mats.accent, 12, 8);
  }
  if (c.type === 'bheem') {
    sphere(.14, 0, 2.83, .70, mats.accent, 12, 8);
    box(.8, .12, .06, 0, 2.62, .70, mats.accent);
  }
  if (c.type === 'ninja') box(1.0, .12, .06, 0, 2.62, .69, mats.accent);
  if (c.type === 'panda') box(1.1, .16, .06, 0, 2.62, .69, mats.accent);
  if (c.type === 'robot') {
    box(1.15, .20, .08, 0, 2.62, .69, mats.accent);
    sphere(.14, 0, 2.86, .72, mats.accent, 12, 8);
  }

  const leftLeg = capsule(.23 * limbBuild, .72, -.4 * buildScale, .72, 0, mats.skinLegs);
  const rightLeg = capsule(.23 * limbBuild, .72, .4 * buildScale, .72, 0, mats.skinLegs);
  buildEditorClothing(p, mats, c, { box, capsule, add });

  buildEditorAccessories(p, headGroup, mats, c, { sphere, box, add });
  const armWidth = Number(preferences.armWidth ?? 1);
  const armLength = Number(preferences.armLength ?? 1);
  const legWidth = Number(preferences.legWidth ?? 1);
  const legLength = Number(preferences.legLength ?? 1);
  const shoulderWidth = Number(preferences.shoulderWidth ?? 1);
  armL.scale.set(armWidth, armLength, armWidth); armR.scale.set(armWidth, armLength, armWidth);
  leftLeg.scale.set(legWidth, legLength, legWidth); rightLeg.scale.set(legWidth, legLength, legWidth);
  armL.position.x = -.83 * shoulderWidth; armR.position.x = .83 * shoulderWidth;
  const shoeStyle = preferences.shoeStyle || 'runner';
  const shoeScale = shoeStyle === 'chunky' ? 1.18 : shoeStyle === 'light' ? .86 : 1;
  const shoeMeshes = objects.filter(o => o.material === mats.shoe);
  shoeMeshes.forEach(o => o.scale.set(shoeScale, 1, shoeStyle === 'chunky' ? 1.08 : 1));

  const bodyScale = Number(preferences.bodyScale ?? 1);
  const heightScale = Number(preferences.heightScale ?? 1);
  const headScale = Number(preferences.headScale ?? 1);
  p.scale.set(bodyScale, heightScale, bodyScale);
  headGroup.scale.setScalar(headScale);

  p.userData = {
    vy: 0, ground: true, slide: 0, cool: 0,
    l: leftLeg, r: rightLeg, torso, pelvis, runTime: 0,
    leftArm: armL, rightArm: armR, characterId,
    characterPreferences: { ...preferences },
    renderParts: objects,
    headGroup,
    editorScales: { bodyScale, heightScale, headScale },
    baseScaleY: heightScale,
    bodyType: bodyBuild,
    hairStyle: preferences.hairStyle || 'classic',
    clothing: preferences.clothing || 'sport',
    skinZones: {
      body: preferences.skinBody ?? preferences.skin ?? c.skin,
      hands: preferences.skinHands ?? preferences.skinBody ?? preferences.skin ?? c.skin,
      legs: preferences.skinLegs ?? preferences.skinBody ?? preferences.skin ?? c.skin
    }
  };
  scene.add(p);
  return p;
}

function updateCharacterAppearance(player, preferences = {}) {
  if (!player) return player;
  const characterId = player.userData.characterId || 'sonic';
  const base = MGO_CHARACTERS[characterId] || MGO_CHARACTERS.sonic;
  const c = mergeCharacterPreferences({ ...preferences, base: characterId, type: base.type });
  player.userData.characterPreferences = { ...preferences };

  // Rebuild only the visual layer. Movement/game state survives because the
  // replacement preserves transform and gameplay flags.
  const scene = player.parent;
  if (!scene) return player;
  return replacePlayerCharacter(scene, player, characterId, preferences);
}

function replacePlayerCharacter(scene, oldPlayer, characterId = 'sonic', preferences = {}) {
  const pos = oldPlayer.position.clone();
  const rot = oldPlayer.rotation.clone();
  const scale = oldPlayer.scale.clone();
  const visible = oldPlayer.visible;
  const oldUserData = { ...oldPlayer.userData };

  scene.remove(oldPlayer);
  const next = createPlayer(scene, characterId, preferences);
  next.position.copy(pos);
  next.rotation.copy(rot);
  if (preferences.bodyScale !== undefined || preferences.heightScale !== undefined) {
    next.scale.set(Number(preferences.bodyScale ?? 1), Number(preferences.heightScale ?? 1), Number(preferences.bodyScale ?? 1));
  } else next.scale.copy(scale);
  next.visible = visible;
  next.userData = { ...next.userData, ...oldUserData, characterId, characterPreferences: { ...preferences }, renderParts: next.userData.renderParts, headGroup: next.userData.headGroup, editorScales: next.userData.editorScales, baseScaleY: next.userData.baseScaleY };
  return next;
}

function applyRivalCharacters(rivals, chosenId) {
  const ids = MGO_CHARACTER_IDS.filter(id => id !== chosenId);
  rivals.forEach((r, i) => {
    const id = ids[i % ids.length];
    const pos = r.position.clone();
    const vis = r.visible;
    const next = replacePlayerCharacter(r.parent || r.scene || window.scene, r, id);
    next.position.copy(pos);
    next.visible = vis;
    next.userData.rival = true;
    next.userData.raceSpeed = r.userData.raceSpeed;
    rivals[i] = next;
  });
}

function updatePlayer(player, keys, dt, yaw, toast) {
  const u = player.userData;
  u.cool = Math.max(0, (u.cool || 0) - dt);
  u.runTime = (u.runTime || 0) + dt;
  const forward = new THREE.Vector3(Math.sin(yaw), 0, Math.cos(yaw));
  const right = new THREE.Vector3(Math.cos(yaw), 0, -Math.sin(yaw));
  const move = new THREE.Vector3();
  if (keys.KeyW) move.add(forward);
  if (keys.KeyS) move.sub(forward);
  if (keys.KeyD) move.add(right);
  if (keys.KeyA) move.sub(right);
  const moving = move.lengthSq() > 0;
  if (moving) {
    move.normalize();
    const speed = (keys.ShiftLeft || keys.ShiftRight) ? 11 : 6;
    player.position.addScaledVector(move, speed * dt);
    player.rotation.y = Math.atan2(move.x, move.z);
  }
  if (keys.Space && u.ground) { u.vy = 8.5; u.ground = false; }
  u.vy -= 22 * dt;
  player.position.y += u.vy * dt;
  if (player.position.y <= .1) { player.position.y = .1; u.vy = 0; u.ground = true; }
  player.position.x = THREE.MathUtils.clamp(player.position.x, -105, 105);
  player.position.z = THREE.MathUtils.clamp(player.position.z, -105, 105);
  const stride = moving ? Math.sin(u.runTime * 12) * .48 : 0;
  if (u.l) u.l.rotation.x = stride;
  if (u.r) u.r.rotation.x = -stride;
  if (u.leftArm) u.leftArm.rotation.x = -stride * .72;
  if (u.rightArm) u.rightArm.rotation.x = stride * .72;
  if (keys.KeyC && !u.slide) { u.slide = .45; toast('SLIDE!'); }
  const baseScaleY = Number(u.baseScaleY ?? u.editorScales?.heightScale ?? 1);
  if (u.slide > 0) { u.slide -= dt; player.scale.y = THREE.MathUtils.lerp(player.scale.y, baseScaleY * .72, .22); }
  else player.scale.y = THREE.MathUtils.lerp(player.scale.y, baseScaleY, .18);
}
