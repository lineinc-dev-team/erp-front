'use client'

import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function UseBusinessModify() {
  const { id } = useParams()
  //   const router = useRouter()

  const [initialData, setInitialData] = useState(false)

  //   로딩과 에러 난 추후

  useEffect(() => {
    if (!id) return

    if (id === '20') {
      setInitialData(true)

      //   수정에 관해서 해당 api를 쏠 예정이고 그렇다면 service에서 데이터를 가져와야함
    }
  }, [id])

  return initialData
}
