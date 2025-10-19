/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_SOCKET_URL: string
    // thêm các biến VITE_ khác mà mày dùng
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
