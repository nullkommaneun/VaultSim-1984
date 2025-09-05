// global Spielzustand
window.VS = {
  paused: true,
  speed: 1,           // 1x / 2x / 4x
  t: 0, day: 1, minute: 0,
  resources: { water:70, power:72, food:66, meds:55 },
  trust: { value: 8, stage:'PAUSED' }, // 0..100
  flags: {},
  log: [],
  rooms: [],
  residents: [],
  eventsQueue: []
};
