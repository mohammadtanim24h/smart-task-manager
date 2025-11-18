import { Link, Outlet } from "react-router-dom"

import { Button } from "@/components/ui/button"

function App() {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50 text-gray-900">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <Link to="/" className="text-xl font-semibold">
            Smart Task Manager
          </Link>
          <nav className="flex items-center gap-4 text-sm font-medium">
            <Link to="/" className="hover:text-blue-600">
              Dashboard
            </Link>
            <Link to="/tasks" className="hover:text-blue-600">
              Tasks
            </Link>
            <Button asChild size="sm">
              <Link to="/register">Register</Link>
            </Button>
          </nav>
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-4xl flex-1 px-6 py-8">
        <Outlet />
      </main>
    </div>
  )
}

export default App
