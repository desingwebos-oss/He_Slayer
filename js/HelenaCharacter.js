// HelenaCharacter.js - Helena en tercera persona estilo RE4
import * as THREE from 'three';
export class HelenaCharacter {
  constructor(scene){
    this.group=new THREE.Group();
    const mat=(c,r=0.8)=>new THREE.MeshStandardMaterial({color:c, roughness:r});
    [-0.12,0.12].forEach(x=>{ const leg=new THREE.Mesh(new THREE.BoxGeometry(0.14,0.75,0.16), mat(0x1e1e2a)); leg.position.set(x,0.38,0); this.group.add(leg); const boot=new THREE.Mesh(new THREE.BoxGeometry(0.16,0.12,0.28), mat(0x2a1a12)); boot.position.set(x,0.06,0.04); this.group.add(boot); });
    const torso=new THREE.Mesh(new THREE.BoxGeometry(0.46,0.6,0.28), mat(0x7c3aed,0.7)); torso.position.set(0,1.25,0); this.group.add(torso);
    const pack=new THREE.Mesh(new THREE.BoxGeometry(0.36,0.42,0.16), mat(0x3a2a1a)); pack.position.set(0,1.3,-0.22); this.group.add(pack);
    this.armL=new THREE.Group(); this.armR=new THREE.Group();
    const armGeo=new THREE.BoxGeometry(0.12,0.55,0.14);
    const aL=new THREE.Mesh(armGeo, mat(0x7c3aed)); aL.position.y=-0.25; this.armL.add(aL);
    const aR=new THREE.Mesh(armGeo, mat(0x7c3aed)); aR.position.y=-0.25; this.armR.add(aR);
    this.armL.position.set(-0.3,1.5,0); this.armR.position.set(0.3,1.5,0); this.armL.rotation.x=-0.4; this.armR.rotation.x=-1.1;
    const gun=new THREE.Group(); const gm=new THREE.Mesh(new THREE.BoxGeometry(0.09,0.5,0.1), mat(0x1a1a2e,0.4)); gm.position.set(0,-0.72,0); gun.add(gm);
    const gb=new THREE.Mesh(new THREE.CylinderGeometry(0.025,0.03,0.22,8), new THREE.MeshStandardMaterial({color:0x7c3aed, emissive:0x7c3aed, emissiveIntensity:0.5})); gb.position.set(0,-1.05,0); gun.add(gb);
    const gt=new THREE.Mesh(new THREE.SphereGeometry(0.045,10,10), new THREE.MeshStandardMaterial({color:0x00e5ff, emissive:0x00e5ff, emissiveIntensity:1})); gt.position.set(0,-1.18,0); gun.add(gt);
    const flashMat=new THREE.MeshBasicMaterial({color:0x00ffff, transparent:true, opacity:0});
    const flashMesh=new THREE.Mesh(new THREE.SphereGeometry(0.12,8,8), flashMat);
    flashMesh.position.set(0,-1.25,0); gun.add(flashMesh);
    this.flashMesh=flashMesh; this.flashMat=flashMat;
    this.armR.add(gun);
    this.group.add(this.armL); this.group.add(this.armR);
    const head=new THREE.Mesh(new THREE.SphereGeometry(0.22,16,16), mat(0xf0c8a0,0.6)); head.position.set(0,1.85,0); this.group.add(head);
    const hair=new THREE.Mesh(new THREE.SphereGeometry(0.24,16,16), mat(0x4a2a5a,0.9)); hair.position.set(0,1.88,-0.04); this.group.add(hair);
    const cap=new THREE.Mesh(new THREE.SphereGeometry(0.24,16,12,0,Math.PI*2,0,Math.PI/2), mat(0x6a2a9a,0.6)); cap.position.set(0,1.92,0); this.group.add(cap);
    const visor=new THREE.Mesh(new THREE.BoxGeometry(0.3,0.03,0.18), mat(0x6a2a9a)); visor.position.set(0,1.9,0.28); this.group.add(visor);
    this.group.traverse(o=>{ if(o.isMesh) o.castShadow=true; });
    scene.add(this.group); this.walkTime=0; this.recoil=0;
  }
  triggerShoot(){
    this.recoil=1.0;
    if(this.flashMat){
      this.flashMat.opacity=1.0;
      this.flashMesh.scale.set(2.8,2.8,2.8);
      setTimeout(()=>{
        if(this.flashMat) this.flashMat.opacity=0;
        if(this.flashMesh) this.flashMesh.scale.set(1,1,1);
      }, 90);
    }
  }
  update(dt, moving, aiming){
    this.walkTime+=dt/1000*(moving?8:2);
    const bob=moving?Math.sin(this.walkTime)*0.04:0;
    this.group.position.y=bob;
    let armRot = aiming ? -1.35 : -1.1;
    if(this.recoil>0){
      armRot -= this.recoil * 0.55;
      this.group.position.y += this.recoil * 0.03;
      this.recoil = Math.max(0, this.recoil - (dt/1000) * 6.5);
    }
    if(this.armR) this.armR.rotation.x = armRot;
  }
}
