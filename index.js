const express = require('express'), crypto = require('crypto'), fs = require('fs'), path = require('path');
const { createClient } = require('@libsql/client/web');
const { Redis } = require('@upstash/redis');
const cfg = require('./config');
let waitUntil = p => p;
try { waitUntil = require('@vercel/functions').waitUntil; } catch (e) {}

const db = createClient({
  url: cfg.TURSO_URL.replace(/^libsql:/, 'https:'),
  authToken: cfg.TURSO_TOKEN
});
/* Upstash: solo el servidor habla con Redis (el token nunca llega al navegador) */
const redis = new Redis({ url: cfg.UPSTASH_URL, token: cfg.UPSTASH_TOKEN });
const pub = (users, ev) => Promise.allSettled([...new Set(users)].map(u => redis.publish('u:' + u, JSON.stringify(ev))));
const fan = async (chats, me, ev) => {
  chats = [].concat(chats); if (!chats.length) return;
  const rows = await q(`SELECT chat,user FROM chaty_members WHERE chat IN (${IN(chats)}) AND user<>?`, [...chats, me]);
  await Promise.allSettled(rows.map(r => redis.publish('u:' + r.user, JSON.stringify({ ...ev, c: r.chat }))));
};
const ONLINE = 45; // segundos sin ping para dejar de verse "en línea"
const SECRET = cfg.SESSION_SECRET || cfg.TURSO_TOKEN || 'chaty-dev';

/* ---------- países (números falsos) ---------- */
const C = { HN: ['Honduras', '504', 8, '🇭🇳'], MX: ['México', '52', 10, '🇲🇽'], CO: ['Colombia', '57', 10, '🇨🇴'], AR: ['Argentina', '54', 10, '🇦🇷'], ES: ['España', '34', 9, '🇪🇸'], US: ['Estados Unidos', '1', 10, '🇺🇸'], BR: ['Brasil', '55', 11, '🇧🇷'], PE: ['Perú', '51', 9, '🇵🇪'], CL: ['Chile', '56', 9, '🇨🇱'], EC: ['Ecuador', '593', 9, '🇪🇨'], VE: ['Venezuela', '58', 10, '🇻🇪'], GT: ['Guatemala', '502', 8, '🇬🇹'], SV: ['El Salvador', '503', 8, '🇸🇻'], NI: ['Nicaragua', '505', 8, '🇳🇮'], CR: ['Costa Rica', '506', 8, '🇨🇷'], PA: ['Panamá', '507', 8, '🇵🇦'], DO: ['Rep. Dominicana', '1809', 7, '🇩🇴'], BO: ['Bolivia', '591', 8, '🇧🇴'], PY: ['Paraguay', '595', 9, '🇵🇾'], UY: ['Uruguay', '598', 8, '🇺🇾'], FR: ['Francia', '33', 9, '🇫🇷'], DE: ['Alemania', '49', 10, '🇩🇪'], IT: ['Italia', '39', 10, '🇮🇹'], GB: ['Reino Unido', '44', 10, '🇬🇧'], IN: ['India', '91', 10, '🇮🇳'], JP: ['Japón', '81', 10, '🇯🇵'] };
const valid = n => Object.values(C).some(c => n.startsWith(c[1]) && n.length === c[1].length + c[2]);

/* ---------- utilidades ---------- */
class E extends Error { constructor(m, c = 400) { super(m); this.code = c; } }
const now = () => Math.floor(Date.now() / 1000);
const norm = n => String(n || '').replace(/\D/g, '');
const IN = a => a.map(() => '?').join();
const ph = (id, pv) => pv ? `/p/${id}?v=${pv}` : null;
const REV = "(SELECT v FROM chaty_meta WHERE k='rev')";
const BUMP = { sql: "UPDATE chaty_meta SET v=v+1 WHERE k='rev'", args: [] };
const MEMBER = 'EXISTS(SELECT 1 FROM chaty_members WHERE chat=? AND user=?)';
const q = (sql, args = []) => db.execute({ sql, args }).then(r => r.rows);
const hashp = p => new Promise((ok, no) => { const s = crypto.randomBytes(16).toString('hex'); crypto.scrypt(p, s, 32, (e, k) => e ? no(e) : ok(s + ':' + k.toString('hex'))); });
const checkp = (p, h) => new Promise(ok => { const [s, k] = String(h).split(':'); if (!s || !k) return ok(false); crypto.scrypt(p, s, 32, (e, d) => { try { ok(!e && crypto.timingSafeEqual(d, Buffer.from(k, 'hex'))); } catch (x) { ok(false); } }); });
const sign = n => n + '.' + crypto.createHmac('sha256', SECRET).update(n).digest('base64url');
const cookie = n => `ch=${sign(n)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=31536000`;
function sess(req) {
  const m = /(?:^|;\s*)ch=([^;]+)/.exec(req.headers.cookie || ''); if (!m) return null;
  const v = decodeURIComponent(m[1]), i = v.lastIndexOf('.'); if (i < 1) return null;
  const n = v.slice(0, i), a = Buffer.from(sign(n)), b = Buffer.from(v);
  return a.length === b.length && crypto.timingSafeEqual(a, b) ? n : null;
}
function photo(p) {
  if (!p) return null;
  if (!/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(p) || p.length > 200000) throw new E('Foto no válida');
  return p;
}

/* ---------- tablas (se crean solas) ---------- */
const SCHEMA = [
  'CREATE TABLE IF NOT EXISTS chaty_users(id TEXT PRIMARY KEY,name TEXT NOT NULL,pass TEXT NOT NULL,photo TEXT,pv INTEGER,bio TEXT DEFAULT \'Hola, estoy usando Chaty\',created INTEGER)',
  'CREATE TABLE IF NOT EXISTS chaty_alias(owner TEXT,target TEXT,alias TEXT,PRIMARY KEY(owner,target))',
  'CREATE TABLE IF NOT EXISTS chaty_chats(id TEXT PRIMARY KEY,type TEXT,name TEXT,admin TEXT,created INTEGER)',
  'CREATE TABLE IF NOT EXISTS chaty_members(chat TEXT,user TEXT,PRIMARY KEY(chat,user))',
  'CREATE INDEX IF NOT EXISTS chaty_mem_user ON chaty_members(user)',
  'CREATE TABLE IF NOT EXISTS chaty_msgs(i INTEGER PRIMARY KEY AUTOINCREMENT,chat TEXT,f TEXT,x TEXT,t INTEGER,r INTEGER,d INTEGER DEFAULT 0,e INTEGER,qi INTEGER,qf TEXT,qx TEXT)',
  'CREATE INDEX IF NOT EXISTS chaty_msgs_r ON chaty_msgs(chat,r)',
  'CREATE INDEX IF NOT EXISTS chaty_msgs_i ON chaty_msgs(chat,i)',
  'CREATE TABLE IF NOT EXISTS chaty_hidden(msg INTEGER,user TEXT,PRIMARY KEY(msg,user))',
  'CREATE TABLE IF NOT EXISTS chaty_push(endpoint TEXT PRIMARY KEY,user TEXT,p256dh TEXT,auth TEXT,created INTEGER)',
  'CREATE INDEX IF NOT EXISTS chaty_push_user ON chaty_push(user)',
  'CREATE TABLE IF NOT EXISTS chaty_contacts(owner TEXT,target TEXT,created INTEGER,PRIMARY KEY(owner,target))',
  'CREATE TABLE IF NOT EXISTS chaty_blocks(owner TEXT,target TEXT,created INTEGER,PRIMARY KEY(owner,target))',
  'CREATE TABLE IF NOT EXISTS chaty_meta(k TEXT PRIMARY KEY,v INTEGER)',
  "INSERT OR IGNORE INTO chaty_meta(k,v) VALUES('rev',0)"
];
const MIG = [
  'ALTER TABLE chaty_users ADD COLUMN seen INTEGER DEFAULT 0',
  'ALTER TABLE chaty_users ADD COLUMN ps INTEGER DEFAULT 1',
  'ALTER TABLE chaty_users ADD COLUMN rr INTEGER DEFAULT 1',
  'ALTER TABLE chaty_members ADD COLUMN rd INTEGER DEFAULT 0',
  'ALTER TABLE chaty_members ADD COLUMN dl INTEGER DEFAULT 0',
  'ALTER TABLE chaty_msgs ADD COLUMN bl INTEGER DEFAULT 0'
];
let ready;
const init = () => ready || (ready = (async () => {
  await db.batch(SCHEMA, 'write');
  if ((await q("SELECT 1 FROM chaty_meta WHERE k='mig2'")).length) return;
  for (const m of MIG) { try { await db.execute(m); } catch (e) { /* la columna ya existe */ } }
  await db.batch([
    { sql: "INSERT OR IGNORE INTO chaty_contacts(owner,target,created) SELECT m1.user,m2.user,? FROM chaty_members m1 JOIN chaty_chats c ON c.id=m1.chat AND c.type='p' JOIN chaty_members m2 ON m2.chat=c.id AND m2.user<>m1.user", args: [now()] },
    'UPDATE chaty_members SET rd=COALESCE((SELECT MAX(i) FROM chaty_msgs WHERE chat=chaty_members.chat),0),dl=COALESCE((SELECT MAX(i) FROM chaty_msgs WHERE chat=chaty_members.chat),0)',
    "INSERT OR IGNORE INTO chaty_meta(k,v) VALUES('mig2',1)"], 'write');
})().catch(e => { ready = null; throw e; }));

/* presencia: null si no se puede ver (privacidad o bloqueo, en ambos sentidos) */
async function presOf(me, ids) {
  ids = [...new Set(ids)].filter(i => i && i !== me); if (!ids.length) return {};
  const rows = await q(`SELECT u.id,u.seen FROM chaty_users u WHERE u.id IN (${IN(ids)}) AND u.ps=1 AND (SELECT ps FROM chaty_users WHERE id=?)=1
    AND NOT EXISTS(SELECT 1 FROM chaty_blocks b WHERE (b.owner=u.id AND b.target=?) OR (b.owner=? AND b.target=u.id))`, [...ids, me, me, me]);
  const o = {}; rows.forEach(r => o[r.id] = { on: now() - r.seen < ONLINE, seen: r.seen || 0 }); return o;
}
const sys = (chat, text) => [BUMP, { sql: `INSERT INTO chaty_msgs(chat,f,x,t,r) VALUES(?,'sys',?,?,${REV})`, args: [chat, text, now()] }];

/* ---------- notificaciones push (VAPID) ---------- */
function JWK() {
  const v = cfg.VAPID_JWK; let j = v;
  if (typeof v === 'string') { const m = /\{[\s\S]*\}/.exec(v); if (!m) return null; try { j = JSON.parse(m[0]); } catch (e) { return null; } }
  try { return j && j.d && j.x && j.y ? j : null; } catch (e) { return null; }
}
function vapidPub() {
  const j = JWK(); if (!j) return null;
  return Buffer.concat([Buffer.from([4]), Buffer.from(j.x, 'base64url'), Buffer.from(j.y, 'base64url')]).toString('base64url');
}
let PF;
async function notify(id, from, x) {
  const jwk = JWK(); if (!jwk) return;
  const subs = await q(`SELECT p.endpoint,p.p256dh,p.auth,u.name sname,(SELECT alias FROM chaty_alias a WHERE a.owner=p.user AND a.target=?) al,c.type ctype,c.name cname
    FROM chaty_push p JOIN chaty_members m ON m.chat=? AND m.user=p.user JOIN chaty_users u ON u.id=? JOIN chaty_chats c ON c.id=? WHERE p.user<>?`, [from, id, from, id, from]);
  if (!subs.length) return;
  if (!PF) { const m = await import('@pushforge/builder'); PF = m.buildPushHTTPRequest ? m : m.default; }
  const body = x.length > 120 ? x.slice(0, 117) + '…' : x;
  await Promise.allSettled(subs.map(async s => {
    const who = s.al || s.sname, g = s.ctype === 'g';
    const { endpoint, headers, body: data } = await PF.buildPushHTTPRequest({
      privateJWK: jwk,
      subscription: { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
      message: { payload: { title: g ? s.cname : who, body: g ? who + ': ' + body : body, chat: id, tag: id }, adminContact: cfg.VAPID_SUBJECT, options: { ttl: 3600, urgency: 'high' } }
    });
    const r = await fetch(endpoint, { method: 'POST', headers, body: data });
    if ([400, 403, 404, 410].includes(r.status)) await q('DELETE FROM chaty_push WHERE endpoint=?', [s.endpoint]);
  }));
}

/* ---------- acciones ---------- */
async function act(a, b, me) {
  if (a === 'countries') return Object.entries(C).map(([code, c]) => ({ code, name: c[0], dial: c[1], flag: c[3] }));
  if (a === 'vapid') return { key: vapidPub() };
  await init();

  if (a === 'numbers') {
    const c = C[b.cc]; if (!c) throw new E('País inválido');
    for (let t = 0; t < 4; t++) {
      const set = new Set();
      while (set.size < 6) { let n = c[1] + crypto.randomInt(1, 10); for (let i = 1; i < c[2]; i++) n += crypto.randomInt(0, 10); set.add(n); }
      const arr = [...set], taken = new Set((await q(`SELECT id FROM chaty_users WHERE id IN (${IN(arr)})`, arr)).map(r => r.id));
      if (!taken.size) return arr;
    }
    throw new E('Intenta de nuevo');
  }
  if (a === 'register') {
    const n = norm(b.number), name = String(b.name || '').trim(), p = String(b.pass || '');
    if (!valid(n)) throw new E('Número no válido');
    if (!name || name.length > 25) throw new E('Escribe un nombre (máx. 25)');
    if (p.length < 4) throw new E('La contraseña debe tener al menos 4 caracteres');
    const pic = photo(b.photo);
    if ((await q('SELECT 1 FROM chaty_users WHERE id=?', [n])).length) throw new E('Ese número ya está ocupado');
    await q('INSERT INTO chaty_users(id,name,pass,photo,pv,created,seen) VALUES(?,?,?,?,?,?,?)', [n, name, await hashp(p), pic, pic ? now() : null, now(), now()]);
    return { ok: 1, $cookie: cookie(n) };
  }
  if (a === 'login') {
    const n = norm(b.number), u = (await q('SELECT pass FROM chaty_users WHERE id=?', [n]))[0];
    if (!u || !(await checkp(String(b.pass || ''), u.pass))) throw new E('Número o contraseña incorrectos');
    return { ok: 1, $cookie: cookie(n) };
  }
  if (a === 'logout') return { ok: 1, $cookie: 'ch=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0' };
  if (!me) throw new E('auth', 401);

  switch (a) {
    case 'me': {
      const u = (await q('SELECT id,name,pv,bio,ps,rr FROM chaty_users WHERE id=?', [me]))[0];
      if (!u) throw new E('auth', 401);
      return { id: u.id, name: u.name, photo: ph(u.id, u.pv), bio: u.bio || '', ps: u.ps === 0 ? 0 : 1, rr: u.rr === 0 ? 0 : 1 };
    }
    case 'ping':
      await q('UPDATE chaty_users SET seen=? WHERE id=?', [now(), me]);
      return { ok: 1 };
    case 'profile': {
      const sets = [], args = [], name = String(b.name || '').trim();
      if (name && name.length <= 25) { sets.push('name=?'); args.push(name); }
      if (b.bio !== undefined) { sets.push('bio=?'); args.push(String(b.bio).trim().slice(0, 80)); }
      if (b.photo) { sets.push('photo=?', 'pv=?'); args.push(photo(b.photo), now()); }
      if (b.ps !== undefined) { sets.push('ps=?'); args.push(b.ps ? 1 : 0); }
      if (b.rr !== undefined) { sets.push('rr=?'); args.push(b.rr ? 1 : 0); }
      if (sets.length) await q(`UPDATE chaty_users SET ${sets.join()} WHERE id=?`, [...args, me]);
      return act('me', b, me);
    }
    case 'user': {
      const n = norm(b.number);
      const u = (await q(`SELECT u.id,u.name,u.pv,u.bio,u.created,a.alias,
          EXISTS(SELECT 1 FROM chaty_contacts c WHERE c.owner=? AND c.target=u.id) ct,
          EXISTS(SELECT 1 FROM chaty_blocks k WHERE k.owner=? AND k.target=u.id) bk
        FROM chaty_users u LEFT JOIN chaty_alias a ON a.owner=? AND a.target=u.id WHERE u.id=?`, [me, me, me, n]))[0];
      if (!u) throw new E('Ese número no está en Chaty', 404);
      const pr = (await presOf(me, [n]))[n] || null;
      return { id: u.id, name: u.name, alias: u.alias || '', photo: ph(u.id, u.pv), bio: u.bio || 'Hola, estoy usando Chaty', created: u.created || 0, contact: !!u.ct, blocked: !!u.bk, pres: pr, me: u.id === me };
    }
    case 'alias': {
      const n = norm(b.number), al = String(b.alias || '').trim();
      if (n === me || !(await q('SELECT 1 FROM chaty_users WHERE id=?', [n])).length) throw new E('Número no válido');
      if (al.length > 25) throw new E('Máximo 25 letras');
      if (!al) await q('DELETE FROM chaty_alias WHERE owner=? AND target=?', [me, n]);
      else await q('INSERT INTO chaty_alias(owner,target,alias) VALUES(?,?,?) ON CONFLICT(owner,target) DO UPDATE SET alias=excluded.alias', [me, n, al]);
      return { ok: 1 };
    }

    /* ----- contactos ----- */
    case 'contacts': {
      const rows = await q(`SELECT u.id,u.name,u.pv,u.bio,a.alias,EXISTS(SELECT 1 FROM chaty_blocks k WHERE k.owner=? AND k.target=u.id) bk
        FROM chaty_contacts c JOIN chaty_users u ON u.id=c.target LEFT JOIN chaty_alias a ON a.owner=c.owner AND a.target=u.id
        WHERE c.owner=? ORDER BY lower(COALESCE(a.alias,u.name))`, [me, me]);
      const P = await presOf(me, rows.map(r => r.id));
      return rows.map(r => ({ id: r.id, name: r.alias || r.name, real: r.name, photo: ph(r.id, r.pv), bio: r.bio || '', blocked: !!r.bk, pres: P[r.id] || null }));
    }
    case 'cadd': {
      const n = norm(b.number), al = String(b.alias || '').trim();
      if (n === me) throw new E('Ese es tu propio número');
      if (al.length > 25) throw new E('Máximo 25 letras');
      const u = (await q('SELECT EXISTS(SELECT 1 FROM chaty_contacts WHERE owner=? AND target=u.id) ct FROM chaty_users u WHERE u.id=?', [me, n]))[0];
      if (!u) throw new E('Ese número no está en Chaty', 404);
      if (u.ct) return { ok: 1, already: 1 };
      const st = [{ sql: 'INSERT OR IGNORE INTO chaty_contacts(owner,target,created) VALUES(?,?,?)', args: [me, n, now()] }];
      if (al) st.push({ sql: 'INSERT INTO chaty_alias(owner,target,alias) VALUES(?,?,?) ON CONFLICT(owner,target) DO UPDATE SET alias=excluded.alias', args: [me, n, al] });
      await db.batch(st, 'write');
      return { ok: 1 };
    }
    case 'cdel': {
      const n = norm(b.number);
      await db.batch([{ sql: 'DELETE FROM chaty_contacts WHERE owner=? AND target=?', args: [me, n] }, { sql: 'DELETE FROM chaty_alias WHERE owner=? AND target=?', args: [me, n] }], 'write');
      return { ok: 1 };
    }
    case 'block': {
      const n = norm(b.number);
      if (n === me || !(await q('SELECT 1 FROM chaty_users WHERE id=?', [n])).length) throw new E('Número no válido');
      if (b.on) await q('INSERT OR IGNORE INTO chaty_blocks(owner,target,created) VALUES(?,?,?)', [me, n, now()]);
      else await q('DELETE FROM chaty_blocks WHERE owner=? AND target=?', [me, n]);
      return { ok: 1 };
    }
    case 'blocked':
      return (await q('SELECT u.id,u.name,u.pv,a.alias FROM chaty_blocks k JOIN chaty_users u ON u.id=k.target LEFT JOIN chaty_alias a ON a.owner=k.owner AND a.target=u.id WHERE k.owner=? ORDER BY k.created DESC', [me]))
        .map(r => ({ id: r.id, name: r.alias || r.name, photo: ph(r.id, r.pv) }));

    /* ----- chats ----- */
    case 'chats': {
      const [R, dl] = await Promise.all([db.batch([
        { sql: `SELECT c.id,c.type,c.name,c.created,c.n,c.un,m.f lf,m.x lx,m.t lt,m.d ld,
            COALESCE((SELECT alias FROM chaty_alias a WHERE a.owner=? AND a.target=m.f),(SELECT name FROM chaty_users u WHERE u.id=m.f)) lfn
          FROM (SELECT c0.id,c0.type,c0.name,c0.created,
              (SELECT COUNT(*) FROM chaty_members x WHERE x.chat=c0.id) n,
              (SELECT m.i FROM chaty_msgs m WHERE m.chat=c0.id AND (m.bl=0 OR m.f=?) AND NOT EXISTS(SELECT 1 FROM chaty_hidden h WHERE h.msg=m.i AND h.user=?) ORDER BY m.i DESC LIMIT 1) li,
              (SELECT COUNT(*) FROM chaty_msgs m WHERE m.chat=c0.id AND m.i>mb.rd AND m.f<>? AND m.f<>'sys' AND m.bl=0 AND m.d=0 AND NOT EXISTS(SELECT 1 FROM chaty_hidden h WHERE h.msg=m.i AND h.user=?)) un
            FROM chaty_chats c0 JOIN chaty_members mb ON mb.chat=c0.id AND mb.user=?) c
          LEFT JOIN chaty_msgs m ON m.i=c.li WHERE c.type='g' OR c.li IS NOT NULL`, args: [me, me, me, me, me, me] },
        { sql: `SELECT m2.chat,u.id,u.name,u.pv,u.seen,u.ps,(SELECT alias FROM chaty_alias a WHERE a.owner=? AND a.target=u.id) al,
            (SELECT ps FROM chaty_users WHERE id=?) mps,
            EXISTS(SELECT 1 FROM chaty_blocks b WHERE (b.owner=? AND b.target=u.id) OR (b.owner=u.id AND b.target=?)) blk
          FROM chaty_members m1 JOIN chaty_chats c ON c.id=m1.chat AND c.type='p' JOIN chaty_members m2 ON m2.chat=c.id AND m2.user<>? JOIN chaty_users u ON u.id=m2.user WHERE m1.user=?`, args: [me, me, me, me, me, me] }
      ], 'read'), q(`UPDATE chaty_members SET dl=COALESCE((SELECT MAX(i) FROM chaty_msgs WHERE chat=chaty_members.chat),0)
          WHERE user=? AND dl<COALESCE((SELECT MAX(i) FROM chaty_msgs WHERE chat=chaty_members.chat),0) RETURNING chat`, [me])]);
      if (dl.length) waitUntil(fan(dl.map(r => r.chat), me, { t: 'rc' }).catch(() => {}));
      const [cs, pe] = R.map(r => r.rows), P = {}; pe.forEach(p => P[p.chat] = p);
      const t = now();
      const out = cs.map(c => {
        const v = { id: c.id, type: c.type, un: c.un || 0, last: c.lf != null ? { f: c.lf, fn: c.lfn || '', x: c.ld ? 'Mensaje eliminado' : c.lx, t: c.lt, d: c.ld ? 1 : 0 } : null, ts: c.lt != null ? c.lt : (c.created || 0) };
        if (c.type === 'p') {
          const p = P[c.id] || {}; v.name = p.al || p.name || ''; v.photo = ph(p.id, p.pv); v.num = p.id;
          v.on = !!(p.ps && p.mps && !p.blk && t - p.seen < ONLINE); v.blk = !!p.blk;
        } else { v.name = c.name; v.photo = null; v.count = c.n; }
        return v;
      });
      return out.sort((x, y) => y.ts - x.ts);
    }
    case 'chat': case 'add': {
      const n = norm(b.number);
      if (n === me) throw new E('Ese es tu propio número');
      const id = 'p_' + [me, n].sort().join('_'), ok = { sql: 'SELECT 1 FROM chaty_users WHERE id=?', args: [n] };
      const R = await db.batch([ok,
        { sql: "INSERT OR IGNORE INTO chaty_chats(id,type,created) SELECT ?,'p',? WHERE EXISTS(SELECT 1 FROM chaty_users WHERE id=?)", args: [id, now(), n] },
        { sql: 'INSERT OR IGNORE INTO chaty_members(chat,user) SELECT ?,? WHERE EXISTS(SELECT 1 FROM chaty_users WHERE id=?)', args: [id, me, n] },
        { sql: 'INSERT OR IGNORE INTO chaty_members(chat,user) SELECT ?,? WHERE EXISTS(SELECT 1 FROM chaty_users WHERE id=?)', args: [id, n, n] }], 'write');
      if (!R[0].rows.length) throw new E('Ese número no está en Chaty', 404);
      return { id };
    }
    case 'group': {
      const name = String(b.name || '').trim(); if (!name || name.length > 30) throw new E('Ponle nombre al grupo');
      const want = [...new Set([me, ...(Array.isArray(b.members) ? b.members : []).map(norm).filter(Boolean)])].slice(0, 100);
      const key = String(b.key || '').slice(0, 40);
      /* el id sale de la clave que genera el cliente: si se envía dos veces, es el MISMO grupo (arregla los grupos duplicados) */
      const id = 'g_' + (key ? crypto.createHash('sha1').update(me + ':' + key).digest('hex').slice(0, 12) : crypto.randomBytes(6).toString('hex'));
      if ((await q('SELECT 1 FROM chaty_chats WHERE id=?', [id])).length) return { id };
      const us = await q(`SELECT id,name FROM chaty_users WHERE id IN (${IN(want)})`, want);
      if (us.length < 2) throw new E('Elige al menos un contacto');
      const mine = us.find(u => u.id === me);
      try {
        await db.batch([
          { sql: "INSERT INTO chaty_chats(id,type,name,admin,created) VALUES(?,'g',?,?,?)", args: [id, name, me, now()] },
          ...us.map(u => ({ sql: 'INSERT INTO chaty_members(chat,user) VALUES(?,?)', args: [id, u.id] })),
          ...sys(id, `${mine.name} creó el grupo "${name}"`)], 'write');
      } catch (e) { if ((await q('SELECT 1 FROM chaty_chats WHERE id=?', [id])).length) return { id }; throw e; }
      waitUntil(pub(us.filter(u => u.id !== me).map(u => u.id), { t: 'c', c: id }));
      return { id };
    }
    case 'gadd': {
      const id = String(b.chat || ''), g = (await q("SELECT admin FROM chaty_chats WHERE id=? AND type='g'", [id]))[0];
      if (!g) throw new E('Grupo no encontrado', 404);
      if (g.admin !== me) throw new E('Solo el admin puede agregar gente', 403);
      const want = [...new Set((Array.isArray(b.members) ? b.members : []).map(norm).filter(Boolean))].slice(0, 50);
      const us = want.length ? await q(`SELECT id,name FROM chaty_users WHERE id IN (${IN(want)}) AND id NOT IN (SELECT user FROM chaty_members WHERE chat=?)`, [...want, id]) : [];
      if (!us.length) throw new E('No hay nadie nuevo para agregar');
      const mine = (await q('SELECT name FROM chaty_users WHERE id=?', [me]))[0];
      const mx = '(SELECT COALESCE(MAX(i),0) FROM chaty_msgs WHERE chat=?)';
      await db.batch([...us.map(u => ({ sql: `INSERT OR IGNORE INTO chaty_members(chat,user,rd,dl) VALUES(?,?,${mx},${mx})`, args: [id, u.id, id, id] })),
        ...sys(id, `${mine.name} añadió a ${us.map(u => u.name).join(', ')}`)], 'write');
      waitUntil(fan(id, me, { t: 'c' }).catch(() => {}));
      return { ok: 1 };
    }
    case 'gdel': {
      const id = String(b.chat || ''), n = norm(b.number) || me, g = (await q("SELECT admin FROM chaty_chats WHERE id=? AND type='g'", [id]))[0];
      if (!g) throw new E('Grupo no encontrado', 404);
      if (n !== me && g.admin !== me) throw new E('Solo el admin puede quitar gente', 403);
      const mem = (await q('SELECT user FROM chaty_members WHERE chat=? ORDER BY rowid', [id])).map(r => r.user);
      if (!mem.includes(me) || !mem.includes(n)) throw new E('No está en el grupo', 404);
      const nm = {}; (await q('SELECT id,name FROM chaty_users WHERE id IN (?,?)', [me, n])).forEach(u => nm[u.id] = u.name);
      const rest = mem.filter(u => u !== n);
      const st = [{ sql: 'DELETE FROM chaty_members WHERE chat=? AND user=?', args: [id, n] }, ...sys(id, n === me ? `${nm[me]} salió del grupo` : `${nm[me]} eliminó a ${nm[n]}`)];
      if (g.admin === n && rest.length) st.push({ sql: 'UPDATE chaty_chats SET admin=? WHERE id=?', args: [rest[0], id] });
      await db.batch(st, 'write');
      waitUntil(pub([...rest.filter(u => u !== me), n], { t: 'c', c: id }));
      return { ok: 1 };
    }
    case 'gname': {
      const id = String(b.chat || ''), name = String(b.name || '').trim(), g = (await q("SELECT admin FROM chaty_chats WHERE id=? AND type='g'", [id]))[0];
      if (!g) throw new E('Grupo no encontrado', 404);
      if (g.admin !== me) throw new E('Solo el admin puede cambiar el nombre', 403);
      if (!name || name.length > 30) throw new E('Ponle nombre al grupo');
      await q('UPDATE chaty_chats SET name=? WHERE id=?', [name, id]);
      waitUntil(fan(id, me, { t: 'c' }).catch(() => {}));
      return { ok: 1 };
    }

    /* ----- mensajes ----- */
    case 'msgs': {
      const id = String(b.chat || ''), s = Math.max(0, +b.since || 0), first = !s;
      const MC = 'm.i,m.f,m.x,m.t,m.r,m.d,m.e,m.qi,m.qf,m.qx,m.bl,(SELECT 1 FROM chaty_hidden h WHERE h.msg=m.i AND h.user=?) hid';
      const st = [
        { sql: 'SELECT 1 FROM chaty_members WHERE chat=? AND user=?', args: [id, me] },
        { sql: "SELECT v FROM chaty_meta WHERE k='rev'", args: [] },
        first ? { sql: `SELECT * FROM (SELECT ${MC} FROM chaty_msgs m WHERE m.chat=? AND (m.bl=0 OR m.f=?) ORDER BY m.i DESC LIMIT 200) ORDER BY i`, args: [me, id, me] }
              : { sql: `SELECT ${MC} FROM chaty_msgs m WHERE m.chat=? AND (m.bl=0 OR m.f=?) AND m.r>? ORDER BY m.i`, args: [me, id, me, s] },
        { sql: 'SELECT m.user,m.rd,m.dl,u.rr,u.ps,u.seen FROM chaty_members m JOIN chaty_users u ON u.id=m.user WHERE m.chat=?', args: [id] },
        { sql: 'SELECT owner,target FROM chaty_blocks WHERE (owner=? AND target IN (SELECT user FROM chaty_members WHERE chat=?)) OR (target=? AND owner IN (SELECT user FROM chaty_members WHERE chat=?))', args: [me, id, me, id] }];
      if (first) st.push(
        { sql: 'SELECT id,type,name,admin,created FROM chaty_chats WHERE id=?', args: [id] },
        { sql: `SELECT u.id,u.name,u.pv,u.bio,(SELECT alias FROM chaty_alias a WHERE a.owner=? AND a.target=u.id) al,
            EXISTS(SELECT 1 FROM chaty_contacts c WHERE c.owner=? AND c.target=u.id) ct FROM chaty_members m JOIN chaty_users u ON u.id=m.user WHERE m.chat=?`, args: [me, me, id] });
      const R = (await db.batch(st, 'read')).map(r => r.rows);
      if (!R[0].length) throw new E('Chat no encontrado', 404);
      const msgs = [];
      for (const m of R[2]) {
        if (m.hid) { if (!first) msgs.push({ i: m.i, gone: 1 }); continue; }
        const o = { i: m.i, f: m.f, x: m.x, t: m.t, r: m.r };
        if (m.d) { o.d = 1; o.x = ''; } else { if (m.e) o.e = m.e; if (m.qi != null) o.q = { i: m.qi, f: m.qf, x: m.qx }; }
        msgs.push(o);
      }
      const my = R[3].find(r => r.user === me) || {}, oth = R[3].filter(r => r.user !== me), bs = R[4];
      const iBlock = bs.some(r => r.owner === me), blockedMe = bs.some(r => r.target === me);
      const r = { msgs, rev: R[1][0].v, cur: {
        rd: my.rr !== 0 && oth.length ? Math.min(...oth.map(o => o.rr !== 0 ? o.rd : 0)) : 0,
        dl: oth.length ? Math.min(...oth.map(o => o.dl)) : 0 }, blk: iBlock ? 1 : 0 };
      if (first) {
        const ch = R[5][0], mem = R[6], users = {};
        mem.forEach(u => users[u.id] = { id: u.id, name: u.al || u.name, photo: ph(u.id, u.pv), bio: u.bio || '', contact: !!u.ct });
        if (ch.type === 'p') {
          const p = mem.find(u => u.id !== me) || mem[0], o = oth[0];
          r.info = { id, type: 'p', name: users[p.id].name, photo: users[p.id].photo, num: p.id, bio: users[p.id].bio, contact: users[p.id].contact };
          r.pres = (my.ps !== 0 && o && o.ps !== 0 && !iBlock && !blockedMe) ? { on: now() - o.seen < ONLINE, seen: o.seen || 0 } : null;
        } else r.info = { id, type: 'g', name: ch.name, photo: null, count: mem.length, members: mem.map(u => ({ ...users[u.id], admin: u.id === ch.admin })), created: ch.created, admin: ch.admin };
        r.users = users;
      } else if (oth.length === 1) {
        const o = oth[0]; r.pres = (my.ps !== 0 && o.ps !== 0 && !iBlock && !blockedMe) ? { on: now() - o.seen < ONLINE, seen: o.seen || 0 } : null;
      }
      return r;
    }
    case 'send': {
      const id = String(b.chat || ''), x = String(b.text || '').trim();
      if (!x || x.length > 2000) throw new E('Mensaje vacío o muy largo');
      const [mem, ch, bs] = (await db.batch([
        { sql: 'SELECT user FROM chaty_members WHERE chat=?', args: [id] },
        { sql: 'SELECT type FROM chaty_chats WHERE id=?', args: [id] },
        { sql: 'SELECT owner,target FROM chaty_blocks WHERE (owner=? AND target IN (SELECT user FROM chaty_members WHERE chat=?)) OR (target=? AND owner IN (SELECT user FROM chaty_members WHERE chat=?))', args: [me, id, me, id] }], 'read')).map(r => r.rows);
      const users = mem.map(r => r.user);
      if (!users.includes(me)) throw new E('Chat no encontrado', 404);
      let bl = 0, to = users.filter(u => u !== me);
      if (ch[0] && ch[0].type === 'p') {
        if (bs.some(r => r.owner === me)) throw new E('Desbloquea a este contacto para escribirle');
        if (bs.some(r => r.target === me)) { bl = 1; to = []; }   // te bloqueó: tú lo ves enviado, él nunca lo recibe
      }
      const R = await db.batch([BUMP,
        { sql: `INSERT INTO chaty_msgs(chat,f,x,t,r,qi,qf,qx,bl) SELECT ?,?,?,?,${REV},q.i,q.f,CASE WHEN q.d=1 THEN '' ELSE substr(q.x,1,120) END,?
                FROM (SELECT 1) b LEFT JOIN chaty_msgs q ON q.i=? AND q.chat=? WHERE ${MEMBER}`, args: [id, me, x, now(), bl, +b.reply || 0, id, id, me] },
        { sql: 'SELECT i,f,x,t,r,qi,qf,qx FROM chaty_msgs WHERE i=last_insert_rowid()', args: [] }], 'write');
      if (!R[1].rowsAffected) throw new E('Chat no encontrado', 404);
      const m = R[2].rows[0], o = { i: m.i, f: m.f, x: m.x, t: m.t, r: m.r };
      if (m.qi != null) o.q = { i: m.qi, f: m.qf, x: m.qx };
      if (to.length) {
        waitUntil(pub(to, { t: 'm', c: id }));
        waitUntil(notify(id, me, x).catch(e => console.error('push', e && e.message)));
      }
      return { ok: 1, msg: o };
    }
    case 'read': {
      const id = String(b.chat || '');
      const mx = '(SELECT COALESCE(MAX(i),0) FROM chaty_msgs WHERE chat=?)';
      const R = await q(`UPDATE chaty_members SET rd=MAX(rd,${mx}),dl=MAX(dl,${mx}) WHERE chat=? AND user=? AND rd<${mx} RETURNING chat`, [id, id, id, me, id]);
      if (R.length) waitUntil(fan(id, me, { t: 'rc' }).catch(() => {}));
      return { ok: 1 };
    }
    case 'typing': {
      const id = String(b.chat || '');
      const o = await q('SELECT user FROM chaty_members WHERE chat=? AND user<>? AND EXISTS(SELECT 1 FROM chaty_members WHERE chat=? AND user=?)', [id, me, id, me]);
      if (o.length) waitUntil(pub(o.map(r => r.user), { t: 'ty', c: id, u: me }));
      return { ok: 1 };
    }
    case 'edit': {
      const x = String(b.text || '').trim(), ch = String(b.chat || '');
      if (!x || x.length > 2000) throw new E('Mensaje vacío o muy largo');
      const R = await db.batch([BUMP, { sql: `UPDATE chaty_msgs SET x=?,e=?,r=${REV} WHERE i=? AND chat=? AND f=? AND d=0 AND ?-t<=900 AND ${MEMBER}`, args: [x, now(), +b.id, ch, me, now(), ch, me] }], 'write');
      if (!R[1].rowsAffected) throw new E('Ya no se puede editar este mensaje');
      waitUntil(fan(ch, me, { t: 'u' }).catch(() => {}));
      return { ok: 1 };
    }
    case 'del': {
      const id = +b.id, ch = String(b.chat || '');
      if (b.mode === 'all') {
        const R = await db.batch([BUMP, { sql: `UPDATE chaty_msgs SET d=1,x='',qi=NULL,qf=NULL,qx=NULL,r=${REV} WHERE i=? AND chat=? AND f=? AND ?-t<=172800 AND ${MEMBER}`, args: [id, ch, me, now(), ch, me] }], 'write');
        if (!R[1].rowsAffected) throw new E('Ya no se puede eliminar para todos');
        waitUntil(fan(ch, me, { t: 'u' }).catch(() => {}));
      } else {
        await db.batch([BUMP,
          { sql: `INSERT OR IGNORE INTO chaty_hidden(msg,user) SELECT i,? FROM chaty_msgs WHERE i=? AND chat=? AND ${MEMBER}`, args: [me, id, ch, ch, me] },
          { sql: `UPDATE chaty_msgs SET r=${REV} WHERE i=? AND chat=? AND ${MEMBER}`, args: [id, ch, ch, me] }], 'write');
      }
      return { ok: 1 };
    }
    case 'push': {
      const s = b.sub || {};
      if (!s.endpoint || !s.keys || !s.keys.p256dh || !s.keys.auth) throw new E('Suscripción inválida');
      await q('INSERT INTO chaty_push(endpoint,user,p256dh,auth,created) VALUES(?,?,?,?,?) ON CONFLICT(endpoint) DO UPDATE SET user=excluded.user,p256dh=excluded.p256dh,auth=excluded.auth', [s.endpoint, me, s.keys.p256dh, s.keys.auth, now()]);
      return { ok: 1 };
    }
    case 'unpush':
      await q('DELETE FROM chaty_push WHERE endpoint=? AND user=?', [String(b.endpoint || ''), me]);
      return { ok: 1 };
  }
  throw new E('Acción desconocida');
}

/* ---------- servidor ---------- */
const app = express();
app.disable('x-powered-by');

app.post('/api', express.json({ limit: '1mb' }), async (req, res) => {
  try {
    const b = req.body || {}, r = await act(b.a, b, sess(req));
    if (r && r.$cookie) { res.setHeader('Set-Cookie', r.$cookie); delete r.$cookie; }
    res.set('Cache-Control', 'no-store').json(r);
  } catch (e) {
    if (!e.code) console.error(e);
    const msg = e.code ? e.message : (!cfg.TURSO_TOKEN ? 'Falta el token de Turso en config.js' : 'Error del servidor');
    res.status(e.code || 500).set('Cache-Control', 'no-store').json({ err: msg });
  }
});

/* tiempo real: el navegador abre este SSE y el servidor lo conecta al canal de Upstash del usuario */
const STREAM_MS = 50000;
app.get('/api/stream', async (req, res) => {
  const me = sess(req); if (!me) return res.status(401).end();
  res.writeHead(200, { 'Content-Type': 'text/event-stream; charset=utf-8', 'Cache-Control': 'no-cache, no-transform', Connection: 'keep-alive', 'X-Accel-Buffering': 'no' });
  res.write('retry: 1000\n\ndata: {"t":"hi"}\n\n');
  if (res.flush) res.flush();
  let sub, hb, to, done = false;
  const end = () => {
    if (done) return; done = true; clearInterval(hb); clearTimeout(to);
    try { sub && sub.unsubscribe(); } catch (e) {}
    try { res.end(); } catch (e) {}
  };
  req.on('close', end);
  try {
    sub = redis.subscribe('u:' + me);
    sub.on('message', d => {
      let m = d && d.message; if (m == null) return;
      if (typeof m !== 'string') m = JSON.stringify(m);
      try { res.write('data: ' + m + '\n\n'); } catch (e) { end(); }
    });
    sub.on('error', e => console.error('redis', e && e.message));
  } catch (e) { console.error('redis', e && e.message); }
  hb = setInterval(() => { try { res.write(': p\n\n'); } catch (e) { end(); } }, 8000);
  to = setTimeout(end, STREAM_MS);
  init().then(() => q('UPDATE chaty_users SET seen=? WHERE id=?', [now(), me])).catch(() => {});
});
app.get('/api', (req, res) => res.json({ ok: 1, db: !!cfg.TURSO_TOKEN, push: !!vapidPub() }));

app.get('/p/:id', async (req, res) => {
  try {
    await init();
    const r = (await q('SELECT photo FROM chaty_users WHERE id=?', [norm(req.params.id)]))[0];
    const m = r && /^data:(image\/\w+);base64,(.+)$/.exec(r.photo || '');
    if (!m) return res.status(404).end();
    res.set({ 'Content-Type': m[1], 'Cache-Control': 'public, max-age=31536000, immutable' }).send(Buffer.from(m[2], 'base64'));
  } catch (e) { res.status(500).end(); }
});

/* archivos de la página (planos, sin carpetas) */
const FILES = {
  '/index.html': [fs.readFileSync(path.join(__dirname, 'index.html')), 'text/html; charset=utf-8'],
  '/style.css': [fs.readFileSync(path.join(__dirname, 'style.css')), 'text/css; charset=utf-8'],
  '/app.js': [fs.readFileSync(path.join(__dirname, 'app.js')), 'application/javascript; charset=utf-8'],
  '/sw.js': [fs.readFileSync(path.join(__dirname, 'sw.js')), 'application/javascript; charset=utf-8'],
  '/manifest.webmanifest': [fs.readFileSync(path.join(__dirname, 'manifest.webmanifest')), 'application/manifest+json'],
  '/icon-192.png': [fs.readFileSync(path.join(__dirname, 'icon-192.png')), 'image/png'],
  '/icon-512.png': [fs.readFileSync(path.join(__dirname, 'icon-512.png')), 'image/png']
};
FILES['/'] = FILES['/index.html'];
app.get(Object.keys(FILES), (req, res) => {
  const [buf, type] = FILES[req.path];
  res.set({ 'Content-Type': type, 'Cache-Control': req.path === '/sw.js' ? 'no-cache' : 'public, max-age=0, s-maxage=30, must-revalidate' }).send(buf);
});

module.exports = app;
app._act = act;
if (require.main === module) app.listen(process.env.PORT || 3000);
