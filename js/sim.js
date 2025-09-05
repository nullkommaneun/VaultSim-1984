// Tick-Logik, Misstrauen, Events, Autopause bei Entscheidungen
(function(){
  let rafId = null, lastTime = 0;

  function scarcityPenalty(res){
    let p=0; if(res.water<50) p+=0.4; if(res.food<50) p+=0.4; if(res.power<50) p+=0.3; if(res.meds<40) p+=0.3;
    return p;
  }
  function updateTrust(){
    if (VS.paused) return;
    const drift = 0.03 + scarcityPenalty(VS.resources);
    VS.trust.value = Math.min(100, VS.trust.value + drift);
    const t = VS.trust.value;
    VS.trust.stage = t<30?'LOW':t<60?'MID':t<85?'HIGH':'CRITICAL';
  }
  function moveResidents(){
    if (VS.paused) return;
    for(const r of VS.residents){
      // Verhalten abhängig von Trust
      if (VS.trust.value < 40) {
        r.behaviour = Math.random()<0.9?'work':'idle';
      } else if (VS.trust.value < 70) {
        r.behaviour = Math.random()<0.25?'whisper':(Math.random()<0.1?'argue':'work');
      } else {
        r.behaviour = Math.random()<0.4?'whisper':'argue';
      }
      // leichte Wanderung
      if (Math.random()<0.02){
        r.pos.x = clamp(r.pos.x + randInt(-1,1), 0, 5);
        r.pos.y = clamp(r.pos.y + randInt(-1,1), 0, 3);
        r.pos.z = [8, ISO.WALL_H+ISO.TILE_H+8, 2*(ISO.WALL_H+ISO.TILE_H)+8][randInt(0,2)];
      }
    }
  }
  function clamp(v,min,max){ return Math.max(min,Math.min(max,v)); }
  function randInt(a,b){ return Math.floor(a + Math.random()*(b-a+1)); }

  // --- Events & Entscheidungen ---
  const EventDeck = [{
    id:'water_leak',
    text:'Leck in Wasserleitung Sektor C. Druckverlust gemeldet.',
    options:[
      { id:'redistribute', label:'Umverteilung 20% aus Sektor A (sofort)', apply:(s)=>{
          s.resources.water -= 6; s.trust.value += 3; log('Directive #204 executed: Water Redistribution');
          report('Meldung: Beschwerden aus Sektor A.');
        }},
      { id:'ration', label:'Rationierung 24h (als Effizienzmaßnahme verkündet)', apply:(s)=>{
          s.resources.water += 4; s.resources.food -= 2; s.trust.value += 5; log('Directive #205 executed: Rationing Policy');
          report('Durchsage: „Effizienzmaßnahme aktiviert.“');
        }},
      { id:'repair', label:'Reparaturteam entsenden (plausibel, langsamer Effekt)', apply:(s)=>{
          s.resources.power -= 2; s.trust.value += 1; log('Directive #206 executed: Maintenance Dispatch');
          report('Info: Reparaturteam unterwegs.');
        }}
    ],
    trigger: s => s.resources.water < 72 && !s.flags.evt1
  }];

  function maybeQueueEvents(){
    if (VS.paused) return;
    for(const e of EventDeck){
      if (e.trigger(VS)){ VS.eventsQueue.push(e); VS.flags.evt1 = true; autopauseForDecision(e); break; }
    }
  }

  function autopauseForDecision(ev){
    VS.paused = true;
    UI.showDecision(ev);
    UI.updatePlayButton();
  }

  // --- HUD / Reports / Log (delegiert an UI) ---
  function report(msg){ UI.pushReport(msg); }
  function log(msg){ UI.logLine(msg); }

  // --- Ticker ---
  function frame(ts){
    if (!lastTime) lastTime = ts;
    const dt = Math.min(80, ts-lastTime);
    lastTime = ts;

    // Sim nur laufen lassen, wenn nicht pausiert
    if (!VS.paused){
      VS.t += dt * VS.speed;
      if (VS.t % 500 < dt) { // alle ~500ms
        VS.minute = (VS.minute + 5) % 60;
        if (VS.minute === 0) VS.day++;
        updateTrust();
        moveResidents();
        UI.updateHUD();
        if (Math.random()<0.02) UI.pushReport(pickReport());
        maybeQueueEvents();
      }
    }
    Renderer.render();
    rafId = requestAnimationFrame(frame);
  }

  function pickReport(){
    const msgs = [
      'INFO: Produktionsleistung bei 85%.',
      'HINWEIS: Engpass in Kantine Sektor B.',
      'ALERT: Geräusche nahe Wasseraufbereitung.',
      'INFO: Zwei Bewohner verweigerten Schichtwechsel.',
      'HINWEIS: Flüstern im Wohnblock F1.'
    ];
    return msgs[Math.floor(Math.random()*msgs.length)];
  }

  function startLoop(){ if (!rafId) rafId = requestAnimationFrame(frame); }
  function stopLoop(){ if (rafId) cancelAnimationFrame(rafId); rafId=null; }

  // Exporte
  window.SIM = { startLoop, stopLoop, autopauseForDecision };
})();
