'use client'

import { useState } from 'react'
import {
  LocationStatusOptions,
  ProcessStatusOptions,
  statusOptions,
  ArrayStatusOptions,
} from '@/config/erp.confing'
import { GridRowSelectionModel } from '@mui/x-data-grid'
import { useRouter } from 'next/navigation'

export function OutsourcingCalculateService() {
  // useQuery를 이용해 데이터를 불러옴 ..
  // const { data, isLoading, error } = useQuery({
  //   queryKey: ['businessList'],
  //   queryFn: async () => {
  //     const res = await fetch(API.LOGOUT, { cache: 'no-store' })
  //     if (!res.ok) throw new Error('서버 에러')
  //     return res.json()
  //   },
  // })

  // const [authData, setAuthData] = useState(null)

  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       const authRes = await fetch(API.AUTH, {
  //         method: 'GET',
  //         headers: {
  //           'Content-Type': 'application/json',
  //         },
  //         credentials: 'include',
  //         cache: 'no-store',
  //       })
  //       const authData = await authRes.json()
  //       setAuthData(authData)

  //       console.log('정보 데이터 확인', authData.data)
  //     } catch (err) {
  //       alert(err)
  //     }
  //   }

  //   fetchData()
  // }, [])

  // console.log('정보 확인 @', authData)

  const router = useRouter()

  // 추후 api를 통해 데이터를 불러올 예정
  const allRows = [
    {
      id: 1,
      siteCode: 'A123',
      location: '서울',
      siteType: '본사',
      period: '2025-01-01~2025-12-31',
      status: '운영중',
      registrar: '홍길동',
      registeredDate: '2025-01-01',
      modifiedDate: '2025-01-15',
      attachments: '파일1.pdf',
      remark: '확인',
    },
    {
      id: 2,
      siteCode: 'B456',
      location: '부산',
      siteType: '지사',
      period: '2025-01-01~2025-06-30',
      status: '중단',
      registrar: '이영희',
      registeredDate: '2025-01-02',
      modifiedDate: '2025-01-10',
      attachments: '파일2.xlsx',
      remark: '확인',
    },
    {
      id: 3,
      siteCode: 'B456',
      location: '부산',
      siteType: '지사',
      period: '2025-01-01~2025-06-30',
      status: '중단',
      registrar: '이영희',
      registeredDate: '2025-01-02',
      modifiedDate: '2025-01-10',
      attachments: '파일2.xlsx',
      remark: '확인',
    },
    {
      id: 4,
      siteCode: 'B456',
      location: '부산',
      siteType: '지사',
      period: '2025-01-01~2025-06-30',
      status: '중단',
      registrar: '이영희',
      registeredDate: '2025-01-02',
      modifiedDate: '2025-01-10',
      attachments: '파일2.xlsx',
      remark: '중단됨',
    },
    {
      id: 5,
      siteCode: 'B456',
      location: '부산',
      siteType: '지사',
      period: '2025-01-01~2025-06-30',
      status: '중단',
      registrar: '이영희',
      registeredDate: '2025-01-02',
      modifiedDate: '2025-01-10',
      attachments: '파일2.xlsx',
      remark: '중단됨',
    },
    {
      id: 6,
      siteCode: 'B456',
      location: '부산',
      siteType: '지사',
      period: '2025-01-01~2025-06-30',
      status: '중단',
      registrar: '이영희',
      registeredDate: '2025-01-02',
      modifiedDate: '2025-01-10',
      attachments: '파일2.xlsx',
      remark: '중단됨',
    },
    {
      id: 7,
      siteCode: 'B456',
      location: '부산',
      siteType: '지사',
      period: '2025-01-01~2025-06-30',
      status: '중단',
      registrar: '이영희',
      registeredDate: '2025-01-02',
      modifiedDate: '2025-01-10',
      attachments: '파일2.xlsx',
      remark: '중단됨',
    },
    {
      id: 8,
      siteCode: 'B456',
      location: '부산',
      siteType: '지사',
      period: '2025-01-01~2025-06-30',
      status: '중단',
      registrar: '이영희',
      registeredDate: '2025-01-02',
      modifiedDate: '2025-01-10',
      attachments: '파일2.xlsx',
      remark: '중단됨',
    },
    {
      id: 9,
      siteCode: 'B456',
      location: '부산',
      siteType: '지사',
      period: '2025-01-01~2025-06-30',
      status: '중단',
      registrar: '이영희',
      registeredDate: '2025-01-02',
      modifiedDate: '2025-01-10',
      attachments: '파일2.xlsx',
      remark: '중단됨',
    },
    {
      id: 10,
      siteCode: 'B456',
      location: '부산',
      siteType: '지사',
      period: '2025-01-01~2025-06-30',
      status: '중단',
      registrar: '이영희',
      registeredDate: '2025-01-02',
      modifiedDate: '2025-01-10',
      attachments: '파일2.xlsx',
      remark: '중단됨',
    },
    {
      id: 11,
      siteCode: 'B456',
      location: '부산',
      siteType: '지사',
      period: '2025-01-01~2025-06-30',
      status: '중단',
      registrar: '이영희',
      registeredDate: '2025-01-02',
      modifiedDate: '2025-01-10',
      attachments: '파일2.xlsx',
      remark: '중단됨',
    },
    {
      id: 12,
      siteCode: 'B456',
      location: '부산',
      siteType: '지사',
      period: '2025-01-01~2025-06-30',
      status: '중단',
      registrar: '이영희',
      registeredDate: '2025-01-02',
      modifiedDate: '2025-01-10',
      attachments: '파일2.xlsx',
      remark: '중단됨',
    },
    {
      id: 13,
      siteCode: 'B456',
      location: '부산',
      siteType: '지사',
      period: '2025-01-01~2025-06-30',
      status: '중단',
      registrar: '이영희',
      registeredDate: '2025-01-02',
      modifiedDate: '2025-01-10',
      attachments: '파일2.xlsx',
      remark: '중단됨',
    },
    {
      id: 14,
      siteCode: 'B456',
      location: '부산',
      siteType: '지사',
      period: '2025-01-01~2025-06-30',
      status: '중단',
      registrar: '이영희',
      registeredDate: '2025-01-02',
      modifiedDate: '2025-01-10',
      attachments: '파일2.xlsx',
      remark: '중단됨',
    },
    {
      id: 15,
      siteCode: 'B456',
      location: '부산',
      siteType: '지사',
      period: '2025-01-01~2025-06-30',
      status: '중단',
      registrar: '이영희',
      registeredDate: '2025-01-02',
      modifiedDate: '2025-01-10',
      attachments: '파일2.xlsx',
      remark: '중단됨',
    },
  ]

  // 페이지네이션 상태관리
  const [page, setPage] = useState(1) // 현재 페이지
  const [pageSize] = useState(10) // 페이지당 수
  const totalCount = allRows.length
  const totalPages = Math.ceil(totalCount / pageSize)

  // 현재 페이지에 맞는 데이터만 slice
  const displayedRows = allRows.slice((page - 1) * pageSize, page * pageSize)

  // 사업장 리스트에 있는 체크박스 선택 시 체크된 값을 저장하는 상태 값
  const [selectedIds, setSelectedIds] = useState<GridRowSelectionModel>()

  const [sortList, setSortList] = useState('최근순')

  console.log('이 값을 가지고 나중에 어떤것들을 체크 했는지 확인 가능함', selectedIds)

  const handleListRemove = () => {
    alert('리스트에 대한 삭제가 됩니다.')
  }

  const handleDownloadExcel = () => {
    alert('엑셀 다운로드 로직이 들어감')
  }

  const handleNewCalculateCreate = () => {
    router.push('/outsourcingCalculate/registration')
  }

  return {
    handleListRemove,
    handleDownloadExcel,
    handleNewCalculateCreate,
    LocationStatusOptions,
    ProcessStatusOptions,
    statusOptions,
    ArrayStatusOptions,
    displayedRows,
    page,
    setPage,
    sortList,
    setSortList,
    pageSize,
    totalPages,
    setSelectedIds,
  }
}
