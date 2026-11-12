"use strict";

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const locationText = document.getElementById("location");
const hint = document.getElementById("hint");

const WORLD = { minX: -3000, w: 5600, h: 4900 };
const INTERIOR = { w: 2600, h: 1900 };
const ROAD = 100;
const DESERT_EDGE_X = 0;
const DESERT_TOWN = { x: -2850, y: 2520, w: 1430, h: 1050 };
const DESERT_FRONTIER = { x: -3000, y: 3570, w: 3000, h: 1330 };
const DESERT_VX = [-2850, -2420, -1990, -1520];
const DESERT_HY = [2520, 2900, 3280];
const DESERT_MILITARY_BASE = {
  x: -2990, y: 3940, w: 1110, h: 920
};
const DESERT_MILITARY_ROAD = {
  x: -2420,
  y: DESERT_HY.at(-1) + ROAD,
  turnY: 4380,
  endX: -2670
};
const DESERT_RIVER = {
  x: -65, y: 235, w: 130, h: 3860
};
const DESERT_CONNECTOR = {
  x: -1940, y: 3330, endX: 0, endY: 3480
};
const DESERT_BRIDGE = {
  x: DESERT_RIVER.x, y: DESERT_CONNECTOR.endY - ROAD / 2,
  w: DESERT_RIVER.w, h: ROAD
};
const DESERT_CURVES = [];
const DESERT_ROAD_SEGMENTS = [
  ...DESERT_HY.map(y => ({
    x: DESERT_TOWN.x, y, w: DESERT_TOWN.w, h: ROAD
  })),
  ...DESERT_VX.map(x => ({
    x, y: DESERT_TOWN.y, w: ROAD,
    h: DESERT_HY.at(-1) + ROAD - DESERT_TOWN.y
  })),
  {
    x: DESERT_CONNECTOR.x - 28,
    y: DESERT_CONNECTOR.y,
    w: 56,
    h: DESERT_CONNECTOR.endY - DESERT_CONNECTOR.y
  },
  {
    x: DESERT_CONNECTOR.x,
    y: DESERT_CONNECTOR.endY - 28,
    w: DESERT_CONNECTOR.endX - DESERT_CONNECTOR.x,
    h: 56
  },
  {
    x: DESERT_MILITARY_ROAD.x - 28,
    y: DESERT_MILITARY_ROAD.y,
    w: 56,
    h: DESERT_MILITARY_ROAD.turnY - DESERT_MILITARY_ROAD.y
  },
  {
    x: Math.min(DESERT_MILITARY_ROAD.x,
      DESERT_MILITARY_ROAD.endX),
    y: DESERT_MILITARY_ROAD.turnY - 28,
    w: Math.abs(DESERT_MILITARY_ROAD.endX -
      DESERT_MILITARY_ROAD.x),
    h: 56
  },
  DESERT_BRIDGE
];
function drawDesertRoadNetwork(
  projectX = x => x, projectY = y => y,
  scaleX = 1, scaleY = 1, markings = true
) {
  for (const segment of DESERT_ROAD_SEGMENTS) {
    const x = projectX(segment.x);
    const y = projectY(segment.y);
    const w = segment.w * scaleX;
    const h = segment.h * scaleY;
    const borderX = 10 * scaleX;
    const borderY = 10 * scaleY;
    rect(x - borderX, y - borderY, w + borderX * 2,
      h + borderY * 2, "#c7c7b9");
    rect(x, y, w, h, "#525a60");
    if (!markings || segment === DESERT_BRIDGE) continue;

    const horizontal = segment.w >= segment.h;
    const length = horizontal ? segment.w : segment.h;
    const markLength = 22;
    for (let offset = 14; offset < length - 8; offset += 42) {
      if (horizontal) {
        line(projectX(segment.x + offset), projectY(segment.y + segment.h / 2),
          projectX(segment.x + Math.min(offset + markLength, length - 4)),
          projectY(segment.y + segment.h / 2), "#d5c899",
          Math.max(1, 2 * scaleY));
      } else {
        line(projectX(segment.x + segment.w / 2), projectY(segment.y + offset),
          projectX(segment.x + segment.w / 2),
          projectY(segment.y + Math.min(offset + markLength, length - 4)),
          "#d5c899", Math.max(1, 2 * scaleX));
      }
    }
  }
}
const DESERT_POLICE_BASE = {
  x: -1880, y: 2630, w: 190, h: 180
};
const DESERT_POLICE_PARKING = {
  x: -1670, y: 2640, w: 90, h: 160
};
const COAST_GUARD_BASE = {
  x: -260, y: 300, w: 220, h: 165
};
const DESERT_VEGETATION = [];

for (let x = WORLD.minX + 80; x < DESERT_EDGE_X; x += 165) {
  for (let y = 330; y < WORLD.h - 40; y += 185) {
    const seed = Math.abs(Math.imul(x + 3011, 374761393) ^
      Math.imul(y + 97, 668265263));
    const px = x + (seed % 91) - 45;
    const py = y + (Math.floor(seed / 97) % 91) - 45;
    const inTown = px >= DESERT_TOWN.x - 90 &&
      px <= DESERT_TOWN.x + DESERT_TOWN.w + 90 &&
      py >= DESERT_TOWN.y - 90 &&
      py <= DESERT_TOWN.y + DESERT_TOWN.h + 90 &&
      (DESERT_VX.some(roadX => Math.abs(px - roadX - ROAD / 2) < 90) ||
        DESERT_HY.some(roadY =>
          Math.abs(py - roadY - ROAD / 2) < 90));
    const onConnector = px > DESERT_CONNECTOR.x - 75 &&
      px < DESERT_CONNECTOR.endX + 75 &&
      (Math.abs(py - DESERT_CONNECTOR.endY) < 95 ||
        px < DESERT_CONNECTOR.x + 75 &&
        py > DESERT_CONNECTOR.y - 75 &&
        py < DESERT_CONNECTOR.endY + 75);
    const inRiver = px > DESERT_RIVER.x - 50 &&
      px < DESERT_RIVER.x + DESERT_RIVER.w + 50 &&
      py > DESERT_RIVER.y - 50 &&
      py < DESERT_RIVER.y + DESERT_RIVER.h + 50;
    if (inTown || onConnector || inRiver) continue;
    DESERT_VEGETATION.push({
      x: px,
      y: py,
      kind: seed % 4 === 0 ? "cactus" :
        seed % 4 === 1 ? "shrub" : "rock",
      size: 0.7 + seed % 6 / 10
    });
  }
}

const VX = [
  420, 870, 1320, 1770, 2220, 2670,
  3120, 3570, 4020, 4470, 4920
];
const HY = [1380, 1790, 2200, 2610, 3020, 3430, 3840];

const FATEC = {
  x: 2160, y: 450, w: 1280, h: 470,
  type: "fatec", solid: true
};

const CAMPUS = { x: 1980, y: 300, w: 1640, h: 900 };
const ENTRY = { x: 2800, y: 965 };
const EXIT = { x: 860, y: 1845 };
const INDOOR_SPAWN = { x: 860, y: 1750 };

const ESPELINHOS = {
  x: 3650, y: 1050, w: 300, h: 190,
  type: "espetinhos", solid: true
};

const RAINBOW = [
  "#e40303", "#ff8c00", "#ffed00",
  "#008026", "#24408e", "#732982"
];

const LIGHT_SKIN = "#efd0b1";
const skins = [
  "#e8b98d", "#c98b63", "#8d5a3b", "#6b432b"
];
const shirts = [
  "#c85a5a", "#4f7ea8", "#5f8d5a",
  "#b98b4a", "#7a5f9c", "#5a8b8b"
];
const hairs = [
  "#2b2118", "#5c3a22", "#b08b50", "#34343d"
];

const player = {
  name: "Player", x: 2800, y: 1250, radius: 11,
  speed: 235, shirt: "#367f91",
  skin: "#d6a680", hair: "#49352c",
  step: 0, walking: false, facing: "down"
};

const keys = new Set();
const camera = { x: 0, y: 0 };

const buildings = [], parks = [], walls = [], trees = [];
const people = [], beachPeople = [], vehicles = [], animals = [];
const snakes = [], students = [], jeanStudents = [];
const customers = [];
const rooms = [], insideWalls = [], furniture = [], cracks = [];

let felipe, zannetu, linux, evangelista, joao, wagner, nicolas;
let jean, psicologa, tia;

let inside = false, width = 1, height = 1, dpr = 1;
let lastTime = 0, time = 0, interactRequested = false;
let studentTimer = 2, lastStudent = -1;

const PHRASES = {
  felipe: [
    "Eu sou o Felipe e sou gay.",
    "Me aceite, mundo."
  ],
  zannetu: [
    "Python é um lixo.",
    "Eu amo o Texas.",
    "Meus alunos são muito burros.",
    "Faça esse favor, Linux.",
    "Linux é o melhor sistema do mundo."
  ],
  evangelista: [
    "Eu tenho dois empregos… quer dizer, vinte.",
    "Hoje o turno no McDonald's foi pesado.",
    "Essa faculdade está arruinada.",
    "Onde vou arrumar tantos professores?"
  ],
  joao: [
    "Eu amo Python.",
    "Venha cá, Tkinter.",
    "Nunca mais volto para essa faculdade.",
    "Meus alunos só sabem usar IA."
  ],
  alunos: [
    "Queremos aula!",
    "Que aula horrível!",
    "Uma aula de só vinte minutos! Ele merece isso.",
    "Esse cara se dizia professor."
  ],
  jean: [
    "Hahaha... tentem me acompanhar!",
    "Java, Java, Javaaaa!",
    "Eu sou mau! Hahaha!",
    "Eu sou mais rápido que meus alunos! Haha!"
  ],
  psicologa: [
    "Mindset.",
    "A frequência das coisas boas.",
    "Eu amo Pablo Marçal.",
    "O magnetismo emocional."
  ]
};

const rand = (a, b) => a + Math.random() * (b - a);
const pick = a => a[Math.floor(Math.random() * a.length)];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

function rect(x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}
function round(x, y, w, h, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.fill();
}
function oval(x, y, rx, ry, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}
function line(x1, y1, x2, y2, color, w = 1) {
  ctx.strokeStyle = color;
  ctx.lineWidth = w;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}
function poly(points, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  points.forEach((p, i) =>
    i ? ctx.lineTo(...p) : ctx.moveTo(...p)
  );
  ctx.closePath();
  ctx.fill();
}
function text(
  value, x, y, size = 13, color = "#fff", weight = 600
) {
  ctx.save();
  ctx.font = `${weight} ${size}px "Segoe UI",Arial`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = color;
  ctx.fillText(value, x, y);
  ctx.restore();
}
function visible(x, y, m = 120) {
  return x > camera.x - m && x < camera.x + width + m &&
    y > camera.y - m && y < camera.y + height + m;
}
function visibleBox(b) {
  return b.x + b.w > camera.x - 120 &&
    b.x < camera.x + width + 120 &&
    b.y + b.h > camera.y - 160 &&
    b.y < camera.y + height + 160;
}
function intersects(x, y, r, b) {
  return x + r > b.x && x - r < b.x + b.w &&
    y + r > b.y && y - r < b.y + b.h;
}
function inCampus(x, y, pad = 0) {
  return x > CAMPUS.x - pad &&
    x < CAMPUS.x + CAMPUS.w + pad &&
    y > CAMPUS.y - pad &&
    y < CAMPUS.y + CAMPUS.h + pad;
}
function blockedOutside(x, y, r = 11) {
  return x < WORLD.minX + r || x > WORLD.w - r ||
    y < SEA_TOP + r || y > WORLD.h - r ||
    walls.some(b => intersects(x, y, r, b)) ||
    buildings.some(b => b.solid && intersects(x, y, r, b));
}
function blockedInside(x, y, r = 11) {
  return x < 30 + r || x > INTERIOR.w - 30 - r ||
    y < 30 + r || y > INTERIOR.h - 30 - r ||
    insideWalls.some(b => intersects(x, y, r, b)) ||
    furniture.some(b => b.solid && intersects(x, y, r, b));
}
function addWall(x, y, w, h) {
  insideWalls.push({ x, y, w, h });
}
function prop(type, x, y, w, h, extra = {}) {
  const p = { type, x, y, w, h, solid: true, ...extra };
  furniture.push(p);
  return p;
}
