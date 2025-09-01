type SiteProcess = {
  id?: number
  name: string
  managerId: number
  areaNumber: string
  officePhone: string
  status: '선택' | 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED'
  memo: string
}

export type ContractFileType = 'CONTRACT' | 'DRAWING' | 'WARRANTY' | 'PERMIT' | 'ETC'

export type ContractFile = {
  id?: number
  fileUrl: string
  originalFileName: string
  type: ContractFileType
}

export type Contract = {
  id: number
  name: string
  amount: number
  memo: string
  files: ContractFile[]
}

// 상세에서 계약서 가져오기
type ContractState = {
  contracts: Contract[]
  setContracts: (contracts: Contract[]) => void
}

// 수정에 사용 할 타입
type HistoryItem = {
  id: number
  no: number
  getChanges: string
  createdAt: string // or Date
  updatedAt: string
  content: string // 수정항목
  updatedBy: string
  memo: string
  type: string
}
// 등록에 필요한 타입

type SiteForm = {
  name: string
  address: string
  detailAddress: string
  isModalOpen: boolean
  city: string
  district: string
  type: string
  clientCompanyId: number
  startedAt: Date | null
  endedAt: Date | null
  initialStartedAt: string // 'yyyy-MM-dd'
  initialEndedAt: string // 'yyyy-MM-dd'
  userId: number
  contractAmount: number
  memo: string
  process: SiteProcess
  contracts: Contract[]

  editedHistories?: Pick<HistoryItem, 'id' | 'memo'>[]
  changeHistories: HistoryItem[] // 수정 이력 포함
}

// 현장 조회에 사용되는 검색 타입
export type processStatuses = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | '선택'

export type SiteSearchState = {
  searchTrigger: number // 검색 실행 시마다 증가시켜 query 갱신 트리거
  nameId: number
  name: string // 현장명
  type: string
  processId: number
  processName: string // 공정명
  city: string // 시
  district: string // 구
  processStatuses: processStatuses[] // 공정 상태 (다중 선택)
  clientCompanyName: string // 발주처
  createdBy: string // 등록자 이름
  managerName: string
  startDate: Date | null // 사업 시작일
  endDate: Date | null // 사업 종료일
  createdStartDate: Date | null // 등록일 시작
  createdEndDate: Date | null // 등록일 종료
  arraySort: string // 정렬 필드 (예: 'id.asc' 또는 'name.desc')
  currentPage: number // 현재 페이지
  pageCount: string // 페이지당 항목 수 (예: '10', '30', etc)

  reset: () => void // 초기화 함수

  setField: <K extends keyof Omit<SiteSearchState, 'reset' | 'setField' | 'handleSearch'>>(
    field: K,
    value: SiteSearchState[K],
  ) => void
  handleSearch: () => void // 검색 실행
}

// 조회에 사용되는 타입

export interface SiteListProps {
  id: number
  name: string
  processName: string
  address: string
  detailAddress: string
  city: string
  district: string
  type: string
  startedAt: string // ISO Date string
  endedAt: string // ISO Date string
  contractAmount: number
  memo: string
  createdAt: string // ISO Date string
  createdBy: string
  updatedAt: string // ISO Date string
  hasFile: boolean
  process: {
    id: number
    name: string
    officePhone: string
    status: string
    memo: string
  }
  manager: {
    id: number
    username: string
  }
  clientCompany: {
    id: number
    name: string
  }
}
