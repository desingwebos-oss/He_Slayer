// LevelManager.js v4.2 - Niveles REALES 1-4
import * as THREE from 'three';
import { buildLevel1, LEVEL1_META } from './levels/Level1_Mansion.js';
import { buildLevel2, LEVEL2_META } from './levels/Level2_Escuela.js';
import { buildLevel3, LEVEL3_META } from './levels/Level3_Hospital.js';
import { buildLevel4, LEVEL4_META } from './levels/Level4_Pueblo.js';
import { Textures, matWithTex } from './Textures.js';
export const LEVELS=[
  {...LEVEL1_META, keys:3, gens:0, monster:{scale:1.25}, mission:'3 llaves + Puerta dorada'},
  {...LEVEL2_META, keys:3, gens:0, monster:{scale:1.55}, mission:'3 llaves + Puerta dorada'},
  {...LEVEL3_META, keys:2, gens:2, monster:{scale:1.9}, mission:'2 llaves + 2 generadores'},
  {...LEVEL4_META, keys:1, gens:4, monster:{scale:2.5}, mission:'1 llave + 4 generadores'},
];
export const helpers={
  mat:(c,e=0x000000)=>new THREE.MeshStandardMaterial({color:c, emissive:e, roughness:0.85, metalness:0.05}),
  box(scene,w,h,d,c,x,y,z,collide,colliders){ const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d), this.mat(c)); m.position.set(x,y,z); m.castShadow=true; m.receiveShadow=true; scene.add(m); if(collide) colliders.push({minX:x-w/2,maxX:x+w/2,minZ:z-d/2,maxZ:z+d/2}); return m; },
  cyl(scene,rt,rb,h,c,x,y,z,seg=10){ const m=new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,seg), this.mat(c)); m.position.set(x,y,z); m.castShadow=true; scene.add(m); return m; },
  cone(scene,r,h,c,x,y,z,seg=8){ const m=new THREE.Mesh(new THREE.ConeGeometry(r,h,seg), this.mat(c)); m.position.set(x,y,z); m.castShadow=true; scene.add(m); return m; },
  sph(scene,r,c,x,y,z,e=0x000000){ const m=new THREE.Mesh(new THREE.SphereGeometry(r,16,16), this.mat(c,e)); m.position.set(x,y,z); m.castShadow=true; scene.add(m); return m; },
};
export class LevelManager {
  constructor(scene){ this.scene=scene; this.colliders=[]; this.flickerLights=[]; this.pickups=[]; this.generators=[]; this.hideSpots=[]; }
  load(idx){
    this.colliders=[]; this.flickerLights=[]; this.pickups=[]; this.generators=[]; this.hideSpots=[];
    const ground=new THREE.Mesh(new THREE.PlaneGeometry(140,140), matWithTex(Textures.grass, 0xffffff, 1)); ground.rotation.x=-Math.PI/2; ground.receiveShadow=true; this.scene.add(ground);
    let data=null;
    if(idx===0) data=buildLevel1(this.scene, helpers);
    else if(idx===1) data=buildLevel2(this.scene, helpers);
    else if(idx===2) data=buildLevel3(this.scene, helpers);
    else if(idx===3) data=buildLevel4(this.scene, helpers);
    this.colliders=data.colliders; this.flickerLights=data.flickerLights; this.hideSpots=data.hideSpots; this.exitPos=data.exitPos; this.spawn=data.spawn;
    data.keyPos.forEach(p=>{ const m=helpers.sph(this.scene,0.45,0xffd700,p.x,1.5,p.z,0xffd700); const beacon=new THREE.Mesh(new THREE.CylinderGeometry(0.25,0.25,14,10,1,true), new THREE.MeshBasicMaterial({color:0xffd700,transparent:true,opacity:0.28,depthWrite:false,side:THREE.DoubleSide})); beacon.position.set(p.x,7,p.z); this.scene.add(beacon); this.pickups.push({mesh:m,beacon,x:p.x,z:p.z,type:'key',taken:false}); });
    data.genPos.forEach(p=>{ const m=helpers.box(this.scene,1.2,1.6,0.8,0x2a4a2a,p.x,0.8,p.z,false,this.colliders); const l=helpers.sph(this.scene,0.2,0xff0000,p.x,1.9,p.z,0xff0000); this.generators.push({mesh:m,light:l,x:p.x,z:p.z,done:false}); });
    const portal=helpers.box(this.scene,2.5,3.5,0.4,0xffd700,this.exitPos.x,1.75,this.exitPos.z,false,this.colliders); portal.material.emissive=new THREE.Color(0xffd700); this.exitMesh=portal;
    this.doorLight=new THREE.PointLight(0xffd700,0.8,15); this.doorLight.position.set(this.exitPos.x,2,this.exitPos.z); this.scene.add(this.doorLight);
    this.hideSpots.forEach(p=>{ if(p.isLocker) return; for(let i=0;i<3;i++){ const s=helpers.sph(this.scene,0.9,0x1f7a46,p.x+(i-1)*0.7,0.7,p.z,0x1f7a46); s.scale.y=0.7; } });
    return { ...data, pickups:this.pickups, generators:this.generators, hideSpots:this.hideSpots, colliders:this.colliders, flickerLights:this.flickerLights, exitMesh:portal, doorLight:this.doorLight };
  }
}
