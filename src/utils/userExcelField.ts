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
export const worksiteExcelFieldMap = {
  No: 'id',
  사업장명: 'name',
  주소: 'address',
  연락처: 'phoneNumber',
  사용여부: 'isActive',
  생성일: 'createdAt',
} as const

export type WorksiteExcelFieldLabel = keyof typeof worksiteExcelFieldMap
export type WorksiteExcelFieldKey = (typeof worksiteExcelFieldMap)[WorksiteExcelFieldLabel]

export const worksiteFieldArray = Object.entries(worksiteExcelFieldMap).map(([label, value]) => ({
  label,
  value,
}))
