import DashBoardDetailView from '@/components/dashboard/DashBoardDetailView'
import { Suspense } from 'react'

export default function page() {
  return (
    <div>
      <Suspense fallback={<div>로딩…</div>}>
        <DashBoardDetailView isHeadOffice={true} />
      </Suspense>
    </div>
  )
}
