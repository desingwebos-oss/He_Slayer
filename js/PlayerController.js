import * as THREE from 'three';
// PlayerController.js v3 - TERCERA PERSONA estilo Resident Evil 4
// Camara al hombro detras de Helena, a corta distancia. Helena se ve siempre.
// Movimiento relativo a la camara. Joystick izquierdo mueve, derecho gira camara.
export class PlayerController {
  constructor(camera, flash, mobile, audio, character, flashGlow){
    this.camera=camera; this.flash=flash; this.flashGlow=flashGlow; this.mobile=mobile; this.audio=audio; this.character=character;
    this.yaw=Math.PI; this.pitch=0.12; this.pos=new THREE.Vector3(0,0,36);
    // character.group es la posicion real, pos es alias para compatibilidad
    this.stamina=100; this.battery=100; this.lightOn=true; this.hidden=false; this.crouching=false;
    this.lives=3; this.inventory=[]; this.keysGot=0; this.gensGot=0; this.moving=false; this.sprint=false;
    this.keys={}; this.invuln=0; this.aiming=false; this.view='third';
    this.onKeyDown=e=>{ const k=e.key.toLowerCase(); this.keys[k]=true; if(k==='f') this.toggleLight(); if(k==='e') this.onInteract&&this.onInteract(); if(k==='p') this.onPause&&this.onPause(); if(k==='v') this.onView&&this.onView(); if(k==='b') this.onBlood&&this.onBlood(); if(k==='shift') this.aiming=true; };
    this.onKeyUp=e=>{ const k=e.key.toLowerCase(); this.keys[k]=false; if(k==='control') this.crouching=false; if(k==='shift') this.aiming=false; };
    window.addEventListener('keydown',this.onKeyDown); window.addEventListener('keyup',this.onKeyUp);
    // Estado inicial visual boton linterna
    const b=document.getElementById('btnLight'); if(b) b.classList.toggle('on', this.lightOn);
  }
  toggleLight(){
    if(this.battery<=0) return;
    this.lightOn=!this.lightOn;
    this.audio.beep(this.lightOn?980:440);
    if(this.flash) this.flash.visible=this.lightOn;
    if(this.flashGlow) this.flashGlow.visible=this.lightOn;
    const b=document.getElementById('btnLight'); if(b) b.classList.toggle('on', this.lightOn);
    if(window.toast) window.toast(this.lightOn ? '🔦 Linterna ENCENDIDA (El monstruo te ve)' : '🔦 Linterna APAGADA (Modo Sigilo: el monstruo NO te ve)');
  }
  toggleHide(canHide){ if(canHide||this.hidden){ this.hidden=!this.hidden; this.audio.beep(this.hidden?500:700); return true; } return false; }
  addKey(name){ this.keysGot++; this.inventory.push(name||'Llave'); this.audio.beep(880); }
  addGen(){ this.gensGot++; }
  collide(nx,nz,colliders){ for(const c of colliders){ if(nx>c.minX-0.45 && nx<c.maxX+0.45 && nz>c.minZ-0.45 && nz<c.maxZ+0.45) return true; } if(nx<-57||nx>57||nz<-57||nz>57) return true; return false; }
  update(dt, colliders){
    const f=dt/16.667;
    let fwd=0, strafe=0;
    if(this.keys['w']||this.keys['arrowup']) fwd+=1; if(this.keys['s']||this.keys['arrowdown']) fwd-=1;
    if(this.keys['a']) strafe-=1; if(this.keys['d']) strafe+=1;
    if(this.keys['arrowleft']) this.yaw+=0.03*f; if(this.keys['arrowright']) this.yaw-=0.03*f;
    if(this.keys['control']) this.crouching=true;
    if(this.mobile.move.active){ fwd+=-this.mobile.move.y; strafe+=this.mobile.move.x; }
    if(this.mobile.look.active){ this.yaw-=this.mobile.look.x*0.055*f; this.pitch-=this.mobile.look.y*0.04*f; const pl=this.view==='first'?[-0.8,0.8]:[-0.25,0.45]; this.pitch=Math.max(pl[0],Math.min(pl[1],this.pitch)); }
    this.aiming = this.keys['shift'] || this.mobile.aiming || false;
    let len=Math.hypot(fwd,strafe); if(len>1){fwd/=len;strafe/=len;} this.moving=len>0.08;
    const wantRun=(this.keys['shift']&&!this.aiming||this.mobile.run)&&this.moving;
    this.sprint=wantRun&&this.stamina>0;
    this.stamina=wantRun?Math.max(0,this.stamina-0.5*f):Math.min(100,this.stamina+0.35*f);
    let sp=(this.sprint?0.16:0.09)*f; if(this.hidden) sp*=0.3; if(this.crouching) sp*=0.55; if(this.aiming) sp*=0.6;
    // Movimiento relativo a yaw de camara
    const fx=Math.sin(this.yaw), fz=Math.cos(this.yaw), sx=-Math.cos(this.yaw), sz=Math.sin(this.yaw);
    const mx=(fx*fwd+sx*strafe)*sp*2.2, mz=(fz*fwd+sz*strafe)*sp*2.2;
    const cur=this.character?this.character.group.position:this.pos;
    const nx=cur.x+mx, nz=cur.z+mz;
    if(!this.collide(nx,cur.z,colliders)) cur.x=nx;
    if(!this.collide(cur.x,nz,colliders)) cur.z=nz;
    cur.x=Math.max(-57,Math.min(57,cur.x)); cur.z=Math.max(-57,Math.min(57,cur.z));
    // Helena mira hacia donde caminas / hacia la camara
    if(this.character){
      this.character.group.position.copy(cur);
      if(this.moving) this.character.group.rotation.y=Math.atan2(mx,mz);
      else this.character.group.rotation.y=this.yaw;
      this.character.group.visible=(this.view!=='first');
      this.character.update(dt, this.moving, this.aiming);
    }
    // VISTA: primera persona (ves el arma) o tercera (ves a Helena)
    if(this.view==='first'){
      const eye=1.65+(this.crouching?-0.45:0)+(this.hidden?-0.5:0);
      this.camera.position.set(cur.x+Math.sin(this.yaw)*0.15, eye, cur.z+Math.cos(this.yaw)*0.15);
      this.camera.lookAt(cur.x+Math.sin(this.yaw)*4, eye+Math.tan(this.pitch)*4, cur.z+Math.cos(this.yaw)*4);
    } else {
    // CAMARA RE4: detras del hombro, corta distancia
    const shoulderX = this.aiming?0.45:0.55;
    const backDist = this.aiming?2.2:3.8;
    const camH = 2.1 + this.pitch*1.2;
    const camX = cur.x - Math.sin(this.yaw)*backDist + Math.cos(this.yaw)*shoulderX;
    const camZ = cur.z - Math.cos(this.yaw)*backDist - Math.sin(this.yaw)*shoulderX;
    const camY = camH + (this.crouching?-0.4:0) + (this.hidden?-0.5:0);
    // Evitar que la camara atraviese paredes: si hay collider cerca, acercarla
    let finalDist=backDist;
    for(const c of colliders){ if(camX>c.minX-0.3&&camX<c.maxX+0.3&&camZ>c.minZ-0.3&&camZ<c.maxZ+0.3){ finalDist=1.2; break; } }
    if(finalDist!==backDist){
      this.camera.position.set(cur.x - Math.sin(this.yaw)*finalDist + Math.cos(this.yaw)*shoulderX, camY, cur.z - Math.cos(this.yaw)*finalDist - Math.sin(this.yaw)*shoulderX);
    } else {
      this.camera.position.set(camX, camY, camZ);
    }
    // La camara mira un poco adelante de Helena, no a su cabeza
    const lookX=cur.x + Math.sin(this.yaw)*4, lookY=1.5 + this.pitch*2, lookZ=cur.z + Math.cos(this.yaw)*4;
    this.camera.lookAt(lookX, lookY, lookZ);
    }
    const tf=(this.view==='first'&&this.aiming)?55:75; if(Math.abs(this.camera.fov-tf)>0.1){ this.camera.fov+=(tf-this.camera.fov)*0.2; this.camera.updateProjectionMatrix(); }
    // Compat: pos apunta a Helena para que Demogorgon y pickups sigan funcionando
    this.pos.copy(cur); this.pos.y=1.7;
    // Linterna desde Helena hacia adelante
    if(this.flash){
      this.flash.position.set(cur.x, 1.6, cur.z);
      this.flash.target.position.set(cur.x+fx*12, 1.2+this.pitch*2.5, cur.z+fz*12);
      this.flash.target.updateMatrixWorld();
      this.flash.visible=this.lightOn&&this.battery>0;
      if(this.flashGlow){
        this.flashGlow.position.set(cur.x, 1.6, cur.z);
        this.flashGlow.visible=this.lightOn&&this.battery>0;
      }
    }
    if(this.lightOn&&this.battery>0){
      this.battery=Math.max(0,this.battery-0.015*f);
      if(this.battery===0){
        this.lightOn=false;
        if(this.flash) this.flash.visible=false;
        if(this.flashGlow) this.flashGlow.visible=false;
        const b=document.getElementById('btnLight'); if(b) b.classList.remove('on');
      }
    }
    if(this.invuln>0) this.invuln-=f;
    if(this.moving&&Math.random()<0.03) this.audio.noise(0.05,0.03);
    return {fx,fz};
  }
  destroy(){ window.removeEventListener('keydown',this.onKeyDown); window.removeEventListener('keyup',this.onKeyUp); }
}
