import React, { Suspense } from 'react'
import DailyReportRegistrationView from '@/components/dailyReport/DailyReportRegistrationView'

export default function Page() {
  return (
    <Suspense fallback={<div>로딩 중...</div>}>
      <DailyReportRegistrationView />
    </Suspense>
  )
}
