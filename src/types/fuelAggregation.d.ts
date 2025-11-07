import { HistoryItem } from './ordering'

export interface Site {
  id: number
  name: string
}

export interface Process {
  id: number
  name: string
}

export interface OutsourcingData {
  id: number
  name: string
  businessNumber: string // 백엔드 예제에서는 문자열로 되어 있음
}

export interface driverInfoData {
  id: number
  name: string
}

export interface equipmentInfoData {
  id: number
  specification: string
  vehicleNumber: string
}

export interface FuelListInfoData {
  id: number
  driver: driverInfoData
  equipment: equipmentInfoData
  categoryType?: string
  categoryTypeCode?: string
  fileUrl: string
  originalFileName: string
  vehicleNumber: string
  specification: string
  fuelType: string
  fuelTypeCode: string
  fuelAmount: number
  amount: number
  createdAt: string
  updatedAt: string
  memo: string
  outsourcingCompany: OutsourcingData
}

export interface FuelDataList {
  id: number
  date: string // Date로 변환할 수도 있지만, 백엔드가 ISO 문자열을 보내므로 string 유지
  date: string
  createdAt: string
  updatedAt: string
  site: Site
  process: Process
  fuelInfo: FuelListInfoData
}
export type fuelStatuses = 'DIESEL' | 'GASOLINE' | 'UREA' | 'ETC' | '선택'

// 검색타입
export type FuelSearchState = {
  searchTrigger: number
  siteName: string
  siteId: number
  processName: string
  outsourcingCompanyName: string
  outsourcingCompanyId: number
  fuelTypes: fuelStatuses[]
  vehicleNumber: string
  dateStartDate: Date | null
  dateEndDate: Date | null
  arraySort: string
  currentPage: number
  pageCount: string

  reset: () => void

  setField: <K extends keyof Omit<FuelSearchState, 'reset' | 'setField'>>(
    field: K,
    value: FuelSearchState[K],
  ) => void

  handleSearch: () => void
}

export type SubEquipmentByFuleItems = {
  checkId: number
  id: number | null
  outsourcingCompanyContractSubEquipmentId: number
  fuelType: string
  fuelAmount: number
  amount: number
  memo: string
}

// 등록 타입
export type fuelDetailItem = {
  checkId: number
  id: number | null
  outsourcingCompanyId: number
  outsourcingCompanyName?: string
  driverId: number
  driverName?: string
  categoryType: string
  equipmentId: number
  equipmentName?: string
  specificationName: string
  fuelType: string
  fuelAmount: number
  amount: number
  memo: string
  subEquipments?: SubEquipmentByFuleItems[]
  fileUrl?: string
  originalFileName?: string
  files: FileUploadInfo[]
  modifyDate?: string
}

export type FuelInfo = {
  siteId: number
  siteName: string
  siteProcessId: number
  siteProcessName: string
  date: Date | null
  initialDateAt: string
  weather: string
  outsourcingCompanyId: number
  outsourcingCompanyName: string

  gasolinePrice: number
  dieselPrice: number
  ureaPrice: number

  fuelInfos: fuelDetailItem[]
  checkedFuelItemIds: number[]

  editedHistories?: Pick<HistoryItem, 'id' | 'memo'>[]
  changeHistories: HistoryItem[] // 수정 이력 포함
}

type FuelFormStore = {
  form: FuelInfo

  reset: () => void

  setFuelRadioBtn: (id: number, categoryType: 'EQUIPMENT' | 'CONSTRUCTION') => void

  // methods
  setField: <K extends keyof Omit<FuelInfo, 'reset' | 'setField'>>(
    field: K,
    value: FuelInfo[K],
  ) => void

  updateContractDetailField: (
    managerId: number,
    itemId: number,
    field: keyof SubEquipmentByFuleItems,
    value: T,
  ) => void

  addItem: (type: 'FuelInfo') => void
  updateItemField: (type: 'FuelInfo', id: T, field: T, value: T) => void

  toggleCheckItem: (type: 'FuelInfo', id: number, checked: boolean) => void
  toggleCheckAllItems: (type: 'FuelInfo', checked: boolean) => void
  removeCheckedItems: (type: 'FuelInfo') => void

  updateMemo: (id: number, newMemo: string) => void

  newFuelData: () => void

  calculateFuelAmount: () => void

  getGasUseTotal: () => number
  getAmountTotal: () => number
}
