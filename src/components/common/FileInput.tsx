export default function CommonFileInput({ acceptedExtensions, files, onChange }: FileUploadProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return
    const newFiles = Array.from(e.target.files)

    const validFiles = newFiles.filter((item) => {
      const ext = item.name.split('.').pop()?.toLocaleLowerCase() || ''
      return acceptedExtensions.includes(ext)
    })

    // files와  validFiles이 둘다 배열이니 둘다 펼쳐서 하나의 배열에 담으려고 한 것!!
    onChange([...files, ...validFiles])
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
              <span className="w-[420px] break-words whitespace-normal">{file.name}</span>
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
            multiple
            // acceptedExtensions 배열에 있는 확장자들(['pdf', 'hwp']등)을 .pdf,.hwp 형태의 문자열로 변환
            // 업로드 가능한 파일 확장자만 선택할 수 있게 제한
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
