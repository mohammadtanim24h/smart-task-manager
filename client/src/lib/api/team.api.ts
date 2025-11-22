import { getJSON, postJSON, putJSON, deleteJSON, type BaseResponse } from "../http-client"

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
