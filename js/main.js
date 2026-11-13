// main.js v5.0 - Animación de disparo + Botón izquierdo + Linterna Sigilo + Noche clara + BloodFX
import * as THREE from 'three';
window.__THREE = THREE;

import { SaveSystem } from './SaveSystem.js';
import { UIManager } from './UIManager.js';
import { AudioEngine } from './AudioEngine.js';
import { PlayerController } from './PlayerController.js';
import { DemogorgonAI } from './DemogorgonAI.js';
import { LevelManager, LEVELS } from './LevelManager.js';
import { MobileControls } from './MobileControls.js';
import { PlasmaWeapon } from './PlasmaWeapon.js';
import { HelenaCharacter } from './HelenaCharacter.js';
import { BloodFX } from './BloodFX.js';

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
    console.error(e.message); box.innerHTML=`<h2>⚠️ Ups, algo salió mal</h2><p class="small">Recarga la página para continuar. Si el problema sigue, revisa tu conexión a internet.</p><button class="btn-gold" onclick="location.reload()">🔄 Recargar</button><button class="btn-ghost" onclick="document.getElementById('msg').classList.remove('show');document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));document.getElementById('home').classList.add('active')">← Volver a Inicio</button>`;
  }
});

function showLevels(){ try{ ui.renderLevels(idx=>ui.showIntro(idx, startLevel)); const ok=ui.show('levels'); if(!ok) throw new Error('No existe #levels en index.html'); }catch(err){ console.error(err); alert('No se pudieron abrir los niveles. Volviendo a Inicio.'); ui.show('home'); } }
function playNow(){ try{ ui.showIntro(0, startLevel); }catch(err){ console.error(err); ui.show('home'); } }
function startLevel(idx){
  try{
    ui.hideMessage(); ui.showGameUI();
    if(game) game.destroy();
    game=new Game(idx); window.__game=game;
    ui.showMessage(`<h2>${LEVELS[idx].emoji} Nivel ${idx+1}</h2><p class="small">${LEVELS[idx].story}</p><p><b>🎯 ${LEVELS[idx].keys?LEVELS[idx].keys+' llaves ':''}${LEVELS[idx].gens?LEVELS[idx].gens+' generadores ':''} + Puerta dorada</b></p><p class="small">🔫 Dispara plasma con el botón izquierdo. 🔦 Apaga la linterna para que el monstruo no te vea. 🔑 Sigue la flecha del indicador para hallar las llaves.</p><button class="btn-gold" id="btnGo">¡Vamos, Helena!</button>`,false);
    const btn=document.getElementById('btnGo'); if(btn) btn.onclick=()=>{ ui.hideMessage(); game.paused=false; };
    game.paused=true;
  }catch(err){
    console.error(err);
    ui.hideGameUI(); ui.show('home');
    ui.showMessage(`<h2>⚠️ No se pudo cargar el nivel</h2><p class="small">Revisa tu conexión a internet e inténtalo de nuevo.</p><button class="btn-gold" onclick="location.reload()">🔄 Recargar</button><button class="btn-ghost" onclick="document.getElementById('msg').classList.remove('show')">← Volver a Inicio</button>`);
  }
}
window.startLevel = startLevel;

let toastEl=null, toastT=0;
function toast(t){
  if(!toastEl){ toastEl=document.createElement('div'); toastEl.style.cssText='position:fixed;top:64px;left:50%;transform:translateX(-50%);background:rgba(0,0,0,.85);border:1px solid #00e5ff;padding:8px 16px;border-radius:999px;font-weight:800;font-size:13px;z-index:45;pointer-events:none;display:none;color:#fff;box-shadow:0 0 14px rgba(0,229,255,0.4)'; document.body.appendChild(toastEl); }
  toastEl.textContent=t; toastEl.style.display='block'; clearTimeout(toastT); toastT=setTimeout(()=>{ toastEl.style.display='none'; },1800);
}
window.toast = toast;

class Game {
  constructor(idx){
    this.idx=idx; this.lv=LEVELS[idx]; this.paused=true; this.over=false; this.exitOpen=false; this.elapsed=0; this.ms=0; this.cameraShake=0;
    // Tema de noche mas clara y legible
    this.scene=new THREE.Scene();
    this.scene.background=new THREE.Color(0x131d33);
    this.scene.fog=new THREE.Fog(0x131d33,26,115);
    this.camera=new THREE.PerspectiveCamera(75, innerWidth/innerHeight, 0.1, 300); this.camera.position.set(0,1.7,36); this.scene.add(this.camera);
    const canvas=document.getElementById('gameCanvas');
    if(!canvas) throw new Error('No existe #gameCanvas en index.html');
    this.renderer=new THREE.WebGLRenderer({canvas, antialias:true}); this.renderer.setSize(innerWidth, innerHeight); this.renderer.setPixelRatio(Math.min(1.5, devicePixelRatio||1)); this.renderer.shadowMap.enabled=true;
    // Iluminacion ambiental nocturna mas clara
    this.scene.add(new THREE.AmbientLight(0x9cb6e0,1.45));
    const moon=new THREE.DirectionalLight(0xdde8ff,1.5); moon.position.set(25,45,15); this.scene.add(moon);
    const rim=new THREE.DirectionalLight(0x556e99,0.65); rim.position.set(-25,20,-25); this.scene.add(rim);
    // Linterna potente visible que al apagarse oculta al jugador
    this.flash=new THREE.SpotLight(0xfff2cc,22,48,Math.PI/4,0.35,1.2);
    this.flash.position.set(0,1.7,36); this.scene.add(this.flash); this.scene.add(this.flash.target);
    this.flashGlow=new THREE.PointLight(0xffeedd,3.5,9); this.scene.add(this.flashGlow);
    this.levelManager=new LevelManager(this.scene);
    this.levelData=this.levelManager.load(idx);
    // Helena en 3ra persona
    this.helena=new HelenaCharacter(this.scene);
    this.helena.group.position.set(this.levelData.spawn.x,0,this.levelData.spawn.z);
    this.player=new PlayerController(this.camera, this.flash, mobile, audio, this.helena, this.flashGlow);
    this.player.pos.copy(this.helena.group.position);
    this.monster=new DemogorgonAI(this.scene, idx, audio);
    if(this.levelData.monsterSpawn) this.monster.group.position.set(this.levelData.monsterSpawn.x,0,this.levelData.monsterSpawn.z);
    this.plasma=new PlasmaWeapon(this.scene, this.camera, audio);
    this.blood=new BloodFX(this.scene); this.blood.enabled=!!save.data.settings.blood;
    this.player.onView=()=>this.toggleView(); this.player.onBlood=()=>this.toggleBlood();
    this.applyView(save.data.settings.view||'third', false);
    this.player.onInteract=()=>this.tryInteract();
    this.player.onPause=()=>this.togglePause();
    // Mobile: todos los botones son null-safe
    mobile.bindButtons({ onView:()=>this.toggleView(), onHide:()=>this.tryHide(), onLight:()=>this.player.toggleLight(), onInteract:()=>this.tryInteract(), onPause:()=>this.togglePause(), onCrouch:(v)=>{this.player.crouching=v;}, onShoot:()=>this.shoot(), onTapStart:()=>audio.ensure() });
    this.last=performance.now(); this.raf=requestAnimationFrame(this.loop.bind(this));
    window.addEventListener('resize', this.onResize=()=>{ this.renderer.setSize(innerWidth,innerHeight); this.camera.aspect=innerWidth/innerHeight; this.camera.updateProjectionMatrix(); });
  }
  applyView(v, announce=true){
    this.player.view=v; this.helena.group.visible=(v!=='first'); this.plasma.setFirstPerson(v==='first');
    save.data.settings.view=v; save.save();
    const b=document.getElementById('btnView'); if(b) b.textContent=v==='first'?'👁️':'🧍';
    if(announce) toast(v==='first'?'👁️ Primera persona (ves el arma)':'🧍 Tercera persona (ves a Helena)');
  }
  toggleView(){ this.applyView(this.player.view==='first'?'third':'first'); }
  toggleBlood(){ this.blood.enabled=!this.blood.enabled; save.data.settings.blood=this.blood.enabled; save.save(); toast(this.blood.enabled?'🩸 Efectos de sangre: ON':'🩸 Efectos de sangre: OFF'); }
  shoot(){
    if(this.paused||this.over) return;
    if(!this.plasma.canShoot()) return;
    if(this.helena && this.helena.triggerShoot) this.helena.triggerShoot();
    this.cameraShake = 0.16;
    const r=this.plasma.shoot(this.camera, this.player.pos, this.monster);
    if(r && r.hit){
      this.monster.flashHit();
      const mp=this.monster.group.position, sc=this.monster.cfg.scale, at={x:mp.x,y:2.2*sc,z:mp.z};
      const d=r.dir||{x:0,z:0}, dead=this.monster.lastHitDead;
      this.blood.burst(at, {x:d.x*0.5,z:d.z*0.5}, dead?70:16, dead?2.2:1);
      if(dead) for(let i=0;i<8;i++) this.blood.splat(mp.x+(Math.random()-.5)*4, mp.z+(Math.random()-.5)*4, 0.7+Math.random()*0.8);
    }
  }
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
  togglePause(){
    if(this.over) return; this.paused=!this.paused;
    if(!this.paused){ ui.hideMessage(); return; }
    ui.showMessage(`<h2>⏸️ Pausa</h2><button class="btn-gold" id="btnResume">▶ Seguir</button><button class="btn-ghost" id="btnPView" style="margin-top:8px"></button><button class="btn-ghost" id="btnPBlood" style="margin-top:8px"></button>`,false);
    const b=document.getElementById('btnResume'); if(b) b.onclick=()=>{ ui.hideMessage(); this.paused=false; };
    const pv=document.getElementById('btnPView'), pb=document.getElementById('btnPBlood');
    const lab=()=>{ if(pv) pv.textContent=this.player.view==='first'?'👁️ Vista: 1ra persona (arma)':'🧍 Vista: 3ra persona (Helena)'; if(pb) pb.textContent='🩸 Sangre del monstruo: '+(this.blood.enabled?'ON':'OFF'); };
    if(pv) pv.onclick=()=>{ this.toggleView(); lab(); }; if(pb) pb.onclick=()=>{ this.toggleBlood(); lab(); }; lab();
  }
  loop(now){
    this.raf=requestAnimationFrame(this.loop.bind(this));
    const dt=Math.min(50, now-this.last); this.last=now;
    if(this.paused||this.over){ this.renderer.render(this.scene,this.camera); return; }
    this.elapsed+=dt/1000; this.ms+=dt;
    const {fx,fz}=this.player.update(dt, this.levelData.colliders);
    const m=this.monster.update(dt, this.player, this.levelData.colliders);
    this.plasma.update(dt); this.blood.update(dt);
    // Recoger llaves (distancia a Helena, no a la camara)
    const p=this.player.pos;
    this.levelData.pickups.forEach(pk=>{
      if(!pk.taken && Math.hypot(pk.x-p.x,pk.z-p.z)<1.6){ pk.taken=true; pk.mesh.visible=false; if(pk.beacon) pk.beacon.visible=false; this.player.addKey(); audio.beep(880); toast('🔑 Llave '+this.player.keysGot+' de '+this.lv.keys); }
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
    const mTxt = m.chasing ? '👹 ¡TE VE! ¡APAGA LUZ O ESCÓNDETE!' : m.state==='INVESTIGATE' ? '👹 Te busca en sombras...' : (!this.player.lightOn && m.dist<18 ? '👹 No te ve (Linterna OFF)' : '👹 Lejos');
    ui.setHUD({levelName:`${this.lv.emoji} Nivel ${this.idx+1} - ${this.lv.name}`, keys:this.player.keysGot, totalKeys:needKeys, gens:this.player.gensGot, totalGens:needGens, lives:this.player.lives, time:Math.floor(this.elapsed), monsterText:mTxt, dist:distDoor, compassText:`${zone} • 🚪 ${distDoor}m • 👹 ${Math.round(m.dist)}m`, stamina:Math.round(this.player.stamina), battery:Math.round(this.player.battery), inventory:this.player.inventory.join(', ')});
    // Indicador de llaves: apunta a la llave pendiente mas cercana (luego generador / puerta)
    {
      const fx2=Math.sin(this.player.yaw), fz2=Math.cos(this.player.yaw);
      const nearest=(list)=>{ let best=null,bd=1e9; list.forEach(o=>{ const d=Math.hypot(o.x-p.x,o.z-p.z); if(d<bd){bd=d;best=o;} }); return best?{o:best,d:bd}:null; };
      const aim=(o,d,label)=>({ dist:d, label, angle:Math.atan2(-(o.x-p.x)*fz2+(o.z-p.z)*fx2, (o.x-p.x)*fx2+(o.z-p.z)*fz2) });
      let target=null;
      const k=nearest(this.levelData.pickups.filter(q=>!q.taken));
      if(k) target=aim(k.o,k.d,'Llave a');
      else { const g=nearest(this.levelData.generators.filter(q=>!q.done)); if(g) target=aim(g.o,g.d,'Generador a'); else if(this.exitOpen) target=aim(this.levelData.exitPos,distExit,'Puerta a'); }
      ui.setKeyTracker({got:this.player.keysGot, total:needKeys, target});
    }
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

