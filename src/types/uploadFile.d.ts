type FileUploadProps = {
  label: string
  acceptedExtensions: string[]
  files: File[]
  onChange: (files: File[]) => void
}
