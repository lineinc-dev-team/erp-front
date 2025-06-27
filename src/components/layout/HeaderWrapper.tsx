'use client'

import { usePathname } from 'next/navigation'
import Header from './Header'

export default function HeaderWrapper() {
  const pathName = usePathname()

  const hideHederPaths = ['/', '/errorPage']

  const showHeader = !hideHederPaths.includes(pathName)

  return <>{showHeader && <Header />}</>
}
