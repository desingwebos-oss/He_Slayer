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
    this.group.add(this.armL); this.group.add(this.armR);
    const head=new THREE.Mesh(new THREE.SphereGeometry(0.22,16,16), mat(0xf0c8a0,0.6)); head.position.set(0,1.85,0); this.group.add(head);
    const hair=new THREE.Mesh(new THREE.SphereGeometry(0.24,16,16), mat(0x4a2a5a,0.9)); hair.position.set(0,1.88,-0.04); this.group.add(hair);
    const cap=new THREE.Mesh(new THREE.SphereGeometry(0.24,16,12,0,Math.PI*2,0,Math.PI/2), mat(0x6a2a9a,0.6)); cap.position.set(0,1.92,0); this.group.add(cap);
    const visor=new THREE.Mesh(new THREE.BoxGeometry(0.3,0.03,0.18), mat(0x6a2a9a)); visor.position.set(0,1.9,0.28); this.group.add(visor);
    this.group.traverse(o=>{ if(o.isMesh) o.castShadow=true; });
    scene.add(this.group); this.walkTime=0;
  }
  update(dt, moving, aiming){ this.walkTime+=dt/1000*(moving?8:2); const bob=moving?Math.sin(this.walkTime)*0.04:0; this.group.position.y=bob; if(this.armR) this.armR.rotation.x= aiming?-1.35:-1.1; }
}
