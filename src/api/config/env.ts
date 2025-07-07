const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL

if (!apiBaseUrl) {
  throw new Error('환경 변수 NEXT_PUBLIC_DEV_API가 설정되지 않았습니다.')
}

export const API = {
  BASE_URL: apiBaseUrl,
  LOGIN: `${apiBaseUrl}/auth/login`,
  LOGOUT: `${apiBaseUrl}/auth/logout`,
  AUTH: `${apiBaseUrl}/auth/me`,
  // 다른 API endpoint도 여기에 추가 가능
}
