import { SubEquipmentItems } from './dailyReport.d'
export type DailyAttachedFile = {
  id: number
  description: string
  memo: string
  fileUrl?: string
  originalFileName?: string
  files: FileUploadInfo[]
}

export type DailyProofAttachedFile = {
  id: number
  name: string
  memo: string
  fileUrl?: string | null
  originalFileName?: string | null
  files: FileUploadInfo[]
}

export type DailyDataSearchState = {
  searchTrigger: number
  siteId: number
  siteName: string
  processId: number
  processName: string
  startDate: Date | null
  endDate: Date | null
  isCompleted: T
  isEvidenceSubmitted: T
  arraySort: string
  currentPage: number
  pageCount: string

  reset: () => void

  setField: <K extends keyof Omit<DailyDataSearchState, 'reset' | 'setField' | 'handleSearch'>>(
    field: K,
    value: DailyDataSearchState[K],
  ) => void

  handleSearch: () => void
}

//등록에서 사용 할 직원 데이터 조회

export type EmployeesItem = {
  id: number
  laborId?: number
  laborName?: string
  grade: string
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
  outsourcingCompanyName?: string
  laborId: T
  laborName?: string
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
  actualTemporaryData?: boolean
  temporaryLaborName: string
  modifyDate?: string
}

export type directContractOutsourcingContractsItem = {
  id: T
  outsourcingCompanyId: number
  outsourcingCompanyName?: number
  outsourcingCompanyContractId: number
  outsourcingCompanyContractName?: number
  laborId: number
  laborName?: number
  workQuantity: number
  memo: string
  fileUrl?: string
  originalFileName?: string
  files: FileUploadInfo[]
  modifyDate?: string
}

export type outSourcingByDirectContractItem = {
  id: T
  checkId: number
  outsourcingCompanyId: T
  outsourcingCompanyName?: string
  laborId: T
  laborName?: string
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
  actualTemporaryData?: boolean
  temporaryLaborName: string
  modifyDate?: string
}

// 외주(공사) 타입 설정

export interface OutsourcingConstructionItem {
  id: number
  outsourcingCompanyContractConstructionId: number
  outsourcingCompanyContractConstructionName?: string
  specification?: string
  unit?: string
  quantity: number
  fileUrl?: string
  originalFileName?: string
  files?: FileUploadInfo[]
  memo: string
}

export interface OutsourcingsItem {
  id: number
  outsourcingCompanyId: number
  outsourcingCompanyName?: string
  outsourcingCompanyContractConstructionGroupId: number
  outsourcingCompanyContractConstructionGroupName?: string
  items: OutsourcingConstructionItem[]
}

export type SubEquipmentItems = {
  id: number
  outsourcingCompanyContractSubEquipmentId: T
  outsourcingCompanyContractSubEquipmentName?: string
  description?: T
  type: string
  typeCode?: string
  workContent: string
  unitPrice: number
  workHours: number
  memo: string
}

export type EquipmentsItem = {
  id: number
  outsourcingCompanyId: number
  outsourcingCompanyName?: string
  outsourcingCompanyContractDriverId: number
  outsourcingCompanyContractDriverName?: string
  outsourcingCompanyContractEquipmentId: number
  outsourcingCompanyContractEquipmentName?: string
  specificationName?: string
  type?: string
  workContent: string
  unitPrice: number
  workHours: number
  memo: string
  subEquipments?: SubEquipmentItems[]
  fileUrl?: string
  originalFileName?: string
  files: FileUploadInfo[]
  modifyDate?: string
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

export type FuelsItem = {
  id: number
  outsourcingCompanyId: number
  outsourcingCompanyName?: string
  driverId: number
  categoryType: string
  equipmentId: number
  equipmentName?: string
  specificationName?: string
  fuelType: string
  fuelAmount: number
  amount: number
  fileUrl?: string
  originalFileName?: string
  files: FileUploadInfo[]
  memo: string
  subEquipments?: SubEquipmentByFuleItems[]
  modifyDate?: string
}

type WorkDetailInfo = {
  id: number
  content: string
  personnelAndEquipment: string
}

export type WorkerItem = {
  id: number
  workName: string
  isToday: boolean
  workDetails: WorkDetailInfo[]
}

export type MainProcessesItem = {
  id: number
  process: string
  unit: string
  contractAmount: number
  previousDayAmount: number
  todayAmount: number
  cumulativeAmount: number
  processRate: number
}

export type InputStatusesItem = {
  id: number
  category: string
  previousDayCount: number
  todayCount: number
  cumulativeCount: number
  type: string
}

export type MaterialStatuses = {
  id: number
  materialName: string
  unit: string
  plannedAmount: number
  previousDayAmount: number
  todayAmount: number
  cumulativeAmount: number
  remainingAmount: number
  type: string
}

export type outContractItem = {
  id: number
  outsourcingCompanyId: number
  driverId: number
  equipmentId: number
  specificationName?: string
  fuelType: string
  fuelAmount: number
  fileUrl?: string
  originalFileName?: string
  files: FileUploadInfo[]
  memo: string
  modifyDate?: string
}

export type DailyFormState = {
  siteId: number // 발행부서
  siteName: string
  siteProcessId: number // 공정명
  siteProcessName: string

  reportDate: Date | null // 일자 (YYYY-MM-DD)
  weather: string

  gasolinePrice: number
  dieselPrice: number
  ureaPrice: number

  outsourcingCompanyName: string
  outsourcingCompanyId: number

  // 직원 배열
  employees: EmployeesItem[]
  // 선택된 체크박스 id
  checkedManagerIds: number[]

  directContracts: directContractsItem[]
  checkeddirectContractsIds: number[]

  // 직영/용역에서 용역 데이터 추가
  directContractOutsourcings: outSourcingByDirectContractItem[]
  outSourcingByDirectContractIds: number[]

  // 직영/용역에서 외주 데이터 추가

  directContractOutsourcingContracts: directContractOutsourcingContractsItem[]
  checkedDirectContractOutsourcingIds: number[]

  //외주 데이터
  outsourcingConstructions: OutsourcingsItem[]
  checkedOutsourcingIds: number[]

  outsourcingEquipments: EquipmentsItem[]
  checkedEquipmentIds: number[]

  fuelInfos: FuelsItem[]
  checkedFuelsIds: number[]

  works: WorkerItem[]
  checkedWorkerIds: number[]

  mainProcesses: MainProcessesItem[]
  checkedMainProcessIds: number[]

  inputStatuses: InputStatusesItem[]
  checkedInputStatusIds: number[]

  materialStatuses: MaterialStatuses[]
  checkedMaterialIds: number[]

  outContractInfo: outContractItem[]
  checkedOutContractIds: number[]

  // 파일첨부, 수정이력
  files: AttachedFile[]
  checkedAttachedFileIds: number[]

  // 직원에 증빙서류 타입 추가
  employeeFile: DailyProofAttachedFile[]
  employeeCheckId: number[]

  // 직영 게약직

  // 직영에 증빙서류 타입 추가
  contractProofFile: DailyProofAttachedFile[]
  contractProofCheckId: number[]

  // 직영에 증빙서류 타입 추가
  outsourcingProofFile: DailyProofAttachedFile[]
  outsourcingProofCheckId: number[]

  // 직영에 증빙서류 타입 추가
  equipmentProofFile: DailyProofAttachedFile[]
  equipmentProofCheckId: number[]

  // 직영에 증빙서류 타입 추가
  fuelProofFile: DailyProofAttachedFile[]
  fuelProofCheckId: number[]
}

type DailyReportFormStore = {
  form: DailyFormState

  lastModifiedRowId?: number
  isSaved: boolean
  setSaved: (saved: boolean) => void

  reset: () => void
  resetEmployees: () => void
  resetDirectContracts: () => void
  resetDirectContractOut: () => void
  resetOutsourcing: () => void
  resetEquipment: () => void
  resetFuel: () => void
  resetWorker: () => void
  resetMainProcess: () => void
  resetOutByDirectContracts: () => void

  resetInputStatus: () => void

  resetMaterialStatus: () => void

  resetFile: () => void

  resetEmployeesEvidenceFile: () => void
  resetContractEvidenceFile: () => void

  resetOutsourcingEvidenceFile: () => void

  resetEquipmentEvidenceFile: () => void

  resetFuelEvidenceFile: () => void

  // 작업내용 에서 구분에 세부 항목추가!!
  addContractDetailItem: (managerId: number, backendSubEquipments: T) => void
  removeContractDetailItem: (managerId: number, itemId: number) => void

  // 여기 추가
  updateContractDetailField: (
    type: T,
    managerId: number,
    itemId: number,
    field: keyof SubEquipmentItems | keyof OutsourcingConstructionItem,
    value: T,
  ) => void

  updateSubEqByFuel: (
    managerId: number,
    itemId: number,
    field: keyof SubEquipmentByFuleItems,
    value: T,
  ) => void

  setField: <K extends keyof Omit<DailyFormState, 'reset' | 'setField'>>(
    field: K,
    value: DailyFormState[K],
  ) => void

  calculateFuelAmount: () => void

  addItem: (
    type:
      | 'Employees'
      | 'EmployeeFiles'
      | 'directContracts'
      | 'outsourcingByDirectContract'
      | 'directContractFiles'
      | 'directContractOutsourcings'
      | 'outsourcings'
      | 'outsourcingFiles'
      | 'equipment'
      | 'equipmentFile'
      | 'fuel'
      | 'worker'
      | 'mainProcesses'
      | 'inputStatuses'
      | 'materialStatuses'
      | 'fuelFile'
      | 'ContractWorker'
      | 'attachedFile',
    subType?: string,
    isTodayType?: boolean,
  ) => void

  addTemporaryCheckedItems: (type: 'directContracts' | 'outsourcingByDirectContract') => void

  updateItemField: (
    type:
      | 'Employees'
      | 'EmployeeFiles'
      | 'directContracts'
      | 'outsourcingByDirectContract'
      | 'directContractFiles'
      | 'directContractOutsourcings'
      | 'outsourcings'
      | 'outsourcingFiles'
      | 'equipment'
      | 'equipmentFile'
      | 'fuel'
      | 'worker'
      | 'mainProcesses'
      | 'inputStatuses'
      | 'materialStatuses'
      | 'fuelFile'
      | 'attachedFile',
    id: number,
    field: string,
    value: T,
  ) => void

  toggleCheckItem: (
    type:
      | 'Employees'
      | 'EmployeeFiles'
      | 'directContracts'
      | 'outsourcingByDirectContract'
      | 'directContractFiles'
      | 'directContractOutsourcings'
      | 'outsourcings'
      | 'outsourcingFiles'
      | 'equipment'
      | 'equipmentFile'
      | 'fuel'
      | 'worker'
      | 'mainProcesses'
      | 'inputStatuses'
      | 'materialStatuses'
      | 'fuelFile'
      | 'attachedFile',
    id: number,
    checked: boolean,
  ) => void
  toggleCheckAllItems: (
    type:
      | 'Employees'
      | 'EmployeeFiles'
      | 'directContracts'
      | 'outsourcingByDirectContract'
      | 'directContractFiles'
      | 'directContractOutsourcings'
      | 'outsourcings'
      | 'outsourcingFiles'
      | 'equipment'
      | 'equipmentFile'
      | 'fuel'
      | 'worker'
      | 'mainProcesses'
      | 'inputStatuses'
      | 'materialStatuses'
      | 'fuelFile'
      | 'attachedFile',
    checked: boolean,
  ) => void
  removeCheckedItems: (
    type:
      | 'Employees'
      | 'EmployeeFiles'
      | 'directContracts'
      | 'outsourcingByDirectContract'
      | 'directContractFiles'
      | 'directContractOutsourcings'
      | 'equipment'
      | 'equipmentFile'
      | 'outsourcings'
      | 'outsourcingFiles'
      | 'fuel'
      | 'worker'
      | 'mainProcesses'
      | 'inputStatuses'
      | 'materialStatuses'
      | 'fuelFile'
      | 'attachedFile',
    subType?: string,
    isToday?: boolean,
  ) => void

  // 작업내용 에서 구분에 세부 항목추가!!

  addWorkDetail: (workId: number) => void
  removeSubWork: (workId: number, workDetailId: number) => void

  // 여기 추가
  updateSubWorkField: (
    workId: number,
    workDetailId: number,
    field: keyof WorkDetailInfo,
    value: T,
  ) => void

  setFuelRadioBtn: (id: number, categoryType: 'EQUIPMENT' | 'CONSTRUCTION') => void

  //payload 값
  newDailyReportData: () => void
  modifyEmployees: () => void
  // 직영
  modifyDirectContracts: () => void

  // 용역
  modifyDirectContractByOutsourcing: () => void
  // 외주
  modifyDirectContractOutsourcing: () => void

  modifyOutsourcing: () => void
  modifyEquipment: () => void

  modifyWorkerProcess: () => void

  modifyMainProcess: () => void

  modifyInputStatus: () => void

  modifyMaterialStatus: () => void

  modifyFuel: () => void
  modifyFile: () => void
  modifyWeather: (activeTab: string) => void

  // 출열일보 유류에서 주유량 계산

  getGasUseTotal: () => number
  getAmountTotal: () => number
}
