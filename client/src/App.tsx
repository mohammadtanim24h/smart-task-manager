import { Link, Outlet, useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { useAuth } from "./hooks/useAuth"

function App() {
  const { isLoggedIn, logout: logoutAuth } = useAuth();
  const navigate = useNavigate()
  const handleLogout = () => {
    logoutAuth()
    toast.success("Logged out successfully")
    navigate("/login")
  }
  
  return (
    <div className="flex min-h-screen flex-col bg-gray-50 text-gray-900">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <Link to="/" className="text-xl font-semibold">
            Smart Task Manager
          </Link>
          <nav className="flex items-center gap-4 text-sm font-medium">
            <Link to="/" className="hover:text-primary">
              Home
            </Link>
            <Link to="/tasks" className="hover:text-primary">
              Tasks
            </Link>
            <Link to="/teams" className="hover:text-primary">
              Teams
            </Link>
            <Link to="/projects" className="hover:text-primary">
              Projects
            </Link>
            {!isLoggedIn && (
              <>
                <Button asChild size="sm">
                  <Link to="/login">Login</Link>
                </Button>
              </>
            )}
            {isLoggedIn && (
              <>
                <Button size="sm" onClick={handleLogout}>
                  Logout
                </Button>
              </>
            )}
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
