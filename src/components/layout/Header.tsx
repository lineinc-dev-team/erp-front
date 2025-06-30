'use client'

import { useParams, usePathname, useRouter } from 'next/navigation'
import CommonButton from '../common/Button'
import { API } from '@/api/config/env'
import Link from 'next/link'

export default function Header() {
  const router = useRouter()

  const params = useParams()
  const urlName = usePathname()
  const { id } = params

  const handleLogout = async () => {
    if (confirm('정말 로그아웃 하시겠습니까?')) {
      try {
        const response = await fetch(API.LOGOUT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          cache: 'no-store',
        })

        alert('로그아웃 되었습니다.')

        if (!response.ok) {
          const data = await response.json()
          alert(data.message || '로그아웃에 실패했습니다.')
          return
        }

        router.push('/')
      } catch (err) {
        if (err instanceof Error) {
          alert('네트워크 에러입니다.')
        }
      }
    }
  }

  return (
    <header className="top-0 left-0 w-full bg-primaryBlue border-b border-gray-200 shadow-sm z-50">
      <div className="mx-auto flex items-center justify-between px-6 h-16">
        <div className="flex items-center space-x-6">
          <h1 className="text-2xl font-bold text-white">라인공영 Intra</h1>

          <nav className="flex items-center space-x-4 text-sm text-gray-600">
            <Link href="/business" className="text-white border-b-2 transition hover:text-black">
              Home
            </Link>

            <span className="text-black">&gt;&gt;</span>
            <select className="bg-white border font-bold border-gray-300 rounded px-2 py-1 w-52 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400">
              <option>사업장 관리</option>
              <option>외주 관리</option>
            </select>
            {id ? (
              <>
                <span className="text-black">&gt;&gt;</span>
                <select className="bg-white border font-bold border-gray-300 rounded px-2 py-1 w-52 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400">
                  <option>수정</option>
                </select>
              </>
            ) : urlName === '/business/registration' ? (
              <>
                <span className="text-black">&gt;&gt;</span>
                <select className="bg-white border font-bold border-gray-300 rounded px-2 py-1 w-52 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400">
                  <option>등록</option>
                </select>
              </>
            ) : null}
          </nav>
        </div>

        <div className="flex items-center space-x-4">
          <p className="text-sm text-white">이경호(로그인한 ID)</p>
          <CommonButton
            label="로그아웃"
            variant="secondary"
            onClick={handleLogout}
            className="text-sm"
          />
        </div>
      </div>
    </header>
  )
}
