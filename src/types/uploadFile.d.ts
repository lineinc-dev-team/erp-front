type FileUploadInfo = {
  id: number
  file: File
  documentTypeCode?: string
  // cdnAccessUrl: string
  originalFileName?: string
  // key: string
  // uploadUrl: string
  fileUrl: string
}

type FileUploadProps = {
  acceptedExtensions: string[]
  files: FileUploadInfo[]
  className?: string
  onChange: (files: FileUploadInfo[]) => void
  uploadTarget: string
}
