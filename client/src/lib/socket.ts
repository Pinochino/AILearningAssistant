import { io, Socket } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:4000";
const TOKEN_KEY = "atiui_token";

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (socket && socket.connected) return socket;

  const token = typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null;

  socket = io(SOCKET_URL, {
    transports: ["websocket"],
    autoConnect: true,
    withCredentials: true,
    auth: { token: token || "" },
  });

  // Optional: basic listeners
  socket.on("connect", () => {
    console.log("Socket connected", socket?.id);
  });

  socket.on("connect_error", (err) => {
    console.error("Socket connect_error:", err.message);
  });

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
