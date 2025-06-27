'use client'

import { useParams, useSelectedLayoutSegment } from 'next/navigation'

export default function BusinessLayout({ children }: { children: React.ReactNode }) {
  const segment = useSelectedLayoutSegment()
  const params = useParams()
  const { id } = params

  let title = ''

  if (id) {
    title = '사업장 수정'
  } else if (id === undefined) {
    title = segment === 'registration' ? '사업장 등록' : '사업장 관리'
  }

  return (
    <div className="m-8">
      <h1 className="text-2xl mb-3">{title}</h1>
      {children}
    </div>
  )
}
