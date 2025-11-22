import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Modal } from "@/components/ui/modal"
import { ConfirmationModal } from "@/components/ui/confirmation-modal"
import { toast } from "sonner"
import { teamApi, type Team } from "@/lib/api"

export default function Teams() {
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isCreateTeamModalOpen, setIsCreateTeamModalOpen] = useState(false)
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    capacity: "",
  })
  const [createTeamFormData, setCreateTeamFormData] = useState({
    name: "",
  })
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [memberToDelete, setMemberToDelete] = useState<{ teamId: string; index: number } | null>(null)

  useEffect(() => {
    loadTeams()
  }, [])

  const loadTeams = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await teamApi.getTeams()
      setTeams(response.teams)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load teams")
    } finally {
      setLoading(false)
    }
  }

  const handleOpenModal = (teamId: string) => {
    setSelectedTeamId(teamId)
    setIsModalOpen(true)
    setFormData({ name: "", role: "", capacity: "" })
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedTeamId(null)
    setFormData({ name: "", role: "", capacity: "" })
  }

  const handleOpenCreateTeamModal = () => {
    setIsCreateTeamModalOpen(true)
    setCreateTeamFormData({ name: "" })
  }

  const handleCloseCreateTeamModal = () => {
    setIsCreateTeamModalOpen(false)
    setCreateTeamFormData({ name: "" })
  }

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await teamApi.createTeam({
        name: createTeamFormData.name.trim(),
      })

      await loadTeams()
      handleCloseCreateTeamModal()
      setError(null)
      toast.success("Team created successfully")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create team")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTeamId) return

    try {
      const capacity = parseFloat(formData.capacity)
      if (isNaN(capacity) || capacity < 0) {
        setError("Capacity must be a non-negative number")
        return
      }

      await teamApi.addMember(selectedTeamId, {
        name: formData.name.trim(),
        role: formData.role.trim(),
        capacity,
      })

      await loadTeams()
      handleCloseModal()
      setError(null)
      toast.success("Member added successfully")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add member")
    }
  }

  const handleDeleteMember = async (teamId: string, memberIndex: number) => {
    setMemberToDelete({ teamId, index: memberIndex })
    setIsDeleteModalOpen(true)
  }

  const confirmDeleteMember = async () => {
    if (!memberToDelete) return

    try {
      await teamApi.deleteMember(memberToDelete.teamId, memberToDelete.index)
      await loadTeams()
      toast.success("Member removed successfully")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete member")
    } finally {
      setMemberToDelete(null)
    }
  }

  if (loading) {
    return (
      <section className="flex flex-1 flex-col gap-4">
        <header>
          <p className="text-sm uppercase tracking-wide text-gray-500">Teams</p>
          <h1 className="text-3xl font-bold text-gray-900">Team Management</h1>
        </header>
        <div className="rounded-lg border border-dashed border-gray-300 bg-white p-6 text-center text-gray-500">
          Loading teams...
        </div>
      </section>
    )
  }

  return (
    <section className="flex flex-1 flex-col gap-4">
      <header>
        <div className="flex flex-col md:flex-row md:items-center justify-between space-y-2 md:space-y-0">
          <div>
            <p className="text-sm uppercase tracking-wide text-gray-500">Teams</p>
            <h1 className="text-3xl font-bold text-gray-900">Team Management</h1>
            <p className="mt-2 text-gray-600">
              Manage your teams and their members. Add members to track capacity and roles.
            </p>
          </div>
          <Button onClick={handleOpenCreateTeamModal}>
            <svg
              className="mr-2 h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Create Team
          </Button>
        </div>
      </header>

      {error && (
        <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-red-800">
          {error}
        </div>
      )}

      {teams.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 bg-white p-6 text-center text-gray-500">
          No teams found. Create a team to get started.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {teams.map((team) => (
            <Card key={team._id}>
              <CardHeader>
                <CardTitle>{team.name}</CardTitle>
                <CardDescription>
                  {team.members.length} {team.members.length === 1 ? "member" : "members"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {team.members.length > 0 ? (
                    <div className="space-y-2">
                      {team.members.map((member, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between rounded-md border bg-gray-50 p-3"
                        >
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{member.name}</p>
                            <p className="text-sm text-gray-600">{member.role}</p>
                            <p className="text-xs text-gray-500">
                              Capacity: {member.capacity}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleDeleteMember(team._id, index)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <svg
                              className="h-4 w-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No members yet</p>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => handleOpenModal(team._id)}
                  >
                    <svg
                      className="mr-2 h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    Add Member
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="Add Team Member"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Member name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Input
              id="role"
              type="text"
              placeholder="e.g., Developer, Designer"
              value={formData.role}
              onChange={(e) =>
                setFormData({ ...formData, role: e.target.value })
              }
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="capacity">Capacity</Label>
            <Input
              id="capacity"
              type="number"
              placeholder="0"
              min="0"
              step="0.1"
              value={formData.capacity}
              onChange={(e) =>
                setFormData({ ...formData, capacity: e.target.value })
              }
              required
            />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button type="submit">Add Member</Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isCreateTeamModalOpen}
        onClose={handleCloseCreateTeamModal}
        title="Create New Team"
      >
        <form onSubmit={handleCreateTeam} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="teamName">Team Name</Label>
            <Input
              id="teamName"
              type="text"
              placeholder="Enter team name"
              value={createTeamFormData.name}
              onChange={(e) =>
                setCreateTeamFormData({ name: e.target.value })
              }
              required
            />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCloseCreateTeamModal}
            >
              Cancel
            </Button>
            <Button type="submit">Create Team</Button>
          </div>
        </form>
      </Modal>
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDeleteMember}
        title="Remove Member"
        message="Are you sure you want to remove this member from the team? This action cannot be undone."
        confirmText="Remove"
      />
    </section>
  )
}

