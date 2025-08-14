type FileUploadInfo = {
  file: File
  documentTypeCode?: string
  // cdnAccessUrl: string
  originalFileName?: string
  // key: string
  // uploadUrl: string
  publicUrl: string
}

type FileUploadProps = {
  acceptedExtensions: string[]
  files: FileUploadInfo[]
  className?: string
  onChange: (files: FileUploadInfo[]) => void
  uploadTarget: string
}
