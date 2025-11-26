'use client'

import DashBoardDetailView from '@/components/dashboard/DashBoardDetailView'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
export default function Page() {
  const params = useSearchParams()
  const siteName = params.get('siteName')
  const siteId = params.get('siteId')
  const siteProcessId = params.get('siteProcessId')

  return (
    <div>
      <Suspense fallback={<div>로딩…</div>}>
        <DashBoardDetailView
          siteName={siteName}
          siteId={siteId}
          siteProcessId={siteProcessId}
          isHeadOffice={true}
        />
      </Suspense>
    </div>
  )
}
