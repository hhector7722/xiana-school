'use client'

export function Skeleton() {
  return (
    <div className="flex flex-col gap-8 py-4 md:py-6 animate-skeleton">
      <div className="flex flex-col gap-3">
        <div className="h-3 w-10 bg-gray-200 rounded" />
        <div className="h-1 w-full bg-gray-100 rounded-full" />
      </div>
      <div className="h-px bg-gray-100" />
      <div className="space-y-3">
        <div className="h-6 w-48 bg-gray-200 rounded" />
        <div className="h-3 w-64 bg-gray-100 rounded" />
      </div>
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-3">
            <div className="h-3 w-full bg-gray-100 rounded" />
            <div className="flex gap-3">
              <div className="flex-1 h-10 bg-gray-100 rounded-xl" />
              <div className="flex-1 h-10 bg-gray-100 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between pt-4">
        <div className="h-10 w-20 bg-gray-100 rounded-xl" />
        <div className="h-10 w-28 bg-gray-200 rounded-xl" />
      </div>
    </div>
  )
}
