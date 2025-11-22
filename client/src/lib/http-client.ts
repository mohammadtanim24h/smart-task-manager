// export const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000"
const API_BASE_URL = "https://smart-task-manager-3p52.onrender.com"

export type BaseResponse = {
  message?: string
}

export function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem("stm_token")
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }
  return headers
}

export async function postJSON<TResponse>(
  path: string,
  payload: unknown,
): Promise<TResponse> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: getAuthHeaders(),
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

export async function getJSON<TResponse>(path: string): Promise<TResponse> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "GET",
    headers: getAuthHeaders(),
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

export async function putJSON<TResponse>(
  path: string,
  payload: unknown,
): Promise<TResponse> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "PUT",
    headers: getAuthHeaders(),
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

export async function deleteJSON<TResponse>(path: string): Promise<TResponse> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
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
