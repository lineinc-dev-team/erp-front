const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL

const apiBaseUrlv2 = process.env.NEXT_PUBLIC_API_URL_V2

if (!apiBaseUrl) {
  throw new Error('환경 변수 NEXT_PUBLIC_API_URL 설정되지 않았습니다.')
}

export const API = {
  BASE_URL: apiBaseUrl,
  SITES: `${apiBaseUrl}/sites`,
  SITEMANAGEMENT: `${apiBaseUrl}/site-management-costs`,

  PROCESS: `${apiBaseUrl}/site-process`,
  CLIENTCOMPANY: `${apiBaseUrl}/client-companies`,
  OUTSOURCINGCOMPANY: `${apiBaseUrl}/outsourcing-companies`,
  OUTSOURCINGCONTRACT: `${apiBaseUrl}/outsourcing-company-contracts`,
  FUELAGGRE: `${apiBaseUrl}/fuel-aggregations`,
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
  STEELv2: `${apiBaseUrlv2}/steel-managements`,
  MATERIAL: `${apiBaseUrl}/material-managements`,
  DAILYREPORT: `${apiBaseUrl}/daily-reports`,
  LABOR: `${apiBaseUrl}/labors`,
  LABORPAY: `${apiBaseUrl}/labor-payrolls`,
  // 다른 API endpoint도 여기에 추가 가능
}
