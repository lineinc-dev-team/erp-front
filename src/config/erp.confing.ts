import { GridColDef } from '@mui/x-data-grid'

export const SiteOptions = [
  { label: '선택', name: '선택' },
  { label: '건축', name: 'CONSTRUCTION' },
  { label: '토목', name: 'CIVIL_ENGINEERING' },
  { label: '외주', name: 'OUTSOURCING' },
]

export const SiteProgressing = [
  { id: 0, name: '선택', code: '선택' },
  { id: 1, name: '준비중', code: 'NOT_STARTED' },
  { id: 2, name: '진행중', code: 'IN_PROGRESS' },
  { id: 3, name: '종료', code: 'COMPLETED' },
]

export const FuelStatusesing = [
  { id: 0, name: '선택', code: '선택' },
  { id: 1, name: '경유', code: 'DIESEL' },
  { id: 2, name: '휘발유', code: 'GASOLINE' },
  { id: 3, name: '요소수', code: 'UREA' },
  { id: 4, name: '기타', code: 'ETC' },
]

export const LocationStatusOptions = [
  { label: '전체', name: '전체' },
  { label: '서울', name: '서울' },
  { label: '부산', name: '부산' },
  { label: '고양', name: '고양' },
]

export const UseORnotOptions = [
  { id: '0', name: '선택' },
  { id: '1', name: '사용' },
  { id: '2', name: '미사용' },
]

export const isHeadOfficeOptions = [
  { id: '0', name: '선택' },
  { id: '1', name: 'Y' },
  { id: '2', name: 'N' },
]

export const UseStateOptions = [
  { id: '0', name: '선택' },
  { id: '1', name: '활성' },
  { id: '2', name: '비활성' },
]

export const SubmitOptions = [
  { label: '전체', name: '전체' },
  { label: '제출', name: '제출' },
  { label: '미제출', name: '미제출' },
]

export const ProcessStatusOptions = [
  { label: '전체', name: '전체' },
  { label: '미정', name: '미정' },
  { label: '진행 중', name: '진행중' },
  { label: '완료', name: '완료' },
]

export const ArrayStatusOptions = [
  { id: '최신순', name: '최신순' },
  { id: '오래된순', name: '오래된순' },
  { id: '이름순', name: '이름순' },
]

export const LaborArrayStatusOptions = [
  { id: '최신순', name: '최신순' },
  { id: '오래된순', name: '오래된순' },
]

export const PageCount = [
  { id: '20', name: '20' },
  { id: '50', name: '50' },
  { id: '100', name: '100' },
]

export const EquipmentType = [
  { code: 'BASE', name: '선택' },
  { code: 'PIPE_RENTAL', name: '죽통임대' },
  { code: 'B_K', name: 'B/K' },
  { code: 'BIT_USAGE_FEE', name: '비트손료' },
  { code: 'ETC', name: '기타' },
]

export const SiteColumnList: GridColDef[] = [
  { field: 'no', headerName: 'No', width: 10 },
  // { field: 'id', headerName: 'No', width: 70 },
  { field: 'name', headerName: '현장명', width: 130 },
  { field: 'processName', headerName: '공정명', width: 130 },
  { field: 'address', headerName: '위치', width: 130 },
  { field: 'contractAmount', headerName: '계약금액', width: 100 },
  { field: 'period', headerName: '사업기간', width: 120 },
  { field: 'clientCompanyName', headerName: '발주처명', width: 100 },
  { field: 'managerName', headerName: '공정소장', width: 100 },
  { field: 'processStatuses', headerName: '진행상태', width: 120 },
  { field: 'createdBy', headerName: '등록자', width: 100 },
  { field: 'createdAt', headerName: '등록일자', width: 100 },
  { field: 'hasFile', headerName: '첨부파일', width: 100 },
  { field: 'memo', headerName: '비고', width: 100 },
]

export const CostColumnList: GridColDef[] = [
  { field: 'no', headerName: 'No', width: 10 },
  // { field: 'id', headerName: 'No', width: 70 },
  { field: 'site', headerName: '현장명', width: 130 },
  { field: 'process', headerName: '공정명', width: 130 },
  { field: 'itemType', headerName: '항목', width: 180 },
  { field: 'outsourcingCompany', headerName: '구매처', width: 120 },
  { field: 'paymentDate', headerName: '일자', width: 100 },
  { field: 'businessNumber', headerName: '사업자번호', width: 120 },
  { field: 'ceoName', headerName: '대표자', width: 100 },
  // { field: 'accountNumber', headerName: '청구계좌', width: 100 },
  // { field: 'accountHolder', headerName: '예금주명', width: 100 },
  { field: 'supplyPrice', headerName: '공급가', width: 100 },
  { field: 'vat', headerName: '부가세', width: 100 },
  { field: 'deductibleAmount', headerName: '공제액', width: 100 },
  { field: 'total', headerName: '합계', width: 100 },
  { field: 'hasFile', headerName: '첨부파일', width: 100 },
  { field: 'memo', headerName: '비고', width: 100 },
]

export const SteelColumnList: GridColDef[] = [
  { field: 'no', headerName: 'No', width: 10 },
  // { field: 'id', headerName: 'No', width: 70 },
  { field: 'siteName', headerName: '현장명', width: 130 },
  { field: 'siteProcessName', headerName: '공정명', width: 130 },
  { field: 'incomingOwnMaterial', headerName: '입고 자사(톤/합계)', width: 180 },
  { field: 'incomingPurchase', headerName: '입고 구매(톤/합계)', width: 100 },
  { field: 'incomingRental', headerName: '입고 임대(톤/합계)', width: 120 },
  { field: 'outgoingOwnMaterial', headerName: '출고 자사(톤/합계)', width: 120 },
  { field: 'outgoingPurchase', headerName: '출고 구매(톤/합계)', width: 100 },
  { field: 'outgoingRental', headerName: '출고 임대(톤/합계)', width: 100 },
  { field: 'onSiteStock', headerName: '사장(톤)', width: 100 },
  { field: 'scrap', headerName: '고철(톤/합계)', width: 100 },
  { field: 'totalInvestmentAmount', headerName: '총 금액(투입비)', width: 100 },
  { field: 'onSiteRemainingWeight', headerName: '현장보유수량(톤)', width: 100 },
  { field: 'createdAt', headerName: '등록일', width: 100 },
]

export const SiteManamentColumnList: GridColDef[] = [
  { field: 'no', headerName: 'No', width: 10 },
  { field: 'yearMonth', headerName: '연월', width: 130 },
  { field: 'siteName', headerName: '현장명', width: 130 },
  { field: 'siteProcessName', headerName: '공정명', width: 130 },
  { field: 'employeeSalary', headerName: '직원급여', width: 180 },
  { field: 'regularRetirementPension', headerName: '퇴직연금(정규직)', width: 100 },
  { field: 'retirementDeduction', headerName: '퇴직공제부금', width: 120 },
  { field: 'majorInsurance', headerName: '4대보험', width: 120 },
  { field: 'contractGuaranteeFee', headerName: '보증수수료(계약보증)', width: 100 },
  { field: 'equipmentGuaranteeFee', headerName: '보증수수료(현장별건설기계)', width: 100 },
  { field: 'nationalTaxPayment', headerName: '국세납부', width: 100 },
  { field: 'siteManagementTotal', headerName: '계', width: 100 },
  { field: 'headquartersManagementCost', headerName: '본사관리비', width: 100 },
]

export const MaterialColumnList: GridColDef[] = [
  { field: 'no', headerName: 'No', width: 10 },
  // { field: 'backendId', headerName: 'No', width: 70 },
  { field: 'site', headerName: '현장명', width: 130 },
  { field: 'process', headerName: '공정명', width: 130 },
  { field: 'name', headerName: '품명', width: 120 },
  { field: 'inputType', headerName: '투입구분', width: 180 },
  { field: 'standard', headerName: '규격', width: 100 },
  { field: 'quantity', headerName: '수량', width: 100 },
  { field: 'unitPrice', headerName: '단가', width: 100 },
  { field: 'supplyPrice', headerName: '공급가', width: 100 },
  { field: 'deliveryDate', headerName: '납품일자', width: 100 },
  { field: 'outsourcingCompanyName', headerName: '자재업체명', width: 120 },
  { field: 'usage', headerName: '사용용도', width: 100 },
  { field: 'vat', headerName: '부가세', width: 100 },
  { field: 'total', headerName: '합계', width: 100 },
  { field: 'hasFile', headerName: '첨부파일', width: 100 },
  { field: 'memo', headerName: '비고', width: 100 },
]

export const FuelColumnList: GridColDef[] = [
  { field: 'no', headerName: 'No', width: 10 },
  // { field: 'backendId', headerName: 'No', width: 70 },
  { field: 'site', headerName: '현장명', width: 130 },
  { field: 'process', headerName: '공정명', width: 130 },
  { field: 'date', headerName: '일자', width: 130 },
  { field: 'fuelCompany', headerName: '유류업체명', width: 130 },
  { field: 'outsourcingCompany', headerName: '업체명', width: 130 },

  { field: 'specification', headerName: '규격', width: 100 },
  { field: 'fuelType', headerName: '유종', width: 120 },

  { field: 'vehicleNumber', headerName: '차량번호', width: 180 },
  { field: 'fuelAmount', headerName: '주유량', width: 120 },
  { field: 'amount', headerName: '금액', width: 120 },
  { field: 'createdAt', headerName: '등록/수정일', width: 100 },
  { field: 'memo', headerName: '비고', width: 100 },
]

export const UserDataList: GridColDef[] = [
  { field: 'no', headerName: 'No', width: 10 },
  // { field: 'backendId', headerName: 'No', width: 70 },
  { field: 'loginId', headerName: '사용자 ID', width: 130 },
  { field: 'username', headerName: '사용자 이름', width: 130 },
  { field: 'department', headerName: '부서', width: 180 },
  { field: 'grade', headerName: '직급', width: 180 },
  { field: 'position', headerName: '직책', width: 180 },
  { field: 'phoneNumber', headerName: '개인 휴대폰', width: 180 },
  { field: 'isActive', headerName: '계정상태', width: 100 },
  { field: 'lastLoginAt', headerName: '최종접속일', width: 120 },
  { field: 'createdAt', headerName: '생성일자', width: 100 },
  { field: 'updatedAt', headerName: '최종수정일', width: 100 },
  { field: 'updatedBy', headerName: '수정자', width: 100 },
  { field: 'memo', headerName: '비고', width: 100 },
]

export const PermissionDataList: GridColDef[] = [
  { field: 'no', headerName: 'No', width: 10 },
  // { field: 'id', headerName: 'No', width: 70 },
  { field: 'name', headerName: '그룹명', width: 130 },
  { field: 'sites', headerName: '현장/공정', width: 130 },
  { field: 'createdAt', headerName: '등록일/수정일', width: 180 },
  { field: 'memo', headerName: '비고', width: 180 },
]

export const clientCompanyList: GridColDef[] = [
  { field: 'no', headerName: 'No', width: 20 },
  { field: 'businessNumber', headerName: '사업자등록번호', width: 20 },
  { field: 'name', headerName: '발주처명', width: 20 },
  { field: 'ceoName', headerName: '대표자명', width: 20 },
  { field: 'email', headerName: '이메일', width: 20 },
  { field: 'address', headerName: '본사 주소', width: 20 },
  { field: 'landlineNumber', headerName: '전화번호', width: 20 },
  { field: 'contactName', headerName: '담당자명', width: 20 },
  { field: 'contactPositionAndDepartment', headerName: '부서/직급', width: 20 },
  { field: 'contactInfo', headerName: '담당자 연락처/이메일', width: 20 },
  { field: 'headquarter', headerName: '본사담당자명', width: 20 },
  { field: 'isActive', headerName: '사용여부', width: 20 },
  { field: 'createdAt', headerName: '등록일/수정일', width: 20 },
  { field: 'hasFile', headerName: '첨부파일 유무', width: 20 },
  { field: 'memo', headerName: '비고', width: 20 },
]

export const LaborColumnList: GridColDef[] = [
  { field: 'no', headerName: 'No', width: 10 },
  // { field: 'id', headerName: 'No', width: 70 },
  { field: 'type', headerName: '구분', width: 130 },
  { field: 'name', headerName: '이름', width: 130 },
  { field: 'residentNumber', headerName: '주민번호', width: 130 },
  { field: 'outsourcingCompanyName', headerName: '소속업체', width: 180 },
  { field: 'workType', headerName: '공종', width: 100 },
  { field: 'mainWork', headerName: '주 작업', width: 100 },
  { field: 'phoneNumber', headerName: '연락처', width: 120 },
  { field: 'dailyWage', headerName: '기준일당', width: 100 },
  { field: 'accountNumber', headerName: '계좌번호', width: 100 },
  // { field: 'tenureDays', headerName: '근속일수', width: 100 },
  { field: 'tenureMonths', headerName: '근속기간', width: 100 },
  { field: 'isSeverancePayEligible', headerName: '퇴직금 발생', width: 100 },
  { field: 'hasBankbook', headerName: '통장 사본', width: 100 },
  { field: 'hasIdCard', headerName: '신분증 사본', width: 100 },
  { field: 'hasLaborContract', headerName: '근로계약서', width: 100 },
  { field: 'hasFile', headerName: '기타첨부', width: 100 },
]

export const DailyColumnList: GridColDef[] = [
  { field: 'no', headerName: 'No', width: 10 },
  { field: 'site', headerName: '현장', width: 130 },
  { field: 'siteProcess', headerName: '공정', width: 130 },
  { field: 'reportDate', headerName: '일자', width: 130 },
  { field: 'employeeWorkQuantitySum', headerName: '직원(공수)/증빙', width: 180 },
  { field: 'directContractWorkQuantitySum', headerName: '직영,용역(공수)/증빙', width: 100 },
  { field: 'equipmentTotalHours', headerName: '장비(시간)/증빙', width: 120 },
  { field: 'fuelEvidenceSubmitted', headerName: '유류/증빙', width: 100 },

  { field: 'outsourcingWorkQuantitySum', headerName: '외주(공수)/증빙', width: 100 },

  { field: 'isConstructionReport', headerName: '공사일보', width: 100 },
  { field: 'sitePhotoSubmitted', headerName: '현장사진', width: 100 },
  { field: 'gasolineTotalAmount', headerName: '유류(L)/휘발유', width: 100 },
  { field: 'dieselTotalAmount', headerName: '유류(L)/경유', width: 100 },
  { field: 'ureaTotalAmount', headerName: '유류(L)/요소수', width: 100 },
  { field: 'etcTotalAmount', headerName: '유류(L)/기타', width: 100 },
  // { field: 'accountNumber', headerName: '현장사진', width: 100 },
  // { field: 'tenureMonths', headerName: '작업내용', width: 100 },
  { field: 'weather', headerName: '날씨', width: 100 },
  { field: 'status', headerName: '마감', width: 100 },
]

export const outsourcingCompanyList: GridColDef[] = [
  { field: 'no', headerName: 'No', width: 10 },
  // { field: 'id', headerName: 'No', width: 70 },
  { field: 'name', headerName: '업체명', width: 130 },
  { field: 'businessNumber', headerName: '사업자등록번호', width: 130 },
  { field: 'type', headerName: '구분', width: 130 },
  { field: 'ceoName', headerName: '대표자명', width: 130 },
  { field: 'address', headerName: '주소', width: 180 },
  { field: 'landlineNumber', headerName: '전화번호', width: 100 },
  { field: 'email', headerName: '이메일', width: 100 },
  { field: 'contactName', headerName: '담당자명', width: 100 },
  { field: 'contactPositionAndDepartment', headerName: '부서/직급', width: 120 },
  { field: 'contractHistory', headerName: '계약이력', width: 120 },
  { field: 'hasFile', headerName: '첨부파일 유무', width: 100 },
  { field: 'isActive', headerName: '사용여부', width: 100 },
  { field: 'createdAt', headerName: '등록일/수정일', width: 100 },
  { field: 'memo', headerName: '비고', width: 100 },
]

export const outsourcingContractListData: GridColDef[] = [
  { field: 'no', headerName: 'No', width: 10 },
  // { field: 'id', headerName: 'No', width: 70 },
  { field: 'siteName', headerName: '현장명', width: 130 },
  { field: 'processName', headerName: '공정명', width: 130 },
  { field: 'companyName', headerName: '외주업체명', width: 130 },
  { field: 'businessNumber', headerName: '사업자등록번호', width: 130 },
  { field: 'type', headerName: '구분', width: 130 },
  { field: 'contractStartDate', headerName: '계약기간(시작/종료)', width: 130 },
  { field: 'contractAmount', headerName: '계약금액(총액)', width: 180 },
  // { field: 'defaultDeductions', headerName: '공제항목', width: 100 },
  { field: 'hasGuaranteeCertificate', headerName: '보증서', width: 100 },
  { field: 'hasContractCertificate', headerName: '계약서', width: 100 },
  { field: 'taxInvoiceCondition', headerName: '세금계산서발행조건', width: 120 },
  { field: 'contactName', headerName: '담당자', width: 100 },
  { field: 'createdAt', headerName: '작성일자', width: 100 },
  { field: 'contractStatus', headerName: '상태', width: 100 },
  { field: 'memo', headerName: '비고', width: 100 },
]

export const AreaCode = [
  { id: '지역번호', name: '지역번호' },
  { id: '02', name: '02' },
  { id: '010', name: '010' },
  { id: '031', name: '031' },
  { id: '032', name: '032' },
  { id: '033', name: '033' },
  { id: '041', name: '041' },
  { id: '042', name: '042' },
  { id: '043', name: '043' },
  { id: '044', name: '044' },
  { id: '051', name: '051' },
  { id: '052', name: '052' },
  { id: '053', name: '053' },
  { id: '054', name: '054' },
  { id: '055', name: '055' },
  { id: '061', name: '061' },
  { id: '062', name: '062' },
  { id: '063', name: '063' },
  { id: '064', name: '064' },
]

export const PayInfo = [
  { id: '선택', name: '선택' },
  { id: '어음', name: '어음' },
  { id: '현금', name: '현금' },
]

export const DeadLineInfo = [
  { id: '선택', name: '선택' },
  { id: 'Y', name: 'Y' },
  { id: 'N', name: 'N' },
]

export const GuaranteeInfo = [
  { label: '선택', name: '선택' },
  { label: 'O', name: 'O' },
  { label: 'X', name: 'X' },
]

// 관리비 옵션 타입
export const itemTypeOptions = [
  { label: '선택', name: '선택' },
  { label: '보증금', name: 'DEPOSIT' },
  { label: '월세', name: 'MONTHLY_RENT' },
  { label: '관리비(가스전기수도)', name: 'MAINTENANCE' },
  { label: '주차비', name: 'PARKING_FEE' },
  { label: '식대', name: 'MEAL_FEE' },
  { label: '전도금', name: 'KEY_MONEY' },
  { label: '기타잡비', name: 'MISC_EXPENSE' },
]

// 강재관리 옵션 타입
export const steelTypeOptions = [
  { label: '선택', name: '선택' },
  { label: '자사자재', name: 'OWN_MATERIAL' },
  { label: '구매', name: 'PURCHASE' },
  { label: '임대', name: 'RENTAL' },
]

// 자재관리 투입구분타입
export const materialTypeOptions = [
  { label: '선택', name: '선택' },
  { label: '주요자재(구매)', name: 'MAJOR_PURCHASE' },
  { label: '주요자재(임대)', name: 'MAJOR_LEASE' },
  { label: '주요자재(자사)', name: 'MAJOR_INTERNAL' },
  { label: '부대토목자재', name: 'CIVIL_SUPPORT' },
  { label: '잡자재(공구)', name: 'TOOL_MISC' },
  { label: '잡자재(잡철)', name: 'METAL_MISC' },
  { label: '안전(안전관리비)', name: 'SAFETY' },
  { label: '환경(환경관리비)', name: 'ENVIRONMENT' },
  { label: '운반비', name: 'TRANSPORT' },
]

export const bankOptions = [
  { id: '0', name: '선택' },
  { id: '1', name: '기업은행' },
  { id: '2', name: '농협은행' },
  { id: '3', name: '우리은행' },
  { id: '4', name: '카카오뱅크' },
  { id: '5', name: '국민은행' },
  { id: '6', name: '신한은행' },
  { id: '7', name: 'KB증권' },
  { id: '8', name: 'BNK투자증권' },
  { id: '9', name: 'DB금융투자' },
  { id: '10', name: 'IBK투자증권' },
  { id: '11', name: 'KTB투자증권' },
  { id: '12', name: '키움증권' },
  { id: '13', name: '교보증권' },
  { id: '14', name: '대신증권' },
  { id: '15', name: '메리츠증권' },
  { id: '16', name: '미래에셋증권' },
  { id: '17', name: '부국증권' },
  { id: '18', name: '삼성증권' },
  { id: '19', name: '신한금융투자' },
  { id: '20', name: '신영증권' },
  { id: '21', name: '아이엠투자증권' },
  { id: '22', name: '유안타증권' },
  { id: '23', name: '유진투자증권' },
  { id: '24', name: '이베스트투자증권' },
  { id: '25', name: '케이에프투자증권' },
  { id: '26', name: '한화증권' },
  { id: '27', name: '하나금융투자' },
  { id: '28', name: 'SK증권' },
  { id: '29', name: '카카오페이증권' },
]

export const bankCostOptions = [
  { id: '선택', name: '선택' },
  { id: '기업은행', name: '기업은행' },
  { id: '농협은행', name: '농협은행' },
  { id: '우리은행', name: '우리은행' },
  { id: '카카오뱅크', name: '카카오뱅크' },
  { id: '국민은행', name: '국민은행' },
  { id: '신한은행', name: '신한은행' },
  { id: 'KB증권', name: 'KB증권' },
  { id: 'BNK투자증권', name: 'BNK투자증권' },
  { id: 'DB금융투자', name: 'DB금융투자' },
  { id: 'IBK투자증권', name: 'IBK투자증권' },
  { id: 'KTB투자증권', name: 'KTB투자증권' },
  { id: '키움증권', name: '키움증권' },
  { id: '교보증권', name: '교보증권' },
  { id: '대신증권', name: '대신증권' },
  { id: '메리츠증권', name: '메리츠증권' },
  { id: '미래에셋증권', name: '미래에셋증권' },
  { id: '부국증권', name: '부국증권' },
  { id: '삼성증권', name: '삼성증권' },
  { id: '신한금융투자', name: '신한금융투자' },
  { id: '신영증권', name: '신영증권' },
  { id: '아이엠투자증권', name: '아이엠투자증권' },
  { id: '유안타증권', name: '유안타증권' },
  { id: '유진투자증권', name: '유진투자증권' },
  { id: '이베스트투자증권', name: '이베스트투자증권' },
  { id: '케이에프투자증권', name: '케이에프투자증권' },
  { id: '한화증권', name: '한화증권' },
  { id: '하나금융투자', name: '하나금융투자' },
  { id: 'SK증권', name: 'SK증권' },
  { id: '카카오페이증권', name: '카카오페이증권' },
]

// 시 와  구 를 구분

export const CityOptions = [
  { id: '0', name: '선택' },
  { id: 'Seoul', name: '서울' },
  { id: 'Busan', name: '부산' },
  { id: 'Daegu', name: '대구' },
  { id: 'Incheon', name: '인천' },
  { id: 'Gwangju', name: '광주' },
  { id: 'Daejeon', name: '대전' },
  { id: 'Ulsan', name: '울산' },
  { id: 'Sejong', name: '세종' },
  { id: 'Jeju', name: '제주' },
]

export const DistrictGuOptions = [
  { id: '0', name: '선택' },
  { id: 'Seoul-Jongno-gu', name: '종로구' },
  { id: 'Seoul-Jung-gu', name: '중구' },
  { id: 'Seoul-Yongsan-gu', name: '용산구' },
  { id: 'Seoul-Seongdong-gu', name: '성동구' },
  { id: 'Seoul-Gwangjin-gu', name: '광진구' },
  { id: 'Seoul-Dongdaemun-gu', name: '동대문구' },
  { id: 'Seoul-Jungnang-gu', name: '중랑구' },
  { id: 'Seoul-Seongbuk-gu', name: '성북구' },
  { id: 'Seoul-Gangbuk-gu', name: '강북구' },
  { id: 'Seoul-Dobong-gu', name: '도봉구' },
  { id: 'Seoul-Nowon-gu', name: '노원구' },
  { id: 'Seoul-Eunpyeong-gu', name: '은평구' },
  { id: 'Seoul-Seodaemun-gu', name: '서대문구' },
  { id: 'Seoul-Mapo-gu', name: '마포구' },
  { id: 'Seoul-Yangcheon-gu', name: '양천구' },
  { id: 'Seoul-Gangseo-gu', name: '강서구' },
  { id: 'Seoul-Guro-gu', name: '구로구' },
  { id: 'Seoul-Geumcheon-gu', name: '금천구' },
  { id: 'Seoul-Yeongdeungpo-gu', name: '영등포구' },
  { id: 'Seoul-Dongjak-gu', name: '동작구' },
  { id: 'Seoul-Gwanak-gu', name: '관악구' },
  { id: 'Seoul-Sadong-gu', name: '서초구' },
  { id: 'Seoul-Gangnam-gu', name: '강남구' },
  { id: 'Seoul-Songpa-gu', name: '송파구' },
  { id: 'Seoul-Gangdong-gu', name: '강동구' },
  { id: 'Busan-Jung-gu', name: '중구' },
  { id: 'Busan-Seo-gu', name: '서구' },
  { id: 'Busan-Dong-gu', name: '동구' },
  { id: 'Busan-Yeongdo-gu', name: '영도구' },
  { id: 'Busan-Sasang-gu', name: '사상구' },
  { id: 'Busan-Saha-gu', name: '사하구' },
  { id: 'Busan-Buk-gu', name: '북구' },
  { id: 'Busan-Haeundae-gu', name: '해운대구' },
  { id: 'Busan-Gijang-gun', name: '기장군' },
  { id: 'Busan-Gangseo-gu', name: '강서구' },
  { id: 'Busan-Geumjeong-gu', name: '금정구' },
  { id: 'Busan-Dongnae-gu', name: '동래구' },
  { id: 'Daegu-Jung-gu', name: '중구' },
  { id: 'Daegu-Dalseo-gu', name: '달서구' },
  { id: 'Daegu-Nam-gu', name: '남구' },
  { id: 'Daegu-Buk-gu', name: '북구' },
  { id: 'Daegu-Dalseong-gun', name: '달성군' },
  { id: 'Daegu-Dong-gu', name: '동구' },
  { id: 'Daegu-Suseong-gu', name: '수성구' },

  // 인천시
  { id: 'Incheon-Jung-gu', name: '중구' },
  { id: 'Incheon-Dong-gu', name: '동구' },
  { id: 'Incheon-Michuhol-gu', name: '미추홀구' },
  { id: 'Incheon-Yangcheon-gu', name: '연수구' },
  { id: 'Incheon-Bupyeong-gu', name: '부평구' },
  { id: 'Incheon-Namdong-gu', name: '남동구' },
  { id: 'Incheon-Ganseok-gu', name: '계양구' },
  { id: 'Incheon-Seo-gu', name: '서구' },
  { id: 'Incheon-Ongjin-gun', name: '옹진군' },

  // 광주 시
  { id: 'Gwangju-Dong-gu', name: '동구' },
  { id: 'Gwangju-Seo-gu', name: '서구' },
  { id: 'Gwangju-Nam-gu', name: '남구' },
  { id: 'Gwangju-Gwangsan-gu', name: '광산구' },

  // 대전 시

  { id: 'Daejeon-Jung-gu', name: '중구' },
  { id: 'Daejeon-Dong-gu', name: '동구' },
  { id: 'Daejeon-Seo-gu', name: '서구' },
  { id: 'Daejeon-Yuseong-gu', name: '유성구' },
  { id: 'Daejeon-Daedeok-gu', name: '대덕구' },
  // 울산 시
  { id: 'Ulsan-Jung-gu', name: '중구' },
  { id: 'Ulsan-Nam-gu', name: '남구' },
  { id: 'Ulsan-Dong-gu', name: '동구' },
  { id: 'Ulsan-Buk-gu', name: '북구' },
  { id: 'Ulsan-Ulsan-myeon', name: '울주군' },
]

export const WithoutApprovalAndRemovalOptions = [
  { code: 'BASE', name: '선택' },
  {
    code: 'ORDER',
    name: '발주',
  },
  {
    code: 'PURCHASE',
    name: '매입',
  },
  {
    code: 'LEASE',
    name: '임대',
  },
]

// 노무 명세서

export const LaborStateMentColumnList: GridColDef[] = [
  { field: 'no', headerName: 'No', width: 10 },
  // { field: 'id', headerName: 'No', width: 70 },
  { field: 'siteName', headerName: '현장', width: 130 },
  { field: 'processName', headerName: '공정', width: 130 },
  { field: 'yearMonth', headerName: '조회월', width: 130 },

  { field: 'outsourcingCount', headerName: '용역', width: 130 },
  { field: 'directContractCount', headerName: '직영', width: 180 },
  // { field: 'etcCount', headerName: '기타', width: 100 },
  { field: 'totalLaborCost', headerName: '노무비 합계', width: 100 },
  { field: 'totalDeductions', headerName: '공제 합계', width: 120 },
  { field: 'totalNetPayment', headerName: '차감지급액 합계', width: 100 },
  { field: 'memo', headerName: '비고', width: 100 },
]
