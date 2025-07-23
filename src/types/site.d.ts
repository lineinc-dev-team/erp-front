type SiteProcess = {
  id?: number
  name: string
  officePhone: string
  status: '선택' | 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED'
  memo: string
}

export type ContractFileType = 'CONTRACT' | 'DRAWING' | 'WARRANTY' | 'PERMIT' | 'ETC'

export type ContractFile = {
  id?: number
  name: string
  fileUrl: string
  originalFileName: string
  memo: string
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
  userId: number
  contractAmount: number
  memo: string
  process: SiteProcess
  contracts: Contract[]
}

// 현장 조회에 사용되는 검색 타입
export type ProcessStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | '선택'

export type SiteSearchState = {
  searchTrigger: number // 검색 실행 시마다 증가시켜 query 갱신 트리거
  name: string // 현장명
  type: 'CONSTRUCTION' | 'CIVIL_ENGINEERING' | 'OUTSOURCING' | '선택' // 현장 유형 (빈 문자열은 선택 안 함)
  processName: string // 공정명
  city: string // 시
  district: string // 구
  ProcessStatus: ProcessStatus[] // 공정 상태 (다중 선택)
  clientCompanyName: string // 발주처
  createdBy: string // 등록자 이름
  startDate: Date | null // 사업 시작일
  endDate: Date | null // 사업 종료일
  createdStartDate: Date | null // 등록일 시작
  createdEndDate: Date | null // 등록일 종료
  arraySort: string // 정렬 필드 (예: 'id.asc' 또는 'name.desc')
  currentPage: number // 현재 페이지
  pageCount: string // 페이지당 항목 수 (예: '10', '30', etc)

  reset: () => void // 초기화 함수
  setField: <
    K extends keyof Omit<
      SiteSearchState,
      'reset' | 'setField' | 'handleSearch' | 'handleOrderingListRemove'
    >,
  >(
    field: K,
    value: SiteSearchState[K],
  ) => void
  handleSearch: () => void // 검색 실행
  handleOrderingListRemove: () => void // 선택된 항목 제거 등
}

// 조회에 사용되는 타입

export interface SiteListProps {
  id: number
  name: string
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
  clientCompany: {
    id: number
    name: string
  }
}
