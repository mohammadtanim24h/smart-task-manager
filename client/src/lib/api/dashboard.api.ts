import { getJSON } from "../http-client"
import type { ActivityLog } from "./activity.api"

export type Workload = {
  memberName: string
  count: number
  pending: number
  inProgress: number
  done: number
  capacity: number
}

export type DashboardStats = {
  totalProjects: number
  totalTasks: number
  workload: Workload[]
  activityLogs: ActivityLog[]
}

export const dashboardApi = {
  getStats: () => getJSON<DashboardStats>("/api/dashboard"),
}
