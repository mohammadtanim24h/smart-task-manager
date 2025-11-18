const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000"

type BaseResponse = {
  message?: string
}

type AuthUser = {
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

async function postJSON<TResponse>(
  path: string,
  payload: unknown,
): Promise<TResponse> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })

  let data: unknown = null
  const contentType = response.headers.get("content-type")
  if (contentType && contentType.includes("application/json")) {
    data = await response.json()
  }

  if (!response.ok) {
    const message =
      typeof data === "object" && data !== null && "message" in data
        ? String((data as Record<string, unknown>).message)
        : "Request failed"
    throw new Error(message)
  }

  return data as TResponse
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

