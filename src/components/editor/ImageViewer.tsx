import { basename } from '@/utils/pathUtils'

interface ImageViewerProps {
  path: string
  imageUrl: string
}

export function ImageViewer({ path, imageUrl }: ImageViewerProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-0 p-4 bg-gray-900">
      <img
        src={imageUrl}
        alt={basename(path)}
        className="max-w-full max-h-full object-contain rounded"
      />
      <p className="mt-3 text-xs text-gray-500 font-mono">{path}</p>
    </div>
  )
}
