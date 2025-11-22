import { getJSON, postJSON, putJSON, deleteJSON, type BaseResponse } from "../http-client"

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
