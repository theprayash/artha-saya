import { cn } from '@/lib/utils'
import type { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

export default function Input({ label, className, ...props }: InputProps) {
  return (
    <div className="space-y-1.5">
      {label && <label className="block text-xs text-[var(--text-muted)] uppercase tracking-wider">{label}</label>}
      <input
        className={cn(
          'w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-accent transition-colors placeholder:text-[var(--text-faint)]',
          className,
        )}
        {...props}
      />
    </div>
  )
}
