interface ModalProps {
  onClose: () => void
  children: React.ReactNode
  className?: string
  position?: 'center' | 'top'
  onKeyDown?: React.KeyboardEventHandler
}

export function Modal({ onClose, children, className = '', position = 'center', onKeyDown }: ModalProps) {
  const alignClass = position === 'top'
    ? 'items-start pt-[20vh]'
    : 'items-center'

  return (
    <div
      className={`fixed inset-0 bg-black/50 flex ${alignClass} justify-center z-50 animate-[fadeIn_0.15s_ease-out]`}
      onClick={onClose}
    >
      <div
        className={`bg-gray-800 rounded-lg animate-[modalIn_0.2s_ease-out] ${className}`}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={onKeyDown}
      >
        {children}
      </div>
    </div>
  )
}
