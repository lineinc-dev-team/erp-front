import { Contract, ContractFile, SiteForm, SiteProcess, SiteSearchState } from '@/types/site'
import { getTodayDateString } from '@/utils/formatters'
import { create } from 'zustand'

type SiteFormState = {
  form: SiteForm
  setField: <K extends keyof SiteForm>(field: K, value: SiteForm[K]) => void
  setProcessField: <K extends keyof SiteProcess>(field: K, value: SiteProcess[K]) => void
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  updateContractField: (index: number, field: keyof Contract, value: any) => void
  addContract: () => void
  removeContract: (index: number) => void
  addContractFile: (contractIndex: number, file: ContractFile) => void
  removeContractFile: (contractIndex: number, fileIndex: number) => void
  resetForm: () => void
  updateMemo: (id: number, newMemo: string) => void
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  toPayload: () => any
  setContracts: (contracts: Contract[]) => void
}

export const useSiteSearchStore = create<{ search: SiteSearchState }>((set) => ({
  search: {
    searchTrigger: 0,
    nameId: 0,
    name: '',
    processId: 0,
    processName: '',
    // type: '',
    city: '',
    district: '',
    processStatuses: [],
    clientCompanyName: '',
    createdBy: '',
    managerName: '',
    startDate: null,
    endDate: null,
    createdStartDate: null,
    createdEndDate: null,
    arraySort: '최신순',
    currentPage: 1,
    pageCount: '20',

    setField: (field, value) =>
      set((state) => ({
        search: { ...state.search, [field]: value },
      })),

    handleSearch: () =>
      set((state) => ({
        search: {
          ...state.search,
          searchTrigger: state.search.searchTrigger + 1,
        },
      })),

    reset: () =>
      set((state) => ({
        search: {
          ...state.search,
          searchTrigger: 0,
          name: '',
          // type: '',
          processName: '',
          city: '',
          district: '',
          processStatuses: [],
          clientCompanyName: '',
          createdBy: '',
          managerName: '',
          startDate: null,
          endDate: null,
          createdStartDate: null,
          createdEndDate: null,
          arraySort: '최신순',
          currentPage: 1,
          pageCount: '20',
        },
      })),
  },
}))

export const useSiteFormStore = create<SiteFormState>((set, get) => ({
  form: {
    name: '',
    address: '',
    detailAddress: '',
    isModalOpen: false,
    city: '',
    district: '',
    // type: null,
    clientCompanyId: 0,
    clientCompanyName: '',
    startedAt: null,
    endedAt: null,
    initialStartedAt: '', // 'yyyy-MM-dd'
    initialEndedAt: '', // 'yyyy-MM-dd'
    userId: 0,
    userName: '',
    contractAmount: 0,
    memo: '',
    process: {
      name: '',
      managerId: 0,
      managerName: '',
      areaNumber: '지역번호',
      officePhone: '',
      status: '선택',
      memo: '',
    },
    contracts: [],
    changeHistories: [],
  },

  setContracts: (contracts) =>
    set((state) => ({
      form: {
        ...state.form,
        contracts,
      },
    })),

  setField: (field, value) => set((state) => ({ form: { ...state.form, [field]: value } })),

  updateMemo: (id, value) =>
    set((state) => {
      // 기존 changeHistories 업데이트
      const updatedHistories = state.form.changeHistories.map((history) =>
        history.id === id ? { ...history, memo: value } : history,
      )

      // 기존에 저장된 editedHistories 복사
      const edited = state.form.editedHistories ?? []

      // 이미 수정된 항목이 있으면 덮어쓰기, 없으면 새로 추가
      const updatedEditedHistories = edited.some((h) => h.id === id)
        ? edited.map((h) => (h.id === id ? { id, memo: value } : h))
        : [...edited, { id, memo: value }]

      return {
        form: {
          ...state.form,
          changeHistories: updatedHistories,
          editedHistories: updatedEditedHistories,
        },
      }
    }),

  setProcessField: (field, value) =>
    set((state) => ({
      form: {
        ...state.form,
        process: { ...state.form.process, [field]: value },
      },
    })),

  updateContractField: (index, field, value) =>
    set((state) => {
      const updated = [...state.form.contracts]

      // 1️⃣ 해당 계약서 필드 업데이트
      updated[index] = { ...updated[index], [field]: value }

      // 2️⃣ 개별 contract.amount 계산
      updated[index].amount =
        (updated[index].supplyPrice || 0) +
        (updated[index].vat || 0) +
        (updated[index].purchaseTax || 0)

      // 3️⃣ 전체 합계 계산
      // const totalAmount = updated.reduce((sum, contract) => sum + (contract.amount || 0), 0)

      // 3️⃣ 마지막 계약서의 계약금액만 반영
      const lastContract = updated[updated.length - 1]
      const lastAmount = lastContract?.amount || 0
      // 4️⃣ 상태 업데이트: contracts + contractAmount
      return {
        form: {
          ...state.form,
          contracts: updated,
          contractAmount: lastAmount,
        },
      }
    }),

  addContract: () =>
    set((state) => ({
      form: {
        ...state.form,
        contracts: [
          ...state.form.contracts,
          {
            id: Date.now(),
            name: '',
            amount: 0,
            supplyPrice: 0,
            vat: 0,
            purchaseTax: 0,
            memo: '',
            files: [],
          },
        ],
      },
    })),

  removeContract: (index) =>
    set((state) => {
      const updated = [...state.form.contracts]
      updated.splice(index, 1)
      return { form: { ...state.form, contracts: updated } }
    }),

  addContractFile: (contractIndex, file) =>
    set((state) => {
      const updatedContracts = [...state.form.contracts]
      const contract = updatedContracts[contractIndex]
      contract.files.push(file)
      return { form: { ...state.form, contracts: updatedContracts } }
    }),

  removeContractFile: (contractIndex, fileIndex) =>
    set((state) => {
      const updatedContracts = [...state.form.contracts]
      updatedContracts[contractIndex].files.splice(fileIndex, 1)
      return { form: { ...state.form, contracts: updatedContracts } }
    }),

  resetForm: () =>
    set(() => ({
      form: {
        name: '',
        address: '',
        detailAddress: '',
        isModalOpen: false,
        city: '',
        district: '',
        // type: null,
        clientCompanyId: 0,
        clientCompanyName: '',
        startedAt: null,
        endedAt: null,
        initialStartedAt: '', // 'yyyy-MM-dd'
        initialEndedAt: '', // 'yyyy-MM-dd'
        userId: 0,
        userName: '',
        contractAmount: 0,
        memo: '',
        process: {
          name: '',
          managerId: 0,
          managerName: '',
          areaNumber: '지역번호',
          officePhone: '',
          status: '선택',
          memo: '',
        },
        contracts: [],
        changeHistories: [],
      },
    })),

  toPayload: () => {
    const form = get().form

    const startedAtStr = getTodayDateString(form.startedAt)
    const endedAtStr = getTodayDateString(form.endedAt)

    return {
      ...form,
      process: {
        ...form.process,
        officePhone: `${form.process.areaNumber}-${form.process.officePhone}`,
      },
      startedAt: startedAtStr !== form.initialStartedAt ? startedAtStr : form.initialStartedAt,
      endedAt: endedAtStr !== form.initialEndedAt ? endedAtStr : form.initialEndedAt,
      changeHistories: form.editedHistories ?? undefined,
      initialEndedAt: undefined,
      initialStartedAt: undefined,
    }
  },
}))
