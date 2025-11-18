import Tasks from "@/pages/Tasks"
import App from "@/App"
import Home from "@/pages/Home"
import NotFound from "@/pages/NotFound"
import { createBrowserRouter } from "react-router-dom"

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
      ],
    },
])