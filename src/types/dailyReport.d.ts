export type DailyAttachedFile = {
  id: number
  description: string
  memo: string
  fileUrl?: string
  originalFileName?: string
  files: FileUploadInfo[]
}

// 발주처 조회 리스트 가져오는 타입들

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

export interface User {
  id: number
  username: string
}

// 발주처 조회
export interface ClientCompany {
  id: number
  name: string // 발주처 이름
  businessNumber: string
  ceoName: string
  address: string
  detailAddress: string
  landlineNumber: string
  phoneNumber: string
  email: string
  memo: string
  isActive: boolean
  hasFile: boolean
  contacts: Contact[]
  createdAt: string // ISO 날짜 문자열
  updatedAt: string
  user: User
}

export type OrderingSearchState = {
  searchTrigger: number
  name: string
  businessNumber: string
  ceoName: string
  currentPage: number
  contactName: string
  landlineNumber: string
  userName: string
  email: string
  startDate: Date | null
  endDate: Date | null
  isActive: string
  arraySort: string
  pageCount: string

  reset: () => void

  setField: <K extends keyof Omit<OrderingSearchState, 'reset' | 'setField'>>(
    field: K,
    value: OrderingSearchState[K],
  ) => void

  handleSearch: () => void
  handleOrderingListRemove: () => void
}

//등록에서 사용 할 직원 데이터 조회

export type EmployeesItem = {
  id: number
  laborId?: number
  name?: string
  type?: string
  workContent: string
  workQuantity: number
  memo: string
  fileUrl?: string
  originalFileName?: string
  files: FileUploadInfo[]
  modifyDate?: string
}

export type directContractsItem = {
  id: T
  checkId: number
  outsourcingCompanyId: T
  laborId: T
  position: string
  workContent: string
  previousPrice: number
  unitPrice: number
  workQuantity: number
  memo: string
  fileUrl?: string
  originalFileName?: string
  files: FileUploadInfo[]
  isTemporary: boolean
  temporaryLaborName: string
  modifyDate?: string
}

export type OutsourcingsItem = {
  id: number
  outsourcingCompanyId: number
  outsourcingCompanyContractWorkerId: number
  category?: string
  workContent: string
  workQuantity: number
  memo: string
  modifyDate?: string
}

export type EquipmentsItem = {
  id: number
  outsourcingCompanyId: number
  outsourcingCompanyContractDriverId: number
  outsourcingCompanyContractEquipmentId: number
  specificationName?: string
  type?: string
  workContent: string
  unitPrice: number
  workHours: number
  memo: string
  modifyDate?: string
}

export type FuelsItem = {
  id: number
  outsourcingCompanyId: number
  driverId: number
  equipmentId: number
  specificationName?: string
  fuelType: string
  fuelAmount: number
  memo: string
  modifyDate?: string
}

export type DailyFormState = {
  siteId: number // 발행부서
  siteProcessId: number // 공정명

  reportDate: Date | null // 일자 (YYYY-MM-DD)
  weather: string

  // 직원 배열
  employees: EmployeesItem[]
  // 선택된 체크박스 id
  checkedManagerIds: number[]

  directContracts: directContractsItem[]
  checkeddirectContractsIds: number[]

  outsourcings: OutsourcingsItem[]
  checkedOutsourcingIds: number[]

  outsourcingEquipments: EquipmentsItem[]
  checkedEquipmentIds: number[]

  fuelInfos: FuelsItem[]
  checkedFuelsIds: number[]

  // 파일첨부, 수정이력
  files: AttachedFile[]
  checkedAttachedFileIds: number[]
}

type DailyReportFormStore = {
  form: DailyFormState

  reset: () => void
  resetEmployees: () => void
  resetDirectContracts: () => void
  resetOutsourcing: () => void
  resetEquipment: () => void
  resetFuel: () => void
  resetFile: () => void

  setField: <K extends keyof Omit<DailyFormState, 'reset' | 'setField'>>(
    field: K,
    value: DailyFormState[K],
  ) => void

  addItem: (
    type:
      | 'Employees'
      | 'directContracts'
      | 'outsourcings'
      | 'equipment'
      | 'fuel'
      | 'ContractWorker'
      | 'attachedFile',
  ) => void

  addTemporaryCheckedItems: (type: 'directContracts') => void

  updateItemField: (
    type: 'Employees' | 'directContracts' | 'outsourcings' | 'equipment' | 'fuel' | 'attachedFile',
    id: number,
    field: string,
    value: T,
  ) => void
  toggleCheckItem: (
    type: 'Employees' | 'directContracts' | 'outsourcings' | 'equipment' | 'fuel' | 'attachedFile',
    id: number,
    checked: boolean,
  ) => void
  toggleCheckAllItems: (
    type: 'Employees' | 'directContracts' | 'outsourcings' | 'equipment' | 'fuel' | 'attachedFile',
    checked: boolean,
  ) => void
  removeCheckedItems: (
    type: 'Employees' | 'directContracts' | 'equipment' | 'outsourcings' | 'fuel' | 'attachedFile',
  ) => void

  //payload 값
  newDailyReportData: () => void
  modifyEmployees: () => void
  modifyDirectContracts: () => void
  modifyOutsourcing: () => void
  modifyEquipment: () => void
  modifyFuel: () => void
  modifyFile: () => void
  modifyWeather: () => void
}
