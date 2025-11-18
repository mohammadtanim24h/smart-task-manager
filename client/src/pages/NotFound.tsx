import { Link } from "react-router-dom"

export default function NotFound() {
  return (
    <section className="flex flex-1 flex-col items-center justify-center text-center mt-8">
      <p className="text-sm uppercase tracking-wide text-gray-500">404</p>
      <h1 className="text-4xl font-bold text-gray-900">Page not found</h1>
      <p className="mt-3 text-gray-600">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link to="/" className="mt-6 text-sm font-medium text-blue-600">
        Return home
      </Link>
    </section>
  )
}

