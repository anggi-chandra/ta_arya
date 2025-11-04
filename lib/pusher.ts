import Pusher from 'pusher-js';

// Inisialisasi Pusher client
export const pusherClient = new Pusher(
  process.env.NEXT_PUBLIC_PUSHER_APP_KEY || '',
  {
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || '',
    forceTLS: true,
  }
);

// Inisialisasi Pusher server (untuk API routes)
import PusherServer from 'pusher';

export const pusherServer = new PusherServer({
  appId: process.env.PUSHER_APP_ID || '',
  key: process.env.NEXT_PUBLIC_PUSHER_APP_KEY || '',
  secret: process.env.PUSHER_SECRET || '',
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || '',
  useTLS: true,
});