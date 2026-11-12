"use strict";

/* ================= ATUALIZAÇÃO ================= */

function update(dt) {
  time += dt;
  updatePlayer(dt);

  people.forEach(p => followCircuit(p, dt));
  vehicles.forEach(p => followCircuit(p, dt));

  followCircuit(nicolas, dt);
  moveTraveler(felipe, dt);
  moveTraveler(zannetu, dt);
  followCircuit(evangelista, dt);

  updatePenguin(dt);

  [felipe, zannetu, evangelista, joao].forEach(p =>
    updateSpeech(p, dt)
  );

  if (inside) {
    updateSpeech(jean, dt);
    updateSpeech(psicologa, dt);
  }

  updateStudents(dt);
  updateBeach(dt);
  updateAnimals(dt);
}

/* ================= RENDERIZAÇÃO ================= */

function draw() {
  const world = inside ? INTERIOR : WORLD;

  camera.x = clamp(
    player.x - width / 2,
    inside ? 0 : WORLD.minX,
    Math.max(inside ? 0 : WORLD.minX, world.w - width)
  );
  camera.y = clamp(
    player.y - height / 2,
    inside ? 0 : SEA_TOP, Math.max(0, world.h - height)
  );

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);

  rect(
    0, 0, width, height,
    inside ? "#2b3944" : "#697f4f"
  );

  ctx.save();
  ctx.translate(-camera.x, -camera.y);

  const items = [];
  const add = (y, draw) => items.push({ y, draw });

  if (inside) {
    drawInteriorFloor();

    insideWalls.filter(visibleBox).forEach(b => {
      add(b.y + b.h, () => {
        rect(b.x + 2, b.y + 3, b.w, b.h, "#0002");
        rect(b.x, b.y, b.w, b.h, "#8d806c");
        rect(b.x, b.y, b.w, 4, "#c1b59a");
      });
    });

    furniture.filter(visibleBox).forEach(p => {
      add(p.y + p.h, () => drawFurniture(p));
    });

    if (visible(jean.x, jean.y)) {
      add(jean.y + 8, drawJean);
    }

    jeanStudents.forEach(p => {
      if (visible(p.x, p.y)) {
        add(p.y + 8, () => drawSadStudent(p));
      }
    });

    // A Psicóloga é desenhada por último,
    // para nunca ficar atrás do palco.
    if (visible(psicologa.x, psicologa.y)) {
      add(999999, () => drawHuman(psicologa));
    }

    const currentRoom = rooms.find(r =>
      player.x > r.x && player.x < r.x + r.w &&
      player.y > r.y && player.y < r.y + r.h
    );

    locationText.textContent =
      currentRoom ?
        `Interior da Fatec · ${currentRoom.name}` :
        "Interior da Fatec · Corredores";
  } else {
    drawGround();
    drawCampus();

    buildings.filter(b =>
      !b.solid && visibleBox(b)
    ).forEach(drawBuilding);

    buildings.filter(b =>
      b.solid && visibleBox(b)
    ).forEach(b =>
      add(b.y + b.h, () => drawBuilding(b))
    );

    walls.filter(visibleBox).forEach(b =>
      add(b.y + b.h, () => drawCampusWall(b))
    );

    trees.forEach(t => {
      if (visible(t.x, t.y)) {
        add(t.y, () => drawTree(t.x, t.y, t.s));
      }
    });

    animals.forEach(a => {
      if (visible(a.x, a.y)) {
        add(a.y + 7, () => drawAnimal(a));
      }
    });

    snakes.forEach(s => {
      if (visible(s.x, s.y)) {
        add(s.y + 5, () => drawSnake(s));
      }
    });

    vehicles.forEach(v => {
      if (visible(v.x, v.y)) {
        add(v.y + 10, () => drawVehicle(v));
      }
    });

    if (visible(nicolas.x, nicolas.y)) {
      add(
        nicolas.y + 10,
        () => drawBike(nicolas)
      );
    }

    [
      ...people, ...beachPeople,
      felipe, zannetu, evangelista, joao,
      ...students
    ].forEach(p => {
      if (visible(p.x, p.y)) {
        add(p.y + 8, () => drawHuman(p));
      }
    });

    if (visible(linux.x, linux.y)) {
      add(linux.y + 8, drawPenguin);
    }

    if (visible(wagner.x, wagner.y, 220)) {
      add(wagner.y + 8, drawWagner);
    }

    if (visible(tia.x, tia.y, 180)) {
      add(tia.y + 8, () => drawHuman(tia));
    }

    customers.forEach(p => {
      if (visible(p.x, p.y)) {
        add(p.y + 8, () => drawHuman(p));
      }
    });

    locationText.textContent =
      player.x < DESERT_EDGE_X ?
        player.x >= DESERT_TOWN.x &&
          player.x < DESERT_TOWN.x + DESERT_TOWN.w &&
          player.y >= DESERT_TOWN.y &&
          player.y < DESERT_TOWN.y + DESERT_TOWN.h ?
          "Cidade Deserta" : "Deserto" :
      player.y > 4050 ? "Floresta" :
        player.y < 1280 ?
          (
            inCampus(player.x, player.y) ?
              "Campus Fatec" :
              player.x > ESPELINHOS.x - 100 &&
                player.x < ESPELINHOS.x + ESPELINHOS.w + 100 &&
                player.y > ESPELINHOS.y - 100 &&
                player.y < ESPELINHOS.y + ESPELINHOS.h + 100 ?
                "Espetinhos" : "Praia"
          ) :
          "Cidade";
  }

  add(player.y + 8, () => drawHuman(player));

  items.sort((a, b) => a.y - b.y);
  items.forEach(item => item.draw());

  nametag(player);

  if (inside) {
    [jean, psicologa].forEach(p => {
      if (visible(p.x, p.y, 0)) nametag(p);
      speechBubble(p);
    });
  } else {
    [
      felipe, zannetu, linux,
      evangelista, joao, wagner, nicolas
    ].forEach(p => {
      if (visible(p.x, p.y, 0)) nametag(p);
    });

    if (visible(tia.x, tia.y, 0)) {
      nametag({
        name: "Tia",
        x: tia.x,
        y: tia.y - 30
      });
    }

    [
      felipe, zannetu, evangelista, joao,
      ...students
    ].forEach(speechBubble);
  }

  ctx.restore();

  if (!inside) {
    gps(felipe, "Felipe", "#efd18d", 44, true);
    gps(zannetu, "Zannetu", "#e4bd79", 83);

    const seen =
      FATEC.x + FATEC.w > camera.x &&
      FATEC.x < camera.x + width &&
      FATEC.y + FATEC.h > camera.y &&
      FATEC.y < camera.y + height;

    if (!seen) {
      gps(
        { x: 2800, y: 685 },
        "Fatec", "#8ac9dc", 125
      );
    }
  }
}

/* ================= TELA E CONTROLES ================= */

function resize() {
  width = Math.max(1, window.innerWidth);
  height = Math.max(1, window.innerHeight);
  dpr = Math.min(window.devicePixelRatio || 1, 2);

  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
}

window.addEventListener("resize", resize);

window.addEventListener("keydown", e => {
  const key = e.key.toLowerCase();

  if ([
    "w", "a", "s", "d",
    "arrowup", "arrowdown",
    "arrowleft", "arrowright",
    "shift", "e"
  ].includes(key)) {
    e.preventDefault();
    keys.add(key);
  }

  if (key === "e" && !e.repeat) {
    interactRequested = true;
  }
});

window.addEventListener("keyup", e => {
  keys.delete(e.key.toLowerCase());
});

function resetInput() {
  keys.clear();
  interactRequested = false;
  lastTime = 0;
}

window.addEventListener("blur", resetInput);
document.addEventListener("visibilitychange", resetInput);

function loop(timestamp) {
  const dt = lastTime ?
    Math.min((timestamp - lastTime) / 1000, .04) : 0;

  lastTime = timestamp;

  update(dt);
  draw();

  requestAnimationFrame(loop);
}
