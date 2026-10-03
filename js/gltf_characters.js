// GLB character asset bootstrap.
// Uses Three.js GLTFLoader + SkeletonUtils and a CC0 Quaternius humanoid
// packaged by the public programasweights/avatar repository.
window.MGO_GLTF_READY=(async()=>{
  const [{GLTFLoader},{SkeletonUtils}]=await Promise.all([
    import('https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/loaders/GLTFLoader.js/+esm'),
    import('https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/utils/SkeletonUtils.js/+esm')
  ]);
  const loader=new GLTFLoader();
  const url='https://raw.githubusercontent.com/programasweights/avatar/main/public/assets/character.glb';
  const gltf=await loader.loadAsync(url);
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
})().catch(err=>{
  console.error('[Mini Game Olympics GLB]',err);
  window.MGO_GLTF=null;
  return null;
});