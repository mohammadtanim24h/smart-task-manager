import { getJSON } from "../http-client"

export type ActivityLog = {
  _id: string
  message: string
  taskId: {
    _id: string
    title: string
  }
  fromMemberName: string
  createdAt: string
}

export type ActivityLogsResponse = {
  logs: ActivityLog[]
}

export const activityLogsApi = {
  getLogs: () => getJSON<ActivityLogsResponse>("/api/activity-logs"),
}
