(function(global){
  const STATES=Object.freeze({
    CHARACTER_SELECT:'CHARACTER_SELECT',
    VILLAGE_INTRO:'VILLAGE_INTRO',
    HUB:'HUB',
    SKY_COUNTDOWN:'SKY_COUNTDOWN',
    SKY_SPRINT:'SKY_SPRINT',
    RACE_RESULTS:'RACE_RESULTS',
    TARGET_MAYHEM:'TARGET_MAYHEM',
    TARGET_RESULTS:'TARGET_RESULTS',PENALTY_KINGS:'PENALTY_KINGS',PENALTY_RESULTS:'PENALTY_RESULTS'
  });
  function create(initial=STATES.HUB){
    let current=initial,age=0;
    if(!STATES[current])throw new Error('Unknown game state: '+current);
    return {
      states:STATES,
      get state(){return current},
      get age(){return age},
      set(next){
        if(!STATES[next])throw new Error('Unknown game state: '+next);
        if(next!==current){current=next;age=0;}
      },
      tick(dt){age+=Math.max(0,Number(dt)||0)}
    };
  }
  global.MGOGameState={STATES,create};
})(typeof window!=='undefined'?window:globalThis);
