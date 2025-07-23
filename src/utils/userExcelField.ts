export const userExcelFieldMap = {
  No: 'id',
  '사용자 ID': 'loginId',
  '사용자 이름': 'username',
  '소속 (부서/현장)': 'roleName',
  // 직책: 'position',
  계정상태: 'isActive',
  최종접속일: 'lastLoginAt',
  생성일자: 'createdAt',
  최종수정일: 'updatedAt',
  수정자: 'updatedBy',
  비고: 'memo',
} as const

// "사용자 ID", "사용자 이름" 같은 라벨(key) 들의 유니언 타입이 됩니다.
export type UserExcelFieldLabel = keyof typeof userExcelFieldMap

// "loginId", "username" 등 실제 필드값(value) 들의 유니언 타입이 됩니다.
export type UserExcelFieldKey = (typeof userExcelFieldMap)[UserExcelFieldLabel]

// 다음 페이지  필드 체크
// utils/worksiteExcelField.ts
export const clientCompanyExcelFieldMap = {
  No: 'id',
  사업자등록번호: 'businessNumber',
  대표자명: 'ceoName',
  본사주소: 'address',
  전화번호: 'phoneNumber',
} as const

export type WorksiteExcelFieldLabel = keyof typeof clientCompanyExcelFieldMap
export type WorksiteExcelFieldKey = (typeof clientCompanyExcelFieldMap)[WorksiteExcelFieldLabel]

// 현장 엑셀다운 로드 필드 체크

export const SiteExcelFieldMap = {
  No: 'id',
  현장명: 'name',
  위치: 'address',
  현장유형: 'type',
  발주처명: 'clientCompany',
  사업기간: 'startedAt',
  진행상태: 'process',
  등록자: 'createdBy',
  등록일자: 'createdAt',
  첨부파일: 'hasFile',
  비고: 'memo',
} as const

export type SiteExcelFieldLabel = keyof typeof clientCompanyExcelFieldMap
export type SietExcelFieldKey = (typeof clientCompanyExcelFieldMap)[SiteExcelFieldLabel]
