function createPlayer(scene){const p=new THREE.Group(),body=new THREE.MeshStandardMaterial({color:0x2458d6,roughness:.55}),skin=new THREE.MeshStandardMaterial({color:0xb87852,roughness:.75}),dark=new THREE.MeshStandardMaterial({color:0x172331,roughness:.7}),white=new THREE.MeshStandardMaterial({color:0xf4f4f4,roughness:.45}),gold=new THREE.MeshStandardMaterial({color:0xf5c542,metalness:.3,roughness:.35});
function part(g,w,h,d,x,y,z,m){const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;g.add(o);return o}
part(p,1.25,1.75,.7,0,2.5,0,body);
const head=new THREE.Mesh(new THREE.SphereGeometry(.68,20,14),skin);head.position.y=4;head.castShadow=true;p.add(head);
part(p,1.15,.3,.92,0,4.55,.1,dark);part(p,.72,.16,.08,0,4.03,.62,dark);
part(p,.4,1.6,.4,-.88,2.5,0,body);part(p,.4,1.6,.4,.88,2.5,0,body);
const l=part(p,.46,1.75,.46,-.4,.8,0,skin),r=part(p,.46,1.75,.46,.4,.8,0,skin);
part(p,.58,.25,.95,-.4,.05,.22,white);part(p,.58,.25,.95,.4,.05,.22,white);
part(p,.6,.58,.06,0,2.65,.38,white);part(p,.6,.58,.06,0,2.65,-.38,gold);
const stripe=part(p,1.28,.18,.72,0,2.65,.36,white);stripe.material=white;
p.userData={vy:0,ground:true,slide:0,cool:0,l:l,r:r,runTime:0};scene.add(p);return p}