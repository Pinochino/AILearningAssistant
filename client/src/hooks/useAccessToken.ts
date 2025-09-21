// src/hooks/useAccessToken.ts
import { useCallback } from 'react'

// token lưu trong memory (reload mất)
let accessToken: string | null = null

// 👉 Hook 1: lấy token từ memory
export function useAccessToken() {
  return accessToken
}

// 👉 Hook 2: set/clear token
export function useSetAccessToken() {
  return useCallback((token: string | null) => {
    accessToken = token
  }, [])
}
