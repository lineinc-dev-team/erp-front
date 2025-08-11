const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL

if (!apiBaseUrl) {
  throw new Error('환경 변수 NEXT_PUBLIC_API_URL 설정되지 않았습니다.')
}

export const API = {
  BASE_URL: apiBaseUrl,
  SITES: `${apiBaseUrl}/sites`,
  PROCESS: `${apiBaseUrl}/site-process`,
  CLIENTCOMPANY: `${apiBaseUrl}/client-companies`,
  OUTSOURCINGCOMPANY: `${apiBaseUrl}/outsourcing-companies`,
  OUTSOURCINGCONTRACT: `${apiBaseUrl}/outsourcing-company-contracts`,
  LOGIN: `${apiBaseUrl}/auth/login`,
  LOGOUT: `${apiBaseUrl}/auth/logout`,
  RESETPASSWORD: `${apiBaseUrl}/auth/password`,
  MYINFO: `${apiBaseUrl}/auth/me`,
  SIDEMENU: `${apiBaseUrl}/menus/permissions`,
  SINGLEROLE: `${apiBaseUrl}/roles`,
  USER: `${apiBaseUrl}/users`,
  DEPARTMENTS: `${apiBaseUrl}/departments`,
  POSITIONS: `${apiBaseUrl}/positions`,
  GRADES: `${apiBaseUrl}/grades`,
  FILEUPLOAD: `${apiBaseUrl}/files`,
  COST: `${apiBaseUrl}/management-costs`,
  STEEL: `${apiBaseUrl}/steel-managements`,
  MATERIAL: `${apiBaseUrl}/material-managements`,
  // 다른 API endpoint도 여기에 추가 가능
}
