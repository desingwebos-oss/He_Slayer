// Level1_Mansion.js v3 - ZONAS SEMIABIERTAS + MAS REALISTA
import * as THREE from 'three';
import { Textures, matWithTex } from '../Textures.js';
export const LEVEL1_META={ name:'Mansion Embrujada', emoji:'🏰', stage:'Castillo', story:'ZONA A Exterior: busca la 1ra llave en el patio. ZONA B Interior: entra al castillo, agarra 2 llaves mas. ZONA C Salida: puerta dorada al fondo. El Devorador te caza en 3ra persona.', keys:3, gens:0 };
export function buildLevel1(scene, h){
  const colliders=[], flickerLights=[], particles=[];
  const stoneMat=matWithTex(Textures.stone, 0xb8a888, 0.95);
  const brickMat=matWithTex(Textures.brick, 0xffffff, 0.9);
  const woodMat=matWithTex(Textures.wood, 0xffffff, 0.8);
  const cobbleMat=matWithTex(Textures.cobble, 0xffffff, 0.9);
  for(let i=0;i<16;i++){ const s=new THREE.Mesh(new THREE.BoxGeometry(3,0.08,2.2), cobbleMat); s.position.set((Math.random()-0.5)*0.6,0.04,36-i*2.4); s.receiveShadow=true; scene.add(s); }
  for(let x=-30;x<=30;x+=3){ const bar=new THREE.Mesh(new THREE.BoxGeometry(0.12,2.4,0.12), new THREE.MeshStandardMaterial({color:0x1a1a1a, roughness:0.6, metalness:0.6})); bar.position.set(x,1.2,-24); bar.castShadow=true; scene.add(bar); }
  [[-20,18],[20,18],[-26,-8],[26,-10],[-14,30],[14,30],[-18,28],[18,28]].forEach(([x,z])=>{
    const trunk=new THREE.Mesh(new THREE.CylinderGeometry(0.3,0.5,4.5,8), woodMat); trunk.position.set(x,2.2,z); trunk.castShadow=true; scene.add(trunk);
    for(let i=0;i<3;i++){ const leaf=new THREE.Mesh(new THREE.SphereGeometry(1.4-i*0.2,10,10), new THREE.MeshStandardMaterial({color:0x1e2e1a, roughness:1})); leaf.position.set(x+(i-1)*0.8, 5+i*0.7, z); leaf.castShadow=true; scene.add(leaf); }
  });
  [[-4,22],[4,22],[-4,8],[4,8]].forEach(([x,z])=>{
    const pole=new THREE.Mesh(new THREE.CylinderGeometry(0.08,0.1,3,8), new THREE.MeshStandardMaterial({color:0x111111})); pole.position.set(x,1.5,z); scene.add(pole);
    const lamp=new THREE.Mesh(new THREE.SphereGeometry(0.28,10,10), new THREE.MeshStandardMaterial({color:0xffc266, emissive:0xffaa00, emissiveIntensity:1.2})); lamp.position.set(x,3.1,z); scene.add(lamp);
    const l=new THREE.PointLight(0xffaa00,0.9,14); l.position.set(x,3.1,z); scene.add(l); flickerLights.push(l);
  });
  const wall=(w,h2,d,x,y,z,mat)=>{ const m=new THREE.Mesh(new THREE.BoxGeometry(w,h2,d), mat||stoneMat); m.position.set(x,y,z); m.castShadow=true; m.receiveShadow=true; scene.add(m); colliders.push({minX:x-w/2,maxX:x+w/2,minZ:z-d/2,maxZ:z+d/2}); return m; };
  wall(4,9,1,-4,4.5,6, stoneMat); wall(4,9,1,4,4.5,6, stoneMat);
  wall(14,9,1,0,4.5,-6, brickMat); wall(1,9,12,-7,4.5,0, stoneMat); wall(1,9,12,7,4.5,0, stoneMat);
  const roof=new THREE.Mesh(new THREE.BoxGeometry(15,0.6,15), new THREE.MeshStandardMaterial({color:0x3a2a2a, roughness:0.9})); roof.position.set(0,9.3,0); scene.add(roof);
  [[-7,6],[7,6],[-7,-6],[7,-6]].forEach(([x,z])=>{ const t=new THREE.Mesh(new THREE.CylinderGeometry(1.6,1.9,11,10), stoneMat); t.position.set(x,5.5,z); t.castShadow=true; scene.add(t); const cone=new THREE.Mesh(new THREE.ConeGeometry(2.2,3.4,10), new THREE.MeshStandardMaterial({color:0x5a1a2a, roughness:0.8})); cone.position.set(x,12.6,z); scene.add(cone); });
  const floorIn=new THREE.Mesh(new THREE.BoxGeometry(13,0.1,12), woodMat); floorIn.position.set(0,0.05,0); floorIn.receiveShadow=true; scene.add(floorIn);
  const carpet=new THREE.Mesh(new THREE.BoxGeometry(4,0.06,7), new THREE.MeshStandardMaterial({color:0x6a1a1a, roughness:1})); carpet.position.set(0,0.1,0); scene.add(carpet);
  h.box(scene,2,3,0.6,0x5a3a1a,-5,1.5,-4,false,colliders);
  h.box(scene,2,3,0.6,0x5a3a1a,5,1.5,-4,false,colliders);
  for(let i=0;i<5;i++){ const st=new THREE.Mesh(new THREE.BoxGeometry(3,0.3,0.8), woodMat); st.position.set(0,0.3+i*0.35,-3-i*0.6); st.receiveShadow=true; scene.add(st); }
  [[-5,5],[5,5]].forEach(([x,z])=>{ const c=new THREE.Mesh(new THREE.CylinderGeometry(0.08,0.08,1.2,6), new THREE.MeshStandardMaterial({color:0x222222})); c.position.set(x,7,z); scene.add(c); const bulb=new THREE.Mesh(new THREE.SphereGeometry(0.3,10,10), new THREE.MeshStandardMaterial({color:0xffaa00, emissive:0xffaa00, emissiveIntensity:1})); bulb.position.set(x,6.2,z); scene.add(bulb); const l=new THREE.PointLight(0xffaa00,0.8,12); l.position.set(x,6.2,z); scene.add(l); flickerLights.push(l); });
  for(let i=0;i<3;i++){ const f=new THREE.Mesh(new THREE.BoxGeometry(1.2,1.6,0.1), new THREE.MeshStandardMaterial({color:0x2a1a0a})); f.position.set(-5+i*5,4,-5.5); scene.add(f); }
  for(let i=0;i<60;i++){ const p=new THREE.Mesh(new THREE.SphereGeometry(0.05,6,6), new THREE.MeshBasicMaterial({color:0xaaaaaa, transparent:true, opacity:0.25})); p.position.set(Math.random()*50-25, Math.random()*4, Math.random()*60-20); scene.add(p); particles.push(p); }
  return { spawn:{x:0,z:36}, exitPos:{x:0,z:-3}, entrancePos:{x:0,z:6}, keyPos:[{x:-14,z:18},{x:-4,z:2},{x:5,z:-2}], genPos:[], hideSpots:[{x:-16,z:20},{x:16,z:20},{x:-22,z:28}], colliders, flickerLights, particles, monsterSpawn:{x:12,z:14}, zones:[{name:'ZONA A - Exterior', desc:'Busca la 1ra llave en el patio'},{name:'ZONA B - Interior', desc:'Entra al castillo, agarra 2 llaves'},{name:'ZONA C - Salida', desc:'Puerta dorada al fondo'}] };
}
