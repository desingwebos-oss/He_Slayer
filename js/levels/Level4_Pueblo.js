// Level4_Pueblo.js - NIVEL 4 FINAL: Pueblo Fantasma
// Pueblo abierto con varias casas, iglesia, gasolinera, calles principales conectadas. Puedes entrar/salir de varios edificios.
// MISION FINAL: 1 llave + 4 generadores + Puerta dorada de la iglesia. Confrontacion final con el Alfa 2.5x que ruge y sacude camara.
import * as THREE from 'three';
import { Textures, matWithTex } from '../Textures.js';
export const LEVEL4_META={ name:'Pueblo Final', emoji:'🏘️', stage:'Pueblo', story:'Pueblo fantasma: casas, iglesia, gasolinera. Enciende 4 generadores + 1 llave. El Alfa 2.5x ruge y sacude cámara. ¡Final!', keys:1, gens:4 };
export function buildLevel4(scene, h){
  const colliders=[], flickerLights=[], particles=[];
  const brickMat=matWithTex(Textures.brick, 0xffffff, 0.9);
  const stoneMat=matWithTex(Textures.stone, 0x8a7a63, 0.95);
  const woodMat=matWithTex(Textures.wood, 0xffffff, 0.8);
  const cobbleMat=matWithTex(Textures.cobble, 0xffffff, 0.9);
  // Calle principal
  const street=new THREE.Mesh(new THREE.BoxGeometry(8,0.08,70), cobbleMat); street.position.set(0,0.04,10); street.receiveShadow=true; scene.add(street);
  const street2=new THREE.Mesh(new THREE.BoxGeometry(50,0.08,8), cobbleMat); street2.position.set(0,0.04,10); scene.add(street2);
  const house=(x,z,w,d,color,roofColor)=>{
    const walls=new THREE.Mesh(new THREE.BoxGeometry(w,3.5,d), new THREE.MeshStandardMaterial({color, roughness:0.9})); walls.position.set(x,1.75,z); walls.castShadow=true; walls.receiveShadow=true; scene.add(walls);
    colliders.push({minX:x-w/2,maxX:x+w/2,minZ:z-d/2,maxZ:z+d/2});
    const roof=new THREE.Mesh(new THREE.ConeGeometry(Math.max(w,d)*0.75,2,4), new THREE.MeshStandardMaterial({color:roofColor})); roof.position.set(x,4.5,z); roof.rotation.y=Math.PI/4; scene.add(roof);
    const door=new THREE.Mesh(new THREE.BoxGeometry(1,2,0.1), woodMat); door.position.set(x,1,z+d/2+0.06); scene.add(door);
    const win=new THREE.Mesh(new THREE.BoxGeometry(1,1,0.1), new THREE.MeshStandardMaterial({color:0xffcc66, emissive:0xffaa00, emissiveIntensity:0.6})); win.position.set(x+1.5,2,z+d/2+0.06); scene.add(win);
  };
  // Casas del pueblo (puedes caminar entre ellas, entras por la calle)
  house(-14,20,7,6,0x8a7a5a,0x5a1a1a); house(14,20,7,6,0x6a8a7a,0x2a2a2a); house(-14,2,7,6,0x7a6a8a,0x3a1a1a); house(14,2,7,6,0x8a8a6a,0x1a1a1a); house(-14,-14,7,6,0x6a7a8a,0x2a1a2a); house(14,-14,7,6,0x8a6a6a,0x1a1a1a);
  // Iglesia (edificio final, puerta dorada adentro)
  const churchWalls=new THREE.Mesh(new THREE.BoxGeometry(10,6,10), stoneMat); churchWalls.position.set(0,3,-18); churchWalls.castShadow=true; scene.add(churchWalls);
  colliders.push({minX:-5,maxX:5,minZ:-23,maxZ:-13});
  const steeple=new THREE.Mesh(new THREE.ConeGeometry(2,3,4), new THREE.MeshStandardMaterial({color:0x2a2a2a})); steeple.position.set(0,7.5,-18); scene.add(steeple);
  const crossV=new THREE.Mesh(new THREE.BoxGeometry(0.15,1.2,0.15), new THREE.MeshStandardMaterial({color:0xd4af37, emissive:0xd4af37, emissiveIntensity:0.5})); crossV.position.set(0,9.5,-18); scene.add(crossV);
  const crossH=new THREE.Mesh(new THREE.BoxGeometry(0.8,0.15,0.15), new THREE.MeshStandardMaterial({color:0xd4af37})); crossH.position.set(0,9.7,-18); scene.add(crossH);
  // Gasolinera
  const gas=new THREE.Mesh(new THREE.BoxGeometry(8,3,6), new THREE.MeshStandardMaterial({color:0xcc3333})); gas.position.set(18,1.5,34); gas.castShadow=true; scene.add(gas);
  colliders.push({minX:14,maxX:22,minZ:31,maxZ:37});
  const canopy=new THREE.Mesh(new THREE.BoxGeometry(10,0.3,8), new THREE.MeshStandardMaterial({color:0xffffff})); canopy.position.set(18,3.2,34); scene.add(canopy);
  // Faroles del pueblo
  [[-6,26],[6,26],[-6,2],[6,2]].forEach(([x,z])=>{
    const pole=new THREE.Mesh(new THREE.CylinderGeometry(0.08,0.1,3,8), new THREE.MeshStandardMaterial({color:0x111111})); pole.position.set(x,1.5,z); scene.add(pole);
    const lamp=new THREE.Mesh(new THREE.SphereGeometry(0.28,10,10), new THREE.MeshStandardMaterial({color:0xffcc66, emissive:0xffaa00, emissiveIntensity:1})); lamp.position.set(x,3.1,z); scene.add(lamp);
    const l=new THREE.PointLight(0xffaa00,0.9,14); l.position.set(x,3.1,z); scene.add(l); flickerLights.push(l);
  });
  for(let i=0;i<70;i++){ const p=new THREE.Mesh(new THREE.SphereGeometry(0.05,6,6), new THREE.MeshBasicMaterial({color:0xaaaaaa, transparent:true, opacity:0.25})); p.position.set(Math.random()*50-25, Math.random()*4, Math.random()*60-20); scene.add(p); particles.push(p); }
  return { spawn:{x:0,z:38}, exitPos:{x:0,z:-16}, entrancePos:{x:0,z:-12}, keyPos:[{x:0,z:10}], genPos:[{x:-14,z:20},{x:14,z:20},{x:-14,z:-14},{x:14,z:-14}], hideSpots:[{x:-10,z:26},{x:10,z:26},{x:0,z:30}], colliders, flickerLights, particles, monsterSpawn:{x:0,z:-8}, zones:[{name:'ZONA A - Calles', desc:'Casas y gasolinera'},{name:'ZONA B - Pueblo', desc:'Enciende 4 generadores'},{name:'ZONA C - Iglesia Final', desc:'Puerta dorada + Alfa'}] };
}
