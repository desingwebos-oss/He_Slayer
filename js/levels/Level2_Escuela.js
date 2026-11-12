// Level2_Escuela.js - NIVEL 2 REAL: Escuela de Noche
// ZONA A Exterior: patio con reja, cancha de basquet, autobuses oxidados, lamparas parpadeantes
// ZONA B Interior: pasillos largos, casilleros metalicos para esconderse, salones con pupitres volcados, luces fluorescentes fallando
// MISION: 3 llaves (1 afuera, 2 adentro) + Puerta dorada al fondo del pasillo
import * as THREE from 'three';
import { Textures, matWithTex } from '../Textures.js';
export const LEVEL2_META={ name:'Escuela de Noche', emoji:'🏫', stage:'Escuela', story:'ZONA A Patio: cancha y autobuses. ZONA B Interior: pasillos y salones. Escondete en casilleros. El Cazador 1.55x rompe puertas.', keys:3, gens:0 };
export function buildLevel2(scene, h){
  const colliders=[], flickerLights=[], particles=[];
  const brickMat=matWithTex(Textures.brick, 0xffffff, 0.9);
  const stoneMat=matWithTex(Textures.stone, 0x9a8a72, 0.95);
  const woodMat=matWithTex(Textures.wood, 0xffffff, 0.8);
  const cobbleMat=matWithTex(Textures.cobble, 0xffffff, 0.9);
  const metalMat=new THREE.MeshStandardMaterial({color:0x3a4a5a, roughness:0.5, metalness:0.6});
  // --- ZONA A EXTERIOR: Patio ---
  const yard=new THREE.Mesh(new THREE.BoxGeometry(60,0.08,30), cobbleMat); yard.position.set(0,0.04,28); yard.receiveShadow=true; scene.add(yard);
  // Reja perimetral
  for(let x=-28;x<=28;x+=3){ const bar=new THREE.Mesh(new THREE.BoxGeometry(0.1,2.2,0.1), new THREE.MeshStandardMaterial({color:0x1a1a1a})); bar.position.set(x,1.1,42); scene.add(bar); }
  // Cancha de basquet
  const court=new THREE.Mesh(new THREE.BoxGeometry(12,0.06,8), new THREE.MeshStandardMaterial({color:0x8a4a2a, roughness:0.9})); court.position.set(-16,0.08,26); scene.add(court);
  const line=new THREE.Mesh(new THREE.BoxGeometry(12,0.02,0.2), new THREE.MeshBasicMaterial({color:0xffffff})); line.position.set(-16,0.12,26); scene.add(line);
  // Aro de basquet
  const pole=new THREE.Mesh(new THREE.CylinderGeometry(0.12,0.12,3.5,8), metalMat); pole.position.set(-16,1.75,22); scene.add(pole);
  const board=new THREE.Mesh(new THREE.BoxGeometry(1.6,1.1,0.08), new THREE.MeshStandardMaterial({color:0xffffff})); board.position.set(-16,3.2,22); scene.add(board);
  const rim=new THREE.Mesh(new THREE.TorusGeometry(0.4,0.05,8,16), new THREE.MeshStandardMaterial({color:0xff6600})); rim.rotation.x=Math.PI/2; rim.position.set(-16,2.9,22.6); scene.add(rim);
  // Autobuses oxidados
  [[12,28], [22,32]].forEach(([x,z])=>{
    const bus=new THREE.Mesh(new THREE.BoxGeometry(6,2.2,2.2), new THREE.MeshStandardMaterial({color:0x8a6a1a, roughness:0.9})); bus.position.set(x,1.3,z); bus.castShadow=true; scene.add(bus);
    colliders.push({minX:x-3,maxX:x+3,minZ:z-1.1,maxZ:z+1.1});
    for(let i=0;i<3;i++){ const win=new THREE.Mesh(new THREE.BoxGeometry(1.2,0.6,0.05), new THREE.MeshStandardMaterial({color:0x111111})); win.position.set(x-1.8+i*1.8,1.7,z+1.12); scene.add(win); }
    [[-2,1.1],[2,1.1],[-2,-1.1],[2,-1.1]].forEach(([dx,dz])=>{ const wheel=new THREE.Mesh(new THREE.CylinderGeometry(0.5,0.5,0.3,12), new THREE.MeshStandardMaterial({color:0x111111})); wheel.rotation.x=Math.PI/2; wheel.position.set(x+dx,0.5,z+dz); scene.add(wheel); });
  });
  // Lamparas exteriores parpadeantes
  [[-8,32],[8,32],[0,18]].forEach(([x,z])=>{
    const p=new THREE.Mesh(new THREE.CylinderGeometry(0.08,0.1,3.2,8), new THREE.MeshStandardMaterial({color:0x222222})); p.position.set(x,1.6,z); scene.add(p);
    const lamp=new THREE.Mesh(new THREE.SphereGeometry(0.28,10,10), new THREE.MeshStandardMaterial({color:0xffcc66, emissive:0xffaa00, emissiveIntensity:1.2})); lamp.position.set(x,3.3,z); scene.add(lamp);
    const l=new THREE.PointLight(0xffcc66,0.9,14); l.position.set(x,3.3,z); scene.add(l); flickerLights.push(l);
  });
  // --- ESCUELA: edificio ---
  const wall=(w,hh,d,x,y,z,mat)=>{ const m=new THREE.Mesh(new THREE.BoxGeometry(w,hh,d), mat||brickMat); m.position.set(x,y,z); m.castShadow=true; m.receiveShadow=true; scene.add(m); colliders.push({minX:x-w/2,maxX:x+w/2,minZ:z-d/2,maxZ:z+d/2}); return m; };
  // Pared frontal con entrada (gap en x=0, z=6)
  wall(7,7,1,-5.5,3.5,6, brickMat); wall(7,7,1,5.5,3.5,6, brickMat);
  wall(16,7,1,0,3.5,-8, brickMat); wall(1,7,18,-8,3.5,-1, brickMat); wall(1,7,18,8,3.5,-1, brickMat);
  const roof=new THREE.Mesh(new THREE.BoxGeometry(18,0.6,18), new THREE.MeshStandardMaterial({color:0x2a2a2a})); roof.position.set(0,7.3,-1); scene.add(roof);
  // Piso interior madera + pasillo
  const floorIn=new THREE.Mesh(new THREE.BoxGeometry(15,0.1,16), woodMat); floorIn.position.set(0,0.05,-1); floorIn.receiveShadow=true; scene.add(floorIn);
  // --- ZONA B INTERIOR: Pasillo + Salones ---
  // Casilleros metalicos para esconderse (en el pasillo)
  [[-6,2],[-6,0],[6,2],[6,0]].forEach(([x,z])=>{
    const locker=new THREE.Mesh(new THREE.BoxGeometry(0.8,2.2,0.6), metalMat); locker.position.set(x,1.1,z); locker.castShadow=true; scene.add(locker);
    const slit=new THREE.Mesh(new THREE.BoxGeometry(0.1,0.6,0.02), new THREE.MeshStandardMaterial({color:0x111111})); slit.position.set(x,1.5,z+0.32); scene.add(slit);
  });
  // Salones: pupitres volcados
  [[-4,-4],[ -2,-4],[4,-4]].forEach(([x,z])=>{
    const desk=new THREE.Mesh(new THREE.BoxGeometry(1.1,0.08,0.7), woodMat); desk.position.set(x,0.7,z); desk.rotation.z=0.6; desk.rotation.x=0.3; desk.castShadow=true; scene.add(desk);
    const leg=new THREE.Mesh(new THREE.BoxGeometry(0.08,0.7,0.08), metalMat); leg.position.set(x,0.35,z); leg.rotation.z=0.6; scene.add(leg);
  });
  // Pizarron
  const board2=new THREE.Mesh(new THREE.BoxGeometry(4,1.4,0.08), new THREE.MeshStandardMaterial({color:0x1a3a1a})); board2.position.set(0,2.2,-7.4); scene.add(board2);
  // Luces fluorescentes fallando
  [[-3,2],[3,2],[0,-4]].forEach(([x,z])=>{
    const tube=new THREE.Mesh(new THREE.BoxGeometry(2.2,0.12,0.3), new THREE.MeshStandardMaterial({color:0xffffff, emissive:0xffffff, emissiveIntensity:0.9})); tube.position.set(x,6.2,z); scene.add(tube);
    const l=new THREE.PointLight(0xffffff,0.7,12); l.position.set(x,5.8,z); scene.add(l); flickerLights.push(l);
  });
  // Sillas volcadas
  for(let i=0;i<4;i++){ const chair=new THREE.Mesh(new THREE.BoxGeometry(0.45,0.45,0.45), woodMat); chair.position.set(-5+i*3,0.25,4); chair.rotation.z=0.8; scene.add(chair); }
  for(let i=0;i<50;i++){ const p=new THREE.Mesh(new THREE.SphereGeometry(0.04,6,6), new THREE.MeshBasicMaterial({color:0xcccccc, transparent:true, opacity:0.2})); p.position.set(Math.random()*40-20, Math.random()*4, Math.random()*60-20); scene.add(p); particles.push(p); }
  return { spawn:{x:0,z:36}, exitPos:{x:0,z:-6}, entrancePos:{x:0,z:6}, keyPos:[{x:-16,z:26},{x:-4,z:-2},{x:5,z:-3}], genPos:[], hideSpots:[{x:-6,z:2,isLocker:true},{x:6,z:2,isLocker:true},{x:-6,z:0,isLocker:true},{x:14,z:28}], colliders, flickerLights, particles, monsterSpawn:{x:10,z:22}, zones:[{name:'ZONA A - Patio', desc:'Cancha y autobuses'},{name:'ZONA B - Pasillos', desc:'Casilleros y salones'},{name:'ZONA C - Salida', desc:'Puerta dorada al fondo'}] };
}
