"use strict";

// Expansão integrada, sem bibliotecas ou arquivos de áudio externos.
const SEA_TOP = -3600, SHORE = 235, SWIM_LIMIT = -280, BOAT_LANE = -420;
const ISLAND = { x: 2900, y: -2600, rx: 650, ry: 390 };
const bag = Array(15).fill(null), equipment = { vest: null, helmet: null };
const goods = { knife: { name: 'Faca', damage: 45, range: 78, price: 80 }, baton: { name: 'Cacetete', damage: 35, range: 70, price: 60 }, gun: { name: 'Pistola', damage: 40, price: 200, capacity: 12, ammoType: 'pistolMag', reload: 1.2 }, shotgun: { name: 'Escopeta', damage: 18, price: 450, capacity: 8, ammoType: 'shells', reload: 1.8 }, rifle: { name: 'Fuzil', damage: 30, price: 850, capacity: 30, ammoType: 'rifleMag', reload: 1.6 }, launcher: { name: 'Lança-míssil', damage: 160, price: 1600, capacity: 1, ammoType: 'rocket', reload: 2 }, grenade: { name: 'Granada', damage: 110, price: 100 }, smoke: { name: 'Granada de fumaça', price: 70 }, pistolMag: { name: 'Pente de pistola · 12', price: 25, rounds: 12 }, rifleMag: { name: 'Pente de fuzil · 30', price: 50, rounds: 30 }, shells: { name: 'Cartuchos de escopeta · 8', price: 35, rounds: 8 }, rocket: { name: 'Míssil de reserva', price: 100, rounds: 1 }, vest1: { name: 'Colete N1', slot: 'vest', reduction: .35, durability: 100, price: 250 }, vest2: { name: 'Colete N2', slot: 'vest', reduction: .6, durability: 180, price: 600 }, helmet1: { name: 'Capacete N1', slot: 'helmet', reduction: .15, durability: 70, price: 150 }, helmet2: { name: 'Capacete N2', slot: 'helmet', reduction: .25, durability: 120, price: 350 }, medkit: { name: 'Kit médico' }, beer: { name: 'Cerveja', price: 10 }, coins: { name: 'Dinheiro' }, gold: { name: 'Barra de ouro · R$ 500' }, apple: { name: 'Maçã', price: 8, heal: 12 }, sandwich: { name: 'Sanduíche', price: 20, heal: 25 }, water: { name: 'Água', price: 5, heal: 5 } };
const S = { slot: 10, money: 100, bankBalance: 0, stars: 0, kills: 0, drunk: 0, blackout: 0, venue: null, returnPoint: null, dead: false, immune: 0, attack: 0, cool: 0, hand: 1, next: -1, weapon: null, holding: false, vehicle: null, dispatch: 0, hidden: 0, sighting: 0, reload: 0, reloadItem: null, beerSlotUnlocked: false, snakeCooldown: 0 };
const loot = [], officers = [], policeCars = [], bullets = [], effects = [], pools = [], bodies = [], clouds = [], indoorStudents = [], pingPlayers = [], crosswalks = [], hospitals = [], venues = {}, ejectedPeople = [], reports = [], flyingBikes = [], islandTrees = [];
let quietBoy, marcio, banker, bankGuard, station, barBuilding, shopBuilding, bankBuilding, marketBuilding, cemetery, parkingLot, marketParking, pingTable, vaultDoor, vaultOpen = false, panelMode = '', selected = 10, swap = null, notice = '', noticeTime = 0, mapOpen = false, crimeSequence = 0;
Object.assign(player, {
  hp: 300, maxHp: 300, kx: 0, ky: 0,
  gender: 'man', age: 'young', hairStyle: 'short',
  hair: '#5c3a22', skin: LIGHT_SKIN, facialHair: false
});
const place = () => S.venue || (inside ? 'fatec' : 'world');
const held = () => {
  const id = bag[S.slot]?.id;
  return id === 'ak47' || id === 'fuzil' ? 'rifle' : id;
};
const facing = () => ({ right: 0, left: Math.PI, up: -Math.PI / 2, down: Math.PI / 2 }[player.facing]);
const machine = p => vehicles.includes(p) || policeCars.includes(p);
const onIsland = (x, y, margin = 0) => ((x - ISLAND.x) / (ISLAND.rx + margin)) ** 2 + ((y - ISLAND.y) / (ISLAND.ry + margin)) ** 2 <= 1;
const isRiver = (x, y) => x >= DESERT_RIVER.x && x <= DESERT_RIVER.x + DESERT_RIVER.w && y >= DESERT_RIVER.y && y <= DESERT_RIVER.y + DESERT_RIVER.h;
const isWater = (x, y) =>
  (y < SHORE && y > SEA_TOP && x > WORLD.minX &&
    x < WORLD.w && !onIsland(x, y)) || isRiver(x, y);
const dangerous = id => ['knife', 'baton', 'gun', 'shotgun', 'rifle', 'launcher', 'grenade'].includes(id);
function item(id, extra = {}) { const g = goods[id]; return { id, ...(g.capacity ? { ammo: g.capacity } : {}), ...(g.rounds ? { rounds: g.rounds } : {}), ...(g.slot ? { durability: g.durability } : {}), ...extra }; }
function locals(where = place()) { const list = where === 'world' ? [...people, ...beachPeople, ...students, ...customers, ...animals, ...ejectedPeople, felipe, zannetu, evangelista, joao, wagner, nicolas, tia, linux] : where === 'fatec' ? [jean, psicologa, ...jeanStudents, ...indoorStudents, ...pingPlayers, quietBoy] : (venues[where]?.npcs || []); return [...new Set([...list, ...officers.filter(c => c.scene === where)])].filter(Boolean); }
function targets() { return [...locals(), ...(place() === 'world' ? [...vehicles, ...policeCars] : [])]; }
function vital(p) { if (p.hp === undefined) { p.maxHp = machine(p) ? (p.kind === 'truck' ? 760 : p.kind === 'bus' ? 680 : p.kind === 'boat' ? 500 : p.kind === 'motorcycle' ? 220 : p.kind === 'van' || p.kind === 'pickup' || p.kind === 'suv' ? 470 : p.kind === 'car' ? 400 : 150) : 100; p.hp = p.maxHp; } return p; }
function freeSlot() { for (let i = 10; i < 15; i++)if (!bag[i]) return i; return bag.indexOf(null); }
function tell(m) { notice = m; noticeTime = 3; const e = document.getElementById('game-message'); if (e) e.textContent = m; }
function drop(id, x, y, where = place(), extra = {}) { loot.push({ ...item(id, extra), x, y, scene: where }); }
// Áudio procedural: só inicia após um gesto do usuário, conforme as regras do navegador.
const sound = {
  ctx: null, master: null, muted: false, volume: .45, loops: {}, step: 0, ambient: 0, animal: 0, enginePhase: 0,
  unlock() { try { if (!this.ctx) { const A = window.AudioContext || window.webkitAudioContext; if (!A) return; this.ctx = new A(); this.master = this.ctx.createGain(); this.master.gain.value = this.volume; this.master.connect(this.ctx.destination); const n = this.ctx.createBuffer(1, this.ctx.sampleRate * 2, this.ctx.sampleRate), d = n.getChannelData(0); for (let i = 0; i < d.length; i++)d[i] = Math.random() * 2 - 1; this.noise = n; for (const [key, type, hz] of [['engine', 'sawtooth', 65], ['siren', 'sine', 800], ['wind', 'noise', 200], ['surf', 'noise', 800]]) { const gain = this.ctx.createGain(); gain.gain.value = 0; let source; if (type === 'noise') { source = this.ctx.createBufferSource(); source.buffer = n; source.loop = true; const filter = this.ctx.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.value = hz; source.connect(filter); filter.connect(gain); } else { source = this.ctx.createOscillator(); source.type = type; source.frequency.value = hz; source.connect(gain); } gain.connect(this.master); source.start(); this.loops[key] = { source, gain }; } } if (this.ctx.state === 'suspended') this.ctx.resume(); } catch (e) { } },
  tone(hz, d = .12, vol = .15, type = 'sine', end = null, delay = 0) { const ac = this.ctx; if (!ac || this.muted) return; try { const o = ac.createOscillator(), g = ac.createGain(), t = ac.currentTime + delay; o.type = type; o.frequency.setValueAtTime(hz, t); if (end) o.frequency.exponentialRampToValueAtTime(Math.max(20, end), t + d); g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(Math.max(.001, vol), t + .008); g.gain.exponentialRampToValueAtTime(.0001, t + d); o.connect(g); g.connect(this.master); o.start(t); o.stop(t + d + .02); } catch (e) { } },
  hiss(d = .15, vol = .15, hz = 1100) { const ac = this.ctx; if (!ac || this.muted || !this.noise) return; try { const b = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain(), t = ac.currentTime; b.buffer = this.noise; f.type = 'lowpass'; f.frequency.value = hz; g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.0001, t + d); b.connect(f); f.connect(g); g.connect(this.master); b.start(); b.stop(t + d + .01); } catch (e) { } },
  play(kind, pos = null) {
    if (!this.ctx || this.muted || pos && ((pos.scene || 'world') !== place() || distance(pos, player) > 950)) return; const v = pos ? Math.max(.12, 1 - distance(pos, player) / 1000) : 1;
    if (['gun', 'rifle', 'shotgun'].includes(kind)) { this.hiss(kind === 'shotgun' ? .23 : .1, .3 * v, kind === 'rifle' ? 2000 : 1500); this.tone(kind === 'shotgun' ? 75 : 130, .1, .2 * v, 'square', 45); }
    else if (kind === 'explosion') { this.hiss(.7, .45 * v, 500); this.tone(90, .6, .28 * v, 'sawtooth', 25); }
    else if (kind === 'pickup' || kind === 'buy') { this.tone(700, .12, .13 * v); this.tone(1050, .15, .11 * v, 'sine', null, .09); }
    else if (kind === 'reload') { this.hiss(.06, .12, 2400); this.tone(180, .07, .08, 'square'); }
    else if (kind === 'hit' || kind === 'crash') { this.hiss(.16, .22 * v, 700); this.tone(90, .18, .17 * v, 'triangle', 30); }
    else if (kind === 'punch') { this.hiss(.07, .1, 900); }
    else if (kind === 'eat') { this.hiss(.14, .12, 1700); this.tone(280, .06, .06, 'triangle'); }
    else if (kind === 'door' || kind === 'vault') { this.tone(kind === 'vault' ? 75 : 160, .3, .13, 'sawtooth', 40); this.hiss(.13, .1, 700); }
    else if (kind === 'bark') { this.tone(210, .11, .2 * v, 'sawtooth', 100); this.tone(185, .12, .15 * v, 'sawtooth', 90, .17); }
    else if (kind === 'alert') { this.tone(780, .12, .15, 'square'); this.tone(1050, .15, .13, 'square', null, .14); }
    else if (kind === 'death') { this.tone(160, .6, .16 * v, 'triangle', 35); }
    else if (kind === 'horn') { this.tone(330, .45, .16); this.tone(415, .45, .11); }
    else if (kind === 'swim') { this.hiss(.2, .08, 1800); }
    else if (kind === 'bird') { this.tone(1300, .12, .05 * v, 'sine', 2400); this.tone(2000, .12, .035 * v, 'sine', 1200, .18); }
    else if (kind === 'voice') { this.tone(160, .12, .045 * v, 'triangle', 240); this.tone(220, .13, .035 * v, 'triangle', 140, .12); }
    else if (kind === 'step') { this.hiss(.045, .035, 650); }
    else if (kind === 'phone') { this.tone(900, .08, .07 * v); this.tone(1200, .1, .07 * v, 'sine', null, .1); }
  },
  setMute() { this.muted = !this.muted; this.unlock(); this.update(.01); const b = document.getElementById('sound-button'), menuButton = document.getElementById('sound-mute-button'); if (b) { b.classList.toggle('is-muted', this.muted); b.setAttribute('aria-pressed', String(this.muted)); b.setAttribute('aria-label', this.muted ? 'Abrir áudio (som desligado)' : 'Abrir áudio'); } if (menuButton) { menuButton.classList.toggle('is-muted', this.muted); menuButton.setAttribute('aria-pressed', String(this.muted)); menuButton.textContent = this.muted ? 'SOM DESATIVADO' : 'SOM ATIVADO'; } },
  update(dt) {
    if (!this.ctx) return; try { const ac = this.ctx, t = ac.currentTime, active = !S.dead && !panelMode && !mapOpen && !document.hidden; this.master.gain.setTargetAtTime(this.muted || document.hidden ? 0 : this.volume, t, .04); const v = S.vehicle, engine = active && v && !['bike'].includes(v.kind); this.loops.engine.gain.gain.setTargetAtTime(engine ? .035 : 0, t, .08); if (engine) this.loops.engine.source.frequency.setTargetAtTime(45 + Math.abs(v.velocity || 0) * .4 + (v.kind === 'motorcycle' ? 35 : 0), t, .07); this.loops.siren.gain.gain.setTargetAtTime(active && v?.siren ? .025 : 0, t, .03); this.loops.siren.source.frequency.setTargetAtTime(650 + (Math.sin(time * 5) + 1) * 220, t, .03); const outside = place() === 'world', sea = outside && player.y < 500 && !onIsland(player.x, player.y, -60); this.loops.surf.gain.gain.setTargetAtTime(active && sea ? .018 * (1 + Math.sin(time * .9) * .4) : 0, t, .1); this.loops.wind.gain.gain.setTargetAtTime(active && outside ? .008 : 0, t, .1); if (!active) return; if (player.walking && !v) { this.step -= dt; if (this.step <= 0) { this.play(player.swimming ? 'swim' : 'step'); this.step = player.swimming ? .42 : keys.has('shift') ? .21 : .34; } } this.ambient -= dt; if (outside && this.ambient <= 0) { this.ambient = rand(5, 10); this.play('bird'); } this.animal -= dt; if (this.animal <= 0) { this.animal = rand(5, 9); const p = animals.find(p => !p.dead && distance(p, player) < 180); if (p) { if (p.kind === 'dog') this.play('bark', p); else this.tone(p.kind === 'cow' ? 80 : 450, .4, .045, 'triangle', p.kind === 'cow' ? 110 : 300); } } } catch (e) { }
  }
};
window.addEventListener('pointerdown', () => sound.unlock()); window.addEventListener('keydown', () => sound.unlock()); document.addEventListener('visibilitychange', () => sound.update(.01));
function reserve(id) { const type = goods[id]?.ammoType; if (!type) return 0; return bag.reduce((n, p) => n + (p?.id === type ? (p.rounds ?? goods[type].rounds) : 0), 0); }
function startReload() { const p = bag[S.slot], g = goods[p?.id]; if (!p || !g.capacity || S.dead || S.blackout > 0 || S.vehicle || S.reload > 0) return false; if ((p.ammo ?? 0) >= g.capacity) { tell('Arma já carregada'); return false; } if (reserve(p.id) <= 0) { tell('Sem munição de reserva'); return false; } S.reload = g.reload; S.reloadItem = p; tell('Recarregando…'); sound.play('reload'); return true; }
function finishReload() { const p = S.reloadItem; S.reloadItem = null; if (!p || !bag.includes(p)) return; const g = goods[p.id]; let need = g.capacity - (p.ammo ?? 0); for (let i = 0; i < bag.length && need > 0; i++) { const a = bag[i]; if (a?.id !== g.ammoType) continue; const count = a.rounds ?? goods[a.id].rounds, take = Math.min(need, count); p.ammo = (p.ammo ?? 0) + take; a.rounds = count - take; need -= take; if (a.rounds <= 0) bag[i] = null; } sound.play('reload'); refresh(); }
function splash(p, metal = false, n = 12) { for (let i = 0; i < n; i++)effects.push({ x: p.x, y: p.y, z: rand(7, 20), vz: rand(50, 140), vx: rand(-160, 160), vy: rand(-120, 120), life: rand(.5, 1), scene: p.scene || place(), metal }); if (effects.length > 450) effects.splice(0, effects.length - 450); if (!metal) { pools.push({ x: p.x, y: p.y, r: rand(5, 13), scene: p.scene || place() }); if (pools.length > 180) pools.shift(); } }
function blocked(x, y, r = 11, where = place()) { const v = venues[where]; if (v) return x < 30 + r || y < 30 + r || x > v.w - 30 - r || y > v.h - 30 - r || v.furniture.some(b => b.solid !== false && intersects(x, y, r, b)); return (where === 'fatec' ? blockedInside : blockedOutside)(x, y, r); }
function road(x, y) { if (x < DESERT_EDGE_X) { const inTown = x >= DESERT_TOWN.x && x <= DESERT_TOWN.x + DESERT_TOWN.w && y >= DESERT_TOWN.y && y <= DESERT_TOWN.y + DESERT_TOWN.h && (DESERT_HY.some(v => y >= v && y <= v + ROAD) || DESERT_VX.some(v => x >= v && x <= v + ROAD)); const connectorVertical = x >= DESERT_CONNECTOR.x - 28 && x <= DESERT_CONNECTOR.x + 28 && y >= DESERT_CONNECTOR.y && y <= DESERT_CONNECTOR.endY; const connectorHorizontal = x >= DESERT_CONNECTOR.x && x <= DESERT_CONNECTOR.endX && y >= DESERT_CONNECTOR.endY - 28 && y <= DESERT_CONNECTOR.endY + 28; return inTown || connectorVertical || connectorHorizontal; } return (HY.some(v => y >= v && y <= v + ROAD) && x >= 0 && x <= WORLD.w) || (VX.some(v => x >= v && x <= v + ROAD) && y >= HY[0] && y <= HY.at(-1) + ROAD); }
function safePoint(x, y) { if (onIsland(x, y)) return { x, y }; for (let r = 0; r < 450; r += 20)for (let i = 0; i < 24; i++) { const a = i * Math.PI / 12, nx = x + Math.cos(a) * r, ny = y + Math.sin(a) * r; if (!blockedOutside(nx, ny, 12) && !road(nx, ny) && ny > SHORE + 20) return { x: nx, y: ny }; } return { x: 2800, y: 1250 }; }
function makeOfficer(special = false, swat = false) { return { name: swat ? 'SWAT' : special ? 'Policial da Cavalaria' : 'Policial', police: true, special, cavalry: special, swat, skin: pick(skins), hair: pick(hairs), shirt: swat || special ? '#111519' : '#243f60', outfitStyle: 'jacket', step: 0, speed: special ? 82 : 55, hp: swat ? 220 : special ? 180 : 120, maxHp: swat ? 220 : special ? 180 : 120, armor: swat ? 180 : special ? 100 : 0, helmet: swat || special, scene: 'world', shotClock: 1, npcAmmo: swat || special ? 30 : 12, npcReserve: swat || special ? 90 : 36, npcReload: 0, x: 0, y: 0, trafficImmune: true }; }
function exitCar(c) { if (!c || !c.inCar || !c.car) return; const car = c.car; if (car.kind === 'boat') { c.x = clamp(car.x + 45, WORLD.minX + 30, WORLD.w - 30); c.y = clamp(car.y + 40, SEA_TOP + 40, SHORE - 30); c.swimming = isWater(c.x, c.y); } else Object.assign(c, safePoint(car.x + Math.cos((car.angle || 0) + Math.PI / 2) * 45, car.y + Math.sin((car.angle || 0) + Math.PI / 2) * 45)); c.inCar = false; c.car = null; car.occupants = car.occupants.filter(o => o !== c); if (!car.ram) car.stopped = true; c.shotClock = .8; sound.play('door', car); }
function raiseWanted(n = 1, absolute = false) { const before = S.stars; S.stars = absolute ? Math.max(S.stars, Math.min(10, n)) : Math.max(S.stars, Math.min(10, n)); S.hidden = 0; S.dispatch = Math.min(S.dispatch, 1); if (S.stars > before) sound.play('alert'); }
function sight(a, b, range = 650) { if ((a.scene || 'world') !== (b.scene || place()) || distance(a, b) > range) return false; for (const c of clouds) if (c.smoke && c.scene === (a.scene || 'world') && (distance(c, a) < c.radius || distance(c, b) < c.radius)) return false; const n = Math.max(1, Math.ceil(distance(a, b) / 16)); for (let i = 1; i < n; i++) { const x = a.x + (b.x - a.x) * i / n, y = a.y + (b.y - a.y) * i / n; if ((a.scene || 'world') === 'world' && buildings.some(r => r.solid && intersects(x, y, 1, r))) return false; if (a.scene === 'fatec' && insideWalls.some(r => intersects(x, y, 1, r))) return false; const v = venues[a.scene]; if (v && v.furniture.some(r => r.solid !== false && intersects(x, y, 1, r))) return false; } return true; }
function civilian(p) { return p && p !== player && !p.dead && !p.inCar && !p.police && !p.guard && !p.dog && !animals.includes(p) && p !== linux; }
function hasCamera(where) { return !!venues[where]?.cameras?.some(c => c.enabled); }
function sendReport(ev, via) { if (ev.reported) return; ev.reported = true; raiseWanted(ev.level, ev.absolute); tell(via === 'camera' ? 'Câmera registrou o crime' : via === 'police' ? 'Crime presenciado pela polícia' : 'Uma testemunha denunciou você'); sound.play('phone'); }
function crime(kind, victim = null, opt = {}) { const where = opt.scene || place(), ev = { id: ++crimeSequence, kind, scene: where, x: opt.x ?? player.x, y: opt.y ?? player.y, level: opt.level ?? (kind === 'murder' ? 3 : kind === 'robbery' ? 2 : 1), absolute: !!opt.absolute, reported: false }; if (hasCamera(where)) sendReport(ev, 'camera'); for (const p of locals(where)) { if (p === victim && kind === 'murder' || p.dead || p.inCar || p.dog || animals.includes(p) || p === linux) continue; if (!sight(p, ev, p.police ? 650 : 340)) continue; if (p.police) { p.hostile = true; p.dispatched = true; if (!p.marine) exitCar(p); sendReport(ev, 'police'); } else if (p.guard) { p.hostile = true; } else if (civilian(p)) { p.flee = 5; p.reaction = 1.3; reports.push({ witness: p, event: ev, remaining: rand(5, 9) }); p.reporting = true; } } if (victim && kind === 'robbery' && civilian(victim) && !reports.some(r => r.witness === victim && r.event === ev)) { reports.push({ witness: victim, event: ev, remaining: 7 }); victim.reporting = true; } return ev; }
function reportTick(dt) { for (let i = reports.length - 1; i >= 0; i--) { const r = reports[i]; if (r.witness.dead || r.event.reported) { r.witness.reporting = false; reports.splice(i, 1); continue; } r.remaining -= dt; if (r.remaining <= 0) { sendReport(r.event, 'witness'); r.witness.reporting = false; reports.splice(i, 1); } } }
function wallet(p) { if (p.wallet === undefined) p.wallet = p.rich ? Math.floor(rand(180, 501)) : Math.floor(rand(15, 61)); return p.wallet; }
function robbery() { if (S.dead || S.vehicle || !dangerous(held())) { tell('Selecione uma arma para assaltar · G'); return false; } const a = facing(), p = locals().filter(p => civilian(p) && distance(player, p) < 100 && (p.x - player.x) * Math.cos(a) + (p.y - player.y) * Math.sin(a) > -10).sort((a, b) => distance(a, player) - distance(b, player))[0]; if (!p) { tell('Ninguém ao alcance'); return false; } if (p.robbed || wallet(p) <= 0) { tell('Essa pessoa está sem dinheiro'); return false; } const value = p.wallet; p.wallet = 0; p.robbed = true; p.flee = 6; p.reaction = 1.5; S.money += value; crime('robbery', p); sound.play('pickup'); tell('Assalto: +R$ ' + value + ' · testemunhas podem denunciar'); return true; }
function responsePoint() { const points = [...VX.flatMap(x => HY.map(y => ({ x: x + 50, y: y + 50 }))), ...DESERT_VX.flatMap(x => DESERT_HY.map(y => ({ x: x + 50, y: y + 50 })))], available = points.filter(p => { const d = distance(p, player); return d > Math.max(500, Math.min(1100, Math.max(width, height) * .65)) && d < 1700; }); return pick(available.length ? available : points); }
function spawnResponse(swat = false, marine = false) { const p = marine ? { x: clamp(player.x + (player.x < 0 ? -700 : 700), WORLD.minX + 80, WORLD.w - 80), y: clamp(player.y, SEA_TOP + 120, SHORE - 90) } : responsePoint(); if (marine && onIsland(p.x, p.y, 80)) p.x = ISLAND.x - ISLAND.rx - 150; const car = { kind: marine ? 'boat' : swat ? 'bus' : 'car', color: marine ? '#447fa2' : swat ? '#202d36' : '#284e74', swat, marine, responseUnit: marine, unitType: marine ? 'marine' : undefined, policeVehicle: true, siren: true, ram: !swat && S.stars > 5, speed: marine ? 220 : swat ? 160 : 185, step: 0, hp: marine ? 650 : swat ? 1100 : 550, maxHp: marine ? 650 : swat ? 1100 : 550, scene: 'world', occupants: [], chase: true, x: p.x, y: p.y, angle: 0 }; policeCars.push(car); for (let i = 0; i < (swat ? 4 : 2); i++) { const c = makeOfficer(false, swat); Object.assign(c, { name: marine ? 'Guarda-marinha' : c.name, marine, responseUnit: marine, responseRole: marine ? 'marine' : undefined, x: car.x, y: car.y, hostile: true, dispatched: true, inCar: true, car, driver: i === 0 }); car.occupants.push(c); officers.push(c); } return car; }
function dispatchTick(dt) {
  if (S.stars <= 0) return;
  S.dispatch -= dt;
  if (S.dispatch > 0) return;
  S.dispatch = 3.2;
  const marine = place() === 'world' && player.y < SHORE;
  const activeCars = policeCars.filter(car =>
    car.chase && !car.dead && !!car.marine === marine
  ).length;
  const maxCars = Math.min(6, 1 + Math.floor(S.stars / 2));
  if (marine) {
    if (activeCars < maxCars) spawnResponse(false, true);
    return;
  }
  const active = officers.filter(officer =>
    officer.hostile && !officer.dead && !officer.inCar
  ).length;
  if (active > 22) return;
  const available = officers.filter(officer =>
    !officer.dead && !officer.hostile && !officer.inCar &&
    officer.scene === 'world' && !officer.marine &&
    !officer.dog && !officer.military
  ).sort((a, b) => distance(a, player) - distance(b, player));
  if (active < Math.min(12, S.stars * 2) && available.length) {
    available[0].hostile = true;
    available[0].dispatched = true;
    return;
  }
  if (activeCars < maxCars) {
    spawnResponse(S.stars > 7 &&
      !policeCars.some(car => car.swat && !car.dead));
  }
}
function die(p, kx = 0, ky = 0, killer = null) { if (p.dead) return; p.hp = 0; p.dead = true; p.kx = kx; p.ky = ky; p.pose = rand(-.5, .5); p.speech = ''; p.speechTimer = 0; splash(p, machine(p), 22); sound.play(machine(p) ? 'explosion' : 'death', p); if (killer === player && !machine(p) && p !== player) { S.kills++; crime('murder', p, { scene: p.scene || place(), x: p.x, y: p.y }); } if (!machine(p) && p !== player && !animals.includes(p) && !p.dog && p !== linux) { const cash = wallet(p); if (cash > 0) { drop('coins', p.x + 12, p.y + 15, p.scene || place(), { value: cash }); p.wallet = 0; } } if (p === banker) drop('gun', p.x + 20, p.y + 12, 'bank', { ammo: 8, vaultAccess: true }); if (p === quietBoy) { drop('gun', p.x + 18, p.y, p.scene, { ammo: p.npcAmmo || 0 }); if (p.npcReserve > 0) drop('pistolMag', p.x - 18, p.y, p.scene, { rounds: Math.min(12, p.npcReserve) }); } if ((p.police || p.guard) && !p.dog) { drop('baton', p.x - 20, p.y + 10, p.scene); const weapon = p.swat ? 'rifle' : p.special ? 'shotgun' : 'gun'; drop(weapon, p.x + 20, p.y + 10, p.scene, { ammo: Math.min(goods[weapon].capacity, p.npcAmmo || 0) }); if (p.npcReserve > 0) drop(goods[weapon].ammoType, p.x + 30, p.y + 35, p.scene, { rounds: Math.min(goods[goods[weapon].ammoType].rounds, p.npcReserve) }); if (p.special || p.swat) drop(p.swat ? 'vest2' : 'vest1', p.x, p.y + 32, p.scene); if (p.swat) drop('helmet2', p.x + 50, p.y + 30, p.scene); } if (machine(p)) { if (S.vehicle === p) { exitPlayerVehicle(true); hurtPlayer(20, p.angle || 0, 150); } p.explosion = p.kind === 'bike' ? 0 : .9; for (const o of [...(p.occupants || [])]) { if (o.dead || !o.inCar || o.car !== p) continue; o.inCar = false; o.car = null; o.x = p.x + rand(-20, 20); o.y = p.y + rand(-12, 12); die(o, rand(-400, 400), rand(-400, 400), killer); if (!o.police) bodies.push(o); } p.occupants = []; } }
function hurt(p, n, source = player, weaponKind = null) { vital(p); if (p.dead || p.kind === 'helicopter' && !['rifle', 'launcher'].includes(weaponKind)) return; if (p.armor > 0) { const a = Math.min(p.armor, n * .55); p.armor -= a; n -= a; } p.hp = Math.max(0, p.hp - n); splash(p, machine(p)); sound.play('hit', p); if (source === player && p.hp > 0) crime('assault', p); if (machine(p)) p.boost = 3; else { p.flee = 4; p.reaction = 1.2; p.stained = true; player.stained = true; } if (p.police || p.guard || p === quietBoy) { p.hostile = true; p.flee = 0; if (!p.driver && !p.marine) exitCar(p); } if (p.hp === 0) die(p, 0, 0, source); }
function hurtPlayer(n, a, push = 0) { if (S.dead || S.immune > 0) return; for (const slot of ['helmet', 'vest']) { const eq = equipment[slot]; if (!eq) continue; const g = goods[eq.id], absorb = Math.min(eq.durability, n * g.reduction); n -= absorb; eq.durability -= absorb; if (eq.durability <= 0) equipment[slot] = null; } player.hp = Math.max(0, player.hp - n); S.immune = .65; player.kx = Math.cos(a) * push; player.ky = Math.sin(a) * push; player.stained = true; splash(player); sound.play('hit'); if (player.hp === 0) { S.dead = true; die(player); keys.clear(); interactRequested = false; S.attack = 0; S.reload = 0; S.reloadItem = null; } }
function blackout() { if (S.dead || S.blackout > 0) return; S.blackout = 3; closePanel(); keys.clear(); interactRequested = false; S.attack = 0; S.holding = false; sound.play('death'); tell('Você desmaiou…'); }
function wake() { if (S.vehicle) exitPlayerVehicle(true); S.venue = null; inside = false; Object.assign(player, safePoint(1500, 1250)); player.scene = 'world'; player.kx = player.ky = 0; S.drunk = 15; S.immune = 3; tell('Você acordou em outro lugar'); }
function useItem(i) { if (S.dead || S.blackout > 0 || !bag[i]) return false; const id = bag[i].id, g = goods[id]; if (id === 'medkit' || g.heal) { if (player.hp >= 100) { tell('Vida já cheia'); return false; } player.hp = Math.min(100, player.hp + (g.heal || 45)); bag[i] = null; sound.play('eat'); } else if (id === 'beer') { bag[i] = null; S.drunk = Math.min(100, S.drunk + 25); sound.play('eat'); if (S.drunk >= 100) blackout(); } else if (g.slot) { const slot = g.slot, old = equipment[slot]; equipment[slot] = bag[i]; equipment[slot].durability ??= g.durability; bag[i] = old; sound.play('reload'); } else return false; refresh(); return true; }
function fire(owner, a, enemy, kind = 'gun') { sound.play(['grenade', 'smoke'].includes(kind) ? 'punch' : kind === 'launcher' ? 'explosion' : kind, owner); for (let i = 0; i < (kind === 'shotgun' ? 6 : 1); i++) { const theta = a + (kind === 'shotgun' ? rand(-.17, .17) : 0), speed = kind === 'launcher' ? 420 : ['grenade', 'smoke'].includes(kind) ? 260 : 800; bullets.push({ x: owner.x + Math.cos(theta) * 25, y: owner.y - 15 + Math.sin(theta) * 25, vx: Math.cos(theta) * speed, vy: Math.sin(theta) * speed, ttl: ['grenade', 'smoke'].includes(kind) ? 1.2 : kind === 'launcher' ? 2 : kind === 'shotgun' ? .6 : 1.2, enemy, damage: goods[kind]?.damage || 15, kind, scene: owner.scene || place(), owner }); } }
function npcShoot(p, dt, kind) { if (p.npcReload > 0) { p.npcReload -= dt; if (p.npcReload <= 0) { const take = Math.min(goods[kind].capacity, p.npcReserve); p.npcReserve -= take; p.npcAmmo = take; } return; } p.shotClock -= dt; if (p.shotClock > 0) return; if ((p.npcAmmo || 0) <= 0) { if (p.npcReserve > 0) p.npcReload = goods[kind].reload; return; } p.npcAmmo--; fire(p, p.aim, true, kind); p.shotClock = kind === 'rifle' ? .25 : kind === 'shotgun' ? 1.6 : .9; }
function attack() { if (S.dead || S.vehicle || player.swimming || S.blackout > 0 || S.cool > 0 || S.reload > 0) return; const id = held(), p = bag[S.slot], g = goods[id]; if (['beer', 'medkit'].includes(id) || g?.slot || g?.heal) { useItem(S.slot); return; } if (g?.capacity && (p.ammo || 0) <= 0) { tell('Arma vazia · R recarrega'); startReload(); return; } S.weapon = id; S.attack = .3; S.cool = id === 'rifle' ? .13 : id === 'shotgun' ? .9 : id === 'launcher' ? 1.2 : .42; S.hand = S.next; S.next *= -1; if (['gun', 'shotgun', 'rifle', 'launcher', 'grenade', 'smoke'].includes(id)) { if (g.capacity) p.ammo--; fire(player, facing(), false, id); crime('gunfire'); if (['grenade', 'smoke'].includes(id)) bag[S.slot] = null; return; } sound.play('punch'); const info = g || { damage: 25, range: 55 }, a = facing(); const list = targets().filter(p => { vital(p); const dx = p.x - player.x, dy = p.y - player.y, d = Math.hypot(dx, dy); return !p.dead && !p.inCar && d < info.range && (d < 18 || (dx * Math.cos(a) + dy * Math.sin(a)) / d > -.1); }).sort((a, b) => distance(a, player) - distance(b, player)); if (list[0]) hurt(list[0], info.damage); }
function explode(b) { if (b.kind === 'smoke') { clouds.push({ x: b.x, y: b.y, radius: 125, ttl: 10, scene: b.scene, smoke: true }); sound.play('swim', b); return; } sound.play('explosion', b); const r = b.kind === 'launcher' ? 130 : 100; clouds.push({ x: b.x, y: b.y, radius: r, ttl: .7, scene: b.scene, smoke: false }); for (const p of [...locals(b.scene), ...(b.scene === 'world' ? [...vehicles, ...policeCars] : [])]) { if (p.dead || p.inCar || p.kind === 'helicopter' && b.kind !== 'launcher') continue; const d = distance(p, b); if (d < r) hurt(p, b.damage * (1 - d / r * .6), b.owner, b.kind); } if (place() === b.scene && distance(player, b) < r) hurtPlayer(b.damage, Math.atan2(player.y - b.y, player.x - b.x), 600); }
function nearestLoot() { return loot.filter(p => p.scene === place() && distance(p, player) < 65 && (p.id !== 'gold' || vaultOpen)).sort((a, b) => distance(a, player) - distance(b, player))[0]; }
function collect() { const d = nearestLoot(); if (!d) return false; if (['coins', 'gold'].includes(d.id)) { S.money += d.id === 'gold' ? 500 : d.value || 10; if (d.id === 'gold') { crime('bankRobbery', null, { level: 10, absolute: true }); tell('Ouro roubado: +R$ 500'); } loot.splice(loot.indexOf(d), 1); sound.play('pickup'); return true; } const i = freeSlot(); if (i < 0) { tell('Mochila cheia'); return true; } bag[i] = { ...item(d.id), ...(d.ammo !== undefined ? { ammo: d.ammo } : {}), ...(d.rounds !== undefined ? { rounds: d.rounds } : {}), ...(d.durability !== undefined ? { durability: d.durability } : {}), ...(d.vaultAccess ? { vaultAccess: true } : {}) }; loot.splice(loot.indexOf(d), 1); sound.play('pickup'); refresh(); return true; }
function discard(i = S.slot) { if (S.dead || S.vehicle || !bag[i]) return; let x = player.x + Math.cos(facing()) * 32, y = player.y + Math.sin(facing()) * 32; if (blocked(x, y, 5)) { x = player.x; y = player.y; } const p = bag[i]; if (S.reloadItem === p) { S.reload = 0; S.reloadItem = null; } drop(p.id, x, y, place(), { ...p }); bag[i] = null; sound.play('reload'); refresh(); }
function buy(id) { if (S.dead || !['gunshop', 'supermarket'].includes(place())) return false; const allowed = place() === 'supermarket' ? !!goods[id].heal : !goods[id].heal; if (!allowed) return false; const info = goods[id], slot = freeSlot(); if (S.money < info.price) { tell('Dinheiro insuficiente'); return false; } if (slot < 0) { tell('Mochila cheia'); return false; } S.money -= info.price; bag[slot] = item(id); sound.play('buy'); tell(info.name + ' comprado'); refresh(); return true; }
function buyBeer() { const i = freeSlot(); if (i < 0) { tell('Mochila cheia'); return; } if (S.money < 10) { tell('Cerveja: R$ 10'); return; } S.money -= 10; bag[i] = item('beer'); sound.play('buy'); tell('Cerveja guardada · U: usar'); refresh(); }
function hospitalHeal() { if (player.hp >= 100) { tell('Vida já cheia'); return; } if (S.money < 25) { tell('Tratamento: R$ 25'); return; } S.money -= 25; player.hp = 100; sound.play('buy'); tell('Vida restaurada'); }
function nearDoor(b) { return b && Math.abs(player.x - (b.x + b.w / 2)) < 85 && Math.abs(player.y - (b.y + b.h + 35)) < 60; }
function unlockVault() { if (vaultOpen) return true; if (!banker.dead || !bag.some(p => p?.vaultAccess)) { tell('Cofre trancado: mate o banqueiro e pegue a arma dele'); return false; } vaultOpen = true; vaultDoor.solid = false; sound.play('vault'); tell('Cofre destrancado'); crime('vaultBreak', null, { level: 10, absolute: true }); return true; }
function interact() { if (S.dead || S.blackout > 0 || S.vehicle) return true; if (nearestLoot()) return collect(); if (S.venue) { const v = venues[S.venue]; if (v.kind === 'bank' && distance(player, { x: 550, y: 600 }) < 75 && !vaultOpen) { unlockVault(); return true; } if (distance(player, { x: v.w / 2, y: 220 }) < 115) { if (v.kind === 'bar') buyBeer(); else if (v.kind === 'hospital') hospitalHeal(); else if (v.kind === 'gunshop') openPanel('shop'); else if (v.kind === 'supermarket') openPanel('food'); return true; } if (distance(player, v.exit) < 90) { S.venue = null; Object.assign(player, S.returnPoint); player.scene = 'world'; player.kx = player.ky = 0; sound.play('door'); return true; } return true; } if (!inside) for (const [key, v] of Object.entries(venues)) if (nearDoor(v.building)) { S.returnPoint = { x: player.x, y: player.y }; S.venue = key; player.scene = key; player.x = v.exit.x; player.y = v.exit.y - 60; player.kx = player.ky = 0; sound.play('door'); return true; } return false; }
function nearVehicle() { if (place() !== 'world') return null; return [...vehicles, ...policeCars].filter(v => !v.dead && distance(v, player) < 90).sort((a, b) => distance(a, player) - distance(b, player))[0] || null; }
function ejectOccupant(o, v) { if (o.dead) return; o.inCar = false; o.car = null; if (v.kind === 'boat') { o.x = clamp(v.x + rand(-50, 50), WORLD.minX + 30, WORLD.w - 30); o.y = clamp(v.y + 35, SEA_TOP + 40, SHORE - 20); o.swimming = isWater(o.x, o.y); } else Object.assign(o, safePoint(v.x + rand(-55, 55), v.y + rand(-55, 55))); o.scene = 'world'; o.flee = 6; o.reaction = 1.5; o.stationary = false; if (!o.police && !ejectedPeople.includes(o)) ejectedPeople.push(o); if (o.police) { o.hostile = true; o.dispatched = true; } }
function stealVehicle(v) { if (S.dead || place() !== 'world' || !v || v.dead || S.vehicle) return false; if (v.policeVehicle && (v.occupants || []).some(c => c.police && !c.dead && c.inCar)) { for (const c of [...v.occupants]) { exitCar(c); c.hostile = true; c.dispatched = true; } raiseWanted(4, true); tell('Tentativa de roubo de viatura ocupada · 4 estrelas'); return false; } const occupants = [...(v.occupants || [])]; for (const o of occupants) ejectOccupant(o, v); v.occupants = []; v.driver = player; v.chase = false; v.stopped = false; v.velocity = 0; v.siren = false; v.contacts = new Set(); S.vehicle = v; player.x = v.x; player.y = v.y; player.kx = player.ky = 0; S.reload = 0; S.reloadItem = null; const ev = crime('vehicleTheft', null, { scene: 'world', x: v.x, y: v.y, level: v.kind === 'bike' ? 1 : 2 }); for (const o of occupants) if (!o.dead && !o.police) reports.push({ witness: o, event: ev, remaining: 7 }); sound.play('door'); tell('F: sair · W/S acelerar/ré · A/D virar' + (v.policeVehicle ? ' · C: sirene' : '')); return true; }
function exitPlayerVehicle(force = false) { const v = S.vehicle; if (!v) return false; if (!force && Math.abs(v.velocity || 0) > 70) { tell('Reduza a velocidade para sair'); return false; } if (v.kind === 'boat') { player.x = clamp(v.x + 50, WORLD.minX + 25, WORLD.w - 25); player.y = clamp(v.y + 35, SEA_TOP + 25, SHORE - 15); } else Object.assign(player, safePoint(v.x + Math.cos((v.angle || 0) + Math.PI / 2) * 55, v.y + Math.sin((v.angle || 0) + Math.PI / 2) * 55)); v.driver = null; v.stopped = true; v.velocity = 0; v.siren = false; S.vehicle = null; player.kx = player.ky = 0; player.swimming = isWater(player.x, player.y); sound.play('door'); return true; }
function toggleSiren() { if (!S.vehicle?.policeVehicle) return false; S.vehicle.siren = !S.vehicle.siren; sound.unlock(); tell(S.vehicle.siren ? 'Sirene ligada' : 'Sirene desligada'); return true; }
function damageVehicle(v, n, source = null) { vital(v); if (v.dead || n <= 0 || v.kind === 'helicopter') return; v.hp = Math.max(0, v.hp - n); splash(v, true, 5); sound.play('crash', v); if (v.hp === 0) die(v, 0, 0, source); }
function vehicleBlocked(v, x, y) { if (v.kind === 'boat') return x < WORLD.minX + 35 || x > WORLD.w - 35 || y < SEA_TOP + 45 || y > SHORE - 18 || onIsland(x, y, 25); return isWater(x, y) || blockedOutside(x, y, ['bike', 'motorcycle'].includes(v.kind) ? 9 : ['truck', 'bus'].includes(v.kind) ? 21 : 16); }
function launchBike(b, car) { if (b.airborne) return; const a = car.angle || 0, spd = Math.max(230, Math.abs(car.velocity || car.speed || 150)), n = b === nicolas ? { x: b.x, y: b.y, kind: 'bike', color: '#bc9b53', step: 0, scene: 'world' } : b; Object.assign(n, { airborne: true, dead: true, hp: 0, z: 12, vz: 340, vx: Math.cos(a) * spd * 1.25, vy: Math.sin(a) * spd * 1.25, spin: rand(-5, 5), rotation: 0 }); if (!flyingBikes.includes(n)) flyingBikes.push(n); sound.play('crash', b); }
function updateFlyingBikes(dt) { for (const b of flyingBikes) { if (!b.airborne) continue; b.x = clamp(b.x + b.vx * dt, 15, WORLD.w - 15); b.y = clamp(b.y + b.vy * dt, SEA_TOP + 15, WORLD.h - 15); b.z += b.vz * dt; b.vz -= 600 * dt; b.rotation += b.spin * dt; b.vx *= Math.exp(-.3 * dt); b.vy *= Math.exp(-.3 * dt); if (b.z <= 0) { b.z = 0; b.airborne = false; sound.play('crash', b); } } }
function drawFlyingBike(b) { ctx.save(); oval(b.x, b.y, 20, 5, '#12212b55'); ctx.translate(b.x, b.y - b.z); ctx.rotate(b.rotation || 0); ctx.strokeStyle = '#a9bac2'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(-17, 0, 11, 0, Math.PI * 2); ctx.stroke(); ctx.beginPath(); ctx.arc(17, 0, 11, 0, Math.PI * 2); ctx.stroke(); line(-17, 0, 0, -14, '#d4a15e', 3); line(0, -14, 17, 0, '#d4a15e', 3); line(-17, 0, 8, 0, '#d4a15e', 3); line(0, -14, 8, 0, '#d4a15e', 3); ctx.restore(); }
function drivePlayer(dt) { const v = S.vehicle; if (!v || v.dead) return; const throttle = Number(keys.has('w') || keys.has('arrowup')) - Number(keys.has('s') || keys.has('arrowdown')), steer = Number(keys.has('d') || keys.has('arrowright')) - Number(keys.has('a') || keys.has('arrowleft')); const max = v.kind === 'bike' ? 240 : v.kind === 'truck' ? 230 : v.kind === 'bus' ? 270 : v.kind === 'van' ? 330 : v.kind === 'pickup' ? 350 : v.kind === 'suv' ? 380 : v.kind === 'motorcycle' ? 460 : v.kind === 'boat' ? 330 : 400; v.velocity = (v.velocity || 0) + throttle * (v.kind === 'motorcycle' ? 310 : ['truck', 'bus'].includes(v.kind) ? 190 : 250) * dt; if (!throttle) v.velocity *= Math.exp(-1.2 * dt); if (keys.has(' ')) v.velocity *= Math.exp(-7 * dt); v.velocity = clamp(v.velocity, -max * .4, max); v.angle = (v.angle || 0) + steer * (v.kind === 'boat' ? 1.5 : 2.2) * dt * Math.min(1, Math.abs(v.velocity) / 80) * (v.velocity < 0 ? -1 : 1); const dx = Math.cos(v.angle) * v.velocity * dt, dy = Math.sin(v.angle) * v.velocity * dt, n = Math.max(1, Math.ceil(Math.hypot(dx, dy) / 4)); let impact = false; for (let i = 0; i < n; i++) { const x = v.x + dx / n, y = v.y + dy / n; if (!vehicleBlocked(v, x, y)) { v.x = x; v.y = y; } else { impact = true; break; } } if (impact && Math.abs(v.velocity) > 35) { damageVehicle(v, Math.max(5, Math.abs(v.velocity) * .18)); v.velocity *= -.2; } for (const o of [...vehicles, ...policeCars]) { if (o === v || o.dead || (o.kind === 'boat') !== (v.kind === 'boat')) continue; if (distance(v, o) < (['bus', 'truck'].includes(v.kind) || ['bus', 'truck'].includes(o.kind) ? 51 : 37) && (v.crashTimer || 0) <= 0) { if (o.kind === 'bike' && Math.abs(v.velocity) > 40) { launchBike(o, v); damageVehicle(v, 3); } else { const speed = Math.abs(v.velocity) + (o.chase ? o.speed : 40); damageVehicle(v, Math.max(6, speed * .12)); damageVehicle(o, Math.max(5, speed * .1), player); v.velocity *= -.25; } v.crashTimer = .45; } } v.crashTimer = Math.max(0, (v.crashTimer || 0) - dt); v.step += Math.abs(v.velocity) * dt * .05; if (S.vehicle === v) { player.x = v.x; player.y = v.y; } }
function icon(id, x, y, k = 1) { ctx.save(); ctx.translate(x, y); ctx.scale(k, k); if (id === 'gold') { poly([[-15, 8], [-10, -6], [10, -6], [16, 8]], '#e3ba42'); poly([[-10, -6], [-5, -11], [14, -11], [10, -6]], '#ffe19a'); } else if (id === 'apple') { oval(0, 2, 12, 12, '#d65c53'); line(0, -8, 3, -15, '#65533c', 3); oval(6, -11, 6, 3, '#7fa665'); } else if (id === 'sandwich') { poly([[-16, 10], [-12, -12], [16, 10]], '#edd29c'); line(-13, 5, 10, 5, '#80a861', 4); line(-13, 9, 15, 9, '#ba7758', 3); } else if (id === 'water') { round(-7, -14, 14, 29, 3, '#7cb5ce'); rect(-5, -18, 10, 5, '#dae4df'); rect(-7, -2, 14, 8, '#d5e7e9'); } else if (id === 'knife') { round(-3, 0, 6, 12, 2, '#634c36'); poly([[-3, 0], [-3, -18], [0, -26], [4, -13], [3, 0]], '#dce9ef'); } else if (id === 'baton') round(-3, -22, 6, 34, 2, '#222c37'); else if (id.startsWith('vest')) { round(-13, -15, 26, 30, 4, '#526777'); rect(-10, -9, 20, 3, '#8da3ad'); rect(-10, 2, 20, 3, '#8da3ad'); } else if (id.startsWith('helmet')) { oval(0, -3, 14, 13, '#627876'); rect(-14, 0, 28, 6, '#819a9b'); } else if (id === 'medkit') { round(-14, -10, 28, 21, 4, '#eceee9'); rect(-3, -7, 6, 15, '#d55757'); rect(-8, -2, 16, 5, '#d55757'); } else if (id === 'beer') { round(-8, -15, 16, 27, 3, '#c3943c'); rect(-7, -16, 14, 4, '#f8edca'); } else if (id === 'coins') { oval(0, 0, 10, 10, '#e3c05d'); text('$', 0, 0, 13, '#806424'); } else if (goods[id]?.rounds) { round(-11, -16, 22, 32, 3, '#6c7a72'); for (let i = 0; i < 3; i++)rect(-7 + i * 6, -12, 4, 22, id === 'shells' ? '#b47757' : '#ceb477'); } else if (['grenade', 'smoke'].includes(id)) { oval(0, 0, 9, 13, id === 'smoke' ? '#8e9eab' : '#526b4a'); rect(-3, -17, 6, 6, '#8e9eab'); } else { round(-8, -6, ['launcher', 'rifle', 'shotgun'].includes(id) ? 38 : 23, 8, 2, id === 'launcher' ? '#718454' : '#51616c'); rect(-5, 1, 7, 12, '#28333d'); } ctx.restore(); }
function health(p) {
  vital(p);
  if (p === player || p.dead || p.inCar ||
      p.hp >= p.maxHp || !visible(p.x, p.y)) return;
  const y = p.y - (p === wagner ? 205 : p === jean ? 95 : 82);
  const x = p.x - 25;
  const ratio = clamp(p.hp / p.maxHp, 0, 1);
  round(x, y, 50, 10, 4, '#071119');
  round(x + 2, y + 2, 46, 6, 2, '#542c32');
  if (ratio > 0) {
    const gradient = ctx.createLinearGradient(x, 0, x + 46, 0);
    gradient.addColorStop(0, ratio > .4 ? '#3d9b6b' : '#c74750');
    gradient.addColorStop(1, ratio > .4 ? '#85e3a8' : '#f18776');
    round(x + 2, y + 2, 46 * ratio, 6, 2, gradient);
  }
  ctx.strokeStyle = '#d9e8e933';
  ctx.strokeRect(x + .5, y + .5, 49, 9);
}
function corpse(p) { ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.pose || 0); oval(0, 7, 27, 9, '#672b3255'); if (p === linux) { oval(0, 0, 17, 11, '#1c2934'); oval(0, 1, 11, 8, '#e5e6db'); oval(-17, -1, 8, 8, '#1c2934'); poly([[-24, -2], [-30, 1], [-23, 3]], '#d6a445'); } else if (animals.includes(p) || p.dog) { const r = ['cow', 'horse'].includes(p.kind) ? 20 : 12; oval(0, 0, r, r * .55, p.color); oval(-r, -3, r * .4, r * .35, p.color); line(4, -5, r + 5, -9, p.color, 4); line(5, 5, r + 3, 10, p.color, 4); } else { round(-12, -8, 25, 17, 4, p.shirt || '#5d6f7c'); oval(-21, -1, 8, 9, p.skin || '#d0a17d'); oval(-24, -3, 5, 8, p.hair || '#372a23'); line(10, -4, 27, -8, '#354655', 6); line(10, 4, 26, 10, '#354655', 6); line(-6, 6, -11, 16, p.skin || '#d0a17d', 4); line(2, -6, 14, -14, p.skin || '#d0a17d', 4); } oval(0, 2, 7, 4, '#8b3439'); ctx.restore(); }
function lyingPatient(p) { ctx.save(); ctx.translate(p.x, p.y); round(-31, -15, 64, 30, 5, '#eff4f1'); round(-28, -12, 14, 24, 4, '#c7dcd6'); oval(-18, 0, 8, 9, p.skin); oval(-21, -2, 5, 8, p.hair); round(-8, -9, 23, 18, 4, '#bad7cf'); line(-5, -7, 13, -12, p.skin, 4); if (!p.amputee) line(10, -4, 26, -6, '#b6d2d1', 6); else round(10, -7, 7, 7, 2, '#f2e9d9'); line(10, 4, 26, 7, '#b6d2d1', 6); ctx.restore(); }
const baseHuman = drawHuman; drawHuman = function (p) { vital(p); if (p === player && S.vehicle) return; if (p.dead) { corpse(p); return; } if (p.inCar) return; if (p.lying) { lyingPatient(p); return; } const moving = p.flee > 0, s = p.stationary, w = p.walking; if (moving) { p.stationary = false; p.walking = true; } ctx.save(); if (p.swimming) { ctx.beginPath(); ctx.rect(p.x - 60, p.y - 80, 120, 70); ctx.clip(); } if (p.seated) { round(p.x - 14, p.y - 7, 28, 23, 4, '#57413a'); ctx.translate(p.x, p.y); ctx.scale(1, .82); ctx.translate(-p.x, -p.y); } else if (moving) { ctx.translate(p.x, p.y); ctx.rotate(Math.cos(p.angle || 0) * .12); ctx.translate(-p.x, -p.y); } baseHuman(p); ctx.restore(); p.stationary = s; p.walking = w; if (p.swimming) { oval(p.x, p.y - 8, 20, 5, '#c7e4e044'); line(p.x - 14, p.y - 9, p.x + 14, p.y - 9, '#bbdcd8', 1.5); } if (p.seated) round(p.x + 15, p.y - 22, 7, 11, 2, '#d3a649'); if (p.rich) { rect(p.x - 3, p.y - 24, 6, 19, '#e8e4d6'); poly([[p.x, p.y - 22], [p.x + 2, p.y - 18], [p.x, p.y - 8], [p.x - 2, p.y - 18]], '#ac5b4d'); line(p.x - 9, p.y - 22, p.x - 4, p.y - 14, '#9da7af', 2); line(p.x + 9, p.y - 22, p.x + 4, p.y - 14, '#9da7af', 2); } if (p.stained && !p.swimming) oval(p.x - 4, p.y - 17, 3, 4, '#8b3439'); if (p.reaction > 0) text('!', p.x, p.y - 72, 24, '#ffd57f', 800); if (p.reporting) text('📱', p.x + 20, p.y - 48, 14, '#dfe8ef'); if (p.police || p.guard) { rect(p.x - 8, p.y - 41, 16, 5, '#171b20'); if (p.special) { line(p.x - 8, p.y - 23, p.x + 8, p.y - 23, '#d1ad53', 3); line(p.x - 7, p.y - 21, p.x - 7, p.y - 5, '#c29c45', 2); } if (p.swat) { round(p.x - 8, p.y - 24, 16, 19, 3, '#3b4a4f'); oval(p.x, p.y - 39, 11, 6, '#3b4a4f'); } if (p.marine) round(p.x - 9, p.y - 23, 18, 19, 3, '#de8f39'); } if (p.doctor) { rect(p.x - 8, p.y - 23, 16, 22, '#f2f5f3'); line(p.x, p.y - 20, p.x, p.y - 10, '#e18c8c', 2); } if (p === marcio) round(p.x + 13, p.y - 12 - (Math.sin(time * 1.8) + 1) * 6, 8, 10, 2, '#ce963b'); if (p === player) { if (equipment.vest) round(p.x - 8, p.y - 23, 16, 18, 3, '#526777'); if (equipment.helmet) oval(p.x, p.y - 38, 11, 6, '#627876'); } if (p.ping) oval(p.x + 13, p.y - 15 + Math.sin(time * 5 + p.phase) * 5, 5, 7, p.phase ? '#485ca1' : '#ab514e'); };
const oldTag = nametag; nametag = function (p) { if (p === player && S.vehicle) return; if (p.police) { const special = p.special; p.special = false; oldTag(p); p.special = special; } else oldTag(p); };
const oldAnimal = drawAnimal; drawAnimal = function (p) { if (p.dead) corpse(p); else oldAnimal(p); };
const oldPenguin = drawPenguin; drawPenguin = function () { if (linux.dead) corpse(linux); else oldPenguin(); };
const oldJean = drawJean; drawJean = function () { if (jean.dead) corpse(jean); else oldJean(); };
const oldWagner = drawWagner; drawWagner = function () { if (wagner.dead) corpse(wagner); else oldWagner(); };
const oldBike = drawBike; drawBike = function (p) { if (p.airborne) return; if (p.dead) { if (p === nicolas) corpse(p); else if (!flyingBikes.includes(p)) { line(p.x - 20, p.y, p.x + 20, p.y + 6, '#8496a0', 4); } return; } oldBike(p); };
const oldVehicle = drawVehicle; drawVehicle = function (p) { if (p.airborne || flyingBikes.includes(p)) return; if (p.kind === 'boat') { ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.angle || 0); if (p.dead) { oval(0, 0, 30, 14, '#485860'); ctx.restore(); return; } oval(-35, 0, 22, 17, '#dceee944'); poly([[-45, -21], [25, -24], [52, 0], [25, 24], [-45, 21]], p.color || '#9b7152'); poly([[-35, -15], [23, -17], [39, 0], [23, 17], [-35, 15]], '#dce2d4'); round(-10, -11, 25, 22, 4, '#537f94'); rect(-35, -15, 9, 30, '#656d6e'); if (p.marine) text('MAR', 0, 0, 10, '#dcecf2'); if (p.driver === player) oval(-15, 0, 6, 6, player.skin); if (p.policeVehicle && p.siren) rect(-6, -5, 12, 10, Math.sin(time * 12) > 0 ? '#e65e5e' : '#5c9cde'); ctx.restore(); return; } if (p.kind === 'motorcycle') { ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.angle || 0); oval(-18, 0, 11, 5, '#24313c'); oval(19, 0, 11, 5, '#24313c'); round(-15, -8, 32, 16, 6, p.dead ? '#596268' : p.color); round(-8, -6, 14, 12, 4, '#26343e'); line(17, -13, 17, 13, '#aab5bd', 3); if (!p.dead && (!p.stopped || p.driver === player)) oval(0, 0, 7, 7, p.driver === player ? player.skin : p.skin || '#d4b18f'); if (p.policeVehicle && p.siren) rect(-18, -5, 7, 10, Math.sin(time * 12) > 0 ? '#e65e5e' : '#5c9cde'); ctx.restore(); return; } if (p.dead) { oval(p.x, p.y, 30, 18, '#35414b'); line(p.x - 25, p.y - 10, p.x + 26, p.y + 9, '#81929c', 5); if (p.explosion > 0) oval(p.x, p.y - 12, 30, 25, '#ee9139'); return; } oldVehicle(p); if (p.swat) text('SWAT', p.x, p.y, 12, '#e2e8ec'); if (p.policeVehicle && p.siren) { ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.angle || 0); rect(-5, -10, 10, 20, Math.sin(time * 12) > 0 ? '#e65e5e' : '#5c9cde'); ctx.restore(); } };
function crossBusy(c) { return locals('world').some(p => !p.dead && !p.inCar && !animals.includes(p) && Math.abs(p.x - c.x) < (c.axis === 'v' ? 75 : 42) && Math.abs(p.y - c.y) < (c.axis === 'v' ? 42 : 75)) || (!S.vehicle && place() === 'world' && Math.abs(player.x - c.x) < (c.axis === 'v' ? 75 : 42) && Math.abs(player.y - c.y) < (c.axis === 'v' ? 42 : 75)); }
function trafficStop(v) { if (v.chase || ['boat', 'bike'].includes(v.kind) || v.driver === player) return false; const a = v.angle || 0; for (const c of crosswalks) { const dx = c.x - v.x, dy = c.y - v.y, f = dx * Math.cos(a) + dy * Math.sin(a), side = Math.abs(-dx * Math.sin(a) + dy * Math.cos(a)); if (f > 35 && f < 130 && side < 70 && crossBusy(c)) return true; } for (const x of VX) for (const y of HY) { const dx = x + 50 - v.x, dy = y + 50 - v.y, f = dx * Math.cos(a) + dy * Math.sin(a), side = Math.abs(-dx * Math.sin(a) + dy * Math.cos(a)), vertical = Math.abs(Math.sin(a)) > .5, green = vertical ? time % 16 >= 8 : time % 16 < 8; if (!green && f > 55 && f < 135 && side < 65) return true; } return false; }
const oldFollow = followCircuit; followCircuit = function (p, dt) { if (p.dead || p.driver === player) return; if (machine(p)) { if (p.chase || p.stopped || trafficStop(p)) return; oldFollow(p, dt * (p.boost > 0 ? 2 : 1)); return; } oldFollow(p, dt); };
const oldTraveler = moveTraveler; moveTraveler = function (p, dt) { if (!p.dead) oldTraveler(p, dt); };
const oldSpeech = updateSpeech; updateSpeech = function (p, dt) { if (!p.dead) { const before = p.speechTimer || 0; oldSpeech(p, dt); if (p.speechTimer > before && distance(p, player) < 160) sound.play('voice', p); } };
const oldGPS = gps; gps = function (p, ...args) { if (!p.dead && distance(player, p) <= 2000) oldGPS(p, ...args); };
const basePlayerUpdate = updatePlayer; updatePlayer = function (dt) { if (S.vehicle) { interactRequested = false; hint.style.display = 'none'; return; } const swim = place() === 'world' && isWater(player.x, player.y), speed = player.speed; player.speed = swim ? 105 : speed; player.swimming = swim; basePlayerUpdate(dt); player.speed = speed; };
function moveBody(p, dt) { const where = p.scene || 'world', dx = (p.kx || 0) * dt, dy = (p.ky || 0) * dt, n = Math.max(1, Math.ceil(Math.hypot(dx, dy) / 4)); for (let i = 0; i < n; i++) { const x = p.x + dx / n, y = p.y + dy / n; if (!blocked(x, p.y, 10, where)) p.x = x; else p.kx = 0; if (!blocked(p.x, y, 10, where)) p.y = y; else p.ky = 0; } p.kx = (p.kx || 0) * Math.exp(-3.2 * dt); p.ky = (p.ky || 0) * Math.exp(-3.2 * dt); }
function updateBullets(dt) { for (let i = bullets.length - 1; i >= 0; i--) { const b = bullets[i]; b.ttl -= dt; let hit = false; const n = Math.max(1, Math.ceil(Math.hypot(b.vx, b.vy) * dt / 5)); for (let j = 0; j < n && !hit; j++) { const nx = b.x + b.vx * dt / n, ny = b.y + b.vy * dt / n; if (blocked(nx, ny, 2, b.scene)) { hit = true; break; } b.x = nx; b.y = ny; if (['grenade', 'smoke'].includes(b.kind)) continue; if (b.enemy) { if (place() === b.scene && Math.hypot(b.x - player.x, b.y - (S.vehicle ? player.y : player.y - 15)) < (S.vehicle ? 28 : 17)) { if (S.vehicle) damageVehicle(S.vehicle, b.damage * .65); else hurtPlayer(b.damage, Math.atan2(b.vy, b.vx)); hit = true; } } else for (const p of [...locals(b.scene), ...(b.scene === 'world' ? [...vehicles, ...policeCars] : [])]) { if (p.dead || p.inCar) continue; if (Math.hypot(b.x - p.x, b.y - (p.y - (machine(p) ? 0 : 15))) < (machine(p) ? 28 : 18)) { if (b.kind !== 'launcher') hurt(p, b.damage, b.owner, b.kind); hit = true; break; } } } if (hit || b.ttl <= 0) { if (['launcher', 'grenade', 'smoke'].includes(b.kind)) explode(b); bullets.splice(i, 1); } } }
function carHit(v, p) { if (v.kind === 'helicopter') return false; const a = v.angle || 0, dx = p.x - v.x, dy = p.y - v.y; return Math.abs(dx * Math.cos(a) + dy * Math.sin(a)) < (v.kind === 'bus' ? 63 : v.kind === 'boat' ? 55 : 42) && Math.abs(-dx * Math.sin(a) + dy * Math.cos(a)) < 28; }
function vehicleContact(v, p, rng = Math.random) { v.contacts ??= new Set(); const hit = carHit(v, p); if (!hit) { v.contacts.delete(p); return false; } if (v.contacts.has(p) || p.dead || p.inCar) return false; v.contacts.add(p); const playerDriving = v.driver === player; if (!playerDriving && (p.trafficImmune || p.police || p.important)) return false; if (!playerDriving && animals.includes(p) && rng() >= .1) return false; if (p === nicolas) launchBike(p, v); const a = v.angle || 0; die(p, Math.cos(a) * 1100, Math.sin(a) * 1100, playerDriving ? player : null); sound.play('crash', p); return true; }
function driveChase(car, dt) { if (place() !== 'world' || car.dead || S.stars === 0) return; if (car.kind === 'boat') { const target = { x: player.x, y: clamp(player.y, SEA_TOP + 70, SHORE - 65) }, dx = target.x - car.x, dy = target.y - car.y, d = Math.hypot(dx, dy); if (d > 95) { let angle = Math.atan2(dy, dx); for (const offset of [0, .7, -.7, 1.3, -1.3]) { const x = car.x + Math.cos(angle + offset) * car.speed * dt, y = car.y + Math.sin(angle + offset) * car.speed * dt; if (!vehicleBlocked(car, x, y)) { car.angle = angle + offset; car.x = x; car.y = y; break; } } } } else { if (player.y < SHORE) return; if (car.swat && distance(car, player) < 280) { car.stopped = true; for (const c of [...car.occupants]) if (!c.driver) exitCar(c); return; } if (!car.ram && !S.vehicle && distance(car, player) < 210) { car.stopped = true; for (const c of [...car.occupants]) exitCar(c); return; } let target; if (distance(car, player) < 210) target = player; else { if (!car.destination || distance(car, car.destination) < 10) { const col = VX.reduce((best, x, i) => Math.abs(x + 50 - car.x) < Math.abs(VX[best] + 50 - car.x) ? i : best, 0), row = HY.reduce((best, y, i) => Math.abs(y + 50 - car.y) < Math.abs(HY[best] + 50 - car.y) ? i : best, 0); const options = [[col - 1, row], [col + 1, row], [col, row - 1], [col, row + 1]].filter(([x, y]) => x >= 0 && x < VX.length && y >= 0 && y < HY.length).map(([x, y]) => ({ x: VX[x] + 50, y: HY[y] + 50 })); options.sort((a, b) => distance(a, player) - distance(b, player)); car.destination = options[0] || player; } target = car.destination; } const dx = target.x - car.x, dy = target.y - car.y, d = Math.hypot(dx, dy); if (d < 1) return; car.angle = Math.atan2(dy, dx); const n = Math.max(1, Math.ceil(car.speed * dt / 4)); for (let i = 0; i < n; i++) { const x = car.x + dx / d * car.speed * dt / n, y = car.y + dy / d * car.speed * dt / n; if (!vehicleBlocked(car, x, y)) { car.x = x; car.y = y; } } } car.step += dt * 10; if (S.vehicle && !S.vehicle.dead && (car.kind === 'boat') === (S.vehicle.kind === 'boat') && distance(car, S.vehicle) < (car.kind === 'bus' ? 58 : 42) && (car.hitCooldown || 0) <= 0) { damageVehicle(S.vehicle, 18); damageVehicle(car, 8); S.vehicle.velocity *= .6; car.hitCooldown = 1; } car.hitCooldown = Math.max(0, (car.hitCooldown || 0) - dt); }
function separatePolice() { const grid = new Map(), size = 32; for (const c of officers) { if (c.dead || c.inCar) continue; const cx = Math.floor(c.x / size), cy = Math.floor(c.y / size); for (let dx = -1; dx <= 1; dx++)for (let dy = -1; dy <= 1; dy++)for (const o of grid.get(c.scene + ':' + (cx + dx) + ':' + (cy + dy)) || []) { let x = c.x - o.x, y = c.y - o.y, d = Math.hypot(x, y); if (d >= 25) continue; if (d < .01) { const a = (officers.indexOf(c) + 1) * 2.399963; x = Math.cos(a); y = Math.sin(a); d = 1; } const push = (25 - d) * .52, nx = c.x + x / d * push, ny = c.y + y / d * push, ox = o.x - x / d * push, oy = o.y - y / d * push; if (!blocked(nx, ny, 10, c.scene)) { c.x = nx; c.y = ny; } if (!blocked(ox, oy, 10, o.scene)) { o.x = ox; o.y = oy; } } const key = c.scene + ':' + cx + ':' + cy; if (!grid.has(key)) grid.set(key, []); grid.get(key).push(c); } }
function wantedTick(dt, seen) { if (S.stars <= 0) return; if (seen) { S.hidden = 0; S.sighting = 1; } else { S.hidden += dt; S.sighting = 0; if (S.hidden >= 12) { S.stars--; S.hidden = 4; if (S.stars === 0) { for (const c of officers) { c.hostile = false; c.dispatched = false; } for (const car of policeCars) if (car.chase) { car.chase = false; car.stopped = true; car.siren = false; } tell('Você despistou a polícia'); } } } }
function dogUpdate(d, dt) { if (d.dead) return; if (!d.owner || d.owner.dead) d.owner = officers.find(c => !c.dead && !c.dog && !c.inCar && c.scene === d.scene); const owner = d.owner; if (d.scene === place() && dangerous(held()) && !S.vehicle && distance(d, player) < 185) { if (!(d.bark > 0)) sound.play('bark', d); d.bark = 1.2; d.hostile = true; if (owner) { owner.hostile = true; owner.dispatched = true; } if (!S.stars) raiseWanted(1); S.hidden = 0; } d.bark = Math.max(0, (d.bark || 0) - dt); if (!d.hostile && owner && owner.scene === d.scene) { const dx = owner.x - d.x, dy = owner.y - d.y, dist = Math.hypot(dx, dy); if (dist > 45) { const nx = d.x + dx / dist * 70 * dt, ny = d.y + dy / dist * 70 * dt; if (!blocked(nx, ny, 9, d.scene)) { d.x = nx; d.y = ny; d.step += dt * 10; } } } }
function policeUpdate(dt) { let seen = false; dispatchTick(dt); for (const car of policeCars) { if (!car.dead && !car.stopped && car.driver !== player) { if (car.chase) driveChase(car, dt); else followCircuit(car, dt); } for (const c of car.occupants) if (c.inCar) { c.x = car.x; c.y = car.y; } } for (const c of officers) { if (c.dead) continue; if (c.dog) dogUpdate(c, dt); if (c.hostile && sight(c, player)) seen = true; if (c.inCar) { if (c.marine && c.hostile && sight(c, player)) { c.aim = Math.atan2(player.y - c.y, player.x - c.x); npcShoot(c, dt, 'gun'); } continue; } if (c.scene === 'station' && place() === 'station' && dangerous(held()) && sight(c, player)) { c.hostile = true; if (!S.stars) raiseWanted(1); seen = true; } if (c.hostile && S.stars > 0) { if (c.scene !== place()) { if (c.dispatched) { c.travel = (c.travel || 0) + dt; if (c.travel > 9) { c.travel = 0; c.scene = place(); if (c.scene === 'world') Object.assign(c, safePoint(player.x + 450, player.y + 450)); else if (c.scene === 'fatec') { c.x = INDOOR_SPAWN.x; c.y = INDOOR_SPAWN.y; } else { const v = venues[c.scene]; c.x = v.exit.x; c.y = v.exit.y - 60; } } } continue; } c.aim = Math.atan2(player.y - c.y, player.x - c.x); const dist = distance(c, player); if (dist > (c.dog ? 26 : 240) && !(c.scene === 'world' && player.y < SHORE && !c.marine)) { const speed = c.dog ? 150 : c.swimming ? 70 : 95, nx = c.x + Math.cos(c.aim) * speed * dt, ny = c.y + Math.sin(c.aim) * speed * dt; if (!blocked(nx, ny, 10, c.scene)) { c.x = nx; c.y = ny; c.step += dt * 12; } } if (c.dog) { if (dist < 32 && !S.vehicle) hurtPlayer(10, c.aim, 70); } else if (dist < 700 && sight(c, player)) npcShoot(c, dt, c.swat ? 'rifle' : c.special ? 'shotgun' : 'gun'); } else if (c.route && !c.dog) followCircuit(c, dt); } separatePolice(); wantedTick(dt, seen); }
function venueMovement(dt) { time += dt; let dx = Number(keys.has('d') || keys.has('arrowright')) - Number(keys.has('a') || keys.has('arrowleft')), dy = Number(keys.has('s') || keys.has('arrowdown')) - Number(keys.has('w') || keys.has('arrowup')); if (dx || dy) { dx += Math.sin(time * 3) * (S.drunk / 100) * .7; dy += Math.cos(time * 2.7) * (S.drunk / 100) * .5; const d = Math.hypot(dx, dy); dx /= d; dy /= d; player.facing = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'); const amount = player.speed * (keys.has('shift') ? 1.6 : 1) * dt, n = Math.max(1, Math.ceil(amount / 3)); for (let i = 0; i < n; i++) { const x = player.x + dx * amount / n, y = player.y + dy * amount / n; if (!blocked(x, player.y)) player.x = x; if (!blocked(player.x, y)) player.y = y; } player.walking = true; player.step += dt * 11; } else { player.walking = false; player.step = 0; } interactRequested = false; }
updateBeach = function (dt) { for (const p of beachPeople) { if (p.dead || p.flee > 0) continue; p.turn -= dt; if (p.turn <= 0) { p.turn = rand(2, 5); p.angle = rand(0, 6.28); } const nx = p.x + Math.cos(p.angle) * p.speed * dt, ny = p.y + Math.sin(p.angle) * p.speed * dt, minY = p.canSwim ? SWIM_LIMIT : 275; p.walking = false; if (nx < 40 || nx > WORLD.w - 40 || ny < minY || ny > 1180 || inCampus(nx, ny, 30) || blockedOutside(nx, ny, 10)) { p.angle += 2; continue; } p.x = nx; p.y = ny; p.walking = true; p.step += dt * 8; p.swimming = p.y < SHORE; } };
const oldUpdate = update; update = function (dt) {
  sound.update(dt); if (S.dead || panelMode || mapOpen) { keys.clear(); interactRequested = false; return; } if (S.blackout > 0) { S.blackout -= dt; keys.clear(); interactRequested = false; if (S.blackout <= 0) wake(); return; } S.attack = Math.max(0, S.attack - dt); S.cool = Math.max(0, S.cool - dt); S.immune = Math.max(0, S.immune - dt); S.drunk = Math.max(0, S.drunk - dt * .35); noticeTime = Math.max(0, noticeTime - dt); if (S.reload > 0) { S.reload -= dt; if (S.reload <= 0) finishReload(); } player.scene = place(); for (const p of locals('fatec')) p.scene = 'fatec'; const world = locals('world'), all = [...world, ...locals('fatec'), ...Object.values(venues).flatMap(v => v.npcs)], saved = all.map(p => ({ p, x: p.x, y: p.y })); if (S.venue) venueMovement(dt); else oldUpdate(dt); player.scene = place(); for (const old of saved) { const p = old.p; if (p.dead || p.flee > 0 || (p.scene === 'world' && p !== nicolas && p !== linux && !p.police && road(p.x, p.y) && !crosswalks.some(c => Math.abs(p.x - c.x) < (c.axis === 'v' ? 66 : 24) && Math.abs(p.y - c.y) < (c.axis === 'v' ? 24 : 66)))) { p.x = old.x; p.y = old.y; } if (p.dead) { moveBody(p, dt); continue; } p.reaction = Math.max(0, (p.reaction || 0) - dt); if (p.flee > 0) { p.flee = Math.max(0, p.flee - dt); if (p.scene !== place()) continue; p.lying = false; p.seated = false; const a = Math.atan2(p.y - player.y, p.x - player.x), nx = p.x + Math.cos(a) * 180 * dt, ny = p.y + Math.sin(a) * 180 * dt, limit = p.canSwim ? SWIM_LIMIT : SHORE + 10; if (!blocked(nx, p.y, 10, p.scene) && (p.scene !== 'world' || !road(nx, p.y))) p.x = nx; if (!blocked(p.x, ny, 10, p.scene) && (p.scene !== 'world' || !road(p.x, ny))) p.y = p.scene === 'world' && p.y > -500 ? Math.max(p.swimming ? SWIM_LIMIT : limit, ny) : ny; p.angle = a; p.step = (p.step || 0) + dt * 18; } else if (venues[p.scene] && !p.stationary && !p.police && !p.guard) { p.turn = (p.turn || 0) - dt; if (p.turn <= 0) { p.turn = rand(2, 5); p.angle = rand(0, 6.28); } const nx = p.x + Math.cos(p.angle) * 25 * dt, ny = p.y + Math.sin(p.angle) * 25 * dt; if (!blocked(nx, ny, 14, p.scene)) { p.x = nx; p.y = ny; p.step += dt * 7; } else p.angle += 2; } if (p.scene === 'world') p.swimming = isWater(p.x, p.y); }
  for (const p of indoorStudents) { if (p.dead || p.flee > 0) continue; const t = p.route[p.target], dx = t.x - p.x, dy = t.y - p.y, d = Math.hypot(dx, dy), a = Math.min(d, 50 * dt); if (d < 4) p.target = (p.target + 1) % p.route.length; else { const nx = p.x + dx / d * a, ny = p.y + dy / d * a; if (!blockedInside(nx, p.y, 10)) p.x = nx; if (!blockedInside(p.x, ny, 10)) p.y = ny; p.step += dt * 8; } } if (S.vehicle) drivePlayer(dt); else moveBody(player, dt); player.swimming = place() === 'world' && !S.vehicle && isWater(player.x, player.y); for (const b of bodies) moveBody(b, dt); for (const v of [...vehicles, ...policeCars]) { v.boost = Math.max(0, (v.boost || 0) - dt); v.explosion = Math.max(0, (v.explosion || 0) - dt); for (const p of v.occupants || []) if (p.inCar) { p.x = v.x; p.y = v.y; } } policeUpdate(dt); reportTick(dt); if (place() === 'world') for (const v of [...vehicles, ...policeCars]) { if (v.dead || v.stopped || trafficStop(v)) continue; const moving = v.driver === player ? Math.abs(v.velocity || 0) > 35 : v.kind !== 'bike'; if (!moving) continue; const a = v.angle || 0; if (!S.vehicle && carHit(v, player)) hurtPlayer(v.ram ? 40 : v.kind === 'bus' ? 35 : 25, a, 1300); for (const p of world) if (!p.dead && !p.inCar) vehicleContact(v, p); } for (const npc of [quietBoy, bankGuard]) if (npc && !npc.dead && npc.hostile && place() === npc.scene) { npc.aim = Math.atan2(player.y - npc.y, player.x - npc.x); if (distance(npc, player) < 750 && sight(npc, player)) npcShoot(npc, dt, 'gun'); } if (S.holding && held() === 'rifle' && S.cool <= 0) attack(); updateBullets(dt); updateFlyingBikes(dt); for (let i = effects.length - 1; i >= 0; i--) { const p = effects[i]; p.x += p.vx * dt; p.y += p.vy * dt; p.z += p.vz * dt; p.vz -= 340 * dt; p.life -= dt; if (p.life <= 0 || p.z < 0) effects.splice(i, 1); } for (let i = clouds.length - 1; i >= 0; i--) { clouds[i].ttl -= dt; if (clouds[i].ttl <= 0) clouds.splice(i, 1); } if (!S.dead) { const d = nearestLoot(); let label = S.vehicle ? 'W/S acelerar/ré · A/D virar · Espaço frear · F sair · V buzina' + (S.vehicle.policeVehicle ? ' · C sirene' : '') : d ? 'E: pegar ' + goods[d.id].name : ''; if (!label && S.venue) { const v = venues[S.venue]; if (v.kind === 'bank' && !vaultOpen && distance(player, { x: 550, y: 600 }) < 75) label = 'E: destrancar cofre · arma do banqueiro'; else if (distance(player, { x: v.w / 2, y: 220 }) < 115) label = v.kind === 'bar' ? 'E: cerveja · R$ 10' : v.kind === 'hospital' ? 'E: tratamento · R$ 25' : ['gunshop', 'supermarket'].includes(v.kind) ? 'E: comprar' : ''; else if (distance(player, v.exit) < 90) label = 'E: sair'; } else if (!label && !inside) { for (const v of Object.values(venues)) if (nearDoor(v.building)) label = 'E: entrar · ' + v.name; if (!label && nearVehicle()) label = 'F: entrar / roubar veículo'; } if (label) { hint.style.display = 'block'; hint.textContent = label; } else if (S.venue) hint.style.display = 'none'; }
}
function trafficDraw() { for (const c of crosswalks) { if (!visible(c.x, c.y, 140)) continue; if (c.axis === 'v') { for (let x = c.x - 50; x < c.x + 50; x += 16)rect(x, c.y - 10, 9, 20, '#e9e7d4'); } else for (let y = c.y - 50; y < c.y + 50; y += 16)rect(c.x - 10, y, 20, 9, '#e9e7d4'); } for (const x of VX) for (const y of HY) { if (!visible(x, y, 150)) continue; const vertical = time % 16 >= 8; rect(x - 14, y - 20, 10, 24, '#263741'); oval(x - 9, y - 14, 3, 3, vertical ? '#bd3e3e' : '#5ccb71'); oval(x - 9, y - 3, 3, 3, vertical ? '#5ccb71' : '#bd3e3e'); } }
const oldGround = drawGround; drawGround = function () { oldGround(); rect(0, SEA_TOP, WORLD.w, -SEA_TOP + SHORE, '#3f839b'); const left = Math.max(0, Math.floor(camera.x / 30) * 30), right = Math.min(WORLD.w, camera.x + width + 50); for (let y = Math.floor(Math.max(SEA_TOP, camera.y) / 65) * 65; y < Math.min(SHORE, camera.y + height + 70); y += 65) { ctx.beginPath(); for (let x = left; x < right; x += 30) { const yy = y + Math.sin(x / 110 + time * .9 + y * .01) * 6 + Math.sin(x / 55 - time * 1.4) * 2; if (x === left) ctx.moveTo(x, yy); else ctx.lineTo(x, yy); } ctx.strokeStyle = '#c9e9e43d'; ctx.lineWidth = 2; ctx.stroke(); } for (let y = 195; y < SHORE; y += 10) { ctx.beginPath(); for (let x = left; x < right; x += 25) { const yy = y + Math.sin(x / 90 + time * 1.5) * 5; if (x === left) ctx.moveTo(x, yy); else ctx.lineTo(x, yy); } ctx.strokeStyle = '#f6f9de44'; ctx.stroke(); } line(0, SWIM_LIMIT, WORLD.w, SWIM_LIMIT, '#f2d68666', 2); for (let x = 100; x < WORLD.w; x += 350)if (visible(x, SWIM_LIMIT)) oval(x, SWIM_LIMIT + Math.sin(time * 2 + x) * 3, 5, 5, '#f2d686'); oval(ISLAND.x, ISLAND.y, ISLAND.rx + 10 + Math.sin(time) * 3, ISLAND.ry + 10, '#c6e4dc'); oval(ISLAND.x, ISLAND.y, ISLAND.rx, ISLAND.ry, '#dfcf9d'); oval(ISLAND.x, ISLAND.y - 4, ISLAND.rx - 65, ISLAND.ry - 60, '#71935c'); oval(ISLAND.x, ISLAND.y - 10, ISLAND.rx - 155, ISLAND.ry - 120, '#507846'); trafficDraw(); };
function islandForest() { for (const t of islandTrees) { if (!visible(t.x, t.y, 90)) continue; oval(t.x + 5, t.y + 9, 25, 8, '#2f4e3455'); rect(t.x - 4, t.y - 22, 8, 27, '#705c40'); oval(t.x, t.y - 30, 28, 29, '#3d6842'); oval(t.x - 15, t.y - 35, 19, 22, '#4d7f48'); oval(t.x + 14, t.y - 45, 24, 23, '#548b4c'); } }
const oldBuilding = drawBuilding; drawBuilding = function (b) { if (b === cemetery) { round(b.x, b.y, b.w, b.h, 8, '#6a7769'); for (let r = 0; r < 3; r++)for (let c = 0; c < 5; c++) { const x = b.x + 35 + c * (b.w - 70) / 4, y = b.y + 35 + r * (b.h - 65) / 2; round(x - 10, y - 15, 20, 29, 6, '#aeb3ad'); line(x, y - 11, x, y + 8, '#687269', 2); line(x - 5, y - 4, x + 5, y - 4, '#687269', 2); } text('CEMITÉRIO', b.x + b.w / 2, b.y + b.h + 20, 16, '#f0e6c6'); return; } if (b === parkingLot || b === marketParking) { rect(b.x, b.y, b.w, b.h, '#53616b'); ctx.strokeStyle = '#e1ddb5'; ctx.lineWidth = 2; for (let row = 0; row < 3; row++)for (let col = 0; col < 2; col++)ctx.strokeRect(b.x + 8 + col * (b.w - 16) / 2, b.y + 25 + row * (b.h - 35) / 3, (b.w - 16) / 2 - 4, (b.h - 35) / 3 - 5); text(b === parkingLot ? 'P · POLÍCIA / SWAT' : 'P · CLIENTES', b.x + b.w / 2, b.y + 13, 10, '#e1dcb5'); return; } oldBuilding(b); if ([barBuilding, station, shopBuilding, bankBuilding, marketBuilding].includes(b)) { round(b.x + 5, b.y - 25, b.w - 10, 28, 5, b === marketBuilding ? '#3f6e4c' : '#182c3d'); text(b === barBuilding ? 'BAR' : b === shopBuilding ? 'LOJA DE ARMAS' : b === bankBuilding ? 'BANCO' : b === marketBuilding ? 'SUPERMERCADO' : 'QUARTEL', b.x + b.w / 2, b.y - 11, 12, '#eee3b8'); } };
function rack(x, y, w = 250) { round(x, y, w, 125, 4, '#26323b'); for (let i = 0; i < 3; i++) { line(x + 8, y + 30 + i * 34, x + w - 8, y + 30 + i * 34, '#96a5ae', 2); for (let j = 0; j < 3; j++)icon(i === 0 ? 'rifle' : i === 1 ? 'shotgun' : 'gun', x + 40 + j * (w - 55) / 3, y + 21 + i * 34, .65); } }
function venueDraw() { const v = venues[S.venue]; camera.x = clamp(player.x - width / 2, 0, Math.max(0, v.w - width)); camera.y = clamp(player.y - height / 2, 0, Math.max(0, v.h - height)); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, width, height); rect(0, 0, width, height, '#14252d'); ctx.save(); ctx.translate(-camera.x, -camera.y); rect(25, 25, v.w - 50, v.h - 50, v.color); for (let x = 25; x < v.w - 25; x += 45)line(x, 25, x, v.h - 25, '#879b8b44'); for (let y = 25; y < v.h - 25; y += 45)line(25, y, v.w - 25, y, '#879b8b44'); text(v.name, v.w / 2, 50, 20, v.kind === 'hospital' ? '#3f6f64' : '#fce7a9'); text(v.kind === 'hospital' ? 'Tratamento R$ 25' : v.kind === 'bar' ? 'Cerveja R$ 10' : v.kind === 'station' ? 'Guarde suas armas' : v.kind === 'bank' ? 'Área monitorada · cofre trancado' : v.kind === 'supermarket' ? 'Comida na mochila · U para consumir' : 'Catálogo · armas e munições', v.w / 2, 75, 13, v.kind === 'hospital' ? '#405b57' : '#dce5d4'); if (v.kind === 'station') { text('PATRULHA', 360, 120, 15, '#d4e2e7'); text('SWAT', 1090, 130, 17, '#e7ce8e'); text('ARMAMENTO', 1090, 515, 16, '#e7ce8e'); rack(840, 540, 490); text('CANIL · K9', 350, 590, 16, '#d4e2e7'); } if (v.kind === 'bank') { round(150, 130, 800, 45, 5, '#55716b'); text('AGÊNCIA CENTRAL', v.w / 2, 150, 22, '#eee1ab'); round(175, 345, 750, 205, 7, '#444f54'); text('COFRE', 550, 365, 18, '#f5df98'); text(vaultOpen ? 'ABERTO' : 'TRANCADO', 550, 590, 13, vaultOpen ? '#a3e0b4' : '#f4db91'); } for (const b of v.furniture) { if (b === vaultDoor && !b.solid) continue; round(b.x, b.y, b.w, b.h, Math.min(6, b.h / 2), v.kind === 'hospital' ? '#6b9990' : b.wall ? '#5d6c71' : v.kind === 'supermarket' ? '#6b8971' : v.kind === 'gunshop' ? '#3f4e5c' : '#604c38'); if (v.kind === 'hospital') { round(b.x + 7, b.y + 5, b.w - 14, b.h - 10, 5, '#edf2ed'); rect(b.x + 12, b.y + 12, 35, b.h - 24, '#bbd3cb'); } if (b.shelf) { for (let row = 0; row < 3; row++)for (let col = 0; col < 3; col++)icon(['apple', 'sandwich', 'water'][(row + col) % 3], b.x + 25 + col * 45, b.y + 25 + row * 50, .55); } } if (v.kind === 'supermarket') { round(350, 125, 300, 65, 5, '#416c52'); text('CAIXA · E', 500, 150, 16, '#eff2d9'); } if (v.kind === 'gunshop') { rack(70, 90, 260); rack(v.w - 330, 90, 260); round(v.w / 2 - 160, 120, 320, 65, 5, '#84989f'); rack(80, 365, 160); rack(v.w - 240, 365, 160); for (let i = 0; i < 4; i++)icon(i % 2 ? 'rifleMag' : 'shells', 337 + i * 100, 465, .7); } if (v.kind === 'hospital') { round(v.w / 2 - 120, 125, 240, 50, 5, '#527a75'); text('RECEPÇÃO', v.w / 2, 150, 15, '#e1efea'); } if (v.kind === 'bar') for (const b of v.furniture.filter(b => b.table)) round(b.x + b.w - 30, b.y + 18, 8, 14, 2, '#d5a24f'); for (const c of v.cameras || []) { line(c.x, c.y, c.x + 14, c.y + 10, '#242f3a', 3); round(c.x + 8, c.y + 3, 18, 9, 2, '#d8e3df'); oval(c.x + 24, c.y + 7, 2, 2, c.enabled ? '#ec5c5c' : '#5d6569'); } round(v.exit.x - 60, v.exit.y - 22, 120, 42, 4, '#476f61'); text('SAÍDA · E', v.exit.x, v.exit.y, 14); drawHuman(player); ctx.restore(); locationText.textContent = v.name; }
function pingDraw() { if (!pingTable) return; const t = pingTable; round(t.x, t.y, t.w, t.h, 4, '#367a69'); ctx.strokeStyle = '#e2eee3'; ctx.lineWidth = 2; ctx.strokeRect(t.x + 3, t.y + 3, t.w - 6, t.h - 6); line(t.x + t.w / 2, t.y - 7, t.x + t.w / 2, t.y + t.h + 7, '#e2eee3', 3); if (pingPlayers.every(p => !p.dead && !(p.flee > 0))) { const a = (Math.sin(time * 4) + 1) / 2; oval(t.x + 12 + a * (t.w - 24), t.y + t.h / 2 + Math.sin(time * 8) * 10, 3, 3, '#faf2d4'); } }
function HUD() { const w = Math.min(270, Math.max(210, width * .32)), x = 16, y = height - 225; round(x + 3, y + 4, w, 206, 13, '#06101866'); round(x, y, w, 206, 13, '#102536f2'); const eqText = (slot, label) => { const p = equipment[slot]; return p ? label + ' ' + Math.ceil(p.durability) + ' / ' + goods[p.id].durability : label + ' —'; }; text(eqText('helmet', 'CAPACETE'), x + w / 2, y + 20, 11, '#c1d3e0'); text(eqText('vest', 'COLETE'), x + w / 2, y + 40, 11, '#c1d3e0'); const p = bag[S.slot], g = goods[p?.id]; text(g?.capacity ? (S.reload > 0 ? 'RECARREGANDO…' : g.name + ' ' + (p.ammo ?? 0) + ' / ' + reserve(p.id) + ' · R') : goods[held()]?.name || 'Mãos vazias', x + w / 2, y + 64, 12, '#efd9a5'); text('SAÚDE', x + 45, y + 91, 11, '#c4d9e3'); text(Math.ceil(player.hp) + ' / 100', x + w - 48, y + 91, 12, '#eff9f2'); round(x + 14, y + 106, w - 28, 12, 6, '#283d48'); if (player.hp > 0) round(x + 14, y + 106, (w - 28) * player.hp / 100, 12, Math.min(6, (w - 28) * player.hp / 200), player.hp < 30 ? '#ef7772' : '#60c9a1'); text('BEBEDEIRA', x + 58, y + 142, 11, '#d0c5e8'); text(Math.round(S.drunk) + '%', x + w - 34, y + 142, 12, '#e7ddf4'); round(x + 14, y + 157, w - 28, 10, 5, '#302e48'); if (S.drunk > 0) round(x + 14, y + 157, (w - 28) * S.drunk / 100, 10, Math.min(5, (w - 28) * S.drunk / 200), '#b49bdf'); text(player.swimming ? 'NADANDO' : S.vehicle ? 'DIRIGINDO' : onIsland(player.x, player.y) ? 'ILHA · FLORESTA' : 'A PÉ · G: ASSALTAR', x + w / 2, y + 187, 10, '#a1bdca'); text('★'.repeat(S.stars) + '☆'.repeat(10 - S.stars), width / 2, 25, 20, '#f1ce72'); text('R$ ' + S.money + ' · ' + S.stars + '/10' + (S.stars > 0 ? (S.sighting ? ' · LOCALIZADO' : ' · DESPISTANDO') : ''), width / 2, 50, 13, '#ffe4a3'); const x0 = Math.max(8, width - 259), yy = height - 59; for (let i = 10; i < 15; i++) { const xx = x0 + (i - 10) * 50; round(xx, yy, 44, 44, 5, i === S.slot ? '#4c7288' : '#152b3aee'); ctx.strokeStyle = i === S.slot ? '#ffe6a1' : '#61798a'; ctx.lineWidth = i === S.slot ? 3 : 1; ctx.strokeRect(xx, yy, 44, 44); text(String(i - 9), xx + 8, yy + 8, 10); if (bag[i]) icon(bag[i].id, xx + 25, yy + 27, .65); } if (S.vehicle) { const v = S.vehicle; round(width / 2 - 135, height - 130, 270, 55, 8, '#152c3def'); text((v.kind === 'boat' ? 'BARCO' : v.kind === 'motorcycle' ? 'MOTO' : v.kind === 'bike' ? 'BICICLETA' : v.kind === 'bus' ? 'ÔNIBUS' : 'CARRO') + ' · ' + Math.round(Math.abs(v.velocity || 0) / 4) + ' km/h' + (v.policeVehicle ? ' · C ' + (v.siren ? 'SIRENE ON' : 'SIRENE OFF') : ''), width / 2, height - 113, 12); rect(width / 2 - 100, height - 99, 200, 8, '#4e3030'); rect(width / 2 - 100, height - 99, 200 * v.hp / v.maxHp, 8, '#e0ba62'); } if (noticeTime > 0) text(notice, width / 2, height - 250, 15, '#ffe4a3'); }
const visualCopy = document.createElement('canvas'); function drunkVisual() { if (S.drunk < 5) return; visualCopy.width = canvas.width; visualCopy.height = canvas.height; visualCopy.getContext('2d').drawImage(canvas, 0, 0); const k = S.drunk / 100; ctx.save(); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.translate(width / 2, height / 2); ctx.rotate(Math.sin(time * 1.8) * k * .025); ctx.scale(1.04, 1.04); ctx.drawImage(visualCopy, 0, 0, visualCopy.width, visualCopy.height, -width / 2, -height / 2, width, height); ctx.globalAlpha = .14 * k; ctx.drawImage(visualCopy, 0, 0, visualCopy.width, visualCopy.height, -width / 2 + Math.sin(time * 3) * 18 * k, -height / 2, width, height); ctx.restore(); }
const mapTypes = { hospital: ['✚', 'Hospital', '#e7a9a9'], bar: ['🍺', 'Bar', '#e4c56b'], shop: ['🔫', 'Armas', '#d3b1e2'], police: ['★', 'Quartel', '#82b5e4'], bank: ['$', 'Banco', '#e7c461'], supermarket: ['🛒', 'Supermercado', '#a7d5a0'], fatec: ['🎓', 'Fatec', '#9be0d2'], cemetery: ['✝', 'Cemitério', '#c7d0c6'], school: ['🏫', 'Escola', '#e2ceab'], parking: ['P', 'Estacionamento', '#a8c4d9'], park: ['♣', 'Parque', '#b6d694'], espetinhos: ['♨', 'Espetinhos', '#edb880'] };
function mapDraw() { rect(0, 0, width, height, '#0a1425f2'); const scale = Math.min((width - 100) / WORLD.w, (height - 180) / (WORLD.h - SEA_TOP)), mw = WORLD.w * scale, mh = (WORLD.h - SEA_TOP) * scale, ox = (width - mw) / 2, oy = 75, yy = y => oy + (y - SEA_TOP) * scale; text('MAPA · M / Esc: fechar', width / 2, 30, 24, '#f5e8c9'); rect(ox, oy, mw, mh, '#71846a'); rect(ox, oy, mw, (SHORE - SEA_TOP) * scale, '#3f839b'); oval(ox + ISLAND.x * scale, yy(ISLAND.y), ISLAND.rx * scale, ISLAND.ry * scale, '#dfcf9d'); oval(ox + ISLAND.x * scale, yy(ISLAND.y), ISLAND.rx * .8 * scale, ISLAND.ry * .7 * scale, '#527a45'); text('ILHA · FLORESTA', ox + ISLAND.x * scale, yy(ISLAND.y) - ISLAND.ry * scale - 12, 11, '#dcebbd'); for (const x of VX) rect(ox + x * scale, yy(HY[0]), 100 * scale, (HY.at(-1) + 100 - HY[0]) * scale, '#36434a'); for (const y of HY) rect(ox, yy(y), mw, 100 * scale, '#36434a'); for (const b of buildings) { const type = b === barBuilding ? 'bar' : b === shopBuilding ? 'shop' : b === station ? 'police' : b === bankBuilding ? 'bank' : b === marketBuilding ? 'supermarket' : b === cemetery ? 'cemetery' : b === parkingLot || b === marketParking ? 'parking' : b.type, d = mapTypes[type]; rect(ox + b.x * scale, yy(b.y), b.w * scale, b.h * scale, d ? d[2] + '99' : '#9aaab388'); if (d) { round(ox + (b.x + b.w / 2) * scale - 8, yy(b.y + b.h / 2) - 8, 16, 16, 4, '#172b3b'); text(d[0], ox + (b.x + b.w / 2) * scale, yy(b.y + b.h / 2), 12, d[2]); } } const p = S.venue ? venues[S.venue].building : inside ? FATEC : player, px = S.venue || inside ? p.x + p.w / 2 : player.x, py = S.venue || inside ? p.y + p.h / 2 : player.y; oval(ox + px * scale, yy(py), 5, 5, '#ffea7d'); text('VOCÊ', ox + px * scale, yy(py) - 14, 11, '#fff3b4'); let i = 0; for (const d of Object.values(mapTypes)) { text(d[0] + ' ' + d[1], (i % 3 + .5) * width / 3, height - 60 + Math.floor(i / 3) * 14, 10, d[2]); i++; } }
const oldDraw = draw; draw = function () { if (S.venue) venueDraw(); else oldDraw(); ctx.save(); ctx.translate(-camera.x, -camera.y); if (place() === 'world') islandForest(); for (const p of pools) if (p.scene === place() && visible(p.x, p.y)) oval(p.x, p.y, p.r, p.r * .4, '#8b343966'); for (const p of locals()) if (p.dead) corpse(p); if (place() === 'world') { for (const p of bodies) corpse(p); for (const car of policeCars) drawVehicle(car); } if (place() === 'fatec') pingDraw(); const extra = [...officers.filter(p => p.scene === place()), ...(place() === 'fatec' ? [quietBoy, ...indoorStudents, ...pingPlayers] : S.venue ? locals().filter(p => !p.police) : []), ...(place() === 'world' ? ejectedPeople : [])]; for (const p of extra) { if (p.dog) { drawAnimal(p); if (!p.dead) round(p.x - 7, p.y - 6, 13, 10, 3, '#253f51'); if (p.bark > 0) text('AU! ARMA!', p.x, p.y - 33, 11, '#f1cd73'); } else drawHuman(p); if (!p.dead && !p.inCar) { nametag(p); if (p.hostile && !p.dog) { ctx.save(); ctx.translate(p.x + 10, p.y - 18); ctx.rotate(p.aim || 0); icon(p.swat ? 'rifle' : p.special ? 'shotgun' : 'gun', 0, 0, .65); ctx.restore(); } } } if (place() === 'world') for (const b of flyingBikes) drawFlyingBike(b); for (const p of loot) if (p.scene === place()) { icon(p.id, p.x, p.y, .8); text(goods[p.id].name + ' · E', p.x, p.y - 36, 12, '#ffe6a1'); } for (const p of effects) if (p.scene === place()) oval(p.x, p.y - p.z, p.metal ? 3 : 2, p.metal ? 2 : 4, p.metal ? '#a4b4bd' : '#a23b42'); for (const b of bullets) if (b.scene === place()) { if (['grenade', 'smoke'].includes(b.kind)) icon(b.kind, b.x, b.y, .5); else line(b.x, b.y, b.x - b.vx * .012, b.y - b.vy * .012, b.kind === 'launcher' ? '#ff9d4b' : '#ffe4a3', b.kind === 'launcher' ? 5 : 2); } for (const c of clouds) if (c.scene === place()) { ctx.save(); ctx.globalAlpha = c.smoke ? Math.min(.7, c.ttl / 3) : c.ttl; oval(c.x, c.y, c.radius, c.radius * .7, c.smoke ? '#9da7aa' : '#f2a24b'); ctx.restore(); } for (const p of targets()) health(p); ctx.restore(); drunkVisual(); HUD(); if (place() === 'world' && onIsland(player.x, player.y)) locationText.textContent = 'Ilha · floresta'; if (mapOpen) mapDraw(); if (S.blackout > 0) { rect(0, 0, width, height, '#080a10f5'); text('Você desmaiou…', width / 2, height / 2, 26, '#d1bedc'); } if (S.dead) { rect(0, 0, width, height, '#09121de8'); text('GAME OVER', width / 2, height / 2 - 25, 42, '#ed7979'); text('R: reiniciar', width / 2, height / 2 + 25, 19); } }
const menu = document.createElement('div');
menu.className = 'game-ui game-menu';
menu.innerHTML = `
  <button id="map-button" class="game-button" type="button" aria-label="Abrir mapa">
    <span class="button-icon" aria-hidden="true">⌖</span><span>MAPA</span><kbd>M</kbd>
  </button>
  <button id="bag-button" class="game-button" type="button" aria-label="Abrir mochila">
    <span class="button-icon" aria-hidden="true">▣</span><span>MOCHILA</span><kbd>B</kbd>
  </button>
  <button id="sound-button" class="game-button" type="button" aria-label="Abrir áudio" aria-pressed="false">
    <span class="button-icon" aria-hidden="true">♫</span><span>SOM</span><kbd>N</kbd>
  </button>
  <div id="sound-submenu" class="sound-submenu" hidden>
    <button id="sound-mute-button" type="button" aria-pressed="false">SOM ATIVADO</button>
    <label class="sound-control" aria-label="Volume do jogo">
      <span>VOLUME</span>
      <input id="sound-volume" aria-label="Volume" type="range" min="0" max="100" value="45">
    </label>
  </div>`;
document.body.appendChild(menu);
const panel = document.createElement('div');
panel.className = 'game-ui';
panel.id = 'inventory-panel';
panel.innerHTML = `
  <strong id="inventory-title"></strong>
  <button id="close-panel" type="button">FECHAR</button>
  <div id="inventory-layout">
    <aside id="inventory-side-slots">
      <div id="armor-slots" aria-label="Armadura">
        <button class="armor-slot" type="button" data-armor-slot="helmet"
          aria-label="Slot de capacete">
          <span class="armor-slot-icon" aria-hidden="true">◉</span>
          <span>CAPACETE</span>
        </button>
        <button class="armor-slot" type="button" data-armor-slot="vest"
          aria-label="Slot de colete">
          <span class="armor-slot-icon" aria-hidden="true">⬡</span>
          <span>COLETE</span>
        </button>
      </div>
      <button id="beer-inventory-slot" type="button" hidden>
        <span class="armor-slot-icon" aria-hidden="true">♨</span>
        <span>CERVEJA ∞</span>
      </button>
    </aside>
    <div id="inventory-grid"></div>
  </div>
  <div id="inventory-detail"></div>
  <p id="inventory-help">Clique em um item e no slot correspondente para equipar. Arraste ou clique em dois espaços para reorganizar. Atalhos 1–5. R: recarregar. U: usar.</p>
  <button id="use-button" type="button">USAR / EQUIPAR</button>
  <button id="drop-button" type="button">SOLTAR</button>
  <p id="game-message"></p>`;
document.body.appendChild(panel);
function itemCanvas(id) { const c = document.createElement('canvas'); c.width = 70; c.height = 55; c.style.cssText = 'width:58px;height:46px;pointer-events:none'; const t = c.getContext('2d'); t.translate(35, 28); t.strokeStyle = '#c7d5df'; t.fillStyle = '#b7c8d3'; t.lineWidth = 3; if (id === 'apple') { t.fillStyle = '#d65c53'; t.beginPath(); t.arc(0, 2, 13, 0, Math.PI * 2); t.fill(); t.fillStyle = '#78a45d'; t.fillRect(0, -16, 4, 10); } else if (id === 'sandwich') { t.fillStyle = '#edd29c'; t.beginPath(); t.moveTo(-18, 14); t.lineTo(-13, -15); t.lineTo(18, 14); t.fill(); t.fillStyle = '#83a75a'; t.fillRect(-14, 7, 25, 3); } else if (id === 'water') { t.fillStyle = '#72accb'; t.fillRect(-9, -19, 18, 38); t.fillStyle = '#e3e8dc'; t.fillRect(-7, -23, 14, 5); } else if (id === 'knife') { t.fillRect(-3, -22, 6, 43); } else if (id === 'medkit') { t.fillStyle = '#edf2ee'; t.fillRect(-18, -14, 36, 28); t.fillStyle = '#cf5555'; t.fillRect(-3, -10, 6, 20); t.fillRect(-10, -3, 20, 6); } else if (id === 'beer') { t.fillStyle = '#c3943c'; t.fillRect(-10, -18, 20, 35); t.fillStyle = '#f1e4bd'; t.fillRect(-10, -18, 20, 5); } else if (id.startsWith('vest')) { t.fillStyle = '#607b89'; t.fillRect(-16, -18, 32, 36); t.strokeRect(-16, -18, 32, 36); } else if (id.startsWith('helmet')) { t.beginPath(); t.arc(0, -1, 18, Math.PI, 0); t.fill(); t.fillRect(-20, -2, 40, 8); } else if (goods[id].rounds) { t.fillStyle = '#61756b'; t.fillRect(-15, -20, 30, 40); t.fillStyle = '#d3b575'; for (let i = 0; i < 3; i++)t.fillRect(-10 + i * 8, -14, 5, 28); } else if (['grenade', 'smoke'].includes(id)) { t.beginPath(); t.ellipse(0, 3, 11, 16, 0, 0, Math.PI * 2); t.fill(); t.fillRect(-4, -20, 8, 10); } else if (id === 'baton') t.fillRect(-3, -22, 6, 44); else { const n = ['rifle', 'launcher', 'shotgun'].includes(id) ? 48 : 32; t.fillRect(-n / 2, -8, n, 10); t.fillRect(-10, 1, 8, 18); } return c; }
function openPanel(mode = 'bag') { if (S.dead || S.blackout > 0) return; mapOpen = false; panelMode = mode; swap = null; keys.clear(); S.holding = false; interactRequested = false; panel.style.display = 'block'; sound.play('reload'); refresh(); }
function closePanel() { panelMode = ''; panel.style.display = 'none'; swap = null; }
function toggleMap() { if (S.dead || S.blackout > 0) return; closePanel(); mapOpen = !mapOpen; keys.clear(); S.holding = false; interactRequested = false; sound.play('reload'); }
function drinkProfessorBeer() {
  if (!S.beerSlotUnlocked || S.dead || S.blackout > 0) return false;
  S.drunk = Math.min(100, S.drunk + 25);
  sound.play('eat');
  if (S.drunk >= 100) blackout();
  else tell('Cerveja do cartão do Professor Márcio · estoque infinito');
  return true;
}
function refresh() { const grid = document.getElementById('inventory-grid'), detail = document.getElementById('inventory-detail'), catalog = ['shop', 'food'].includes(panelMode), isBag = !catalog && panelMode !== 'clothes'; grid.innerHTML = ''; detail.innerHTML = ''; grid.style.display = isBag ? 'grid' : 'none'; document.getElementById('inventory-title').textContent = panelMode === 'clothes' ? 'Roupas e proteção' : catalog ? (panelMode === 'food' ? 'Supermercado' : 'Armas e munição') + ' · R$ ' + S.money : 'Mochila · 15 espaços'; document.getElementById('inventory-help').style.display = isBag ? 'block' : 'none'; document.getElementById('use-button').style.display = isBag ? 'inline-block' : 'none'; document.getElementById('drop-button').style.display = isBag ? 'inline-block' : 'none'; if (catalog) { for (const id of panelMode === 'food' ? ['apple', 'sandwich', 'water'] : ['gun', 'shotgun', 'rifle', 'launcher', 'pistolMag', 'rifleMag', 'shells', 'rocket', 'grenade', 'vest1', 'vest2', 'helmet1', 'helmet2', 'smoke']) { const row = document.createElement('div'); row.className = 'catalog-row'; row.appendChild(itemCanvas(id)); const label = document.createElement('span'); label.textContent = goods[id].name + ' · R$ ' + goods[id].price + (goods[id].heal ? ' · +' + goods[id].heal + ' vida' : ''); const btn = document.createElement('button'); btn.textContent = 'Comprar'; btn.onclick = () => buy(id); row.appendChild(label); row.appendChild(btn); detail.appendChild(row); } } else if (panelMode === 'clothes') { for (const slot of ['vest', 'helmet']) { const p = equipment[slot], label = document.createElement('p'); label.textContent = p ? goods[p.id].name + ' · ' + Math.ceil(p.durability) + '/' + goods[p.id].durability : slot === 'vest' ? 'Sem colete' : 'Sem capacete'; detail.appendChild(label); if (p) detail.appendChild(itemCanvas(p.id)); const btn = document.createElement('button'); btn.textContent = 'Guardar ' + (slot === 'vest' ? 'colete' : 'capacete'); btn.onclick = () => { const i = freeSlot(); if (equipment[slot] && i >= 0) { bag[i] = equipment[slot]; equipment[slot] = null; refresh(); } else tell('Libere espaço na mochila'); }; detail.appendChild(btn); } } else { for (let i = 0; i < 15; i++) { const btn = document.createElement('button'); btn.className = (i >= 10 ? 'quick ' : '') + (i === selected ? 'selected' : ''); btn.title = bag[i] ? goods[bag[i].id].name : 'Vazio'; btn.setAttribute('aria-label', btn.title); const num = document.createElement('span'); num.className = 'slot-number'; num.textContent = i >= 10 ? String(i - 9) : String(i + 1); btn.appendChild(num); if (bag[i]) { btn.appendChild(itemCanvas(bag[i].id)); const p = bag[i], count = document.createElement('span'); count.className = 'count'; count.textContent = p.ammo !== undefined ? p.ammo + '/' + goods[p.id].capacity : p.rounds !== undefined ? String(p.rounds) : p.durability !== undefined ? Math.ceil(p.durability) + '' : ''; btn.appendChild(count); } btn.draggable = !!bag[i]; btn.ondragstart = e => e.dataTransfer.setData('text/plain', String(i)); btn.ondragover = e => e.preventDefault(); btn.ondrop = e => { e.preventDefault(); const from = Number(e.dataTransfer.getData('text/plain')); if (Number.isInteger(from) && from >= 0 && from < 15) { [bag[from], bag[i]] = [bag[i], bag[from]]; selected = i; swap = null; refresh(); } }; btn.onclick = () => { if (swap !== null && swap !== i) { [bag[swap], bag[i]] = [bag[i], bag[swap]]; swap = null; } else swap = i; selected = i; if (i >= 10) S.slot = i; refresh(); }; grid.appendChild(btn); } const label = document.createElement('p'); label.textContent = bag[selected] ? goods[bag[selected].id].name + (bag[selected].vaultAccess ? ' · arma do banqueiro' : '') : 'Espaço vazio'; detail.appendChild(label); } }
document.getElementById('map-button').onclick = toggleMap;
document.getElementById('bag-button').onclick = () => openPanel();
const soundButton = document.getElementById('sound-button');
const soundSubmenu = document.getElementById('sound-submenu');
soundButton.setAttribute('aria-expanded', 'false');
soundButton.onclick = () => {
  soundSubmenu.hidden = !soundSubmenu.hidden;
  soundButton.setAttribute('aria-expanded', String(!soundSubmenu.hidden));
};
document.getElementById('sound-mute-button').onclick = () => sound.setMute();
document.getElementById('sound-volume').oninput = e => {
  sound.volume = Number(e.target.value) / 100;
  sound.unlock();
  sound.update(.01);
};
document.getElementById('close-panel').onclick = closePanel;
document.getElementById('drop-button').onclick = () => {
  discard(selected);
  swap = null;
};
document.getElementById('use-button').onclick = () => {
  if (!useItem(selected)) tell('Armas: selecione 1–5; R recarrega');
  swap = null;
  refresh();
};
window.addEventListener('keydown', e => {
  const k = e.key.toLowerCase();
  if (k === 'n' && !e.repeat) {
    sound.setMute();
    return;
  }
  if (S.dead) {
    keys.clear();
    interactRequested = false;
    e.preventDefault();
    if (k === 'r') location.reload();
    return;
  }
  if (S.blackout > 0) {
    keys.clear();
    interactRequested = false;
    return;
  }
  if (k === 'escape') {
    mapOpen = false;
    closePanel();
    soundSubmenu.hidden = true;
    soundButton.setAttribute('aria-expanded', 'false');
    keys.clear();
    interactRequested = false;
    return;
  }
  if (k === 'm' && !e.repeat) {
    toggleMap();
    e.preventDefault();
    return;
  }
  if ((k === 'b' || k === 'i') && !e.repeat) {
    if (panelMode === 'bag') closePanel();
    else openPanel('bag');
    e.preventDefault();
  }
  if (panelMode || mapOpen) {
    keys.clear();
    interactRequested = false;
    return;
  }
  if (k === '6' && !e.repeat && S.beerSlotUnlocked) {
    drinkProfessorBeer();
    e.preventDefault();
    return;
  }
  if (k === 'f' && !e.repeat) {
    if (S.vehicle) exitPlayerVehicle();
    else stealVehicle(nearVehicle());
    e.preventDefault();
  }
  if (k === 'c' && !e.repeat) toggleSiren();
  if (k === 'v' && !e.repeat && S.vehicle) sound.play('horn');
  if (k === 'g' && !e.repeat) robbery();
  if (k === 'r' && !e.repeat) {
    startReload();
    e.preventDefault();
  }
  if (/^[1-5]$/.test(k) && !e.repeat) {
    S.slot = 9 + Number(k);
    S.reload = 0;
    S.reloadItem = null;
  }
  if (k === 'o' && !e.repeat) discard();
  if (k === 'u' && !e.repeat) useItem(S.slot);
  if (k === 'h' && !e.repeat) {
    const i = bag[S.slot]?.id === 'medkit' ?
      S.slot : bag.findIndex(p => p?.id === 'medkit');
    if (i >= 0) useItem(i);
  }
  if ([' ', 'j'].includes(k)) {
    if (S.vehicle && k === ' ') {
      keys.add(' ');
      e.preventDefault();
    } else {
      S.holding = true;
      if (!e.repeat) attack();
      e.preventDefault();
    }
  }
  if (k === 'e' && !e.repeat && interact()) {
    interactRequested = false;
    e.preventDefault();
  }
});
window.addEventListener('keyup', e => {
  if ([' ', 'j'].includes(e.key.toLowerCase())) S.holding = false;
});
window.addEventListener('blur', () => {
  S.holding = false;
  if (sound.master && sound.ctx) {
    sound.master.gain.setTargetAtTime(0, sound.ctx.currentTime, .03);
  }
});
function buildHospital(b, i) { const key = 'hospital:' + i, w = 1000 + (i % 3) * 120, h = 800 + (i % 2) * 90, furniture = []; for (let j = 0; j < 3 + i % 4; j++)furniture.push({ x: 80 + (j % 3) * (w - 230) / 3, y: 290 + Math.floor(j / 3) * 150, w: 160 + (i % 2) * 20, h: 75, bed: true }); const v = { kind: 'hospital', name: 'Hospital ' + (i + 1), building: b, w, h, color: ['#dce6df', '#e3e4ee', '#e6dfd0', '#d3e4e8'][i % 4], furniture, npcs: [], exit: { x: w / 2, y: h - 65 } }; venues[key] = v; hospitals.push({ key, building: b, venue: v }); for (let k = 0; k < 3 + i; k++)drop('medkit', 80 + (k % 5) * (w - 160) / 5, h - 170 - Math.floor(k / 5) * 40, key); for (let k = 0; k < 2; k++)v.npcs.push({ ...appearance(), name: 'Médico', doctor: true, x: w / 2 - 80 + k * 160, y: 230, scene: key, step: 0, angle: rand(0, 6.28), stationary: false, turn: 2 }); for (let k = 0; k < furniture.length; k++) { const bed = furniture[k]; v.npcs.push({ ...appearance(), name: '', patient: true, lying: true, amputee: k % 3 === 1, x: bed.x + bed.w * .52, y: bed.y + bed.h / 2, scene: key, step: 0, stationary: true }); } }
function carveParking(building, name) { const original = building.w, lotW = Math.max(110, Math.floor(original * .44)); building.w = original - lotW - 12; const lot = { x: building.x + building.w + 12, y: building.y, w: lotW, h: building.h, type: 'park', solid: false, name, lot: true }; buildings.push(lot); return lot; }
function parkVehicles(lot, police = false) { for (let i = 0; i < 6; i++) { const kind = police ? (i < 2 ? 'car' : i < 4 ? 'bus' : 'motorcycle') : 'car', v = { kind, color: police ? '#253d54' : pick(shirts), policeVehicle: police, swat: police && i >= 2 && i < 4, parked: true, stopped: true, siren: false, speed: 95, step: 0, hp: kind === 'bus' ? 900 : kind === 'car' ? 500 : 230, maxHp: kind === 'bus' ? 900 : kind === 'car' ? 500 : 230, scene: 'world', occupants: [], x: lot.x + lot.w * (i % 2 ? .74 : .26), y: lot.y + 30 + (Math.floor(i / 2) + .5) * (lot.h - 40) / 3, angle: 0 }; (police ? policeCars : vehicles).push(v); } }
function initExpansion() {
  barBuilding = buildings.find(b => b.type === 'restaurant'); barBuilding.type = 'cafe'; shopBuilding = buildings.find(b => b.type === 'shop'); station = buildings.find(b => b.type === 'police'); bankBuilding = buildings.find(b => b.type === 'mall'); parkingLot = carveParking(station, 'Estacionamento policial'); const excluded = ['fatec', 'hospital', 'school', 'police', 'shop', 'restaurant', 'mall', 'park', 'espetinhos', 'cafe']; marketBuilding = buildings.find(b => b.solid && !excluded.includes(b.type) && b !== FATEC && b.w >= 260 && b.h >= 180); if (!marketBuilding) marketBuilding = buildings.find(b => b.type === 'shop' && b !== shopBuilding); marketParking = carveParking(marketBuilding, 'Estacionamento do supermercado'); marketBuilding.type = 'shop'; cemetery = buildings.filter(b => b.x > 5000 && b.y > 3000 && b !== bankBuilding && !b.lot).sort((a, b) => b.y - a.y)[0]; cemetery.solid = false; cemetery.type = 'park'; buildings.filter(b => b.type === 'hospital').forEach(buildHospital);
  venues.bar = { kind: 'bar', name: 'Bar da Cidade', building: barBuilding, w: 1000, h: 750, color: '#937758', furniture: [{ x: 150, y: 120, w: 700, h: 65 }, { x: 150, y: 310, w: 120, h: 70, table: true }, { x: 440, y: 310, w: 120, h: 70, table: true }, { x: 730, y: 310, w: 120, h: 70, table: true }, { x: 150, y: 490, w: 120, h: 70, table: true }, { x: 730, y: 490, w: 120, h: 70, table: true }], npcs: [], exit: { x: 500, y: 680 } }; venues.gunshop = { kind: 'gunshop', name: 'Loja de armas e munições', building: shopBuilding, w: 1000, h: 750, color: '#687782', furniture: [{ x: 340, y: 120, w: 320, h: 65 }, { x: 80, y: 360, w: 160, h: 140 }, { x: 760, y: 360, w: 160, h: 140 }], npcs: [], exit: { x: 500, y: 680 } }; venues.station = { kind: 'station', name: 'Quartel de Polícia', building: station, w: 1500, h: 1050, color: '#7a8889', furniture: [{ x: 180, y: 150, w: 280, h: 65 }, { x: 800, y: 440, w: 580, h: 18 }, { x: 800, y: 110, w: 18, h: 215 }, { x: 800, y: 650, w: 18, h: 170 }, { x: 80, y: 600, w: 500, h: 18 }], npcs: [], exit: { x: 750, y: 980 }, cameras: [{ x: 760, y: 80, enabled: true }] }; vaultDoor = { x: 490, y: 555, w: 120, h: 18, solid: true, wall: true }; venues.bank = { kind: 'bank', name: 'Banco Central', building: bankBuilding, w: 1100, h: 850, color: '#82918a', furniture: [{ x: 130, y: 180, w: 260, h: 60 }, { x: 710, y: 180, w: 260, h: 60 }, { x: 160, y: 330, w: 780, h: 15, wall: true }, { x: 160, y: 330, w: 15, h: 240, wall: true }, { x: 925, y: 330, w: 15, h: 240, wall: true }, { x: 160, y: 555, w: 330, h: 18, wall: true }, { x: 610, y: 555, w: 330, h: 18, wall: true }, vaultDoor], npcs: [], exit: { x: 550, y: 780 }, cameras: [{ x: 70, y: 90, enabled: true }, { x: 1000, y: 310, enabled: true }, { x: 540, y: 345, enabled: true }] }; venues.supermarket = { kind: 'supermarket', name: 'Supermercado', building: marketBuilding, w: 1000, h: 850, color: '#b9c9af', furniture: [], npcs: [], exit: { x: 500, y: 785 }, cameras: [{ x: 80, y: 100, enabled: true }] }; for (let r = 0; r < 2; r++)for (let c = 0; c < 3; c++)venues.supermarket.furniture.push({ x: 100 + c * 300, y: 300 + r * 220, w: 150, h: 170, shelf: true }); venues.supermarket.npcs.push({ ...appearance(), name: 'Caixa', x: 500, y: 110, scene: 'supermarket', stationary: true, step: 0 }); for (let i = 0; i < 5; i++)venues.supermarket.npcs.push({ ...appearance(), name: '', x: 300 + i * 85, y: 260, scene: 'supermarket', step: 0, turn: 2, angle: rand(0, 6.28) });
  banker = { ...appearance(), name: 'Banqueiro', x: 550, y: 275, scene: 'bank', stationary: true, step: 0, rich: true, shirt: '#263645', wallet: 350, hp: 100, maxHp: 100 }; bankGuard = { ...makeOfficer(), name: 'Guarda do banco', police: false, guard: true, x: 870, y: 280, scene: 'bank', stationary: true }; venues.bank.npcs.push(banker, bankGuard); for (let i = 0; i < 5; i++)venues.bank.npcs.push({ ...appearance(), name: '', x: 180 + i * 160, y: 650, scene: 'bank', stationary: false, step: 0, angle: rand(0, 6.28), turn: 2, rich: i % 2 === 0, shirt: i % 2 === 0 ? '#303c4a' : pick(shirts) }); for (let row = 0; row < 2; row++)for (let col = 0; col < 4; col++)drop('gold', 380 + col * 110, 420 + row * 100, 'bank'); drop('knife', 5440, 4740, 'world'); for (let i = 0; i < 10; i++)drop('coins', VX[i] + 135, HY[i % HY.length] + 140, 'world', { value: 20 }); let corner = { x: 2490, y: 1780 }; for (let y = 1800; y > 1400; y -= 20)if (!blockedInside(2490, y, 12)) { corner = { x: 2490, y }; break; } quietBoy = { name: 'Menino quieto', ...corner, skin: '#c7aa91', hair: '#1c1b20', shirt: '#15151c', stationary: true, step: 0, hp: 140, maxHp: 140, shotClock: .7, npcAmmo: 12, npcReserve: 36, npcReload: 0, scene: 'fatec', important: true }; venues.bar.npcs.push({ ...appearance(), name: 'Atendente', x: 500, y: 100, scene: 'bar', step: 0, stationary: true }); marcio = { ...appearance(), name: 'Professor Márcio', x: 790, y: 430, scene: 'bar', step: 0, stationary: true, seated: true, important: true, shirt: '#7e6455' }; venues.bar.npcs.push(marcio); for (const t of venues.bar.furniture.filter(t => t.table)) for (let j = 0; j < 2; j++)venues.bar.npcs.push({ ...appearance(), name: '', x: t.x + 30 + j * 65, y: t.y + t.h + 30, scene: 'bar', step: 0, stationary: true, seated: true }); const corridor = [{ x: 860, y: 610 }, { x: 1740, y: 610 }, { x: 1740, y: 1250 }, { x: 860, y: 1250 }]; for (let i = 0; i < 20; i++) { const p = { ...appearance(), name: '', scene: 'fatec', stationary: false, walking: true, step: 0, speed: 50 }; setCircuit(p, i % 2 ? corridor : [{ x: 860, y: 110 }, { x: 860, y: 1740 }, { x: 1740, y: 1740 }, { x: 1740, y: 110 }]); indoorStudents.push(p); } const patio = rooms.find(r => r.type === 'patio'); pingTable = { x: patio.x + patio.w / 2 - 80, y: patio.y + patio.h / 2 - 40, w: 160, h: 80 }; furniture.push({ type: 'pingtable', ...pingTable, solid: true }); for (let i = 0; i < 2; i++)pingPlayers.push({ ...appearance(), name: '', x: pingTable.x + (i ? pingTable.w + 25 : -25), y: pingTable.y + 50, scene: 'fatec', ping: true, phase: i * Math.PI, stationary: true, step: 0 }); for (let row = 0; row < HY.length - 1; row++)for (let col = 0; col < VX.length; col++)crosswalks.push({ x: VX[col] + 50, y: HY[row] + 250, axis: 'v' }); for (let row = 0; row < HY.length; row++)for (let col = 0; col < VX.length - 1; col++)crosswalks.push({ x: VX[col] + 270, y: HY[row] + 50, axis: 'h' }); for (let i = 0; i < people.length; i++) { const p = people[i]; p.scene = 'world'; p.rich = i % 7 === 0; if (p.rich) p.shirt = pick(['#26313e', '#44434a', '#263c43']); wallet(p); if (i < 24) { const c = crosswalks[(i * 7) % crosswalks.length]; setCircuit(p, c.axis === 'v' ? [{ x: c.x - 77, y: c.y }, { x: c.x - 35, y: c.y }, { x: c.x + 35, y: c.y }, { x: c.x + 77, y: c.y }, { x: c.x + 35, y: c.y }, { x: c.x - 35, y: c.y }] : [{ x: c.x, y: c.y - 77 }, { x: c.x, y: c.y - 35 }, { x: c.x, y: c.y + 35 }, { x: c.x, y: c.y + 77 }, { x: c.x, y: c.y + 35 }, { x: c.x, y: c.y - 35 }]); } else if (road(p.x, p.y)) Object.assign(p, safePoint(p.x, p.y)); } for (const a of animals) { a.scene = 'world'; if (road(a.x, a.y)) Object.assign(a, safePoint(a.x, a.y)); } for (const p of [felipe, zannetu, evangelista, joao, wagner, nicolas, tia, linux, jean, psicologa]) { p.important = true; p.trafficImmune = true; }
  for (let i = 0; i < 12; i++) { const v = { kind: 'motorcycle', color: pick(shirts), speed: 120, step: 0, scene: 'world', skin: pick(skins) }; const c = i % (VX.length - 1), r = i % (HY.length - 1); setCircuit(v, rectangleRoute(VX[c] + 35, HY[r] + 35, VX[c + 1] + 65, HY[r + 1] + 65)); vehicles.push(v); } for (let i = 0; i < 10; i++) { const v = { kind: 'boat', color: pick(['#9e7452', '#5d8f9e', '#a97c74']), speed: 60, step: 0, scene: 'world' }; setCircuit(v, rectangleRoute(150 + (i % 5) * 1000, -1400 + (i % 2) * 150, 800 + (i % 5) * 1000, BOAT_LANE - 20)); vehicles.push(v); } for (const v of vehicles) { v.scene = 'world'; v.occupants = []; vital(v); if (v.kind === 'bike') continue; for (let i = 0; i < (v.kind === 'bus' ? 6 : v.kind === 'motorcycle' ? 1 : 2); i++)v.occupants.push({ ...appearance(), name: '', x: v.x, y: v.y, hp: 100, maxHp: 100, car: v, inCar: true, scene: 'world' }); } for (let i = 0; i < beachPeople.length; i++) { const p = beachPeople[i]; p.scene = 'world'; p.canSwim = i % 3 === 0; if (p.canSwim) { p.x = 150 + (i * 173) % 5200; p.y = -120 + (i % 5) * 70; p.swimming = p.y < SHORE; } }
  for (let i = 0; i < 14; i++) { const c = makeOfficer(i % 5 === 0), col = i % (VX.length - 1), row = i % (HY.length - 1); setCircuit(c, rectangleRoute(VX[col] + 120, HY[row] + 120, VX[col + 1] - 20, HY[row + 1] - 20)); officers.push(c); } for (let i = 0; i < 4; i++) { const car = { kind: 'car', color: '#284e74', speed: 95, step: 0, hp: 500, maxHp: 500, occupants: [], scene: 'world', policeVehicle: true, siren: false }; setCircuit(car, rectangleRoute(VX[i * 2] + 27, HY[i] + 27, VX[i * 2 + 1] + 73, HY[i + 1] + 73)); policeCars.push(car); for (const c of officers.slice(i * 2, i * 2 + 2)) { c.car = car; c.inCar = true; c.x = car.x; c.y = car.y; car.occupants.push(c); } } for (let i = 0; i < 8; i++) { const c = makeOfficer(i >= 4); setCircuit(c, rectangleRoute(station.x - 35, station.y - 35, station.x + station.w + 35, station.y + station.h + 45)); officers.push(c); } for (let i = 0; i < 12; i++) { const c = makeOfficer(i >= 4 && i < 8, i >= 8); c.scene = 'station'; const x = i >= 8 ? 900 + (i % 4) * 110 : 130 + (i % 4) * 140, y = i >= 8 ? 230 : 260 + Math.floor(i / 4) * 170; setCircuit(c, rectangleRoute(x, y, x + 70, y + 70)); officers.push(c); } for (let i = 0; i < 7; i++) { const owner = i < 4 ? officers[8 + i] : officers.find(c => c.scene === 'station' && !c.swat), dog = { name: 'Cão policial', dog: true, police: true, trafficImmune: true, kind: 'dog', color: '#96734f', speed: 60, hp: 100, maxHp: 100, scene: owner.scene, step: 0, angle: 0, shotClock: 1, owner, x: owner.x + 35, y: owner.y + 35 }; officers.push(dog); } for (let i = 0; i < 2; i++) { const car = { kind: 'boat', color: '#447fa2', marine: true, policeVehicle: true, siren: false, speed: 100, step: 0, hp: 650, maxHp: 650, scene: 'world', occupants: [] }; setCircuit(car, rectangleRoute(250 + i * 2800, -1400, 2300 + i * 2800, BOAT_LANE - 25)); policeCars.push(car); for (let j = 0; j < 2; j++) { const c = makeOfficer(); Object.assign(c, { name: 'Polícia marítima', marine: true, inCar: true, car, driver: j === 0, x: car.x, y: car.y }); car.occupants.push(c); officers.push(c); } }
  parkVehicles(parkingLot, true); parkVehicles(marketParking, false); for (let i = 0; i < 105; i++) { const a = i * 2.399963, r = Math.sqrt((i + .5) / 105); islandTrees.push({ x: ISLAND.x + Math.cos(a) * r * (ISLAND.rx - 180), y: ISLAND.y + Math.sin(a) * r * (ISLAND.ry - 140) }); } islandTrees.sort((a, b) => a.y - b.y); for (const [id, x, y] of [['gun', 920, 710], ['rifle', 1090, 710], ['shotgun', 1240, 710], ['vest1', 900, 760], ['helmet1', 1200, 760], ['pistolMag', 850, 800], ['rifleMag', 1000, 800], ['shells', 1150, 800]]) drop(id, x, y, 'station'); refresh();
}

/* ================= INICIALIZAÇÃO ================= */

createCity();
createInterior();
createPeople();
createIndoorCharacters();
createTia();
createTraffic();
createAnimals();
initExpansion();

const collectionItems = [
  { id: 'computer', name: 'Computador do Evangelista' },
  { id: 'marcioCard', name: 'Cartão do Professor Márcio' }
];
const usbMissionItems = [
  { id: 'pyUsb', name: 'Pendrive Python' },
  { id: 'mysqlUsb', name: 'Pendrive MySQL' },
  { id: 'linuxUsb', name: 'Pendrive Linux' },
  { id: 'magnetUsb', name: 'Pendrive Magnetismo Emocional' },
  { id: 'speedUsb', name: 'Pendrive Velocidade.bat' },
  { id: 'noBreakUsb', name: 'Pendrive Sem Intervalo' }
];
const missionItems = [...collectionItems, ...usbMissionItems];
const missionItemIds = new Set(missionItems.map(item => item.id));
const collectedMissionItems = new Set();
const activatedMissionPowers = new Set();
let missionRewardClaimed = false;
let missionPenguin = null;
let dildoCharged = true;
let missionTab = 'collection';

Object.assign(goods, Object.fromEntries(
  missionItems.map(item => [item.id, { name: item.name }])
), {
  dildo: { name: 'Dildo rosa', damage: 35, range: 75 },
  apple: { ...goods.apple, food: 18 },
  sandwich: { ...goods.sandwich, food: 35 },
  water: { ...goods.water, food: 6 }
});
Object.assign(S, { clock: 8 * 60, day: 1, hunger: 100 });
player.hp = player.maxHp = 300;

const collectionPanel = document.createElement('section');
collectionPanel.id = 'collection-panel';
collectionPanel.className = 'game-ui mission-panel';
collectionPanel.innerHTML = `
  <button id="close-collection" type="button">FECHAR</button>
  <strong>MISSÕES</strong>
  <nav class="mission-tabs" aria-label="Categorias de missão">
    <button id="collection-tab" type="button">COLEÇÃO</button>
    <button id="usb-mission-tab" type="button">PENDRIVES</button>
  </nav>
  <h2 id="mission-title" class="mission-title"></h2>
  <p class="mission-description">Encontre os itens especiais espalhados pela cidade e pela Fatec.</p>
  <p id="collection-progress"></p>
  <div id="collection-list"></div>
  <div id="collection-powers"></div>
  <p id="collection-reward"></p>
`;
document.body.appendChild(collectionPanel);

const collectionButton = document.createElement('button');
collectionButton.id = 'missions-button';
collectionButton.className = 'game-button';
collectionButton.type = 'button';
collectionButton.setAttribute('aria-label', 'Abrir missões');
collectionButton.innerHTML = '<span class="button-icon" aria-hidden="true">◆</span><span>MISSÕES</span><kbd>K</kbd>';
collectionButton.onclick = openMissionPanel;
menu.insertBefore(collectionButton, document.getElementById('sound-button'));

function renderMissionCollection() {
  const isCollection = missionTab === 'collection';
  const missionList = isCollection ? collectionItems : usbMissionItems;
  const count = missionList.filter(item =>
    collectedMissionItems.has(item.id)
  ).length;
  document.getElementById('mission-title').textContent =
    isCollection ? 'Coleção de Itens' : 'Pendrives do Campus';
  document.querySelector('.mission-description').textContent =
    isCollection ?
      'Encontre itens especiais e desbloqueie recompensas permanentes.' :
      collectedMissionItems.has('computer') ?
        'Recupere os pendrives e ative seus efeitos especiais.' :
        'Encontre o computador do Evangelista para ativar os pendrives.';
  document.getElementById('collection-tab').classList.toggle(
    'active', isCollection
  );
  document.getElementById('usb-mission-tab').classList.toggle(
    'active', !isCollection
  );
  document.getElementById('collection-progress').textContent =
    `PROGRESSO · ${count}/${missionList.length}`;
  const list = document.getElementById('collection-list');
  const powers = document.getElementById('collection-powers');
  list.replaceChildren();
  powers.replaceChildren();
  for (const item of missionList) {
    const found = collectedMissionItems.has(item.id);
    const row = document.createElement('div');
    const active = activatedMissionPowers.has(item.id);
    row.className = `collection-entry${active ? ' complete' : ''}`;
    const name = document.createElement('span');
    name.textContent = item.name;
    const status = document.createElement('span');
    status.textContent = active ? 'FUNCIONANDO' :
      item.id === 'computer' && found ? 'OBTIDO' :
        item.id === 'marcioCard' && found ? 'SLOT DESBLOQUEADO' :
          found && !collectedMissionItems.has('computer') &&
              usbMissionItems.includes(item) ?
            'AGUARDANDO COMPUTADOR' : found ? 'OBTIDO' : 'PENDENTE';
    row.append(name, status);
    list.appendChild(row);
  }
  if (!isCollection && activatedMissionPowers.has('pyUsb')) {
    const summon = document.createElement('button');
    summon.textContent = S.snakeCooldown > 0 ?
      `Cobras · ${S.snakeCooldown.toFixed(0)} s` : 'Invocar cobras · P';
    summon.disabled = S.snakeCooldown > 0;
    summon.onclick = summonMissionSnakes;
    powers.appendChild(summon);
  }
  document.getElementById('collection-reward').textContent =
    isCollection ?
      (collectedMissionItems.has('marcioCard') ?
        'CARTÃO DO MÁRCIO · CERVEJA INFINITA DESBLOQUEADA' :
        'RECOMPENSA · CARTÃO DO PROFESSOR MÁRCIO') :
      missionRewardClaimed ?
        'MISSÃO CONCLUÍDA · RECOMPENSA RECEBIDA: R$ 500' :
        'RECOMPENSA DA MISSÃO · R$ 500';
}

function openMissionPanel() {
  if (S.dead || S.blackout > 0) return;
  mapOpen = false;
  panelMode = 'collection';
  missionTab = 'collection';
  panel.style.display = 'none';
  collectionPanel.style.display = 'block';
  keys.clear();
  S.holding = false;
  interactRequested = false;
  renderMissionCollection();
  sound.play('reload');
}

function closeMissionPanel() {
  collectionPanel.style.display = 'none';
  if (panelMode === 'collection') panelMode = '';
}

const closeInventoryPanel = closePanel;
closePanel = function () {
  closeMissionPanel();
  closeInventoryPanel();
};

const openInventoryPanel = openPanel;
openPanel = function (mode = 'bag') {
  closeMissionPanel();
  openInventoryPanel(mode);
};

document.getElementById('close-collection').onclick = closeMissionPanel;
document.getElementById('collection-tab').onclick = () => {
  missionTab = 'collection';
  renderMissionCollection();
};
document.getElementById('usb-mission-tab').onclick = () => {
  missionTab = 'usb';
  renderMissionCollection();
};
window.addEventListener('keydown', event => {
  if (event.key.toLowerCase() !== 'k' || event.repeat) return;
  if (collectionPanel.style.display === 'block') closeMissionPanel();
  else openMissionPanel();
  event.preventDefault();
});

const missionDropSources = [
  { character: evangelista, id: 'computer', scene: 'world' },
  { character: marcio, id: 'marcioCard', scene: 'bar' },
  { character: joao, id: 'pyUsb', scene: 'world' },
  { character: wagner, id: 'mysqlUsb', scene: 'world' },
  { character: zannetu, id: 'linuxUsb', scene: 'world' },
  { character: psicologa, id: 'magnetUsb', scene: 'fatec' },
  { character: nicolas, id: 'speedUsb', scene: 'world' },
  { character: jean, id: 'noBreakUsb', scene: 'fatec' }
];
missionDropSources.push(
  { character: felipe, id: 'dildo', scene: 'world' }
);
const originalDie = die;
die = function (character, ...args) {
  const wasAlive = !character.dead;
  const result = originalDie(character, ...args);
  const source = wasAlive &&
    missionDropSources.find(entry => entry.character === character);
  if (source && !collectedMissionItems.has(source.id) &&
      !loot.some(drop => drop.id === source.id)) {
    drop(source.id, character.x + 25, character.y,
      character.scene || source.scene);
  }
  return result;
};

const originalCollect = collect;
collect = function () {
  const found = nearestLoot();
  if (!found || !missionItemIds.has(found.id)) return originalCollect();
  loot.splice(loot.indexOf(found), 1);
  collectedMissionItems.add(found.id);
  sound.play('pickup');
  if (found.id === 'computer') {
    tell('Computador obtido: missão da Fatec ativada.');
    for (const item of usbMissionItems) activateMissionPower(item.id);
  } else if (found.id === 'marcioCard') {
    S.beerSlotUnlocked = true;
    refresh();
    tell('Cartão do Professor Márcio obtido: cerveja infinita desbloqueada.');
  } else {
    activateMissionPower(found.id);
  }
  if (usbMissionItems.every(item => collectedMissionItems.has(item.id)) &&
      collectedMissionItems.has('computer') &&
      !missionRewardClaimed) {
    missionRewardClaimed = true;
    S.money += 500;
    sound.play('coin');
    tell('Missão concluída! Você recebeu R$ 500.');
  } else {
    tell(`${goods[found.id].name} adicionado à missão.`);
  }
  if (collectionPanel.style.display === 'block') renderMissionCollection();
  return true;
};

function activateMissionPower(id) {
  if (!collectedMissionItems.has('computer') ||
      !collectedMissionItems.has(id) ||
      activatedMissionPowers.has(id) || id === 'computer') return;
  activatedMissionPowers.add(id);
  if (id === 'magnetUsb') {
    player.maxHp += 50;
    player.hp = Math.min(player.maxHp, player.hp + 50);
  } else if (id === 'speedUsb') {
    player.speed += 60;
  } else if (id === 'noBreakUsb') {
    tell('Poder ativo: a fome diminui mais devagar.');
  } else if (id === 'mysqlUsb') {
    while (bag.length < 20) bag.push(null);
    tell('Poder ativo: mochila expandida para 20 espaços.');
    refresh();
  } else if (id === 'linuxUsb' && !missionPenguin) {
    missionPenguin = {
      ...linux, name: 'Pinguim protetor', kind: 'penguin',
      petPenguin: true, scene: 'world', x: player.x + 40,
      y: player.y, hp: 200, maxHp: 200, step: 0,
      petAttackCooldown: 0, dead: false
    };
    ejectedPeople.push(missionPenguin);
    tell('Poder ativo: o pinguim agora protege você.');
  } else if (id === 'pyUsb') {
    tell('Poder ativo: pressione P para invocar cobras.');
  }
  sound.play('pickup');
}

function summonMissionSnakes() {
  if (!activatedMissionPowers.has('pyUsb') || S.dead || S.blackout > 0) return;
  if (S.vehicle || player.swimming || place() !== 'world' ||
      panelMode || mapOpen) {
    tell('As cobras só podem ser invocadas a pé no mundo aberto.');
    return;
  }
  if (S.snakeCooldown > 0) {
    tell(`Cobras em recarga · ${Math.ceil(S.snakeCooldown)} s`);
    return;
  }
  for (let i = 0; i < 3; i++) {
    const angle = player.facing === 'left' ? Math.PI :
      player.facing === 'up' ? -Math.PI / 2 :
        player.facing === 'down' ? Math.PI / 2 : 0;
    const snake = {
      x: clamp(player.x - Math.cos(angle) * 34 + rand(-14, 14),
        20, WORLD.w - 20),
      y: clamp(player.y - Math.sin(angle) * 34 + rand(-14, 14),
        SEA_TOP + 20, WORLD.h - 20),
      zone: { x: 0, y: SEA_TOP, w: WORLD.w, h: WORLD.h - SEA_TOP },
      kind: 'snake', angle: rand(0, Math.PI * 2), speed: 115,
      turn: 1, step: rand(0, 6), color: pick([
        '#4d713c', '#87753f', '#5c8962'
      ]),
      length: rand(32, 44), phase: rand(0, 6), scene: 'world',
      owner: player, summoned: true, lifetime: 18,
      petAttackCooldown: rand(0, .35), hp: 60, maxHp: 60, dead: false
    };
    animals.push(snake);
    summonedSnakes.add(snake);
  }
  S.snakeCooldown = 24;
  sound.play('bark');
  tell('Três cobras invocadas · recarga: 24 s');
  if (collectionPanel.style.display === 'block') renderMissionCollection();
}

const summonedSnakes = new Set();
const originalUpdateAnimals = updateAnimals;
updateAnimals = function (dt) {
  originalUpdateAnimals(dt);
  for (const snake of summonedSnakes) {
    snake.lifetime -= dt;
    if (snake.dead || snake.lifetime <= 0) {
      const index = animals.indexOf(snake);
      if (index >= 0) animals.splice(index, 1);
      summonedSnakes.delete(snake);
      continue;
    }

    const target = officers.filter(person =>
      person.hostile && !person.dead && !person.inCar &&
      person.scene === 'world' &&
      distance(person, snake) < 230
    ).sort((a, b) => distance(a, snake) - distance(b, snake))[0];
    const destination = target || player;
    const dx = destination.x - snake.x, dy = destination.y - snake.y;
    const separation = Math.hypot(dx, dy) || 1;
    const attackRange = target ? 26 : 55;
    if (separation > attackRange) {
      const step = Math.min(separation - attackRange, snake.speed * dt);
      const nx = snake.x + dx / separation * step;
      const ny = snake.y + dy / separation * step;
      if (!blockedOutside(nx, snake.y, 8)) snake.x = nx;
      if (!blockedOutside(snake.x, ny, 8)) snake.y = ny;
      snake.angle = Math.atan2(dy, dx);
      snake.step += dt * 12;
    } else if (target) {
      snake.petAttackCooldown -= dt;
      if (snake.petAttackCooldown <= 0) {
        hurt(target, 18, snake);
        snake.petAttackCooldown = .9;
      }
    }
  }
};
const originalDrawAnimalWithMissionSnakes = drawAnimal;
drawAnimal = function (animal) {
  if (!animal.summoned) return originalDrawAnimalWithMissionSnakes(animal);
  drawSnake(animal);
};

freeSlot = function () {
  for (let i = 10; i < bag.length; i++) {
    if (!bag[i]) return i;
  }
  return bag.indexOf(null);
};

const originalRefresh = refresh;
function renderArmorSlots() {
  for (const slot of ['helmet', 'vest']) {
    const button = document.querySelector(`[data-armor-slot="${slot}"]`);
    const equipped = equipment[slot];
    button.replaceChildren();
    const icon = document.createElement('span');
    icon.className = 'armor-slot-icon';
    const name = document.createElement('span');
    if (equipped) {
      icon.appendChild(itemCanvas(equipped.id));
      name.textContent =
        `${goods[equipped.id].name} · ${Math.ceil(equipped.durability)}`;
      button.classList.add('equipped');
    } else {
      icon.textContent = slot === 'helmet' ? '◉' : '⬡';
      name.textContent = slot === 'helmet' ? 'CAPACETE' : 'COLETE';
      button.classList.remove('equipped');
    }
    button.append(icon, name);
  }
}

for (const slot of ['helmet', 'vest']) {
  document.querySelector(`[data-armor-slot="${slot}"]`).onclick = () => {
    const selectedItem = bag[selected];
    if (selectedItem && goods[selectedItem.id]?.slot === slot) {
      const previous = equipment[slot];
      equipment[slot] = selectedItem;
      equipment[slot].durability ??= goods[selectedItem.id].durability;
      bag[selected] = previous;
      sound.play('reload');
    } else if (selectedItem) {
      tell(`Esse item não é um ${slot === 'helmet' ? 'capacete' : 'colete'}.`);
      return;
    } else if (equipment[slot]) {
      const destination = freeSlot();
      if (destination < 0) {
        tell('Libere espaço na mochila');
        return;
      }
      bag[destination] = equipment[slot];
      equipment[slot] = null;
      sound.play('reload');
    } else {
      tell(`Selecione um item de ${slot === 'helmet' ? 'capacete' : 'colete'}.`);
      return;
    }
    refresh();
  };
}
document.getElementById('beer-inventory-slot').onclick = drinkProfessorBeer;

refresh = function () {
  originalRefresh();
  const isBag = panelMode === 'bag';
  const armorPanel = document.getElementById('armor-slots');
  armorPanel.hidden = !isBag;
  document.getElementById('beer-inventory-slot').hidden =
    !isBag || !S.beerSlotUnlocked;
  renderArmorSlots();
  if (!isBag || bag.length <= 15) return;
  const grid = document.getElementById('inventory-grid');
  document.getElementById('inventory-title').textContent =
    `Mochila · ${bag.length} espaços`;
  for (let i = 15; i < bag.length; i++) {
    const button = document.createElement('button');
    button.className = i === selected ? 'selected' : '';
    button.title = bag[i] ? goods[bag[i].id].name : 'Vazio';
    button.setAttribute('aria-label', button.title);
    const number = document.createElement('span');
    number.className = 'slot-number';
    number.textContent = String(i + 1);
    button.appendChild(number);
    if (bag[i]) {
      button.appendChild(itemCanvas(bag[i].id));
      const count = document.createElement('span');
      count.className = 'count';
      count.textContent = bag[i].ammo !== undefined ?
        `${bag[i].ammo}/${goods[bag[i].id].capacity}` :
        bag[i].rounds !== undefined ? String(bag[i].rounds) :
          bag[i].durability !== undefined ?
            String(Math.ceil(bag[i].durability)) : '';
      button.appendChild(count);
    }
    button.draggable = !!bag[i];
    button.ondragstart = event =>
      event.dataTransfer.setData('text/plain', String(i));
    button.ondragover = event => event.preventDefault();
    button.ondrop = event => {
      event.preventDefault();
      const from = Number(event.dataTransfer.getData('text/plain'));
      if (Number.isInteger(from) && from >= 0 && from < bag.length) {
        [bag[from], bag[i]] = [bag[i], bag[from]];
        selected = i;
        swap = null;
        refresh();
      }
    };

    button.onclick = () => {
      if (swap !== null && swap !== i) {
        [bag[swap], bag[i]] = [bag[i], bag[swap]];
        swap = null;
      } else {
        swap = i;
      }
      selected = i;
      refresh();
    };

    grid.appendChild(button);
  }
  for (let i = 0; i < 15; i++) {
    const button = grid.children[i];
    button.ondrop = event => {
      event.preventDefault();
      const from = Number(event.dataTransfer.getData('text/plain'));
      if (Number.isInteger(from) && from >= 0 && from < bag.length) {
        [bag[from], bag[i]] = [bag[i], bag[from]];
        selected = i;
        swap = null;
        refresh();
      }
    };
  }
  if (bag[selected]) {
    const detail = document.getElementById('inventory-detail');
    const label = detail.querySelector('p');
    if (label) {
      label.textContent = goods[bag[selected].id].name;
    }
  }
};

canvas.addEventListener('pointerdown', event => {
  if (!S.beerSlotUnlocked || S.dead || S.blackout > 0 ||
      panelMode || mapOpen || event.button !== 0) return;
  const bounds = canvas.getBoundingClientRect();
  const slotSize = 44, gap = 6;
  const slotsWidth = slotSize * 5 + gap * 4;
  const slotsX = Math.max(8, width - slotsWidth - 14);
  const slotsY = height - 59;
  const beerSlotX = slotsX - slotSize - gap;
  const x = event.clientX - bounds.left;
  const y = event.clientY - bounds.top;
  if (beerSlotX >= 4 && x >= beerSlotX && x <= beerSlotX + slotSize &&
      y >= slotsY && y <= slotsY + slotSize) {
    drinkProfessorBeer();
    event.preventDefault();
  }
});

const originalUseItem = useItem;
useItem = function (index) {
  const entry = bag[index];
  if (entry?.id === 'dildo') return false;
  const food = goods[entry?.id];
  if (entry?.id === 'medkit') {
    if (S.dead || S.blackout > 0) return false;
    if (player.hp >= player.maxHp) {
      tell('Vida já está cheia.');
      return false;
    }
    player.hp = Math.min(player.maxHp, player.hp + 45);
    bag[index] = null;
    sound.play('eat');
    refresh();
    return true;
  }
  if (entry && food?.food) {
    if (player.hp >= player.maxHp && S.hunger >= 100) {
      tell('Vida e fome já estão completas.');
      return false;
    }
    player.hp = Math.min(player.maxHp, player.hp + (food.heal || 0));
    S.hunger = Math.min(100, S.hunger + food.food);
    bag[index] = null;
    sound.play('eat');
    refresh();
    return true;
  }
  return originalUseItem(index);
};

hospitalHeal = function () {
  if (player.hp >= player.maxHp) {
    tell('Vida já está cheia');
    return;
  }
  if (S.money < 25) {
    tell('Tratamento: R$ 25');
    return;
  }
  S.money -= 25;
  player.hp = player.maxHp;
  sound.play('buy');
  tell('Vida restaurada');
};

const originalAttack = attack;
attack = function () {
  if (held() !== 'dildo') return originalAttack();
  if (S.dead || S.vehicle || player.swimming ||
      S.blackout > 0 || S.cool > 0 || S.reload > 0) return;
  S.cool = .5;
  S.attack = .3;
  S.hand = S.next;
  S.next *= -1;
  const direction = facing();
  const target = targets().filter(p => !p.dead && !p.inCar &&
    p !== missionPenguin &&
    distance(p, player) < goods.dildo.range &&
    (p.x - player.x) * Math.cos(direction) +
    (p.y - player.y) * Math.sin(direction) > -10)
    .sort((a, b) => distance(a, player) - distance(b, player))[0];
  if (target) {
    vital(target);
    if (dildoCharged) {
      target.hp = Math.max(1, target.hp / 2);
      dildoCharged = false;
      tell('Golpe especial: metade da vida do alvo!');
    } else {
      hurt(target, goods.dildo.damage);
    }
    crime('assault', target);
  }
  sound.play('punch');
};

const originalUpdateWithMissions = update;
update = function (dt) {
  const running = !S.dead && !S.blackout && !panelMode && !mapOpen;
  S.snakeCooldown = Math.max(0, S.snakeCooldown - dt);
  if (running) {
    S.clock += dt * 4;
    if (S.clock >= 24 * 60) {
      S.clock -= 24 * 60;
      S.day++;
    }
    const hungerDrain = dt * .04 *
      (activatedMissionPowers.has('noBreakUsb') ? .5 : 1);
    S.hunger = Math.max(0, S.hunger - hungerDrain);
  }
  originalUpdateWithMissions(dt);
  if (collectionPanel.style.display === 'block' &&
      activatedMissionPowers.has('pyUsb')) {
    const summonButton = document.querySelector('#collection-powers button');
    if (summonButton) {
      summonButton.textContent = S.snakeCooldown > 0 ?
        `Cobras · ${Math.ceil(S.snakeCooldown)} s` :
        'Invocar cobras · P';
      summonButton.disabled = S.snakeCooldown > 0;
    }
  }
  if (running && missionPenguin && !missionPenguin.dead &&
      missionPenguin.scene === place()) {
    const target = officers.find(person =>
      person.hostile && !person.dead && !person.inCar &&
      person.scene === place() &&
      distance(person, missionPenguin) < 200
    );
    if (target) {
      const angle = Math.atan2(
        target.y - missionPenguin.y,
        target.x - missionPenguin.x
      );
      const nx = missionPenguin.x + Math.cos(angle) * 140 * dt;
      const ny = missionPenguin.y + Math.sin(angle) * 140 * dt;
      if (!blocked(nx, ny, 10, place())) {
        missionPenguin.x = nx;
        missionPenguin.y = ny;
        missionPenguin.step += dt * 10;
      }
      missionPenguin.petAttackCooldown -= dt;
      if (distance(missionPenguin, target) < 30 &&
          missionPenguin.petAttackCooldown <= 0) {
        hurt(target, 12, missionPenguin);
        missionPenguin.petAttackCooldown = 1;
      }
    } else {
      const distanceToPlayer = distance(missionPenguin, player);
      if (distanceToPlayer > 55) {
        const angle = Math.atan2(
          player.y - missionPenguin.y, player.x - missionPenguin.x
        );
        const nx = missionPenguin.x + Math.cos(angle) * 120 * dt;
        const ny = missionPenguin.y + Math.sin(angle) * 120 * dt;
        if (!blocked(nx, ny, 10, place())) {
          missionPenguin.x = nx;
          missionPenguin.y = ny;
          missionPenguin.step += dt * 8;
        }
      }
    }
  }
};

function nightOpacity() {
  const hour = S.clock / 60;
  if (hour >= 7 && hour < 17.5) return 0;
  if (hour >= 17.5 && hour < 19) return (hour - 17.5) / 1.5 * .67;
  if (hour >= 5.5 && hour < 7) return (7 - hour) / 1.5 * .67;
  return .67;
}

const nightCanvas = document.createElement('canvas');
function drawNightOverlay() {
  const opacity = nightOpacity();
  if (!opacity || place() !== 'world') return;
  if (nightCanvas.width !== canvas.width) nightCanvas.width = canvas.width;
  if (nightCanvas.height !== canvas.height) nightCanvas.height = canvas.height;
  const nightContext = nightCanvas.getContext('2d');
  nightContext.setTransform(dpr, 0, 0, dpr, 0, 0);
  nightContext.clearRect(0, 0, width, height);
  nightContext.globalCompositeOperation = 'source-over';
  nightContext.fillStyle = `rgba(8,17,42,${opacity})`;
  nightContext.fillRect(0, 0, width, height);
  nightContext.globalCompositeOperation = 'destination-out';
  const light = (x, y, radius, strength) => {
    const gradient = nightContext.createRadialGradient(x, y, 2, x, y, radius);
    gradient.addColorStop(0, `rgba(0,0,0,${strength})`);
    gradient.addColorStop(1, 'rgba(0,0,0,0)');
    nightContext.fillStyle = gradient;
    nightContext.fillRect(x - radius, y - radius, radius * 2, radius * 2);
  };
  light(player.x - camera.x, player.y - camera.y - 15, 145, .48);
  for (const x of VX) {
    for (const y of HY) {
      const sx = x - camera.x, sy = y - camera.y;
      if (sx > -120 && sx < width + 120 &&
          sy > -120 && sy < height + 120) {
        light(sx, sy, 115, .76);
      }
    }
  }
  if (S.vehicle) {
    const angle = S.vehicle.angle || 0;
    light(
      player.x - camera.x + Math.cos(angle) * 120,
      player.y - camera.y + Math.sin(angle) * 120,
      165, .84
    );
  }
  nightContext.globalCompositeOperation = 'source-over';
  ctx.save();
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.drawImage(nightCanvas, 0, 0, canvas.width, canvas.height,
    0, 0, width, height);
  ctx.restore();
}

HUD = function () {
  drawNightOverlay();
  const compact = width < 560 || height < 460;
  const tiny = height < 460;
  if (compact && !tiny) rect(0, 0, width, 105, '#172632');
  const cardWidth = compact ?
    Math.max(0, width - 32) : Math.min(270, Math.max(210, width * .32));
  const cardX = 16;
  const cardY = height - 260, cardHeight = 244;
  round(cardX + 3, cardY + 5, cardWidth, cardHeight, 12, '#02070c99');
  round(cardX, cardY, cardWidth, cardHeight, 12, '#101c27f5');
  ctx.strokeStyle = '#9bb5bf55';
  ctx.lineWidth = 1;
  ctx.strokeRect(cardX + .5, cardY + .5, cardWidth - 1, cardHeight - 1);
  round(cardX + 12, cardY + 11, 3, 14, 1, '#e5bf72');
  const alignedText = (value, x, y, size, color, weight, align) => {
    ctx.save();
    ctx.font = `${weight} ${size}px "Segoe UI",Arial`;
    ctx.textAlign = align;
    ctx.textBaseline = 'middle';
    ctx.fillStyle = color;
    ctx.fillText(value, x, y);
    ctx.restore();
  };
  alignedText('STATUS DO JOGADOR', cardX + cardWidth / 2,
    cardY + 18,
    11, '#f1d594', 800, 'center');

  const armorLabel = (slot, label) => {
    const armor = equipment[slot];
    return armor ?
      `${label} ${Math.ceil(armor.durability)}/${goods[armor.id].durability}` :
      `${label} —`;
  };
  text(
    `R$ ${S.money} · ★ ${S.stars}/10` +
      (S.stars > 0 ? (S.sighting ? ' · LOCALIZADO' : ' · DESPISTANDO') : ''),
    cardX + cardWidth / 2, cardY + (compact ? 32 : 35),
    compact ? 8 : 9, '#f1ce72', 700
  );
  if (compact) {
    text(`${armorLabel('vest', 'COLETE')} · ${armorLabel('helmet', 'CAPACETE')}`,
      cardX + cardWidth / 2, cardY + 48, 9, '#b8cbd1', 700);
  } else {
    text(armorLabel('vest', 'COLETE'), cardX + cardWidth / 2, cardY + 51,
      9, '#b8cbd1', 700);
    text(armorLabel('helmet', 'CAPACETE'), cardX + cardWidth / 2, cardY + 67,
      9, '#b8cbd1', 700);
  }

  const currentItem = bag[S.slot], itemInfo = goods[currentItem?.id];
  const itemLabel = itemInfo?.capacity ?
    (S.reload > 0 ? 'RECARREGANDO…' :
      `${itemInfo.name} · ${currentItem.ammo ?? 0}/${reserve(currentItem.id)} · R`) :
    itemInfo?.name || 'MÃOS VAZIAS';
  text(itemLabel, cardX + cardWidth / 2, cardY + (compact ? 64 : 83),
    10, '#efd9a5', 700);

  const meter = (label, value, max, y, colors) => {
    const barX = cardX + 14, barWidth = cardWidth - 28;
    const ratio = max > 0 ? clamp(value / max, 0, 1) : 0;
    alignedText(label, barX, y, 9, '#aebfc6', 800, 'left');
    alignedText(`${Math.ceil(value)} / ${max}`, barX + barWidth, y, 9,
      '#e6eff0', 700, 'right');
    const meterHeight = compact ? 9 : 11;
    round(barX, y + 8, barWidth, meterHeight, 4, '#071119');
    const fillWidth = (barWidth - 4) * ratio;
    if (fillWidth > 0) {
      const gradient = ctx.createLinearGradient(barX, 0, barX + barWidth, 0);
      gradient.addColorStop(0, colors[0]);
      gradient.addColorStop(1, colors[1]);
      round(barX + 2, y + 10, fillWidth, compact ? 5 : 7, 3, gradient);
    }
    for (let segment = 1; segment < 10; segment++) {
      rect(barX + barWidth * segment / 10, y + 9, 1,
        compact ? 7 : 9, '#07111988');
    }
    ctx.strokeStyle = '#ffffff18';
    ctx.strokeRect(barX + .5, y + 8.5, barWidth - 1, meterHeight - 1);
  };

  const healthLabelY = cardY + (compact ? 85 : 102);
  alignedText('SAÚDE', cardX + 14, healthLabelY, 9, '#aebfc6', 800, 'left');
  alignedText(`${Math.ceil(player.hp)} / ${player.maxHp}`,
    cardX + cardWidth - 14, healthLabelY, 9, '#e6eff0', 700, 'right');
  const healthX = cardX + 14;
  const healthY = cardY + (compact ? 93 : 110);
  const healthHeight = 12;
  const healthWidth = cardWidth - 28;
  round(healthX, healthY, healthWidth, healthHeight, 4, '#071119');
  const healthRatio = clamp(player.hp / player.maxHp, 0, 1);
  if (healthRatio > 0) {
    const healthGradient = ctx.createLinearGradient(
      healthX, 0, healthX + healthWidth, 0
    );
    healthGradient.addColorStop(0,
      healthRatio < .3 ? '#c94550' : '#319b77');
    healthGradient.addColorStop(1,
      healthRatio < .3 ? '#ef8276' : '#7be0ad');
    round(healthX + 2, healthY + 2, (healthWidth - 4) * healthRatio,
      8, 3, healthGradient);
  }
  for (let segment = 1; segment < 10; segment++) {
    rect(healthX + healthWidth * segment / 10, healthY + 1, 1,
      healthHeight - 2, '#07111988');
  }
  ctx.strokeStyle = '#ffffff18';
  ctx.strokeRect(healthX + .5, healthY + .5, healthWidth - 1,
    healthHeight - 1);

  meter('FOME', S.hunger, 100, cardY + (compact ? 127 : 145),
    ['#ab7138', '#f0ce72']);
  meter('BEBEDEIRA', S.drunk, 100, cardY + (compact ? 162 : 185),
    ['#7664a8', '#c4a8ed']);
  text(
    player.swimming ? 'NADANDO' : S.vehicle ? 'DIRIGINDO' :
      onIsland(player.x, player.y) ? 'ILHA · FLORESTA' : 'A PÉ · G: ASSALTAR',
    cardX + cardWidth / 2, cardY + (compact ? 188 : 229),
    9, '#91abb4', 700
  );

  const slotSize = 44, gap = 6;
  const slotsWidth = slotSize * 5 + gap * 4;
  const slotsX = Math.max(8, width - slotsWidth - 14);
  const slotsY = height - 59;
  for (let i = 10; i < 15; i++) {
    const x = slotsX + (i - 10) * (slotSize + gap);
    round(x + 2, slotsY + 3, slotSize, slotSize, 5, '#02070c66');
    round(x, slotsY, slotSize, slotSize, 5,
      i === S.slot ? '#38586a' : '#101c27ee');
    ctx.strokeStyle = i === S.slot ? '#f1d594' : '#78909b88';
    ctx.lineWidth = i === S.slot ? 2 : 1;
    ctx.strokeRect(x + .5, slotsY + .5, slotSize - 1, slotSize - 1);
    text(String(i - 9), x + 8, slotsY + 8, 10, '#eaf3f5', 700);
    if (bag[i]) icon(bag[i].id, x + slotSize / 2, slotsY + 27, .65);
  }
  const beerSlotX = slotsX - slotSize - gap;
  if (S.beerSlotUnlocked && beerSlotX >= 4) {
    round(beerSlotX + 2, slotsY + 3, slotSize, slotSize, 5, '#02070c66');
    round(beerSlotX, slotsY, slotSize, slotSize, 5, '#6d5124');
    ctx.strokeStyle = '#f1d594';
    ctx.lineWidth = 2;
    ctx.strokeRect(beerSlotX + .5, slotsY + .5, slotSize - 1, slotSize - 1);
    text('6', beerSlotX + 8, slotsY + 8, 10, '#fff0bd', 700);
    icon('beer', beerSlotX + slotSize / 2, slotsY + 27, .65);
    text('∞', beerSlotX + slotSize - 7, slotsY + slotSize - 7, 10,
      '#fff0bd', 700);
  }

  const clockY = 67;
  round(width / 2 - 104, clockY, 208, compact ? 44 : 38, 7, '#101c27ee');
  ctx.strokeStyle = '#e5bf7255';
  ctx.strokeRect(width / 2 - 103.5, clockY + .5, 207,
    (compact ? 44 : 38) - 1);
  const hour = Math.floor(S.clock / 60);
  const minute = Math.floor(S.clock % 60);
  text(
    `${hour >= 19 || hour < 6 ? '☾' : '☀'} ` +
    `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')} · DIA ${S.day}`,
    width / 2, clockY + 19, 12,
    '#e7d9b7', 700
  );
  if (S.vehicle) {
    const vehicle = S.vehicle;
    round(width / 2 - 135, height - 130, 270, 55, 8, '#152c3def');
    text(
      `${vehicle.kind === 'boat' ? 'BARCO' :
        vehicle.kind === 'motorcycle' ? 'MOTO' :
          vehicle.kind === 'bike' ? 'BICICLETA' :
            vehicle.kind === 'bus' ? 'ÔNIBUS' : 'CARRO'} · ` +
      `${Math.round(Math.abs(vehicle.velocity || 0) / 4)} km/h` +
      (vehicle.policeVehicle ?
        ` · C ${vehicle.siren ? 'SIRENE ON' : 'SIRENE OFF'}` : ''),
      width / 2, height - 113, 12, '#eaf3f5', 700
    );
    rect(width / 2 - 100, height - 99, 200, 8, '#4e3030');
    rect(width / 2 - 100, height - 99,
      200 * vehicle.hp / vehicle.maxHp, 8, '#e0ba62');
  }
  if (noticeTime > 0) {
    text(notice, width / 2, height - 250, 15, '#ffe4a3');
  }
};

const originalItemCanvas = itemCanvas;
itemCanvas = function (id) {
  if (id !== 'dildo') return originalItemCanvas(id);
  const canvas = document.createElement('canvas');
  canvas.width = 70;
  canvas.height = 55;
  canvas.style.cssText = 'width:58px;height:46px;pointer-events:none';
  const itemContext = canvas.getContext('2d');
  itemContext.translate(35, 28);
  itemContext.fillStyle = '#e86a9a';
  itemContext.beginPath();
  itemContext.ellipse(0, 0, 9, 20, 0, 0, Math.PI * 2);
  itemContext.fill();
  itemContext.fillStyle = '#f7a8c4';
  itemContext.beginPath();
  itemContext.ellipse(0, -14, 6, 6, 0, 0, Math.PI * 2);
  itemContext.fill();
  return canvas;
};

const originalIcon = icon;
icon = function (id, x, y, scale = 1) {
  if (!missionItemIds.has(id) && id !== 'dildo') {
    return originalIcon(id, x, y, scale);
  }
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  if (id === 'dildo') {
    oval(0, 0, 9, 20, '#e86a9a');
    oval(0, -14, 6, 6, '#f7a8c4');
  } else if (id === 'computer') {
    round(-15, -12, 30, 22, 3, '#5b7684');
    rect(-12, -9, 24, 15, '#9fd8e8');
    rect(-6, 12, 12, 3, '#3a4a55');
  } else {
    round(-8, -16, 16, 32, 3, '#4a5a68');
    rect(-5, -12, 10, 8, '#c9d6dd');
    rect(-4, 10, 8, 3, '#84939d');
  }
  ctx.restore();
};

drawPenguin = function (penguin = linux) {
  ctx.save();
  ctx.translate(penguin.x, penguin.y);
  const step = Math.sin(penguin.step || 0) * 2;
  oval(0, 6, 10, 4, '#0003');
  oval(-5, 5 + step, 5, 3, '#e3ae4c');
  oval(5, 5 - step, 5, 3, '#e3ae4c');
  oval(0, -8, 9, 13, '#1c2934');
  oval(0, -5, 6, 9, '#efeede');
  oval(0, -20, 8, 8, '#1c2934');
  oval(-3, -20, 3.5, 4, '#efeede');
  oval(3, -20, 3.5, 4, '#efeede');
  oval(-3, -21, 1, 1.5, '#182b38');
  oval(3, -21, 1, 1.5, '#182b38');
  poly([[-3, -17], [3, -17], [0, -13]], '#e2ac46');
  ctx.restore();
};
const originalDrawHuman = drawHuman;
drawHuman = function (person) {
  if (person.petPenguin) return drawPenguin(person);
  originalDrawHuman(person);
};

window.addEventListener('keydown', event => {
  if (event.key.toLowerCase() === 'p' && !event.repeat &&
      activatedMissionPowers.has('pyUsb')) {
    summonMissionSnakes();
    event.preventDefault();
  }
});

const wantedHeatThresholds = [1, 3, 6, 10, 15, 21, 28, 36, 45, 55];
S.wantedHeat = 0;
const responseRoster = {
  1: { officers: 1, cavalry: 0, cars: 1, swat: 0, helicopters: 0 },
  2: { officers: 2, cavalry: 0, cars: 1, swat: 0, helicopters: 0 },
  3: { officers: 0, cavalry: 1, cars: 1, swat: 0, helicopters: 0 },
  4: { officers: 2, cavalry: 1, cars: 1, swat: 0, helicopters: 0 },
  5: { officers: 0, cavalry: 2, cars: 1, swat: 0, helicopters: 0 },
  6: { officers: 2, cavalry: 2, cars: 2, swat: 0, helicopters: 0 },
  7: { officers: 0, cavalry: 0, cars: 0, swat: 1, helicopters: 0 },
  8: { officers: 0, cavalry: 0, cars: 0, swat: 1, helicopters: 0 },
  9: { officers: 0, cavalry: 0, cars: 0, swat: 2, helicopters: 1 },
  10: { officers: 0, cavalry: 0, cars: 4, swat: 2, helicopters: 1 }
};

raiseWanted = function (severity = 1, absolute = false) {
  const previous = S.stars;
  if (absolute) {
    S.stars = Math.max(S.stars, Math.min(10, severity));
    S.wantedHeat = Math.max(
      S.wantedHeat,
      wantedHeatThresholds[S.stars - 1] || 0
    );
  } else {
    S.wantedHeat = Math.min(55, S.wantedHeat + Math.max(1, severity));
    const heatLevel = wantedHeatThresholds.filter(
      threshold => S.wantedHeat >= threshold
    ).length;
    S.stars = Math.min(10, Math.max(S.stars, severity, heatLevel));
  }
  S.hidden = 0;
  S.dispatch = Math.min(S.dispatch, .25);
  if (S.stars > previous) sound.play('alert');
};

function wantedComposition(stars = S.stars) {
  return responseRoster[clamp(stars, 0, 10)] ||
    { officers: 0, cavalry: 0, cars: 0, swat: 0, helicopters: 0 };
}

function responseSpawnPoint() {
  const point = responsePoint();
  return safePoint(point.x, point.y);
}

function spawnResponseOfficer(role, car = null) {
  const cavalry = role === 'cavalry';
  const swat = role === 'swat';
  const officer = makeOfficer(cavalry, swat);
  Object.assign(officer, {
    responseUnit: true,
    responseRole: role,
    hostile: true,
    dispatched: true,
    scene: 'world',
    shotClock: .35
  });
  if (car) {
    Object.assign(officer, {
      x: car.x, y: car.y, inCar: true, car,
      driver: car.occupants.length === 0
    });
    car.occupants.push(officer);
  } else {
    Object.assign(officer, responseSpawnPoint());
    officer.swimming = false;
  }
  if (officer.x < DESERT_EDGE_X && !cavalry && !swat) {
    officer.desertPolice = true;
    officer.shirt = '#b49a65';
    officer.name = 'Policial do deserto';
  }
  officers.push(officer);
  return officer;
}

function spawnResponseVehicle(kind) {
  const point = responsePoint();
  const helicopter = kind === 'helicopter';
  const swat = kind === 'swat';
  const desert = point.x < DESERT_EDGE_X;
  const car = {
    kind: helicopter ? 'helicopter' : swat ? 'bus' : 'car',
    unitType: kind,
    responseUnit: true,
    policeVehicle: true,
    desertPolice: desert && !swat && !helicopter,
    swat,
    chase: true,
    siren: true,
    stopped: false,
    speed: helicopter ? 245 : swat ? 165 : 195,
    color: helicopter ? '#263c4e' : swat ? '#151b20' :
      desert ? '#8f7950' : '#284e74',
    step: 0,
    angle: 0,
    hp: helicopter ? 900 : swat ? 1100 : 550,
    maxHp: helicopter ? 900 : swat ? 1100 : 550,
    scene: 'world',
    x: helicopter ? clamp(player.x + 820, 100, WORLD.w - 100) : point.x,
    y: helicopter ? clamp(player.y - 650, SEA_TOP + 100, WORLD.h - 100) : point.y,
    altitude: helicopter ? 48 : 0,
    occupants: []
  };
  policeCars.push(car);
  if (swat) {
    for (let i = 0; i < 6; i++) spawnResponseOfficer('swat', car);
  } else if (helicopter) {
    spawnResponseOfficer('helicopterCrew', car);
  }
  return car;
}

function removeResponseOfficer(officer) {
  if (officer.car) {
    officer.car.occupants =
      officer.car.occupants.filter(occupant => occupant !== officer);
  }
  const index = officers.indexOf(officer);
  if (index >= 0) officers.splice(index, 1);
}

function removeResponseVehicle(vehicle) {
  for (const occupant of [...vehicle.occupants]) {
    removeResponseOfficer(occupant);
  }
  const index = policeCars.indexOf(vehicle);
  if (index >= 0) policeCars.splice(index, 1);
}

function syncResponseUnits() {
  const desired = wantedComposition();
  for (const [role, count] of [
    ['officer', desired.officers],
    ['cavalry', desired.cavalry]
  ]) {
    const current = officers.filter(officer =>
      officer.responseUnit && officer.responseRole === role
    );
    while (current.length < count) {
      current.push(spawnResponseOfficer(role));
    }
  }

  for (const [kind, count] of [
    ['car', desired.cars],
    ['swat', desired.swat],
    ['helicopter', desired.helicopters]
  ]) {
    const current = policeCars.filter(vehicle =>
      vehicle.responseUnit && vehicle.unitType === kind
    );
    while (current.length < count) {
      current.push(spawnResponseVehicle(kind));
    }
  }
}

let responseSyncTimer = 0;
dispatchTick = function (dt) {
  responseSyncTimer -= dt;
  if (responseSyncTimer > 0) return;
  responseSyncTimer = .65;
  syncResponseUnits();
  if (place() === 'world' && player.y < SHORE && S.stars > 0) {
    const activeMarineBoats = policeCars.filter(vehicle =>
      vehicle.responseUnit && vehicle.unitType === 'marine' &&
      vehicle.chase && !vehicle.dead
    ).length;
    const marineLimit = Math.min(6, 1 + Math.floor(S.stars / 2));
    if (activeMarineBoats < marineLimit) spawnResponse(false, true);
  }
};

const originalWantedTick = wantedTick;
wantedTick = function (dt, seen) {
  const starsBefore = S.stars;
  if (S.stars > 0) {
    if (seen) {
      S.hidden = 0;
      S.sighting = 1;
    } else {
      S.hidden += dt;
      S.sighting = 0;
      if (S.hidden >= 20) {
        S.stars--;
        S.wantedHeat = wantedHeatThresholds[S.stars - 1] || 0;
        S.hidden = 5;
        if (S.stars === 0) {
          for (const officer of officers) {
            if (!officer.responseUnit) {
              officer.hostile = false;
              officer.dispatched = false;
            }
          }
          for (const vehicle of policeCars) {
            if (!vehicle.responseUnit && vehicle.chase) {
              vehicle.chase = false;
              vehicle.stopped = true;
              vehicle.siren = false;
            }
          }
          tell('Você despistou a polícia');
        }
      }
    }
  } else {
    originalWantedTick(dt, seen);
  }
  if (starsBefore > 0 && S.stars === 0) {
    for (const vehicle of policeCars.filter(unit => unit.responseUnit)) {
      removeResponseVehicle(vehicle);
    }
    for (const officer of officers.filter(unit => unit.responseUnit)) {
      removeResponseOfficer(officer);
    }
    S.heliAlertUntil = 0;
  }
  if (S.stars < starsBefore) S.dispatch = 0;
};

const originalCrimeForDispatch = crime;
crime = function (...args) {
  const officersBefore = new Map(officers.map(officer =>
    [officer, officer.hostile]
  ));
  const event = originalCrimeForDispatch(...args);
  for (const [officer, wasHostile] of officersBefore) {
    if (!wasHostile && !officer.responseUnit) {
      officer.hostile = false;
      officer.dispatched = false;
    }
  }
  return event;
};

const originalDriveChase = driveChase;
driveChase = function (vehicle, dt) {
  if (vehicle.kind === 'helicopter') {
    if (place() !== 'world' || vehicle.dead || S.stars === 0) return;
    const dx = player.x - vehicle.x;
    const dy = player.y - 320 - vehicle.y;
    const distanceToPlayer = Math.hypot(dx, dy) || 1;
    const step = Math.min(distanceToPlayer, vehicle.speed * dt);
    vehicle.angle = Math.atan2(dy, dx);
    vehicle.x += dx / distanceToPlayer * step;
    vehicle.y += dy / distanceToPlayer * step;
    vehicle.altitude = 46 + Math.sin(time * 2.1 + vehicle.x) * 4;
    vehicle.step += dt * 12;
    return;
  }
  if (vehicle.responseUnit && vehicle.unitType === 'swat' &&
      distance(vehicle, player) < 310) {
    vehicle.stopped = true;
    for (const officer of [...vehicle.occupants]) exitCar(officer);
    return;
  }
  originalDriveChase(vehicle, dt);
};

const originalPoliceUpdate = policeUpdate;
function policeNavigationTarget(officer) {
  const destination = {
    x: player.x, y: player.y, scene: officer.scene || 'world'
  };
  const cachedDestination = officer.navigationDestination;
  const cachedWaypoint = officer.navigationWaypoint;
  const cacheValid = officer.navigationTimer > 0 &&
    cachedDestination?.scene === destination.scene &&
    distance(cachedDestination, destination) < 100 &&
    (!cachedWaypoint || distance(officer, cachedWaypoint) > 24) &&
    (!cachedWaypoint ||
      !blocked(cachedWaypoint.x, cachedWaypoint.y, 12, officer.scene));
  if (cacheValid) return cachedWaypoint || destination;

  officer.navigationTimer = .35;
  officer.navigationDestination = { ...destination };
  if (sight(officer, destination, 5000)) {
    officer.navigationWaypoint = null;
    return destination;
  }

  const totalDistance = distance(officer, destination);
  const samples = Math.ceil(totalDistance / 14);
  let obstruction = null;
  for (let i = 1; i < samples; i++) {
    const ratio = i / samples;
    const x = officer.x + (destination.x - officer.x) * ratio;
    const y = officer.y + (destination.y - officer.y) * ratio;
    obstruction = buildings.find(building =>
      building.solid && intersects(x, y, 1, building)
    );
    if (obstruction) break;
    if (officer.scene === 'fatec') {
      obstruction = insideWalls.find(wall => intersects(x, y, 1, wall));
      if (obstruction) break;
    } else if (venues[officer.scene]) {
      obstruction = venues[officer.scene].furniture.find(furniture =>
        furniture.solid !== false && intersects(x, y, 1, furniture)
      );
      if (obstruction) break;
    }
  }
  if (!obstruction) return destination;

  const margin = 24;
  const corners = [
    { x: obstruction.x - margin, y: obstruction.y - margin },
    { x: obstruction.x + obstruction.w + margin,
      y: obstruction.y - margin },
    { x: obstruction.x - margin,
      y: obstruction.y + obstruction.h + margin },
    { x: obstruction.x + obstruction.w + margin,
      y: obstruction.y + obstruction.h + margin }
  ].map(point => ({ ...point, scene: officer.scene || 'world' }))
    .filter(point => !blocked(point.x, point.y, 12, officer.scene));
  const clearPath = (from, to) => sight(from, to, 5000);
  corners.sort((a, b) => {
    const score = point =>
      distance(officer, point) + distance(point, destination) +
      (clearPath(officer, point) ? 0 : 5000) +
      (clearPath(point, destination) ? 0 : 2500);
    return score(a) - score(b);
  });
  officer.navigationWaypoint = corners[0] || null;
  return officer.navigationWaypoint || destination;
}

policeUpdate = function (dt) {
  if (S.stars > 0) {
    for (const officer of officers) {
      if (officer.dead || officer.inCar || officer.dog ||
          officer.scene !== place() || officer.hostile) continue;
      if (distance(officer, player) <= 700 && sight(officer, player)) {
        officer.hostile = true;
        officer.dispatched = true;
      }
    }
  }
  const positions = new Map(officers.map(officer =>
    [officer, { x: officer.x, y: officer.y, scene: officer.scene }]
  ));
  originalPoliceUpdate(dt);
  for (const officer of officers) {
    officer.navigationTimer =
      Math.max(0, (officer.navigationTimer || 0) - dt);
    if (officer.dead || officer.inCar || !officer.hostile ||
        officer.scene !== place() || S.stars === 0) continue;
    const previous = positions.get(officer);
    if (previous?.scene === officer.scene) {
      officer.x = previous.x;
      officer.y = previous.y;
    }
    const distanceBefore = distance(officer, player);
    if (distanceBefore < (officer.dog ? 26 : 240) &&
        sight(officer, player)) continue;
    if (officer.scene === 'world' && player.y < SHORE &&
        !officer.marine && !officer.dog) continue;

    const waypoint = policeNavigationTarget(officer);
    const desiredAngle = Math.atan2(
      waypoint.y - officer.y, waypoint.x - officer.x
    );
    const step = (officer.cavalry ? 155 :
      officer.dog ? 150 : 115) * dt;
    let best = null;
    for (const offset of [
      0, .45, -.45, .9, -.9, 1.35, -1.35,
      1.8, -1.8, 2.25, -2.25, Math.PI
    ]) {
      const angle = desiredAngle + offset;
      const x = officer.x + Math.cos(angle) * step;
      const y = officer.y + Math.sin(angle) * step;
      if (blocked(x, y, officer.cavalry ? 13 : 10, officer.scene)) continue;
      const remaining = distance({ x, y }, player);
      const score = remaining + Math.abs(offset) * 18;
      if (!best || score < best.score) best = { x, y, score, angle };
    }
    if (best) {
      officer.x = best.x;
      officer.y = best.y;
      officer.aim = best.angle;
      officer.step += dt * 12;
    }
  }
};

const originalDrawMountedBase = drawHuman;
drawHuman = function (person) {
  originalDrawMountedBase(person);
};

const originalDrawVehicleWithHelicopters = drawVehicle;
drawVehicle = function (vehicle) {
  if (vehicle.kind !== 'helicopter') {
    originalDrawVehicleWithHelicopters(vehicle);
    return;
  }
  ctx.save();
  ctx.translate(vehicle.x, vehicle.y - vehicle.altitude);
  ctx.rotate(vehicle.angle || 0);
  ctx.scale(1.55, 1.55);
  oval(0, vehicle.altitude + 66, 62, 15, '#09141c55');

  ctx.fillStyle = '#101b23';
  ctx.beginPath();
  ctx.ellipse(-3, 2, 52, 18, 0, 0, Math.PI * 2);
  ctx.fill();
  poly([[-39, -5], [-104, -12], [-109, -6], [-47, 7]],
    '#223744');
  poly([[-42, -10], [-101, -15], [-103, -10], [-48, 1]],
    '#5d7885');
  oval(-2, 0, 44, 15, vehicle.color || '#243d50');
  poly([[19, -11], [39, -10], [52, -4], [53, 5],
    [42, 12], [20, 12]], '#2b485b');
  poly([[26, -9], [39, -8], [48, -3], [47, 1], [27, 1]],
    '#9ac4d1');
  poly([[9, -11], [21, -10], [24, 0], [11, -1]],
    '#6d99aa');
  line(-22, -9, 10, -9, '#527181', 1);
  line(-16, 11, 42, 11, '#d5dddc', 2);
  line(-17, 11, -21, 17, '#bec9ca', 2);
  line(32, 11, 36, 17, '#bec9ca', 2);
  line(-26, 17, 42, 17, '#dce4e2', 2);
  line(-31, -15, 28, -15, '#d8e1e2', 3);
  oval(-2, -15, 5, 5, '#354b57');
  ctx.save();
  ctx.globalAlpha = .42;
  ctx.rotate(time * 14);
  oval(-2, -18, 96, 3, '#e3ecec');
  ctx.rotate(Math.PI / 2);
  oval(-2, -18, 96, 3, '#e3ecec');
  ctx.restore();

  line(-105, -13, -105, -25, '#d9e3e3', 2);
  line(-116, -25, -94, -25, '#d9e3e3', 2);
  line(-105, -34, -105, -16, '#d9e3e3', 2);
  line(-105, -25, -97, -31, '#d9e3e3', 2);
  oval(-99, -13, 3, 3, Math.sin(time * 16) > 0 ? '#f26764' : '#8298a1');
  oval(21, -12, 3, 3, Math.sin(time * 16) > 0 ? '#6cb9ee' : '#f26764');
  round(-13, -3, 24, 7, 2, '#e5e9e4');
  text('POLÍCIA', -1, 1, 6, '#233946', 900);
  ctx.restore();
};

const fixedAppearance = (person, appearance) => {
  if (!person) return;
  Object.assign(person, appearance);
};
fixedAppearance(felipe, {
  gender: 'man', age: 'adult', skin: LIGHT_SKIN,
  hair: '#211b18', hairSecondary: '#d3d0c7',
  hairStyle: 'short', facialHair: true, facialHairColor: '#211b18'
});
fixedAppearance(wagner, {
  gender: 'man', age: 'adult', skin: '#71462f',
  hair: '#211b18', hairStyle: 'short',
  facialHair: true, facialHairColor: '#211b18'
});
fixedAppearance(evangelista, {
  gender: 'man', age: 'adult', skin: LIGHT_SKIN,
  hair: '#aaa99f', hairStyle: 'bald', facialHair: false
});
fixedAppearance(joao, {
  gender: 'man', age: 'adult', skin: LIGHT_SKIN,
  hair: '#211b18', hairStyle: 'short',
  facialHair: true, facialHairColor: '#211b18'
});
fixedAppearance(psicologa, {
  gender: 'woman', age: 'adult', skin: LIGHT_SKIN,
  hair: '#3a2924', hairStyle: 'long', facialHair: false
});
fixedAppearance(player, {
  name: 'Nicolas', gender: 'man', age: 'young',
  skin: LIGHT_SKIN, hair: '#5c3a22', hairStyle: 'short',
  facialHair: false
});
fixedAppearance(zannetu, {
  gender: 'man', age: 'adult', skin: LIGHT_SKIN,
  hair: '#292523', hairStyle: 'short', facialHair: false
});

const previousBlockedOutsideWithRiver = blockedOutside;
blockedOutside = function (x, y, radius = 11) {
  const overlapsRiver = x + radius > DESERT_RIVER.x &&
    x - radius < DESERT_RIVER.x + DESERT_RIVER.w &&
    y + radius > DESERT_RIVER.y &&
    y - radius < DESERT_RIVER.y + DESERT_RIVER.h;
  if (overlapsRiver && !road(x, y)) return true;
  return previousBlockedOutsideWithRiver(x, y, radius);
};

const previousVehicleBlockedWithRiver = vehicleBlocked;
vehicleBlocked = function (vehicle, x, y) {
  if (vehicle.kind !== 'boat' &&
      x > DESERT_RIVER.x - 25 &&
      x < DESERT_RIVER.x + DESERT_RIVER.w + 25 &&
      y > DESERT_RIVER.y - 20 &&
      y < DESERT_RIVER.y + DESERT_RIVER.h + 20 &&
      !road(x, y)) return true;
  return previousVehicleBlockedWithRiver(vehicle, x, y);
};

const previousVitalWithHealthBoost = vital;
vital = function (person) {
  previousVitalWithHealthBoost(person);
  if (!machine(person) && !person.healthScaled) {
    const previousMax = person.maxHp || 100;
    const boostedMax = Math.max(250, previousMax);
    person.hp = Math.min(boostedMax,
      (person.hp || previousMax) + boostedMax - previousMax);
    person.maxHp = boostedMax;
    person.healthScaled = true;
  }
  return person;
};

hospitalHeal = function () {
  if (player.hp >= player.maxHp) {
    tell('Vida já cheia');
    return;
  }
  if (S.money < 25) {
    tell('Tratamento: R$ 25');
    return;
  }
  S.money -= 25;
  player.hp = player.maxHp;
  sound.play('buy');
  tell('Vida restaurada');
};

const previousUseItemWithHealthBoost = useItem;
useItem = function (slot) {
  const item = bag[slot];
  if (!item || !(item.id === 'medkit' || goods[item.id]?.heal)) {
    return previousUseItemWithHealthBoost(slot);
  }
  if (player.hp >= player.maxHp) {
    tell('Vida já cheia');
    return false;
  }
  player.hp = Math.min(player.maxHp,
    player.hp + (goods[item.id].heal || 45));
  bag[slot] = null;
  sound.play('eat');
  refresh();
  return true;
};

const previousFollowCircuitWithSpacing = followCircuit;
followCircuit = function (person, dt) {
  if (machine(person) && person.route && !person.dead &&
      person.driver !== player && !person.stopped) {
    const target = person.route[person.target];
    if (target) {
      const dx = target.x - person.x, dy = target.y - person.y;
      const distanceToTarget = Math.hypot(dx, dy);
      const travel = Math.min(distanceToTarget, person.speed * dt);
      const nextX = distanceToTarget ?
        person.x + dx / distanceToTarget * travel : person.x;
      const nextY = distanceToTarget ?
        person.y + dy / distanceToTarget * travel : person.y;
      const gap = ['truck', 'bus', 'militaryTruck', 'tank'].includes(person.kind)
        ? 112 : 78;
      const otherVehicles = [...vehicles, ...policeCars];
      if (otherVehicles.some(other => other !== person && !other.dead &&
        !other.inCar && (other.kind === 'boat') === (person.kind === 'boat') &&
        distance({ x: nextX, y: nextY }, other) < gap &&
        (distance(person, other) >= gap ||
          otherVehicles.indexOf(person) > otherVehicles.indexOf(other)))) return;
    }
  }
  previousFollowCircuitWithSpacing(person, dt);
};

const previousVehicleContactWithHealth = vehicleContact;
vehicleContact = function (vehicle, person, rng = Math.random) {
  if (person.dead || person.inCar ||
      !carHit(vehicle, person)) {
    return previousVehicleContactWithHealth(vehicle, person, rng);
  }
  vehicle.contacts ??= new Set();
  if (vehicle.contacts.has(person)) return false;
  const playerDriving = vehicle.driver === player;
  if (!playerDriving && (person.trafficImmune || person.police ||
      person.important)) return false;
  if (!playerDriving && animals.includes(person) && rng() >= .1) return false;
  vehicle.contacts.add(person);
  if (person === nicolas) {
    launchBike(person, vehicle);
  } else {
    die(person,
      Math.cos(vehicle.angle || 0) * 1100,
      Math.sin(vehicle.angle || 0) * 1100,
      playerDriving ? player : null);
    if (!person.police && !person.guard && !animals.includes(person) &&
        !person.dog && person !== linux && !bodies.includes(person)) {
      bodies.push(person);
    }
  }
  sound.play('crash', person);
  return true;
};

const previousHUDWithMilitaryAndHealth = HUD;
HUD = function () {
  previousHUDWithMilitaryAndHealth();
  const w = Math.min(270, Math.max(210, width * .32));
  const x = 16, y = height - 225;
  round(x + 10, y + 78, w - 20, 42, 4, '#102536');
  text('SAÚDE', x + 45, y + 91, 11, '#c4d9e3');
  text(Math.ceil(player.hp) + ' / ' + player.maxHp,
    x + w - 48, y + 91, 12, '#eff9f2');
  round(x + 14, y + 106, w - 28, 12, 6, '#283d48');
  const healthWidth = (w - 28) * player.hp / player.maxHp;
  if (healthWidth > 0) round(x + 14, y + 106, healthWidth, 12,
    Math.min(6, healthWidth / 2),
    player.hp / player.maxHp < .3 ? '#ef7772' : '#60c9a1');
  const armyPursuit = militaryAlert ||
    officers.some(officer => officer.military && officer.hostile &&
      !officer.dead);
  if (armyPursuit) {
    round(width / 2 - 115, 8, 230, 34, 8, '#25151cf2');
    text('★'.repeat(S.stars) + '☆'.repeat(10 - S.stars),
      width / 2, 25, 20, '#ed565d');
  }
};

const previousMinimapWithMilitary = drawMinimap;
drawMinimap = function () {
  previousMinimapWithMilitary();
  if (mapOpen || panelMode || S.dead || S.blackout > 0 ||
      place() !== 'world') return;
  const compact = width < 560;
  const mapWidth = compact ? 148 : 174;
  const mapHeight = compact ? 112 : 132;
  const left = 14, top = compact ? 145 : 78;
  const rangeX = 1750, rangeY = 1350;
  const scaleX = (mapWidth - 14) / rangeX;
  const scaleY = (mapHeight - 14) / rangeY;
  const centerX = S.vehicle?.x ?? player.x;
  const centerY = S.vehicle?.y ?? player.y;
  const toMap = (x, y) => ({
    x: left + mapWidth / 2 + (x - centerX) * scaleX,
    y: top + mapHeight / 2 + (y - centerY) * scaleY
  });
  ctx.save();
  ctx.beginPath();
  ctx.rect(left + 5, top + 5, mapWidth - 10, mapHeight - 10);
  ctx.clip();
  const basePoint = toMap(DESERT_MILITARY_BASE.x +
    DESERT_MILITARY_BASE.w / 2, DESERT_MILITARY_BASE.y +
    DESERT_MILITARY_BASE.h / 2);
  if (basePoint.x >= left && basePoint.x <= left + mapWidth &&
      basePoint.y >= top && basePoint.y <= top + mapHeight) {
    round(basePoint.x - 5, basePoint.y - 5, 10, 10, 3, '#18232b');
    text('X', basePoint.x, basePoint.y, 8, '#d6c782', 900);
  }
  ctx.restore();
};

const previousDrawGroundWithDesertTown = drawGround;
drawGround = function () {
  previousDrawGroundWithDesertTown();
  for (const building of builtDesertHomes) {
    if (!visibleBox(building)) continue;
    const front = building.y + building.h;
    const doorX = building.x + building.w / 2;
    rect(building.x - 8, front - 3, building.w + 16, 22,
      '#c7c7b9');
    rect(building.x - 8, front - 3, building.w + 16, 3,
      '#e2d6bd');
    rect(doorX - 20, front + 19, 40, 5, '#a99b80');
  }

  for (const x of DESERT_VX) {
    for (const y of [DESERT_HY[0] + 135, DESERT_HY[1] + 135]) {
      const lampX = x + 120;
      if (!visible(lampX, y, 35)) continue;
      oval(lampX + 3, y + 3, 9, 4, '#30271f44');
      line(lampX, y + 2, lampX, y - 25, '#594a39', 3);
      line(lampX, y - 25, lampX + 9, y - 30, '#594a39', 3);
      round(lampX + 5, y - 34, 10, 7, 3, '#d5b66e');
      oval(lampX + 10, y - 31, 12, 8, '#f5d88b22');
    }
  }

  if (visibleBox(DESERT_RIVER)) {
    rect(DESERT_RIVER.x - 12, DESERT_RIVER.y,
      DESERT_RIVER.w + 24, DESERT_RIVER.h, '#b7a176');
    rect(DESERT_RIVER.x, DESERT_RIVER.y,
      DESERT_RIVER.w, DESERT_RIVER.h, '#367f91');
    for (let y = Math.max(DESERT_RIVER.y,
      Math.floor(camera.y / 70) * 70);
    y < Math.min(WORLD.h, camera.y + height + 70); y += 70) {
      line(DESERT_RIVER.x + 12, y,
        DESERT_RIVER.x + DESERT_RIVER.w - 12,
        y + 22, '#b3d8d766', 2);
    }
    rect(DESERT_BRIDGE.x - 10, DESERT_BRIDGE.y - 10,
      DESERT_BRIDGE.w + 20, DESERT_BRIDGE.h + 20, '#c7c7b9');
    rect(DESERT_BRIDGE.x, DESERT_BRIDGE.y,
      DESERT_BRIDGE.w, DESERT_BRIDGE.h, '#806b4e');
    for (let x = DESERT_BRIDGE.x + 8;
      x < DESERT_BRIDGE.x + DESERT_BRIDGE.w; x += 22) {
      line(x, DESERT_BRIDGE.y + 5, x,
        DESERT_BRIDGE.y + DESERT_BRIDGE.h - 5, '#d7c092', 2);
    }
  }
};

const previousFunctionalLocationsWithMilitaryDetails =
  functionalMapLocations;
functionalMapLocations = function () {
  return [
    ...previousFunctionalLocationsWithMilitaryDetails(),
    ...militaryStructures.filter(building =>
      ['arsenal', 'desertParking'].includes(building.type)
    ).map(building => ({
      building,
      type: building.type,
      name: building.name,
      key: building.type
    }))
  ];
};

const originalSightForHelicopter = sight;
sight = function (observer, target, range = 650) {
  return originalSightForHelicopter(
    observer, target,
    observer.car?.kind === 'helicopter' ? Math.max(range, 1100) : range
  );
};

function drawMinimap() {
  if (mapOpen || panelMode || S.dead || S.blackout > 0) return;
  const compact = width < 560;
  const mapWidth = compact ? 148 : 174;
  const mapHeight = compact ? 112 : 132;
  const left = 14;
  const top = compact ? 145 : 78;
  const rangeX = 1750, rangeY = 1350;
  const scaleX = (mapWidth - 14) / rangeX;
  const scaleY = (mapHeight - 14) / rangeY;
  const centerX = S.vehicle?.x ?? player.x;
  const centerY = S.vehicle?.y ?? player.y;
  const scene = place();
  const toMap = (x, y) => ({
    x: left + mapWidth / 2 + (x - centerX) * scaleX,
    y: top + mapHeight / 2 + (y - centerY) * scaleY
  });

  ctx.save();
  round(left + 3, top + 4, mapWidth, mapHeight, 8, '#0009');
  round(left, top, mapWidth, mapHeight, 8, '#0b1722eF');
  ctx.strokeStyle = '#b7c8ce88';
  ctx.lineWidth = 1;
  ctx.strokeRect(left + .5, top + .5, mapWidth - 1, mapHeight - 1);
  ctx.save();
  ctx.beginPath();
  ctx.rect(left + 5, top + 5, mapWidth - 10, mapHeight - 10);
  ctx.clip();

  if (scene === 'world') {
    const toMapRect = building => {
      const point = toMap(building.x, building.y);
      return {
        x: point.x,
        y: point.y,
        w: building.w * scaleX,
        h: building.h * scaleY
      };
    };
    const river = toMap(DESERT_RIVER.x, DESERT_RIVER.y);
    rect(river.x - 3, river.y - 5,
      (DESERT_RIVER.w + 6) * scaleX,
      (DESERT_RIVER.h + 10) * scaleY, '#b7a176');
    rect(river.x, river.y, DESERT_RIVER.w * scaleX,
      DESERT_RIVER.h * scaleY, '#286b80');
    drawDesertRoadNetwork(
      x => toMap(x, centerY).x,
      y => toMap(centerX, y).y,
      scaleX, scaleY, false
    );
    const bridge = toMap(DESERT_BRIDGE.x, DESERT_BRIDGE.y);
    rect(bridge.x, bridge.y, DESERT_BRIDGE.w * scaleX,
      DESERT_BRIDGE.h * scaleY, '#806b4e');
    for (const x of VX) {
      const point = toMap(x + 50, centerY);
      rect(point.x - 2, top + 5, 4, mapHeight - 10, '#65778160');
    }
    for (const y of HY) {
      const point = toMap(centerX, y + 50);
      rect(left + 5, point.y - 2, mapWidth - 10, 4, '#65778160');
    }
    for (const building of buildings) {
      if (!building.solid) continue;
      const type = building === shopBuilding ||
        building === marketBuilding ||
        ['shop', 'supermarket', 'cafe', 'restaurant'].includes(building.type);
      const policeStation = building === station || building.type === 'police';
      if (!type && !policeStation) continue;
      const box = toMapRect(building);
      if (box.x + box.w < left || box.x > left + mapWidth ||
          box.y + box.h < top || box.y > top + mapHeight) continue;
      rect(box.x, box.y, Math.max(3, box.w), Math.max(3, box.h),
        policeStation ? '#69aee0bb' : '#e5bf72bb');
      const point = toMap(
        building.x + building.w / 2,
        building.y + building.h / 2
      );
      text(policeStation ? 'P' : 'L', point.x, point.y, 8,
        policeStation ? '#bce6ff' : '#fff0bd', 800);
    }
  } else {
    const venue = venues[scene];
    if (venue) {
      for (const furniture of venue.furniture) {
        const point = toMap(
          furniture.x + furniture.w / 2,
          furniture.y + furniture.h / 2
        );
        rect(point.x - 2, point.y - 2,
          Math.max(3, furniture.w * scaleX),
          Math.max(3, furniture.h * scaleY), '#9aabb455');
      }
      const exit = toMap(venue.exit.x, venue.exit.y);
      round(exit.x - 4, exit.y - 4, 8, 8, 2, '#e5bf72');
    }
  }

  const nearbyOfficers = officers.filter(officer =>
    !officer.dead && !officer.inCar && officer.scene === scene &&
    distance(officer, { x: centerX, y: centerY }) < rangeX * .55
  );
  const nearPeople = locals(scene);
  for (const person of [...nearbyOfficers, ...nearPeople]) {
    if (!person || person.dead || person.inCar ||
        distance(person, { x: centerX, y: centerY }) > rangeX * .55) continue;
    const ally = person.petPenguin || person.summoned ||
      person.important && !person.hostile ||
      person.police && !person.hostile || person === missionPenguin;
    const enemy = person.hostile || person.police && S.stars > 0;
    if (!ally && !enemy) continue;
    const point = toMap(person.x, person.y);
    oval(point.x, point.y, 3.2, 3.2,
      enemy ? '#fa6868' : '#75d9ad');
  }

  for (const vehicle of policeCars) {
    if (vehicle.dead || !vehicle.chase || vehicle.scene !== scene ||
        distance(vehicle, { x: centerX, y: centerY }) > rangeX * .55) continue;
    const point = toMap(vehicle.x, vehicle.y);
    oval(point.x, point.y, vehicle.kind === 'helicopter' ? 4 : 3,
      vehicle.kind === 'helicopter' ? 4 : 3, '#fa6868');
  }

  const playerPoint = toMap(centerX, centerY);
  ctx.save();
  ctx.translate(playerPoint.x, playerPoint.y);
  ctx.rotate(facing());
  poly([[0, -6], [4, 5], [0, 3], [-4, 5]], '#fff0a5');
  ctx.restore();
  ctx.restore();

  round(left + 7, top + 7, 30, 13, 3, '#101c27d9');
  text('MAPA', left + 22, top + 13, 8, '#f1d594', 800);
  const legendY = top + mapHeight - 8;
  oval(left + 9, legendY, 2.5, 2.5, '#fa6868');
  text('INIMIGO', left + 28, legendY, 7, '#eaf3f5', 700);
  oval(left + mapWidth - 48, legendY, 2.5, 2.5, '#75d9ad');
  text('ALIADO', left + mapWidth - 29, legendY, 7, '#eaf3f5', 700);
  ctx.restore();
}

const originalHUDWithMinimap = HUD;
HUD = function () {
  originalHUDWithMinimap();
  drawMinimap();
};

resize();

requestAnimationFrame(loop);

const apparelCatalog = [
  { id: 'urban', name: 'Urbana', color: '#367f91', price: 120, style: 'plain' },
  { id: 'street', name: 'Streetwear', color: '#765b89', price: 180, style: 'stripe' },
  { id: 'jacket', name: 'Jaqueta tática', color: '#35434a', price: 260, style: 'jacket' },
  { id: 'formal', name: 'Social', color: '#263645', price: 340, style: 'jacket' },
  { id: 'premium', name: 'Premium', color: '#684d3e', price: 420, style: 'stripe' }
];
const clothingBuilding = buildings.find(building =>
  building.solid && building !== FATEC && building !== ESPELINHOS &&
  !building.lot && !Object.values(venues).some(venue =>
    venue.building === building
  ) && !['hospital', 'police', 'shop', 'restaurant', 'mall', 'cafe']
    .includes(building.type)
);

if (clothingBuilding) {
  clothingBuilding.type = 'clothing';
  clothingBuilding.name = 'Loja de Roupas';
  venues.clothingStore = {
    kind: 'clothing',
    name: 'Ateliê Urbano · Loja de Roupas',
    building: clothingBuilding,
    w: 1050,
    h: 800,
    color: '#b7a58d',
    furniture: [
      { x: 120, y: 210, w: 180, h: 18, solid: false },
      { x: 750, y: 210, w: 180, h: 18, solid: false },
      { x: 120, y: 410, w: 180, h: 18, solid: false },
      { x: 750, y: 410, w: 180, h: 18, solid: false },
      { x: 390, y: 155, w: 270, h: 60, solid: false },
      { x: 430, y: 515, w: 190, h: 70, solid: false }
    ],
    npcs: [
      { ...appearance(), name: 'Vendedora', x: 525, y: 180,
        scene: 'clothingStore', stationary: true, vendor: true, step: 0 },
      ...[0, 1, 2].map(index => ({
        ...appearance(), name: '', x: 360 + index * 145, y: 340,
        scene: 'clothingStore', stationary: false, step: 0,
        turn: 2, angle: rand(0, 6.28)
      }))
    ],
    exit: { x: 525, y: 735 },
    cameras: [{ x: 80, y: 80, enabled: true }]
  };
}

for (const person of people) {
  if (person.socialClass === 'wealthy' || person.rich) {
    person.rich = true;
    person.shirt = pick(['#26313e', '#44434a', '#263c43', '#6b5144']);
    person.outfitStyle = 'jacket';
  } else if (person.socialClass === 'working') {
    person.shirt = pick(['#59645d', '#65594b', '#4b5967', '#756048']);
  }
}

const originalBuyWithClothes = buy;
buy = function (id) {
  if (panelMode !== 'clothing-store') return originalBuyWithClothes(id);
  const outfit = apparelCatalog.find(item => item.id === id);
  if (!outfit) return false;
  if (S.money < outfit.price) {
    tell('Dinheiro insuficiente');
    return false;
  }
  S.money -= outfit.price;
  player.shirt = outfit.color;
  player.outfitStyle = outfit.style;
  player.outfitName = outfit.name;
  sound.play('buy');
  tell(outfit.name + ' comprado e vestido');
  refresh();
  return true;
};

const originalRefreshWithClothes = refresh;
refresh = function () {
  if (panelMode !== 'clothing-store') {
    originalRefreshWithClothes();
    return;
  }
  const grid = document.getElementById('inventory-grid');
  const detail = document.getElementById('inventory-detail');
  grid.innerHTML = '';
  grid.style.display = 'none';
  detail.innerHTML = '';
  document.getElementById('inventory-title').textContent =
    'Ateliê Urbano · R$ ' + S.money;
  document.getElementById('inventory-help').style.display = 'none';
  document.getElementById('use-button').style.display = 'none';
  document.getElementById('drop-button').style.display = 'none';
  const current = document.createElement('p');
  current.className = 'outfit-current';
  current.textContent = 'Vestindo: ' + (player.outfitName || 'Roupa básica');
  detail.appendChild(current);
  for (const outfit of apparelCatalog) {
    const row = document.createElement('div');
    row.className = 'catalog-row clothing-row';
    const swatch = document.createElement('span');
    swatch.className = 'clothing-swatch';
    swatch.style.backgroundColor = outfit.color;
    swatch.setAttribute('aria-hidden', 'true');
    const label = document.createElement('span');
    label.textContent = outfit.name + ' · R$ ' + outfit.price;
    const button = document.createElement('button');
    button.textContent = 'Comprar';
    button.disabled = player.outfitName === outfit.name;
    button.onclick = () => buy(outfit.id);
    row.append(swatch, label, button);
    detail.appendChild(row);
  }
};

const originalInteractWithClothes = interact;
interact = function () {
  if (S.venue === 'clothingStore' &&
      distance(player, { x: 525, y: 180 }) < 120) {
    openPanel('clothing-store');
    return true;
  }
  return originalInteractWithClothes();
};

const originalClothingVenueDraw = venueDraw;
venueDraw = function () {
  originalClothingVenueDraw();
  if (S.venue !== 'clothingStore') return;
  ctx.save();
  ctx.translate(-camera.x, -camera.y);
  for (const fixture of venues.clothingStore.furniture.slice(0, 4)) {
    round(fixture.x, fixture.y, fixture.w, fixture.h, 7, '#4d3e34');
    line(fixture.x + 12, fixture.y + 8, fixture.x + fixture.w - 12,
      fixture.y + 8, '#d7bd89', 2);
    for (let index = 0; index < 5; index++) {
      const x = fixture.x + 22 + index * 31;
      line(x, fixture.y + 9, x + 7, fixture.y + fixture.h - 4,
        ['#6b8791', '#805a6b', '#a88a5c', '#567663', '#a65d50'][index], 6);
    }
  }
  round(390, 155, 270, 60, 6, '#69513f');
  round(407, 165, 236, 43, 4, '#a99572');
  text('CAIXA · E PARA COMPRAR E TROCAR', 525, 187, 12, '#fff0bd', 700);
  round(430, 515, 190, 70, 8, '#78857d');
  oval(525, 498, 18, 30, '#6b8791');
  ctx.restore();
};

const originalChaseWithHelicopterAlert = driveChase;
driveChase = function (vehicle, dt) {
  if (vehicle.kind !== 'helicopter') {
    originalChaseWithHelicopterAlert(vehicle, dt);
    return;
  }
  if (place() !== 'world' || vehicle.dead || S.stars === 0) return;
  if (sight(vehicle, player, 1100)) {
    vehicle.lastKnownPlayer = { x: player.x, y: player.y, at: time };
    S.heliAlertUntil = time + 2;
  }
  const target = vehicle.lastKnownPlayer || player;
  const dx = target.x - vehicle.x;
  const dy = target.y - 320 - vehicle.y;
  const distanceToTarget = Math.hypot(dx, dy) || 1;
  const step = Math.min(distanceToTarget, vehicle.speed * dt);
  vehicle.angle = Math.atan2(dy, dx);
  vehicle.x += dx / distanceToTarget * step;
  vehicle.y += dy / distanceToTarget * step;
  vehicle.altitude = 54 + Math.sin(time * 2.1 + vehicle.x) * 5;
  vehicle.step += dt * 12;
};

const originalNpcShootForHeavyUnits = npcShoot;
npcShoot = function (officer, dt, kind) {
  originalNpcShootForHeavyUnits(
    officer, dt, officer.cavalry && kind === 'shotgun' ? 'rifle' : kind
  );
};

function functionalMapLocations() {
  const types = {
    hospital: 'hospital',
    bar: 'bar',
    gunshop: 'shop',
    station: 'police',
    bank: 'bank',
    desertBank: 'bank',
    supermarket: 'supermarket',
    clothing: 'clothing',
    coastGuard: 'coastguard',
    desertPolice: 'desertPolice'
  };
  const locations = Object.entries(venues)
    .filter(([, venue]) => venue.building?.solid && types[venue.kind])
    .map(([key, venue]) => ({
      building: venue.building,
      type: types[venue.kind],
      name: venue.name,
      key
    }));
  locations.push({
    building: FATEC,
    type: 'fatec',
    name: 'Fatec',
    key: 'fatec'
  });
  return locations;
}

mapTypes.clothing = ['✂', 'Loja de roupas', '#df9bb9'];
mapTypes.desertPolice = ['⚑', 'Quartel desértico', '#c8a86f'];

mapDraw = function () {
  rect(0, 0, width, height, '#091522f5');
  const worldWidth = WORLD.w - WORLD.minX;
  const worldHeight = WORLD.h - SEA_TOP;
  const top = width < 560 ? 126 : 104;
  const mapHeight = Math.min(height - top - 58,
    (width - 48) * worldHeight / worldWidth);
  const scale = mapHeight / worldHeight;
  const mapWidth = worldWidth * scale;
  const left = (width - mapWidth) / 2;
  const mapY = y => top + (y - SEA_TOP) * scale;
  const mapX = x => left + (x - WORLD.minX) * scale;
  text('MAPA DO MUNDO', width / 2, top - 42, 18, '#f5e8c9', 850);
  text('M / ESC · fechar', width / 2, top - 22, 10, '#9cb2bd', 600);
  round(left - 6, top - 6, mapWidth + 12, mapHeight + 12, 12, '#20313a');
  rect(left, top, mapWidth, mapHeight, '#82906a');

  const desertTop = mapY(SHORE);
  rect(mapX(WORLD.minX), desertTop, -WORLD.minX * scale,
    mapY(WORLD.h) - desertTop, '#c7a86f');
  rect(mapX(0), desertTop, WORLD.w * scale,
    mapY(WORLD.h) - desertTop, '#82906a');
  rect(mapX(0), mapY(SHORE), WORLD.w * scale,
    (1280 - SHORE) * scale, '#d6c69a');
  rect(left, top, mapWidth, (SHORE - SEA_TOP) * scale, '#347b99');
  rect(left, mapY(SHORE), mapWidth, 2, '#e9d8ae');
  rect(mapX(0) - 1, desertTop, 2,
    mapY(WORLD.h) - desertTop, '#e0cf9a');

  ctx.save();
  ctx.globalAlpha = .26;
  for (let wave = 0; wave < 9; wave++) {
    const y = SEA_TOP + 260 + wave * 390;
    ctx.strokeStyle = '#b2d8d5';
    ctx.lineWidth = Math.max(1, scale * 15);
    ctx.beginPath();
    ctx.moveTo(mapX(WORLD.minX), mapY(y));
    ctx.bezierCurveTo(mapX(-1800), mapY(y - 70),
      mapX(1200), mapY(y + 65), mapX(WORLD.w), mapY(y - 20));
    ctx.stroke();
  }
  ctx.restore();

  oval(mapX(ISLAND.x), mapY(ISLAND.y),
    ISLAND.rx * scale, ISLAND.ry * scale, '#d7c88e');
  oval(mapX(ISLAND.x), mapY(ISLAND.y),
    ISLAND.rx * .78 * scale, ISLAND.ry * .68 * scale, '#557b4d');

  for (const plant of DESERT_VEGETATION) {
    const color = plant.kind === 'cactus' ? '#6e814e' :
      plant.kind === 'shrub' ? '#8e8d55' : '#9a8769';
    oval(mapX(plant.x), mapY(plant.y),
      Math.max(1.2, plant.size * 1.6), Math.max(1, plant.size),
      color + 'd9');
  }
  for (const tree of trees) {
    oval(mapX(tree.x), mapY(tree.y),
      Math.max(1.4, tree.s * scale * .8),
      Math.max(1.2, tree.s * scale * .55), '#416b49');
  }

  rect(mapX(DESERT_RIVER.x - 12), mapY(DESERT_RIVER.y),
    (DESERT_RIVER.w + 24) * scale, DESERT_RIVER.h * scale, '#b7a176');
  rect(mapX(DESERT_RIVER.x), mapY(DESERT_RIVER.y),
    DESERT_RIVER.w * scale, DESERT_RIVER.h * scale, '#367f91');

  ctx.lineCap = 'butt';
  ctx.lineJoin = 'miter';
  for (const y of HY) {
    line(mapX(0), mapY(y + 50), mapX(WORLD.w), mapY(y + 50),
      '#c8bd9d', Math.max(3, 150 * scale));
    line(mapX(0), mapY(y + 50), mapX(WORLD.w), mapY(y + 50),
      '#36434a', Math.max(2, 100 * scale));
  }
  for (const x of VX) {
    line(mapX(x + 50), mapY(HY[0] + 50),
      mapX(x + 50), mapY(HY.at(-1) + 50),
      '#c8bd9d', Math.max(3, 150 * scale));
    line(mapX(x + 50), mapY(HY[0] + 50),
      mapX(x + 50), mapY(HY.at(-1) + 50),
      '#36434a', Math.max(2, 100 * scale));
  }

  drawDesertRoadNetwork(mapX, mapY, scale, scale);
  rect(mapX(DESERT_BRIDGE.x), mapY(DESERT_BRIDGE.y),
    DESERT_BRIDGE.w * scale, DESERT_BRIDGE.h * scale, '#806b4e');

  const locations = functionalMapLocations();
  for (const location of locations) {
    const building = location.building;
    const x = mapX(building.x);
    const y = mapY(building.y);
    const w = Math.max(4, building.w * scale);
    const h = Math.max(4, building.h * scale);
    const data = mapTypes[location.type];
    rect(x, y, w, h, data[2] + 'cc');
    const px = x + w / 2, py = y + h / 2;
    round(px - 8, py - 8, 16, 16, 4, '#122331');
    text(data[0], px, py, 11, data[2], 800);
    if (scale > .06) text(location.name, px, py + 18, 8, '#f4f0dc', 700);
  }

  text('DESERTO', mapX(-1470), mapY(1600), 11, '#6d5739', 850);
  text('CIDADE DESERTA', mapX(DESERT_TOWN.x + DESERT_TOWN.w / 2),
    mapY(DESERT_TOWN.y - 55), 9, '#5e4932', 800);
  text('CENTRO URBANO', mapX(4300), mapY(1650), 11, '#e6e1c9', 850);
  text('MAR', mapX(2200), mapY(-900), 11, '#d4e5e0', 800);
  text('FLORESTA', mapX(2800), mapY(4200), 10, '#e4e6be', 800);

  const mapPlayer = S.venue
    ? venues[S.venue]?.building
    : inside ? FATEC : null;
  const playerX = mapPlayer
    ? mapPlayer.x + mapPlayer.w / 2 : player.x;
  const playerY = mapPlayer
    ? mapPlayer.y + mapPlayer.h / 2 : player.y;
  for (const person of [...officers, ...people]) {
    if (person.dead || person.inCar || person.scene !== 'world') continue;
    if (!person.police && !person.special &&
        !person.important && !person.hostile) continue;
    const x = mapX(person.x);
    const y = mapY(person.y);
    oval(x, y, person.police && person.hostile ? 3 : 2,
      person.police && person.hostile ? 3 : 2,
      (person.special || person.important) && !person.police ? '#65baff' :
        person.police && person.hostile ? '#6fd4ff' :
          person.police || person.hostile ? '#ff6b68' : '#71d9a3');
  }
  for (const ally of [missionPenguin, ...snakes]) {
    if (!ally || ally.dead || ally.scene !== 'world') continue;
    oval(mapX(ally.x), mapY(ally.y), 3, 3, '#70df9c');
  }
  for (const vehicle of policeCars) {
    if (vehicle.dead || !vehicle.chase || vehicle.kind !== 'helicopter') continue;
    oval(mapX(vehicle.x), mapY(vehicle.y), 5, 5, '#8ee2ff');
  }
  oval(mapX(playerX), mapY(playerY), 5, 5, '#ffe47a');
  text('VOCÊ', mapX(playerX), mapY(playerY) - 12,
    8, '#fff1aa', 800);

  const legends = [
    ['■ Deserto', '#c7a86f'], ['■ Cidade', '#82906a'],
    ['■ Mar', '#5797ad'], ['★ Local', '#e7c461'],
    ['● Polícia', '#ff7770'], ['● Aliado', '#71d9a3']
  ];
  legends.forEach(([label, color], index) => {
    const x = width / 2 - 205 + index % 3 * 136;
    const y = Math.min(height - 30, top + mapHeight + 22 +
      Math.floor(index / 3) * 15);
    text(label, x + 68, y, 9, color, 700);
  });
};

drawMinimap = function () {
  if (mapOpen || panelMode || S.dead || S.blackout > 0) return;
  const compact = width < 560;
  const mapWidth = compact ? 168 : 202;
  const mapHeight = compact ? 126 : 152;
  const left = 14, top = compact ? 145 : 80;
  const centerX = S.vehicle?.x ?? player.x;
  const centerY = S.vehicle?.y ?? player.y;
  const rangeX = 2350, rangeY = 1750;
  const scaleX = (mapWidth - 14) / rangeX;
  const scaleY = (mapHeight - 14) / rangeY;
  const scene = place();
  const toMap = (x, y) => ({
    x: left + mapWidth / 2 + (x - centerX) * scaleX,
    y: top + mapHeight / 2 + (y - centerY) * scaleY
  });
  ctx.save();
  round(left + 3, top + 4, mapWidth, mapHeight, 9, '#000b');
  round(left, top, mapWidth, mapHeight, 9, '#0b1722f2');
  ctx.strokeStyle = '#d1e0e58c';
  ctx.lineWidth = 1;
  ctx.strokeRect(left + .5, top + .5, mapWidth - 1, mapHeight - 1);
  ctx.beginPath();
  ctx.rect(left + 5, top + 5, mapWidth - 10, mapHeight - 10);
  ctx.clip();

  if (scene === 'world') {
    rect(left + 5, top + 5, mapWidth - 10, mapHeight - 10, '#415844');
    const sea = toMap(centerX, SHORE);
    rect(left + 5, top + 5, mapWidth - 10, sea.y - (top + 5), '#28677f');
    const desertStart = toMap(WORLD.minX, SHORE);
    rect(desertStart.x, desertStart.y,
      (0 - WORLD.minX) * scaleX,
      (WORLD.h - SHORE) * scaleY, '#b99b6c');
    rect(toMap(0, SHORE).x, desertStart.y,
      WORLD.w * scaleX, (WORLD.h - SHORE) * scaleY, '#415844');
    rect(toMap(0, SHORE).x, desertStart.y,
      WORLD.w * scaleX, (1280 - SHORE) * scaleY, '#b6a987');
    oval(toMap(ISLAND.x, ISLAND.y).x, toMap(ISLAND.x, ISLAND.y).y,
      ISLAND.rx * scaleX, ISLAND.ry * scaleY, '#b9aa78');
    for (const x of VX) {
      const point = toMap(x + 50, centerY);
      rect(point.x - 2, toMap(x, HY[0]).y, 4,
        (HY.at(-1) + ROAD - HY[0]) * scaleY, '#27343bd9');
      rect(point.x - .5, toMap(x, HY[0]).y, 1,
        (HY.at(-1) + ROAD - HY[0]) * scaleY, '#d2bd7566');
    }
    for (const y of HY) {
      const point = toMap(centerX, y + 50);
      rect(toMap(0, y).x, point.y - 2,
        WORLD.w * scaleX, 4, '#27343bd9');
      rect(toMap(0, y).x, point.y - .5,
        WORLD.w * scaleX, 1, '#d2bd7566');
    }
    ctx.save();
    ctx.translate(left + mapWidth / 2 - centerX * scaleX,
      top + mapHeight / 2 - centerY * scaleY);
    ctx.scale(scaleX, scaleY);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    const traceDesertRoads = () => {
      ctx.beginPath();
      for (const segment of DESERT_ROAD_SEGMENTS) {
        if (segment.w >= segment.h) {
          const y = segment.y + segment.h / 2;
          ctx.moveTo(segment.x, y);
          ctx.lineTo(segment.x + segment.w, y);
        } else {
          const x = segment.x + segment.w / 2;
          ctx.moveTo(x, segment.y);
          ctx.lineTo(x, segment.y + segment.h);
        }
      }
      for (const curve of DESERT_CURVES) {
        ctx.moveTo(curve.from.x, curve.from.y);
        ctx.quadraticCurveTo(curve.control.x, curve.control.y,
          curve.to.x, curve.to.y);
      }
    };
    traceDesertRoads();
    ctx.strokeStyle = '#d9c79d';
    ctx.lineWidth = 128;
    ctx.stroke();
    traceDesertRoads();
    ctx.strokeStyle = '#655f54';
    ctx.lineWidth = 88;
    ctx.stroke();
    traceDesertRoads();
    ctx.strokeStyle = '#d2bd85b8';
    ctx.lineWidth = 6;
    ctx.setLineDash([48, 42]);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
    for (const plant of DESERT_VEGETATION) {
      const point = toMap(plant.x, plant.y);
      oval(point.x, point.y, 1.4, 1.2,
        plant.kind === 'cactus' ? '#738750' : '#9a875e');
    }
    for (const tree of trees) {
      const point = toMap(tree.x, tree.y);
      oval(point.x, point.y, 1.8, 1.4, '#6d925a');
    }
    for (const location of functionalMapLocations()) {
      const building = location.building;
      const point = toMap(building.x + building.w / 2,
        building.y + building.h / 2);
      const w = Math.max(3, building.w * scaleX);
      const h = Math.max(3, building.h * scaleY);
      const marker = {
        hospital: 'H', bar: 'B', shop: 'A', police: 'P',
        bank: '$', supermarket: 'M', clothing: 'R', fatec: 'F',
        coastguard: '⚓', desertPolice: 'D', militaryBase: 'X'
      }[location.type];
      rect(point.x - w / 2, point.y - h / 2, w, h,
        mapTypes[location.type][2] + 'd9');
      round(point.x - 3.2, point.y - 3.2, 6.4, 6.4, 2,
        '#122331');
      text(marker, point.x, point.y, 5, mapTypes[location.type][2], 900);
    }
  } else if (venues[scene]) {
    for (const fixture of venues[scene].furniture) {
      const point = toMap(fixture.x + fixture.w / 2,
        fixture.y + fixture.h / 2);
      rect(point.x - 2, point.y - 2,
        Math.max(3, fixture.w * scaleX),
        Math.max(3, fixture.h * scaleY), '#9aabb477');
    }
  }

  const nearby = [...officers, ...locals(scene), ...snakes].filter(person =>
    person && !person.dead && !person.inCar && person.scene === scene &&
    distance(person, { x: centerX, y: centerY }) < rangeX * .55
  );
  for (const person of nearby) {
    const point = toMap(person.x, person.y);
    let color;
    if (person.police) {
      color = person.hostile && S.stars > 0
        ? (Math.sin(time * 15) > 0 ? '#63caff' : '#ff5050')
        : (Math.sin(time * 9) > 0 ? '#ff5050' : '#9d343a');
    } else if ((person.special || person.important) && !person.hostile) color = '#65baff';
    else if (person.petPenguin || person.summoned ||
        person === missionPenguin) color = '#70df9c';
    else if (person.hostile) color = '#ff6864';
    else continue;
    oval(point.x, point.y, person.police ? 3.2 : 2.8,
      person.police ? 3.2 : 2.8, color);
  }
  for (const vehicle of policeCars) {
    if (vehicle.dead || !vehicle.chase || vehicle.scene !== scene ||
        distance(vehicle, { x: centerX, y: centerY }) > rangeX * .55) continue;
    const point = toMap(vehicle.x, vehicle.y);
    oval(point.x, point.y, vehicle.kind === 'helicopter' ? 5 : 3.2,
      vehicle.kind === 'helicopter' ? 5 : 3.2,
      vehicle.kind === 'helicopter' ? '#9ae9ff' : '#ff7770');
    if (vehicle.kind === 'helicopter') text('H', point.x, point.y, 7, '#122331', 900);
  }
  const playerPoint = toMap(centerX, centerY);
  if (S.heliAlertUntil > time) {
    ctx.strokeStyle = '#70d7ff';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(playerPoint.x, playerPoint.y, 8 + Math.sin(time * 9) * 2, 0,
      Math.PI * 2);
    ctx.stroke();
  }
  ctx.save();
  ctx.translate(playerPoint.x, playerPoint.y);
  ctx.rotate(facing());
  poly([[0, -6], [4, 5], [0, 3], [-4, 5]], '#fff0a5');
  ctx.restore();
  round(left + 7, top + 7, 42, 14, 3, '#101c27e8');
  text('RADAR', left + 28, top + 14, 8, '#f1d594', 800);
  const legendY = top + mapHeight - 8;
  oval(left + 10, legendY, 2.5, 2.5, '#ff6864');
  text('POLÍCIA', left + 30, legendY, 7, '#eaf3f5', 700);
  oval(left + 78, legendY, 2.5, 2.5, '#e5bf72');
  text('LOCAIS', left + 98, legendY, 7, '#eaf3f5', 700);
  oval(left + mapWidth - 53, legendY, 2.5, 2.5, '#70df9c');
  text('ALIADO', left + mapWidth - 32, legendY, 7, '#eaf3f5', 700);
  ctx.restore();
};

const originalDrawWithHelicopterAlert = draw;
draw = function () {
  originalDrawWithHelicopterAlert();
  if (place() !== 'world' || !(S.heliAlertUntil > time) ||
      mapOpen || panelMode) return;
  ctx.save();
  ctx.translate(-camera.x, -camera.y);
  ctx.strokeStyle = '#65cfffaa';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(player.x, player.y - 12, 26 + Math.sin(time * 8) * 5,
    0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
  const alertX = width < 760 ? width / 2 : width - 125;
  const alertY = width < 760 ? 126 : 76;
  round(alertX - 115, alertY - 13, 230, 26, 6, '#101c27e8');
  text('HELICÓPTERO · POSIÇÃO LOCALIZADA', alertX, alertY,
    width < 760 ? 9 : 10, '#9de6ff', 800);
};

const originalUpdateWithPenguinFollowing = update;
update = function (dt) {
  originalUpdateWithPenguinFollowing(dt);
  if (!missionPenguin || missionPenguin.dead || panelMode || mapOpen ||
      S.dead || S.blackout > 0) return;
  const scene = place();
  if (missionPenguin.scene === scene &&
      distance(missionPenguin, player) <= 420) return;
  const positions = [
    { x: player.x - 48, y: player.y + 24 },
    { x: player.x + 48, y: player.y + 24 },
    { x: player.x, y: player.y - 52 },
    { x: player.x, y: player.y + 52 }
  ];
  const position = positions.find(point =>
    !blocked(point.x, point.y, 10, scene)
  );
  if (!position) return;
  Object.assign(missionPenguin, position, {
    scene,
    kx: 0,
    ky: 0,
    swimming: scene === 'world' && isWater(position.x, position.y)
  });
};

const desertHomes = [
  { x: -2750, y: 2635, w: 270, h: 175, type: 'desertHome' },
  { x: -2320, y: 2635, w: 270, h: 175, type: 'desertStore' },
  { ...DESERT_POLICE_BASE, type: 'desertPolice' },
  { x: -2750, y: 3015, w: 270, h: 175, type: 'desertHome' },
  { x: -2320, y: 3015, w: 270, h: 175, type: 'desertBank' },
  { x: -1880, y: 3015, w: 270, h: 175, type: 'desertStore' },
  { x: -2750, y: 3390, w: 270, h: 160, type: 'desertHome' },
  { x: -2320, y: 3390, w: 270, h: 160, type: 'desertHome' },
  { x: -1880, y: 3390, w: 270, h: 160, type: 'desertHome' }
];
const builtDesertHomes = desertHomes.map((building, variant) => ({
  ...building, solid: true, variant: 100 + variant
}));
buildings.push(...builtDesertHomes);
const desertBankBuilding = builtDesertHomes.find(
  building => building.type === 'desertBank'
);
const desertPoliceBuilding = builtDesertHomes.find(
  building => building.type === 'desertPolice'
);
const desertPoliceParking = {
  ...DESERT_POLICE_PARKING, type: 'desertParking',
  solid: false, lot: true
};
buildings.push(desertPoliceParking);
venues.desertPolice = {
  kind: 'desertPolice',
  name: 'Quartel da Polícia Desértica',
  building: desertPoliceBuilding,
  w: 760,
  h: 580,
  color: '#b2a17c',
  furniture: [
    { x: 120, y: 150, w: 250, h: 48, solid: false },
    { x: 430, y: 150, w: 220, h: 48, solid: false },
    { x: 150, y: 330, w: 460, h: 18, solid: false }
  ],
  npcs: [
    Object.assign(makeOfficer(), {
      name: 'Sargento do deserto',
      desertPolice: true, shirt: '#b49a65',
      scene: 'desertPolice', x: 390, y: 235, stationary: true
    }),
    Object.assign(makeOfficer(), {
      name: 'Policial do deserto',
      desertPolice: true, shirt: '#b49a65',
      scene: 'desertPolice', x: 540, y: 340, stationary: true
    })
  ],
  exit: { x: 380, y: 520 },
  cameras: [{ x: 70, y: 75, enabled: true }]
};

const desertPoliceCars = [
  { kind: 'pickup', x: desertPoliceParking.x + 29,
    y: desertPoliceParking.y + 48, color: '#a38a58' },
  { kind: 'suv', x: desertPoliceParking.x + 61,
    y: desertPoliceParking.y + 112, color: '#756747' }
];
for (const vehicle of desertPoliceCars) {
  Object.assign(vehicle, {
    policeVehicle: true, desertPolice: true,
    parked: true, stopped: true, siren: false,
    speed: 90, step: 0, hp: 470, maxHp: 470,
    scene: 'world', occupants: [], chase: false, angle: Math.PI / 2
  });
  policeCars.push(vehicle);
}
for (let index = 0; index < 3; index++) {
  const officer = makeOfficer();
  Object.assign(officer, {
    name: 'Policial do deserto', desertPolice: true,
    shirt: '#b49a65', speed: 48, scene: 'world',
    hostile: false, stationary: false
  });
  const column = index % (DESERT_VX.length - 1);
  setCircuit(officer, rectangleRoute(
    DESERT_VX[column] + 50, DESERT_HY[0] + 50,
    DESERT_VX[column + 1] + 50, DESERT_HY[1] + 50
  ));
  officers.push(officer);
}
venues.desertBank = {
  kind: 'desertBank',
  name: 'Banco da Cidade Deserta',
  building: desertBankBuilding,
  w: 900,
  h: 700,
  color: '#b9976b',
  furniture: [
    { x: 125, y: 175, w: 245, h: 55, solid: false },
    { x: 525, y: 175, w: 245, h: 55, solid: false },
    { x: 180, y: 330, w: 540, h: 22, wall: true },
    { x: 180, y: 330, w: 20, h: 180, wall: true },
    { x: 700, y: 330, w: 20, h: 180, wall: true }
  ],
  npcs: [{
    ...appearance(),
    name: 'Caixa',
    scene: 'desertBank',
    x: 450,
    y: 245,
    stationary: true,
    vendor: true,
    step: 0
  }],
  exit: { x: 450, y: 635 },
  cameras: [{ x: 70, y: 80, enabled: true }]
};

const coastGuardBuilding = {
  ...COAST_GUARD_BASE,
  type: 'coastGuard', solid: true, variant: 0
};
buildings.push(coastGuardBuilding);
venues.coastGuard = {
  kind: 'coastGuard',
  name: 'Posto da Guarda-Marinha',
  building: coastGuardBuilding,
  w: 850,
  h: 650,
  color: '#819096',
  furniture: [
    { x: 125, y: 155, w: 240, h: 50, solid: false },
    { x: 495, y: 155, w: 230, h: 50, solid: false },
    { x: 110, y: 360, w: 250, h: 18, solid: false },
    { x: 500, y: 360, w: 240, h: 18, solid: false }
  ],
  npcs: [
    { ...makeOfficer(), name: 'Comandante marítimo',
      x: 425, y: 220, scene: 'coastGuard', stationary: true },
    { ...makeOfficer(), name: 'Guarda-marinha',
      x: 570, y: 345, scene: 'coastGuard', stationary: true }
  ],
  exit: { x: 425, y: 585 },
  cameras: [{ x: 75, y: 75, enabled: true }]
};

for (let index = 0; index < 2; index++) {
  policeCars.push({
    kind: 'boat',
    color: index ? '#254e68' : '#3a718e',
    marine: true,
    policeVehicle: true,
    coastGuard: true,
    stopped: true,
    parked: true,
    chase: false,
    speed: 0,
    hp: 650,
    maxHp: 650,
    scene: 'world',
    x: -245 + index * 115,
    y: 135 + index * 22,
    angle: index ? .08 : -.08,
    occupants: []
  });
}
for (let index = 0; index < 2; index++) {
  const guard = makeOfficer();
  Object.assign(guard, {
    name: index ? 'Guarda-marinha' : 'Comandante marítimo',
    marine: true,
    coastGuard: true,
    scene: 'world',
    x: -235 + index * 94,
    y: 500,
    stationary: true,
    shirt: '#174e68',
    outfitStyle: 'jacket'
  });
  officers.push(guard);
}

mapTypes.coastguard = ['⚓', 'Guarda-marinha', '#7cc8e7'];
mapTypes.bank = ['$', 'Banco', '#e7c461'];
mapTypes.arsenal = ['A', 'Arsenal militar', '#aa8559'];
mapTypes.desertParking = ['T', 'Estacionamento militar', '#59624c'];

const previousDrawGroundWithDesertCoast = drawGround;
drawGround = function () {
  previousDrawGroundWithDesertCoast();
  const building = coastGuardBuilding;
  if (visible(building.x + building.w / 2,
      building.y + building.h / 2, 60)) {
    const dockX = building.x + building.w / 2;
    rect(dockX - 18, 220, 36, 105, '#8a7554');
    for (let plank = 0; plank < 5; plank++) {
      line(dockX - 18, 230 + plank * 18,
        dockX + 18, 230 + plank * 18, '#d0b886', 2);
    }
    oval(dockX - 115, 245, 45, 10, '#e6d3ac');
    oval(dockX + 106, 250, 36, 9, '#e6d3ac');
  }
};

const originalDrawDesertPolice = drawHuman;
drawHuman = function (person) {
  originalDrawDesertPolice(person);
  if (!person.desertPolice || person.dead || person.inCar) return;
  ctx.save();
  ctx.translate(person.x, person.y);
  round(-9, -42, 18, 5, 2, '#927747');
  rect(-7, -39, 14, 2, '#d5bb78');
  oval(0, -39, 3, 2, '#ead59d');
  ctx.restore();
};

function spaceTrafficVehicle(vehicle) {
  if (!vehicle.route || vehicle.kind === 'boat' || vehicle.parked) return;
  const route = vehicle.route;
  const original = {
    x: vehicle.x, y: vehicle.y, index: vehicle.index,
    target: vehicle.target
  };
  const size = ['bus', 'truck', 'militaryTruck'].includes(vehicle.kind)
    ? 145 : 112;
  for (let attempt = 0; attempt < 80; attempt++) {
    const index = Math.floor(rand(0, route.length));
    const next = (index + 1) % route.length;
    const start = route[index], end = route[next];
    const progress = rand(.08, .92);
    vehicle.index = index;
    vehicle.target = next;
    vehicle.x = start.x + (end.x - start.x) * progress;
    vehicle.y = start.y + (end.y - start.y) * progress;
    const clear = vehicles.every(other => other === vehicle ||
      other.dead || other.kind === 'boat' ||
      distance(vehicle, other) >= Math.max(size,
        ['bus', 'truck', 'militaryTruck'].includes(other.kind) ? 145 : 112));
    if (clear) return;
  }
  Object.assign(vehicle, original);
}

for (const vehicle of vehicles) spaceTrafficVehicle(vehicle);

const desertTrafficKinds = [
  'pickup', 'van', 'truck', 'motorcycle',
  'car', 'suv', 'pickup', 'van'
];
for (let index = 0; index < desertTrafficKinds.length; index++) {
  const kind = desertTrafficKinds[index];
  const column = index % (DESERT_VX.length - 1);
  const row = Math.floor(index / 2) % (DESERT_HY.length - 1);
  const vehicle = {
    kind,
    color: pick(['#9d8053', '#b6a47d', '#6c7776', '#a7624c']),
    skin: pick(skins),
    speed: kind === 'truck' ? 65 :
      ['motorcycle', 'pickup'].includes(kind) ? 92 : 78,
    scene: 'world',
    step: 0,
    occupants: []
  };
  setCircuit(vehicle, rectangleRoute(
    DESERT_VX[column] + 50, DESERT_HY[row] + 50,
    DESERT_VX[column + 1] + 50, DESERT_HY[row + 1] + 50
  ));
  vehicles.push(vehicle);
  spaceTrafficVehicle(vehicle);
}

const previousInteractWithDesertServices = interact;
interact = function () {
  if (S.venue === 'desertBank' &&
      distance(player, { x: 450, y: 245 }) < 125) {
    if (S.money > 0) {
      S.bankBalance += S.money;
      tell('Depósito realizado · saldo R$ ' + S.bankBalance);
      S.money = 0;
    } else if (S.bankBalance > 0) {
      S.money = S.bankBalance;
      S.bankBalance = 0;
      tell('Saque realizado · R$ ' + S.money);
    } else {
      tell('Sua conta está sem saldo');
    }
    sound.play('buy');
    return true;
  }
  if (S.venue === 'coastGuard' &&
      distance(player, { x: 425, y: 220 }) < 135) {
    tell('Posto da Guarda-Marinha · patrulhas costeiras ativas');
    return true;
  }
  return previousInteractWithDesertServices();
};

const previousDesertVenueDraw = venueDraw;
venueDraw = function () {
  previousDesertVenueDraw();
  if (!['desertBank', 'coastGuard'].includes(S.venue)) return;
  const venue = venues[S.venue];
  ctx.save();
  ctx.translate(-camera.x, -camera.y);
  if (S.venue === 'desertBank') {
    round(235, 135, 430, 42, 5, '#70503a');
    text('BANCO DA CIDADE DESERTA', 450, 157, 17, '#f2d394', 900);
    round(270, 320, 360, 28, 4, '#795b3e');
    line(280, 325, 620, 325, '#e0c18c', 3);
    text('E · DEPOSITAR OU SACAR · SALDO R$ ' + S.bankBalance,
      450, 285, 12, '#5e4936', 800);
  } else {
    round(215, 115, 420, 42, 5, '#385665');
    text('GUARDA-MARINHA · BASE COSTEIRA', 425, 137,
      15, '#e6f0e9', 900);
    for (let index = 0; index < 2; index++) {
      const x = 225 + index * 360;
      round(x, 285, 210, 70, 8, '#5d777e');
      oval(x + 105, 320, 36, 12, '#a7c7c7');
      line(x + 55, 350, x + 155, 350, '#e3ded0', 3);
    }
    text('Patrulha da costa oeste', 425, 420, 13, '#d7e4e6', 700);
  }
  ctx.restore();
};

const drawVehicleBeforeBoatVariants = drawVehicle;
drawVehicle = function (vehicle) {
  if (vehicle.kind !== 'boat') {
    drawVehicleBeforeBoatVariants(vehicle);
    return;
  }
  ctx.save();
  ctx.translate(vehicle.x, vehicle.y);
  ctx.rotate(vehicle.angle || 0);
  const style = vehicle.boatStyle ||
    (vehicle.marine ? 'patrol' : 'fishing');
  const hull = vehicle.dead ? '#485860' :
    vehicle.color || '#9b7152';
  oval(-8, 8, style === 'ferry' ? 45 : 35, 10, '#dceee944');
  if (style === 'ferry') {
    poly([[-58, -22], [45, -22], [58, 0],
      [45, 22], [-58, 22]], hull);
    rect(-42, -15, 72, 30, '#dce2d4');
    rect(-25, -25, 40, 12, '#7f9ca4');
    for (let index = 0; index < 4; index++) {
      rect(-38 + index * 17, -11, 12, 8, '#8eb8c1');
      rect(-38 + index * 17, 3, 12, 8, '#8eb8c1');
    }
  } else if (style === 'patrol') {
    poly([[-45, -20], [24, -23], [53, 0],
      [24, 23], [-45, 20]], hull);
    poly([[-32, -14], [22, -16], [38, 0],
      [22, 16], [-32, 14]], '#dce2d4');
    round(-10, -12, 27, 24, 4, '#477a8b');
    rect(-35, -13, 9, 26, '#e5e0cb');
    text('MAR', 1, 0, 9, '#eaf2e8', 800);
  } else if (style === 'speedboat') {
    poly([[-38, -17], [30, -18], [52, 0],
      [30, 18], [-38, 17]], hull);
    poly([[-24, -11], [26, -12], [39, 0],
      [26, 12], [-24, 11]], '#90b4bd');
    round(-8, -9, 22, 18, 5, '#dfe9df');
    line(30, -13, 30, 13, '#d4d8c6', 2);
  } else {
    poly([[-45, -20], [24, -22], [52, 0],
      [24, 22], [-45, 20]], hull);
    poly([[-34, -14], [22, -16], [39, 0],
      [22, 16], [-34, 14]], '#dce2d4');
    round(-10, -11, 25, 22, 4, '#537f94');
    rect(-35, -15, 9, 30, '#656d6e');
  }
  if (vehicle.driver === player) oval(-15, 0, 6, 6, player.skin);
  if (vehicle.policeVehicle && vehicle.siren) {
    rect(-6, -5, 12, 10,
      Math.sin(time * 12) > 0 ? '#e65e5e' : '#5c9cde');
  }
  ctx.restore();
};

vehicles.filter(vehicle => vehicle.kind === 'boat')
  .forEach((vehicle, index) => {
    vehicle.boatStyle = ['fishing', 'speedboat', 'ferry'][index % 3];
  });

const previousRoadWithMilitaryRoute = road;
road = function (x, y) {
  if (x >= DESERT_EDGE_X) return previousRoadWithMilitaryRoute(x, y);
  const onSegment = DESERT_ROAD_SEGMENTS.some(segment =>
    x >= segment.x && x <= segment.x + segment.w &&
    y >= segment.y && y <= segment.y + segment.h
  );
  const onCurve = DESERT_CURVES.some(curve => {
    let previous = curve.from;
    for (let step = 1; step <= 24; step++) {
      const t = step / 24, u = 1 - t;
      const point = {
        x: u * u * curve.from.x + 2 * u * t * curve.control.x +
          t * t * curve.to.x,
        y: u * u * curve.from.y + 2 * u * t * curve.control.y +
          t * t * curve.to.y
      };
      const dx = point.x - previous.x, dy = point.y - previous.y;
      const length = dx * dx + dy * dy;
      const projection = length ?
        clamp(((x - previous.x) * dx + (y - previous.y) * dy) /
          length, 0, 1) : 0;
      if (Math.hypot(x - previous.x - projection * dx,
        y - previous.y - projection * dy) <= ROAD / 2) return true;
      previous = point;
    }
    return false;
  });
  return onSegment || onCurve;
};

const militaryBaseBuilding = {
  ...DESERT_MILITARY_BASE,
  type: 'militaryBase',
  name: 'Área Militar',
  solid: false
};
const militaryStructures = [
  {
    x: DESERT_MILITARY_BASE.x + 65,
    y: DESERT_MILITARY_BASE.y + 145,
    w: 310, h: 175, type: 'militaryBarracks'
  },
  {
    x: DESERT_MILITARY_BASE.x + 405,
    y: DESERT_MILITARY_BASE.y + 155,
    w: 260, h: 160, type: 'militaryBarracks'
  },
  {
    x: DESERT_MILITARY_BASE.x + 28,
    y: DESERT_MILITARY_BASE.y + 28,
    w: 55, h: 90, type: 'watchtower'
  },
  {
    x: DESERT_MILITARY_BASE.x + 1020,
    y: DESERT_MILITARY_BASE.y + 30,
    w: 55, h: 90, type: 'watchtower'
  },
  {
    x: DESERT_MILITARY_BASE.x + 1020,
    y: DESERT_MILITARY_BASE.y + 800,
    w: 55, h: 90, type: 'watchtower'
  },
  {
    x: DESERT_MILITARY_BASE.x + 700,
    y: DESERT_MILITARY_BASE.y + 165,
    w: 320, h: 170, type: 'arsenal'
  },
  {
    x: DESERT_MILITARY_BASE.x + 65,
    y: DESERT_MILITARY_BASE.y + 430,
    w: 875, h: 375, type: 'desertParking'
  },
  {
    x: DESERT_MILITARY_BASE.x + 25,
    y: DESERT_MILITARY_BASE.y + 800,
    w: 55, h: 90, type: 'watchtower'
  }
].map((building, index) => ({
  ...building,
  name: building.type === 'watchtower' ? 'Torre de vigia' :
    building.type === 'arsenal' ? 'Arsenal militar' :
      building.type === 'desertParking' ? 'Estacionamento militar' :
        'Alojamento militar',
  solid: true,
  variant: 200 + index
}));
buildings.push(militaryBaseBuilding, ...militaryStructures);

mapTypes.militaryBase = ['X', 'Área militar', '#c4c58a'];
const previousFunctionalLocationsWithMilitary = functionalMapLocations;
functionalMapLocations = function () {
  return [
    ...previousFunctionalLocationsWithMilitary(),
    {
      building: militaryBaseBuilding,
      type: 'militaryBase',
      name: 'Área Militar',
      key: 'militaryBase'
    }
  ];
};

const akWeapons = {
  ak47: {
    ...goods.rifle, name: 'AK-47', price: 1400
  },
  fuzil: {
    ...goods.rifle, name: 'Fuzil de assalto', price: 1750
  }
};
Object.assign(goods, akWeapons);
const previousIconWithMilitaryWeapons = icon;
icon = function (id, x, y, scale = 1) {
  if (id === 'ak47' || id === 'fuzil') {
    previousIconWithMilitaryWeapons('rifle', x, y, scale);
    if (id === 'ak47') {
      line(x - 9 * scale, y + 6 * scale,
        x + 7 * scale, y + 6 * scale, '#c98d4b', 2 * scale);
    }
    return;
  }
  previousIconWithMilitaryWeapons(id, x, y, scale);
};

drop('ak47', DESERT_MILITARY_BASE.x + 125,
  DESERT_MILITARY_BASE.y + 385, 'world', { ammo: 30 });
drop('fuzil', DESERT_MILITARY_BASE.x + 250,
  DESERT_MILITARY_BASE.y + 385, 'world', { ammo: 20 });
for (let index = 0; index < 3; index++) {
  drop('rifleMag', DESERT_MILITARY_BASE.x + 125 + index * 64,
    DESERT_MILITARY_BASE.y + 430, 'world');
}

for (let index = 0; index < 24; index++) {
  let animal;
  for (let attempt = 0; attempt < 30 && !animal; attempt++) {
    const x = rand(WORLD.minX + 70, -75);
    const y = rand(650, WORLD.h - 70);
    if (road(x, y) || blockedOutside(x, y, 18)) continue;
    const kind = pick(['camel', 'fox', 'scorpion', 'bird']);
    animal = {
      x, y,
      zone: {
        x: WORLD.minX + 20, y: 600,
        w: -WORLD.minX - 40, h: WORLD.h - 650
      },
      kind,
      angle: rand(0, Math.PI * 2),
      speed: kind === 'camel' ? rand(12, 20) : rand(18, 30),
      turn: rand(1, 4),
      step: 0,
      color: kind === 'camel' ? '#b7905e' :
        kind === 'scorpion' ? '#574434' :
          kind === 'bird' ? '#79674c' : '#9a7958'
    };
  }
  if (animal) animals.push(animal);
}

const sharkZone = {
  x: ISLAND.x - 1000, y: -3400, w: 2000, h: 1750
};
for (let index = 0; index < 8; index++) {
  const angle = index * Math.PI / 4;
  const x = ISLAND.x + Math.cos(angle) * (ISLAND.rx + 220);
  const y = ISLAND.y + Math.sin(angle) * (ISLAND.ry + 240);
  animals.push({
    x, y, zone: sharkZone, kind: 'shark',
    angle: angle + Math.PI / 2,
    speed: rand(22, 38), turn: rand(1, 4),
    step: 0, color: '#56666a'
  });
}

for (let index = 0; index < 2; index++) {
  const guard = makeOfficer(false, true);
  Object.assign(guard, {
    name: index ? 'Soldado do perímetro' : 'Sentinela',
    police: false, military: true, militaryRank: 'soldier',
    shirt: '#596548', outfitStyle: 'jacket', helmet: true,
    speed: 58, hp: 150, maxHp: 150, armor: 40,
    scene: 'world', hostile: false, dispatched: false,
    x: DESERT_MILITARY_BASE.x + 460,
    y: DESERT_MILITARY_BASE.y + 355 + index * 90,
    stationary: true
  });
  officers.push(guard);
}

let militaryIntrusionReported = false;
let militaryAlert = false;
let militaryResponseTimer = 0;
let militaryConvoyTimer = 65;
const militaryVehicles = [];
const militarySoldiers = [];

function createMilitaryVehicle(kind, x, y, response = false) {
  const vehicle = {
    kind, military: true,
    color: kind === 'tank' ? '#586348' :
      kind === 'militaryTruck' ? '#66704d' : '#555f47',
    policeVehicle: response,
    siren: response,
    chase: response,
    swat: response,
    scene: 'world',
    speed: kind === 'tank' ? 100 :
      kind === 'militaryTruck' ? 132 : 155,
    hp: kind === 'tank' ? 2200 :
      kind === 'militaryTruck' ? 1050 : 780,
    maxHp: kind === 'tank' ? 2200 :
      kind === 'militaryTruck' ? 1050 : 780,
    armor: kind === 'tank' ? 900 : 250,
    step: 0, angle: -Math.PI / 2, x, y,
    stopped: false, dead: false, occupants: [],
    shotClock: 2.5
  };
  if (response) {
    policeCars.push(vehicle);
    militaryVehicles.push(vehicle);
  }
  return vehicle;
}

for (let index = 0; index < 12; index++) {
  const row = Math.floor(index / 4);
  const col = index % 4;
  const kind = row === 0 ? 'tank' :
    row === 1 ? 'militaryTruck' : 'militaryCar';
  const vehicle = createMilitaryVehicle(
    kind,
    DESERT_MILITARY_BASE.x + 175 + col * 185,
    DESERT_MILITARY_BASE.y + 490 + row * 95
  );
  vehicle.parked = true;
  vehicle.stopped = true;
  vehicles.push(vehicle);
}

for (let group = 0; group < 2; group++) {
  const patrolRoute = group === 0 ? [
    { x: DESERT_VX[0] + 50, y: DESERT_HY[1] + 50 },
    { x: DESERT_VX[3] + 50, y: DESERT_HY[1] + 50 },
    { x: DESERT_VX[3] + 50, y: DESERT_HY[2] + 50 },
    { x: DESERT_VX[0] + 50, y: DESERT_HY[2] + 50 }
  ] : [
    { x: VX[5] + 50, y: HY[4] + 50 },
    { x: VX[8] + 50, y: HY[4] + 50 },
    { x: VX[8] + 50, y: HY[6] + 50 },
    { x: VX[5] + 50, y: HY[6] + 50 }
  ];
  for (let index = 0; index < 4; index++) {
    const soldier = makeOfficer(false, true);
    Object.assign(soldier, {
      name: 'Patrulha do Exército',
      police: false, military: true, militaryRank: 'soldier',
      shirt: '#596548', outfitStyle: 'jacket', helmet: true,
      speed: 42, hp: 220, maxHp: 220, armor: 75,
      scene: 'world', hostile: false, dispatched: false,
      stationary: false, patrolGroup: group
    });
    setCircuit(soldier, patrolRoute);
    officers.push(soldier);
  }
}

function spawnMilitaryConvoy() {
  const road = DESERT_MILITARY_ROAD;
  const route = [
    { x: road.x, y: road.turnY },
    { x: road.x, y: 3330 },
    { x: DESERT_CONNECTOR.x, y: 3330 },
    { x: DESERT_CONNECTOR.x, y: DESERT_CONNECTOR.endY },
    { x: 4970, y: DESERT_CONNECTOR.endY },
    { x: 4970, y: 3070 },
    { x: 470, y: 3070 },
    { x: 470, y: DESERT_CONNECTOR.endY },
    { x: 0, y: DESERT_CONNECTOR.endY },
    { x: DESERT_CONNECTOR.x, y: DESERT_CONNECTOR.endY },
    { x: DESERT_CONNECTOR.x, y: 3330 },
    { x: road.x, y: 3330 },
    { x: road.x, y: road.turnY }
  ];
  const truck = createMilitaryVehicle(
    'militaryTruck', road.x, road.turnY
  );
  truck.ambientMilitary = true;
  truck.route = route;
  truck.index = 0;
  truck.target = 1;
  truck.x = route[0].x;
  truck.y = route[0].y;
  vehicles.push(truck);
  return truck;
}

function spawnMilitaryResponse() {
  const road = DESERT_MILITARY_ROAD;
  const startX = road.x;
  const startY = DESERT_MILITARY_BASE.y - 60;
  const kinds = ['tank', 'militaryTruck', 'militaryCar'];
  kinds.forEach((kind, index) => {
    const vehicle = createMilitaryVehicle(
      kind, startX, startY - index * 150, true
    );
    vehicle.ram = true;
  });

  for (let index = 0; index < 5; index++) {
    if (militarySoldiers.filter(soldier => !soldier.dead).length >= 24) break;
    const general = index === 0 && militarySoldiers.length === 0;
    const soldier = makeOfficer(false, true);
    Object.assign(soldier, {
      name: general ? 'General do Exército' : 'Soldado do Exército',
      police: false, military: true,
      militaryRank: general ? 'general' : 'soldier',
      shirt: general ? '#48513b' : '#596548',
      outfitStyle: 'jacket', helmet: true,
      speed: general ? 92 : 72,
      hp: general ? 300 : 180,
      maxHp: general ? 300 : 180,
      armor: general ? 140 : 75,
      scene: 'world', hostile: true, dispatched: true,
      inCar: false, stationary: false,
      x: startX + (index - 2) * 32,
      y: startY + 45 + index * 12,
      shotClock: rand(.1, 1)
    });
    militarySoldiers.push(soldier);
    officers.push(soldier);
  }
}

function militaryUpdate(dt) {
  if (place() === 'world') {
    militaryConvoyTimer -= dt;
    if (militaryConvoyTimer <= 0) {
      if (vehicles.filter(vehicle =>
        vehicle.ambientMilitary && !vehicle.dead
      ).length < 3) spawnMilitaryConvoy();
      militaryConvoyTimer = rand(85, 145);
    }
  }

  const insideRestrictedArea =
    player.x < DESERT_MILITARY_BASE.x + DESERT_MILITARY_BASE.w - 24 &&
    player.x > DESERT_MILITARY_BASE.x + 20 &&
    player.y > DESERT_MILITARY_BASE.y + 25 &&
    player.y < DESERT_MILITARY_BASE.y + DESERT_MILITARY_BASE.h - 24;
  if (insideRestrictedArea && !militaryIntrusionReported) {
    militaryIntrusionReported = true;
    for (const guard of officers.filter(officer =>
      officer.military && officer.militaryRank === 'soldier' &&
      !militarySoldiers.includes(officer)
    )) {
      guard.hostile = true;
      guard.dispatched = true;
    }
    raiseWanted(Math.max(1, S.stars));
    tell('Área restrita · soldados em alerta');
  }

  if (!militaryAlert && S.stars <= 0 && militaryIntrusionReported) {
    militaryIntrusionReported = false;
    for (const guard of officers.filter(officer => officer.military)) {
      guard.hostile = false;
      guard.dispatched = false;
    }
  }

  if (militaryAlert && S.stars <= 0) {
    militaryAlert = false;
    militaryResponseTimer = 0;
    militaryIntrusionReported = false;
    for (const soldier of militarySoldiers) {
      soldier.hostile = false;
      soldier.dispatched = false;
    }
    for (const guard of officers.filter(officer =>
      officer.military && !militarySoldiers.includes(officer))) {
      guard.hostile = false;
      guard.dispatched = false;
    }
    for (const vehicle of militaryVehicles) {
      vehicle.chase = false;
      vehicle.siren = false;
      vehicle.stopped = true;
    }
  }

  if (!militaryAlert || S.stars <= 0) return;
  militaryResponseTimer -= dt;
  if (militaryResponseTimer <= 0) {
    if (militaryVehicles.filter(vehicle =>
      !vehicle.dead && vehicle.chase
    ).length < 9) spawnMilitaryResponse();
    militaryResponseTimer = 24;
    if (militaryAlert) {
      tell('Exército mobilizado · blindados e tropa a caminho');
    }
  }

  for (const tank of militaryVehicles) {
    if (tank.dead || tank.kind !== 'tank' ||
        place() !== 'world') continue;
    tank.shotClock -= dt;
    if (tank.shotClock <= 0 && distance(tank, player) < 950 &&
        sight(tank, player)) {
      const aim = Math.atan2(player.y - tank.y, player.x - tank.x);
      fire(tank, aim, true, 'launcher');
      tank.shotClock = 5;
    }
  }
}

const previousCrimeWithMilitaryResponse = crime;
crime = function (kind, victim = null, options = {}) {
  const event = previousCrimeWithMilitaryResponse(kind, victim, options);
  if (S.stars >= 10 && !militaryAlert) {
    militaryAlert = true;
    militaryResponseTimer = 0;
    tell('Nível máximo de procurado · o Exército foi acionado');
  }
  return event;
};

const previousMarineResponse = spawnResponse;
spawnResponse = function (swat = false, marine = false) {
  const vehicle = previousMarineResponse(swat, marine);
  if (!marine) return vehicle;
  vehicle.boatStyle = S.stars >= 8 ? 'ferry' :
    S.stars >= 4 ? 'speedboat' : 'patrol';
  vehicle.level = S.stars;
  vehicle.speed = 205 + S.stars * 9;
  vehicle.maxHp = vehicle.hp = 700 + S.stars * 90;
  const crewSize = S.stars >= 8 ? 4 : S.stars >= 5 ? 3 : 2;
  while (vehicle.occupants.length < crewSize) {
    const guard = makeOfficer(false, S.stars >= 8);
    Object.assign(guard, {
      name: 'Guarda-marinha', marine: true,
      responseUnit: true, responseRole: 'marine',
      x: vehicle.x, y: vehicle.y, hostile: true,
      dispatched: true, inCar: true, car: vehicle,
      driver: false
    });
    vehicle.occupants.push(guard);
    officers.push(guard);
  }
  return vehicle;
};

const previousDispatchWithMarineGrowth = dispatchTick;
dispatchTick = function (dt) {
  if (S.stars > 0 && place() === 'world' && player.y < SHORE) {
    S.dispatch -= dt;
    if (S.dispatch > 0) return;
    S.dispatch = Math.max(1.3, 3.8 - S.stars * .2);
    const activeBoats = policeCars.filter(vehicle =>
      vehicle.marine && vehicle.chase && !vehicle.dead
    ).length;
    const targetBoats = Math.min(6, Math.ceil(S.stars * .6));
    if (activeBoats < targetBoats) spawnResponse(false, true);
    return;
  }
  previousDispatchWithMarineGrowth(dt);
};

const previousDriveChaseWithArmy = driveChase;
driveChase = function (vehicle, dt) {
  if (!vehicle.military) {
    previousDriveChaseWithArmy(vehicle, dt);
    return;
  }
  if (place() !== 'world' || S.stars <= 0 || vehicle.dead) return;
  const dx = player.x - vehicle.x;
  const dy = player.y - vehicle.y;
  const distanceToPlayer = Math.hypot(dx, dy);
  if (distanceToPlayer < 75) return;
  const targetAngle = Math.atan2(dy, dx);
  for (const offset of [0, .45, -.45, .9, -.9, 1.5, -1.5, Math.PI]) {
    const angle = targetAngle + offset;
    const step = Math.min(vehicle.speed * dt, distanceToPlayer);
    const x = vehicle.x + Math.cos(angle) * step;
    const y = vehicle.y + Math.sin(angle) * step;
    if (vehicleBlocked(vehicle, x, y)) continue;
    vehicle.angle = angle;
    vehicle.x = x;
    vehicle.y = y;
    break;
  }
};

const previousUpdateWithMilitary = update;
update = function (dt) {
  previousUpdateWithMilitary(dt);
  militaryUpdate(dt);
};

const previousUpdateWithCarHitkill = update;
update = function (dt) {
  previousUpdateWithCarHitkill(dt);
  if (S.dead || S.vehicle || place() !== 'world') return;
  const impact = [...vehicles, ...policeCars].find(vehicle =>
    !vehicle.dead && !vehicle.stopped && !trafficStop(vehicle) &&
    (vehicle.driver === player
      ? Math.abs(vehicle.velocity || 0) > 35
      : vehicle.kind !== 'bike') &&
    carHit(vehicle, player)
  );
  if (!impact) return;
  S.dead = true;
  die(player,
    Math.cos(impact.angle || 0) * 1100,
    Math.sin(impact.angle || 0) * 1100);
  keys.clear();
  interactRequested = false;
  S.attack = 0;
  S.reload = 0;
  S.reloadItem = null;
};

const previousDrawVehicleWithMilitary = drawVehicle;
drawVehicle = function (vehicle) {
  if (!vehicle.military) {
    previousDrawVehicleWithMilitary(vehicle);
    return;
  }
  ctx.save();
  ctx.translate(vehicle.x, vehicle.y);
  ctx.rotate(vehicle.angle || 0);
  if (vehicle.kind === 'tank') {
    round(-56, -25, 112, 50, 9, '#30392f');
    round(-45, -19, 90, 38, 7, '#586348');
    rect(-14, -5, 48, 10, '#48523e');
    oval(-7, 0, 19, 15, '#687451');
    oval(-7, 0, 12, 10, '#46523e');
    rect(5, -3, 54, 6, '#414a39');
    for (let x = -44; x <= 44; x += 16) {
      oval(x, -24, 5, 5, '#a2a27c');
      oval(x, 24, 5, 5, '#a2a27c');
    }
    if (vehicle.policeVehicle && vehicle.siren) {
      rect(-14, -4, 8, 8,
        Math.sin(time * 12) > 0 ? '#e65e5e' : '#5c9cde');
    }
  } else if (vehicle.kind === 'militaryTruck') {
    round(-52, -18, 104, 36, 5, '#586548');
    rect(-48, -14, 53, 28, '#686f52');
    rect(13, -13, 30, 26, '#718078');
    rect(17, -10, 21, 12, '#a1b5b0');
    rect(-43, -22, 16, 5, '#303a30');
    rect(30, -22, 16, 5, '#303a30');
    rect(-43, 17, 16, 5, '#303a30');
    rect(30, 17, 16, 5, '#303a30');
    line(-39, 0, -7, 0, '#d0c493', 2);
  } else {
    round(-38, -16, 76, 32, 7, '#59664b');
    round(-16, -12, 35, 24, 6, '#7b8a83');
    rect(-12, -9, 20, 10, '#a1b6ae');
    for (const x of [-25, 25]) {
      oval(x, -16, 7, 4, '#303a30');
      oval(x, 16, 7, 4, '#303a30');
    }
    rect(7, -2, 28, 4, '#46513c');
  }
  if (vehicle.policeVehicle && vehicle.siren &&
      vehicle.kind !== 'tank') {
    rect(-5, -4, 10, 8,
      Math.sin(time * 12) > 0 ? '#e65e5e' : '#5c9cde');
  }
  ctx.restore();
};

let playerCanSwimAcrossRiver = false;
const blockedOutsideBeforeRiverSwimming = blockedOutside;
blockedOutside = function (x, y, radius = 11) {
  const touchesRiver = x + radius > DESERT_RIVER.x &&
    x - radius < DESERT_RIVER.x + DESERT_RIVER.w &&
    y + radius > DESERT_RIVER.y &&
    y - radius < DESERT_RIVER.y + DESERT_RIVER.h;
  if (playerCanSwimAcrossRiver && touchesRiver) {
    return previousBlockedOutsideWithRiver(x, y, radius);
  }
  return blockedOutsideBeforeRiverSwimming(x, y, radius);
};

const updatePlayerBeforeRiverSwimming = updatePlayer;
updatePlayer = function (dt) {
  playerCanSwimAcrossRiver = place() === 'world' && !S.vehicle &&
    player.y + 55 > DESERT_RIVER.y &&
    player.y - 55 < DESERT_RIVER.y + DESERT_RIVER.h &&
    player.x + 55 > DESERT_RIVER.x &&
    player.x - 55 < DESERT_RIVER.x + DESERT_RIVER.w;
  try {
    updatePlayerBeforeRiverSwimming(dt);
  } finally {
    playerCanSwimAcrossRiver = false;
  }
};

const vehicleBlockedBeforeRiverBridge = vehicleBlocked;
vehicleBlocked = function (vehicle, x, y) {
  if (vehicle.kind === 'boat') {
    return vehicleBlockedBeforeRiverBridge(vehicle, x, y);
  }
  const onBridge = x + 20 > DESERT_BRIDGE.x &&
    x - 20 < DESERT_BRIDGE.x + DESERT_BRIDGE.w &&
    y + 20 > DESERT_BRIDGE.y &&
    y - 20 < DESERT_BRIDGE.y + DESERT_BRIDGE.h;
  if (onBridge) {
    return blockedOutside(x, y,
      ['bike', 'motorcycle'].includes(vehicle.kind) ? 9 :
        ['truck', 'bus', 'militaryTruck', 'tank'].includes(vehicle.kind) ?
          21 : 16);
  }
  return isWater(x, y) || blockedOutside(x, y,
    ['bike', 'motorcycle'].includes(vehicle.kind) ? 9 :
      ['truck', 'bus', 'militaryTruck', 'tank'].includes(vehicle.kind) ?
        21 : 16);
};

const vehicleContactBeforeSpeedDamage = vehicleContact;
vehicleContact = function (vehicle, person, rng = Math.random) {
  if (vehicle.driver !== player) {
    return vehicleContactBeforeSpeedDamage(vehicle, person, rng);
  }
  vehicle.contacts ??= new Set();
  if (!carHit(vehicle, person)) {
    vehicle.contacts.delete(person);
    return false;
  }
  if (vehicle.contacts.has(person) || person.dead || person.inCar) {
    return false;
  }
  if (person === nicolas) {
    vehicle.contacts.add(person);
    launchBike(person, vehicle);
    sound.play('crash', person);
    return true;
  }

  const speed = Math.abs(vehicle.velocity || 0);
  if (speed < 15) return false;
  vehicle.contacts.add(person);
  const mass = ['bus', 'truck', 'militaryTruck', 'tank'].includes(vehicle.kind)
    ? 1.2 : 1;
  const damage = Math.round(speed * .9 * mass);
  hurt(person, damage, player, 'vehicle');
  if (person.dead && !person.police && !person.guard &&
      !animals.includes(person) && !person.dog && person !== linux &&
      !bodies.includes(person)) {
    bodies.push(person);
  }
  sound.play('crash', person);
  return true;
};

function chaseCanMoveOffRoad(vehicle, x, y) {
  if (vehicle.kind === 'helicopter') {
    return x > WORLD.minX + 30 && x < WORLD.w - 30 &&
      y > SEA_TOP + 30 && y < WORLD.h - 30;
  }
  if (y < SHORE && y > SEA_TOP && !onIsland(x, y)) return false;
  return !blockedOutside(x, y,
    ['truck', 'bus', 'militaryTruck', 'tank'].includes(vehicle.kind) ?
      21 : 16);
}

const driveChaseBeforeOffRoadPursuit = driveChase;
driveChase = function (vehicle, dt) {
  if (vehicle.kind === 'boat') {
    driveChaseBeforeOffRoadPursuit(vehicle, dt);
    return;
  }
  if (place() !== 'world' || vehicle.dead || S.stars === 0) return;
  const dx = player.x - vehicle.x;
  const dy = player.y - vehicle.y;
  const distanceToPlayer = Math.hypot(dx, dy);
  if (vehicle.swat && distanceToPlayer < 280) {
    vehicle.stopped = true;
    for (const officer of [...vehicle.occupants]) {
      if (!officer.driver) exitCar(officer);
    }
    return;
  }
  if (!vehicle.ram && !S.vehicle && distanceToPlayer < 210) {
    vehicle.stopped = true;
    for (const officer of [...vehicle.occupants]) exitCar(officer);
    return;
  }
  let target = { x: player.x, y: player.y };
  const vehicleSide = vehicle.x < DESERT_RIVER.x ? -1 :
    vehicle.x > DESERT_RIVER.x + DESERT_RIVER.w ? 1 : 0;
  const playerSide = player.x < DESERT_RIVER.x ? -1 :
    player.x > DESERT_RIVER.x + DESERT_RIVER.w ? 1 : 0;
  const mustCrossRiver = vehicleSide !== 0 && playerSide !== 0 &&
    vehicleSide !== playerSide && vehicle.kind !== 'helicopter';
  if (mustCrossRiver) {
    target = {
      x: DESERT_RIVER.x + DESERT_RIVER.w / 2,
      y: DESERT_BRIDGE.y + DESERT_BRIDGE.h / 2
    };
  }
  const routeDx = target.x - vehicle.x;
  const routeDy = target.y - vehicle.y;
  const routeDistance = Math.hypot(routeDx, routeDy);
  if (routeDistance < 48 && !mustCrossRiver ||
      routeDistance < 28 && mustCrossRiver) return;

  const targetAngle = Math.atan2(routeDy, routeDx);
  const offsets = [0, .45, -.45, .9, -.9, 1.35, -1.35,
    1.8, -1.8, 2.35, -2.35, Math.PI];
  const travel = Math.min(vehicle.speed * dt, distanceToPlayer);
  let choice = null;
  for (const offset of offsets) {
    const angle = targetAngle + offset;
    const nextX = vehicle.x + Math.cos(angle) * travel;
    const nextY = vehicle.y + Math.sin(angle) * travel;
    if (!chaseCanMoveOffRoad(vehicle, nextX, nextY)) continue;
    const remaining = Math.hypot(target.x - nextX, target.y - nextY);
    const score = remaining + Math.abs(offset) * 15;
    if (!choice || score < choice.score) {
      choice = { angle, nextX, nextY, score };
    }
  }
  if (choice) {
    vehicle.angle = choice.angle;
    vehicle.x = choice.nextX;
    vehicle.y = choice.nextY;
    vehicle.stopped = false;
  }
  vehicle.step += dt * 10;

  if (S.vehicle && !S.vehicle.dead &&
      (vehicle.kind === 'boat') === (S.vehicle.kind === 'boat') &&
      distance(vehicle, S.vehicle) < 42 &&
      (vehicle.hitCooldown || 0) <= 0) {
    damageVehicle(S.vehicle, 18);
    damageVehicle(vehicle, 8);
    S.vehicle.velocity *= .6;
    vehicle.hitCooldown = 1;
  }
  vehicle.hitCooldown = Math.max(0, (vehicle.hitCooldown || 0) - dt);
};
