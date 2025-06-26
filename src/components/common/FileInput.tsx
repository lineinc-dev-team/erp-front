export default function CommonFileInput({ acceptedExtensions, files, onChange }: FileUploadProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const file = e.target.files[0]
      const ext = file.name.split('.').pop()?.toLowerCase() || ''
      if (acceptedExtensions.includes(ext)) {
        onChange([...files, file])
      } else {
        alert('파일만 업로드 가능합니다.')
      }
    }
    e.target.value = ''
  }

  const removeFile = (index: number) => {
    onChange(files.filter((_, idx) => idx !== index))
  }

  return (
    <div className="flex w-full">
      <div className="flex items-center gap-2 justify-between w-full">
        <ul>
          {files.map((file, index) => (
            <li className="flex gap-2 items-center mb-1" key={index}>
              <span>{file.name}</span>
              <button
                onClick={() => removeFile(index)}
                className="
                px-2  rounded cursor-pointer border border-gray-400 font-medium transition
              text-red-500"
              >
                X
              </button>
            </li>
          ))}
        </ul>
        <label className="px-4 py-2 rounded cursor-pointer border border-black font-medium transition  bg-gray-300 text-black">
          <input
            type="file"
            accept={acceptedExtensions.map((ext) => `.${ext}`).join(',')}
            className="hidden"
            onChange={handleChange}
          />
          첨부
        </label>
      </div>
    </div>
  )
}
