'use strict';
// Sad little voxel characters for SadPad, built from cubes in a 32 x 48 x 32 grid from a server secret.
// Eight original characters in two teams. Weepers cry (rain cloud, ghost, clown, onion). Mopers sulk (robot, cactus, toast, blob).
// Even slots are weepers and odd slots are mopers, so the teams stay level. The same model drives the 3D views and the flat logos.
const crypto = require('crypto');

const W = 32, H = 48, D = 32, CX = 15.5, CZ = 16;
const TEAR = '#8fd3ff', INK = '#1d1d2e';

// ---- looks: each species has a few colour sets (a = main, b = light, c = dark, plus its own extras) ----
const SPECIES = {
  weeper: {
    cloud: { name: 'Rain cloud', w: 14, tl: 4, looks: [
      { n: 'Grey', a: '#a3abba', b: '#c5cbd6', c: '#7b8496' }, { n: 'Storm', a: '#6c7488', b: '#8c95aa', c: '#4a5164' },
      { n: 'Lavender', a: '#ab9fd6', b: '#cbc2ec', c: '#8177b0' }, { n: 'Mist', a: '#8fb0cf', b: '#b4cde4', c: '#6a8aa9' }] },
    ghost: { name: 'Ghost', w: 14, tl: 5, looks: [
      { n: 'White', a: '#f1f2fa', b: '#d5d8ea', c: '#b8bdd8' }, { n: 'Mint', a: '#d3f1e4', b: '#b4dccb', c: '#92c2ae' },
      { n: 'Lilac', a: '#e1d6f5', b: '#c8b8e6', c: '#a898cc' }, { n: 'Peach', a: '#f9ddd0', b: '#ecc2b0', c: '#d3a692' }] },
    clown: { name: 'Clown', w: 12, tl: 5, looks: [
      { n: 'Blue suit', s1: '#4f86d9', s2: '#f2cf4a', face: '#f7f1ea', hair: '#e8742c', shoe: '#e63946' },
      { n: 'Purple suit', s1: '#8d5ad0', s2: '#f59a3b', face: '#f7f1ea', hair: '#3fb88d', shoe: '#f2cf4a' },
      { n: 'Green suit', s1: '#43b36a', s2: '#f48fb1', face: '#f7f1ea', hair: '#6a52d3', shoe: '#e63946' },
      { n: 'Red suit', s1: '#e04e57', s2: '#4cc2d2', face: '#f7f1ea', hair: '#f2cf4a', shoe: '#3b6fd6' }] },
    onion: { name: 'Onion', w: 14, tl: 7, looks: [
      { n: 'Purple', a: '#b06ac4', b: '#8e4ca6', leaf: '#59b564', root: '#efe3cf' }, { n: 'Yellow', a: '#e7bd58', b: '#c99a3a', leaf: '#59b564', root: '#efe3cf' },
      { n: 'White', a: '#f1ecdf', b: '#d7cfbb', leaf: '#7bc77d', root: '#d9cdb4' }, { n: 'Red', a: '#cf5b6e', b: '#ad4256', leaf: '#59b564', root: '#efe3cf' }] },
  },
  moper: {
    robot: { name: 'Robot', w: 14, tl: 1, looks: [
      { n: 'Steel', a: '#8e9db3', b: '#b1bdcf', c: '#5c6b82', d: '#c97a3a' }, { n: 'Copper', a: '#c48a5a', b: '#dca77a', c: '#8f5f3a', d: '#4f8f8a' },
      { n: 'Mint', a: '#8fcfb4', b: '#b3e3d0', c: '#5f9f86', d: '#d4a24a' }, { n: 'Dusty pink', a: '#d29aae', b: '#e8bccb', c: '#a06f82', d: '#6e86b8' }] },
    cactus: { name: 'Cactus', w: 14, tl: 0, looks: [
      { n: 'Green', a: '#4fa65a', b: '#3d8a48', pot: '#c1673f', potR: '#a35232', fl: '#ff8fb3' }, { n: 'Blue-green', a: '#4fa58c', b: '#3c8a73', pot: '#6b86c9', potR: '#546cae', fl: '#ffd166' },
      { n: 'Olive', a: '#8aa84a', b: '#708b38', pot: '#d6a548', potR: '#b78733', fl: '#ff8fb3' }, { n: 'Sage', a: '#9fc59a', b: '#82aa7d', pot: '#b86a8a', potR: '#9a5470', fl: '#fff2a0' }] },
    toast: { name: 'Toast', w: 14, tl: 0, looks: [
      { n: 'Golden', a: '#e2b36a', b: '#f0cd91', c: '#a8702f', limb: '#c58a45' }, { n: 'Dark', a: '#b27a43', b: '#cc9760', c: '#7a4b22', limb: '#8f5c30' },
      { n: 'Burnt', a: '#6b4a32', b: '#85604a', c: '#3e2a1c', limb: '#4e3424' }, { n: 'White bread', a: '#f2e6cc', b: '#fbf3e0', c: '#c99b55', limb: '#d9b878' }] },
    blob: { name: 'Blob', w: 14, tl: 3, looks: [
      { n: 'Teal', a: '#4fc2b4', b: '#8fe6d9', c: '#2f8c82' }, { n: 'Grape', a: '#9a6ad6', b: '#c2a0ee', c: '#6f46a8' },
      { n: 'Lime', a: '#9ad24f', b: '#c4ec86', c: '#6a9a2f' }, { n: 'Pink', a: '#e583b4', b: '#f5b5d3', c: '#b45a86' }] },
  },
};
const ACCS = [['none', 30], ['beanie', 26], ['plaster', 24], ['flower', 20]];
const ACC_COL = ['#e6544f', '#3a7ae6', '#3ae68a', '#e6c13a', '#b03ae6', '#ff7aa8', '#ff8a3a'];
const BGS = { weeper: ['#1f3550', '#25405a', '#2a3a5c', '#1f4650'], moper: ['#332a4a', '#2e2f4a', '#3a2c44', '#2a3548'] };
const NAMES = {
  weeper: ['DRIZZLE', 'SNIFFLES', 'PUDDLE', 'BOO-HOO', 'MISTY', 'TEARY', 'SOGGY', 'WILLOW', 'SOBBY', 'RAINY', 'DROPLET', 'SNIVEL', 'BLUBBER', 'WAHWAH', 'SPRINKLE', 'WEEPY', 'PITTER', 'MIZZLE', 'DEWDROP', 'SNIFFLE', 'WATERWORKS', 'BAWL', 'GUSH', 'TRICKLE', 'SPLASH', 'SHOWER', 'DAMPY', 'WHIMPER'],
  moper: ['MOPEY', 'GLOOM', 'GRUMP', 'SULKS', 'BLUE', 'MURKY', 'DRAB', 'MEH', 'GRIM', 'DUSK', 'SHRUG', 'SIGH', 'FROWN', 'DREARY', 'BLAH', 'HUMPH', 'FOG', 'GLUM', 'DOLDRUM', 'SLUMP', 'PIKE', 'BROODY', 'SOMBER', 'MOROSE', 'BLEAK', 'DUMPS', 'GRAY', 'DOWNER'],
};

// ---- classes: each is an ability that works from real chain numbers (fn names the report in report.js) ----
const ROLES = {
  SNIFFLER: { team: 'weeper', fn: 'HUNTER', blurb: 'Sniffles out the wallets that bought in the launch block.' },
  MOURNER: { team: 'weeper', fn: 'ARCHIVIST', blurb: 'Keeps the milestone log, and cries a little at each one.' },
  LONER: { team: 'weeper', fn: 'SCOUT', blurb: 'Counts the holders and wonders where everyone went.' },
  DIARIST: { team: 'weeper', fn: 'COURIER', blurb: 'Writes down the coin’s highs, in case things never get better.' },
  WORRIER: { team: 'moper', fn: 'SENTRY', blurb: 'Worries about the dev wallet so you don’t have to.' },
  DOOMSAYER: { team: 'moper', fn: 'ANALYST', blurb: 'Tracks the market cap and always expects the worst.' },
  PESSIMIST: { team: 'moper', fn: 'WARDEN', blurb: 'Works out exactly how bad a big sale would be.' },
  SKEPTIC: { team: 'moper', fn: 'AUDITOR', blurb: 'Trusts nothing until the mint and freeze authority are revoked.' },
};
const ABILITIES = {
  SNIFFLER: { name: 'Launch Block Scan', fn: 'HUNTER', does: 'Finds the wallets that bought in the same block as the launch or the next, and how much of the supply they hold now.' },
  MOURNER: { name: 'Milestone Log', fn: 'ARCHIVIST', does: 'Writes down the moment the coin first passes 25%, 50%, 75% and 90% of the curve, and when it graduates.' },
  LONER: { name: 'Holder Radar', fn: 'SCOUT', does: 'Tracks how many wallets hold the coin and how that count has changed since it first looked.' },
  DIARIST: { name: 'Record Board', fn: 'COURIER', does: 'Keeps the coin’s records: its highest market cap, most holders and furthest curve progress, with when each was seen.' },
  WORRIER: { name: 'Dev Watch', fn: 'SENTRY', does: 'Watches the dev wallet and the top ten holders, and sounds the alarm if the dev’s share drops.' },
  DOOMSAYER: { name: 'Cap Tracker', fn: 'ANALYST', does: 'Follows market cap against where it started and where it peaked, and shows how far it is from the high.' },
  PESSIMIST: { name: 'Sell Impact', fn: 'WARDEN', does: 'Uses the curve’s real reserves to work out what would happen if the dev or the biggest holder sold everything right now.' },
  SKEPTIC: { name: 'Authority Audit', fn: 'AUDITOR', does: 'Reads the token itself and says whether its mint authority and freeze authority are revoked.' },
  FLAGSHIP: { name: 'Command Sweep', fn: 'FLAGSHIP', does: 'Runs every other character’s ability on the coin at once and reports the headline from each.' },
};
const TEAM_ROLES = { weeper: Object.keys(ROLES).filter((k) => ROLES[k].team === 'weeper'), moper: Object.keys(ROLES).filter((k) => ROLES[k].team === 'moper') };

function prng(seedBytes) {
  let a = seedBytes.readUInt32LE(0) ^ seedBytes.readUInt32LE(4);
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function pickW(list, r) { const tot = list.reduce((a, x) => a + x[1], 0); let t = r * tot; for (const x of list) { t -= x[1]; if (t < 0) return x; } return list[list.length - 1]; }
const hash3 = (x, y, z) => (Math.imul(x * 73856093 ^ y * 19349663 ^ z * 83492791, 2654435761) >>> 0) % 1000;

// ---- traits: the same look is never handed out twice in one set ----
const traitCache = new Map();
function traitsFor(slot, secret) {
  const ck = String(secret);
  let list = traitCache.get(ck);
  if (!list) { list = { rnd: prng(crypto.createHmac('sha256', ck).update('sad').digest()), items: [], seen: new Set(), names: new Set(), kinds: new Set() }; traitCache.set(ck, list); }
  while (list.items.length <= slot) {
    const idx = list.items.length, team = idx % 2 === 0 ? 'weeper' : 'moper', sp = SPECIES[team], keys = Object.keys(sp);
    let t, key, tries = 0;
    do {
      const k = pickW(keys.map((x) => [x, sp[x].w]), list.rnd())[0], look = Math.floor(list.rnd() * sp[k].looks.length);
      t = { team, species: k, look, acc: pickW(ACCS, list.rnd())[0], accColor: Math.floor(list.rnd() * ACC_COL.length), bg: Math.floor(list.rnd() * 4), seed: Math.floor(list.rnd() * 1e9) };
      key = [k, look, t.acc, t.acc === 'beanie' ? t.accColor : 0].join('|');
      tries++;
    } while ((list.seen.has(key) || (tries < 120 && list.kinds.has(t.species + t.look) && list.kinds.size < keys.length * 4)) && tries < 200);
    list.seen.add(key); list.kinds.add(t.species + t.look);
    let nm, nt = 0;
    do { nm = NAMES[team][Math.floor(list.rnd() * NAMES[team].length)]; nt++; } while (list.names.has(nm) && nt < 200);
    list.names.add(nm);
    t.name = nm; t.role = TEAM_ROLES[team][Math.floor(list.rnd() * TEAM_ROLES[team].length)];
    list.items.push(t);
  }
  return list.items[slot];
}
function agentFor(slot, secret) {
  const t = traitsFor(slot, secret), sp = SPECIES[t.team][t.species];
  return { name: t.name, role: t.role, team: t.team === 'weeper' ? 'WEEPER' : 'MOPER', blurb: ROLES[t.role].blurb, ability: ABILITIES[t.role], chassis: sp.looks[t.look].n, breed: sp.name, accessory: t.acc === 'none' ? null : t.acc };
}

// ---- the voxel grid ----
class Vox {
  constructor() { this.m = new Map(); this.g = 0; this.pv = { leg: 10, arm: 20 }; }
  set(x, y, z, c, e) {
    x = Math.round(x); y = Math.round(y); z = Math.round(z);
    if (x < 0 || x >= W || y < 0 || y >= H || z < 0 || z >= D) return;
    this.m.set((y * D + z) * W + x, { x, y, z, c, e: e ? 1 : 0, g: this.g });
  }
  box(x0, y0, z0, x1, y1, z1, c, e) { for (let y = y0; y <= y1; y++) for (let z = z0; z <= z1; z++) for (let x = x0; x <= x1; x++) this.set(x, y, z, typeof c === 'function' ? c(x, y, z) : c, e); }
  // a box and its mirror image across the middle; gR and gL are the swing groups of the two sides
  mb(x0, y0, z0, x1, y1, z1, c, e, gR, gL) {
    const g = this.g;
    if (gR != null) this.g = gR; this.box(x0, y0, z0, x1, y1, z1, c, e);
    if (gL != null) this.g = gL; this.box(W - 1 - x1, y0, z0, W - 1 - x0, y1, z1, typeof c === 'function' ? (x, y, z) => c(W - 1 - x, y, z) : c, e);
    this.g = g;
  }
}

// the sad face, drawn on the front plane z = zf: eyes looking down, brows tilted up in the middle, a frown and tears
function face(v, o) {
  const { zf, ex, ey, my } = o, X = 16 + ex;
  v.mb(X, ey, zf, X + 1, ey + 1, zf, o.eye || '#ffffff', o.eyeE);
  if (o.pupil !== null) v.mb(X, ey, zf, X, ey, zf, o.pupil || INK, 0);
  v.mb(X, ey + 3, zf, X, ey + 3, zf, o.brow || INK, o.eyeE); v.mb(X + 1, ey + 2, zf, X + 1, ey + 2, zf, o.brow || INK, o.eyeE);
  const mc = o.mouth || INK;
  v.mb(16, my + 1, zf, 16, my + 1, zf, mc, o.eyeE); v.mb(17, my, zf, 17 + (o.mw || 1), my, zf, mc, o.eyeE);
  for (let k = 0; k < (o.tl || 0); k++) v.mb(X + 1, ey - 1 - k, zf, X + 1, ey - 1 - k, zf, TEAR, 1);
}

// ---- the eight characters. Each returns where its head top and face are, for the accessories ----
function buildCloud(v, P, big) {
  const h = big ? 2 : 0;
  v.mb(16, 9, 10, 24 + h, 11, 21, P.c);
  v.mb(16, 12, 8, 26 + h, 21, 23, P.a);
  v.mb(16, 22, 10, 21 + h, 26, 21, P.b);
  v.mb(16, 22, 12, 24 + h, 24, 22, P.b);
  v.mb(25 + h, 13, 11, 27 + h, 19, 20, P.b);
  for (const [x, z] of [[12, 12], [17, 14], [21, 16], [14, 19], [19, 20], [23, 13], [9, 16], [26, 19]]) for (const y of [7, 5, 3, 1]) v.set(x, y, z, TEAR, 1);
  face(v, { zf: 23, ex: 3, ey: 17, my: 14, tl: 4, mw: 1 });
  return { top: 26, hw: 5 + h, z0: 10, z1: 21, zf: 23, cheek: [8 + h, 16] };
}
function buildGhost(v, P) {
  v.mb(16, 8, 11, 22, 28, 21, (x, y) => (y < 13 ? P.b : P.a));
  v.mb(16, 29, 12, 20, 31, 20, P.a); v.mb(16, 32, 13, 18, 32, 19, P.a); v.mb(14, 33, 14, 17, 34, 16, P.a);
  for (let x = 16; x <= 22; x++) for (let z = 11; z <= 21; z++) { const yb = 4 + ((x * 5 + z * 3) % 4); v.mb(x, yb, z, x, 7, z, P.c); }
  v.pv.arm = 19; v.mb(23, 14, 14, 25, 18, 17, P.a, 0, 3, 4);
  face(v, { zf: 21, ex: 2, ey: 22, my: 17, tl: 5, eye: INK, pupil: null, brow: P.c, mouth: INK, mw: 1 });
  return { top: 32, hw: 3, z0: 13, z1: 19, zf: 21, cheek: [6, 20] };
}
function buildClown(v, P) {
  v.pv.leg = 10; v.pv.arm = 21;
  v.mb(17, 3, 14, 19, 9, 17, P.s2, 0, 1, 2); v.mb(16, 0, 12, 20, 2, 21, P.shoe, 0, 1, 2);
  for (let y = 10; y <= 22; y++) v.mb(16, y, 12, 21, y, 19, (y >> 1) % 2 ? P.s1 : P.s2);
  v.mb(16, 22, 11, 23, 23, 20, '#ffffff');
  v.mb(16, 24, 11, 22, 36, 20, P.face);
  v.mb(23, 29, 12, 26, 35, 19, P.hair); v.mb(16, 37, 13, 20, 39, 18, P.hair);
  v.mb(22, 11, 14, 24, 21, 17, P.s1, 0, 3, 4); v.mb(22, 9, 14, 24, 10, 17, '#ffffff', 0, 3, 4);
  v.mb(16, 28, 21, 16, 29, 22, '#ff3b3b');
  face(v, { zf: 20, ex: 2, ey: 32, my: 25, tl: 5, mouth: '#b3202f', mw: 2, pupil: INK });
  return { top: 39, hw: 5, z0: 13, z1: 18, zf: 20, cheek: [6, 31] };
}
function buildOnion(v, P) {
  v.pv.leg = 4; v.pv.arm = 15;
  v.mb(17, 0, 13, 19, 3, 17, P.root, 0, 1, 2);
  const col = (x, y, z) => ((x + (x > 15 ? 0 : 1)) % 3 === 0 ? P.b : P.a);
  v.mb(16, 4, 10, 21, 8, 21, col); v.mb(16, 9, 8, 24, 21, 23, col); v.mb(16, 22, 10, 21, 25, 21, col); v.mb(16, 26, 12, 19, 28, 19, col);
  v.box(15, 29, 14, 16, 33, 15, P.leaf); v.box(17, 32, 14, 19, 33, 15, P.leaf); v.box(12, 31, 14, 14, 32, 15, P.leaf);
  v.mb(25, 11, 14, 26, 15, 17, P.a, 0, 3, 4);
  face(v, { zf: 23, ex: 3, ey: 15, my: 11, tl: 6, mw: 1 });
  v.mb(22, 14, 23, 22, 9, 23, TEAR, 1);
  return { top: 28, hw: 3, z0: 12, z1: 19, zf: 23, cheek: [8, 14] };
}
function buildRobot(v, P) {
  v.pv.leg = 10; v.pv.arm = 21;
  v.mb(17, 2, 14, 19, 9, 17, P.c, 0, 1, 2); v.mb(16, 0, 12, 20, 1, 19, P.a, 0, 1, 2);
  v.mb(16, 10, 12, 22, 22, 19, P.a); v.mb(16, 13, 20, 19, 18, 20, P.c); v.mb(16, 15, 20, 16, 16, 20, '#ffb347', 1);
  v.mb(16, 23, 14, 18, 24, 17, P.c); v.mb(16, 25, 11, 22, 35, 20, P.a);
  v.mb(16, 27, 21, 21, 34, 21, '#10141c');
  v.box(15, 36, 15, 16, 38, 16, P.c); v.box(17, 38, 15, 19, 38, 16, P.c); v.box(19, 36, 15, 19, 37, 16, P.c); v.set(19, 35, 15, P.d, 1);
  v.mb(23, 29, 14, 23, 32, 17, P.b);
  v.mb(23, 12, 14, 25, 21, 17, P.a, 0, 3, 4); v.mb(23, 10, 14, 25, 11, 17, P.c, 0, 3, 4);
  for (let k = 0; k < 4; k++) v.set(17 + k, 12 - (k % 2), 12, P.d, 0); // a rust streak
  face(v, { zf: 21, ex: 2, ey: 30, my: 27, tl: 2, eye: '#7fe8ff', eyeE: 1, pupil: null, brow: '#7fe8ff', mouth: '#7fe8ff', mw: 1 });
  return { top: 35, hw: 6, z0: 11, z1: 20, zf: 21, cheek: [6, 29] };
}
function buildCactus(v, P) {
  v.pv.arm = 20;
  v.mb(16, 0, 9, 22, 7, 22, P.pot); v.mb(16, 6, 8, 23, 8, 23, P.potR); v.mb(16, 9, 10, 21, 9, 21, '#4a3320');
  v.mb(16, 10, 11, 20, 30, 20, (x, y) => ((x + (x > 15 ? 0 : 1)) % 2 === 0 ? P.a : P.b)); v.mb(16, 31, 12, 19, 31, 19, P.a);
  v.mb(21, 19, 13, 24, 21, 18, P.a, 0, 3, 4); v.mb(24, 12, 13, 26, 21, 18, P.a, 0, 3, 4);
  for (let y = 12; y <= 29; y += 2) for (let z = 11; z <= 20; z += 3) { const x = 16 + (hash3(y, z, 7) % 5); if (hash3(x, y, z) < 450) v.mb(x, y, z, x, y, z, '#f4f0c8'); }
  v.box(15, 32, 14, 16, 34, 15, '#4d9a5a'); v.box(17, 34, 13, 19, 34, 17, P.fl); v.box(17, 33, 14, 17, 33, 16, P.fl);
  face(v, { zf: 20, ex: 2, ey: 22, my: 17, tl: 0, mw: 1 });
  return { top: 31, hw: 4, z0: 12, z1: 19, zf: 20, cheek: [6, 21] };
}
function buildToast(v, P) {
  v.pv.leg = 8; v.pv.arm = 19;
  const hwAt = (y) => (y <= 24 ? 8 : y <= 28 ? 9 : 7);
  for (let y = 8; y <= 30; y++) { const hw = hwAt(y); v.mb(16, y, 13, 15 + hw, y, 18, (x, yy, z) => (x === 15 + hw || yy === 8 || yy === 30 || z === 13 || (yy === 24 || yy === 28) && x > 15 + hw - 2 ? P.c : (x + yy) % 5 === 0 ? P.b : P.a)); }
  v.mb(17, 0, 14, 18, 7, 17, P.limb, 0, 1, 2);
  v.mb(25, 13, 15, 26, 19, 17, P.limb, 0, 3, 4);
  face(v, { zf: 18, ex: 3, ey: 19, my: 13, tl: 0, mw: 1 });
  return { top: 30, hw: 6, z0: 13, z1: 18, zf: 18, cheek: [8, 18] };
}
function buildBlob(v, P) {
  v.pv.arm = 9;
  v.mb(16, 0, 6, 27, 1, 25, P.c);
  v.mb(16, 2, 8, 26, 4, 22, P.a); v.mb(16, 5, 9, 25, 10, 22, P.a); v.mb(16, 11, 10, 23, 14, 22, P.a); v.mb(16, 15, 12, 20, 16, 19, P.a);
  v.box(17, 16, 13, 18, 16, 15, P.b); v.box(21, 13, 20, 22, 14, 21, P.b);
  v.mb(26, 6, 14, 27, 9, 17, P.a, 0, 3, 4);
  face(v, { zf: 22, ex: 3, ey: 8, my: 5, tl: 4, mw: 1 });
  return { top: 16, hw: 5, z0: 12, z1: 19, zf: 22, cheek: [9, 7] };
}
const BUILD = { cloud: buildCloud, ghost: buildGhost, clown: buildClown, onion: buildOnion, robot: buildRobot, cactus: buildCactus, toast: buildToast, blob: buildBlob };

// accessories sit on the head top (or the face) of whichever character it is
function accessory(v, a, acc, col) {
  const zm = (a.z0 + a.z1) >> 1;
  if (acc === 'beanie') { v.mb(16, a.top + 1, a.z0, 15 + a.hw, a.top + 2, a.z1, col); v.mb(16, a.top + 3, a.z0 + 1, 14 + a.hw, a.top + 3, a.z1 - 1, col); v.box(15, a.top + 4, zm, 16, a.top + 5, zm + 1, '#ffffff'); }
  else if (acc === 'plaster') { const x = 16 + a.cheek[0] - 3, y = a.cheek[1] - 3; v.box(x, y, a.zf + 1, x + 2, y + 1, a.zf + 1, '#f3d9b5'); v.set(x + 1, y, a.zf + 1, '#c99b6a'); v.set(x + 1, y + 1, a.zf + 1, '#c99b6a'); }
  else if (acc === 'flower') { v.box(15, a.top + 1, zm, 16, a.top + 3, zm, '#4d9a5a'); v.box(14, a.top + 4, zm - 1, 17, a.top + 4, zm + 1, '#ff8fb3'); v.box(17, a.top + 3, zm - 1, 18, a.top + 3, zm + 1, '#ff8fb3'); v.set(15, a.top + 4, zm, '#ffd166'); }
}

const GLOW = '#8fd3ff';
const mixHex = (hex, k) => { const n = parseInt(hex.slice(1, 7), 16); return '#' + [16, 8, 0].map((sh) => Math.max(0, Math.min(255, Math.round(((n >> sh) & 255) * k))).toString(16).padStart(2, '0')).join(''); };
function finish(v, extra) {
  const palette = [], index = new Map(), cells = [];
  for (const q of v.m.values()) {
    let c = q.c;
    if (!q.e) { const h = Math.imul(q.x * 73856093 ^ q.y * 19349663 ^ q.z * 83492791, 2654435761) >>> 0; c = mixHex(c, 0.93 + (h % 1000) / 1000 * 0.12); }
    let pi = index.get(c); if (pi == null) { pi = palette.length; palette.push(c); index.set(c, pi); }
    cells.push([q.x, q.y, q.z, q.e + 2 * q.g, pi]);
  }
  cells.sort((a, b) => a[1] - b[1] || a[2] - b[2] || a[0] - b[0]);
  return Object.assign({ pet: true, zoom: 0.8, w: W, h: H, d: D, cx: CX, cz: CZ, pivot: [v.pv.leg, v.pv.arm], pz: [16, 16], tailZ: 0, gun: null, muz: [], palette, cells }, extra || {});
}
const modelCache = new Map();
function agentVoxels(slot, secret) {
  const key = String(secret) + ':' + slot;
  let m = modelCache.get(key);
  if (!m) {
    const t = traitsFor(slot, secret), sp = SPECIES[t.team][t.species], v = new Vox();
    const a = BUILD[t.species](v, sp.looks[t.look], false);
    accessory(v, a, t.acc, ACC_COL[t.accColor]);
    m = finish(v); m.scheme = BGS[t.team][t.bg]; m.glow = GLOW; modelCache.set(key, m);
  }
  return m;
}

// ---- PRIME: the flagship. A big storm cloud in a gold crown, crying gold. ----
let primeCache = null;
function founderVoxels() {
  if (primeCache) return primeCache;
  const v = new Vox();
  const a = buildCloud(v, { a: '#6a7390', b: '#8b94b2', c: '#474f6a' }, true);
  for (const q of v.m.values()) if (q.c === TEAR) q.c = '#ffd166';
  const h = a.hw;
  v.mb(16, 27, 11, 15 + h, 27, 20, '#ffc84a');
  for (const x of [16, 18, 20, 16 + h - 1]) for (const z of [11, 15, 20]) { v.set(x, 28, z, '#ffc84a'); v.set(31 - x, 28, z, '#ffc84a'); }
  v.set(16, 29, 20, '#ff4d4d', 1); v.set(15, 29, 20, '#ff4d4d', 1);
  primeCache = finish(v); primeCache.scheme = '#262b44'; primeCache.glow = '#ffd166';
  return primeCache;
}

// ---- flat pictures for logos and tiles, cached because drawing one takes a moment ----
const iso = require('./isorender');
const picCache = new Map();
function pngFor(model, key, size) {
  const k = key + ':' + size; let b = picCache.get(k);
  if (!b) { b = iso.renderPng(model, { size }); picCache.set(k, b); if (picCache.size > 120) picCache.delete(picCache.keys().next().value); }
  return b;
}
const png = (slot, secret, size) => pngFor(agentVoxels(slot, secret), 'a' + secret + ':' + slot, size || 512);
const founderPng = (size) => pngFor(founderVoxels(), 'prime', size || 512);

// a tear drop, as runs of cubes on a 64 x 64 grid, for the locked tiles and the logo
const SHAPE_ON = (x, y) => {
  const dy = y - 40, inBall = (x - 32) ** 2 + dy * dy <= 20 * 20;
  const inTip = y >= 6 && y <= 40 && Math.abs(x - 32) <= (y - 6) / 34 * 18 + 0.5;
  return inBall || inTip;
};
function silhouette() {
  const runs = [];
  for (let y = 0; y < 64; y++) { let x = 0; while (x < 64) { if (!SHAPE_ON(x, y)) { x++; continue; } let n = 1; while (x + n < 64 && SHAPE_ON(x + n, y)) n++; runs.push([y, x, n]); x += n; } }
  return runs;
}

module.exports = { png, founderPng, silhouette, traitsFor, agentFor, agentVoxels, founderVoxels, ROLES, ABILITIES, SPECIES, W, H, D };
