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
      s.async=false;
      s.onload=()=>resolve();
      s.onerror=()=>reject(new Error('Failed to load '+src));
      document.body.appendChild(s);
    });
  };

  const loadFirstAvailable=(sources,label)=>{
    let lastError=null;
    const tryNext=async(i)=>{
      if(i>=sources.length)throw lastError||new Error('No available source for '+label);
      try{
        await loadScript(sources[i],label);
      }catch(err){
        lastError=err;
        console.warn('[Mini Game Olympics] source failed:',sources[i],err);
        await tryNext(i+1);
      }
    };
    return tryNext(0);
  };

  const localFiles=[
    ['js/gltf_characters.js?v=7','Loading character system...'],
    ['js/player.js?v=22','Loading player...'],
    ['js/camera.js?v=4','Loading camera...'],
    ['js/world.js?v=4','Loading Olympic Village...'],
    ['js/sky_sprint.js?v=15','Loading Sky Sprint...'],
    ['js/ui.js?v=8','Loading interface...'],
    ['js/game_state.js?v=6','Loading game state...'],
    ['js/tournament.js?v=1','Loading tournament system...'],
    ['js/main.js?v=43','Starting 3D engine...']
  ];

  async function start(){
    try{
      boot.dataset.progress='2';
      setProgress(2,'Checking 3D engine...','Loading standalone Three.js build');

      // r151 keeps the classic global build that does not require ES modules.
      await loadFirstAvailable([
        'https://cdn.jsdelivr.net/npm/three@0.151.3/build/three.min.js',
        'https://unpkg.com/three@0.151.3/build/three.min.js',
        'https://cdnjs.cloudflare.com/ajax/libs/three.js/r151/three.min.js'
      ],'Loading standalone Three.js...');

      if(!window.THREE)throw new Error('Three.js loaded but window.THREE is unavailable.');
      console.log('[Mini Game Olympics] Three.js ready:',window.THREE.REVISION);

      for(let i=0;i<localFiles.length;i++){
        const [src,label]=localFiles[i];
        const progress=Math.min(92,15+i*9);
        boot.dataset.progress=String(progress);
        setProgress(progress,label,src.split('?')[0]);
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
      fail(err.message||String(err),'The startup loader failed. The page will stay here instead of silently hanging.');
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