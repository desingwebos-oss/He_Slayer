// MobileControls.js v4.2 FIX PANTALLA NEGRA - Null-safe, sin tapStart
// Antes: document.getElementById('btnTapStart').onclick rompia todo si el boton no existia.
// Ahora: cada boton se revisa con if(el) antes de tocarlo.
export class MobileControls {
  constructor(){
    this.move={x:0,y:0,active:false}; this.look={x:0,y:0,active:false};
    this.run=false; this.crouch=false; this.aiming=false;
    this.isTouch='ontouchstart' in window;
    this.bindJoystick('joyMove','knobMove',this.move);
    this.bindJoystick('joyLook','knobLook',this.look);
    document.addEventListener('touchmove',e=>{
      if(e.target.closest('#home')||e.target.closest('#levels')||e.target.closest('#how')||e.target.closest('#introLevel')) return;
      e.preventDefault();
    },{passive:false});
  }
  bindJoystick(joyId, knobId, store){
    const joy=document.getElementById(joyId), knob=document.getElementById(knobId);
    if(!joy||!knob) return;
    let pid=null,cx=0,cy=0;
    const start=e=>{ const t=e.changedTouches?e.changedTouches[0]:e; pid=t.identifier!==undefined?t.identifier:'mouse'; const r=joy.getBoundingClientRect(); cx=r.left+r.width/2; cy=r.top+r.height/2; store.active=true; };
    const move=e=>{ let t=e; if(e.changedTouches){ for(const tt of e.changedTouches) if(tt.identifier===pid) t=tt; if(t.identifier!==pid) return; } else if(pid!=='mouse') return; let dx=(t.clientX-cx)/55, dy=(t.clientY-cy)/55; const l=Math.hypot(dx,dy); if(l>1){dx/=l;dy/=l;} store.x=dx; store.y=dy; knob.style.transform=`translate(${dx*32}px,${dy*32}px)`; };
    const end=()=>{ store.x=0; store.y=0; store.active=false; knob.style.transform=''; pid=null; };
    joy.addEventListener('touchstart',start,{passive:true});
    joy.addEventListener('touchmove',e=>{e.preventDefault();move(e);},{passive:false});
    joy.addEventListener('touchend',end);
    joy.addEventListener('mousedown',start); window.addEventListener('mousemove',move); window.addEventListener('mouseup',end);
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
