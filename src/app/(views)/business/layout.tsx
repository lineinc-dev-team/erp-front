'use client'

import { useSelectedLayoutSegment } from 'next/navigation'

export default function BusinessLayout({ children }: { children: React.ReactNode }) {
  const segment = useSelectedLayoutSegment()
  const title = segment === 'registration' ? '사업장 등록' : '사업장 관리'

  return (
    <div className="m-8">
      <h1 className="text-2xl mb-3">{title}</h1>
      {children}
    </div>
  )
}
