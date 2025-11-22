import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { taskApi, dashboardApi, type DashboardStats } from "@/lib/api"

export default function Dashboard() {
    const [stats, setStats] = useState<DashboardStats | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [reassigning, setReassigning] = useState(false)

    const loadData = async () => {
        try {
            setLoading(true)
            setError(null)
            const data = await dashboardApi.getStats()
            setStats(data)
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load dashboard")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadData()
    }, [])

    const handleReassignTasks = async () => {
        try {
            setReassigning(true)
            const res = await taskApi.reassignTasks()
            const count = res.tasks?.length ?? 0
            if (count > 0) {
                toast.success(`${count} task${count === 1 ? "" : "s"} reassigned`)
            } else {
                toast.info("No tasks were reassigned")
            }
            await loadData()
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to reassign tasks")
        } finally {
            setReassigning(false)
        }
    }

    function formatDate(dateString: string) {
        const date = new Date(dateString);

        const day = date.getDate().toString().padStart(2, "0");

        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const month = months[date.getMonth()];

        const year = date.getFullYear();

        let hours = date.getHours();
        const minutes = date.getMinutes().toString().padStart(2, "0");

        const ampm = hours >= 12 ? "PM" : "AM";
        hours = hours % 12 || 12; // convert 0 → 12
        const hoursStr = hours.toString().padStart(2, "0");

        return `${day} ${month} ${year}, ${hoursStr}:${minutes} ${ampm}`;
    }

    if (loading) {
        return (
            <div className="flex flex-1 flex-col gap-4">
                <header>
                    <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                </header>
                <div className="rounded-lg border border-dashed border-gray-300 bg-white p-6 text-center text-gray-500">
                    Loading dashboard...
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex flex-1 flex-col gap-4">
                <header>
                    <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                </header>
                <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-red-800">
                    {error}
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-1 flex-col gap-6">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                    <p className="mt-2 text-gray-600">
                        Overview of your projects, tasks, and team workload.
                    </p>
                </div>
                <Button onClick={handleReassignTasks} disabled={reassigning}>
                    {reassigning ? "Reassigning..." : "Reassign Tasks"}
                </Button>
            </header>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg font-medium text-gray-500">
                            Total Projects
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.totalProjects}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg font-medium text-gray-500">
                            Total Tasks
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.totalTasks}</div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Team Workload */}
                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle>Team Summary</CardTitle>
                        <CardDescription>
                            Current task distribution among team members.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {stats?.workload.map((member) => {
                                const isUnassigned = member.memberName === "Unassigned";
                                const isOverCapacity = member.count > member.capacity
                                return (
                                    <div
                                        key={member.memberName}
                                        className={`flex items-center justify-between rounded-lg border p-3 ${isOverCapacity && !isUnassigned ? "border-red-200 bg-red-50" : "border-gray-100"
                                            }`}
                                    >
                                        <div>
                                            <div className="font-medium text-gray-900">
                                                {member.memberName}
                                            </div>
                                            {!isUnassigned && (
                                                <div className="text-xs text-gray-500">
                                                    Capacity: {member.capacity}
                                                </div>
                                            )}
                                        </div>
                                        <div className="text-right">
                                            <div
                                                className={`text-lg font-bold ${isOverCapacity && !isUnassigned ? "text-red-600" : "text-gray-900"
                                                    }`}
                                            >
                                                {member.count}
                                            </div>
                                            <div className="text-xs text-gray-500">Tasks</div>
                                        </div>
                                    </div>
                                )
                            })}
                            {stats?.workload.length === 0 && (
                                <div className="text-center text-sm text-gray-500">
                                    No team data available.
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card className="col-span-1">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Recent Activity</CardTitle>
                            <CardDescription>
                                Latest task updates and reassignments.
                            </CardDescription>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                            <a href="/activity-logs">View All</a>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {stats?.activityLogs.map((log) => (
                                <div
                                    key={log._id}
                                    className="flex flex-col gap-1 border-b border-gray-100 pb-3 last:border-0 last:pb-0"
                                >
                                    <div className="text-sm font-medium text-gray-900">
                                        {log.message}
                                    </div>
                                    <div className="flex items-center justify-between text-xs text-gray-500">
                                        <span>
                                            Task:{" "}
                                            <span className="font-medium text-gray-700">
                                                {log.taskId?.title || "Unknown Task"}
                                            </span>
                                        </span>
                                        <span>{formatDate(log.createdAt)}</span>
                                    </div>
                                </div>
                            ))}
                            {stats?.activityLogs.length === 0 && (
                                <div className="text-center text-sm text-gray-500">
                                    No recent reassignments.
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
