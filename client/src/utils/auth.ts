import type { AuthUser } from '@server/shared/types'

// This is a simplified version of auth functions without error handling.

const TOKEN_KEY = 'token'

export function getStoredAccessToken(storage: Storage): string | null {
  return storage.getItem(TOKEN_KEY)
}

export function clearStoredAccessToken(storage: Storage) {
  storage.removeItem(TOKEN_KEY),
  storage.removeItem('username');
}

export function storeAccessToken(storage: Storage, token: string, username:string) {
  storage.setItem(TOKEN_KEY, token)
  storage.setItem("username", username)
}
export function getStoredUsername(storage: Storage): string | null {
  return storage.getItem('username');
}

export function getUserFromToken(token: string): AuthUser {
  return JSON.parse(atob(token.split('.')[1])).user
}

export function getUserIdFromToken(token: string) {
  return getUserFromToken(token).id
}
