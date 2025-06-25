'use client'

import { useState } from 'react'
import {
  LocationStatusOptions,
  ProcessStatusOptions,
  statusOptions,
  ArrayStatusOptions,
} from '@/config/business.confing'

export function BusinessService() {
  const [businessInfo, setBusinessInfo] = useState<BusinessInfoProps>({
    name: '',
    code: '',
    description: '',
  })
  const [status, setStatus] = useState('전체')
  const [location, setLocation] = useState('전체')
  const [process, setProcess] = useState('전체')
  const [sortList, setSortList] = useState('최근순')
  const [startDate, setStartDate] = useState<Date | null>(null)
  const [endDate, setEndDate] = useState<Date | null>(null)

  const handleChange = (field: keyof BusinessInfoProps, value: string) => {
    setBusinessInfo((prev) => ({ ...prev, [field]: value }))
  }

  const handleCreate = () => {
    // 비즈니스 데이터 수집
    const payload = { ...businessInfo, status, location, process, startDate, endDate }
    // API 호출 or 다른 작업
    alert(`검색 실행:\n${JSON.stringify(payload, null, 2)}`)
  }

  const handleReset = () => {
    setBusinessInfo({ name: '', code: '', description: '' })
    setStatus('전체')
    setLocation('전체')
    setProcess('전체')
    setStartDate(null)
    setEndDate(null)
  }

  const handleListRemove = () => {
    alert('리스트에 대한 삭제가 됩니다.')
  }

  const handleDownloadExcel = () => {
    alert('엑셀 다운로드 로직이 들어감')
  }

  const handleNewBusinessCreate = () => {
    alert('새로운 리스트 추가')
  }

  return {
    businessInfo,
    status,
    setStatus,
    location,
    setLocation,
    process,
    setProcess,
    sortList,
    setSortList,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    handleChange,
    handleCreate,
    handleReset,
    handleListRemove,
    handleDownloadExcel,
    handleNewBusinessCreate,
    LocationStatusOptions,
    ProcessStatusOptions,
    statusOptions,
    ArrayStatusOptions,
  }
}
