'use client'

import { usePathname } from 'next/navigation'
import Header from './Header'

export default function HeaderWrapper() {
  const pathName = usePathname()

  const hideHederPaths = ['/', '/resetPassword', '/errorPage']

  const showHeader = !hideHederPaths.includes(pathName)

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
