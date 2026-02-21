interface SpinnerProps {
  size?: 'sm' | 'md'
  label?: string
}

export function Spinner({ size = 'md', label }: SpinnerProps) {
  const sizeClass = size === 'sm' ? 'w-4 h-4' : 'w-6 h-6'

  return (
    <div className="flex items-center gap-2">
      <div
        className={`${sizeClass} border-2 border-gray-600 border-t-gray-300 rounded-full animate-spin`}
      />
      {label && <span className="text-sm text-gray-500">{label}</span>}
    </div>
  )
}
