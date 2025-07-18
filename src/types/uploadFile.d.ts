type FileUploadInfo = {
  file: File
  // cdnAccessUrl: string
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
