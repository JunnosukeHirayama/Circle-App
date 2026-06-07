// Tiny in-process pub/sub used to push chat messages to SSE subscribers.
//
// This keeps realtime chat dependency-free (no Pusher/WebSocket server) and
// works great for a single Next.js instance. For multi-instance deployments,
// swap this module for Redis pub/sub or a managed realtime service.

export type ChatEvent = {
  type: "message";
  roomId: string;
  message: {
    id: string;
    content: string;
    senderId: string;
    senderName: string;
    senderImage: string | null;
    createdAt: string;
  };
};

type Subscriber = (event: ChatEvent) => void;

// Persist the registry across HMR / module reloads in dev.
const globalForBus = globalThis as unknown as {
  __chatSubscribers?: Map<string, Set<Subscriber>>;
};

const subscribers: Map<string, Set<Subscriber>> =
  globalForBus.__chatSubscribers ?? new Map();

if (process.env.NODE_ENV !== "production") {
  globalForBus.__chatSubscribers = subscribers;
}

export function subscribe(roomId: string, fn: Subscriber): () => void {
  let set = subscribers.get(roomId);
  if (!set) {
    set = new Set();
    subscribers.set(roomId, set);
  }
  set.add(fn);

  return () => {
    const s = subscribers.get(roomId);
    if (!s) return;
    s.delete(fn);
    if (s.size === 0) subscribers.delete(roomId);
  };
}

export function publish(event: ChatEvent) {
  const set = subscribers.get(event.roomId);
  if (!set) return;
  for (const fn of set) {
    try {
      fn(event);
    } catch {
      // ignore broken subscribers
    }
  }
}
