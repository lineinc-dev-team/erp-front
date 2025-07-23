const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL

if (!apiBaseUrl) {
  throw new Error('환경 변수 NEXT_PUBLIC_API_URL 설정되지 않았습니다.')
}

export const API = {
  BASE_URL: apiBaseUrl,
  SITES: `${apiBaseUrl}/sites`,
  CLIENTCOMPANY: `${apiBaseUrl}/client-companies`,
  LOGIN: `${apiBaseUrl}/auth/login`,
  LOGOUT: `${apiBaseUrl}/auth/logout`,
  MYINFO: `${apiBaseUrl}/auth/me`,
  SIDEMENU: `${apiBaseUrl}/menus/permissions`,
  SINGLEROLE: `${apiBaseUrl}/roles`,
  USER: `${apiBaseUrl}/users`,
  FILEUPLOAD: `${apiBaseUrl}/files`,
  // 다른 API endpoint도 여기에 추가 가능
}
