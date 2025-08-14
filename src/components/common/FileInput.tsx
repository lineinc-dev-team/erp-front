'use client'

import { getPresignedUrl, uploadToS3 } from '@/services/ordering/orderingRegistrationService'
import { useState } from 'react'

export default function CommonFileInput({
  acceptedExtensions,
  files,
  className,
  onChange,
  uploadTarget,
}: FileUploadProps) {
  const [loading, setLoading] = useState(false)

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return
    const newFiles = Array.from(e.target.files)

    const validFiles = newFiles.filter((file) => {
      const ext = file.name.split('.').pop()?.toLowerCase() || ''
      return acceptedExtensions.includes(ext)
    })

    setLoading(true)

    const uploadedFiles: FileUploadInfo[] = []

    for (const file of validFiles) {
      try {
        const { publicUrl, uploadUrl } = await getPresignedUrl(file.type, uploadTarget)

        console.log('s3 요청 @@', uploadUrl, file, publicUrl)
        await uploadToS3(uploadUrl, file)

        uploadedFiles.push({ publicUrl, file })
      } catch (error) {
        console.error('업로드 실패:', error)
        alert(`"${file.name}" 업로드에 실패했습니다.`)
      }
    }

    onChange([...files, ...uploadedFiles])

    setLoading(false)
  }

  const removeFile = (index: number) => {
    onChange(files.filter((_, i) => i !== index))
  }

  const validFiles = files?.filter((f) => f.file?.name) ?? []
  return (
    <div className="flex w-full">
      <div className="flex items-center gap-2 justify-between w-full">
        <ul>
          {validFiles.map(({ file }, index) => (
            <li key={index} className="flex items-center gap-2 mb-1">
              <span className={className}>{file?.name}</span>
              <button
                onClick={() => removeFile(index)}
                className="text-red-500 border cursor-pointer border-gray-400 rounded px-2"
              >
                X
              </button>
            </li>
          ))}
        </ul>

        <label className="cursor-pointer whitespace-nowrap bg-gray-300 text-black font-medium border border-black px-4 py-2 rounded">
          <input
            type="file"
            multiple
            accept={acceptedExtensions.map((ext) => `.${ext}`).join(',')}
            className="hidden"
            onChange={handleChange}
          />
          {loading ? '업로드 중...' : '첨부'}
        </label>
      </div>
    </div>
  )
}
