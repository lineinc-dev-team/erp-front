'use client'

import { API } from '@/api/config/env'
import { ProcessStatusOptions } from '@/config/erp.confing'
import { useSiteFormStore } from '@/stores/siteStore'
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

// 현장 등록
export async function CreateSiteInfo() {
  const { toPayload } = useSiteFormStore.getState()
  const payload = toPayload()

  const res = await fetch(API.SITES, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
    credentials: 'include',
  })

  if (!res.ok) {
    throw new Error(`서버 오류: ${res.status}`)
  }

  return await res.status
}
// 발주처에 담당자 리스트 조회

export async function OrderingPersonScroll({ pageParam = 0, size = 5, keyword = '', sort = '' }) {
  const resData = await fetch(
    `${API.CLIENTCOMPANY}/search?page=${pageParam}&size=${size}&keyword=${keyword}&sort=${sort}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    },
  )

  if (!resData.ok) {
    if (resData.status === 401) throw new Error('권한이 없습니다.')
    throw new Error(`서버 에러: ${resData.status}`)
  }

  const data = await resData.json()
  console.log('파싱된 유저 데이터', data)
  return data
}
