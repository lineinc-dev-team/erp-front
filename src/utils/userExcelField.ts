export const userExcelFieldMap = {
  No: 'id',
  '사용자 ID': 'loginId',
  이름: 'username',
  부서: 'department',
  직급: 'grade',
  직책: 'position',
  휴대폰: 'phoneNumber',
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
  발주처명: 'name',
  대표자명: 'ceoName',
  본사주소: 'address',
  전화번호: 'landlineNumber',
  담당자명: 'contactName',
  '직급,부서': 'contactPositionAndDepartment',
  '담당자 연락처, 이메일': 'contactLandlineNumberAndEmail',
  본사담당자: 'userName',
  사용여부: 'isActive',
  '등록일, 수정일': 'createdAtAndUpdatedAt',
  첨부파일유무: 'hasFile',
  비고: 'memo',
} as const

export type WorksiteExcelFieldLabel = keyof typeof clientCompanyExcelFieldMap
export type WorksiteExcelFieldKey = (typeof clientCompanyExcelFieldMap)[WorksiteExcelFieldLabel]

// 현장 엑셀다운 로드 필드 체크

export const SiteExcelFieldMap = {
  No: 'id',
  현장명: 'name',
  공정명: 'processName',
  위치: 'address',
  현장유형: 'type',
  발주처명: 'clientCompanyName',
  도급금액: 'contractAmount',
  공정소장: 'managerName',
  사업기간: 'period',
  진행상태: 'processStatuses',
  등록자: 'createdBy',
  등록일자: 'createdAt',
  첨부파일: 'hasFile',
  비고: 'memo',
} as const

export type SiteExcelFieldLabel = keyof typeof SiteExcelFieldMap
export type SietExcelFieldKey = (typeof SiteExcelFieldMap)[SiteExcelFieldLabel]

// 관리비 엑셀다운 로드 필드 체크

export const CostExcelFieldMap = {
  No: 'id',
  현장명: 'siteName',
  공정명: 'processName',
  품목: 'itemType',
  일자: 'paymentDate',
  사업자번호: 'businessNumber',
  대표자: 'ceoName',
  청구계좌: 'accountNumber',
  계좌명: 'accountHolder',
  공급가: 'supplyPrice',
  부가세: 'vat',
  합계: 'total',
  첨부파일: 'hasFile',
  비고: 'memo',
} as const

export type CostExcelFieldLabel = keyof typeof CostExcelFieldMap
export type CostExcelFieldKey = (typeof CostExcelFieldMap)[CostExcelFieldLabel]

// 강재수불부 엑셀다운 로드 필드 체크

export const SteelExcelFieldMap = {
  No: 'id',
  현장명: 'siteName',
  공정명: 'processName',
  규격: 'standard',
  품목: 'name',
  단위: 'unit',
  본: 'count',
  길이: 'length',
  총길이: 'totalLength',
  단위중량: 'unitWeight',
  수량: 'quantity',
  단가: 'unitPrice',
  공급가: 'supplyPrice',
  // 거래선: 'hasFile',
  용도: 'usage',
  첨부: 'hasFile',
  구분: 'type',
  비고: 'memo',
} as const

export type SteelExcelFieldLabel = keyof typeof SteelExcelFieldMap
export type SteelExcelFieldKey = (typeof SteelExcelFieldMap)[SteelExcelFieldLabel]

// 자재관리 컬럼
export const MaterialExcelFieldMap = {
  No: 'id',
  현장명: 'siteName',
  공정명: 'processName',
  투입구분: 'inputType',
  납품일자: 'deliveryDate',
  // 자채업체명: 'name',
  품명: 'name',
  규격: 'standard',
  사용용도: 'usage',
  수량: 'quantity',
  단가: 'unitPrice',
  공급가: 'supplyPrice',
  부가세: 'vat',
  합계: 'total',
  첨부파일: 'hasFile',
  비고: 'memo',
} as const

export type MaterialExcelFieldLabel = keyof typeof MaterialExcelFieldMap
export type MaterialExcelFieldKey = (typeof MaterialExcelFieldMap)[MaterialExcelFieldLabel]

// 계정관리 컬럼
export const AccountExcelFieldMap = {
  No: 'id',
  사용자ID: 'loginId',
  사용자이름: 'username',
  부서: 'roleName',
  직급: 'isActive',
  직책: 'name',
  휴대폰: 'standard',
  계정상태: 'usage',
  최종접속일: 'lastLoginAt',
  생성일자: 'createdAt',
  최종수정일: 'updatedBy',
  수정자: 'vat',
  비고: 'memo',
} as const

export type AccountxcelFieldLabel = keyof typeof AccountExcelFieldMap
export type AccountExcelFieldKey = (typeof AccountExcelFieldMap)[AccountxcelFieldLabel]

// 외주업체관리

export const outsourcingCompanyExcelFieldMap = {
  No: 'id',
  업체명: 'name',
  사업자등록번호: 'businessNumber',
  구분: 'type',
  대표자명: 'ceoName',
  주소: 'address',
  전화번호: 'landlineNumber',
  이메일: 'email',
  담당자명: 'contactName',
  '직급,부서': 'contactPositionAndDepartment',
  '공제항목 기본값': 'defaultDeductions',
  사용여부: 'isActive',
  '등록일, 수정일': 'createdAtAndUpdatedAt',
  첨부파일유무: 'hasFile',
  비고: 'memo',
} as const

export type WorkoutExcelFieldLabel = keyof typeof outsourcingCompanyExcelFieldMap
export type WorkoutExcelFieldKey = (typeof outsourcingCompanyExcelFieldMap)[WorkoutExcelFieldLabel]
