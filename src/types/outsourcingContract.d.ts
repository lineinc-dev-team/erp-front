export type OutsourcingContractManager = {
  id: number
  name: string
  position: string
  department: string
  managerAreaNumber: string
  landlineNumber: string
  phoneNumber: string
  email: string
  memo: string
  isMain?: boolean //대표 담당자
}

export type OutsourcingContractAttachedFile = {
  id: number
  name: string
  memo: string
  fileUrl?: string | null
  originalFileName?: string | null
  files?: FileUploadInfo[]
}

//외주공사 항목 타입
export type OutsourcingContractItem = {
  id: number
  no?: number
  item: string
  specification: string
  unit: string
  unitPrice: number
  contractQuantity: string | number
  contractPrice: string | number
  outsourcingContractQuantity: string | number
  outsourcingContractPrice: string | number
  memo: string
}

// 장비 중 기사 타입
export type OutsourcingArticleInfoAttachedFile = {
  id: number
  name: string
  memo: string
  fileUrl?: string
  originalFileName?: string
  driverLicense: FileUploadInfo[]
  safeEducation: FileUploadInfo[]
  ETCfiles: FileUploadInfo[]
  files?: FileUploadInfo[]
}

// 장비 타입

type subEquipmentInfo = {
  id: number
  typeCode: string
  memo: string
}
export type OutsourcingEquipmentInfoAttachedFile = {
  id: number
  specification: string
  vehicleNumber: string
  category: string
  unitPrice: number
  subtotal: number
  taskDescription: string
  memo: string
  subEquipments?: subEquipmentInfo[]
}

export type OutsourcingContractPersonAttachedFile = {
  id: number
  name: string
  category: string
  taskDescription: string
  memo: string
  fileUrl?: string
  originalFileName?: string
  files: FileUploadInfo[]
}

// 외주계약 조회에서 가져오는 담당자 타입
export interface Contact {
  id: number
  name: string
  phoneNumber: string
  landlineNumber: string
  email: string
  memo?: string
  position: string
  department: string
  isMain?: boolean
}

// 외주계약 조회
export interface OutsourcingContractList {
  id: number
  siteName: string
  processName: string
  companyName: string
  businessNumber: string
  contractType: string
  typeDescription: string
  contractStatus: string
  categoryType: string
  contractAmount: 666650
  defaultDeductions: string
  taxInvoiceCondition: string
  taxInvoiceIssueDayOfMonth: 30
  memo: string
  contractStartDate: string
  contractEndDate: string
  createdAt: string
  updatedAt: string
  hasFile: false
  contacts: Contact[]
}

export type OutsourcingContractSearchState = {
  searchTrigger: number
  siteId: number
  siteName: string
  processId: number
  processName: string
  companyName: string
  businessNumber: string
  contractType: string
  contractStatus: string
  contractStartDate: Date | null
  contractEndDate: Date | null
  contactName: string
  currentPage: number
  arraySort: string
  pageCount: string

  reset: () => void

  setField: <K extends keyof Omit<OutsourcingContractSearchState, 'reset' | 'setField'>>(
    field: K,
    value: OutsourcingContractSearchState[K],
  ) => void

  handleSearch: () => void
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

export type CompanyInfo = {
  id: number
  name: string
  businessNumber: string
}

export type OutsourcingContractFormState = {
  // 기존 필드들
  siteId: number
  siteName: string
  processId: number
  processName: string
  CompanyId: number
  CompanyName: string
  businessNumber: string
  type: string
  typeDescription: string
  contractAmount: number
  contractStartDate: Date | null
  contractEndDate: Date | null
  defaultDeductions: string
  defaultDeductionsDescription: string
  taxCalculat: string
  taxInvoiceIssueDayOfMonth: number
  memo: string
  category: string
  status: string

  // 담당자 배열
  headManagers: OutsourcingContractManager[]

  // 선택된 체크박스 id
  checkedManagerIds: number[]

  // 파일첨부, 수정이력
  attachedFiles: OutsourcingContractAttachedFile[]
  checkedAttachedFileIds: number[]

  // 인력 배열
  personManagers: OutsourcingContractPersonAttachedFile[]

  // 선택된 체크박스 id
  checkedPersonIds: number[]

  // 공사 관련
  contractManagers: OutsourcingContractItem[]

  // 선택된 체크박스 id
  checkedContractIds: number[]

  // 장비 관련 타입 정의 (기사)

  equipmentManagers: OutsourcingEquipmentInfoAttachedFile[]
  checkedEquipmentIds: number[]

  // 기사
  articleManagers: OutsourcingArticleInfoAttachedFile[]
  // 선택된 체크박스 id
  checkedArticleIds: number[]

  editedHistories?: Pick<HistoryItem, 'id' | 'memo'>[]
  changeHistories: HistoryItem[] // 수정 이력 포함
}

type OutsourcingContractFormStore = {
  form: OutsourcingContractFormState

  reset: () => void

  // methods
  setField: <K extends keyof Omit<OutsourcingContractFormState, 'reset' | 'setField'>>(
    field: K,
    value: OutsourcingContractFormState[K],
  ) => void

  addItem: (
    type:
      | 'manager'
      | 'attachedFile'
      | 'personAttachedFile'
      | 'workSize'
      | 'articleInfo'
      | 'equipment',
  ) => void
  updateItemField: (
    type:
      | 'manager'
      | 'attachedFile'
      | 'personAttachedFile'
      | 'workSize'
      | 'articleInfo'
      | 'equipment',
    id: number,
    field: string,
    value: T,
  ) => void
  toggleCheckItem: (
    type:
      | 'manager'
      | 'attachedFile'
      | 'personAttachedFile'
      | 'workSize'
      | 'articleInfo'
      | 'equipment',
    id: number,
    checked: boolean,
  ) => void
  toggleCheckAllItems: (
    type:
      | 'manager'
      | 'attachedFile'
      | 'personAttachedFile'
      | 'workSize'
      | 'articleInfo'
      | 'equipment',
    checked: boolean,
  ) => void
  removeCheckedItems: (
    type:
      | 'manager'
      | 'attachedFile'
      | 'personAttachedFile'
      | 'workSize'
      | 'articleInfo'
      | 'equipment',
  ) => void

  // 공사항목에서만 쓰이는 계산
  getTotalOutsourceQty: () => number
  getTotalOutsourceAmount: () => number
  getTotalContractQty: () => number
  getTotalContractAmount: () => number

  updateMemo: (id: number, newMemo: string) => void
  setRepresentativeManager: (id: number) => void
  //외주계약 등록하기

  // 장비에서 구분에 세부 항목추가!!

  addSubEquipment: (equipmentId: number) => void
  removeSubEquipment: (equipmentId: number, subEquipmentIndex: number) => void

  // 여기 추가
  updateSubEquipmentField: (
    equipmentId: number,
    subEquipmentId: number,
    field: keyof subEquipmentInfo,
    value: T,
  ) => void

  //payload 값
  newOutsourcingContractData: () => void
}
