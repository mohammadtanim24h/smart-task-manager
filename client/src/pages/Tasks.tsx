import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Modal } from "@/components/ui/modal"
import { taskApi, projectApi, type Task, type Project, type ProjectMember } from "@/lib/api"

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [filterProjectId, setFilterProjectId] = useState<string>("")
  const [filterMemberId, setFilterMemberId] = useState<string>("")
  const [formData, setFormData] = useState({
    projectId: "",
    title: "",
    description: "",
    assignedMemberName: "",
    priority: "Low" as "Low" | "Medium" | "High",
    status: "Pending" as "Pending" | "In Progress" | "Done",
  })

  const [projectMembers, setProjectMembers] = useState<ProjectMember[]>([])
  const [membersLoading, setMembersLoading] = useState(false)
  const [isCapacityWarningOpen, setIsCapacityWarningOpen] = useState(false)
  const [pendingAssignedMemberName, setPendingAssignedMemberName] = useState<string>("")

  const autoAssignLowestWorkload = async () => {
    if (!formData.projectId) return
    try {
      setMembersLoading(true)
      const res = await projectApi.getProjectMembers(formData.projectId)
      const members = res.members ?? []
      if (members.length === 0) {
        setFormData({ ...formData, assignedMemberName: "" })
        return
      }
      const chosen = members
        .slice()
        .sort((a, b) => {
          if (a.currentTasks !== b.currentTasks) return a.currentTasks - b.currentTasks
          const ar = a.capacity - a.currentTasks
          const br = b.capacity - b.currentTasks
          if (ar !== br) return br - ar
          return a.name.localeCompare(b.name)
        })[0]
      const overCapacity = chosen.currentTasks >= chosen.capacity
      if (overCapacity) {
        setPendingAssignedMemberName(chosen.name)
        setIsCapacityWarningOpen(true)
      } else {
        setFormData({ ...formData, assignedMemberName: chosen.name })
      }
    } catch {
    } finally {
      setMembersLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    const fetchMembers = async () => {
      if (!isModalOpen || !formData.projectId) {
        setProjectMembers([])
        return
      }
      try {
        setMembersLoading(true)
        const res = await projectApi.getProjectMembers(formData.projectId)
        const members = res.members ?? []
        const currentName = formData.assignedMemberName
        const hasCurrent = currentName ? members.some((m) => m.name === currentName) : true
        setProjectMembers(
          hasCurrent || !currentName
            ? members
            : [...members, { name: currentName, role: "", capacity: 0, currentTasks: 0 }]
        )
      } catch (err) {
      } finally {
        setMembersLoading(false)
      }
    }
    fetchMembers()
  }, [isModalOpen, formData.projectId, formData.assignedMemberName])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      const [tasksResponse, projectsResponse] = await Promise.all([
        taskApi.getTasks(),
        projectApi.getProjects(),
      ])
      setTasks(tasksResponse.tasks)
      setProjects(projectsResponse.projects)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data")
    } finally {
      setLoading(false)
    }
  }

  const handleOpenModal = (task?: Task) => {
    if (task) {
      setEditingTask(task)
      const assignedMemberName =
        task.assignedMemberName
          ? task.assignedMemberName : ""
      setFormData({
        projectId:
          typeof task.projectId === "object" ? task.projectId._id : task.projectId,
        title: task.title,
        description: task.description,
        assignedMemberName,
        priority: task.priority,
        status: task.status,
      })
      if (assignedMemberName) {
        setProjectMembers((prev) => {
          const exists = prev.some((m) => m.name === assignedMemberName)
          return exists ? prev : [...prev, { name: assignedMemberName, role: "", capacity: 0, currentTasks: 0 }]
        })
      }
    } else {
      setEditingTask(null)
      setFormData({
        projectId: "",
        title: "",
        description: "",
        assignedMemberName: "",
        priority: "Low",
        status: "Pending",
      })
    }
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingTask(null)
    setFormData({
      projectId: "",
      title: "",
      description: "",
      assignedMemberName: "",
      priority: "Low",
      status: "Pending",
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.projectId) {
      setError("Please select a project")
      return
    }

    try {
      const payload = {
        projectId: formData.projectId,
        title: formData.title.trim(),
        description: formData.description.trim(),
        assignedMemberName: formData.assignedMemberName || null,
        priority: formData.priority,
        status: formData.status,
      }

      if (editingTask) {
        await taskApi.updateTask(editingTask._id, payload)
      } else {
        await taskApi.createTask(payload)
      }

      await loadData()
      handleCloseModal()
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save task")
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm("Are you sure you want to delete this task?")) return

    try {
      await taskApi.deleteTask(taskId)
      await loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete task")
    }
  }

  const handleReassignTasks = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await taskApi.reassignTasks(filterProjectId || undefined)
      await loadData()
      if (res.message) {
        // no-op, message available if needed
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reassign tasks")
    } finally {
      setLoading(false)
    }
  }

  const getAssignedMemberName = (task: Task): string => {
    return task.assignedMemberName || "Unassigned"
  }

  const getProjectName = (task: Task): string => {
    if (typeof task.projectId === "object") {
      return task.projectId.title
    }
    const project = projects.find((p) => p._id === task.projectId)
    return project?.title || "Unknown Project"
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "bg-red-100 text-red-800 border-red-300"
      case "Medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-300"
      case "Low":
        return "bg-green-100 text-green-800 border-green-300"
      default:
        return "bg-gray-100 text-gray-800 border-gray-300"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Done":
        return "bg-blue-100 text-blue-800 border-blue-300"
      case "In Progress":
        return "bg-purple-100 text-purple-800 border-purple-300"
      case "Pending":
        return "bg-gray-100 text-gray-800 border-gray-300"
      default:
        return "bg-gray-100 text-gray-800 border-gray-300"
    }
  }

  // Extract unique member names from tasks
  const getUniqueMembers = (): string[] => {
    const names = new Set<string>()
    tasks.forEach((task) => {
      if (task.assignedMemberName) {
        names.add(task.assignedMemberName)
      }
    })
    return Array.from(names.values())
  }

  // Filter tasks based on selected filters
  const filteredTasks = tasks.filter((task) => {
    // Filter by project
    if (filterProjectId) {
      const taskProjectId =
        typeof task.projectId === "object" ? task.projectId._id : task.projectId
      if (taskProjectId !== filterProjectId) {
        return false
      }
    }

    // Filter by member
    if (filterMemberId) {
      if (filterMemberId === "unassigned") {
        if (task.assignedMemberName) {
          return false
        }
      } else {
        if (!task.assignedMemberName) {
          return false
        }
        if (task.assignedMemberName !== filterMemberId) {
          return false
        }
      }
    }

    return true
  })

  if (loading) {
    return (
      <section className="flex flex-1 flex-col gap-4">
        <header>
          <p className="text-sm uppercase tracking-wide text-gray-500">Tasks</p>
          <h1 className="text-3xl font-bold text-gray-900">Your task board</h1>
        </header>
        <div className="rounded-lg border border-dashed border-gray-300 bg-white p-6 text-center text-gray-500">
          Loading tasks...
        </div>
      </section>
    )
  }

  return (
    <section className="flex flex-1 flex-col gap-4">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-wide text-gray-500">Tasks</p>
          <h1 className="text-3xl font-bold text-gray-900">Your task board</h1>
          <p className="mt-2 text-gray-600">
            Manage your tasks, track progress, and assign work to team members.
          </p>
        </div>
        <div className="flex gap-2">
        <Button onClick={() => handleOpenModal()} disabled={projects.length === 0}>
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
          Create Task
        </Button>
        <Button variant="outline" onClick={handleReassignTasks} disabled={projects.length === 0}>
          Reassign Tasks
        </Button>
        </div>
      </header>

      {error && (
        <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-red-800">
          {error}
        </div>
      )}

      {projects.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 bg-white p-6 text-center text-gray-500">
          No projects found. Please create a project first before creating tasks.
        </div>
      ) : (
        <>
          {/* Filters */}
          <div className="flex flex-wrap gap-4 rounded-lg border bg-white p-4">
            <div className="flex-1 min-w-[200px]">
              <Label htmlFor="filter-project" className="text-sm font-medium text-gray-700">
                Filter by Project
              </Label>
              <select
                id="filter-project"
                value={filterProjectId}
                onChange={(e) => setFilterProjectId(e.target.value)}
                className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">All Projects</option>
                {projects.map((project) => (
                  <option key={project._id} value={project._id}>
                    {project.title}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1 min-w-[200px]">
              <Label htmlFor="filter-member" className="text-sm font-medium text-gray-700">
                Filter by Member
              </Label>
              <select
                id="filter-member"
                value={filterMemberId}
                onChange={(e) => setFilterMemberId(e.target.value)}
                className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">All Members</option>
                {getUniqueMembers().map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
                <option value="unassigned">Unassigned</option>
              </select>
            </div>
            {(filterProjectId || filterMemberId) && (
              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setFilterProjectId("")
                    setFilterMemberId("")
                  }}
                  className="h-10"
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </div>

          {filteredTasks.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-300 bg-white p-6 text-center text-gray-500">
              No tasks found matching the selected filters.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredTasks.map((task) => (
            <Card key={task._id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{task.title}</CardTitle>
                    <CardDescription className="mt-1">
                      {getProjectName(task)}
                    </CardDescription>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleOpenModal(task)}
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
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
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleDeleteTask(task._id)}
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
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-gray-600 line-clamp-3">{task.description}</p>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Assigned Member:</span>
                      <span className="font-medium text-gray-900">
                        {getAssignedMemberName(task)}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Priority:</span>
                      <span
                        className={`rounded-full border px-2 py-1 text-xs font-medium ${getPriorityColor(
                          task.priority
                        )}`}
                      >
                        {task.priority}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Status:</span>
                      <span
                        className={`rounded-full border px-2 py-1 text-xs font-medium ${getStatusColor(
                          task.status
                        )}`}
                      >
                        {task.status}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 text-xs text-gray-500">
                    Created: {new Date(task.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </CardContent>
            </Card>
              ))}
            </div>
          )}
        </>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingTask ? "Edit Task" : "Create Task"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="projectId">Project *</Label>
            <select
              id="projectId"
              value={formData.projectId}
              onChange={(e) =>
                setFormData({ ...formData, projectId: e.target.value })
              }
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              required
            >
              <option value="">Select a project</option>
              {projects.map((project) => (
                <option key={project._id} value={project._id}>
                  {project.title}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              type="text"
              placeholder="Task title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <textarea
              id="description"
              placeholder="Task description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="assignedMemberName">Assigned Member (Optional)</Label>
            <select
              id="assignedMemberName"
              value={formData.assignedMemberName}
              onChange={(e) => {
                const next = e.target.value
                if (!next) {
                  setFormData({ ...formData, assignedMemberName: "" })
                  return
                }
                const member = projectMembers.find((m) => (m.name || "") === next)
                const overCapacity = member ? member.currentTasks >= member.capacity : false
                if (overCapacity) {
                  setPendingAssignedMemberName(next)
                  setIsCapacityWarningOpen(true)
                } else {
                  setFormData({ ...formData, assignedMemberName: next })
                }
              }}
              disabled={!formData.projectId || membersLoading}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">Unassigned</option>
              {projectMembers.map((member, idx) => (
                <option
                  key={idx}
                  value={member.name || ""}
                >
                  {`${member.name} - ${member.currentTasks}/${member.capacity}`}
                </option>
              ))}
            </select>
            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={autoAssignLowestWorkload}
                disabled={!formData.projectId || membersLoading}
              >
                Auto Assign
              </Button>
            </div>
            <p className="text-xs text-gray-500">
              Select a project to load its team members.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">Priority *</Label>
            <select
              id="priority"
              value={formData.priority}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  priority: e.target.value as "Low" | "Medium" | "High",
                })
              }
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              required
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status *</Label>
            <select
              id="status"
              value={formData.status}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  status: e.target.value as "Pending" | "In Progress" | "Done",
                })
              }
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              required
            >
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Done">Done</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button type="submit">{editingTask ? "Update Task" : "Create Task"}</Button>
          </div>
        </form>
      </Modal>
      <Modal
        isOpen={isCapacityWarningOpen}
        onClose={() => setIsCapacityWarningOpen(false)}
        title={"Member Over Capacity"}
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-700">
            The selected member is at or over their capacity.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsCapacityWarningOpen(false)
              }}
            >
              Choose Another
            </Button>
            <Button
              onClick={() => {
                if (pendingAssignedMemberName) {
                  setFormData({ ...formData, assignedMemberName: pendingAssignedMemberName })
                }
                setIsCapacityWarningOpen(false)
                setPendingAssignedMemberName("")
              }}
            >
              Assign Anyway
            </Button>
          </div>
        </div>
      </Modal>
    </section>
  )
}
