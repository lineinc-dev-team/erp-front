type FileUploadProps = {
  label: string
  acceptedExtensions: string[]
  className: string
  files: File[]
  onChange: (files: File[]) => void
}
