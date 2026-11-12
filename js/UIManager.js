// UIManager.js v4.4 - NUNCA deja todo en negro
import { LEVELS } from './LevelManager.js';
export class UIManager {
  constructor(save){
    this.save=save;
    const g=id=>document.getElementById(id);
    this.el={ home:g('home'), levels:g('levels'), how:g('how'), intro:g('introLevel'), hud:g('hud'), bars:g('bars'), controls:g('controls'), vignette:g('vignette'), msg:g('msg'), msgBox:g('msgBox'), levelList:g('levelList') };
  }
  show(id){
    // v4.4 FIX: primero verificar que la pantalla existe. Si no existe, NO apagar home.
    const map={home:this.el.home, levels:this.el.levels, how:this.el.how, introLevel:this.el.intro, intro:this.el.intro};
    const target = map[id];
    if(!target){
      console.error('UIManager.show: no existe pantalla', id);
      // Mantener home visible, no dejar negro
      if(this.el.home) this.el.home.classList.add('active');
      return false;
    }
    document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
    target.classList.add('active');
    // Forzar visible por estilo inline por si CSS esta en cache viejo
    target.style.display='block';
    document.querySelectorAll('.screen').forEach(s=>{ if(s!==target) s.style.display='none'; });
    if(id!=='game' && this.el.hud) this.hideGameUI();
    // Si vamos a niveles, asegurar que la lista se vea
    if(id==='levels' && this.el.levelList) this.el.levelList.style.display='block';
    return true;
  }
  showGameUI(){ document.querySelectorAll('.screen').forEach(s=>{ s.classList.remove('active'); s.style.display='none'; }); ['hud','bars','controls','vignette'].forEach(k=>{ if(this.el[k]) this.el[k].classList.add('show'); }); const c=document.getElementById('gameCanvas'); if(c) c.style.display='block'; }
  hideGameUI(){ ['hud','bars','controls','vignette'].forEach(k=>{ if(this.el[k]) this.el[k].classList.remove('show'); }); const c=document.getElementById('gameCanvas'); if(c) c.style.display='none'; }
  updateHome(){ const t=document.getElementById('totalStars'); if(t) t.textContent=this.save.totalStars()+' / 12'; const l=document.getElementById('lvlUnlocked'); if(l) l.textContent=(this.save.data.unlocked+1)+' de 4'; }
  renderLevels(onPick){
    if(!this.el.levelList) return;
    try{
      this.el.levelList.innerHTML='';
      LEVELS.forEach((lv,i)=>{
        const locked=!this.save.isUnlocked(i);
        const div=document.createElement('div'); div.className='level-card'+(locked?' locked':'');
        div.innerHTML=`<div class="big">${lv.emoji}</div><div style="flex:1"><b>Nivel ${i+1} - ${lv.name}</b><p class="small">${locked?'Completa el anterior':'<span class="badge">'+lv.stage+'</span> '+(lv.story||'').slice(0,110)+'...'}</p><div style="color:#ffd700">${'★'.repeat(this.save.data.stars[i])+'☆'.repeat(3-this.save.data.stars[i])}</div></div><div style="font-size:28px">${locked?'🔒':'▶️'}</div>`;
        if(!locked) div.onclick=()=>onPick(i);
        else div.onclick=()=>{ alert('🔒 Nivel bloqueado. Completa el Nivel '+i+' primero.'); };
        this.el.levelList.appendChild(div);
      });
    }catch(e){ console.error(e); this.el.levelList.innerHTML='<p class="small">⚠️ No se pudieron cargar los niveles: '+e.message+'</p>'; }
  }
  showIntro(idx, onEnter){
    const lv=LEVELS[idx];
    const e1=document.getElementById('introEmoji'); if(e1) e1.textContent=lv.emoji;
    const e2=document.getElementById('introTitle'); if(e2) e2.textContent=(idx+1)+'. '+lv.name+' - '+lv.stage;
    const e3=document.getElementById('introText'); if(e3) e3.textContent=lv.story+' Objetivo: '+(lv.keys?lv.keys+' llaves ':'')+(lv.gens?lv.gens+' generadores ':'')+'y escapa por la puerta dorada.';
    this.show('introLevel');
    const btn=document.getElementById('btnEnter'); if(btn) btn.onclick=()=>onEnter(idx);
  }
  showMessage(html,closable=true){ if(!this.el.msgBox||!this.el.msg) return; this.el.msgBox.innerHTML=html+(closable?'<div style="margin-top:12px"><button class="btn-ghost" onclick="document.getElementById(\'msg\').classList.remove(\'show\')">✕ Cerrar</button></div>':''); this.el.msg.classList.add('show'); }
  hideMessage(){ if(this.el.msg) this.el.msg.classList.remove('show'); }
  setHUD({levelName, keys, totalKeys, gens, totalGens, lives, time, monsterText, dist, compassText, stamina, battery, inventory}){
    const set=(id,txt)=>{ const el=document.getElementById(id); if(el) el.textContent=txt; };
    set('hudLevel',levelName); set('hudClues',keys+'/'+totalKeys); set('hudInv',inventory||'Vacío'); set('hudLives',lives);
    set('hudTime',String(Math.floor(time/60)).padStart(2,'0')+':'+String(time%60).padStart(2,'0')); set('hudMonster',monsterText); set('compass',compassText);
    const s=document.getElementById('stamBar'); if(s) s.style.width=stamina+'%'; const b=document.getElementById('batBar'); if(b) b.style.width=battery+'%';
    const a=document.getElementById('alert'); if(a) a.style.display=monsterText.includes('TE VE')?'block':'none';
  }
  showInteract(show){ const el=document.getElementById('interact'); if(el) el.style.display=show?'block':'none'; }
  showDamage(){ const d=document.getElementById('damage'); if(!d) return; d.style.display='block'; setTimeout(()=>d.style.display='none',400); }
}

