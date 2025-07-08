'use client'

import { usePathname } from 'next/navigation'
import Header from './Header'

export default function HeaderWrapper() {
  const pathName = usePathname()

  const hideHederPaths = ['/', '/errorPage']

  const showHeader = !hideHederPaths.includes(pathName)

  console.log('헤더 데이터 ', pathName, showHeader)

  return (
    <>
      {showHeader && (
        <div className="mt-20">
          <Header />
        </div>
      )}
    </>
  )
}
