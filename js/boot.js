(()=> {
  const boot=document.getElementById('bootScreen');
  const status=document.getElementById('bootStatus');
  const bar=document.getElementById('bootProgress');
  const detail=document.getElementById('bootDetail');
  let currentScript='boot';

  const setProgress=(value,text,extra='')=>{
    if(bar)bar.style.width=Math.max(0,Math.min(100,value))+'%';
    if(status)status.textContent=text;
    if(detail)detail.textContent=extra;
  };

  const fail=(message,extra='')=>{
    if(boot)boot.classList.add('boot-error');
    setProgress(100,'GAME COULD NOT START',message);
    if(detail)detail.textContent=extra||'Open the browser console for technical details.';
  };

  const loadScript=(src,label)=>{
    return new Promise((resolve,reject)=>{
      setProgress(Number(boot?.dataset.progress||0),label);
      const s=document.createElement('script');
      currentScript=src;
      s.src=src;
      s.onload=()=>resolve();
      s.onerror=()=>reject(new Error('Failed to load '+src));
      document.body.appendChild(s);
    });
  };

  const localFiles=[
    ['js/player.js?v=9','Loading player...'],
    ['js/camera.js?v=3','Loading camera...'],
    ['js/world.js?v=3','Loading Olympic Village...'],
    ['js/sky_sprint.js?v=12','Loading Sky Sprint...'],
    ['js/ui.js?v=5','Loading interface...'],
    ['js/game_state.js?v=3','Loading game state...'],
    ['js/tournament.js?v=1','Loading tournament system...'],
    ['js/main.js?v=25','Starting 3D engine...']
  ];

  async function start(){
    try{
      boot.dataset.progress='5';
      setProgress(5,'Checking 3D engine...','Loading Three.js');
      try{
        await loadScript('https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.min.js','Loading Three.js...');
      }catch(primary){
        setProgress(12,'Trying backup 3D engine...','Primary CDN unavailable');
        await loadScript('https://unpkg.com/three@0.160.0/build/three.min.js','Loading backup Three.js...');
      }
      if(!window.THREE)throw new Error('Three.js loaded but the THREE global is missing.');

      for(let i=0;i<localFiles.length;i++){
        const [src,label]=localFiles[i];
        boot.dataset.progress=String(15+i*12);
        setProgress(15+i*12,label,src.split('?')[0]);
        await loadScript(src,label);
      }

      if(!window.MGO_DEBUG)throw new Error('Game engine loaded without its debug interface.');
      setProgress(100,'READY!','Launching Olympic Village');
      setTimeout(()=>{
        document.body.classList.add('game-ready');
        if(boot)boot.setAttribute('aria-hidden','true');
      },250);
    }catch(err){
      console.error('[Mini Game Olympics boot]',err);
      fail(err.message||String(err),'Check your network connection and browser console. The loader stopped before the game was ready.');
    }
  }

  window.addEventListener('error',event=>{
    const message=event.error?.stack||event.message||'Unknown script error';
    console.error('[Mini Game Olympics error]',message);
    if(!document.body.classList.contains('game-ready')){
      fail('Failed while loading '+currentScript,message);
    }
  });

  window.addEventListener('unhandledrejection',event=>{
    const reason=event.reason?.stack||event.reason?.message||String(event.reason||'Unknown promise error');
    console.error('[Mini Game Olympics promise error]',reason);
    if(!document.body.classList.contains('game-ready'))fail('Startup promise failed while loading '+currentScript,reason);
  });

  start();
})();