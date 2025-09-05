// Isometrie-Basics + Hilfsfunktionen
(function(){
  const TILE_W = 64, TILE_H = 32, WALL_H = 28;

  function isoToScreen(x,y,z=0){
    return { x: (x-y)*(TILE_W/2), y: (x+y)*(TILE_H/2) - z };
  }
  function clamp(v,min,max){ return Math.max(min, Math.min(max, v)); }

  // Export
  window.ISO = { TILE_W, TILE_H, WALL_H, isoToScreen, clamp };
})();
