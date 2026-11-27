// Configuración de Chaty. El repo es privado, así que las llaves van aquí directo.
// Si algún día pones variables de entorno en Vercel, esas tienen prioridad sobre estas.
const env = process.env;
module.exports = {
  TURSO_URL: env.TURSO_DATABASE_URL || 'libsql://hola-lyonofc.aws-ap-south-1.turso.io',
  TURSO_TOKEN: env.TURSO_AUTH_TOKEN || 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3OTU3NDAxMzIsImlkIjoiMDFhMjFhNzMtNDMwMS03NWQwLWFhZWUtZTBkOTk4YTgwZTMyIiwia2lkIjoianFyMTNqd1hQWVN2MU14cUFTazhOSWdkV2dlSU5JbHkzNWJVanJickZmWSIsInJpZCI6IjZhNzc3Yjg2LTg5NWEtNDkzOC05YWY4LWViOTJkOGVmYTZhMyJ9.cLxZLzeIb_feqTi5uIB5HILjunKbbj6JDDOImReidzq6mmB2lm7q6Fd448B-NRxR2aQo4ByprgxzWmfpE-UGCQ',
  VAPID_JWK: env.VAPID_PRIVATE_JWK || env.VAPID_PRIVATE_KEY || {
    alg: 'ES256', key_ops: ['sign'], ext: true, kty: 'EC',
    x: '1gw3DDVBpfNWGZD4RWtALewrXW0Wt86APgPdk6ZDtYA',
    y: 'bPFjRorOSH__ngKqUaPiwOsGxXu7BNgJ4Cr-dNsu_HQ',
    crv: 'P-256',
    d: 'VBUT8o492jVTXjVUrtz1kyMdxmaY2mS8O30Nt1UxKus'
  },
  VAPID_SUBJECT: env.VAPID_SUBJECT || 'mailto:admin@chaty.app',
  SESSION_SECRET: env.SESSION_SECRET || ''
};
