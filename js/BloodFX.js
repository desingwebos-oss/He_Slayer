// BloodFX.js - Sangre del monstruo: particulas con gravedad + manchas en el suelo (pool, sin crear objetos en juego)
import * as THREE from 'three';
export class BloodFX {
  constructor(scene){
    this.scene=scene; this.enabled=true; this.parts=[]; this.decals=[]; this.pi=0; this.di=0;
    const pg=new THREE.SphereGeometry(0.07,6,6);
    const mats=[0x7a0000,0x9b0a0a,0x4a0000].map(c=>new THREE.MeshBasicMaterial({color:c}));
    for(let i=0;i<140;i++){ const m=new THREE.Mesh(pg,mats[i%3]); m.visible=false; scene.add(m); this.parts.push({m,v:new THREE.Vector3(),life:0}); }
    const dg=new THREE.CircleGeometry(0.5,14);
    for(let i=0;i<40;i++){
      const mat=new THREE.MeshBasicMaterial({color:i%2?0x5a0000:0x7a0000,transparent:true,opacity:0.85,depthWrite:false});
      const d=new THREE.Mesh(dg,mat); d.visible=false; scene.add(d); this.decals.push({m:d,life:0});
    }
  }
  // pos: punto del impacto, dir: direccion del disparo, n: cantidad de gotas
  burst(pos, dir, n=16, spread=1){
    if(!this.enabled) return;
    for(let i=0;i<n;i++){
      this.pi=(this.pi+1)%this.parts.length; const p=this.parts[this.pi];
      p.m.position.set(pos.x+(Math.random()-.5)*.4, pos.y+(Math.random()-.5)*.4, pos.z+(Math.random()-.5)*.4);
      p.v.set((Math.random()-.5)*3*spread, Math.random()*3.5+1, (Math.random()-.5)*3*spread);
      if(dir) p.v.x+=dir.x*(1.5+Math.random()*3), p.v.z+=dir.z*(1.5+Math.random()*3);
      p.life=0.7+Math.random()*0.6; p.m.scale.setScalar(0.6+Math.random()*1.3); p.m.visible=true;
    }
  }
  splat(x,z,size){
    this.di=(this.di+1)%this.decals.length; const d=this.decals[this.di];
    d.m.position.set(x,0.03+Math.random()*0.01,z);
    d.m.rotation.set(-Math.PI/2,0,Math.random()*6.28);
    d.m.scale.set(size*(0.6+Math.random()*0.8), size*(0.6+Math.random()*0.8), 1);
    d.m.material.opacity=0.85; d.m.visible=true; d.life=14;
  }
  update(dt){
    const s=Math.min(dt,50)/1000;
    for(const p of this.parts){
      if(p.life<=0) continue;
      p.life-=s; p.v.y-=9.8*s;
      p.m.position.x+=p.v.x*s; p.m.position.y+=p.v.y*s; p.m.position.z+=p.v.z*s;
      if(p.m.position.y<=0.05){ p.life=0; p.m.visible=false; if(this.enabled && Math.random()<0.45) this.splat(p.m.position.x,p.m.position.z,0.25+Math.random()*0.4); }
      else if(p.life<=0) p.m.visible=false;
    }
    for(const d of this.decals){
      if(d.life<=0) continue; d.life-=s;
      if(d.life<2) d.m.material.opacity=0.85*Math.max(0,d.life)/2;
      if(d.life<=0) d.m.visible=false;
    }
  }
}
