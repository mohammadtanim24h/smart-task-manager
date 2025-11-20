const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000"
// const API_BASE_URL = "https://smart-task-manager-3p52.onrender.com"

type BaseResponse = {
  message?: string
}

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

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem("stm_token")
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }
  return headers
}

async function postJSON<TResponse>(
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

async function getJSON<TResponse>(path: string): Promise<TResponse> {
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

async function putJSON<TResponse>(
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

async function deleteJSON<TResponse>(path: string): Promise<TResponse> {
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

export type TeamMember = {
  name: string
  role: string
  capacity: number
}

export type Team = {
  _id: string
  name: string
  ownerId: string
  members: TeamMember[]
  createdAt: string
  updatedAt: string
}

export type TeamsResponse = BaseResponse & {
  teams: Team[]
}

export type TeamResponse = BaseResponse & {
  team: Team
}

export type CreateTeamPayload = {
  name: string
  members?: TeamMember[]
}

export type AddMemberPayload = {
  name: string
  role: string
  capacity: number
}

export const teamApi = {
  getTeams: () => getJSON<TeamsResponse>("/api/teams"),
  createTeam: (payload: CreateTeamPayload) =>
    postJSON<TeamResponse>("/api/teams", payload),
  updateTeam: (id: string, payload: Partial<CreateTeamPayload>) =>
    putJSON<TeamResponse>(`/api/teams/${id}`, payload),
  deleteTeam: (id: string) => deleteJSON<BaseResponse>(`/api/teams/${id}`),
  addMember: (teamId: string, payload: AddMemberPayload) =>
    postJSON<TeamResponse>(`/api/teams/${teamId}/members`, payload),
  updateMember: (
    teamId: string,
    memberIndex: number,
    payload: Partial<AddMemberPayload>,
  ) =>
    putJSON<TeamResponse>(
      `/api/teams/${teamId}/members/${memberIndex}`,
      payload,
    ),
  deleteMember: (teamId: string, memberIndex: number) =>
    deleteJSON<TeamResponse>(`/api/teams/${teamId}/members/${memberIndex}`),
}

export type ProjectTeam = {
  _id: string
  name: string
}

export type Project = {
  _id: string
  title: string
  description: string
  teamId: string | ProjectTeam
  createdAt: string
  updatedAt: string
}

export type ProjectsResponse = BaseResponse & {
  projects: Project[]
}

export type ProjectResponse = BaseResponse & {
  project: Project
}

export type ProjectMember = {
  name: string
  role: string
  capacity: number
  currentTasks: number
}

export type ProjectMembersResponse = BaseResponse & {
  members: ProjectMember[]
}

export type CreateProjectPayload = {
  title: string
  description: string
  teamId: string
}

export const projectApi = {
  getProjects: (teamId?: string) => {
    const query = teamId ? `?teamId=${teamId}` : ""
    return getJSON<ProjectsResponse>(`/api/projects${query}`)
  },
  getProjectMembers: (projectId: string) =>
    getJSON<ProjectMembersResponse>(`/api/projects/${projectId}/members`),
  createProject: (payload: CreateProjectPayload) =>
    postJSON<ProjectResponse>("/api/projects", payload),
  updateProject: (id: string, payload: Partial<CreateProjectPayload>) =>
    putJSON<ProjectResponse>(`/api/projects/${id}`, payload),
  deleteProject: (id: string) => deleteJSON<BaseResponse>(`/api/projects/${id}`),
}

export type AssignedUser = {
  _id: string
  name: string
  email: string
}

export type TaskProject = {
  _id: string
  title: string
}

export type Task = {
  _id: string
  projectId: string | TaskProject
  title: string
  description: string
  assignedMemberName?: string | null
  priority: "Low" | "Medium" | "High"
  status: "Pending" | "In Progress" | "Done"
  createdAt: string
  updatedAt: string
}

export type TasksResponse = BaseResponse & {
  tasks: Task[]
}

export type TaskResponse = BaseResponse & {
  task: Task
}

export type CreateTaskPayload = {
  projectId: string
  title: string
  description: string
  assignedMemberName?: string | null
  priority?: "Low" | "Medium" | "High"
  status?: "Pending" | "In Progress" | "Done"
}

export const taskApi = {
  getTasks: (projectId?: string, assignedMemberName?: string) => {
    const params = new URLSearchParams()
    if (projectId) params.append("projectId", projectId)
    if (assignedMemberName) params.append("assignedMemberName", assignedMemberName)
    const query = params.toString() ? `?${params.toString()}` : ""
    return getJSON<TasksResponse>(`/api/tasks${query}`)
  },
  createTask: (payload: CreateTaskPayload) =>
    postJSON<TaskResponse>("/api/tasks", payload),
  updateTask: (id: string, payload: Partial<CreateTaskPayload>) =>
    putJSON<TaskResponse>(`/api/tasks/${id}`, payload),
  deleteTask: (id: string) => deleteJSON<BaseResponse>(`/api/tasks/${id}`),
  reassignTasks: (projectId?: string) =>
    postJSON<TasksResponse>("/api/tasks/reassign", projectId ? { projectId } : {}),
}

