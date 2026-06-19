import { cn } from '@/lib/utils'
import type { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'danger'
  size?: 'sm' | 'md'
}

export default function Button({ variant = 'primary', size = 'md', className, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center font-semibold rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed',
        size === 'sm' && 'text-xs px-3 py-1.5',
        size === 'md' && 'text-sm px-4 py-2.5',
        variant === 'primary' && 'bg-accent text-black hover:bg-[#b08838]',
        variant === 'ghost' && 'border border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--border2)] hover:text-[#F5F5F5]',
        variant === 'danger' && 'border border-danger/20 text-danger hover:border-danger/50',
        className,
      )}
      {...props}
    />
  )
}
