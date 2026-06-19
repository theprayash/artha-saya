export default function Loading() {
  return (
    <div className="max-w-6xl mx-auto px-5 py-20 animate-pulse">
      {/* Hero skeleton */}
      <div className="text-center max-w-2xl mx-auto mb-20">
        <div className="h-3 w-32 rounded-full mx-auto mb-6" style={{ background: 'var(--surface2)' }} />
        <div className="h-14 w-3/4 rounded-xl mx-auto mb-4" style={{ background: 'var(--surface2)' }} />
        <div className="h-14 w-1/2 rounded-xl mx-auto mb-8" style={{ background: 'var(--surface2)' }} />
        <div className="flex justify-center gap-3">
          <div className="h-10 w-32 rounded-lg" style={{ background: 'var(--surface2)' }} />
          <div className="h-10 w-28 rounded-lg" style={{ background: 'var(--surface)' }} />
        </div>
      </div>

      {/* Cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 h-64 rounded-2xl" style={{ background: 'var(--surface)' }} />
        <div className="flex flex-col gap-4">
          <div className="h-[calc(33%-8px)] min-h-20 rounded-xl" style={{ background: 'var(--surface)' }} />
          <div className="h-[calc(33%-8px)] min-h-20 rounded-xl" style={{ background: 'var(--surface)' }} />
          <div className="h-[calc(33%-8px)] min-h-20 rounded-xl" style={{ background: 'var(--surface)' }} />
        </div>
      </div>
    </div>
  )
}
