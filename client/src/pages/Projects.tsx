import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Modal } from "@/components/ui/modal"
import { ConfirmationModal } from "@/components/ui/confirmation-modal"
import { toast } from "sonner"
import { projectApi, teamApi, type Project, type Team } from "@/lib/api"

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    teamId: "",
  })
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      const [projectsResponse, teamsResponse] = await Promise.all([
        projectApi.getProjects(),
        teamApi.getTeams(),
      ])
      setProjects(projectsResponse.projects)
      setTeams(teamsResponse.teams)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data")
    } finally {
      setLoading(false)
    }
  }

  const handleOpenModal = () => {
    setIsModalOpen(true)
    setFormData({ title: "", description: "", teamId: "" })
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setFormData({ title: "", description: "", teamId: "" })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.teamId) {
      setError("Please select a team")
      return
    }

    try {
      await projectApi.createProject({
        title: formData.title.trim(),
        description: formData.description.trim(),
        teamId: formData.teamId,
      })

      await loadData()
      handleCloseModal()
      setError(null)
      toast.success("Project created successfully")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create project")
    }
  }

  const handleDeleteProject = async (projectId: string) => {
    setProjectToDelete(projectId)
    setIsDeleteModalOpen(true)
  }

  const confirmDeleteProject = async () => {
    if (!projectToDelete) return

    try {
      await projectApi.deleteProject(projectToDelete)
      await loadData()
      toast.success("Project deleted successfully")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete project")
    } finally {
      setProjectToDelete(null)
    }
  }

  const getTeamName = (project: Project): string => {
    if (typeof project.teamId === "string") {
      return "Unknown Team"
    }
    return project.teamId.name
  }

  if (loading) {
    return (
      <section className="flex flex-1 flex-col gap-4">
        <header>
          <p className="text-sm uppercase tracking-wide text-gray-500">Projects</p>
          <h1 className="text-3xl font-bold text-gray-900">Project Management</h1>
        </header>
        <div className="rounded-lg border border-dashed border-gray-300 bg-white p-6 text-center text-gray-500">
          Loading projects...
        </div>
      </section>
    )
  }

  return (
    <section className="flex flex-1 flex-col gap-4">
      <header className="flex flex-col md:flex-row md:items-center justify-between space-y-2 md:space-y-0">
        <div>
          <p className="text-sm uppercase tracking-wide text-gray-500">Projects</p>
          <h1 className="text-3xl font-bold text-gray-900">Project Management</h1>
          <p className="mt-2 text-gray-600">
            Manage your projects and track which team each project belongs to.
          </p>
        </div>
        <Button onClick={handleOpenModal} disabled={teams.length === 0}>
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
          Create Project
        </Button>
      </header>

      {error && (
        <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-red-800">
          {error}
        </div>
      )}

      {teams.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 bg-white p-6 text-center text-gray-500">
          No teams found. Please create a team first before creating projects.
        </div>
      ) : projects.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 bg-white p-6 text-center text-gray-500">
          No projects found. Create a project to get started.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Card key={project._id}>
              <CardHeader>
                <CardTitle>{project.title}</CardTitle>
                <CardDescription>
                  Team: {getTeamName(project)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-gray-600">{project.description}</p>
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs text-gray-500">
                      Created: {new Date(project.createdAt).toLocaleDateString()}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleDeleteProject(project._id)}
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
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="Create Project"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              type="text"
              placeholder="Project title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              type="text"
              placeholder="Project description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="teamId">Team</Label>
            <select
              id="teamId"
              value={formData.teamId}
              onChange={(e) =>
                setFormData({ ...formData, teamId: e.target.value })
              }
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              required
            >
              <option value="">Select a team</option>
              {teams.map((team) => (
                <option key={team._id} value={team._id}>
                  {team.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button type="submit">Create Project</Button>
          </div>
        </form>
      </Modal>
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDeleteProject}
        title="Delete Project"
        message="Are you sure you want to delete this project? This action cannot be undone."
      />
    </section>
  )
}

