'use client'

import { useParams, useSelectedLayoutSegment } from 'next/navigation'

export default function OrderingLayout({ children }: { children: React.ReactNode }) {
  const segment = useSelectedLayoutSegment()
  const params = useParams()
  const { id } = params

  let title = ''

  if (id) {
    title = '발주처 수정'
  } else if (id === undefined) {
    title = segment === 'registration' ? '발주처 등록' : '발주처 관리'
  }

  return (
    <div className="m-8">
      <h1 className="text-2xl mb-3">{title}</h1>
      {children}
    </div>
  )
}
