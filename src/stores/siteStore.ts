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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  toPayload: () => any
}

export const useSiteSearchStore = create<{ search: SiteSearchState }>((set) => ({
  search: {
    searchTrigger: 0,
    name: '',
    type: '선택',
    processName: '',
    city: '',
    district: '',
    ProcessStatus: [],
    clientCompanyName: '',
    createdBy: '',
    startDate: null,
    endDate: null,
    createdStartDate: null,
    createdEndDate: null,
    arraySort: '최신순',
    currentPage: 0,
    pageCount: '10',

    setField: (field, value) =>
      set((state) => ({
        search: { ...state.search, [field]: value },
      })),

    handleSearch: () =>
      set((state) => {
        const search = state.search

        const payload = {
          name: search.name,
          type: search.type,
          processName: search.processName,
          city: search.city,
          district: search.district,
          processStatuses: search.ProcessStatus,
          clientCompanyName: search.clientCompanyName,
          createdBy: search.createdBy,
          startDate: getTodayDateString(search.startDate),
          endDate: getTodayDateString(search.endDate),
          createdStartDate: getTodayDateString(search.createdStartDate),
          createdEndDate: getTodayDateString(search.createdEndDate),
          // sort: search.arraySort,
          // page: search.currentPage,
          // size: Number(search.pageCount),
        }

        alert(JSON.stringify(payload, null, 2)) // 디버깅용

        return {
          search: {
            ...search,
            searchTrigger: (search.searchTrigger || 0) + 1,
          },
        }
      }),

    reset: () =>
      set((state) => ({
        search: {
          ...state.search,
          name: '',
          type: '선택',
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
          currentPage: 0,
          pageCount: '10',
        },
      })),

    handleOrderingListRemove: () => {
      alert('리스트에서 선택 항목이 제거됩니다.')
    },
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
    type: '선택',
    clientCompanyId: 0,
    startDate: null,
    endDate: null,
    userId: 0,
    contractAmount: 0,
    memo: '',
    process: {
      name: '',
      officePhone: '',
      status: '선택',
      memo: '',
    },
    contracts: [],
  },

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
        type: '선택',
        clientCompanyId: 0,
        startDate: null,
        endDate: null,
        userId: 0,
        contractAmount: 0,
        memo: '',
        process: {
          name: '',
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
      startDate: form.startDate?.toISOString().split('T')[0] ?? '',
      endDate: form.endDate?.toISOString().split('T')[0] ?? '',
    }
  },
}))
