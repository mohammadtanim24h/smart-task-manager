import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Activity } from "lucide-react"
import { activityLogsApi, type ActivityLog } from "@/lib/api"
import { formatDistanceToNow } from "date-fns"

export default function ActivityLogs() {
    const navigate = useNavigate()
    const [logs, setLogs] = useState<ActivityLog[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        fetchLogs()
    }, [])

    const fetchLogs = async () => {
        try {
            setLoading(true)
            const data = await activityLogsApi.getLogs()
            setLogs(data.logs)
            setError(null)
        } catch (err) {
            setError("Failed to load activity logs")
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="w-full space-y-6">
            <div className="flex items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Activity Log</h1>
                    <p className="text-muted-foreground">
                        View all task updates.
                    </p>
                </div>
                <Button variant="outline" size="sm" onClick={() => navigate("/")}>
                    <ArrowLeft className="h-4 w-4" />
                    Back
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Activities</CardTitle>
                    <CardDescription>
                        A complete history of task reassignments and updates.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-center py-4">Loading activities...</div>
                    ) : error ? (
                        <div className="text-center text-red-500 py-4">{error}</div>
                    ) : logs.length === 0 ? (
                        <div className="text-center text-muted-foreground py-4">
                            No activity logs found.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {logs.map((log) => (
                                <div
                                    key={log._id}
                                    className="flex items-start space-x-4 rounded-md border p-4 transition-colors hover:bg-muted/50"
                                >
                                    <Activity className="mt-0.5 h-5 w-5 text-muted-foreground" />
                                    <div className="flex-1 space-y-1">
                                        <p className="text-sm font-medium leading-none">
                                            {log.message}
                                        </p>
                                        <div className="flex items-center text-xs text-muted-foreground">
                                            <span>
                                                {formatDistanceToNow(new Date(log.createdAt), {
                                                    addSuffix: true,
                                                })}
                                            </span>
                                            {log.taskId && (
                                                <>
                                                    <span className="mx-1">•</span>
                                                    <span>Task: {log.taskId.title}</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
