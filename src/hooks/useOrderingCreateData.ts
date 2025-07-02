'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function useOrderingCreateData() {
  const router = useRouter()

  // 주소 모달 창
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [address, setAddress] = useState('')
  const [detail, setDetail] = useState('')

  // 파일 첨부로직 1개만 남긴다.
  const [contractFiles, setContractFiles] = useState<File[]>([])

  const handleNewOrder = () => {
    alert('발주처 등록하기')
  }

  const handleAddProcess = () => {
    alert('@@@')
  }

  const handleCancelData = () => {
    router.push('/business')
  }

  const handleNewBusiness = () => {
    alert('새로운 비즈니스 사업 등록')
  }

  const [managers, setManagers] = useState<Manager[]>([])
  const [checkedIds, setCheckedIds] = useState<number[]>([])

  const [saveAttachedFile, setSaveAttachedFile] = useState<AttachedFileProps[]>([])
  const [checkedFileIds, setCheckedFileIds] = useState<number[]>([])

  const handleAddAttachedFile = () => {
    setSaveAttachedFile([
      ...saveAttachedFile,
      {
        id: Date.now(),
        fileName: '',
        fileInfo: {
          label: '',
          acceptedExtensions: [],
          className: '',
          files: [],
          onChange: () => {},
        },
        memo: '',
      },
    ])
  }

  const handleAddManager = () => {
    setManagers([
      ...managers,
      { id: Date.now(), name: '', department: '', contact: '', mobile: '', email: '', memo: '' },
    ])
  }
  const handleChange = (
    id: number,
    field: keyof Manager | keyof AttachedFileProps,
    value: string,
    title: string,
  ) => {
    if (title === 'manager') {
      setManagers(managers.map((m) => (m.id === id ? { ...m, [field]: value } : m)))
    } else {
      setSaveAttachedFile((prev) =>
        prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
      )
    }
  }

  const handleCheckAll = (checked: boolean, title: string) => {
    if (title === 'manager') {
      setCheckedIds(checked ? managers.map((m) => m.id) : [])
    } else {
      setCheckedFileIds(checked ? saveAttachedFile.map((item) => item.id) : [])
    }
  }

  const handleCheck = (id: number, checked: boolean, title: string) => {
    if (title === 'manager') {
      setCheckedIds(checked ? [...checkedIds, id] : checkedIds.filter((c) => c !== id))
    } else {
      setCheckedFileIds(checked ? [...checkedFileIds, id] : checkedFileIds.filter((c) => c !== id))
    }
  }

  const removeChecked = (title: string) => {
    if (title === 'manager') {
      setManagers(managers.filter((item) => !checkedIds.includes(item.id)))
      setCheckedIds([])
    } else {
      setSaveAttachedFile((prev) => prev.filter((item) => !checkedFileIds.includes(item.id)))
      setCheckedFileIds([]) // 삭제 후 선택 초기화
    }
  }

  const isAllChecked = managers.length > 0 && checkedIds.length === managers.length

  const isFileAllChecked =
    saveAttachedFile.length > 0 && checkedFileIds.length === saveAttachedFile.length

  console.log('정보 값확인', managers, checkedIds, saveAttachedFile, checkedFileIds)

  return {
    managers,
    checkedIds,
    handleAddManager,
    saveAttachedFile,
    handleChange,
    handleCheckAll,
    handleCheck,
    isAllChecked,
    isFileAllChecked,
    removeChecked,
    handleNewOrder,
    handleAddProcess,
    address,
    setAddress,
    detail,
    setDetail,
    isModalOpen,
    setIsModalOpen,
    contractFiles,
    setContractFiles,
    handleCancelData,
    handleNewBusiness,
    handleAddAttachedFile,
    checkedFileIds,
  }
}
