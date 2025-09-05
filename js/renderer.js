// Zeichnet ein „Ameisenbau“-Diorama mit extrudierten Räumen (ohne externe Libs)
(function(){
  const DPR = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  const CAM = { x: 420, y: 140 };
  let cv, ctx;

  function initRenderer(){
    cv = document.getElementById('iso');
    ctx = cv.getContext('2d');
    resize();
    window.addEventListener('resize', resize);
  }

  function resize(){
    cv.width  = Math.floor(cv.clientWidth * DPR);
    cv.height = Math.floor(cv.clientHeight * DPR);
    ctx.setTransform(DPR,0,0,DPR,0,0);
  }

  function roomStyle(kind){
    switch(kind){
      case 'housing':  return { top:'#202b27', left:'#18211e', right:'#23302b', line:'#3a6b57' };
      case 'canteen':  return { top:'#253127', left:'#1b241d', right:'#2b3a2e', line:'#43735a' };
      case 'medbay':   return { top:'#20323a', left:'#18262b', right:'#27414a', line:'#4a7c8e' };
      case 'water':    return { top:'#1b2f38', left:'#14232a', right:'#203a47', line:'#356a81' };
      case 'generator':return { top:'#2b2421', left:'#201b19', right:'#3a2f2a', line:'#7a4c3d' };
      case 'security': return { top:'#262331', left:'#1d1a27', right:'#3a3549', line:'#7b68a6' };
      default:         return { top:'#202a26', left:'#18201d', right:'#2a372f', line:'#3a6b57' };
    }
  }

  function drawTile(cx,cy,style){
    const {TILE_W, TILE_H, WALL_H} = ISO;
    const hw=TILE_W/2, hh=TILE_H/2;

    // Top (Boden)
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx+hw, cy+hh);
    ctx.lineTo(cx, cy+TILE_H);
    ctx.lineTo(cx-hw, cy+hh);
    ctx.closePath();
    ctx.fillStyle = style.top; ctx.fill();
    ctx.strokeStyle = style.line; ctx.stroke();

    // Seitenwände (rechts & links) → Ameisenbau-Optik
    // rechte Wand
    ctx.beginPath();
    ctx.moveTo(cx+hw, cy+hh);
    ctx.lineTo(cx+hw, cy+hh+WALL_H);
    ctx.lineTo(cx,    cy+TILE_H+WALL_H);
    ctx.lineTo(cx,    cy+TILE_H);
    ctx.closePath();
    ctx.fillStyle = style.right; ctx.fill();

    // linke Wand
    ctx.beginPath();
    ctx.moveTo(cx-hw, cy+hh);
    ctx.lineTo(cx-hw, cy+hh+WALL_H);
    ctx.lineTo(cx,    cy+TILE_H+WALL_H);
    ctx.lineTo(cx,    cy+TILE_H);
    ctx.closePath();
    ctx.fillStyle = style.left; ctx.fill();

    // Kanten
    ctx.strokeStyle = style.line;
    ctx.beginPath();
    ctx.moveTo(cx+hw, cy+hh); ctx.lineTo(cx+hw, cy+hh+WALL_H);
    ctx.moveTo(cx-hw, cy+hh); ctx.lineTo(cx-hw, cy+hh+WALL_H);
    ctx.moveTo(cx-hw, cy+hh+WALL_H); ctx.lineTo(cx+hw, cy+hh+WALL_H);
    ctx.stroke();
  }

  function drawResident(sx,sy,behaviour){
    const y = sy - 12;
    ctx.beginPath();
    ctx.fillStyle = behaviour==='whisper' ? '#e7b341' : behaviour==='argue' ? '#e36b6b' : '#a8e6c5';
    ctx.arc(sx, y, 4, 0, Math.PI*2); ctx.fill();
    // Kopf-Symbol minimal
    if (behaviour==='whisper'){ ctx.fillRect(sx-2, y-14, 4, 3); }
    if (behaviour==='argue'){   ctx.fillRect(sx-2, y-14, 4, 3); }
  }

  function drawGraffiti(cx,cy){
    ctx.fillStyle = 'rgba(215,73,73,0.75)';
    ctx.fillRect(cx-12, cy+ISO.TILE_H+ISO.WALL_H-10, 24, 4);
  }

  function drawNoise(cx,cy){
    ctx.fillStyle = 'rgba(255,255,255,0.06)';
    ctx.fillRect(cx-8, cy+ISO.TILE_H-6, 16, 5);
  }

  function render(){
    const {rooms, residents, resources, trust} = VS;
    ctx.clearRect(0,0,cv.width,cv.height);
    ctx.fillStyle = '#0e1116';
    ctx.fillRect(0,0,cv.width,cv.height);

    // Räume pro Ebene zeichnen – von hinten nach vorn
    const sorted = rooms.slice().sort((a,b)=> (a.z-b.z) || (a.y-b.y) || (a.x-b.x));
    for(const room of sorted){
      const p = ISO.isoToScreen(room.x,room.y,room.z);
      const sx = p.x + CAM.x, sy = p.y + CAM.y;
      drawTile(sx, sy, roomStyle(room.kind));
      if (resources.power < 45 && Math.random()<0.02) drawNoise(sx,sy);
      if (trust.value >= 60 && Math.random()<0.006) drawGraffiti(sx,sy);
    }

    // Bewohner
    for(const r of residents){
      const p = ISO.isoToScreen(r.pos.x, r.pos.y, r.pos.z);
      drawResident(p.x + CAM.x, p.y + CAM.y, r.behaviour);
    }

    // Overlays (Game Over)
    document.getElementById('overlay').style.display = trust.value >= 100 ? 'flex' : 'none';
  }

  // Welt initialisieren (3 Ebenen, 6x4 Räume)
  function initWorld(){
    VS.rooms.length = 0; VS.residents.length = 0;
    for(let floor=0; floor<3; floor++){
      for(let gx=0; gx<6; gx++){
        for(let gy=0; gy<4; gy++){
          VS.rooms.push({
            id:`F${floor}-${gx}-${gy}`,
            kind: pick(['housing','canteen','medbay','water','generator','security']),
            x:gx, y:gy, z: floor*(ISO.WALL_H+ISO.TILE_H)+8
          });
        }
      }
    }
    const names = 'Ada,Jon,Mira,Leo,Kai,Ina,Nora,Eli,Tao,Rex,Lia,Oli,Ara,Max,Yun,Noe,Ivo,Una,Sol,Pia'.split(',');
    for(let i=0;i<22;i++){
      VS.residents.push({
        id:'R'+i, name:names[i%names.length],
        mood: 60+rand(-10,10),
        pos:{ x: randInt(0,5), y: randInt(0,3), z: [8, ISO.WALL_H+ISO.TILE_H+8, 2*(ISO.WALL_H+ISO.TILE_H)+8][randInt(0,2)] },
        behaviour: 'work'
      });
    }
  }

  function pick(arr){ return arr[Math.floor(Math.random()*arr.length)]; }
  function rand(a,b){ return a + Math.random()*(b-a); }
  function randInt(a,b){ return Math.floor(rand(a,b+1)); }

  // Exporte
  window.Renderer = { initRenderer, render, initWorld };
})();
