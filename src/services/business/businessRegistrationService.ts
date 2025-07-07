'use client'

import { ProcessStatusOptions, statusOptions } from '@/config/erp.confing'
import { useRouter } from 'next/navigation'
// import { useBusinessStore } from '@/stores/businessStore'
import { useState } from 'react'

export function BusinessRegistrationService() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [address, setAddress] = useState('')
  const [detail, setDetail] = useState('')

  // 파일 첨부로직
  const [contractFiles, setContractFiles] = useState<File[]>([])
  const [siteDrawFiles, setSiteDrawFiles] = useState<File[]>([])
  const [permitFiles, setPermitFiles] = useState<File[]>([])
  const [etcFiles, setEtcFiles] = useState<File[]>([])

  const router = useRouter()

  const handleNewOrder = () => {
    alert('발주처 등록하기')
  }

  const handleAddProcess = () => {
    alert('@@@')
  }

  console.log('her!!', contractFiles, siteDrawFiles, permitFiles, etcFiles)

  const handleCancelData = () => {
    router.push('/business')
  }

  const handleNewBusiness = () => {
    alert('새로운 비즈니스 사업 등록')
  }

  return {
    statusOptions,
    ProcessStatusOptions,
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
    siteDrawFiles,
    setSiteDrawFiles,
    permitFiles,
    setPermitFiles,
    etcFiles,
    setEtcFiles,
    handleCancelData,
    handleNewBusiness,
  }
}
