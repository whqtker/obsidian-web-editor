import { useCallback } from 'react'
import { uploadBinaryFile } from '@/api/contents'
import { useRepoStore } from '@/store/repoStore'
import { useTreeStore } from '@/store/treeStore'
import { useToastStore } from '@/store/toastStore'

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      // Remove data URL prefix: "data:image/png;base64,..."
      const base64 = result.split(',')[1]
      resolve(base64)
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function isImageFile(file: File): boolean {
  return file.type.startsWith('image/')
}

function generateImagePath(file: File): string {
  const timestamp = Date.now()
  const safeName = file.name.replace(/[^a-zA-Z0-9._\-]/g, '_')
  return `attachments/${timestamp}_${safeName}`
}

/**
 * Hook for uploading images via drag & drop or clipboard paste.
 * Returns an onImageUpload callback that processes files and returns
 * the markdown text to insert.
 */
export function useImageUpload() {
  const { owner, repo, branch } = useRepoStore()
  const { fetchTree } = useTreeStore()
  const addToast = useToastStore((s) => s.addToast)

  const uploadImage = useCallback(
    async (file: File): Promise<string | null> => {
      if (!isImageFile(file)) {
        addToast('error', '이미지 파일만 업로드할 수 있습니다.')
        return null
      }

      if (file.size > 10 * 1024 * 1024) {
        addToast('error', '이미지 크기는 10MB 이하만 가능합니다.')
        return null
      }

      const path = generateImagePath(file)

      try {
        const base64Content = await fileToBase64(file)
        await uploadBinaryFile({
          owner,
          repo,
          path,
          base64Content,
          message: `Upload ${file.name}`,
          branch,
        })
        await fetchTree(owner, repo, branch)
        addToast('success', `${file.name} 업로드 완료`)
        return `![[${path}]]`
      } catch (err) {
        addToast('error', err instanceof Error ? err.message : '이미지 업로드에 실패했습니다.')
        return null
      }
    },
    [owner, repo, branch, fetchTree, addToast],
  )

  return { uploadImage }
}
