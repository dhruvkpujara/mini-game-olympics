// Optional background GLB character loader.
// The game never blocks on this asset: player.js always has a procedural fallback.
window.MGO_GLTF_READY=(async()=>{
  try{
    if(!window.THREE?.GLTFLoader)throw new Error('GLTFLoader is unavailable');
    const loader=new THREE.GLTFLoader();
    loader.setCrossOrigin('anonymous');
    const url='https://raw.githubusercontent.com/programasweights/avatar/main/public/assets/character.glb';
    const gltf=await Promise.race([
      loader.loadAsync(url),
      new Promise((_,reject)=>setTimeout(()=>reject(new Error('GLB load timeout')),7000))
    ]);
    const template=gltf.scene;
    template.traverse(o=>{
      if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}
    });
    window.MGO_GLTF={
      template,
      animations:gltf.animations||[],
      clone:()=>{
        if(THREE.SkeletonUtils?.clone)return THREE.SkeletonUtils.clone(template);
        return template.clone(true);
      }
    };
    return window.MGO_GLTF;
  }catch(err){
    console.warn('[Mini Game Olympics GLB]',err);
    window.MGO_GLTF=null;
    return null;
  }
})();