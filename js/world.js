"use strict";

/* ================= CIDADE ================= */

function createCity() {
  const types = [
    "tower", "shop", "park", "factory", "apartment",
    "hospital", "temple", "cafe", "greenhouse", "cinema",
    "hotel", "stadium", "lighthouse", "library", "windmill",
    "mall", "watertower", "school", "radio", "restaurant",
    "castle", "dome", "police", "fire", "museum",
    "station", "aquarium"
  ];

  const xs = [0, ...VX.map(x => x + ROAD)];
  const xe = [...VX, WORLD.w];
  const ys = [1280, ...HY.map(y => y + ROAD)];
  const ye = [...HY, 4050];
  let index = 0;

  ys.forEach((y, row) => {
    const h = ye[row] - y;

    if (h < 170) return;

    xs.forEach((x, col) => {
      const w = xe[col] - x;
      const type = types[index % types.length];

      const bw = Math.min(
        w - 80,
        ["shop", "cafe"].includes(type) ? 220 : 330
      );
      const bh = Math.min(h - 80, 240);

      const b = {
        x: x + (w - bw) / 2,
        y: y + (h - bh) / 2,
        w: bw, h: bh, type,
        solid: !["park", "stadium"].includes(type),
        variant: index++
      };

      buildings.push(b);

      if (type === "park") parks.push(b);
    });
  });

  buildings.push(FATEC);
  buildings.push(ESPELINHOS);

  const cx = 2800, gap = 200;

  for (const y of [300, 1184]) {
    walls.push({
      x: 1980, y, w: cx - gap / 2 - 1980, h: 16
    });
    walls.push({
      x: cx + gap / 2, y, w: 3620 - cx - gap / 2, h: 16
    });
  }

  walls.push({ x: 1980, y: 300, w: 16, h: 900 });
  walls.push({ x: 3604, y: 300, w: 16, h: 900 });

  for (let i = 0; i < 230; i++) {
    trees.push({
      x: rand(30, 5570),
      y: rand(4110, 4860),
      s: rand(22, 40)
    });
  }
}

/* ================= INTERIOR ================= */

function buildRoomWalls(r) {
  const thick = 16, gap = 120;
  const mx = r.x + r.w / 2;
  const my = r.y + r.h / 2;

  for (const y of [r.y, r.y + r.h - thick]) {
    addWall(r.x, y, mx - gap / 2 - r.x, thick);
    addWall(
      mx + gap / 2, y,
      r.x + r.w - mx - gap / 2, thick
    );
  }

  for (const x of [r.x, r.x + r.w - thick]) {
    addWall(x, r.y, thick, my - gap / 2 - r.y);
    addWall(
      x, my + gap / 2,
      thick, r.y + r.h - my - gap / 2
    );
  }
}

function createInterior() {
  const layout = [
    ["class", "class", "lab"],
    ["lab", "patio", "lab"],
    ["class", "auditorium", "lab"]
  ];

  let classroom = 0, lab = 0;

  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      const type = layout[row][col];

      const r = {
        x: 60 + col * 880,
        y: 60 + row * 640,
        w: 720, h: 500, type,
        name: type === "class" ?
          `Sala ${++classroom}` :
          type === "lab" ?
            `Informática ${++lab}` :
            type === "patio" ?
              "Pátio" : "Auditório"
      };

      rooms.push(r);
      buildRoomWalls(r);

      if (type === "class" || type === "lab") {
        for (const dy of [130, 340]) {
          for (const dx of [90, 480]) {
            prop(
              type === "lab" ? "computer" : "desk",
              r.x + dx, r.y + dy, 145, 60,
              { room: r }
            );
          }
        }

        prop(
          "teacher", r.x + 80, r.y + 55, 145, 60,
          { room: r }
        );
        prop(
          "bin", r.x + r.w - 48, r.y + r.h - 55, 20, 25
        );
      }

      if (type === "auditorium") {
        prop(
          "stage", r.x + 120, r.y + 45, 480, 90,
          { solid: false }
        );

        for (const dy of [180, 290, 400]) {
          for (const dx of [
            70, 150, 230, 435, 515, 595
          ]) {
            prop(
              "seat", r.x + dx, r.y + dy, 52, 36
            );
          }
        }
      }

      if (type === "patio") {
        for (const dx of [90, 470]) {
          for (const dy of [110, 330]) {
            prop(
              "planter", r.x + dx, r.y + dy, 150, 65
            );
          }
        }

        prop("bench", r.x + 95, r.y + 205, 115, 20);
        prop("bench", r.x + 510, r.y + 205, 115, 20);
      }
    }
  }

  for (let i = 0; i < 260; i++) {
    cracks.push({
      x: rand(45, 2550),
      y: rand(45, 1850),
      s: rand(15, 38),
      seed: rand(0, 1)
    });
  }

  for (const y of [605, 1245]) {
    prop("water", 45, y, 42, 35);
    prop("notice", 2480, y, 70, 35);
  }
}

/* ================= ROTAS ================= */

function setCircuit(p, points) {
  p.route = points;
  p.index = Math.floor(Math.random() * points.length);
  p.x = points[p.index].x;
  p.y = points[p.index].y;
  p.target = (p.index + 1) % points.length;
  p.step = p.step || 0;
}

function followCircuit(p, dt) {
  let remaining = p.speed * dt;

  for (let guard = 0; remaining > 0 && guard < 100; guard++) {
    const t = p.route[p.target];
    const dx = t.x - p.x, dy = t.y - p.y;
    const d = Math.hypot(dx, dy);

    if (d < .001) {
      p.target = (p.target + 1) % p.route.length;
      continue;
    }

    p.angle = Math.atan2(dy, dx);
    const step = Math.min(d, remaining);

    p.x += dx / d * step;
    p.y += dy / d * step;
    remaining -= step;

    if (step >= d) {
      p.target = (p.target + 1) % p.route.length;
    }
  }

  p.step += dt * 9;
}

function rectangleRoute(l, t, r, b) {
  return [
    { x: l, y: t }, { x: r, y: t },
    { x: r, y: b }, { x: l, y: b }
  ];
}

function gridPoint(c, r) {
  return { x: VX[c] + 50, y: HY[r] + 50 };
}

function spawnTraveler(p) {
  p.col = Math.floor(rand(0, VX.length));
  p.row = Math.floor(rand(0, HY.length));

  Object.assign(p, gridPoint(p.col, p.row));
  p.previous = null;

  chooseGridTarget(p);
}

function chooseGridTarget(p) {
  const options = [];

  for (const [dc, dr] of [
    [1, 0], [-1, 0], [0, 1], [0, -1]
  ]) {
    const c = p.col + dc;
    const r = p.row + dr;

    if (
      c >= 0 && c < VX.length &&
      r >= 0 && r < HY.length
    ) {
      options.push({ c, r });
    }
  }

  const filtered = options.filter(o =>
    !p.previous ||
    o.c !== p.previous.c ||
    o.r !== p.previous.r
  );

  const next = pick(
    filtered.length ? filtered : options
  );

  p.nextCol = next.c;
  p.nextRow = next.r;
  p.destination = gridPoint(next.c, next.r);
}

function moveTraveler(p, dt) {
  let remaining = p.speed * dt;

  for (let guard = 0; remaining > 0 && guard < 50; guard++) {
    const dx = p.destination.x - p.x;
    const dy = p.destination.y - p.y;
    const d = Math.hypot(dx, dy);

    if (d < .001) {
      p.previous = { c: p.col, r: p.row };
      p.col = p.nextCol;
      p.row = p.nextRow;
      chooseGridTarget(p);
      continue;
    }

    p.angle = Math.atan2(dy, dx);
    const step = Math.min(d, remaining);

    p.x += dx / d * step;
    p.y += dy / d * step;
    remaining -= step;
  }

  p.step += dt * 9;
}

function nicolasRoute() {
  const path = [];

  for (let row = 0; row < HY.length; row++) {
    const cols = Array.from(
      { length: VX.length }, (_, i) => i
    );

    if (row % 2) cols.reverse();

    cols.forEach(col =>
      path.push(gridPoint(col, row))
    );
  }

  return [
    ...path,
    ...path.slice(1, -1).reverse()
  ];
}

/* ================= PERSONAGENS ================= */

function appearance() {
  const gender = Math.random() < .5 ? "woman" : "man";
  const ageRoll = Math.random();
  const age = ageRoll < .13 ? "young" :
    ageRoll < .89 ? "adult" : "elder";
  const hairStyles = gender === "woman"
    ? ["short", "wavy", "curly", "long", "bun"]
    : ["short", "curly", "wavy"];
  return {
    skin: pick(skins),
    hair: pick(hairs),
    shirt: pick(shirts),
    outfitStyle: pick(["plain", "jacket", "stripe"]),
    gender,
    age,
    pregnant: gender === "woman" && age === "adult" &&
      Math.random() < .08,
    hairStyle: pick(hairStyles),
    facialHair: gender === "man" && age !== "young" &&
      Math.random() < .32,
    step: 0
  };
}

function speaker(name, key, extra = {}) {
  return {
    name, key, speech: "",
    speechTimer: 0,
    nextSpeech: rand(2, 7),
    lastPhrase: -1,
    ...appearance(),
    ...extra
  };
}

function createPeople() {
  for (let i = 0; i < 90; i++) {
    const c = Math.floor(rand(0, VX.length - 1));
    const r = Math.floor(rand(0, HY.length - 1));

    const p = {
      ...appearance(),
      socialClass: Math.random() < .14 ? "wealthy" :
        Math.random() < .2 ? "working" : "middle",
      speed: rand(24, 40)
    };

    const route = rectangleRoute(
      VX[c] + 117, HY[r] + 117,
      VX[c + 1] - 17, HY[r + 1] - 17
    );

    if (Math.random() < .5) route.reverse();

    setCircuit(p, route);
    people.push(p);
  }

  felipe = speaker("FelipeGay", "felipe", {
    special: true, speed: 43,
    skin: LIGHT_SKIN
  });

  zannetu = speaker("Zannetu", "zannetu", {
    professor: true, speed: 38,
    shirt: "#34414e", hair: "#45413e",
    skin: LIGHT_SKIN
  });

  spawnTraveler(felipe);
  spawnTraveler(zannetu);

  zannetu.trail = [
    { x: zannetu.x, y: zannetu.y }
  ];

  linux = {
    name: "linux",
    x: zannetu.x, y: zannetu.y, step: 0
  };

  evangelista = speaker(
    "Evangelista", "evangelista", {
    professor: true, tired: true, speed: 31,
    shirt: "#4d555d", skin: LIGHT_SKIN
  }
  );

  setCircuit(
    evangelista,
    rectangleRoute(2040, 365, 3560, 1100)
  );

  joao = speaker("João Paulo", "joao", {
    x: rand(400, 5100),
    y: rand(4400, 4650),
    casual: true, stationary: true,
    shirt: "#6d8f5a", skin: LIGHT_SKIN
  });

  for (let i = trees.length - 1; i >= 0; i--) {
    if (distance(trees[i], joao) < 150) {
      trees.splice(i, 1);
    }
  }

  for (let i = 0; i < 12; i++) {
    const a = i * Math.PI * 2 / 12;
    const r = rand(48, 100);

    snakes.push({
      x: joao.x + Math.cos(a) * r,
      y: joao.y + Math.sin(a) * r * .65,
      angle: rand(0, Math.PI * 2),
      length: rand(30, 60),
      phase: rand(0, 6),
      color: pick([
        "#4d713c", "#87753f", "#5c8962"
      ])
    });
  }

  wagner = {
    name: '"professor" Wagner',
    x: WORLD.w - 310, y: 670,
    skin: "#71462f",
    hair: "#211b18",
    shirt: "#8b6476",
    stationary: true, step: 0
  };

  for (let i = 0; i < 16; i++) {
    const a = i * Math.PI * 2 / 16;
    const r = i % 2 ? 220 : 245;

    students.push(speaker("", "alunos", {
      x: wagner.x + Math.cos(a) * r,
      y: wagner.y + Math.sin(a) * r * .85,
      angry: true, stationary: true,
      studentIndex: i
    }));
  }

  nicolas = {
    name: "Nicolas",
    kind: "bike", speed: 430,
    color: "#df7050",
    skin: LIGHT_SKIN,
    shirt: "#365db0",
    step: 0
  };

  setCircuit(nicolas, nicolasRoute());

  for (let i = 0; i < 55; i++) {
    let x, y;

    do {
      x = rand(50, 5550);
      y = rand(280, 1160);
    } while (inCampus(x, y, 40));

    beachPeople.push({
      ...appearance(),
      x, y, beach: true,
      outfit: i % 3, hat: i % 5 === 0,
      swim: pick([
        "#d86d74", "#4b9fc8",
        "#51a08a", "#e3b74c"
      ]),
      speed: rand(16, 27),
      angle: rand(0, 6.28),
      turn: rand(1, 4),
      pause: rand(0, 2),
      walking: false
    });
  }
}

function createIndoorCharacters() {
  const lab = rooms.find(r => r.type === "lab");
  const teacherDesk = furniture.find(p =>
    p.type === "teacher" && p.room === lab
  );

  teacherDesk.type = "computer";

  jean = speaker('"professor" Jean', "jean", {
    x: teacherDesk.x + teacherDesk.w / 2,
    y: teacherDesk.y - 5,
    skin: "#b74a45",
    hair: "#241b27",
    shirt: "#252c3c",
    stationary: true,
    demon: true,
    nextSpeech: 2
  });

  furniture.filter(p =>
    p.type === "computer" &&
    p.room === lab &&
    p !== teacherDesk
  ).forEach(desk => {
    for (let i = 0; i < 3; i++) {
      jeanStudents.push({
        ...appearance(),
        x: desk.x + 24 + i * 48,
        y: desk.y + desk.h + 27,
        stationary: true,
        sad: true
      });
    }
  });

  const auditorium = rooms.find(r =>
    r.type === "auditorium"
  );

  psicologa = speaker("Psicóloga", "psicologa", {
    x: auditorium.x + auditorium.w / 2,
    y: auditorium.y + 95,
    skin: "#e7bb9c",
    hair: "#53382d",
    shirt: "#b48ba9",
    stationary: true,
    psychologist: true,
    nextSpeech: 3
  });
}

function createTia() {
  tia = {
    name: "Tia",
    x: ESPELINHOS.x + ESPELINHOS.w / 2,
    y: ESPELINHOS.y + ESPELINHOS.h - 18,
    skin: "#e8b98d",
    hair: "#3f2b1d",
    shirt: "#d96b6b",
    stationary: true,
    smiling: true,
    vendor: true,
    step: 0
  };

  // Alunos da Fatec na calçada, na frente da lojinha.
  for (let i = 0; i < 5; i++) {
    customers.push({
      ...appearance(),
      x: ESPELINHOS.x + 55 + i * 48,
      y: ESPELINHOS.y + ESPELINHOS.h + 38 + (i % 2) * 14,
      stationary: true,
      fatecStudent: true,
      step: 0
    });
  }
}

function createTraffic() {
  for (const [kind, count] of [
    ["car", 18], ["bus", 6], ["bike", 10],
    ["van", 7], ["truck", 5], ["motorcycle", 8],
    ["pickup", 7], ["suv", 6]
  ]) {
    for (let i = 0; i < count; i++) {
      const c = Math.floor(rand(0, VX.length - 1));
      const r = Math.floor(rand(0, HY.length - 1));

      const v = {
        kind,
        color: pick(shirts),
        skin: pick(skins),
        speed: ["bike", "motorcycle"].includes(kind) ? 92 :
          kind === "bus" || kind === "truck" ? 74 :
            ["van", "pickup", "suv"].includes(kind) ? 96 : 110,
        step: 0
      };

      setCircuit(v, rectangleRoute(
        VX[c] + 27, HY[r] + 27,
        VX[c + 1] + 73, HY[r + 1] + 73
      ));

      vehicles.push(v);
    }
  }
}

function updateSpeech(p, dt) {
  if (p.speechTimer > 0) {
    p.speechTimer -= dt;

    if (p.speechTimer <= 0) p.speech = "";
    return;
  }

  p.nextSpeech -= dt;

  if (p.nextSpeech > 0) return;

  const list = PHRASES[p.key];
  let i;

  do {
    i = Math.floor(rand(0, list.length));
  } while (
    i === p.lastPhrase && list.length > 1
  );

  p.lastPhrase = i;
  p.speech = list[i];
  p.speechTimer = 4.5;
  p.nextSpeech = rand(7, 13);
}

function updateStudents(dt) {
  students.forEach(p => {
    p.speechTimer = Math.max(
      0, p.speechTimer - dt
    );

    if (!p.speechTimer) p.speech = "";
  });

  studentTimer -= dt;

  if (
    studentTimer > 0 ||
    students.some(p => p.speechTimer > 0)
  ) return;

  let i;

  do {
    i = Math.floor(rand(0, students.length));
  } while (i === lastStudent);

  lastStudent = i;
  const p = students[i];

  p.speech = pick(PHRASES.alunos);
  p.speechTimer = 4;
  studentTimer = 6;
}

function updatePenguin(dt) {
  const trail = zannetu.trail;
  const last = trail[trail.length - 1];

  if (distance(last, zannetu) >= 2) {
    trail.push({
      x: zannetu.x, y: zannetu.y
    });
  }

  let remaining = 36;
  let point = trail[0];

  for (let i = trail.length - 1; i > 0; i--) {
    const a = trail[i], b = trail[i - 1];
    const d = distance(a, b);

    if (d >= remaining) {
      const t = remaining / d;

      point = {
        x: a.x + (b.x - a.x) * t,
        y: a.y + (b.y - a.y) * t
      };
      break;
    }

    remaining -= d;
  }

  linux.x = point.x;
  linux.y = point.y;
  linux.step += dt * 10;

  if (trail.length > 150) {
    trail.splice(0, trail.length - 150);
  }
}

/* ================= ANIMAIS ================= */

const animalKinds = [
  "dog", "cat", "rabbit", "bird",
  "squirrel", "horse", "cow"
];

function createAnimals() {
  for (let i = 0; i < 125; i++) {
    const forest = i >= 50;

    const zone = forest ?
      { x: 25, y: 4100, w: 5550, h: 750 } :
      { x: 25, y: 1280, w: 5550, h: 2700 };

    let x, y;

    for (let k = 0; k < 100; k++) {
      x = rand(zone.x + 25, zone.x + zone.w - 25);
      y = rand(zone.y + 25, zone.y + zone.h - 25);

      if (!blockedOutside(x, y, 18)) break;
    }

    if (blockedOutside(x, y, 18)) continue;

    animals.push({
      x, y, zone,
      kind: forest ?
        pick(animalKinds) :
        pick(["dog", "cat"]),
      angle: rand(0, 6.28),
      speed: rand(18, 34),
      turn: rand(1, 4),
      step: 0,
      color: pick([
        "#a27851", "#7e858d",
        "#e5dec9", "#655342"
      ])
    });
  }
}

function updateAnimals(dt) {
  animals.forEach(a => {
    a.turn -= dt;

    if (a.turn <= 0) {
      a.angle += rand(-1.5, 1.5);
      a.turn = rand(1, 4);
    }

    const x = a.x + Math.cos(a.angle) * a.speed * dt;
    const y = a.y + Math.sin(a.angle) * a.speed * dt;
    const z = a.zone;

    if (
      x < z.x + 20 || x > z.x + z.w - 20 ||
      y < z.y + 20 || y > z.y + z.h - 20 ||
      a.kind === "shark" && onIsland(x, y, 110) ||
      blockedOutside(x, y, 15)
    ) {
      a.angle += 2;
      return;
    }

    a.x = x; a.y = y; a.step += dt * 8;
  });
}

function updateBeach(dt) {
  beachPeople.forEach(p => {
    p.walking = false;

    if (p.pause > 0) {
      p.pause -= dt;
      return;
    }

    p.turn -= dt;

    if (p.turn <= 0) {
      p.turn = rand(1, 4);
      p.angle += rand(-1.2, 1.2);

      if (Math.random() < .2) {
        p.pause = rand(1, 3);
        return;
      }
    }

    const x = p.x + Math.cos(p.angle) * p.speed * dt;
    const y = p.y + Math.sin(p.angle) * p.speed * dt;

    if (
      x < 35 || x > 5565 || y < 275 || y > 1190 ||
      inCampus(x, y, 30)
    ) {
      p.angle += 2;
      return;
    }

    p.x = x; p.y = y;
    p.walking = true;
    p.step += dt * 8;
  });
}

/* ================= JOGADOR ================= */

function nearbyDoor() {
  return inside ?
    distance(player, EXIT) < 85 :
    Math.abs(player.x - ENTRY.x) < 100 &&
    Math.abs(player.y - ENTRY.y) < 65;
}

function updatePlayer(dt) {
  let dx =
    Number(
      keys.has("d") || keys.has("arrowright")
    ) -
    Number(
      keys.has("a") || keys.has("arrowleft")
    );

  let dy =
    Number(
      keys.has("s") || keys.has("arrowdown")
    ) -
    Number(
      keys.has("w") || keys.has("arrowup")
    );

  const old = { x: player.x, y: player.y };
  if ((dx || dy) && S.drunk > 0) { dx += Math.sin(time * 3) * (S.drunk / 100) * .7; dy += Math.cos(time * 2.7) * (S.drunk / 100) * .5; }

  if (dx || dy) {
    const d = Math.hypot(dx, dy);
    dx /= d; dy /= d;

    player.facing = Math.abs(dx) > Math.abs(dy) ?
      (dx > 0 ? "right" : "left") :
      (dy > 0 ? "down" : "up");

    const total =
      player.speed *
      (keys.has("shift") ? 1.6 : 1) * dt;

    const steps = Math.max(
      1, Math.ceil(total / 3)
    );

    const collision =
      inside ? blockedInside : blockedOutside;

    for (let i = 0; i < steps; i++) {
      const x = player.x + dx * total / steps;

      if (!collision(x, player.y, player.radius)) {
        player.x = x;
      }

      const y = player.y + dy * total / steps;

      if (!collision(player.x, y, player.radius)) {
        player.y = y;
      }
    }
  }

  player.walking = distance(player, old) > .01;
  player.step = player.walking ?
    player.step + dt * 11 : 0;

  if (interactRequested && nearbyDoor()) {
    inside = !inside;

    Object.assign(
      player,
      inside ? INDOOR_SPAWN : ENTRY
    );

    player.facing = inside ? "up" : "down";
    player.walking = false;
    player.step = 0;
  }

  interactRequested = false;

  const near = nearbyDoor();
  hint.style.display = near ? "block" : "none";
  hint.textContent = inside ?
    "Pressione E para sair" :
    "Pressione E para entrar na Fatec";
}
