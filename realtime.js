// Upstash Realtime (Redis Streams + SSE). Se ejecuta solo en el servidor.
let instance;
async function getRealtime() {
  if (instance) return instance;
  const [{ Realtime }, { Redis }, zod] = await Promise.all([
    import('@upstash/realtime'), import('@upstash/redis'), import('zod/v4')
  ]);
  const z = zod.z || zod.default;
  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN
  });
  const schema = {
    chat: {
      message: z.object({ chatId: z.string(), messageId: z.number(), senderId: z.string(), at: z.number() }),
      changed: z.object({ chatId: z.string(), at: z.number() })
    },
    notification: {
      created: z.object({ notificationId: z.number(), chatId: z.string(), at: z.number() })
    },
    presence: {
      changed: z.object({ userId: z.string(), online: z.boolean(), lastSeen: z.number() })
    }
  };
  instance = new Realtime({ schema, redis });
  return instance;
}
async function emit(channel, event, data) {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) return;
  const rt = await getRealtime();
  await rt.channel(channel).emit(event, data);
}
module.exports = { getRealtime, emit };
