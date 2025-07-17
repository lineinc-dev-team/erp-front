import { GridColDef } from '@mui/x-data-grid'

export const statusOptions = [
  { label: '전체', value: '전체' },
  { label: '토목', value: '토목' },
  { label: '도로사업장', value: '도로사업장' },
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
  { label: '이름순', value: '이름순' },
]

export const PageCount = [
  { label: '10', value: '10' },
  { label: '30', value: '30' },
  { label: '50', value: '50' },
]

export const BusinessDataList: GridColDef[] = [
  { field: 'id', headerName: 'No', width: 70 },
  { field: 'loginId', headerName: '현장코드', width: 130 },
  { field: 'username', headerName: '위치', width: 130 },
  { field: 'phoneNumber', headerName: '사업장유형', width: 130 },
  { field: 'email', headerName: '기간', width: 180 },
  { field: 'isActive', headerName: '상태', width: 100 },
  { field: 'createdAt', headerName: '등록자', width: 100 },
  { field: 'updatedAt', headerName: '등록일', width: 120 },
  { field: 'modifiedDate', headerName: '수정일', width: 120 },
  { field: 'attachments', headerName: '첨부파일', width: 100 },
  { field: 'remark', headerName: '계약이력', width: 100 },
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
