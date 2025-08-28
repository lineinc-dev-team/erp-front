type FileUploadInfo = {
  id: number
  file?: File
  name?: string
  documentTypeCode?: string
  // cdnAccessUrl: string
  originalFileName?: string
  // key: string
  // uploadUrl: string
  fileUrl: string
}

type FileUploadProps = {
  acceptedExtensions: string[]
  files?: FileUploadInfo[]
  className?: string
  multiple?: boolean
  onChange: (files: FileUploadInfo[]) => void
  uploadTarget: string
}
