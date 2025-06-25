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

export const ProcessStatusOptions = [
  { label: '전체', value: '전체' },
  { label: '미정', value: '미정' },
  { label: '진행중', value: '진행중' },
  { label: '완료', value: '완료' },
]

export const ArrayStatusOptions = [
  { label: '최근순', value: '최근순' },
  { label: '날짜순', value: '날짜순' },
  { label: '이름순', value: '이름순' },
]

export const BusinessDataList = [
  { field: 'id', headerName: 'No', width: 70 },
  { field: 'siteCode', headerName: '현장코드', width: 130 },
  { field: 'location', headerName: '위치', width: 130 },
  { field: 'siteType', headerName: '사업장유형', width: 130 },
  { field: 'period', headerName: '기간', width: 180 },
  { field: 'status', headerName: '상태', width: 100 },
  { field: 'registrar', headerName: '등록자', width: 100 },
  { field: 'registeredDate', headerName: '등록일', width: 120 },
  { field: 'modifiedDate', headerName: '수정일', width: 120 },
  { field: 'attachments', headerName: '첨부파일', width: 100 },
  { field: 'remark', headerName: '비고', width: 100 },
]
