export default function Tasks() {
  return (
    <section className="flex flex-1 flex-col gap-4">
      <header>
        <p className="text-sm uppercase tracking-wide text-gray-500">
          Tasks
        </p>
        <h1 className="text-3xl font-bold text-gray-900">Your task board</h1>
        <p className="mt-2 text-gray-600">
          Filter or update tasks once data sources are connected.
        </p>
      </header>
      <div className="rounded-lg border border-dashed border-gray-300 bg-white p-6 text-center text-gray-500">
        Task data will appear here once the backend integration is complete.
      </div>
    </section>
  )
}

