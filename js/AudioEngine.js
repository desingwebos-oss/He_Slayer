// AudioEngine.js v4.3 - Completo: plasma + toggle + ensure
export class AudioEngine {
  constructor(){ this.ctx=null; this.muted=false; this.ambientNodes=[]; }
  ensure(){ if(!this.ctx){ try{ this.ctx=new (window.AudioContext||window.webkitAudioContext)(); }catch(e){} } if(this.ctx && this.ctx.state==='suspended') this.ctx.resume(); return this.ctx; }
  setMuted(m){ this.muted=m; }
  toggle(){ this.muted=!this.muted; const t=document.getElementById('muteTxt'); if(t) t.textContent=this.muted?'Sonido OFF':'Sonido ON'; return this.muted; }
  tone(freq,dur,type='sine',vol=0.12,slide=0){ if(this.muted) return; const ac=this.ensure(); if(!ac) return; const o=ac.createOscillator(), g=ac.createGain(); o.type=type; o.frequency.setValueAtTime(freq,ac.currentTime); if(slide) o.frequency.exponentialRampToValueAtTime(Math.max(20,slide),ac.currentTime+dur); g.gain.setValueAtTime(vol,ac.currentTime); g.gain.exponentialRampToValueAtTime(0.001,ac.currentTime+dur); o.connect(g); g.connect(ac.destination); o.start(); o.stop(ac.currentTime+dur); }
  noise(dur=0.08,vol=0.05){ if(this.muted) return; const ac=this.ensure(); if(!ac) return; const len=ac.sampleRate*dur, buf=ac.createBuffer(1,len,ac.sampleRate), d=buf.getChannelData(0); for(let i=0;i<len;i++) d[i]=(Math.random()*2-1)*(1-i/len); const s=ac.createBufferSource(); s.buffer=buf; const g=ac.createGain(); g.gain.value=vol; s.connect(g); g.connect(ac.destination); s.start(); }
  beep(f=880){ this.tone(f,0.12,'sine',0.1); }
  click(){ this.tone(1200,0.05,'square',0.04,800); this.tone(900,0.05,'square',0.04,600); }
  roar(){ if(this.muted) return; this.tone(80,0.8,'sawtooth',0.25,40); this.tone(120,0.7,'sawtooth',0.18,50); this.noise(0.6,0.12); }
  heartbeat(i){ if(this.muted||i<=0) return; this.tone(55,0.12,'sine',0.25*i); setTimeout(()=>this.tone(50,0.1,'sine',0.2*i),180); }
  plasma(){ this.tone(1400,0.15,'sawtooth',0.12,200); this.noise(0.1,0.08); }
  startAmbient(){ const ac=this.ensure(); if(!ac||this.ambientNodes.length) return; const o=ac.createOscillator(), g=ac.createGain(); o.type='sine'; o.frequency.value=42; g.gain.value=0.04; o.connect(g); g.connect(ac.destination); o.start(); this.ambientNodes.push(o,g); }
}
export const audio = new AudioEngine();
