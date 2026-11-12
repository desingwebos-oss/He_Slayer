// main.js v4.2 FIX PANTALLA NEGRA - Tercera persona RE4 + Plasma + Niveles 1-4 + Catch de errores
// v4.5: THREE y CANNON se cargan dinamico con fallback, para que el menu no dependa del CDN
let THREE=null, CANNON=null;
async function load3D(){
  const triesThree=['https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js','https://unpkg.com/three@0.160.0/build/three.module.js','https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.js'];
  const triesCannon=['https://cdn.jsdelivr.net/npm/cannon-es@0.20.0/dist/cannon-es.js','https://unpkg.com/cannon-es@0.20.0/dist/cannon-es.js'];
  let lastErr=null;
  for(const u of triesThree){ try{ THREE=await import(/* @vite-ignore */ u); break; }catch(e){ lastErr=e; } }
  if(!THREE) throw new Error('No se pudo cargar Three.js desde ningun CDN. Revisa tu internet. ('+(lastErr&&lastErr.message||'')+')');
  for(const u of triesCannon){ try{ CANNON=await import(/* @vite-ignore */ u); break; }catch(e){ lastErr=e; } }
  if(!CANNON) throw new Error('No se pudo cargar cannon-es.');
  // Exponer para los modulos que ya importan THREE (LevelManager etc usan import estatico, por eso los cargamos despues)
  window.__THREE=THREE; window.__CANNON=CANNON;
  return true;
}
// Los demas modulos (LevelManager, etc) siguen usando import estatico de 'three', por eso main.js ya no los importa arriba.
// En v4.5, el juego 3D se carga solo al dar ENTRAR, con load3D() + import dinamico de LevelManager.

import { SaveSystem } from './SaveSystem.js';
import { UIManager } from './UIManager.js';
import { AudioEngine } from './AudioEngine.js';
import { PlayerController } from './PlayerController.js';
import { DemogorgonAI } from './DemogorgonAI.js';
import { LevelManager, LEVELS } from './LevelManager.js';
import { MobileControls } from './MobileControls.js';
import { PlasmaWeapon } from './PlasmaWeapon.js';
import { HelenaCharacter } from './HelenaCharacter.js';
// CANNON dinamico arriba

const save=new SaveSystem();
const ui=new UIManager(save);
const audio=new AudioEngine();
const mobile=new MobileControls();
let game=null;

// Si algo falla, NO dejar pantalla negra: mostrar error y boton para volver a inicio
window.addEventListener('error',e=>{
  const box=document.getElementById('msgBox');
  if(box && !document.getElementById('msg')?.classList.contains('show')){
    const msg=document.getElementById('msg'); if(msg) msg.classList.add('show');
    box.innerHTML=`<h2>⚠️ Ups, algo falló</h2><p class="small">${(e.message||'Error').slice(0,200)}</p><p class="small">Recarga con ?v=4.4 y asegúrate de subir TODOS los archivos del ZIP (no solo index.html).</p><button class="btn-gold" onclick="location.reload()">🔄 Recargar</button><button class="btn-ghost" onclick="document.getElementById('msg').classList.remove('show');document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));document.getElementById('home').classList.add('active')">← Volver a Inicio</button>`;
  }
});

function showLevels(){ try{ ui.renderLevels(idx=>ui.showIntro(idx, startLevel)); const ok=ui.show('levels'); if(!ok) throw new Error('No existe #levels en index.html'); }catch(err){ console.error(err); alert('Error al abrir niveles: '+err.message+'\nVolviendo a Inicio.'); ui.show('home'); } }
function playNow(){ try{ ui.showIntro(0, startLevel); }catch(err){ console.error(err); ui.show('home'); } }
async function startLevel(idx){
  try{
    if(!THREE){ const m=document.getElementById('msgBox'); if(m){ /* mostrar cargando */ } ui.showMessage(`<h2>⏳ Cargando 3D...</h2><p class="small">Descargando Three.js... si tu internet esta lento, espera unos segundos.</p>`); try{ await load3D(); }catch(e){ ui.hideMessage(); ui.show('home'); ui.showMessage(`<h2>⚠️ Sin 3D por ahora</h2><p class="small">${e.message}</p><p class="small">El menu (JUGAR / NIVELES / COMO JUGAR) si funciona sin 3D. Para jugar el 3D necesitas internet para descargar Three.js una vez.</p><button class="btn-gold" onclick="document.getElementById('msg').classList.remove('show')">← Volver a Inicio</button>`); return; } ui.hideMessage(); }

    ui.hideMessage(); ui.showGameUI();
    if(game) game.destroy();
    game=new Game(idx);
    ui.showMessage(`<h2>${LEVELS[idx].emoji} Nivel ${idx+1}</h2><p class="small">${LEVELS[idx].story}</p><p><b>🎯 ${LEVELS[idx].keys?LEVELS[idx].keys+' llaves ':''}${LEVELS[idx].gens?LEVELS[idx].gens+' generadores ':''} + Puerta dorada</b></p><p class="small">🎥 Cámara en 3ra persona estilo RE4: ves a Helena por la espalda. 🔫 Tu plasma ya está en tu mano.</p><button class="btn-gold" id="btnGo">¡Vamos, Helena!</button>`,false);
    const btn=document.getElementById('btnGo'); if(btn) btn.onclick=()=>{ ui.hideMessage(); game.paused=false; };
    game.paused=true;
  }catch(err){
    console.error(err);
    ui.hideGameUI(); ui.show('home');
    ui.showMessage(`<h2>⚠️ No se pudo cargar el nivel</h2><p class="small">${err.message}</p><p class="small">Falta un archivo en GitHub. Sube TODO el ZIP v4.4 y recarga con ?v=4.4</p><button class="btn-gold" onclick="location.reload()">🔄 Recargar</button><button class="btn-ghost" onclick="document.getElementById('msg').classList.remove('show')">← Volver a Inicio</button>`);
  }
}
class Game {
  constructor(idx){
    this.idx=idx; this.lv=LEVELS[idx]; this.paused=true; this.over=false; this.exitOpen=false; this.elapsed=0; this.ms=0; this.cameraShake=0;
    this.scene=new THREE.Scene(); this.scene.background=new THREE.Color(0x0e1526); this.scene.fog=new THREE.Fog(0x0e1526,18,95);
    this.camera=new THREE.PerspectiveCamera(75, innerWidth/innerHeight, 0.1, 300); this.camera.position.set(0,1.7,36); this.scene.add(this.camera);
    const canvas=document.getElementById('gameCanvas');
    if(!canvas) throw new Error('No existe #gameCanvas en index.html');
    this.renderer=new THREE.WebGLRenderer({canvas, antialias:true}); this.renderer.setSize(innerWidth, innerHeight); this.renderer.setPixelRatio(Math.min(1.5, devicePixelRatio||1)); this.renderer.shadowMap.enabled=true;
    this.scene.add(new THREE.AmbientLight(0x8a8aff,0.7));
    const moon=new THREE.DirectionalLight(0xfff2cc,0.7); moon.position.set(20,30,10); this.scene.add(moon);
    this.flash=new THREE.SpotLight(0xfff2cc,1.6,38,0.55,0.5,1); this.flash.position.set(0,1.7,36); this.scene.add(this.flash); this.scene.add(this.flash.target);
    this.world=new CANNON.World({gravity:new CANNON.Vec3(0,-9.82,0)});
    this.levelManager=new LevelManager(this.scene);
    this.levelData=this.levelManager.load(idx);
    // Helena en 3ra persona
    this.helena=new HelenaCharacter(this.scene);
    this.helena.group.position.set(this.levelData.spawn.x,0,this.levelData.spawn.z);
    this.player=new PlayerController(this.camera, this.flash, mobile, audio, this.helena);
    this.player.pos.copy(this.helena.group.position);
    this.monster=new DemogorgonAI(this.scene, idx, audio);
    if(this.levelData.monsterSpawn) this.monster.group.position.set(this.levelData.monsterSpawn.x,0,this.levelData.monsterSpawn.z);
    this.plasma=new PlasmaWeapon(this.scene, this.camera, audio);
    this.player.onInteract=()=>this.tryInteract();
    this.player.onPause=()=>this.togglePause();
    // Mobile: todos los botones son null-safe ahora
    mobile.bindButtons({ onHide:()=>this.tryHide(), onLight:()=>this.player.toggleLight(), onInteract:()=>this.tryInteract(), onPause:()=>this.togglePause(), onCrouch:(v)=>{this.player.crouching=v;}, onShoot:()=>this.shoot(), onTapStart:()=>audio.ensure() });
    this.last=performance.now(); this.raf=requestAnimationFrame(this.loop.bind(this));
    window.addEventListener('resize', this.onResize=()=>{ this.renderer.setSize(innerWidth,innerHeight); this.camera.aspect=innerWidth/innerHeight; this.camera.updateProjectionMatrix(); });
  }
  shoot(){ if(this.paused||this.over) return; this.plasma.shoot(this.camera, this.player.pos, this.monster); }
  tryHide(){
    const near=this.levelData.hideSpots.some(h=>Math.hypot(h.x-this.player.pos.x,h.z-this.player.pos.z)<3.5);
    if(!this.player.toggleHide(near)){ /* no hay escondite cerca */ }
  }
  tryInteract(){
    const p=this.player.pos;
    const gen=this.levelData.generators.find(g=>!g.done && Math.hypot(g.x-p.x,g.z-p.z)<2.2);
    if(gen){ gen.done=true; gen.mesh.material.emissive=new THREE.Color(0x00ff00); this.player.addGen(); return; }
    const hide=this.levelData.hideSpots.find(h=>h.isLocker && Math.hypot(h.x-p.x,h.z-p.z)<2);
    if(hide){ this.player.hidden=!this.player.hidden; return; }
    if(this.exitOpen && Math.hypot(this.levelData.exitPos.x-p.x,this.levelData.exitPos.z-p.z)<2.5) this.win();
  }
  hit(){
    this.player.lives--; this.player.invuln=90; audio.tone(200,0.2,'sawtooth',0.2); ui.showDamage();
    if(this.player.lives<=0){ this.over=true; this.paused=true; this.showEnd(false); return; }
    this.player.pos.set(this.levelData.spawn.x,1.7,this.levelData.spawn.z);
    if(this.helena) this.helena.group.position.set(this.levelData.spawn.x,0,this.levelData.spawn.z);
    this.player.hidden=false;
  }
  win(){
    this.over=true; this.paused=true;
    const stars=save.completeLevel(this.idx, this.elapsed, this.player.keysGot+this.player.gensGot, this.lv.keys+this.lv.gens);
    ui.showMessage(`<h2>🎉 ¡Nivel ${this.idx+1} completado!</h2><p>⭐ ${stars} estrellas</p><p class="small">${this.idx<3?'Se desbloqueó el Nivel '+(this.idx+2):'¡Terminaste los 4 misterios! ¡Eres una Cazadora Leyenda!'}</p><button class="btn-gold" id="btnNext">${this.idx<3?'➡️ Siguiente Nivel '+(this.idx+2):'🏠 Volver a Inicio'}</button>`,false);
    const btn=document.getElementById('btnNext'); if(btn) btn.onclick=()=>{ ui.hideMessage(); if(this.idx<3) startLevel(this.idx+1); else { ui.hideGameUI(); ui.show('home'); } };
  }
  showEnd(win){
    ui.showMessage(win?`<h2>🎉 ¡Ganaste!</h2><button class="btn-gold" onclick="location.reload()">🔄 Jugar de nuevo</button>`:`<h2>💀 Te atrapó el Devorador</h2><p class="small">Inténtalo de nuevo. Apaga la linterna y escóndete.</p><button class="btn-gold" id="btnRetry">🔄 Intentar de nuevo</button><button class="btn-ghost" id="btnHome2">🏠 Inicio</button>`,false);
    const r=document.getElementById('btnRetry'); if(r) r.onclick=()=>{ ui.hideMessage(); ui.hideGameUI(); startLevel(this.idx); };
    const h=document.getElementById('btnHome2'); if(h) h.onclick=()=>{ ui.hideMessage(); ui.hideGameUI(); ui.show('home'); };
  }
  togglePause(){ if(this.over) return; this.paused=!this.paused; if(this.paused) ui.showMessage(`<h2>⏸️ Pausa</h2><button class="btn-gold" id="btnResume">▶ Seguir</button>`,false); const b=document.getElementById('btnResume'); if(b) b.onclick=()=>{ ui.hideMessage(); this.paused=false; }; }
  loop(now){
    this.raf=requestAnimationFrame(this.loop.bind(this));
    const dt=Math.min(50, now-this.last); this.last=now;
    if(this.paused||this.over){ this.renderer.render(this.scene,this.camera); return; }
    this.elapsed+=dt/1000; this.ms+=dt;
    const {fx,fz}=this.player.update(dt, this.levelData.colliders);
    const m=this.monster.update(dt, this.player, this.levelData.colliders);
    this.plasma.update(dt);
    // Recoger llaves (distancia a Helena, no a la camara)
    const p=this.player.pos;
    this.levelData.pickups.forEach(pk=>{
      if(!pk.taken && Math.hypot(pk.x-p.x,pk.z-p.z)<1.6){ pk.taken=true; pk.mesh.visible=false; this.player.addKey(); audio.beep(880); }
    });
    // Puerta se abre cuando tienes todo
    const needKeys=this.lv.keys, needGens=this.lv.gens;
    if(!this.exitOpen && this.player.keysGot>=needKeys && this.player.gensGot>=needGens){
      this.exitOpen=true; this.levelData.exitMesh.material.emissive=new THREE.Color(0x00ff00);
      ui.showMessage(`<h2>🚪 ¡PUERTA ABIERTA!</h2><p>Corre a la puerta dorada</p><button class="btn-gold" id="btnGo2">¡Vamos!</button>`);
      const b=document.getElementById('btnGo2'); if(b) b.onclick=()=>ui.hideMessage();
    }
    if(m.dist<1.4 && this.player.invuln<=0 && !this.player.hidden) this.hit();
    // Zona generica por distancia
    const distExit=Math.hypot(this.levelData.exitPos.x-p.x, this.levelData.exitPos.z-p.z); const distSpawn=Math.hypot(this.levelData.spawn.x-p.x, this.levelData.spawn.z-p.z);
    const zone = distExit<8 ? 'ZONA C - Salida 🚪' : distSpawn<12 ? 'ZONA A - Exterior 🌳' : 'ZONA B - Interior 🏰';
    const distDoor=Math.round(distExit);
    ui.setHUD({levelName:`${this.lv.emoji} Nivel ${this.idx+1} - ${this.lv.name}`, keys:this.player.keysGot, totalKeys:needKeys, gens:this.player.gensGot, totalGens:needGens, lives:this.player.lives, time:Math.floor(this.elapsed), monsterText:m.chasing?'👹 ¡TE VE! CORRE!':m.state==='INVESTIGATE'?'👹 Te busca...':'👹 Lejos', dist:distDoor, compassText:`${zone} • 🚪 ${distDoor}m • 👹 ${Math.round(m.dist)}m`, stamina:Math.round(this.player.stamina), battery:Math.round(this.player.battery), inventory:this.player.inventory.join(', ')});
    // Interactuable cerca?
    const nearGen=this.levelData.generators.some(g=>!g.done && Math.hypot(g.x-p.x,g.z-p.z)<2.2);
    const nearLocker=this.levelData.hideSpots.some(h=>h.isLocker && Math.hypot(h.x-p.x,h.z-p.z)<2);
    const nearDoor=this.exitOpen && distExit<2.5;
    ui.showInteract(nearGen||nearLocker||nearDoor);
    // Luces parpadeantes
    this.levelData.flickerLights.forEach((l,i)=>{ if(Math.random()<0.02) l.intensity=0.4+Math.random()*0.8; });
    if(this.cameraShake>0){ this.cameraShake-=dt/1000; this.camera.position.x+=(Math.random()-0.5)*0.1*this.cameraShake; }
    this.renderer.render(this.scene,this.camera);
  }
  destroy(){ cancelAnimationFrame(this.raf); if(this.onResize) window.removeEventListener('resize', this.onResize); this.player.destroy(); this.renderer.dispose(); }
}
// Botones del menu (null-safe)
const bind=(id,fn)=>{ const el=document.getElementById(id); if(el) el.onclick=fn; };
bind('btnPlay',()=>playNow()); // v4.4: JUGAR = Nivel 1 directo, no lista
bind('btnLevels2',()=>showLevels());
bind('btnHow',()=>ui.show('how'));
bind('btnFullHome',()=>{ try{ document.documentElement.requestFullscreen(); }catch(e){} });
bind('btnMute',()=>audio.toggle());
document.querySelectorAll('[data-nav]').forEach(b=>b.onclick=()=>ui.show(b.dataset.nav));
try{ const c=document.getElementById('gameCanvas'); if(c) c.style.display='none'; }catch(e){} ui.updateHome();
window.__helenaMainOK=true; { const d=document.getElementById('diagBox'); if(d) d.style.display='none'; }

