// MobileControls.js v4.2 FIX PANTALLA NEGRA - Null-safe, sin tapStart
// Antes: document.getElementById('btnTapStart').onclick rompia todo si el boton no existia.
// Ahora: cada boton se revisa con if(el) antes de tocarlo.
export class MobileControls {
  constructor(){
    this.move={x:0,y:0,active:false}; this.look={x:0,y:0,active:false};
    this.run=false; this.crouch=false; this.aiming=false;
    this.isTouch='ontouchstart' in window;
    this.bindJoystick('zoneMove','baseMove','knobMove',this.move,{radius:58,curve:1});
    this.bindJoystick('zoneLook','baseLook','knobLook',this.look,{radius:64,curve:1.35});
    document.addEventListener('touchmove',e=>{
      if(e.target.closest('#home')||e.target.closest('#levels')||e.target.closest('#how')||e.target.closest('#introLevel')) return;
      e.preventDefault();
    },{passive:false});
  }
  // Joystick DINAMICO: aparece donde pones el dedo dentro de su mitad de pantalla y,
  // si te alejas mas del radio, la base te sigue (nunca se "acaba" el recorrido).
  bindJoystick(zoneId, baseId, knobId, store, opt={}){
    const zone=document.getElementById(zoneId), base=document.getElementById(baseId), knob=document.getElementById(knobId);
    if(!zone||!base||!knob) return;
    const R=opt.radius||60, curve=opt.curve||1, dead=0.08;
    let pid=null, ox=0, oy=0;
    const place=()=>{ const zr=zone.getBoundingClientRect(); base.style.left=(ox-zr.left)+'px'; base.style.top=(oy-zr.top)+'px'; };
    const start=e=>{
      if(pid!==null) return;
      pid=e.pointerId; ox=e.clientX; oy=e.clientY;
      try{ zone.setPointerCapture(pid); }catch(_){}
      place(); knob.style.transform='translate(0px,0px)';
      zone.classList.add('on'); store.active=true; store.x=0; store.y=0;
      e.preventDefault();
    };
    const move=e=>{
      if(e.pointerId!==pid) return;
      let dx=e.clientX-ox, dy=e.clientY-oy; const d=Math.hypot(dx,dy);
      if(d>R){ const k=(d-R)/d; ox+=dx*k; oy+=dy*k; place(); dx=e.clientX-ox; dy=e.clientY-oy; }
      let m=Math.min(1,Math.hypot(dx,dy)/R);
      knob.style.transform=`translate(${dx}px,${dy}px)`;
      if(m<dead){ store.x=0; store.y=0; return; }
      const out=Math.pow((m-dead)/(1-dead),curve);
      const ang=Math.atan2(dy,dx);
      store.x=Math.cos(ang)*out; store.y=Math.sin(ang)*out;
      e.preventDefault();
    };
    const end=e=>{
      if(e.pointerId!==pid) return;
      pid=null; store.x=0; store.y=0; store.active=false;
      knob.style.transform=''; zone.classList.remove('on');
    };
    zone.addEventListener('pointerdown',start);
    zone.addEventListener('pointermove',move);
    zone.addEventListener('pointerup',end);
    zone.addEventListener('pointercancel',end);
    zone.addEventListener('lostpointercapture',end);
    zone.addEventListener('contextmenu',e=>e.preventDefault());
  }
  bindButtons(cb){
    const safe=(id,fn)=>{ const el=document.getElementById(id); if(!el) return; el.onclick=fn; el.addEventListener('touchstart', e=>{ e.preventDefault(); fn(); }, {passive:false}); };
    const bindHold=(id, on, off)=>{ const el=document.getElementById(id); if(!el) return; if(el._h){ el.removeEventListener('touchstart',el._h.ts); el.removeEventListener('touchend',el._h.off); el.removeEventListener('mousedown',el._h.on); el.removeEventListener('mouseup',el._h.off); } const ts=e=>{e.preventDefault(); on();}; el._h={ts,on,off}; el.addEventListener('touchstart',ts,{passive:false}); el.addEventListener('touchend',off); el.addEventListener('mousedown',on); el.addEventListener('mouseup',off); };
    bindHold('btnRun',()=>this.run=true,()=>this.run=false);
    bindHold('btnCrouch',()=>{this.crouch=true; cb.onCrouch&&cb.onCrouch(true);},()=>{this.crouch=false; cb.onCrouch&&cb.onCrouch(false);});
    bindHold('btnAim',()=>this.aiming=true,()=>this.aiming=false);
    safe('btnHide',()=>cb.onHide&&cb.onHide());
    safe('btnLight',()=>cb.onLight&&cb.onLight());
    safe('btnInteract',()=>cb.onInteract&&cb.onInteract());
    safe('btnPause',()=>cb.onPause&&cb.onPause());
    safe('btnFull',()=>this.goFullscreen());
    safe('btnFullHome',()=>this.goFullscreen());
    safe('btnView',()=>cb.onView&&cb.onView());
    safe('btnShoot',()=>cb.onShoot&&cb.onShoot());
    // tapStart YA NO EXISTE - no lo buscamos
  }
  goFullscreen(){ try{ const el=document.documentElement; if(el.requestFullscreen) el.requestFullscreen(); else if(el.webkitRequestFullscreen) el.webkitRequestFullscreen(); }catch(e){} }
  showTapStart(){ /* eliminado */ }
}
