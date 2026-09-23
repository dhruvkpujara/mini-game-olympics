const EVENTS=['SKY SPRINT','TARGET MAYHEM','PENALTY KINGS','MEMORY MAYHEM','TOWER BALANCE'];let ei=0,et=12,tt=0;
function showToast(s){const e=document.querySelector('#toast');e.textContent=s;e.style.opacity=1;tt=1}
function updateUI(p,dt,inRace=false,inTarget=false,inPenalty=false){
  if(!inRace&&!inTarget&&!inPenalty){
    et-=dt;
    if(et<=0){ei=(ei+1)%EVENTS.length;et=12;showToast('EVENT READY: '+EVENTS[ei])}
    document.querySelector('#eventName').textContent=EVENTS[ei];
    document.querySelector('#timer').textContent=Math.ceil(et);
  }else{
    document.querySelector('#timer').textContent=inPenalty?'PENALTY':(inTarget?'TARGET':'RACE');
  }
  const x=p.position.x,z=p.position.z;
  let v='Olympic Plaza';
  if(z<-35&&x>-30&&x<30)v='Main Olympic Stadium';
  else if(z<-35&&x<-30)v='Athletics Centre';
  else if(z<-25&&x>30)v='Football Arena';
  else if(z>25&&x>30)v='Challenge Arena';
  else if(z>25&&x<-30)v='Racing Circuit';
  else if(z>65&&x<-30)v='Athlete Village';
  if(!inRace&&!inTarget)document.querySelector('#venue b').textContent=v;
  tt-=dt;
  if(tt<=0)document.querySelector('#toast').style.opacity=0;
}