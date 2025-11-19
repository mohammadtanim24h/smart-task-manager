import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"

export default function Home() {
  return (
    <section className="flex flex-1 flex-col gap-6">
      <div>
        <p className="text-sm uppercase tracking-wide text-gray-500">
          Welcome back
        </p>
        <h1 className="text-3xl font-bold text-gray-900">
          Organize your team&apos;s work
        </h1>
        {/* <p className="mt-2 text-gray-600">
          Jump into the dashboard to see what&apos;s coming up or head
          straight to the task board to make updates.
        </p> */}
      </div>
      <div className="flex flex-wrap gap-3">
        <Button asChild>
          <Link to="/tasks">View tasks</Link>
        </Button>
      </div>
    </section>
  )
}

