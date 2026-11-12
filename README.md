HELENA v4.5 MENU SIN CDN
- Menu (home/JUGAR/NIVELES/COMO JUGAR) funciona SIN main.js y SIN Three.js, con onclick directos y style inline.
- main.js carga Three.js solo al dar ENTRAR, con fallback jsdelivr->unpkg->cdnjs.
- Si CDN falla, te quedas en home con mensaje, no en negro.
- test.html prueba cada CDN con no-store.
Sube TODO y abre ?v=4.5
