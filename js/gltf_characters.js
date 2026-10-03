// Background GLB character loader.
// The game must never block on a remote 3D asset: if the CDN/model is unavailable,
// player.js immediately falls back to its built-in 3D athletes.
window.MGO_GLTF_READY=(async()=>{
  try{
    const [{GLTFLoader},{SkeletonUtils}]=await Promise.all([
      import('three/addons/loaders/GLTFLoader.js'),
      import('three/addons/utils/SkeletonUtils.js')
    ]);
    const loader=new GLTFLoader();
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
      clone:()=>SkeletonUtils.clone(template)
    };
    return window.MGO_GLTF;
  }catch(err){
    console.warn('[Mini Game Olympics GLB]',err);
    window.MGO_GLTF=null;
    return null;
  }
})();