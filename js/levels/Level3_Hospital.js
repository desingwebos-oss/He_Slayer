// Level3_Hospital.js - NIVEL 3 REAL: Hospital Abandonado
// ZONA A Exterior: estacionamiento arruinado, ambulancias destruidas, carpas medicas, lluvia/niebla densa
// ZONA B Interior: recepcion destruida, camillas, quirófanos oscuros, pasillos laberinto con luces rojas de emergencia
// MISION: 2 llaves + 2 generadores + Puerta dorada. El Depredador 1.9x embiste y parpadea tu linterna.
import * as THREE from 'three';
import { Textures, matWithTex } from '../Textures.js';
export const LEVEL3_META={ name:'Hospital Abandonado', emoji:'🏥', stage:'Hospital', story:'ZONA A Estacionamiento: ambulancias y carpas. ZONA B Interior: camillas y quirófanos. Enciende 2 generadores + 2 llaves. El Depredador 1.9x embiste.', keys:2, gens:2 };
export function buildLevel3(scene, h){
  const colliders=[], flickerLights=[], particles=[];
  const brickMat=matWithTex(Textures.brick, 0xffffff, 0.9);
  const stoneMat=matWithTex(Textures.stone, 0x8a8a8a, 0.95);
  const woodMat=matWithTex(Textures.wood, 0xffffff, 0.8);
  const cobbleMat=matWithTex(Textures.cobble, 0xffffff, 0.9);
  // --- ZONA A: Estacionamiento ---
  const lot=new THREE.Mesh(new THREE.BoxGeometry(60,0.08,36), cobbleMat); lot.position.set(0,0.04,26); lot.receiveShadow=true; scene.add(lot);
  // Ambulancias destruidas (blancas con cruz roja, volcadas un poco)
  [[-14,28],[14,30]].forEach(([x,z])=>{
    const amb=new THREE.Mesh(new THREE.BoxGeometry(4.5,2.2,2), new THREE.MeshStandardMaterial({color:0xdddddd, roughness:0.8})); amb.position.set(x,1.2,z); amb.rotation.z=0.12; amb.castShadow=true; scene.add(amb);
    colliders.push({minX:x-2.2,maxX:x+2.2,minZ:z-1,maxZ:z+1});
    const cross=new THREE.Mesh(new THREE.BoxGeometry(0.8,0.8,0.05), new THREE.MeshStandardMaterial({color:0xcc0000})); cross.position.set(x,1.5,z+1.02); scene.add(cross);
    [[-1.5,1],[1.5,1]].forEach(([dx,dz])=>{ const w=new THREE.Mesh(new THREE.CylinderGeometry(0.45,0.45,0.3,10), new THREE.MeshStandardMaterial({color:0x111111})); w.rotation.x=Math.PI/2; w.position.set(x+dx,0.45,z+dz); scene.add(w); });
  });
  // Carpas medicas
  [[-8,32],[8,32]].forEach(([x,z])=>{
    const tent=new THREE.Mesh(new THREE.ConeGeometry(2.2,2.2,6), new THREE.MeshStandardMaterial({color:0xcccccc, roughness:1})); tent.position.set(x,1.1,z); tent.castShadow=true; scene.add(tent);
    const pole=new THREE.Mesh(new THREE.CylinderGeometry(0.05,0.05,2.2,6), new THREE.MeshStandardMaterial({color:0x555555})); pole.position.set(x,1.1,z); scene.add(pole);
  });
  // Luces rojas de emergencia exteriores
  [[-4,22],[4,22]].forEach(([x,z])=>{
    const lamp=new THREE.Mesh(new THREE.SphereGeometry(0.3,10,10), new THREE.MeshStandardMaterial({color:0xff0000, emissive:0xff0000, emissiveIntensity:1.5})); lamp.position.set(x,3,z); scene.add(lamp);
    const l=new THREE.PointLight(0xff0000,1.2,16); l.position.set(x,3,z); scene.add(l); flickerLights.push(l);
  });
  // --- HOSPITAL edificio ---
  const wall=(w,hh,d,x,y,z,mat)=>{ const m=new THREE.Mesh(new THREE.BoxGeometry(w,hh,d), mat||stoneMat); m.position.set(x,y,z); m.castShadow=true; m.receiveShadow=true; scene.add(m); colliders.push({minX:x-w/2,maxX:x+w/2,minZ:z-d/2,maxZ:z+d/2}); return m; };
  wall(7,7,1,-5.5,3.5,6, stoneMat); wall(7,7,1,5.5,3.5,6, stoneMat);
  wall(16,7,1,0,3.5,-8, brickMat); wall(1,7,18,-8,3.5,-1, stoneMat); wall(1,7,18,8,3.5,-1, stoneMat);
  // Pasillo laberinto interior: muros que crean laberinto
  wall(6,3,0.4,-3,1.5,-2, stoneMat); wall(6,3,0.4,3,1.5,2, stoneMat); wall(0.4,3,6,0,1.5,-1, stoneMat);
  const roof=new THREE.Mesh(new THREE.BoxGeometry(18,0.6,18), new THREE.MeshStandardMaterial({color:0x2a2a2a})); roof.position.set(0,7.3,-1); scene.add(roof);
  const floorIn=new THREE.Mesh(new THREE.BoxGeometry(15,0.1,16), new THREE.MeshStandardMaterial({color:0xaaaaaa, roughness:0.9})); floorIn.position.set(0,0.05,-1); scene.add(floorIn);
  // Recepcion destruida
  const desk=new THREE.Mesh(new THREE.BoxGeometry(3,1,1), woodMat); desk.position.set(-4,0.5,4); desk.rotation.y=0.4; desk.castShadow=true; scene.add(desk);
  // Camillas
  [[-2,-3],[3,-4]].forEach(([x,z])=>{
    const bed=new THREE.Mesh(new THREE.BoxGeometry(1.8,0.15,0.7), new THREE.MeshStandardMaterial({color:0xdddddd})); bed.position.set(x,0.8,z); bed.castShadow=true; scene.add(bed);
    [[-0.7,-0.25],[0.7,-0.25],[-0.7,0.25],[0.7,0.25]].forEach(([dx,dz])=>{ const leg=new THREE.Mesh(new THREE.CylinderGeometry(0.04,0.04,0.8,6), new THREE.MeshStandardMaterial({color:0x888888})); leg.position.set(x+dx,0.4,z+dz); scene.add(leg); });
  });
  // Luces rojas de emergencia interiores
  [[0,4],[0,-4]].forEach(([x,z])=>{
    const lamp=new THREE.Mesh(new THREE.SphereGeometry(0.25,10,10), new THREE.MeshStandardMaterial({color:0xff0000, emissive:0xff0000, emissiveIntensity:1.5})); lamp.position.set(x,6,z); scene.add(lamp);
    const l=new THREE.PointLight(0xff0000,1,12); l.position.set(x,6,z); scene.add(l); flickerLights.push(l);
  });
  // Niebla densa / lluvia: particulas
  for(let i=0;i<90;i++){ const p=new THREE.Mesh(new THREE.SphereGeometry(0.06,6,6), new THREE.MeshBasicMaterial({color:0x99aabb, transparent:true, opacity:0.35})); p.position.set(Math.random()*50-25, Math.random()*5, Math.random()*60-20); scene.add(p); particles.push(p); }
  return { spawn:{x:0,z:36}, exitPos:{x:0,z:-6}, entrancePos:{x:0,z:6}, keyPos:[{x:-14,z:28},{x:4,z:-3}], genPos:[{x:-6,z:18},{x:6,z:-2}], hideSpots:[{x:-8,z:32},{x:8,z:32},{x:-5,z:4}], colliders, flickerLights, particles, monsterSpawn:{x:12,z:24}, zones:[{name:'ZONA A - Estacionamiento', desc:'Ambulancias y carpas'},{name:'ZONA B - Quirófanos', desc:'Camillas y laberinto rojo'},{name:'ZONA C - Salida', desc:'Puerta dorada + generadores'}] };
}
