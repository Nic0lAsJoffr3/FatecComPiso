"use strict";

/* ================= DESENHOS EXTERNOS ================= */

function drawTree(x, y, s = 25) {
  oval(x + 7, y + 5, s, s * .4, "#15352533");
  rect(x - 3, y - 15, 6, 25, "#77563d");
  oval(x, y - s * .6, s, s * .8, "#346448");
  oval(x - s * .25, y - s * .95, s * .65, s * .5, "#568253");
}

function drawPalm(x, y) {
  line(x, y, x + 4, y - 45, "#967049", 6);

  for (let i = 0; i < 7; i++) {
    ctx.save();
    ctx.translate(x + 4, y - 45);
    ctx.rotate(i * 6.28 / 7);
    oval(18, 0, 27, 6, "#39794e");
    ctx.restore();
  }
}

function drawDesertPlant(plant) {
  const { x, y, size } = plant;
  const s = 11 * size;
  oval(x + 2, y + 3, s * 1.2, s * .35, "#58452a33");
  if (plant.kind === "cactus") {
    rect(x - 2, y - s * 1.6, 4, s * 1.6, "#64844c");
    round(x - s * .72, y - s * .9, 3, s * .58, 1.5, "#64844c");
    round(x + s * .45, y - s * 1.2, 3, s * .68, 1.5, "#739158");
    line(x - 4, y - s * 1.15, x + 3, y - s * 1.15, "#9db77c", 1);
    line(x - 4, y - s * .72, x + 3, y - s * .72, "#9db77c", 1);
  } else if (plant.kind === "shrub") {
    oval(x - s * .42, y - s * .28, s * .72, s * .56, "#77834d");
    oval(x + s * .35, y - s * .25, s * .68, s * .52, "#8e8d55");
    oval(x, y - s * .52, s * .58, s * .55, "#a29a5d");
  } else {
    poly([
      [x - s, y], [x - s * .55, y - s * .6],
      [x - s * .12, y - s * .3], [x + s * .4, y - s * .78],
      [x + s, y]
    ], "#95846a");
    line(x - s * .5, y - s * .38, x + s * .35, y - s * .55,
      "#c5ad84", 1);
  }
}

function drawGround() {
  rect(WORLD.minX, 0, WORLD.w - WORLD.minX, WORLD.h, "#9caa78");
  rect(WORLD.minX, SHORE, -WORLD.minX, WORLD.h - SHORE, "#c6a86e");
  rect(0, SHORE, WORLD.w, 1045, "#e4d1a8");
  rect(0, 4050, WORLD.w, WORLD.h - 4050, "#697f4f");
  rect(
    WORLD.minX, SEA_TOP, WORLD.w - WORLD.minX,
    SHORE - SEA_TOP, "#4d95a9"
  );
  rect(DESERT_RIVER.x - 12, DESERT_RIVER.y,
    DESERT_RIVER.w + 24, DESERT_RIVER.h, "#b7a176");
  rect(DESERT_RIVER.x, DESERT_RIVER.y,
    DESERT_RIVER.w, DESERT_RIVER.h, "#367f91");
  for (let y = Math.max(DESERT_RIVER.y,
    Math.floor(camera.y / 70) * 70); y < Math.min(WORLD.h,
    camera.y + height + 70); y += 70) {
    line(DESERT_RIVER.x + 12, y, DESERT_RIVER.x + DESERT_RIVER.w - 12,
      y + 22, "#b3d8d766", 2);
  }
  rect(0, 235, WORLD.w, 42, "#d5c59b");
  rect(0, 1220, WORLD.w, 60, "#c4b99e");
  rect(0, 4390, WORLD.w, 42, "#ae966f");

  for (let x = WORLD.minX + 130; x < 0; x += 470) {
    for (let y = 500; y < WORLD.h; y += 510) {
      if (!visible(x, y, 100)) continue;
      const offset = Math.sin(x * .007 + y * .003) * 35;
      oval(x + offset, y, 160, 28, "#e1c58b35");
      oval(x + offset + 55, y - 7, 115, 18, "#f0d4962a");
    }
  }
  for (const plant of DESERT_VEGETATION) {
    if (visible(plant.x, plant.y, 30)) drawDesertPlant(plant);
  }

  for (let i = 0; i < 27; i++) {
    const x = 100 + i * 205;
    const y = 450 + (i % 4) * 170;

    if (
      inCampus(x, y, 100) ||
      !visible(x, y)
    ) continue;

    oval(
      x, y, 27, 18,
      i % 2 ? "#7aabb7" : "#c48d7c"
    );
    line(x, y, x, y + 30, "#88623d", 2);
    rect(x + 35, y + 25, 45, 20, "#eee3c9");
    rect(x - 30, y + 52, 48, 22, "#a288a6");
  }

  const top = HY[0];
  const bottom = HY[HY.length - 1] + ROAD;

  HY.forEach(y =>
    rect(0, y - 26, WORLD.w, 152, "#c7c7b9")
  );
  VX.forEach(x =>
    rect(
      x - 26, top - 26, 152,
      bottom - top + 52, "#c7c7b9"
    )
  );
  VX.forEach(x =>
    rect(x, top, 100, bottom - top, "#525a60")
  );
  HY.forEach(y =>
    rect(0, y, WORLD.w, 100, "#525a60")
  );

  HY.forEach(y => {
    if (!visible(camera.x + width / 2, y, 150)) return;

    for (
      let x = Math.max(
        0, Math.floor(camera.x / 55) * 55
      );
      x < Math.min(WORLD.w, camera.x + width + 55);
      x += 55
    ) {
      if (!VX.some(v => x + 25 > v && x < v + 100)) {
        rect(x, y + 49, 25, 2, "#d5c899");
      }
    }
  });

  VX.forEach(x => {
    if (!visible(x, camera.y + height / 2, 150)) return;

    for (
      let y = Math.max(
        top, Math.floor(camera.y / 55) * 55
      );
      y < Math.min(bottom, camera.y + height + 55);
      y += 55
    ) {
      if (!HY.some(v => y + 25 > v && y < v + 100)) {
        rect(x + 49, y, 2, 25, "#d5c899");
      }
    }
  });

  drawDesertRoadNetwork();
  rect(DESERT_BRIDGE.x, DESERT_BRIDGE.y,
    DESERT_BRIDGE.w, DESERT_BRIDGE.h, "#806b4e");
  for (let x = DESERT_BRIDGE.x + 8;
    x < DESERT_BRIDGE.x + DESERT_BRIDGE.w; x += 22) {
    line(x, DESERT_BRIDGE.y + 5, x,
      DESERT_BRIDGE.y + DESERT_BRIDGE.h - 5, "#d7c092", 2);
  }
  const lot = DESERT_POLICE_PARKING;
  if (visibleBox(lot)) {
    round(lot.x, lot.y, lot.w, lot.h, 5, "#6e6658");
    for (let index = 0; index < 3; index++) {
      line(lot.x + 8 + index * 28, lot.y + 12,
        lot.x + 8 + index * 28, lot.y + lot.h - 10,
        "#e0d4ac", 2);
    }
    line(lot.x + 5, lot.y + lot.h - 9,
      lot.x + lot.w - 5, lot.y + lot.h - 9, "#e0d4ac", 2);
  }
}

function drawCampus() {
  rect(1980, 300, 1640, 900, "#e2d8c3");

  for (let x = 2000; x < 3620; x += 42) {
    line(x, 300, x, 1200, "#9a8d7733");
  }
  for (let y = 320; y < 1200; y += 42) {
    line(1980, y, 3620, y, "#9a8d7733");
  }

  rect(2720, 300, 160, 980, "#c4b395");

  for (const x of [2055, 3545]) {
    for (let y = 430; y < 1150; y += 190) {
      drawPalm(x, y);
    }
  }

  for (const x of [2470, 3130]) {
    oval(x, 1080, 76, 34, "#95a5a4");
    oval(x, 1078, 64, 25, "#83bbc3");
    line(x, 1076, x, 1045, "#d2f4ee", 4);
  }
}

function windows(x, y, w, h, cols = 4, rows = 3) {
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const ww = Math.min(30, w / cols * .5);
      const hh = Math.min(23, h / rows * .5);
      const xx = x + (c + .5) * w / cols - ww / 2;
      const yy = y + (r + .5) * h / rows - hh / 2;

      rect(
        xx - 2, yy - 2, ww + 4, hh + 4, "#e4ddc9"
      );
      rect(xx, yy, ww, hh, "#719ba9");

      line(
        xx + ww / 2, yy,
        xx + ww / 2, yy + hh,
        "#405e6a", 2
      );
    }
  }
}

function door(x, y) {
  rect(x - 22, y - 43, 44, 43, "#dfdece");
  rect(x - 17, y - 39, 34, 39, "#456572");
  rect(x - 13, y - 35, 26, 19, "#a4c5c9");
}

function drawEspetinhos() {
  const { x, y, w, h } = ESPELINHOS;
  const cx = x + w / 2, by = y + h;

  rect(x + 7, y + 9, w, h, "#0003");
  rect(x, y, w, h, "#c07a4b");
  rect(x, y, w, 22, "#8b4a2e");
  rect(x + 8, y + 28, w - 16, h - 46, "#f3e2c5");

  round(x + 45, y - 32, w - 90, 36, 8, "#3b2a1f");
  text("ESPETINHOS", cx, y - 14, 16, "#ffd98a");

  rect(x + 35, y + 40, w - 70, 70, "#6b3f2b");
  rect(x + 42, y + 47, w - 84, 56, "#f7e9c8");

  // Balcão primeiro.
  round(
    x + 30, y + h - 38, w - 60, 22, 4, "#875739"
  );
  rect(
    x + 38, y + h - 34, w - 76, 4, "#d9c49b"
  );

  // Tia depois do balcão, para não ser coberta.
  ctx.save();
  ctx.translate(tia.x, tia.y - 22);
  drawHuman(tia);
  ctx.restore();

  // Espetinhos.
  for (let i = 0; i < 5; i++) {
    const sx = x + 55 + i * 42;
    const sy = y + h - 33;

    line(sx, sy, sx + 3, sy - 16, "#d9c8a3", 2);
    oval(sx + 3, sy - 20, 4, 4, "#b74a42");
    oval(sx + 3, sy - 25, 3, 3, "#d9a05a");
  }

  round(
    x + w - 95, y + 36, 65, 30, 4, "#f2e4c2"
  );
  text(
    "R$ 8,00",
    x + w - 62, y + 51, 11, "#6b3f2b"
  );

  door(cx, by);
}

function drawBuilding(b) {
  const { x, y, w, h, type } = b;
  const cx = x + w / 2, by = y + h;

  if (type === "desertParking") {
    round(x, y, w, h, 5, "#555d4c");
    for (let row = 0; row < 3; row++) {
      const py = y + 42 + row * 95;
      line(x + 18, py, x + w - 18, py, "#d4c69b", 2);
      for (let col = 0; col < 5; col++) {
        const px = x + 36 + col * (w - 72) / 5;
        line(px, py - 27, px, py + 26, "#d4c69b88", 1);
      }
    }
    return;
  }

  if (type === "fatec") {
    drawFatec();
    return;
  }

  if (type === "espetinhos") {
    drawEspetinhos();
    return;
  }

  if (type === "park") {
    round(x, y, w, h, 12, "#86a26b");
    rect(cx - 12, y, 24, h, "#d0be97");
    rect(x, y + h / 2 - 10, w, 20, "#d0be97");
    oval(x + w * .75, y + h * .25, 28, 19, "#84b1b1");

    for (let i = 0; i < 4; i++) {
      drawTree(
        x + 30 + i * (w - 60) / 3,
        y + 45 + (i % 2) * 105, 18
      );
    }
    return;
  }

  if (type === "desertHome" || type === "desertStore" ||
      type === "desertBank" || type === "desertPolice") {
    const bank = type === "desertBank";
    const store = type === "desertStore";
    const police = type === "desertPolice";
    const wall = bank ? "#b9a58b" : store ? "#c5a78b" :
      police ? "#aeb7ad" : b.variant % 2 ? "#d0b894" : "#c5b18f";
    const roof = bank ? "#756b61" : police ? "#52697a" :
      store ? "#8c6954" : "#88765e";
    const trim = bank ? "#d9c99d" : store ? "#e3d1a7" :
      police ? "#d5dde0" : "#ddd0b4";

    rect(x + 9, y + 10, w, h, "#20302c33");
    rect(x, y, w, h, wall);
    rect(x, y, w, 23, roof);
    rect(x + 8, y + 25, w - 16, 5, trim);
    windows(x + 18, y + 40, w - 36, h - 84, 2, 1);
    door(cx, by);

    if (store || bank || police) {
      rect(x + 32, y - 8, w - 64, 23,
        bank ? "#66594c" : police ? "#344d5c" : "#8b5d46");
      text(bank ? "BANCO" :
        police ? "POLÍCIA DO DESERTO" : "ARMAZÉM",
        cx, y + 4, police ? 9 : 11, "#f4e8cc", 800);
      rect(x + 12, y + 31, w - 24, 7, trim);
      for (let stripe = 0; stripe < 6; stripe++) {
        rect(x + 12 + stripe * (w - 24) / 6, y + 31,
          (w - 24) / 12, 7,
          stripe % 2 ? "#f0dfc2" : roof);
      }
    }

    if (bank) {
      for (let index = 0; index < 3; index++) {
        const columnX = x + 24 + index * (w - 48) / 3;
        rect(columnX, y + 39, 7, h - 48, trim);
      }
      text("$", cx, by - 34, 15, "#f2d18a", 800);
    }
    return;
  }

  if (type === "militaryBase") {
    round(x, y, w, h, 5, "#817e5930");
    ctx.strokeStyle = "#d4c38e";
    ctx.lineWidth = 2;
    ctx.setLineDash([12, 8]);
    line(x + 18, y + 18, x + w - 120, y + 18,
      "#d4c38e", 2);
    line(x + w - 65, y + 18, x + w - 18, y + 18,
      "#d4c38e", 2);
    line(x + 18, y + 18, x + 18, y + h - 18,
      "#d4c38e", 2);
    line(x + w - 18, y + 18, x + w - 18, y + h - 18,
      "#d4c38e", 2);
    line(x + 18, y + h - 18, x + w - 18, y + h - 18,
      "#d4c38e", 2);
    ctx.setLineDash([]);
    line(x + w - 65, y + 12, x + w - 65, y + 31,
      "#443e31", 3);
    rect(x + 48, y + 110, w - 96, 7, "#a9a48788");
    text("ÁREA MILITAR · ACESSO RESTRITO",
      cx, y + 35, 11, "#f3e5b3", 900);
    return;
  }

  if (type === "militaryBarracks") {
    rect(x + 8, y + 12, w, h, "#554a34");
    rect(x, y + 12, w, h - 12, "#656b50");
    rect(x - 7, y + 5, w + 14, 17, "#42483e");
    for (let i = 0; i < 3; i++) {
      rect(x + 20 + i * (w - 55) / 3, y + 38, 32, 25, "#697d7d");
      rect(x + 17 + i * (w - 55) / 3, y + 35, 38, 5, "#313d39");
    }
    rect(cx - 16, by - 56, 32, 56, "#463c2d");
    text("QUARTEL", cx, y + h - 18, 9, "#e2d3a6", 800);
    return;
  }

  if (type === "watchtower") {
    line(cx - 20, by, cx - 10, y + 24, "#463e30", 7);
    line(cx + 20, by, cx + 10, y + 24, "#463e30", 7);
    line(cx - 15, y + 54, cx + 15, y + 54, "#514735", 4);
    rect(cx - 22, y + 13, 44, 31, "#6a7055");
    rect(cx - 27, y + 8, 54, 7, "#3b4339");
    rect(cx - 15, y + 20, 30, 12, "#86a2a3");
    line(cx + 20, y + 34, cx + 20, by - 4, "#d0bd86", 2);
    return;
  }

  if (type === "arsenal") {
    rect(x + 8, y + 10, w, h, "#554a34");
    rect(x, y + 12, w, h - 12, "#777356");
    rect(x - 7, y + 5, w + 14, 17, "#42483e");
    rect(cx - 36, y + 48, 72, h - 62, "#564b37");
    text("ARSENAL", cx, y + 35, 12, "#f0d496", 900);
    for (let index = 0; index < 3; index++) {
      line(x + 25 + index * 36, y + 70,
        x + 42 + index * 36, y + 70, "#d5bc72", 3);
    }
    return;
  }

  if (type === "coastGuard") {
    rect(x + 8, y + 10, w, h, "#14202a55");
    rect(x, y + 15, w, h - 15, "#78847e");
    rect(x - 10, y + 8, w + 20, 20, "#314b5d");
    rect(x + 18, y + 34, w - 36, 7, "#e0d4b0");
    rect(cx - 28, by - 55, 56, 55, "#324955");
    for (const wx of [x + 35, x + w - 62]) {
      rect(wx, y + 48, 28, 27, "#8ab2bd");
      rect(wx - 3, y + 45, 34, 5, "#344c56");
    }
    rect(cx - 4, y - 24, 8, 34, "#e5e0cb");
    poly([[cx, y - 22], [cx + 34, y - 12], [cx, y - 2]],
      "#4e8daf");
    text("GUARDA-MARINHA", cx, y + 20, 10, "#f0e5c4", 800);
    door(cx, by);
    return;
  }

  if (type === "stadium") {
    oval(cx, y + h / 2, w / 2, h / 2, "#a39b8c");
    oval(
      cx, y + h / 2, w / 2 - 15, h / 2 - 14, "#aa8071"
    );
    rect(x + 45, y + 38, w - 90, h - 76, "#749966");

    ctx.strokeStyle = "#e3e8cf";
    ctx.lineWidth = 2;
    ctx.strokeRect(x + 52, y + 45, w - 104, h - 90);
    return;
  }

  rect(x + 9, y + 10, w, h, "#20302c33");

  if ([
    "lighthouse", "windmill",
    "watertower", "radio"
  ].includes(type)) {
    if (type === "lighthouse") {
      poly([
        [cx - 35, by], [cx - 20, y + 30],
        [cx + 20, y + 30], [cx + 35, by]
      ], "#e7dfca");

      for (let yy = y + 60; yy < by; yy += 65) {
        rect(cx - 22, yy, 44, 20, "#ad6058");
      }

      round(cx - 28, y, 56, 35, 7, "#597581");
      oval(cx, y + 15, 17, 10, "#efd997");
    } else if (type === "windmill") {
      poly([
        [cx - 40, by], [cx - 22, y + 40],
        [cx + 22, y + 40], [cx + 40, by]
      ], "#cbb996");

      ctx.save();
      ctx.translate(cx, y + 35);
      ctx.rotate(time * .6);

      for (let i = 0; i < 4; i++) {
        ctx.rotate(Math.PI / 2);
        rect(0, -5, 85, 10, "#e8dfc4");
      }

      ctx.restore();
    } else if (type === "watertower") {
      line(
        cx - 30, by, cx - 20, y + 45,
        "#6e7d84", 7
      );
      line(
        cx + 30, by, cx + 20, y + 45,
        "#6e7d84", 7
      );
      oval(cx, y + 40, 60, 35, "#c2cdca");
      oval(cx, y + 25, 60, 23, "#e1e3d6");
    } else {
      rect(x, by - 70, w, 70, "#b7c1c2");
      line(
        cx, by - 70, cx, y - 45, "#7b858a", 6
      );

      for (let i = 0; i < 5; i++) {
        line(
          cx - 25, y + i * 30,
          cx + 25, y + i * 30, "#7b858a", 3
        );
      }

      oval(cx, y - 45, 4, 4, "#d56555");
    }
    return;
  }

  const classical = [
    "temple", "museum", "library", "castle"
  ].includes(type);

  const warm = [
    "cafe", "restaurant", "shop"
  ].includes(type);

  rect(
    x, y, w, h,
    classical ? "#d8ceb8" :
      warm ? "#d5b59a" :
        type === "factory" ?
          "#b2a28b" : "#bdcbd0"
  );

  if (type === "tower") {
    rect(x + 10, y + 10, w - 20, h - 20, "#547f94");

    for (let c = 0; c < 6; c++) {
      line(
        x + 15 + c * (w - 30) / 5, y + 10,
        x + 15 + c * (w - 30) / 5, by,
        "#adc7cd", 3
      );
    }

    for (let r = 0; r < 6; r++) {
      line(
        x, y + r * h / 6, x + w, y + r * h / 6,
        "#b7c8c8", 3
      );
    }

    line(cx, y, cx, y - 35, "#536873", 4);
  } else if (type === "factory") {
    for (let i = 0; i < 4; i++) {
      poly([
        [x + i * w / 4, y + 25],
        [x + (i + .8) * w / 4, y - 8],
        [x + (i + 1) * w / 4, y + 25]
      ], "#7f7770");
    }

    rect(x + w * .2, y - 42, 20, 65, "#8f7764");
    windows(x + 15, y + 40, w - 30, h - 75, 5, 2);
  } else if (type === "greenhouse") {
    rect(x + 8, y + 20, w - 16, h - 30, "#91b9a5");

    for (let i = 0; i < 6; i++) {
      rect(
        x + 15 + i * (w - 30) / 6, y + 30,
        (w - 30) / 6 - 5, h - 50, "#bad8ca"
      );
      oval(
        x + 30 + i * (w - 40) / 6, by - 35,
        10, 17, "#5b8b58"
      );
    }

    poly([
      [x, y + 20], [cx, y - 25], [x + w, y + 20]
    ], "#81a99c");
  } else if (type === "apartment") {
    windows(x + 10, y + 20, w - 20, h - 55, 3, 4);

    for (let i = 0; i < 4; i++) {
      rect(
        x + 7, y + 45 + i * (h - 55) / 4,
        w - 14, 7, "#8d8275"
      );
    }
  } else {
    rect(
      x, y, w, 23,
      classical ? "#9e9e8b" :
        warm ? "#986f58" : "#63808c"
    );

    windows(
      x + 15, y + 35, w - 30, h - 80,
      4, type === "hotel" ? 4 : 2
    );
  }

  if (classical) {
    poly([
      [x - 8, y + 28], [cx, y - 25],
      [x + w + 8, y + 28]
    ], "#a6a08b");

    for (let i = 0; i < 5; i++) {
      rect(
        x + 17 + i * (w - 34) / 4 - 4,
        y + 34, 8, h - 40, "#eee6d2"
      );
    }
  }

  if (warm) {
    for (let i = 0; i < 12; i++) {
      rect(
        x + i * w / 12, by - 65, w / 12, 17,
        i % 2 ? "#ebe3ca" : "#ad7464"
      );
    }
  }

  if (type === "hospital") {
    rect(cx - 15, y + 4, 30, 29, "#ede9db");
    rect(cx - 3, y + 8, 6, 21, "#b65e59");
    rect(cx - 10, y + 15, 20, 6, "#b65e59");
  }

  if (type === "cinema") {
    round(x + 15, y + 8, w - 30, 26, 4, "#e2ce9c");

    for (let i = 0; i < 9; i++) {
      oval(
        x + 25 + i * (w - 50) / 8, y + 30,
        2, 2, "#fff1c7"
      );
    }
  }

  if (type === "dome") {
    oval(cx, y + 30, w * .33, 45, "#94a5ae");
  }

  if (type === "mall") {
    rect(x + 12, by - 75, w - 24, 60, "#6b9fae");

    for (let i = 0; i < 7; i++) {
      line(
        x + 18 + i * (w - 36) / 6, by - 75,
        x + 18 + i * (w - 36) / 6, by,
        "#dce5dc", 3
      );
    }
  }

  if (type === "fire") {
    rect(x + 15, y + 65, w - 30, h - 75, "#69757a");

    for (let yy = y + 70; yy < by - 10; yy += 12) {
      line(x + 15, yy, x + w - 15, yy, "#b6c0b9");
    }
  }

  door(cx, by);
}

function drawFatec() {
  const { x, y, w, h } = FATEC;
  const cx = x + w / 2, by = y + h;

  rect(x + 20, y + 25, w, h, "#18303b44");
  rect(x, y, w, h, "#dce1d9");
  rect(x - 12, y + 10, w + 24, 17, "#607787");
  rect(x - 10, y + 30, w + 20, 7, "#dcb575");

  windows(x + 20, y + 75, 190, h - 120, 3, 4);
  windows(x + w - 210, y + 75, 190, h - 120, 3, 4);

  rect(x + 235, y + 70, w - 470, h - 100, "#4b91ac");

  for (let i = 0; i <= 12; i++) {
    line(
      x + 235 + i * (w - 470) / 12, y + 70,
      x + 235 + i * (w - 470) / 12, by - 30,
      "#264b62", 4
    );
  }

  for (let i = 0; i < 5; i++) {
    line(
      x + 235, y + 70 + i * (h - 100) / 4,
      x + w - 235, y + 70 + i * (h - 100) / 4,
      "#264b62", 4
    );
  }

  poly([
    [x + 260, y + 70], [x + 340, y + 70],
    [x + 620, by - 30], [x + 500, by - 30]
  ], "#ffffff22");

  rect(cx - 120, y - 60, 240, 80, "#dedfce");

  poly([
    [cx - 145, y - 60], [cx, y - 120],
    [cx + 145, y - 60]
  ], "#607787");

  oval(cx, y - 22, 27, 27, "#344f60");
  oval(cx, y - 22, 22, 22, "#eee4cc");
  line(cx, y - 22, cx, y - 37, "#344f60", 2);
  line(cx, y - 22, cx + 12, y - 17, "#344f60", 2);

  rect(cx - 150, by - 100, 300, 100, "#e6e8dd");
  rect(cx - 125, by - 85, 250, 85, "#28506a");

  for (let i = 0; i < 4; i++) {
    rect(
      cx - 116 + i * 59, by - 78,
      51, 78, "#82b5c6"
    );
  }

  poly([
    [cx - 185, by - 114], [cx + 185, by - 114],
    [cx + 170, by - 92], [cx - 170, by - 92]
  ], "#4c6b80");

  for (let i = 0; i < 5; i++) {
    rect(
      cx - 160 - i * 10, by + i * 7,
      320 + i * 20, 7,
      i % 2 ? "#bcc7c2" : "#e0e3d8"
    );
  }
}

function drawCampusWall(b) {
  rect(b.x + 4, b.y + 5, b.w, b.h + 5, "#0002");
  rect(b.x, b.y - 10, b.w, b.h + 10, "#a9b4b0");
  rect(b.x - 2, b.y - 14, b.w + 4, 5, "#e5e3d3");
}

/* ================= PERSONAGENS: DESENHO ================= */

function drawHuman(p) {
  const moving =
    !p.stationary && (!p.beach || p.walking);

  const swing = moving ? Math.sin(p.step || 0) * 2.5 : 0;
  const isPlayer = p === player;

  ctx.save();
  ctx.translate(p.x, p.y);
  if (p.age === "young") ctx.scale(.8, .8);
  else if (p.age === "elder") ctx.scale(.94, .94);

  if (!isPlayer) ctx.scale(.86, .86);

  oval(2, 7, 12, 5, "#162d3240");

  const pants =
    p.beach ? p.skin :
      p.casual ? "#456a95" :
        p.psychologist ? "#66506f" :
          p.vendor ? "#4a3b2e" : "#354655";

  rect(-8, -2 + swing, 6, 11, pants);
  rect(2, -2 - swing, 6, 11, pants);

  rect(
    -9, 7 + swing, 8, 4,
    p.beach ? p.swim : "#27343c"
  );
  rect(
    1, 7 - swing, 8, 4,
    p.beach ? p.swim : "#27343c"
  );

  if (p.beach) {
    rect(-10, -24, 20, 25, p.skin);

    if (p.outfit === 0) {
      rect(-10, -7, 20, 9, p.swim);
    } else if (p.outfit === 1) {
      rect(-9, -19, 18, 7, p.swim);
      poly([
        [-9, -3], [9, -3], [3, 3], [-3, 3]
      ], p.swim);
    } else {
      rect(-9, -20, 18, 22, p.swim);
    }
  } else {
    rect(p.gender === "woman" ? -11 : -10, -24,
      p.gender === "woman" ? 22 : 20, 26,
      p.socialClass === "wealthy" ? "#35404b" : p.shirt);

    if (p.socialClass === "wealthy" && !p.police) {
      rect(-3, -23, 6, 24, "#e5ddcb");
      poly([[0, -20], [3, -16], [1, 0], [-1, 0], [-3, -16]],
        "#985b55");
      poly([[-8, -23], [-2, -18], [-5, -12], [-9, -18]],
        "#697683");
      poly([[8, -23], [2, -18], [5, -12], [9, -18]],
        "#697683");
    } else if (p.outfitStyle === "jacket" || p.police) {
      const trim = p.desertPolice ? "#735b36" :
        p.police ? "#080c10" : "#263742";
      rect(-10, -24, 3, 25, trim);
      rect(7, -24, 3, 25, trim);
      line(-7, -22, 0, -9, p.desertPolice ? "#e4d19b" :
        p.police ? "#52616b" : "#d6c69d", 1);
      line(7, -22, 0, -9, p.desertPolice ? "#e4d19b" :
        p.police ? "#52616b" : "#d6c69d", 1);
      if (p.desertPolice) {
        round(-7, -20, 5, 6, 1, "#e4d19b");
        rect(2, -20, 5, 3, "#e4d19b");
      }
    } else if (p.outfitStyle === "stripe") {
      line(-8, -16, 8, -16, "#ffffff66", 2);
      line(-8, -7, 8, -7, "#ffffff55", 2);
    }

    if (p.special && !p.police) {
      RAINBOW.forEach((c, i) =>
        rect(-10, -24 + i * 4, 20, 4, c)
      );
    }

    if (p.military && p.militaryRank === "general") {
      rect(-7, -19, 3, 5, "#d5bc72");
      rect(4, -19, 3, 5, "#d5bc72");
    }

    if (p.professor && !p.tired) {
      rect(-3, -23, 6, 24, "#e7e2d5");
      poly([
        [0, -18], [3, -14], [1, -3],
        [-1, -3], [-3, -14]
      ], "#985b55");
    }

    if (p.tired) {
      rect(-6, -22, 12, 18, "#717d83");
      rect(-2, -22, 4, 25, "#aaa18b");
      round(12, -3, 17, 12, 2, "#303e47");
      rect(14, -2, 13, 7, "#77a8b7");
    }

    if (p.psychologist) {
      line(-7, -22, -2, -9, "#e8d6be", 2);
      line(7, -22, 2, -9, "#e8d6be", 2);
      oval(0, -8, 2, 3, "#d5b775");
    }

    if (p.vendor) {
      round(-7, -13, 14, 19, 3, "#f0e2c4");
      rect(-2, -13, 4, 19, "#c9b68b");
    }
    if (p.pregnant) {
      oval(5, -9, 8, 9, p.shirt);
      oval(10, -8, 1.5, 1.5, "#e8d1b3");
    }
  }

  const arm =
    p.beach || p.casual ? p.skin : p.shirt;

  if (p.angry) {
    line(-10, -18, -17, -34, arm, 5);
    line(10, -18, 17, -34, arm, 5);
    oval(-17, -35, 3, 3, p.skin);
    oval(17, -35, 3, 3, p.skin);
  } else {
    if (p.swimming) { const stroke = Math.sin(time * 5) * 10; line(-10, -20, -24, -20 + stroke, p.skin, 4); line(10, -20, 24, -20 - stroke, p.skin, 4); oval(-24, -20 + stroke, 3, 3, p.skin); oval(24, -20 - stroke, 3, 3, p.skin); } else if (isPlayer) { for (const side of [-1, 1]) { const id = S.attack > 0 ? S.weapon : held(), active = S.attack > 0 && (S.weapon ? side === 1 : side === S.hand), holding = side === 1 && id; let hx = side * 12, hy = -3, a = facing(); if (active) { const progress = 1 - S.attack / .3; if (id === 'knife' || id === 'baton') a += -.9 + progress * 1.8; const reach = 16 + Math.sin(progress * Math.PI) * 14; hx = side * 6 + Math.cos(a) * reach; hy = -18 + Math.sin(a) * reach; } else if (holding) { hx = 15; hy = -12; } line(side * 10, -20, hx, hy, arm, 4); oval(hx, hy, 3, 3, p.skin); if (holding) { ctx.save(); ctx.translate(hx, hy); ctx.rotate(active ? ((id === 'knife' || id === 'baton') ? a + Math.PI / 2 : a) : 0); icon(id, 0, 0, .65); ctx.restore(); } } } else if (p.flee > 0) { const run = Math.sin(p.step || 0) * 7; line(-10, -19, -18, -24 + run, arm, 4); line(10, -19, 18, -24 - run, arm, 4); oval(-18, -24 + run, 3, 3, p.skin); oval(18, -24 - run, 3, 3, p.skin); } else { rect(-14, -21 + swing * .4, 4, 17, arm); rect(10, -21 - swing * .4, 4, 17, arm); oval(-12, -3 + swing * .4, 3, 4, p.skin); oval(12, -3 - swing * .4, 3, 4, p.skin); }
  }

  oval(0, -31, 9, 10, p.skin);
  const hair = p.age === "elder" ? "#aaa99f" : p.hair;
  const style = p.hairStyle || (p.gender === "woman" ? "long" : "short");
  if (style === "bald") {
    // Keep the head intentionally bare for characters with fixed appearances.
  } else if (style === "long" || style === "wavy") {
    oval(0, -37, 11, 6, hair);
    round(-10, -34, 4, 16, 2, hair);
    round(6, -34, 4, 16, 2, hair);
    if (style === "wavy") {
      for (const x of [-9, 9]) {
        oval(x, -25, 3, 4, hair);
        oval(x * .8, -20, 2.5, 3, hair);
      }
    }
  } else if (style === "curly") {
    oval(0, -38, 11, 6, hair);
    for (const [x, y] of [[-8, -39], [-4, -43], [2, -44],
      [8, -40], [-10, -34], [9, -34]]) {
      oval(x, y, 4, 4, hair);
    }
  } else {
    oval(0, -37, 10, 5, hair);
    poly([[-10, -36], [-8, -43], [-3, -44],
      [0, -40], [4, -44], [9, -40], [10, -34]], hair);
    if (style === "bun") {
      oval(0, -44, 5, 4, hair);
      round(7, -35, 3, 12, 2, hair);
    }
  }

  if (p.hairSecondary && style !== "bald") {
    oval(5, -38, 4, 3, p.hairSecondary);
    line(3, -40, 8, -40, p.hairSecondary, 2);
  }
  if (p.gender === "man" && p.facialHair) {
    const beard = p.facialHairColor || hair;
    oval(0, -24, 5, 3, beard);
    line(-5, -27, 5, -27, beard, 2);
  }

  if (p.military || p.helmet) {
    oval(0, -41, 12, 6, p.military ? "#586348" : "#273640");
    rect(-11, -40, 22, 4, p.military ? "#414936" : "#1a252b");
    line(0, -37, 0, -29, p.military ? "#8f9870" : "#52616b", 1.5);
  }

  if (p.tired) {
    if (style !== "bald") {
      line(-8, -38, -11, -42, p.hair, 3);
      line(1, -40, 4, -44, p.hair, 3);
    }
    line(-6, -27, -2, -27, "#8f756d", 2);
    line(2, -27, 6, -27, "#8f756d", 2);
    oval(0, -23, 6, 3, "#6a5549");
  }

  if (p.professor) {
    ctx.strokeStyle = "#25333c";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(-7, -34, 6, 5);
    ctx.strokeRect(1, -34, 6, 5);
    line(-1, -32, 1, -32, "#25333c", 1.5);
  } else {
    rect(-5, -32, 2, 2, "#25333c");
    rect(3, -32, 2, 2, "#25333c");
  }
  if (p.age === "elder") {
    line(-6, -28, -2, -28, "#8d6f62", 1);
    line(2, -28, 6, -28, "#8d6f62", 1);
    line(-5, -22, 5, -22, "#9d7868", 1);
  }

  if (p.angry) {
    line(-7, -36, -2, -34, "#3c2f29", 2);
    line(2, -34, 7, -36, "#3c2f29", 2);
    oval(0, -25, 3, 3, "#80433e");
  } else {
    line(-3, -25, 3, -25, "#825b4c", 1.5);
  }

  if (isPlayer && player.facing === "up") {
    oval(0, -31, 9, 8, p.hair);
    round(-8, -21, 16, 18, 3, "#9a8059");
  }

  if (p.beach && p.hat) {
    oval(0, -39, 15, 4, "#d9bd80");
    round(-8, -46, 16, 8, 3, "#e4cb96");
  }

  if (p.psychologist) {
    line(12, -8, 14, -19, "#283844", 3);
    oval(14, -21, 3, 4, "#283844");
  }

  if (p.vendor) {
    ctx.strokeStyle = "#7a4534";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, -26, 4, .2, Math.PI - .2);
    ctx.stroke();
  }

  if (p.fatecStudent) {
    line(12, -12, 18, -20, "#d9c8a3", 2);
    oval(18, -22, 3, 3, "#b74a42");
    oval(18, -26, 2, 2, "#d9a05a");
  }

  ctx.restore();
}

function drawJean() {
  ctx.save();
  ctx.translate(jean.x, jean.y);

  oval(0, 6, 12, 5, "#0003");

  ctx.strokeStyle = "#963b42";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(9, -4);
  ctx.bezierCurveTo(28, 4, 30, -14, 24, -20);
  ctx.stroke();

  poly([
    [24, -25], [19, -17], [29, -18]
  ], "#b74a45");

  rect(-8, -5, 6, 13, "#202636");
  rect(2, -5, 6, 13, "#202636");
  round(-10, 6, 9, 4, 2, "#141925");
  round(1, 6, 9, 4, 2, "#141925");

  round(-12, -28, 24, 27, 4, "#292f41");
  rect(-4, -27, 8, 24, "#e7e0d0");

  poly([
    [-11, -27], [-4, -28],
    [-1, -14], [-8, -19]
  ], "#495168");
  poly([
    [11, -27], [4, -28],
    [1, -14], [8, -19]
  ], "#495168");

  poly([
    [0, -25], [3, -20], [2, -8],
    [0, -5], [-2, -8], [-3, -20]
  ], "#b54d54");

  line(-11, -23, -14, -8, "#292f41", 5);
  line(11, -23, 14, -8, "#292f41", 5);
  oval(-14, -6, 3, 4, jean.skin);
  oval(14, -6, 3, 4, jean.skin);

  oval(0, -36, 10, 11, jean.skin);
  oval(0, -43, 10, 4, "#332330");

  poly([
    [-8, -43], [-12, -56], [-2, -45]
  ], "#e2c79b");
  poly([
    [8, -43], [12, -56], [2, -45]
  ], "#e2c79b");

  line(-7, -41, -2, -39, "#39212b", 2);
  line(2, -39, 7, -41, "#39212b", 2);
  oval(-4, -37, 2.5, 2, "#f0cf62");
  oval(4, -37, 2.5, 2, "#f0cf62");
  rect(-4, -38, 1, 3, "#30212b");
  rect(4, -38, 1, 3, "#30212b");

  ctx.strokeStyle = "#43212b";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, -34, 6, .15, Math.PI - .15);
  ctx.stroke();

  poly([
    [-5, -32], [-2, -32], [-3, -28]
  ], "#f2e8cc");
  poly([
    [2, -32], [5, -32], [3, -28]
  ], "#f2e8cc");

  ctx.restore();
}

function drawSadStudent(p) {
  round(
    p.x - 12, p.y - 9,
    24, 16, 4, "#687d88"
  );

  drawHuman(p);

  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.scale(.86, .86);

  rect(-6, -28, 12, 7, p.skin);

  ctx.strokeStyle = "#805e54";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(
    0, -22, 4,
    Math.PI + .15, Math.PI * 2 - .15
  );
  ctx.stroke();

  line(-7, -36, -2, -38, "#4a3731", 1.5);
  line(2, -38, 7, -36, "#4a3731", 1.5);
  line(-6, -28, -2, -28, "#a2867c");
  line(2, -28, 6, -28, "#a2867c");

  ctx.restore();
}

function drawPenguin() {
  ctx.save();
  ctx.translate(linux.x, linux.y);

  const s = Math.sin(linux.step) * 2;

  oval(0, 6, 10, 4, "#0003");
  oval(-5, 5 + s, 5, 3, "#e3ae4c");
  oval(5, 5 - s, 5, 3, "#e3ae4c");

  oval(-8, -8 + s, 3, 9, "#1c2934");
  oval(8, -8 - s, 3, 9, "#1c2934");
  oval(0, -8, 9, 13, "#1c2934");
  oval(0, -5, 6, 9, "#efeede");

  oval(0, -20, 8, 8, "#1c2934");
  oval(-3, -20, 3.5, 4, "#efeede");
  oval(3, -20, 3.5, 4, "#efeede");

  oval(-3, -21, 1, 1.5, "#182b38");
  oval(3, -21, 1, 1.5, "#182b38");
  poly([
    [-3, -17], [3, -17], [0, -13]
  ], "#e2ac46");

  ctx.restore();
}

function drawWagner() {
  ctx.save();
  ctx.translate(wagner.x, wagner.y);

  oval(0, 8, 28, 9, "#0003");
  rect(-5, -150, 10, 160, "#85633f");
  rect(-35, -145, 70, 8, "#705031");
  line(0, -145, 0, -113, "#c7b58b", 4);

  ctx.save();
  ctx.translate(0, -105);
  ctx.rotate(Math.PI);

  rect(-8, -1, 6, 13, "#3a4b5e");
  rect(2, -1, 6, 13, "#3a4b5e");
  rect(-10, 9, 9, 5, "#26343f");
  rect(1, 9, 9, 5, "#26343f");

  rect(-11, -26, 22, 26, wagner.shirt);
  rect(-15, -22, 4, 19, wagner.shirt);
  rect(11, -22, 4, 19, wagner.shirt);

  oval(-13, -1, 3, 4, wagner.skin);
  oval(13, -1, 3, 4, wagner.skin);
  oval(0, -34, 10, 11, wagner.skin);
  oval(0, -41, 10, 5, wagner.hair);

  oval(0, -29, 8, 6, "#241c19");
  rect(-7, -34, 3, 6, "#241c19");
  rect(4, -34, 3, 6, "#241c19");

  rect(-5, -36, 2, 2, "#151c20");
  rect(3, -36, 2, 2, "#151c20");
  line(-2, -29, 2, -29, "#ad8063", 1.5);

  for (let i = 0; i < 3; i++) {
    line(
      -10, 4 + i * 3, 10, 4 + i * 3,
      "#c7b58b", 2
    );
  }

  ctx.restore();
  ctx.restore();
}

function drawBike(p) {
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(p.angle || 0);

  oval(0, 7, 27, 6, "#0003");

  for (const x of [-17, 17]) {
    ctx.strokeStyle = "#263743";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(x, 0, 10, 0, Math.PI * 2);
    ctx.stroke();

    line(
      x - 8 * Math.cos(p.step),
      -8 * Math.sin(p.step),
      x + 8 * Math.cos(p.step),
      8 * Math.sin(p.step),
      "#c1cbc9"
    );
  }

  line(-17, 0, -3, -12, p.color, 3);
  line(-3, -12, 17, 0, p.color, 3);
  line(-17, 0, 17, 0, p.color, 3);
  line(17, 0, 13, -18, "#364a55", 3);
  line(-3, -12, -5, -17, "#364a55", 3);

  line(
    -5, -15, 3, -28,
    p.shirt || "#aa8751", 8
  );
  oval(
    6, -31, 5, 5, p.skin || "#d4aa83"
  );

  if (p === nicolas) {
    oval(6, -34, 6, 3, "#f2d57c");
  }

  line(
    -1, -23, 13, -18,
    p.skin || "#d4aa83", 3
  );

  line(
    -4, -15,
    5 + Math.sin(p.step) * 4, -6,
    "#344b62", 3
  );

  ctx.restore();
}

function drawVehicle(v) {
  if (v.kind === "bike") {
    drawBike(v);
    return;
  }

  ctx.save();
  ctx.translate(v.x, v.y);
  ctx.rotate(v.angle || 0);

  const len = {
    bus: 105, truck: 120, van: 78,
    pickup: 84, suv: 72
  }[v.kind] || 62;
  const h = {
    bus: 36, truck: 38, van: 34,
    pickup: 32, suv: 32
  }[v.kind] || 27;

  round(
    -len / 2 + 4, -h / 2 + 4, len, h, 5, "#0003"
  );
  round(
    -len / 2, -h / 2, len, h, 5, v.color
  );

  const wheelPositions = v.kind === "truck"
    ? [-len * .34, -len * .22, len * .32, len * .42]
    : [-len * .32, len * .32];
  for (const x of wheelPositions) {
    rect(x - 5, -h / 2 - 3, 12, 4, "#25313b");
    rect(x - 5, h / 2, 12, 4, "#25313b");
  }

  if (v.kind === "bus") {
    for (let i = 0; i < 5; i++) {
      rect(
        -44 + i * 18, -12, 13, 24, "#90b5c0"
      );
    }
    rect(-16, -9, 33, 18, "#c0c8bc");
  } else if (v.kind === "truck") {
    rect(-len / 2 + 5, -h / 2 + 4, len * .54, h - 8, "#7b6952");
    rect(-len / 2 + 8, -h / 2 + 7, len * .48, 3, "#c8b28e");
    rect(len * .18, -h / 2 + 3, len * .28, h - 6, "#8199a0");
    rect(len / 2 - 11, -h / 2 + 5, 5, h - 10, "#667a7d");
  } else if (v.kind === "van") {
    round(-len / 2 + 5, -h / 2 + 4, len - 10, h - 8, 5, "#a9c2c2");
    rect(len / 2 - 8, -h / 2 + 5, 4, h - 10, "#65797d");
  } else if (v.kind === "pickup") {
    rect(-len / 2 + 6, -h / 2 + 4, len * .43, h - 8, "#8eaab0");
    rect(-len / 2 + len * .48, -h / 2 + 4,
      len * .34, h - 8, "#5d7074");
    line(-len / 2 + len * .48, -h / 2 + 5,
      -len / 2 + len * .48, h / 2 - 5, "#c6c2aa", 2);
  } else if (v.kind === "suv") {
    round(-len / 2 + 5, -h / 2 + 3, len - 10, h - 6, 6, "#78929a");
    rect(-3, -h / 2 + 4, 3, h - 8, "#4e646d");
  } else {
    rect(-13, -10, 27, 20, "#8db1bd");
  }

  if (v.kind !== "truck" && v.kind !== "bus") {
    line(-len / 2 + 9, -h / 2 + 2,
      len / 2 - 9, -h / 2 + 2, "#ffffff66", 1);
  }
  rect(len / 2 - 4, -h / 2 + 3, 4, 6, "#eee0a5");
  rect(len / 2 - 4, h / 2 - 9, 4, 6, "#eee0a5");

  ctx.restore();
}

function drawAnimal(a) {
  ctx.save();
  ctx.translate(a.x, a.y);

  if (Math.cos(a.angle) < 0) ctx.scale(-1, 1);

  if (a.kind === "shark") {
    oval(0, 0, 21, 7, "#56666a");
    poly([[-4, -4], [2, -17], [9, -4]], "#39494e");
    poly([[14, 0], [25, -8], [22, 1]], "#39494e");
    poly([[-17, 0], [-27, -7], [-22, 2]], "#39494e");
    oval(9, -1, 1.5, 1.5, "#101c22");
    line(2, 5, 9, 5, "#d0d5ca", 1.5);
    ctx.restore();
    return;
  }

  if (a.kind === "scorpion") {
    oval(0, 1, 6, 4, "#493d32");
    for (const side of [-1, 1]) {
      for (let i = 0; i < 3; i++) {
        line(side * 3, i, side * (10 + i), i * 2 + 3,
          "#493d32", 1.5);
      }
    }
    line(-5, -1, -11, -7, "#493d32", 2);
    oval(-12, -8, 2, 2, "#493d32");
    oval(5, -1, 1, 1, "#e3c56d");
    ctx.restore();
    return;
  }

  if (a.kind === "camel") {
    oval(0, 3, 21, 9, a.color);
    oval(-5, -5, 6, 7, a.color);
    oval(8, -4, 6, 7, a.color);
    oval(19, -2, 6, 5, a.color);
    line(16, 1, 27, -9, a.color, 4);
    oval(28, -10, 4, 4, a.color);
    for (const x of [-11, -3, 10, 17]) {
      line(x, 8, x, 17, a.color, 3);
    }
    oval(29, -11, 1, 1, "#1c2528");
    ctx.restore();
    return;
  }

  const big = ["cow", "horse"].includes(a.kind);
  const s = big ? 15 : 7;

  oval(0, 6, s * 1.2, 4, "#0002");

  if (a.kind === "bird") {
    oval(0, -2, 6, 4, "#6497a7");
    oval(5, -5, 3, 3, "#416a7e");
    poly([
      [8, -5], [12, -3], [8, -2]
    ], "#d2a554");
  } else {
    for (const x of [-s * .65, s * .5]) {
      line(
        x, 1, x + Math.sin(a.step) * 2, 9,
        a.color, big ? 4 : 2
      );
    }

    oval(0, 0, s * 1.3, s * .65, a.color);
    oval(s, -s * .3, s * .5, s * .5, a.color);
    line(-s, 0, -s - 8, -5, a.color, 3);

    if (a.kind === "rabbit") {
      oval(s - 2, -12, 2, 7, a.color);
      oval(s + 2, -12, 2, 7, a.color);
    }

    if (a.kind === "squirrel") {
      oval(-s - 3, -7, 5, 9, a.color);
    }

    if (a.kind === "cow") {
      oval(-4, -2, 5, 4, "#443d36");
      oval(6, 2, 4, 3, "#443d36");
    }

    oval(s + 2, -s * .4, 1, 1, "#20313b");
  }

  ctx.restore();
}

function drawSnake(s) {
  ctx.save();
  ctx.translate(s.x, s.y);
  ctx.rotate(s.angle);

  ctx.lineCap = "round";
  ctx.lineWidth = 5;
  ctx.strokeStyle = s.color;
  ctx.beginPath();

  for (let i = 0; i <= 14; i++) {
    const x = i * s.length / 14;
    const y = Math.sin(time * 2 + s.phase + i * .5) * 5;

    i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
  }

  ctx.stroke();

  const y = Math.sin(time * 2 + s.phase + 7) * 5;

  oval(s.length, y, 5, 4, s.color);
  oval(s.length + 2, y - 2, 1, 1, "#ecd685");

  ctx.restore();
}

/* ================= INTERIOR ================= */

function drawInteriorFloor() {
  rect(0, 0, 2600, 1900, "#c9bea8");

  for (let x = 0; x < 2600; x += 40) {
    line(x, 0, x, 1900, "#978b7544");
  }
  for (let y = 0; y < 1900; y += 40) {
    line(0, y, 2600, y, "#978b7544");
  }

  const patio = rooms.find(
    r => r.type === "patio"
  );

  rect(
    patio.x, patio.y,
    patio.w, patio.h, "#b7b093"
  );
  rect(
    patio.x + patio.w / 2 - 30, patio.y,
    60, patio.h, "#d0c1a2"
  );
  rect(
    patio.x, patio.y + patio.h / 2 - 30,
    patio.w, 60, "#d0c1a2"
  );

  oval(
    patio.x + patio.w / 2,
    patio.y + patio.h / 2,
    32, 27, "#8e9e83"
  );
  oval(
    patio.x + patio.w / 2,
    patio.y + patio.h / 2,
    22, 18, "#d8cdb1"
  );

  cracks.forEach(c => {
    if (!visible(c.x, c.y, 50)) return;

    poly([
      [c.x, c.y],
      [c.x + c.s, c.y + 2],
      [c.x + c.s * .7, c.y + c.s],
      [c.x - 3, c.y + c.s * .6]
    ], "#9e917a");

    line(
      c.x + 3, c.y + 3,
      c.x + c.s * .45, c.y + c.s * .45,
      "#655d4c", 1.5
    );
    line(
      c.x + c.s * .45, c.y + c.s * .45,
      c.x + c.s * .8, c.y + c.s * .85,
      "#655d4c", 1.5
    );
    line(
      c.x + c.s * .45, c.y + c.s * .45,
      c.x + c.s * .2, c.y + c.s,
      "#655d4c"
    );

    if (c.seed > .6) {
      poly([
        [c.x + c.s + 3, c.y + 3],
        [c.x + c.s + 11, c.y + 7],
        [c.x + c.s + 4, c.y + 13]
      ], "#e0d0af");
    }
  });

  rooms.forEach(r => {
    if (!visibleBox(r)) return;

    text(
      r.name, r.x + r.w / 2, r.y + r.h - 35,
      14, "#4c5d53"
    );

    if (r.type === "class" || r.type === "lab") {
      const cx = r.x + r.w / 2;

      round(
        cx - 110, r.y + 30, 220, 48, 3, "#876a49"
      );
      rect(
        cx - 104, r.y + 35, 208, 35, "#2b5041"
      );

      text(
        r.type === "lab" ?
          "Algoritmos e programação" :
          "Atividades da semana",
        cx, r.y + 52, 11, "#e3e4d2"
      );

      rect(cx - 115, r.y + 77, 230, 5, "#a68a62");
      rect(cx - 85, r.y + 77, 15, 3, "#eee8d2");

      const xx = r.x + r.w - 45;
      const yy = r.y + 48;

      oval(xx, yy, 18, 18, "#4c5b61");
      oval(xx, yy, 14, 14, "#eee9db");
      line(
        xx, yy, xx, yy - 10, "#34444b", 2
      );
      line(
        xx, yy, xx + 7, yy + 3, "#34444b", 2
      );

      for (const dy of [100, 340]) {
        rect(
          r.x + 25, r.y + dy, 14, 57, "#607f8c"
        );
        rect(
          r.x + 28, r.y + dy + 3, 8, 51, "#b2d8dc"
        );
      }

      round(
        r.x + r.w - 120, r.y + 335,
        70, 65, 3, "#9b7e56"
      );

      for (let i = 0; i < 3; i++) {
        rect(
          r.x + r.w - 112 + i * 19,
          r.y + 345 + (i % 2) * 7,
          15, 32,
          [
            "#eee0af", "#c5d9d0", "#ddbca8"
          ][i]
        );
      }
    }

    if (r.type === "auditorium") {
      rect(
        r.x + 235, r.y + 25,
        250, 45, "#e0dfd0"
      );
      rect(r.x + 210, r.y + 25, 22, 65, "#823f49");
      rect(r.x + 488, r.y + 25, 22, 65, "#823f49");

      round(
        r.x + r.w / 2 - 17, r.y + 145,
        34, 17, 4, "#deded1"
      );
      oval(
        r.x + r.w / 2 + 8, r.y + 153,
        4, 4, "#588293"
      );
    }
  });

  round(
    EXIT.x - 42, EXIT.y - 19, 84, 38, 4, "#47725a"
  );
  text("SAÍDA · E", EXIT.x, EXIT.y, 12);
}

function drawFurniture(p) {
  const { x, y, w, h, type } = p;

  if (type === "planter") {
    round(x, y, w, h, 8, "#7f8066");
    round(x + 5, y + 5, w - 10, h - 10, 5, "#6f8753");

    for (let i = 0; i < 6; i++) {
      oval(
        x + 18 + i * 23, y + 30 + Math.sin(i * 2) * 9,
        13, 10, "#4e7549"
      );
      oval(
        x + 15 + i * 23, y + 25 + Math.sin(i * 2) * 9,
        7, 5, "#91a96b"
      );
    }
    return;
  }

  if (type === "bench") {
    rect(x, y, w, h, "#8b6949");
    rect(x + 5, y + h, w - 10, 4, "#48594f");
    return;
  }

  if (type === "seat") {
    round(x + 3, y + 4, w, h, 5, "#0002");
    round(x, y, w, h, 5, "#984a50");
    rect(x + 5, y + h - 7, w - 10, 6, "#6c3038");
    return;
  }

  if (type === "stage") {
    rect(x, y, w, h, "#573d30");
    rect(x + 8, y + 7, w - 16, h - 14, "#99724e");
    rect(x + w - 70, y + 25, 30, 35, "#59422f");
    line(
      x + w - 55, y + 25, x + w - 55, y + 12,
      "#28373e", 2
    );
    return;
  }

  if (type === "bin") {
    round(x, y, w, h, 3, "#5b786a");
    rect(x - 2, y - 3, w + 4, 5, "#344f45");
    return;
  }

  if (type === "water") {
    round(x, y, w, h, 4, "#c9d1ca");
    rect(x + 8, y + 4, w - 16, 10, "#7ea4b4");
    rect(x + 12, y + 18, 18, 10, "#445f6a");
    return;
  }

  if (type === "notice") {
    rect(x, y, w, h, "#9c7b51");
    rect(x + 7, y + 5, 20, 24, "#eee0b6");
    rect(x + 36, y + 7, 24, 20, "#b9d0c9");
    return;
  }

  round(x + 4, y + 5, w, h, 3, "#0003");
  round(
    x, y, w, h, 3,
    type === "computer" ?
      "#617482" : "#896746"
  );
  rect(
    x + 6, y + 6, w - 12, h - 12,
    type === "computer" ?
      "#9baab0" : "#c7a775"
  );

  if (type === "computer") {
    for (const dx of [17, 82]) {
      round(x + dx, y + 8, 44, 25, 3, "#263640");
      rect(x + dx + 4, y + 11, 36, 17, "#4c8599");

      line(
        x + dx + 7, y + 16,
        x + dx + 28, y + 16, "#c2e5d1", 2
      );
      line(
        x + dx + 10, y + 22,
        x + dx + 33, y + 22, "#e0d08e", 2
      );

      rect(x + dx + 18, y + 33, 6, 6, "#3c4d57");
      rect(x + dx, y + 43, 43, 9, "#d0d2c7");
      oval(x + dx + 49, y + 47, 3, 5, "#d3d7ce");
    }
  } else {
    rect(x + 18, y + 12, 35, 25, "#eee6d1");
    line(x + 35, y + 12, x + 35, y + 37, "#b9ae94");

    for (let i = 0; i < 3; i++) {
      line(
        x + 21, y + 18 + i * 5,
        x + 30, y + 18 + i * 5, "#99a5a4"
      );
    }

    line(x + 67, y + 15, x + 72, y + 37, "#d6b24b", 3);
  }
}

/* ================= NOMES E BALÕES ================= */

function nametag(p) {
  if (!p.name) return;

  const offset =
    p === wagner ? 185 :
      p === jean ? 78 :
        p === linux ? 43 :
          p === nicolas ? 60 : 57;

  const x = p.x, y = p.y - offset;

  ctx.save();
  ctx.font = '700 13px "Segoe UI",Arial';

  const w = ctx.measureText(p.name).width + 22;

  round(x - w / 2, y - 13, w, 26, 7, "#142232ed");

  if (p.special && !p.police) {
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(x - w / 2, y - 13, w, 26, 7);
    ctx.clip();

    RAINBOW.forEach((c, i) =>
      rect(x - w / 2 + i * w / 6, y + 9, w / 6 + 1, 4, c)
    );

    ctx.restore();
  }

  text(p.name, x, y, 13);
  ctx.restore();
}

function speechBubble(p) {
  if (
    !p.speech || p.speechTimer <= 0 ||
    !visible(p.x, p.y, 0)
  ) return;

  ctx.save();
  ctx.font = '600 13px "Segoe UI",Arial';

  const lines = [];
  let current = "";
  const maxWidth = Math.max(
    90, Math.min(210, width - 40)
  );

  for (const word of p.speech.split(" ")) {
    const test = current ? current + " " + word : word;

    if (
      current &&
      ctx.measureText(test).width > maxWidth
    ) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }

  if (current) lines.push(current);

  const w = Math.max(
    ...lines.map(s => ctx.measureText(s).width)
  ) + 24;
  const h = lines.length * 18 + 18;
  const student = p.key === "alunos";

  let cx = p.x;

  if (student) {
    cx += p.x < wagner.x ? -100 : 100;
  }

  cx = clamp(
    cx, camera.x + w / 2 + 8,
    camera.x + width - w / 2 - 8
  );

  let bottom = p.y - (p === jean ? 112 : 90);

  if (student && p.y > wagner.y) {
    bottom = p.y + h + 35;
  }

  const top = Math.max(camera.y + 8, bottom - h);

  round(cx - w / 2 + 3, top + 4, w, h, 10, "#0003");
  round(cx - w / 2, top, w, h, 10, "#f7f2e5");

  if (student && p.y > wagner.y) {
    poly([
      [cx - 6, top + 1],
      [cx + 6, top + 1],
      [p.x, p.y + 10]
    ], "#f7f2e5");
  } else {
    poly([
      [cx - 6, top + h - 1],
      [cx + 6, top + h - 1],
      [p.x, p.y - (p === jean ? 94 : 68)]
    ], "#f7f2e5");
  }

  lines.forEach((s, i) =>
    text(s, cx, top + 18 + i * 18, 13, "#2c3c44")
  );

  ctx.restore();
}

function gps(
  target, label, color, margin, rainbow = false
) {
  const sx = target.x - camera.x;
  const sy = target.y - camera.y;

  if (
    sx > -20 && sx < width + 20 &&
    sy > -20 && sy < height + 45
  ) return;

  const dx = sx - width / 2;
  const dy = sy - height / 2;
  const m = Math.min(margin, width * .3, height * .3);

  const hw = Math.max(1, width / 2 - m);
  const hh = Math.max(1, height / 2 - m);

  const factor = 1 / Math.max(
    Math.abs(dx) / hw, Math.abs(dy) / hh
  );

  const x = width / 2 + dx * factor;
  const y = height / 2 + dy * factor;
  const a = Math.atan2(dy, dx);

  oval(x, y, 25, 25, "#142b3eea");

  if (rainbow) {
    RAINBOW.forEach((c, i) => {
      ctx.beginPath();
      ctx.arc(
        x, y, 23,
        i * Math.PI / 3, (i + 1) * Math.PI / 3
      );
      ctx.strokeStyle = c;
      ctx.lineWidth = 4;
      ctx.stroke();
    });
  } else {
    ctx.beginPath();
    ctx.arc(x, y, 23, 0, Math.PI * 2);
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.stroke();
  }

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(a);
  poly([[36, 0], [25, -7], [25, 7]], color);
  ctx.restore();

  text(
    label === "Fatec" ? "Fatec" : label[0],
    x, y, label === "Fatec" ? 12 : 19
  );

  const caption = label === "Fatec" ? "" :
    `${label} · ${Math.round(distance(player, target) / 10)
    } m`;

  if (caption) {
    ctx.save();
    ctx.font = '600 11px "Segoe UI",Arial';

    const w = ctx.measureText(caption).width + 16;

    const xx = clamp(
      x - Math.cos(a) * 80,
      w / 2 + 6, width - w / 2 - 6
    );
    const yy = clamp(
      y - Math.sin(a) * 48, 14, height - 14
    );

    round(
      xx - w / 2, yy - 11, w, 22, 6, "#142b3eea"
    );
    text(caption, xx, yy, 11, "#eee1bd");
    ctx.restore();
  }
}
