// src/api/menuService.ts
import { API } from '@/api/config/env'

export async function MenuService() {
  const res = await fetch(API.SIDEMENU, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    cache: 'no-store',
  })

  if (!res.ok) {
    throw new Error(`서버 에러: ${res.status}`)
  }

  return res.json()
}
