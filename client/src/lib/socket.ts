// client/src/lib/socket.ts
import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;
let connecting = false;

const API_URL =
  (import.meta as any).env?.VITE_API_URL || 'http://localhost:4000';

const TOKEN_KEY = 'atiui_token';

/**
 * Chỉ tạo socket khi có token và chưa có kết nối
 */
export async function ensureSocketConnected(): Promise<Socket> {
  if (socket && socket.connected) return socket;
  if (connecting) {
    // Đợi socket cũ đang connect dở
    return new Promise((resolve, reject) => {
      const interval = setInterval(() => {
        if (socket && socket.connected) {
          clearInterval(interval);
          resolve(socket);
        }
      }, 300);
      setTimeout(() => {
        clearInterval(interval);
        reject(new Error('Socket timeout'));
      }, 5000);
    });
  }

  connecting = true;
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) {
    connecting = false;
    throw new Error('No token found');
  }

  return new Promise((resolve, reject) => {
    try {
      // ✅ chỉ khởi tạo socket ở đây, không auto connect từ đầu
      socket = io(API_URL, {
        autoConnect: false,
        transports: ['websocket'],
        // Send token via auth payload (server reads from socket.handshake.auth.token)
        auth: { token },
      });

      // Always refresh auth payload right before (re)connect
      socket.auth = { token };
      socket.connect();

      socket.on('connect', () => {
        console.log('[socket] connected ✅', socket?.id);
        connecting = false;
        resolve(socket!);
      });

      socket.on('connect_error', (err) => {
        console.error('[socket] connect_error ❌', err);
        connecting = false;
        reject(err);
      });

      // On reconnection attempts, re-attach the latest token from storage
      socket.io.on('reconnect_attempt', () => {
        try {
          const latest = localStorage.getItem(TOKEN_KEY) || '';
          if (socket) socket.auth = { token: latest } as any;
        } catch {}
      });

      socket.on('disconnect', (reason) => {
        console.warn('[socket] disconnected:', reason);
      });
    } catch (err) {
      connecting = false;
      reject(err);
    }
  });
}

/**
 * Lấy socket hiện tại (nếu có)
 */
export function getSocket(): Socket | null {
  return socket;
}

// Allow callers (e.g., after login) to refresh the auth payload before connecting
export function refreshSocketAuthFromStorage() {
  if (!socket) return;
  try {
    const latest = localStorage.getItem(TOKEN_KEY) || '';
    (socket as any).auth = { token: latest };
  } catch {}
}

/**
 * Ngắt kết nối socket
 */
export function disconnectSocket() {
  if (socket && socket.connected) {
    socket.disconnect();
    console.log('[socket] manually disconnected');
  }
}

// Hard reset socket state (use before connecting with a new token)
export function resetSocket() {
  try {
    if (socket) {
      try { if (socket.connected) socket.disconnect(); } catch {}
    }
  } finally {
    socket = null;
    connecting = false;
  }
}

/**
 * Gửi message qua socket
 */
export function sendMessage(data: any) {
  if (!socket || !socket.connected) {
    console.warn('[socket] not connected, skipping message send');
    return;
  }
  socket.emit('send_message', data);
}

/**
 * Lắng nghe event từ server
 */
export function onSocketEvent(event: string, handler: (...args: any[]) => void) {
  if (!socket) return;
  socket.on(event, handler);
}
