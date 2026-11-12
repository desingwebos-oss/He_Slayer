// DemogorgonAI.js - FSM: PATRULLA -> INVESTIGA (sonido) -> PERSECUCION -> ATAQUE
// Generador procedural 3D: cuerpo delgado, brazos largos con garras, cabeza flor de 5-6 petalos que se abre al cazar.
import * as THREE from 'three';
export const MONSTER_CONFIG={
  0:{scale:1.25, speed:2.6, detect:14, hear:9, roar:false, label:'Acechador'},
  1:{scale:1.55, speed:3.4, detect:18, hear:13, roar:false, label:'Cazador'},
  2:{scale:1.9, speed:4.2, detect:22, hear:16, roar:false, label:'Depredador'},
  3:{scale:2.5, speed:5.0, detect:28, hear:20, roar:true, label:'Coloso Alfa'},
};
export class DemogorgonAI {
  constructor(scene, levelIdx, audio){
    this.scene=scene; this.levelIdx=levelIdx; this.cfg=MONSTER_CONFIG[levelIdx]; this.audio=audio;
    this.state='PATROL'; this.chasing=false; this.target=null; this.roared=false;
    this.health=100; this.stun=0; this.maxHealth=100;
    this.buildMesh();
  }
  takeDamage(dmg, fromPos){ this.health=Math.max(0,this.health-dmg); this.lastHitDead=this.health<=0; this.stun=0.8; if(this.audio) this.audio.roar(); const s=this.cfg.scale; this.group.scale.setScalar(s*1.08); setTimeout(()=>{ if(this.group) this.group.scale.setScalar(s); },150); if(this.health<=0){ this.health=this.maxHealth; const mp=this.group.position; mp.x+=8; mp.z+=8; } return this.health; }
  flashHit(){ this.group.traverse(o=>{ if(o.isMesh&&o.material&&o.material.emissive){ if(o._e===undefined) o._e=o.material.emissive.getHex(); o.material.emissive.setHex(0xaa0000); } }); setTimeout(()=>{ if(this.group) this.group.traverse(o=>{ if(o.isMesh&&o._e!==undefined) o.material.emissive.setHex(o._e); }); },110); }
  buildMesh(){
    const mat=(c,e=0x000000)=>new THREE.MeshStandardMaterial({color:c, emissive:e, roughness:0.85});
    const g=new THREE.Group();
    const bodyMat=mat(0x3a3a3a);
    const body=new THREE.Mesh(new THREE.CylinderGeometry(0.45,0.6,1.8,8),bodyMat); body.position.y=1.6; g.add(body);
    const torso=new THREE.Mesh(new THREE.SphereGeometry(0.6,12,12),bodyMat); torso.position.y=2.6; g.add(torso);
    [-0.8,0.8].forEach(x=>{ const arm=new THREE.Mesh(new THREE.CylinderGeometry(0.12,0.08,2.2,6),bodyMat); arm.position.set(x,2,0); arm.rotation.z=x>0?-0.2:0.2; g.add(arm); for(let i=0;i<3;i++){ const claw=new THREE.Mesh(new THREE.ConeGeometry(0.05,0.4,6),mat(0xdddddd)); claw.position.set(x,0.9,0.15+i*0.12); claw.rotation.x=Math.PI; g.add(claw); } });
    [-0.25,0.25].forEach(x=>{ const leg=new THREE.Mesh(new THREE.CylinderGeometry(0.15,0.12,1.4,6),bodyMat); leg.position.set(x,0.7,0); g.add(leg); });
    this.petals=[]; this.head=new THREE.Group(); this.head.position.y=3.1; g.add(this.head);
    // Cabeza flor: 5 petalos (en v1 usamos 6 para que se vea mas, mismo concepto)
    for(let i=0;i<6;i++){ const a=i/6*Math.PI*2; const petal=new THREE.Mesh(new THREE.ConeGeometry(0.3,0.9,6),mat(0x6a2a2a)); petal.position.set(Math.cos(a)*0.3,0.3,Math.sin(a)*0.3); petal.rotation.z=Math.cos(a)*0.8; petal.rotation.x=-Math.sin(a)*0.8; this.head.add(petal); this.petals.push(petal); }
    const mouth=new THREE.Mesh(new THREE.SphereGeometry(0.25,10,10),mat(0x111111)); mouth.position.y=0.1; this.head.add(mouth);
    const eyeL=new THREE.Mesh(new THREE.SphereGeometry(0.08,10,10),mat(0xff0000,0xff0000)); eyeL.position.set(-0.2,3.3,0.4); g.add(eyeL);
    const eyeR=eyeL.clone(); eyeR.position.x=0.2; g.add(eyeR);
    if(this.levelIdx>=2){ for(let i=0;i<30;i++){ const p=new THREE.Mesh(new THREE.SphereGeometry(0.08,8,8),mat(0x8a2a8a,0x8a2a8a)); p.position.set((Math.random()*2-1),Math.random()*4,(Math.random()*2-1)); g.add(p); } }
    g.scale.setScalar(this.cfg.scale);
    g.position.set(18,0,-12);
    this.group=g; this.scene.add(g);
  }
  distTo(playerPos){ return Math.hypot(this.group.position.x-playerPos.x, this.group.position.z-playerPos.z); }
  update(dt, player, colliders){
    const f=dt/16.667; const mp=this.group.position; const pp=(player.pos||player.camera.position);
    const dist=this.distTo(pp);
    // VISION: Si la linterna esta apagada, ¡el monstruo NO te ve!
    // Solo puede verte si la linterna esta encendida, o si estas a menos de 2.0m de contacto fisico
    let sees = false;
    if(!player.hidden){
      if(player.lightOn){
        sees = dist < this.cfg.detect;
      } else {
        sees = dist < 2.0;
      }
    }
    // OIDO: Oye pasos si corres o caminas de pie cerca. Si estas agachado o quieto, no te oye.
    const hears = !player.hidden && player.moving && !player.crouching && dist < (player.sprint ? this.cfg.hear : this.cfg.hear * 0.35);
    const wasChasing = this.chasing;

    // Si te perseguia y apagas la linterna y te alejas > 4.5m o te agachas: ¡pierde el rastro!
    if(wasChasing && !player.lightOn && (dist > 4.5 || player.crouching || player.hidden)){
      this.chasing = false;
      this.state = 'INVESTIGATE';
    } else {
      this.chasing = sees || hears;
    }

    if(this.chasing){
      this.state='CHASE';
      if(!wasChasing){
        if(this.levelIdx===3) this.audio.roar();
        else if(this.levelIdx===0) this.audio.click();
        else this.audio.roar();
      }
    } else if(hears || (wasChasing && !this.chasing)){
      this.state='INVESTIGATE';
    } else if(this.state!=='PATROL' && !this.chasing){
      this.state='PATROL';
    }
    if(this.stun>0){ this.stun-=dt/1000; this.group.rotation.y+=0.05; return {dist, chasing:false, state:'STUNNED', health:this.health}; }
    // Movimiento
    let ms=(this.cfg.speed*0.02 + (this.chasing?0.02:0))*f;
    if(this.chasing){
      const dx=pp.x-mp.x, dz=pp.z-mp.z, d=Math.hypot(dx,dz)||1;
      // Embestida Nv3 en pasillos
      if(this.levelIdx===2 && dist>8 && Math.random()<0.005){ mp.x+=(pp.x-mp.x)*0.3; mp.z+=(pp.z-mp.z)*0.3; }
      const nmx=mp.x+dx/d*ms*2.2, nmz=mp.z+dz/d*ms*2.2;
      const collide=(nx,nz)=>colliders.some(c=>nx>c.minX-0.45&&nx<c.maxX+0.45&&nz>c.minZ-0.45&&nz<c.maxZ+0.45);
      if(!collide(nmx,mp.z)) mp.x=nmx; if(!collide(mp.x,nmz)) mp.z=nmz;
    } else {
      if(!this.target || Math.hypot(this.target.x-mp.x,this.target.z-mp.z)<2) this.target={x:Math.random()*40-20, z:Math.random()*40-20};
      const dx=this.target.x-mp.x, dz=this.target.z-mp.z, d=Math.hypot(dx,dz)||1; mp.x+=dx/d*ms; mp.z+=dz/d*ms;
    }
    this.group.rotation.y=Math.atan2(pp.x-mp.x, pp.z-mp.z);
    this.petals.forEach((p,i)=>{ const target=this.chasing?1.4:0.4; p.rotation.z+=((Math.cos(i)*target)-p.rotation.z)*0.08; });
    if(dist<15 && Math.random()<0.02) this.audio.heartbeat(1-dist/20);
    return {dist, chasing:this.chasing, state:this.state, health:this.health};
  }
}
