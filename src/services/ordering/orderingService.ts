'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { GridRowSelectionModel } from '@mui/x-data-grid'
import { BusinessDataList } from '@/config/erp.confing'
import { API } from '@/api/config/env'

export function OrderingService() {
  const router = useRouter()
  const [selectedIds, setSelectedIds] = useState<GridRowSelectionModel>()
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedFields, setSelectedFields] = useState<string[]>([])
  const [printMode, setPrintMode] = useState(false)

  // 계약 이력
  const [contract, setContract] = useState(false)

  console.log('선택한 데이터', selectedIds)

  const filteredColumns = printMode
    ? BusinessDataList.filter((col) => {
        if (col.headerName) {
          return selectedFields.includes(col.headerName)
        }
      })
    : BusinessDataList

  const handleToggleField = (field: string) => {
    setSelectedFields((prev) =>
      prev.includes(field) ? prev.filter((f) => f !== field) : [...prev, field],
    )
  }

  const handleReset = () => setSelectedFields([])

  const handlePrint = () => {
    if (selectedFields.length === 0) {
      alert('출력할 항목을 선택하세요.')
      return
    }
    setModalOpen(false)
    setPrintMode(true)
    setTimeout(() => {
      window.print()
      setPrintMode(false)
    }, 300)
  }

  console.log('체크된 데이터 확인', selectedFields, filteredColumns)

  const handleExcelDownload = () => {
    alert('엑셀 배열 로직')
    console.log('데이터 확인 !!', selectedFields)
    // 엑셀 데이터 다운로드 가능 하게 api 적용 ~
  }

  const handleNewOrderCreate = () => router.push('/ordering/registration')

  return {
    modalOpen,
    setModalOpen,
    selectedFields,
    handleToggleField,
    handleReset,

    handlePrint,
    printMode,
    handleNewOrderCreate,
    setSelectedIds,
    filteredColumns,
    setContract,
    handleExcelDownload,
    contract,
  }
}

// 발주처 조회

export async function ClientCompanyInfoService() {
  const resData = await fetch(API.CLIENTCOMPANY, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  })

  if (!resData.ok) {
    if (resData.status === 401) {
      throw new Error('권한이 없습니다.')
    }
    throw new Error(`서버 에러: ${resData.status}`)
  }

  const data = await resData.json()
  console.log('파싱된 유저 데이터', data)
  return data
}

// 발주처 삭제
export async function ClientRemoveService(clientCompanyIds: number[]) {
  const res = await fetch(API.CLIENTCOMPANY, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ clientCompanyIds }),
    credentials: 'include',
  })
  if (!res.ok) {
    throw new Error(`서버 오류: ${res.status}`)
  }

  return await res.status
}
