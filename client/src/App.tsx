import { Link, Outlet, useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { useState } from "react"
import { Menu, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useAuth } from "./hooks/useAuth"

function App() {
  const { isLoggedIn, logout: logoutAuth } = useAuth();
  const navigate = useNavigate()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const handleLogout = () => {
    logoutAuth()
    toast.success("Logged out successfully")
    navigate("/login")
  }

  const routeLinks = [
    { to: "/", label: "Dashboard" },
    { to: "/tasks", label: "Tasks" },
    { to: "/teams", label: "Teams" },
    { to: "/projects", label: "Projects" },
  ]

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 text-gray-900">
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <Link to="/" className="text-xl font-semibold">
            Smart Task Manager
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-4 text-sm font-medium">
            {routeLinks.map((link) => (
              <Link key={link.to} to={link.to} className="hover:text-primary">
                {link.label}
              </Link>
            ))}
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

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t p-4 bg-white absolute w-full shadow-lg">
            <nav className="flex flex-col gap-4 text-sm font-medium">
              {routeLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="hover:text-primary py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              {!isLoggedIn && (
                <div className="pt-2">
                  <Button asChild size="sm" className="w-full">
                    <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>Login</Link>
                  </Button>
                </div>
              )}
              {isLoggedIn && (
                <div className="pt-2">
                  <Button size="sm" onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }} className="w-full">
                    Logout
                  </Button>
                </div>
              )}
            </nav>
          </div>
        )}
      </header>
      <main className="mx-auto flex w-full max-w-4xl flex-1 px-6 py-8">
        <Outlet />
      </main>
    </div>
  )
}

export default App
