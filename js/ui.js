// HUD, Terminal, Entscheidungen, Buttons, Pause/Speed
(function(){
  const $ = sel => document.querySelector(sel);

  function setBar(id, val, color){
    const el = $('#'+id); el.style.width = Math.max(0, Math.min(100,val))+'%';
    if (color) el.style.background = color;
  }

  function updateHUD(){
    setBar('bar-water', VS.resources.water);
    setBar('bar-power', VS.resources.power);
    setBar('bar-food',  VS.resources.food);
    setBar('bar-meds',  VS.resources.meds);

    const t = VS.trust.value;
    const stage = t<30?'LOW':t<60?'MID':t<85?'HIGH':'CRITICAL';
    VS.trust.stage = stage;
    $('#trust-stage').textContent = stage;
    const color = stage==='LOW'?'#1fae6d':stage==='MID'?'#e7b341':stage==='HIGH'?'#e77d41':'#d84a4a';
    setBar('bar-trust', t, color);
  }

  function logLine(msg){
    VS.log.unshift(msg);
    $('#log-feed').innerHTML = VS.log.slice(0,12).map(x=>`<p>${escapeHtml(x)}</p>`).join('');
  }
  function pushReport(msg){
    $('#report-feed').insertAdjacentHTML('afterbegin', `<p>${escapeHtml(msg)}</p>`);
  }

  function showDecision(ev){
    const box = $('#decision-box');
    box.innerHTML = `
      <p>${escapeHtml(ev.text)}</p>
      ${ev.options.map(o=>`<button class="option" data-id="${o.id}">${escapeHtml(o.label)}</button>`).join('')}
      <p class="hint">Simulation pausiert – wähle eine Direktive.</p>
    `;
    // Buttons
    box.querySelectorAll('button.option').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const opt = ev.options.find(x=>x.id===btn.dataset.id);
        opt.apply(VS);
        updateHUD();
        box.innerHTML = '<p>Keine aktiven Entscheidungen.</p>';
        // nach Entscheidung wieder weiterlaufen
        VS.paused = false;
        $('#help').style.display='none';
        updatePlayButton();
      });
    });
  }

  function updatePlayButton(){
    $('#btn-toggle').textContent = VS.paused ? '▶ Weiter' : '⏸ Pause';
    $('#trust-stage').textContent = VS.paused ? 'PAUSED' : VS.trust.stage || 'LOW';
  }

  function wireControls(){
    // Start-Overlay
    $('#btn-start').addEventListener('click', ()=>{
      VS.paused=false; $('#help').style.display='none'; updatePlayButton();
    });
    $('#btn-step').addEventListener('click', ()=>{
      // Einmaliger Tick: kurz entpausen und sofort wieder pausieren
      const wasPaused = VS.paused; VS.paused=false;
      setTimeout(()=>{ VS.paused=true; updatePlayButton(); }, 10);
    });
    // Sidebar
    $('#btn-toggle').addEventListener('click', ()=>{
      VS.paused = !VS.paused; if(!VS.paused) $('#help').style.display='none'; updatePlayButton();
    });
    document.querySelectorAll('#controls button[data-speed]').forEach(b=>{
      b.addEventListener('click', ()=>{ VS.speed = Number(b.dataset.speed)||1; logLine(`TimeScale set to ${VS.speed}×`); });
    });
    // Keyboard
    window.addEventListener('keydown', (e)=>{
      if (e.code==='Space'){ e.preventDefault(); VS.paused = !VS.paused; if(!VS.paused) $('#help').style.display='none'; updatePlayButton(); }
      if (e.key==='1') VS.speed=1;
      if (e.key==='2') VS.speed=2;
      if (e.key==='3') VS.speed=4;
    });
    // Restart
    $('#btn-restart').addEventListener('click', ()=>{ location.reload(); });
  }

  function escapeHtml(s){ return s.replace(/[&<>"']/g, m=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m])); }

  // Bootstrap
  window.addEventListener('DOMContentLoaded', ()=>{
    Renderer.initRenderer();
    Renderer.initWorld();
    updateHUD();
    logLine('System Online. Awaiting directives.');
    pushReport('INFO: Produktionsleistung bei 85%.');
    wireControls();
    SIM.startLoop();
  });

  // Exporte
  window.UI = { updateHUD, logLine, pushReport, showDecision, updatePlayButton };
})();
