'use client'

import { useState } from 'react'
import {
  LocationStatusOptions,
  ProcessStatusOptions,
  statusOptions,
  ArrayStatusOptions,
} from '@/config/erp.confing'
// import { GridRowSelectionModel } from '@mui/x-data-grid'
import { useRouter } from 'next/navigation'
import { API } from '@/api/config/env'
import { useAccountFormStore } from '@/stores/accountManagementStore'

//조회

export async function UserInfoService() {
  const resData = await fetch(API.USER, {
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

export function AccountManagementService() {
  const router = useRouter()

  const [sortList, setSortList] = useState('최근순')

  const handleDownloadExcel = () => {
    alert('엑셀 다운로드 로직이 들어감')
  }

  const handleNewAccountCreate = () => {
    router.push('/account/registration')
  }

  return {
    handleDownloadExcel,
    handleNewAccountCreate,
    LocationStatusOptions,
    ProcessStatusOptions,
    statusOptions,
    ArrayStatusOptions,
    sortList,
    setSortList,
  }
}

// 유저 생성 엔드포인트

export async function CreateAccount() {
  const { newAccountUser } = useAccountFormStore.getState()
  const payload = newAccountUser()

  const res = await fetch(API.USER, {
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

// 유저 삭제
export async function UserRemoveService(userIds: number[]) {
  console.log('유저 접오!!!', userIds)
  const res = await fetch(API.USER, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ userIds }),
    credentials: 'include',
  })
  if (!res.ok) {
    throw new Error(`서버 오류: ${res.status}`)
  }

  return await res.status
}

// 유저 수정

// 비밀번호 수정
