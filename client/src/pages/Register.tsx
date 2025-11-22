import { type FormEvent, useState } from "react"
import { Link, useNavigate } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { authApi } from "@/lib/api"
import { useAuth } from "@/hooks/useAuth"

type RegisterFormState = {
  name: string
  email: string
  password: string
}

export default function Register() {
  const navigate = useNavigate()
  const { login: setAuth } = useAuth()
  const [formState, setFormState] = useState<RegisterFormState>({
    name: "",
    email: "",
    password: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setFormState((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setSuccess(null)
    setIsSubmitting(true)

    try {
      const response = await authApi.register(formState)
      setAuth(response)
      setSuccess(response.message ?? "Account created. Redirecting...")
      setTimeout(() => navigate("/tasks", { replace: true }), 600)
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to sign up right now"
      setError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="flex w-full flex-1 items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create your account</CardTitle>
          <CardDescription>
            Set up your workspace in just a minute.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="name">Full name</Label>
              <Input
                id="name"
                name="name"
                placeholder="Alex Morgan"
                value={formState.name}
                onChange={handleChange}
                required
                autoComplete="name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={formState.email}
                onChange={handleChange}
                required
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Create a secure password"
                value={formState.password}
                onChange={handleChange}
                required
                minLength={6}
                autoComplete="new-password"
              />
            </div>
            {error && (
              <p className="text-sm font-medium text-destructive">{error}</p>
            )}
            {success && (
              <p className="text-sm font-medium text-emerald-600">{success}</p>
            )}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Creating account..." : "Create account"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-3 text-sm text-muted-foreground">
          <p>
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </section>
  )
}

