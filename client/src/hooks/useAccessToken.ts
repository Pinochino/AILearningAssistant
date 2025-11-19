// In-memory access token holder (clears on reload)
let accessToken: string | null = null

export function useAccessToken() {
  return accessToken
}

export function useSetAccessToken() {
  return (token: string | null) => {
    accessToken = token
  }
}
