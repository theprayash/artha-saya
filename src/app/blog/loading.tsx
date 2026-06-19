export default function BlogLoading() {
  return (
    <div className="max-w-6xl mx-auto px-5 py-16 animate-pulse">
      {/* Header skeleton */}
      <div className="mb-12">
        <div className="h-3 w-24 rounded-full mb-3" style={{ background: 'var(--surface2)' }} />
        <div className="h-12 w-40 rounded-xl mb-4" style={{ background: 'var(--surface2)' }} />
        <div className="h-4 w-80 rounded-full" style={{ background: 'var(--surface)' }} />
      </div>

      {/* Filter pills skeleton */}
      <div className="flex gap-2 mb-10">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="h-7 w-16 rounded-full" style={{ background: 'var(--surface)' }} />
        ))}
      </div>

      {/* Post grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className={`rounded-xl p-6 ${i === 0 ? 'md:col-span-2' : ''}`}
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', minHeight: 200 }}
          >
            <div className="h-5 w-20 rounded-full mb-4" style={{ background: 'var(--surface2)' }} />
            <div className={`h-6 rounded-lg mb-2 ${i === 0 ? 'w-3/4' : 'w-full'}`} style={{ background: 'var(--surface2)' }} />
            <div className="h-6 w-2/3 rounded-lg mb-4" style={{ background: 'var(--surface2)' }} />
            <div className="h-3 w-full rounded mb-2" style={{ background: 'var(--surface2)', opacity: 0.5 }} />
            <div className="h-3 w-4/5 rounded" style={{ background: 'var(--surface2)', opacity: 0.5 }} />
          </div>
        ))}
      </div>
    </div>
  )
}
