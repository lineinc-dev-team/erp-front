export const userExcelFieldMap = {
  No: 'id',
  '사용자 ID': 'loginId',
  이름: 'username',
  부서: 'department',
  직급: 'grade',
  직책: 'position',
  '개인 휴대폰': 'phoneNumber',
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
  이메일: 'email',
  본사주소: 'address',
  전화번호: 'landlineNumber',
  담당자명: 'contactName',
  '부서/직급': 'contactPositionAndDepartment',
  '담당자 연락처/이메일': 'contactLandlineNumberAndEmail',
  본사담당자명: 'userName',
  사용여부: 'isActive',
  '등록일/수정일': 'createdAtAndUpdatedAt',
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
  발주처명: 'clientCompanyName',
  계약금액: 'contractAmount',
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
  항목: 'itemType',
  업체명: 'outsourcingCompanyName',
  일자: 'paymentDate',
  사업자번호: 'outsourcingCompanyBusinessNumber',
  대표자: 'outsourcingCompanyCeoName',
  // 청구계좌: 'outsourcingCompanyAccountNumber',
  // 예금주명: 'outsourcingCompanyAccountHolder',
  공급가: 'supplyPrice',
  부가세: 'vat',
  합계: 'total',
  공제액: 'deductibleAmount',
  첨부파일: 'hasFile',
  비고: 'memo',
} as const

export type CostExcelFieldLabel = keyof typeof CostExcelFieldMap
export type CostExcelFieldKey = (typeof CostExcelFieldMap)[CostExcelFieldLabel]

// 강재수불부 엑셀다운 로드 필드 체크

export const SteelExcelFieldMap = {
  No: 'id',
  현장명: 'siteName',
  공정명: 'siteProcessName',
  '입고 자사(톤/금액)': 'incomingOwnMaterial',
  '입고 구매(톤/금액)': 'incomingPurchase',
  '입고 임대(톤/금액)': 'incomingRental',
  '출고 자사(톤/금액)': 'outgoingOwnMaterial',
  '출고 구매(톤/금액)': 'outgoingPurchase',
  '출고 임대(톤/금액)': 'outgoingRental',
  '사장(톤)': 'onSiteStock',
  '고철(톤/금액)': 'scrap',
  '총 금액(투입비)': 'totalInvestmentAmount',
  '현장보유수량(톤)': 'onSiteRemainingWeight',
  등록일: 'createdAt',
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
  자재업체명: 'outsourcingCompanyName',
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

// 외주계약관리

export const outsourcingContractExcelFieldMap = {
  No: 'id',
  현장명: 'siteName',
  공정명: 'processName',
  외주업체명: 'companyName',
  사업자등록번호: 'businessNumber',
  구분: 'contractType',
  계약기간: 'contractPeriod',
  계약금액: 'contractAmount',
  공제항목: 'defaultDeductions',
  보증서: 'hasGuaranteeCertificate',
  계약서: 'hasContractCertificate',
  '세금계산서 발행조건': 'taxInvoiceCondition',
  담당자: 'contacts',
  작성일자: 'createdAt',
  상태: 'contractStatus',
  비고: 'memo',
} as const

export type ContractoutExcelFieldLabel = keyof typeof outsourcingContractExcelFieldMap
export type ContractoutExcelFieldKey =
  (typeof outsourcingContractExcelFieldMap)[ContractoutExcelFieldLabel]

// 유류집계 조회 컬럼 리스트

export const fuelExcelFieldMap = {
  No: 'id',
  현장명: 'siteName',
  공정명: 'processName',
  일자: 'date',
  업체명: 'outsourcingCompanyName',
  기사명: 'driverName',
  차량번호: 'vehicleNumber',
  규격: 'specification',
  유종: 'fuelType',
  쥬유량: 'fuelAmount',
  '등록/수정일': 'createdAtAndUpdatedAt',
  비고: 'memo',
} as const

export type FuelExcelFieldLabel = keyof typeof fuelExcelFieldMap
export type FuelExcelFieldKey = (typeof fuelExcelFieldMap)[FuelExcelFieldLabel]

//노무(인력정보) 조회 컬럼 리스트
export const laborExcelFieldMap = {
  No: 'id',
  구분: 'type',
  이름: 'name',
  주민번호: 'residentNumber',
  소속업체: 'outsourcingCompanyName',
  공종: 'workType',
  '주 작업': 'mainWork',
  연락처: 'phoneNumber',
  기준일당: 'dailyWage',
  계좌번호: 'accountNumber',
  근속기간: 'tenureMonths',
  '퇴직금 발생': 'isSeverancePayEligible',
  '통장 사본': 'hasBankbook',
  '신분증 사본': 'hasIdCard',
  '서명 이미지': 'hasSignatureImage',
  // 입사일: 'hireDate',
  // 퇴사일: 'resignationDate',
  첨부파일: 'hasFile',
} as const

export type LaborExcelFieldLabel = keyof typeof laborExcelFieldMap
export type LaborExcelFieldKey = (typeof laborExcelFieldMap)[LaborExcelFieldLabel]

// 노무명세서

export const laborStateMentExcelFieldMap = {
  No: 'id',
  현장: 'siteName',
  공정: 'processName',
  조회월: 'yearMonth',
  정직원: 'regularEmployeeCount',
  '직영/계약직': 'directContractCount',
  기타: 'etcCount',
  '노무비 합계': 'totalLaborCost',
  '공제 합계': 'totalDeductions',
  '차감지급액 합계': 'totalNetPayment',
  비고: 'memo',
} as const

export type LaborStateExcelFieldLabel = keyof typeof laborStateMentExcelFieldMap
export type LaborStateMentExcelFieldKey =
  (typeof laborStateMentExcelFieldMap)[LaborStateExcelFieldLabel]
