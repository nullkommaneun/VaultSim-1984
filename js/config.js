// Liste deiner Boden-Tiles (Dateinamen exakt so ablegen)
window.FLOOR_ASSETS = {
  corridor:  "assets/png/tile_floor_corridor_A.png",
  housing:   "assets/png/tile_floor_housing_A.png",
  canteen:   "assets/png/tile_floor_canteen_A.png",
  medbay:    "assets/png/tile_floor_medbay_A.png",
  water:     "assets/png/tile_floor_water_A.png",
  generator: "assets/png/tile_floor_generator_A.png",
  security:  "assets/png/tile_floor_security_A.png"
};

// Beispiel-Layout (nur Böden), 3 Ebenen à 6×4
// Werte sind Keys aus FLOOR_ASSETS. Passe das nach Bedarf an.
window.FLOOR_LAYOUT = [
  { z: 0,   grid: [
    ["corridor","housing","housing","corridor","generator","security"],
    ["corridor","housing","canteen","corridor","generator","security"],
    ["corridor","corridor","canteen","medbay","water","water"],
    ["corridor","corridor","corridor","medbay","water","security"]
  ]},
  { z: 40,  grid: [
    ["housing","housing","canteen","corridor","corridor","security"],
    ["housing","canteen","canteen","corridor","water","water"],
    ["corridor","canteen","medbay","medbay","water","security"],
    ["corridor","corridor","corridor","generator","generator","security"]
  ]},
  { z: 80,  grid: [
    ["housing","corridor","corridor","corridor","security","security"],
    ["housing","canteen","corridor","medbay","water","security"],
    ["corridor","canteen","medbay","medbay","water","generator"],
    ["corridor","corridor","corridor","generator","generator","generator"]
  ]}
];

// Isometrie-Konstanten (2:1)
window.ISO = { TILE_W:64, TILE_H:32, PIVOT_X:32, PIVOT_Y:32 };
