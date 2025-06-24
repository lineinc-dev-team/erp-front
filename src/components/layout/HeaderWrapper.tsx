'use client'

import { usePathname } from 'next/navigation'
import Header from './Header'

export default function HeaderWrapper() {
  const pathName = usePathname()

  return <>{pathName !== '/' && <Header />}</>
}
