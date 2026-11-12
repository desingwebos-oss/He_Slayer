// Textures.js - Texturas procedurales para que NO se vea Roblox: piedra, ladrillo, madera, pasto, metal
import * as THREE from 'three';
function canvasTex(size, draw, repeatX=2, repeatY=2){
  const c=document.createElement('canvas'); c.width=c.height=size;
  const ctx=c.getContext('2d'); draw(ctx,size);
  const t=new THREE.CanvasTexture(c);
  t.wrapS=t.wrapT=THREE.RepeatWrapping; t.repeat.set(repeatX, repeatY);
  t.colorSpace=THREE.SRGBColorSpace;
  return t;
}
function noise(ctx,size, base, spots, n=800){
  ctx.fillStyle=base; ctx.fillRect(0,0,size,size);
  for(let i=0;i<n;i++){
    ctx.fillStyle=spots[Math.floor(Math.random()*spots.length)];
    ctx.globalAlpha=0.08+Math.random()*0.15;
    const s=2+Math.random()*8;
    ctx.fillRect(Math.random()*size, Math.random()*size, s, s);
  }
  ctx.globalAlpha=1;
}
export const Textures = {
  stone: canvasTex(256,(ctx,s)=>{
    noise(ctx,s,'#8a7a63',['#6e6250','#9a8a72','#7a6a55','#a89a80']);
    ctx.strokeStyle='rgba(0,0,0,0.25)'; ctx.lineWidth=2;
    for(let y=0;y<s;y+=64){ ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(s,y); ctx.stroke(); }
    for(let x=0;x<s;x+=64){ ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,s); ctx.stroke(); }
  },3,2),
  brick: canvasTex(256,(ctx,s)=>{
    noise(ctx,s,'#6e3a2a',['#5a2e22','#7a4632','#4a2620']);
    ctx.fillStyle='rgba(220,210,200,0.35)';
    for(let y=0;y<s;y+=32) ctx.fillRect(0,y,s,3);
    for(let y=0;y<s;y+=32) for(let x=(y/32%2)*32;x<s;x+=64) ctx.fillRect(x,y,3,32);
  },4,2),
  wood: canvasTex(256,(ctx,s)=>{
    noise(ctx,s,'#5a3a1e',['#4a2e18','#6a4426','#3a2412']);
    ctx.strokeStyle='rgba(0,0,0,0.3)';
    for(let i=0;i<12;i++){ ctx.beginPath(); const y=i*22; ctx.moveTo(0,y); ctx.bezierCurveTo(s*0.3,y+4,s*0.6,y-4,s,y); ctx.stroke(); }
  },2,2),
  grass: canvasTex(256,(ctx,s)=>{
    noise(ctx,s,'#2e4a22',['#243a1a','#3a5a2e','#1e3016','#4a6a34']);
    ctx.strokeStyle='rgba(20,40,10,0.5)';
    for(let i=0;i<300;i++){ const x=Math.random()*s,y=Math.random()*s; ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(x+2,y-6); ctx.stroke(); }
  },8,8),
  cobble: canvasTex(256,(ctx,s)=>{
    noise(ctx,s,'#6a6a6a',['#555','#7a7a7a','#4a4a4a']);
    ctx.fillStyle='rgba(0,0,0,0.2)';
    for(let y=0;y<s;y+=42) for(let x=0;x<s;x+=42){ ctx.beginPath(); ctx.ellipse(x+21,y+21,18,16,0,0,Math.PI*2); ctx.fill(); ctx.strokeStyle='rgba(255,255,255,0.15)'; ctx.stroke(); }
  },6,6),
  metal: canvasTex(256,(ctx,s)=>{
    noise(ctx,s,'#3a3a3a',['#2a2a2a','#4a4a4a','#222']);
    ctx.strokeStyle='rgba(255,255,255,0.08)';
    for(let i=0;i<20;i++){ ctx.beginPath(); ctx.moveTo(0,i*12); ctx.lineTo(s,i*12); ctx.stroke(); }
  },2,2),
};
export function matWithTex(tex, color=0xffffff, rough=0.9){
  return new THREE.MeshStandardMaterial({map:tex, color, roughness:rough, metalness:0.05});
}
