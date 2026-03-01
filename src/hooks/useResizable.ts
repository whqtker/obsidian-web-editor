import { useState, useRef, useCallback } from 'react'

const MIN_RATIO = 0.2
const MAX_RATIO = 0.8
const DEFAULT_RATIO = 0.5

interface UseResizableReturn {
  leftRatio: number
  isDragging: boolean
  handleMouseDown: (e: React.MouseEvent) => void
  handleDoubleClick: () => void
  containerRef: React.RefObject<HTMLDivElement>
}

export function useResizable(): UseResizableReturn {
  const [leftRatio, setLeftRatio] = useState(DEFAULT_RATIO)
  const [isDragging, setIsDragging] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)

    const onMouseMove = (moveEvent: MouseEvent) => {
      const container = containerRef.current
      if (!container) return

      const rect = container.getBoundingClientRect()
      const rawRatio = (moveEvent.clientX - rect.left) / rect.width
      const clampedRatio = Math.min(MAX_RATIO, Math.max(MIN_RATIO, rawRatio))
      setLeftRatio(clampedRatio)
    }

    const onMouseUp = () => {
      setIsDragging(false)
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    }

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
  }, [])

  const handleDoubleClick = useCallback(() => {
    setLeftRatio(DEFAULT_RATIO)
  }, [])

  return { leftRatio, isDragging, handleMouseDown, handleDoubleClick, containerRef }
}
