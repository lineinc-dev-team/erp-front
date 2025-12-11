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
    if (entity === '출역일보') {
      title = segment === 'registration' ? `${entity}` : `${entity} 조회`
    } else {
      title = segment === 'registration' ? `${entity} 등록` : `${entity} 조회`
    }
  }

  // 👉 대쉬보드 수정인 경우 제목 숨기기
  const hideTitle = entity === '대쉬보드' && id

  const hideReportTitle = entity === '리포트'

  return (
    <div className="m-8">
      <h1
        className="text-2xl mb-3"
        style={{ display: hideTitle || hideReportTitle ? 'none' : 'block' }}
      >
        {title}
      </h1>
      {children}
    </div>
  )
}
