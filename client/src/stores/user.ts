import {
  clearStoredAccessToken,
  getStoredAccessToken,
  getStoredUsername,
  getUserIdFromToken,
  storeAccessToken,
} from '@/utils/auth'
import { trpc } from '@/trpc'
import { computed, ref } from 'vue'


const authToken = ref<string | null>(getStoredAccessToken(localStorage))
const authUsername = ref<string | null>(getStoredUsername(localStorage))

export const authUserId = computed(() =>
  authToken.value ? getUserIdFromToken(authToken.value) : null
)
export const isLoggedIn = computed(() => !!authToken.value)
export const username = computed(() => authUsername.value)

export async function login(userLogin: { username: string; password: string }) {
  const { accessToken } = await trpc.users.login.mutate(userLogin)
  authUsername.value = userLogin.username
  authToken.value = accessToken
  storeAccessToken(localStorage, accessToken, userLogin.username)
}

export function logout() {
  authToken.value = null
  authUsername.value = null
  clearStoredAccessToken(localStorage)
}

export const signup = trpc.users.signup.mutate

