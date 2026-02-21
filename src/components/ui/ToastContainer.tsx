import { useToastStore } from '@/store/toastStore'
import type { ToastType } from '@/store/toastStore'

const typeStyles: Record<ToastType, string> = {
  success: 'bg-green-800 border-green-600',
  error: 'bg-red-900 border-red-600',
  info: 'bg-gray-800 border-gray-600',
}

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore()

  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`${typeStyles[toast.type]} border rounded-lg px-4 py-3 text-sm text-white shadow-lg flex items-start gap-2 animate-[fadeIn_0.2s_ease-out]`}
        >
          <span className="flex-1 break-words">{toast.message}</span>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-gray-400 hover:text-white text-xs shrink-0 mt-0.5"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  )
}
