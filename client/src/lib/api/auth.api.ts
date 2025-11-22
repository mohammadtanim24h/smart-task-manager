import { postJSON, type BaseResponse } from "../http-client"

export type AuthUser = {
  id: string
  name: string
  email: string
  createdAt: string
}

export type AuthResponse = BaseResponse & {
  token: string
  user: AuthUser
}

export type LoginPayload = {
  email: string
  password: string
}

export type RegisterPayload = LoginPayload & {
  name: string
}

export const authApi = {
  login: (payload: LoginPayload) =>
    postJSON<AuthResponse>("/api/auth/login", payload),
  register: (payload: RegisterPayload) =>
    postJSON<AuthResponse>("/api/auth/register", payload),
}

export const authStorage = {
  persist(auth: AuthResponse) {
    localStorage.setItem("stm_token", auth.token)
    localStorage.setItem("stm_user", JSON.stringify(auth.user))
  },
}
