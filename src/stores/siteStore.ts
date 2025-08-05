import { Contract, ContractFile, SiteForm, SiteProcess, SiteSearchState } from '@/types/site'
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  toPayload: () => any
  setContracts: (contracts: Contract[]) => void
}

export const typeLabelToValue: Record<string, string> = {
  건축: 'CONSTRUCTION',
  토목: 'CIVIL_ENGINEERING',
  외주: 'OUTSOURCING',
}

export const ProgressingLabelToValue: Record<string, string> = {
  준비중: 'NOT_STARTED',
  진행중: 'IN_PROGRESS',
  완료: 'COMPLETED',
}

export const useSiteSearchStore = create<{ search: SiteSearchState }>((set) => ({
  search: {
    searchTrigger: 0,
    name: '',
    processName: '',
    type: '',
    city: '',
    district: '',
    processStatuses: [],
    clientCompanyName: '',
    createdBy: '',
    startDate: null,
    endDate: null,
    createdStartDate: null,
    createdEndDate: null,
    arraySort: '최신순',
    currentPage: 1,
    pageCount: '10',

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
          name: '',
          type: '',
          processName: '',
          city: '',
          district: '',
          processStatuses: [],
          clientCompanyName: '',
          createdBy: '',
          startDate: null,
          endDate: null,
          createdStartDate: null,
          createdEndDate: null,
          arraySort: '최신순',
          currentPage: 1,
          pageCount: '10',
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
    type: '',
    clientCompanyId: 0,
    startedAt: null,
    endedAt: null,
    userId: 0,
    contractAmount: 0,
    memo: '',
    process: {
      name: '',
      managerId: 0,
      officePhone: '',
      status: '선택',
      memo: '',
    },
    contracts: [],
  },
  setContracts: (contracts) =>
    set((state) => ({
      form: {
        ...state.form,
        contracts,
      },
    })),

  setField: (field, value) => set((state) => ({ form: { ...state.form, [field]: value } })),

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
      updated[index] = { ...updated[index], [field]: value }
      return { form: { ...state.form, contracts: updated } }
    }),

  addContract: () =>
    set((state) => ({
      form: {
        ...state.form,
        contracts: [
          ...state.form.contracts,
          {
            id: 0,
            name: '',
            amount: 0,
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
        type: '',
        clientCompanyId: 0,
        startedAt: null,
        endedAt: null,
        userId: 0,
        contractAmount: 0,
        memo: '',
        process: {
          name: '',
          managerId: 0,
          officePhone: '',
          status: '선택',
          memo: '',
        },
        contracts: [],
      },
    })),

  toPayload: () => {
    const form = get().form
    return {
      ...form,
      startedAt: form.startedAt?.toISOString().split('T')[0] ?? '',
      endedAt: form.endedAt?.toISOString().split('T')[0] ?? '',
    }
  },
}))
