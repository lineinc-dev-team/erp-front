'use client'

import DashBoardDetailView from '@/components/dashboard/DashBoardDetailView'
import { useSearchParams } from 'next/navigation'
export default function Page() {
  const params = useSearchParams()
  const siteName = params.get('siteName')
  const siteId = params.get('siteId')
  const siteProcessId = params.get('siteProcessId')

  return (
    <div>
      <DashBoardDetailView
        siteName={siteName}
        siteId={siteId}
        siteProcessId={siteProcessId}
        isHeadOffice={true}
      />
    </div>
  )
}
