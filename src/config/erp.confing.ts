import { GridColDef } from '@mui/x-data-grid'

export const SiteOptions = [
  { label: '선택', name: '선택' },
  { label: '건축', name: 'CONSTRUCTION' },
  { label: '토목', name: 'CIVIL_ENGINEERING' },
  { label: '외주', name: 'OUTSOURCING' },
]

export const SiteProgressing = [
  { id: 0, label: '선택', name: '선택' },
  { id: 1, label: '준비중', name: 'NOT_STARTED' },
  { id: 2, label: '진행중', name: 'IN_PROGRESS' },
  { id: 3, label: '완료', name: 'COMPLETED' },
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
  { id: '날짜순', name: '날짜순' },
  // { label: '이름순', name: '이름순' },
]

export const PageCount = [
  { id: '10', name: '10' },
  { id: '20', name: '20' },
  { id: '30', name: '30' },
  { id: '50', name: '50' },
]

export const SiteColumnList: GridColDef[] = [
  { field: 'id', headerName: 'No', width: 70 },
  { field: 'name', headerName: '현장명', width: 130 },
  // { field: 'username', headerName: '공정명', width: 130 },
  { field: 'address', headerName: '위치', width: 130 },
  { field: 'type', headerName: '현장유형', width: 180 },
  { field: 'clientCompanyName', headerName: '발주처명', width: 100 },
  // { field: 'createdAt', headerName: '현장소장', width: 100 },
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
  { field: 'id', headerName: 'No', width: 70 },
  { field: 'site', headerName: '현장명', width: 130 },
  { field: 'process', headerName: '공정명', width: 130 },
  { field: 'standard', headerName: '규격', width: 180 },
  { field: 'name', headerName: '품목', width: 100 },
  { field: 'unit', headerName: '단위', width: 120 },
  { field: 'count', headerName: '본', width: 120 },
  { field: 'length', headerName: '길이', width: 100 },
  { field: 'totalLength', headerName: '총 길이', width: 100 },
  { field: 'unitWeight', headerName: '단위중량', width: 100 },
  { field: 'quantity', headerName: '수량', width: 100 },
  { field: 'unitPrice', headerName: '단가', width: 100 },
  { field: 'supplyPrice', headerName: '공급가', width: 100 },
  // { field: 'supplyPrice', headerName: '거래선', width: 100 },
  { field: 'usage', headerName: '용도', width: 100 },
  { field: 'hasFile', headerName: '첨부', width: 100 },
  { field: 'type', headerName: '구분', width: 100 },
  { field: 'memo', headerName: '비고', width: 100 },
]

export const MaterialColumnList: GridColDef[] = [
  { field: 'id', headerName: 'No', width: 70 },
  { field: 'site', headerName: '현장명', width: 130 },
  { field: 'process', headerName: '공정명', width: 130 },
  { field: 'inputType', headerName: '투입구분', width: 180 },
  { field: 'deliveryDate', headerName: '납품일자', width: 100 },
  // { field: 'unit', headerName: '자재업체명', width: 120 },
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

export const clientCompanyList: GridColDef[] = [
  { field: 'id', headerName: 'No', width: 70 },
  { field: 'businessNumber', headerName: '사업자등록번호', width: 130 },
  { field: 'name', headerName: '발주처', width: 130 },
  { field: 'ceoName', headerName: '대표자명', width: 130 },
  { field: 'address', headerName: '본사 주소', width: 180 },
  { field: 'landlineNumber', headerName: '전화번호', width: 100 },
  { field: 'contactName', headerName: '담당자명', width: 100 },
  // { field: 'lastLoginAt', headerName: '부서/직급', width: 120 },
  { field: 'contactInfo', headerName: '담당자 연락처/이메일', width: 100 },
  { field: 'headquarter', headerName: '본사담당자명', width: 100 },
  { field: 'isActive', headerName: '사용여부', width: 100 },
  { field: 'createdAt', headerName: '등록일/수정일', width: 100 },
  { field: 'hasFile', headerName: '첨부파일 유부', width: 100 },
  { field: 'memo', headerName: '비고', width: 100 },
]

export const AreaCode = [
  { label: '지역번호', name: '지역번호' },
  { label: '서울', name: '02' },
  { label: '인천', name: '032' },
  { label: '경기', name: '031' },
  { label: '강원', name: '033' },
  { label: '충북', name: '043' },
  { label: '충남', name: '041' },
  { label: '세종', name: '044' },
  { label: '대전', name: '042' },
  { label: '전북', name: '063' },
  { label: '전남', name: '061' },
  { label: '광주', name: '062' },
  { label: '경북', name: '054' },
  { label: '대구', name: '053' },
  { label: '경남', name: '055' },
  { label: '부산', name: '051' },
  { label: '울산', name: '052' },
  { label: '제주', name: '064' },
]

export const PayInfo = [
  { label: '선택', name: '선택' },
  { label: '어음', name: '어음' },
  { label: '현금', name: '현금' },
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
  { label: '선택', name: '선택' },
  { label: '기업은행', name: '기업은행' },
  { label: '농협은행', name: '농협은행' },
  { label: '우리은행', name: '우리은행' },
  { label: '카카오뱅크', name: '카카오뱅크' },
  { label: '국민은행', name: '국민은행' },
  { label: '신한은행', name: '신한은행' },
]
