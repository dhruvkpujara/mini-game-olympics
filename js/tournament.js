(function(global){
  const POINTS=[10,7,5,3,2,1];
  function create(events=['SKY SPRINT','TARGET MAYHEM']){
    let index=0,total=0,standings={};
    const api={
      events:[...events],
      get index(){return index},
      get current(){return events[index]},
      get complete(){return index>=events.length},
      get round(){return Math.min(index+1,events.length)},
      get totalRounds(){return events.length},
      get standings(){return standings},
      reset(){index=0;total=0;standings={};},
      start(){index=0;total=0;standings={};},
      addEventResult(rows){
        rows.forEach((row,i)=>{
          const name=row.name||('PLAYER '+(i+1));
          if(!standings[name])standings[name]={name,points:0,events:[]};
          const pts=POINTS[i]||1;
          standings[name].points+=pts;
          standings[name].events.push({event:events[index],score:row.score??row.time??0,placement:i+1,points:pts});
        });
        total++;index++;
        return api.snapshot();
      },
      snapshot(){
        return {
          round:api.round,totalRounds:events.length,current:api.current,
          complete:api.complete,
          standings:Object.values(standings).sort((a,b)=>b.points-a.points)
        };
      }
    };
    return api;
  }
  global.MGOTournament={create,POINTS};
})(typeof window!=='undefined'?window:globalThis);
