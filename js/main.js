(function(){
  const { TILE_W, TILE_H, PIVOT_X, PIVOT_Y } = ISO;

  // Iso-Koordinate -> Screen (2:1)
  function isoToScreen(x, y, z=0){
    const sx = (x - y) * (TILE_W/2);
    const sy = (x + y) * (TILE_H/2) - z;
    return { x:sx, y:sy };
  }

  // Pixi App
  const app = new PIXI.Application({
    background: 0x0e1116,
    resizeTo: document.getElementById('stage')
  });
  document.getElementById('stage').appendChild(app.view);

  // Root-Layer
  const layer = new PIXI.Container();
  layer.sortableChildren = true; // zIndex aktiv
  app.stage.addChild(layer);

  // Camera Offset (zentriere den „Ameisenbau“)
  const CAM = { x: 420, y: 130 };

  // Assets laden
  async function loadTextures(){
    const entries = Object.entries(FLOOR_ASSETS);
    const promises = entries.map(([key, url]) => PIXI.Assets.load(url).then(tex => [key, tex]));
    const pairs = await Promise.all(promises);
    const map = Object.fromEntries(pairs);
    return map;
  }

  function addTileSprite(tex, gx, gy, gz){
    const s = new PIXI.Sprite(tex);
    // Pivot bottom-center gemäß Spez (32,32)
    s.anchor.set(0.5, 1.0);
    const p = isoToScreen(gx, gy, gz);
    s.x = p.x + CAM.x;
    s.y = p.y + CAM.y;
    // Depth: zIndex nach (gz, gy, gx)
    s.zIndex = gz*10000 + gy*100 + gx;
    layer.addChild(s);
    return s;
  }

  // Fallback, falls eine PNG fehlt
  function addPlaceholder(gx, gy, gz, color=0x3a5f4a){
    const g = new PIXI.Graphics().rect(-32,-32,64,32).fill(color).stroke({color:0x224433, width:1});
    g.pivot.set(0,0);
    const p = isoToScreen(gx, gy, gz);
    g.x = p.x + CAM.x - 32;
    g.y = p.y + CAM.y;
    g.alpha = 0.4;
    g.zIndex = gz*10000 + gy*100 + gx;
    layer.addChild(g);
  }

  async function bootstrap(){
    const textures = await loadTextures();

    // Ebenen von hinten nach vorn
    for(const layerDef of FLOOR_LAYOUT){
      const gz = layerDef.z;
      const grid = layerDef.grid;
      for(let gy=0; gy<grid.length; gy++){
        for(let gx=0; gx<grid[gy].length; gx++){
          const key = grid[gy][gx];
          const tex = textures[key];
          if (tex) addTileSprite(tex, gx, gy, gz);
          else     addPlaceholder(gx, gy, gz);
        }
      }
    }

    // Info-Ecke
    const info = document.createElement('div');
    info.className = 'info';
    info.innerHTML = `Tiles geladen: ${Object.keys(textures).length}<br>Missing Tiles werden als Platzhalter gezeichnet.`;
    document.body.appendChild(info);
  }

  bootstrap();
})();
