'use client'

import { useParams } from 'next/navigation'

export default function RegistrationDetail() {
  const params = useParams()
  const { id } = params

  console.log('너 머야!!', id)

  return (
    <div>
      <h1>등록 ID: {id}</h1>
    </div>
  )
}
