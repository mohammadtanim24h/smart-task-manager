import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import {  RouterProvider } from "react-router-dom"
import { Toaster } from "sonner"
import "./index.css"
import { router } from "./router/Routes"
import { AuthProvider } from "./hooks/useAuth"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
      <Toaster />
    </AuthProvider>
  </StrictMode>,
)
