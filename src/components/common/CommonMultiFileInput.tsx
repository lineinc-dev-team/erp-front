'use client'

import { getPresignedUrl, uploadToS3 } from '@/services/ordering/orderingRegistrationService'
import { useSnackbarStore } from '@/stores/useSnackbarStore'
import { useState } from 'react'

export default function CommonMultiFileInput({
  acceptedExtensions,
  files,
  className,
  multiple = true,
  onChange,
  uploadTarget,
}: FileUploadProps) {
  const [loading, setLoading] = useState(false)
  const { showSnackbar } = useSnackbarStore()

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return

    const newFiles = Array.from(e.target.files)

    const existingFilesCount = files?.filter((f) => f.fileUrl || f.file?.name).length ?? 0

    const totalFiles = existingFilesCount + newFiles.length

    // 10개 이상 제한
    if (totalFiles > 10) {
      showSnackbar('파일은 최대 10개까지만 업로드할 수 있습니다.', 'warning')
      return
    }

    // 확장자 체크
    const validFiles = newFiles.filter((file) => {
      const ext = file.name.split('.').pop()?.toLowerCase() || ''
      return acceptedExtensions.includes(ext)
    })

    if (validFiles.length === 0) {
      showSnackbar('허용되지 않은 파일 형식입니다.', 'warning')
      return
    }

    setLoading(true)

    const uploadedFiles: FileUploadInfo[] = []

    for (const file of validFiles) {
      try {
        const { publicUrl, uploadUrl } = await getPresignedUrl(file.type, uploadTarget)

        await uploadToS3(uploadUrl, file)

        uploadedFiles.push({
          id: 0, // 신규 업로드 파일은 0
          file,
          fileUrl: publicUrl,
          originalFileName: file.name,
        })
      } catch (error) {
        console.error('업로드 실패:', error)
        showSnackbar(`"${file.name}" 업로드에 실패했습니다.`, 'error')
      }
    }

    const mergedFiles = [...(files ?? []), ...uploadedFiles]
    onChange(mergedFiles)

    setLoading(false)
  }

  const removeFile = (index: number) => {
    if (files) {
      const updated = files.filter((_, i) => i !== index)
      onChange(updated)
    }
  }

  const handleDownload = async (fileUrl: string, fileName: string) => {
    try {
      const response = await fetch(fileUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)

      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      a.remove()

      window.URL.revokeObjectURL(url) // 메모리 해제
    } catch (error) {
      console.error('파일 다운로드 실패:', error)
      alert('파일 다운로드에 실패했습니다.')
    }
  }

  return (
    <div className="flex w-full">
      <div className="flex flex-col gap-2 w-full">
        {/* 업로드된 파일 리스트 */}
        <ul>
          {files?.map((file, index) => {
            const fileName = file.originalFileName
            if (!fileName || fileName.trim() === '') return null

            return (
              <li key={index} className="flex items-center gap-2 mb-1">
                <span
                  onClick={() => handleDownload(file.fileUrl, fileName)}
                  className={`${className} text-blue-600 underline cursor-pointer`}
                >
                  {fileName}
                </span>
                <button
                  onClick={() => removeFile(index)}
                  className="text-red-500 border cursor-pointer border-gray-400 rounded px-2"
                >
                  X
                </button>
              </li>
            )
          })}
        </ul>

        {/* 업로드 버튼 */}
        <label className="cursor-pointer whitespace-nowrap bg-gray-300 text-black font-medium border border-black px-4 py-2 rounded w-fit">
          <input
            type="file"
            multiple={multiple}
            accept={acceptedExtensions.map((ext) => `.${ext}`).join(',')}
            className="hidden"
            onChange={handleChange}
            ref={(el) => {
              if (el) {
                el.value = '' // 매번 change 후 초기화
              }
            }}
          />
          {loading ? '업로드 중...' : '첨부'}
        </label>
      </div>
    </div>
  )
}
