import { GridColDef } from '@mui/x-data-grid'

export const SiteOptions = [
  { label: '선택', value: '선택' },
  { label: '건축', value: 'CONSTRUCTION' },
  { label: '토목', value: 'CIVIL_ENGINEERING' },
  { label: '외주', value: 'OUTSOURCING' },
]

export const SiteProgressing = [
  { id: 0, label: '선택', value: '선택' },
  { id: 1, label: '준비중', value: 'NOT_STARTED' },
  { id: 2, label: '진행중', value: 'IN_PROGRESS' },
  { id: 3, label: '완료', value: 'COMPLETED' },
]

export const LocationStatusOptions = [
  { label: '전체', value: '전체' },
  { label: '서울', value: '서울' },
  { label: '부산', value: '부산' },
  { label: '고양', value: '고양' },
]

export const UseORnotOptions = [
  { label: '선택', value: '선택' },
  { label: '사용', value: '사용' },
  { label: '미사용', value: '미사용' },
]

export const SubmitOptions = [
  { label: '전체', value: '전체' },
  { label: '제출', value: '제출' },
  { label: '미제출', value: '미제출' },
]

export const ProcessStatusOptions = [
  { label: '전체', value: '전체' },
  { label: '미정', value: '미정' },
  { label: '진행 중', value: '진행중' },
  { label: '완료', value: '완료' },
]

export const ArrayStatusOptions = [
  { label: '최신순', value: '최신순' },
  { label: '날짜순', value: '날짜순' },
  // { label: '이름순', value: '이름순' },
]

export const PageCount = [
  { label: '10', value: '10' },
  { label: '20', value: '20' },
  { label: '30', value: '30' },
  { label: '50', value: '50' },
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

export const UserDataList: GridColDef[] = [
  { field: 'id', headerName: 'No', width: 70 },
  { field: 'loginId', headerName: '사용자 ID', width: 130 },
  { field: 'username', headerName: '사용자 이름', width: 130 },
  { field: 'phoneNumber', headerName: '소속 (부서/현장)', width: 130 },
  { field: 'email', headerName: '직책', width: 180 },
  { field: 'isActive', headerName: '계정상태', width: 100 },
  { field: 'createdAt', headerName: '생성일자', width: 100 },
  { field: 'lastLoginAt', headerName: '최종접속일', width: 120 },
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
  { label: '지역번호', value: '지역번호' },
  { label: '서울', value: '02' },
  { label: '인천', value: '032' },
  { label: '경기', value: '031' },
  { label: '강원', value: '033' },
  { label: '충북', value: '043' },
  { label: '충남', value: '041' },
  { label: '세종', value: '044' },
  { label: '대전', value: '042' },
  { label: '전북', value: '063' },
  { label: '전남', value: '061' },
  { label: '광주', value: '062' },
  { label: '경북', value: '054' },
  { label: '대구', value: '053' },
  { label: '경남', value: '055' },
  { label: '부산', value: '051' },
  { label: '울산', value: '052' },
  { label: '제주', value: '064' },
]

export const PayInfo = [
  { label: '선택', value: '선택' },
  { label: '어음', value: '어음' },
  { label: '현금', value: '현금' },
]

export const GuaranteeInfo = [
  { label: '선택', value: '선택' },
  { label: 'O', value: 'O' },
  { label: 'X', value: 'X' },
]

// 관리비 옵션 타입
export const itemTypeOptions = [
  { label: '선택', value: '선택' },
  { label: '보증금', value: 'DEPOSIT' },
  { label: '월세', value: 'MONTHLY_RENT' },
  { label: '관리비(가스전기수도)', value: 'MAINTENANCE' },
  { label: '주차비', value: 'PARKING_FEE' },
  { label: '식대', value: 'MEAL_FEE' },
  { label: '전도금', value: 'KEY_MONEY' },
  { label: '기타잡비', value: 'MISC_EXPENSE' },
]

// 강재관리 옵션 타입
export const steelTypeOptions = [
  { label: '선택', value: '선택' },
  { label: '발주', value: 'ORDER' },
  { label: '임대', value: 'PURCHASE' },
  { label: '구매', value: 'LEASE' },
]
// 은행 옵셥

export const bankOptions = [
  { label: '선택', value: '선택' },
  { label: '기업은행', value: '기업은행' },
  { label: '농협은행', value: '농협은행' },
  { label: '우리은행', value: '우리은행' },
  { label: '카카오뱅크', value: '카카오뱅크' },
  { label: '국민은행', value: '국민은행' },
  { label: '신한은행', value: '신한은행' },
]
