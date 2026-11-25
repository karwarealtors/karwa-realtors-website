/* Karwa Realtors: opening intro, shown once per browser session */
(function(){
  var d=document.documentElement;
  if(!d.classList.contains('intro-on')) return;
  var ov=document.getElementById('kr-intro');
  if(!ov||!ov.animate){end();return;}
  var bg=ov.querySelector('.ib'), lg=ov.querySelector('.il'), ln=ov.querySelector('.ln');
  var target=document.querySelector('header .logo');
  var ended=false, anims=[];
  function mark(){try{sessionStorage.setItem('kr_intro','1')}catch(e){}try{if((window.name||'').indexOf('kr_intro')<0)window.name=(window.name?window.name+' ':'')+'kr_intro'}catch(e){}}
  function end(){
    if(ended) return; ended=true; mark();
    d.classList.add('intro-out');
    setTimeout(function(){d.classList.remove('intro-on');if(ov&&ov.parentNode)ov.parentNode.removeChild(ov);
      setTimeout(function(){d.classList.remove('intro-out')},900);},20);
  }
  function skip(){
    if(ended) return;
    anims.forEach(function(a){try{a.pause()}catch(e){}});
    d.classList.add('intro-out');
    var a=ov.animate([{opacity:1},{opacity:0}],{duration:280,easing:'ease',fill:'forwards'});
    a.onfinish=end;
  }
  ov.addEventListener('click',skip);
  ov.addEventListener('touchmove',function(e){e.preventDefault()},{passive:false});
  ov.addEventListener('wheel',function(e){e.preventDefault()},{passive:false});
  var w0=window.innerWidth;
  window.addEventListener('resize',function(){ if(Math.abs(window.innerWidth-w0)>2) skip(); });
  document.addEventListener('keydown',skip,{once:true});
  function run(){
    var vw=window.innerWidth, vh=window.innerHeight;
    var W=Math.min(260, vw*0.58), H=W*(lg.naturalHeight/lg.naturalWidth||0.416);
    var L=(vw-W)/2, T=(vh-H)/2-14;
    lg.style.width=W+'px'; lg.style.left=L+'px'; lg.style.top=T+'px';
    ln.style.top=(T+H+24)+'px';
    var ease='cubic-bezier(.22,.61,.36,1)', glide='cubic-bezier(.7,0,.2,1)';
    anims.push(lg.animate([{opacity:0,transform:'translateY(10px)'},{opacity:1,transform:'translateY(0)'}],{duration:750,easing:ease,fill:'forwards'}));
    anims.push(ln.animate([{transform:'scaleX(0)'},{transform:'scaleX(1)'}],{duration:650,delay:550,easing:ease,fill:'forwards'}));
    setTimeout(function(){
      if(ended) return;
      var r=target?target.getBoundingClientRect():null;
      anims.push(ln.animate([{opacity:1},{opacity:0}],{duration:260,easing:'ease',fill:'forwards'}));
      if(r&&r.width){
        var s=r.width/W;
        anims.push(lg.animate([{transform:'translate(0,0) scale(1)'},{transform:'translate('+(r.left-L)+'px,'+(r.top-T)+'px) scale('+s+')'}],{duration:820,easing:glide,fill:'forwards'}));
      } else {
        anims.push(lg.animate([{opacity:1},{opacity:0}],{duration:400,fill:'forwards'}));
      }
      var c=bg.animate([{transform:'translateY(0)'},{transform:'translateY(-100%)'}],{duration:800,delay:180,easing:glide,fill:'forwards'});
      anims.push(c);
      setTimeout(function(){d.classList.add('intro-out')},520);
      setTimeout(function(){ if(target) target.style.opacity='1'; end(); if(target) setTimeout(function(){target.style.opacity=''},50); },1000);
    },1300);
  }
  if(lg.complete&&lg.naturalWidth) run(); else { lg.onload=run; lg.onerror=end; }
})();
