'use client'

import CommonButton from '@/components/common/Button'
import { useRouter } from 'next/navigation'

export default function Error() {
  const router = useRouter()

  return (
    <div
      className="flex flex-col justify-center items-center
      h-[calc(100vh-64px)]"
    >
      <h1 className="text-3xl font-bold">페이지를 찾을 수 없습니다</h1>
      <CommonButton
        label="홈으로 이동"
        variant="primary"
        className="mt-5"
        onClick={() => router.push('/')}
      />
    </div>
  )
}
