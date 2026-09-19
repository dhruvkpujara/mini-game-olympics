const scene=new THREE.Scene();scene.background=new THREE.Color(0xbfe7ff);scene.fog=new THREE.Fog(0xbfe7ff,80,220);
const camera=new THREE.PerspectiveCamera(58,innerWidth/innerHeight,.1,500);
const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.shadowMap.enabled=true;document.querySelector('#game').appendChild(renderer.domElement);
scene.add(new THREE.HemisphereLight(0xffffff,0x65815d,2.2));const sun=new THREE.DirectionalLight(0xffffff,3);sun.position.set(60,90,35);sun.castShadow=true;scene.add(sun);
const world=createWorld(scene),race=createSkySprint(scene),player=createPlayer(scene);player.position.set(0,.1,22);
const keys={};addEventListener('keydown',e=>keys[e.code]=true);addEventListener('keyup',e=>keys[e.code]=false);
let yaw=.25,pitch=.48,drag=false,lx=0,ly=0;renderer.domElement.onmousedown=e=>{drag=true;lx=e.clientX;ly=e.clientY};addEventListener('mouseup',()=>drag=false);addEventListener('mousemove',e=>{if(!drag)return;yaw-=(e.clientX-lx)*.006;pitch=Math.max(.2,Math.min(1.05,pitch-(e.clientY-ly)*.004));lx=e.clientX;ly=e.clientY});
let skyCountdown=8,returnTimer=0,elapsed=0;const clock=new THREE.Clock();
function setRaceVisible(v){document.querySelector('#raceHud').style.display=v?'block':'none';document.querySelector('#raceBoard').style.display=v?'block':'none'}
function updateRaceHUD(){const h=document.querySelector('#raceHud'),b=document.querySelector('#raceBoard');if(!race.active&&!race.finished){h.style.display='block';b.style.display='none';document.querySelector('#raceState').textContent='Starting in '+Math.ceil(skyCountdown)+'s';document.querySelector('#raceTime').textContent='GET READY';document.querySelector('#raceCheckpoint').textContent='SKY COURSE · 8 CHECKPOINTS';return}setRaceVisible(true);document.querySelector('#raceState').textContent=race.finished?'FINISHED!':'RACE LIVE';document.querySelector('#raceTime').textContent=race.finished?race.time.toFixed(2)+'s':race.time.toFixed(2)+'s';document.querySelector('#raceCheckpoint').textContent='CHECKPOINT '+race.checkpoint+' / 8';if(race.finished){const board=skySprintLeaderboard(race.time);b.innerHTML='<b>LEADERBOARD</b>'+board.slice(0,6).map((x,i)=>'<div class="race-row '+(x.name==='YOU'?'you':'')+'"><span>'+(i+1)+'. '+x.name+'</span><span>'+x.time.toFixed(2)+'s</span></div>').join('')}}
function loop(){requestAnimationFrame(loop);const dt=Math.min(clock.getDelta(),.05);elapsed+=dt;
  if(!race.active&&!race.finished){skyCountdown-=dt;if(skyCountdown<=0){startSkySprint(player,race);showToast('GO! RUN TO THE FINISH!');setRaceVisible(true)}}
  if(race.active)updateSkySprint(player,keys,dt,yaw,race,showToast);else if(!race.finished)updatePlayer(player,keys,dt,yaw,showToast);
  if(race.finished){returnTimer+=dt;if(returnTimer>6){race.finished=false;returnTimer=0;skyCountdown=12;player.position.set(0,.1,22);setRaceVisible(false);showToast('Back to Olympic Plaza')}}
  updateCamera(camera,player,yaw,race.active?.28:pitch);
  world.athletes.forEach((a,i)=>{a.position.x+=Math.sin(elapsed*(.35+i*.05)+i)*dt*.7;a.position.z+=Math.cos(elapsed*(.3+i*.05)+i)*dt*.55});
  updateUI(player,dt);updateRaceHUD();renderer.render(scene,camera)
}
try{loop()}catch(err){console.error(err);const e=document.createElement('div');e.style='position:fixed;inset:20px;background:#200;color:#fff;padding:20px;z-index:99;font:16px monospace;white-space:pre-wrap';e.textContent='GAME ERROR\\n'+err.stack;document.body.appendChild(e)}
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});