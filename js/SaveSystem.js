// SaveSystem.js - Progreso guardado localmente (localStorage / JSON)
// Llave unica para no chocar con otras versiones
export class SaveSystem {
  constructor(key='helena_modular_v1'){
    this.key=key;
    this.data={unlocked:0, stars:[0,0,0,0], bestTime:{}, collected:{}, completed:[], settings:{view:'third', blood:true}};
    this.load();
  }
  load(){ try{ const raw=localStorage.getItem(this.key); if(raw) this.data={...this.data, ...JSON.parse(raw)}; }catch(e){} return this.data; }
  save(){ try{ localStorage.setItem(this.key, JSON.stringify(this.data)); }catch(e){} return this.data; }
  exportJSON(){ return JSON.stringify(this.data,null,2); }
  importJSON(json){ try{ this.data={...this.data,...JSON.parse(json)}; this.save(); }catch(e){} }
  // Calificacion 1-3 estrellas: 3 si rapido + todo recogido, 2 si medio, 1 si lento
  calcStars(levelIdx, timeSec, collected, total){
    let s=1;
    if(collected>=total && timeSec<240) s=3;
    else if(collected>=total && timeSec<420) s=2;
    else if(collected>=Math.ceil(total*0.7)) s=2;
    return s;
  }
  completeLevel(idx, timeSec, collected, total){
    const stars=this.calcStars(idx,timeSec,collected,total);
    if(stars>this.data.stars[idx]) this.data.stars[idx]=stars;
    if(!this.data.completed.includes(idx)) this.data.completed.push(idx);
    this.data.bestTime[idx]=Math.min(this.data.bestTime[idx]||9999, timeSec);
    this.data.collected[idx]=Math.max(this.data.collected[idx]||0, collected);
    if(idx===this.data.unlocked && idx<3) this.data.unlocked++;
    this.save(); return stars;
  }
  isUnlocked(idx){ return idx<=this.data.unlocked; }
  totalStars(){ return this.data.stars.reduce((a,b)=>a+b,0); }
}
export const saveSystem = new SaveSystem();
