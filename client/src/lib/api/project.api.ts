import { getJSON, postJSON, putJSON, deleteJSON, type BaseResponse } from "../http-client"

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
