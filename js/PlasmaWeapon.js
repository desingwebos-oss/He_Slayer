// PlasmaWeapon.js v4.3 - Firma compatible: shoot(camera, pos, monster)
import * as THREE from 'three';
export class PlasmaWeapon {
  constructor(scene, camera, audio){
    this.fp=false;
    this.scene=scene; this.camera=camera; this.audio=audio;
    this.energy=100; this.cooldown=0; this.damage=14;
    this.beam=null; this.muzzle=null;
    this.buildViewModel();
  }
  buildViewModel(){
    const g=new THREE.Group();
    const matDark=new THREE.MeshStandardMaterial({color:0x1a1a2e, roughness:0.4, metalness:0.6});
    const matCyan=new THREE.MeshStandardMaterial({color:0x00e5ff, emissive:0x00e5ff, emissiveIntensity:0.9});
    const matPurple=new THREE.MeshStandardMaterial({color:0x7c3aed, emissive:0x7c3aed, emissiveIntensity:0.4});
    const body=new THREE.Mesh(new THREE.BoxGeometry(0.09,0.12,0.45), matDark); g.add(body);
    const barrel=new THREE.Mesh(new THREE.CylinderGeometry(0.025,0.03,0.35,10), matPurple); barrel.rotation.x=Math.PI/2; barrel.position.set(0,0.02,-0.35); g.add(barrel);
    const core=new THREE.Mesh(new THREE.SphereGeometry(0.045,12,12), matCyan); core.position.set(0,0.02,-0.52); g.add(core); this.core=core;
    const cell=new THREE.Mesh(new THREE.BoxGeometry(0.07,0.1,0.14), matCyan); cell.position.set(0,-0.11,0.05); g.add(cell);
    const grip=new THREE.Mesh(new THREE.BoxGeometry(0.07,0.14,0.07), matDark); grip.position.set(0,-0.13,0.15); grip.rotation.x=0.3; g.add(grip);
    g.position.set(0.28,-0.24,-0.55); g.rotation.y=-0.05;
    this.group=g;
    if(this.camera) this.camera.add(g);
    const beamMat=new THREE.MeshBasicMaterial({color:0x00ffff, transparent:true, opacity:0.95});
    const beamGeo=new THREE.CylinderGeometry(0.06,0.06,1,8);
    this.beam=new THREE.Mesh(beamGeo, beamMat); this.beam.visible=false; this.scene.add(this.beam);
    this.muzzleLight=new THREE.PointLight(0x00ffff, 0, 16);
    this.scene.add(this.muzzleLight);
  }
  setFirstPerson(v){ this.fp=v; if(this.group) this.group.visible=v; }
  canShoot(){ return this.cooldown<=0 && this.energy>=8; }
  shoot(camOrMonster, pos, monster){
    // Compat: main.js llama shoot(camera, pos, monster) ; otros llaman shoot(monster)
    let mon = monster;
    if(!mon && camOrMonster && camOrMonster.group) mon = camOrMonster;
    if(!this.canShoot()) return {hit:false, reason:'cooldown'};
    this.cooldown=0.35; this.energy=Math.max(0,this.energy-8);
    if(this.audio && this.audio.plasma) this.audio.plasma();
    if(this.group){ this.group.position.z=-0.38; this.group.rotation.x=-0.22; setTimeout(()=>{ if(this.group){ this.group.position.z=-0.55; this.group.rotation.x=0; } },90); }
    if(this.core){ this.core.scale.setScalar(2.0); setTimeout(()=>{ if(this.core) this.core.scale.setScalar(1); },120); }
    const dir=new THREE.Vector3(); this.camera.getWorldDirection(dir);
    const origin=this.camera.position.clone();
    const end=origin.clone().add(dir.clone().multiplyScalar(24));
    let muzzle;
    if(this.fp) muzzle=new THREE.Vector3(0.28,-0.22,-0.9).applyQuaternion(this.camera.quaternion).add(origin);
    else muzzle=new THREE.Vector3(pos.x,1.4,pos.z).add(new THREE.Vector3(dir.x,0,dir.z).normalize().multiplyScalar(0.9));
    this.showBeam(muzzle, end);
    if(this.muzzleLight){
      this.muzzleLight.position.copy(muzzle);
      this.muzzleLight.intensity=22;
      setTimeout(()=>{ if(this.muzzleLight) this.muzzleLight.intensity=0; },90);
    }
    if(!mon || !mon.group) return {hit:false};
    const mp=mon.group.position.clone(); mp.y=1.8;
    const toMonster=mp.clone().sub(origin);
    const dist=toMonster.length();
    const angle=dir.angleTo(toMonster.clone().normalize());
    const hit = dist<26 && angle<0.35;
    if(hit && mon.takeDamage) mon.takeDamage(this.damage, origin);
    return {hit, dist, dir};
  }
  showBeam(from, to){
    const mid=from.clone().add(to).multiplyScalar(0.5);
    const len=from.distanceTo(to);
    this.beam.position.copy(mid); this.beam.scale.set(1,len,1); this.beam.lookAt(to); this.beam.rotateX(Math.PI/2); this.beam.visible=true;
    setTimeout(()=>{ if(this.beam) this.beam.visible=false; },120);
  }
  update(dt){
    const f=dt/16.667;
    if(this.cooldown>0) this.cooldown-=dt/1000;
    this.energy=Math.min(100, this.energy+0.12*f);
    if(this.core) this.core.material.emissiveIntensity=0.4 + (this.energy/100)*0.8;
  }
}
