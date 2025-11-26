'use client'

import DashBoardDetailView from '@/components/dashboard/DashBoardDetailView'
import DashboardView from '@/components/dashboard/DashboardView'
import { myInfoProps } from '@/types/user'
import { Suspense, useEffect, useState } from 'react'

export default function Page() {
  const [myInfo, setMyInfo] = useState<myInfoProps | null>(null)

  useEffect(() => {
    const headerData = sessionStorage.getItem('myInfo')
    if (headerData) {
      setMyInfo(JSON.parse(headerData))
    }
  }, [])

  const isHeadOffice = myInfo?.isHeadOffice

  // 본사 아닌 경우 접근 금지
  if (!isHeadOffice) {
    return (
      <>
        <Suspense fallback={<div>로딩…</div>}>
          <DashBoardDetailView isHeadOffice={false} />
        </Suspense>
      </>
    )
  }

  return <DashboardView />
}
