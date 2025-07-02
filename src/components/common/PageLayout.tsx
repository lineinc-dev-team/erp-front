'use client'

import { useParams, useSelectedLayoutSegment } from 'next/navigation'

type PageLayoutProps = {
  entity: string
  children: React.ReactNode
}

export default function PageLayout({ entity, children }: PageLayoutProps) {
  const segment = useSelectedLayoutSegment()
  const params = useParams()
  const { id } = params

  let title = ''

  if (id) {
    title = `${entity} 수정`
  } else if (id === undefined) {
    title = segment === 'registration' ? `${entity} 등록` : `${entity} 관리`
  }

  return (
    <div className="m-8">
      <h1 className="text-2xl mb-3">{title}</h1>
      {children}
    </div>
  )
}
