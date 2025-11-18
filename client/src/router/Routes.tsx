import { createBrowserRouter } from "react-router-dom"

import App from "@/App"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import Home from "@/pages/Home"
import Login from "@/pages/Login"
import NotFound from "@/pages/NotFound"
import Register from "@/pages/Register"
import Tasks from "@/pages/Tasks"
import Teams from "@/pages/Teams"

export const router = createBrowserRouter([
    {
      path: "/",
      element: <App />,
      errorElement: <NotFound />,
      children: [
        {
          index: true,
          element: <Home />,
        },
        {
          path: "tasks",
          element: <Tasks />,
        },
        {
          path: "teams",
          element: (
            <ProtectedRoute>
              <Teams />
            </ProtectedRoute>
          ),
        },
        {
          path: "login",
          element: <Login />,
        },
        {
          path: "register",
          element: <Register />,
        },
      ],
    },
])