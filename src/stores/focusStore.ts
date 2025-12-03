import { create } from 'zustand'

interface FocusState {
  // 업체명
  serviceCompanyFocusedId: number | null
  setServiceCompanyFocusedId: (id: number | null) => void
  manualClose: boolean
  setManualClose: (v: boolean) => void

  // 업체명을 선택 후 선택하는 이름
  personNameFocusedId: number | null
  setPersonNameFocusedId: (id: number | null) => void
  manualClosePerson: boolean
  setManualClosePerson: (v: boolean) => void

  // 일단 이름
  focusedRowId: number | null
  setFocusedRowId: (id: number | null) => void

  // 직영/용역 ===> 외주 에서 업체명 검색
  serviceOutsourcingCompanyFocusedId: number | null
  setServiceOutsourcingCompanyFocusedId: (id: number | null) => void

  // 직영/용역 ===> 외주 에서 계약명 검색
  serviceOutsourcingContractFocusedId: number | null
  setServiceOutsourcingContractFocusedId: (id: number | null) => void

  // 직영/용역 ===> 외주 에서  이름 검색
  serviceOutsourcingContractPersonNameFocusedId: number | null
  setServiceOutsourcingContractPersonNameFocusedId: (id: number | null) => void

  // 장비에서 업체명 등록 키워드 검색

  equipmentOutsourcingNameFocusedId: number | null
  setEquipmentOutsourcingNameFocusedId: (id: number | null) => void

  // 장비에서 기사명 키워드 검색

  equipmentDriverNameFocusedId: number | null
  setEquipmentDriverNameFocusedId: (id: number | null) => void

  // 장비에서 차량번호 키워드 검색

  equipmentCarNumberFocusedId: number | null
  setEquipmentCarNumberFocusedId: (id: number | null) => void

  // 외주(공사)에서의 업체명 포커싱
  workOutsourcingNameFocusedId: number | null
  setWorkOutsourcingNameFocusedId: (id: number | null) => void

  // 외주(공사)에서의 항목명
  workerItemNameFocusedId: number | null
  setWorkerItemNameFocusedId: (id: number | null) => void

  // 유류에서 업체명 선택
  fuelOutsourcingNameFocusedId: number | null
  setFuelOutsourcingNameFocusedId: (id: number | null) => void

  // 유류에서 차량번호 키워드 검색
  fuelCarNumberFocusedId: number | null
  setFuelCarNumberFocusedId: (id: number | null) => void

  // 자재 관리에서 품명 키워드 검색 시 포커스 관리
  materialItemFocusedId: number | null
  setMaterialItemFocusedId: (id: number | null) => void

  // 강재수불부에서 규격 포커싱 관리
  specificationItemFocusedId: number | null
  setSpecificationItemFocusedId: (id: number | null) => void
}

export const useFocusStore = create<FocusState>((set) => ({
  focusedRowId: null,
  setFocusedRowId: (id) => set({ focusedRowId: id }),

  serviceCompanyFocusedId: null,
  setServiceCompanyFocusedId: (id) => set({ serviceCompanyFocusedId: id }),
  manualClose: false,
  setManualClose: (v) => set({ manualClose: v }),

  personNameFocusedId: null,
  setPersonNameFocusedId: (id) => set({ personNameFocusedId: id }),
  manualClosePerson: false,
  setManualClosePerson: (v) => set({ manualClosePerson: v }),

  serviceOutsourcingCompanyFocusedId: null,
  setServiceOutsourcingCompanyFocusedId: (id) => set({ serviceOutsourcingCompanyFocusedId: id }),

  serviceOutsourcingContractFocusedId: null,
  setServiceOutsourcingContractFocusedId: (id) => set({ serviceOutsourcingContractFocusedId: id }),

  serviceOutsourcingContractPersonNameFocusedId: null,
  setServiceOutsourcingContractPersonNameFocusedId: (id) =>
    set({ serviceOutsourcingContractPersonNameFocusedId: id }),

  // 장비의 업체명
  equipmentOutsourcingNameFocusedId: null,
  setEquipmentOutsourcingNameFocusedId: (id) => set({ equipmentOutsourcingNameFocusedId: id }),

  // 장비의 기사명
  equipmentDriverNameFocusedId: null,
  setEquipmentDriverNameFocusedId: (id) => set({ equipmentDriverNameFocusedId: id }),

  // 장비의 차량번호
  equipmentCarNumberFocusedId: null,
  setEquipmentCarNumberFocusedId: (id) => set({ equipmentCarNumberFocusedId: id }),

  // 외주(공사) 업체명
  workOutsourcingNameFocusedId: null,
  setWorkOutsourcingNameFocusedId: (id) => set({ workOutsourcingNameFocusedId: id }),

  // 외주(공사)에서의 항목명
  workerItemNameFocusedId: null,
  setWorkerItemNameFocusedId: (id) => set({ workerItemNameFocusedId: id }),

  // 유류 업체명
  fuelOutsourcingNameFocusedId: null,
  setFuelOutsourcingNameFocusedId: (id) => set({ fuelOutsourcingNameFocusedId: id }),

  // 유류 차량번호
  fuelCarNumberFocusedId: null,
  setFuelCarNumberFocusedId: (id) => set({ fuelCarNumberFocusedId: id }),

  // 자재에서 품명
  materialItemFocusedId: null,
  setMaterialItemFocusedId: (id) => set({ materialItemFocusedId: id }),

  // 강재에서 규격
  specificationItemFocusedId: null,
  setSpecificationItemFocusedId: (id) => set({ specificationItemFocusedId: id }),
}))
