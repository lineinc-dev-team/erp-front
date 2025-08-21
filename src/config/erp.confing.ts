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
  { id: 3, name: '완료', code: 'COMPLETED' },
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
  // { label: '이름순', name: '이름순' },
]

export const PageCount = [
  { id: '10', name: '10' },
  { id: '20', name: '20' },
  { id: '30', name: '30' },
  { id: '50', name: '50' },
]

export const EquipmentType = [
  { code: 'BASE', name: '선택' },
  { code: 'PIPE_RENTAL', name: '죽통임대' },
  { code: 'B_K', name: 'B/K' },
  { code: 'BIT_USAGE_FEE', name: '비트손료' },
  { code: 'ETC', name: '기타' },
]

export const SiteColumnList: GridColDef[] = [
  { field: 'no', headerName: 'No', width: 70 },
  // { field: 'id', headerName: 'No', width: 70 },
  { field: 'name', headerName: '현장명', width: 130 },
  { field: 'processName', headerName: '공정명', width: 130 },
  { field: 'address', headerName: '위치', width: 130 },
  { field: 'type', headerName: '현장유형', width: 180 },
  { field: 'clientCompanyName', headerName: '발주처명', width: 100 },
  { field: 'contractAmount', headerName: '도급금액', width: 100 },
  { field: 'managerName', headerName: '공정소장', width: 100 },
  { field: 'period', headerName: '사업기간', width: 120 },
  { field: 'processStatuses', headerName: '진행상태', width: 120 },
  { field: 'createdBy', headerName: '등록자', width: 100 },
  { field: 'createdAt', headerName: '등록일자', width: 100 },
  { field: 'hasFile', headerName: '첨부파일', width: 100 },
  { field: 'memo', headerName: '비고', width: 100 },
]

export const CostColumnList: GridColDef[] = [
  { field: 'id', headerName: 'No', width: 70 },
  { field: 'site', headerName: '현장명', width: 130 },
  { field: 'process', headerName: '공정명', width: 130 },
  { field: 'itemType', headerName: '품목', width: 180 },
  { field: 'paymentDate', headerName: '일자', width: 100 },
  // { field: 'period', headerName: '업체명', width: 120 },
  { field: 'businessNumber', headerName: '사업자번호', width: 120 },
  { field: 'ceoName', headerName: '대표자', width: 100 },
  { field: 'accountNumber', headerName: '청구계좌', width: 100 },
  { field: 'accountHolder', headerName: '예금주명', width: 100 },
  { field: 'supplyPrice', headerName: '공급가', width: 100 },
  { field: 'vat', headerName: '부가세', width: 100 },
  { field: 'total', headerName: '합계', width: 100 },
  { field: 'hasFile', headerName: '첨부파일', width: 100 },
  { field: 'memo', headerName: '비고', width: 100 },
]

export const SteelColumnList: GridColDef[] = [
  { field: 'no', headerName: 'No', width: 70 },
  // { field: 'id', headerName: 'No', width: 70 },
  { field: 'site', headerName: '현장명', width: 130 },
  { field: 'process', headerName: '공정명', width: 130 },
  { field: 'type', headerName: '구분', width: 180 },
  { field: 'orderDate', headerName: '발주일', width: 100 },
  { field: 'approvalDate', headerName: '승인일', width: 120 },
  { field: 'releaseDate', headerName: '반출일', width: 120 },
  { field: 'startDate', headerName: '기간', width: 100 },
  { field: 'outsourcingCompanyName', headerName: '업체명', width: 100 },
  { field: 'outsourcingCompanyBusinessNumber', headerName: '사업자등록번호', width: 100 },
  { field: 'totalAmount', headerName: '총금액', width: 100 },
  { field: 'memo', headerName: '비고', width: 100 },
]

export const MaterialColumnList: GridColDef[] = [
  { field: 'no', headerName: 'No', width: 70 },
  // { field: 'backendId', headerName: 'No', width: 70 },
  { field: 'site', headerName: '현장명', width: 130 },
  { field: 'process', headerName: '공정명', width: 130 },
  { field: 'inputType', headerName: '투입구분', width: 180 },
  { field: 'deliveryDate', headerName: '납품일자', width: 100 },
  { field: 'outsourcingCompanyName', headerName: '자재업체명', width: 120 },
  { field: 'name', headerName: '품명', width: 120 },
  { field: 'standard', headerName: '규격', width: 100 },
  { field: 'usage', headerName: '사용용도', width: 100 },
  { field: 'quantity', headerName: '수량', width: 100 },
  { field: 'unitPrice', headerName: '단가', width: 100 },
  { field: 'supplyPrice', headerName: '공급가', width: 100 },
  { field: 'vat', headerName: '부가세', width: 100 },
  { field: 'total', headerName: '합계', width: 100 },
  { field: 'hasFile', headerName: '첨부파일', width: 100 },
  { field: 'memo', headerName: '비고', width: 100 },
]

export const FuelColumnList: GridColDef[] = [
  { field: 'no', headerName: 'No', width: 70 },
  // { field: 'backendId', headerName: 'No', width: 70 },
  { field: 'outsourcingCompany', headerName: '업체명', width: 130 },
  { field: 'driverName', headerName: '기사명', width: 130 },
  { field: 'vehicleNumber', headerName: '차량번호', width: 180 },
  { field: 'specification', headerName: '규격', width: 100 },
  { field: 'fuelType', headerName: '유중', width: 120 },
  { field: 'fuelAmount', headerName: '주유량', width: 120 },
  { field: 'createdAt', headerName: '등록/수정일', width: 100 },
  { field: 'memo', headerName: '비고', width: 100 },
]

export const UserDataList: GridColDef[] = [
  { field: 'id', headerName: 'No', width: 70 },
  { field: 'loginId', headerName: '사용자 ID', width: 130 },
  { field: 'username', headerName: '사용자 이름', width: 130 },
  { field: 'department', headerName: '부서', width: 180 },
  { field: 'grade', headerName: '직급', width: 180 },
  { field: 'position', headerName: '직책', width: 180 },
  { field: 'phoneNumber', headerName: '휴대폰', width: 180 },
  { field: 'isActive', headerName: '계정상태', width: 100 },
  { field: 'lastLoginAt', headerName: '최종접속일', width: 120 },
  { field: 'createdAt', headerName: '생성일자', width: 100 },
  { field: 'updatedAt', headerName: '최종수정일', width: 100 },
  { field: 'updatedBy', headerName: '수정자', width: 100 },
  { field: 'memo', headerName: '비고', width: 100 },
]

export const PermissionDataList: GridColDef[] = [
  { field: 'no', headerName: 'No', width: 70 },
  // { field: 'id', headerName: 'No', width: 70 },
  { field: 'name', headerName: '그룹명', width: 130 },
  { field: 'sites', headerName: '현장/공정', width: 130 },
  { field: 'createdAt', headerName: '등록일/수정일', width: 180 },
  { field: 'memo', headerName: '비고', width: 180 },
]

export const clientCompanyList: GridColDef[] = [
  { field: 'no', headerName: 'No', width: 70 },
  // { field: 'id', headerName: 'No', width: 70 },
  { field: 'businessNumber', headerName: '사업자등록번호', width: 130 },
  { field: 'name', headerName: '발주처명', width: 130 },
  { field: 'ceoName', headerName: '대표자명', width: 130 },
  { field: 'address', headerName: '본사 주소', width: 180 },
  { field: 'landlineNumber', headerName: '전화번호', width: 100 },
  { field: 'contactName', headerName: '담당자명', width: 100 },
  { field: 'contactPositionAndDepartment', headerName: '부서/직급', width: 120 },
  { field: 'contactInfo', headerName: '담당자 연락처/이메일', width: 100 },
  { field: 'headquarter', headerName: '본사담당자명', width: 100 },
  { field: 'isActive', headerName: '사용여부', width: 100 },
  { field: 'createdAt', headerName: '등록일/수정일', width: 100 },
  { field: 'hasFile', headerName: '첨부파일 유부', width: 100 },
  { field: 'memo', headerName: '비고', width: 100 },
]

export const LaborColumnList: GridColDef[] = [
  { field: 'no', headerName: 'No', width: 70 },
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
  { field: 'hireDate', headerName: '입사일', width: 100 },
  { field: 'resignationDate', headerName: '퇴사일', width: 100 },
  // { field: 'hasFile', headerName: '근속일수', width: 100 },
  // { field: 'hasFile', headerName: '퇴직금 발생', width: 100 },
  { field: 'hasFile', headerName: '첨부파일', width: 100 },
]

export const outsourcingCompanyList: GridColDef[] = [
  { field: 'no', headerName: 'No', width: 70 },
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
  { field: 'Deductible', headerName: '공제항목 기본값', width: 100 },
  { field: 'hasFile', headerName: '첨부파일 유부', width: 100 },
  { field: 'isActive', headerName: '사용여부', width: 100 },
  { field: 'createdAt', headerName: '등록일/수정일', width: 100 },
  { field: 'memo', headerName: '비고', width: 100 },
]

export const outsourcingContractListData: GridColDef[] = [
  { field: 'no', headerName: 'No', width: 70 },
  // { field: 'id', headerName: 'No', width: 70 },
  { field: 'siteName', headerName: '현장명', width: 130 },
  { field: 'processName', headerName: '공정명', width: 130 },
  { field: 'companyName', headerName: '외주업체명', width: 130 },
  { field: 'businessNumber', headerName: '사업자등록번호', width: 130 },
  { field: 'type', headerName: '구분', width: 130 },
  { field: 'contractStartDate', headerName: '계약기간(시작/종료)', width: 130 },
  { field: 'contractAmount', headerName: '계약금액(총액)', width: 180 },
  { field: 'defaultDeductions', headerName: '공제항목', width: 100 },
  { field: 'hasFile', headerName: '첨부파일', width: 100 },
  { field: 'taxInvoiceCondition', headerName: '세금계산서발행조건', width: 120 },
  { field: 'contactName', headerName: '담당자', width: 100 },
  { field: 'createdAt', headerName: '작성일자', width: 100 },
  { field: 'contractStatus', headerName: '상태', width: 100 },
  { field: 'memo', headerName: '비고', width: 100 },
]

export const AreaCode = [
  { id: '지역번호', name: '지역번호' },
  { id: '02', name: '02' },
  { id: '032', name: '032' },
  { id: '031', name: '031' },
  { id: '강원', name: '033' },
  { id: '충북', name: '043' },
  { id: '충남', name: '041' },
  { id: '세종', name: '044' },
  { id: '대전', name: '042' },
  { id: '전북', name: '063' },
  { id: '전남', name: '061' },
  { id: '광주', name: '062' },
  { id: '경북', name: '054' },
  { id: '대구', name: '053' },
  { id: '경남', name: '055' },
  { id: '부산', name: '051' },
  { id: '울산', name: '052' },
  { id: '제주', name: '064' },
]

export const PayInfo = [
  { id: '선택', name: '선택' },
  { id: '어음', name: '어음' },
  { id: '현금', name: '현금' },
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
  { label: '발주', name: 'ORDER' },
  { label: '임대', name: 'PURCHASE' },
  { label: '구매', name: 'LEASE' },
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
  { id: '선택', name: '선택' },
  { id: '기업은행', name: '기업은행' },
  { id: '농협은행', name: '농협은행' },
  { id: '우리은행', name: '우리은행' },
  { id: '카카오뱅크', name: '카카오뱅크' },
  { id: '국민은행', name: '국민은행' },
  { id: '신한은행', name: '신한은행' },
]

// 시 와  구 를 구분

export const CityOptions = [
  { id: '0', name: '선택' },
  { id: 'Seoul', name: '서울시' },
  { id: 'Busan', name: '부산시' },
  { id: 'Daegu', name: '대구시' },
  { id: 'Incheon', name: '인천시' },
  { id: 'Gwangju', name: '광주시' },
  { id: 'Daejeon', name: '대전시' },
  { id: 'Ulsan', name: '울산시' },
  { id: 'Sejong', name: '세종시' },
  { id: 'Jeju', name: '제주시' },
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
