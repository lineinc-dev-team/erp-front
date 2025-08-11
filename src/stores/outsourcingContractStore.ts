import { create } from 'zustand'
import { OutsourcingSearchState } from '@/types/outsourcingCompany'
import {
  OutsourcingContractAttachedFile,
  OutsourcingContractFormStore,
  OutsourcingContractManager,
  OutsourcingContractPersonAttachedFile,
} from '@/types/outsourcingContract'

export const useContractSearchStore = create<{ search: OutsourcingSearchState }>((set) => ({
  search: {
    searchTrigger: 0,
    name: '',
    businessNumber: '',
    ceoName: '',
    landlineNumber: '',
    type: '',
    startDate: null,
    endDate: null,
    isActive: '0',
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
          businessNumber: '',
          ceoName: '',
          landlineNumber: '',
          type: '',
          startDate: null,
          endDate: null,
          isActive: '0',
          arraySort: '최신순',
          pageCount: '10',
          currentPage: 1,
        },
      })),
  },
}))

export const useContractFormStore = create<OutsourcingContractFormStore>((set, get) => ({
  form: {
    siteId: 0,
    siteName: '',
    processId: 0,
    processName: '',
    CompanyId: 0,
    CompanyName: '',
    businessNumber: '',
    type: '',
    typeDescription: '',
    startedAt: null,
    endedAt: null,
    contractAmount: 0,
    defaultDeductions: '',
    defaultDeductionsDescription: '',
    taxCalculat: '',
    taxDay: '',
    dayType: '',
    memo: '',
    categoryType: '',
    isActive: '',
    headManagers: [],
    checkedManagerIds: [],
    attachedFiles: [],
    personManagers: [],
    checkedPersonIds: [],
    checkedAttachedFileIds: [],
    editedHistories: [],
    changeHistories: [],
  },

  reset: () =>
    set(() => ({
      form: {
        siteId: 0,
        siteName: '',
        processId: 0,
        processName: '',
        CompanyId: 0,
        CompanyName: '',
        businessNumber: '',
        type: '',
        typeDescription: '',
        startedAt: null,
        endedAt: null,
        contractAmount: 0,
        defaultDeductions: '',
        defaultDeductionsDescription: '',
        taxCalculat: '',
        taxDay: '',
        dayType: '',
        memo: '',
        categoryType: '',
        isActive: '',
        headManagers: [],
        checkedManagerIds: [],
        personManagers: [],
        checkedPersonIds: [],
        attachedFiles: [],
        checkedAttachedFileIds: [],
        editedHistories: [],
        changeHistories: [],
      },
    })),

  setField: (field, value) =>
    set((state) => ({
      form: { ...state.form, [field]: value },
    })),

  updateMemo: (id, value) =>
    set((state) => {
      const updatedHistories = state.form.changeHistories.map((history) =>
        history.id === id ? { ...history, memo: value } : history,
      )

      const edited = state.form.editedHistories ?? []

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

  addItem: (type) =>
    set((state) => {
      if (type === 'manager') {
        const newItem: OutsourcingContractManager = {
          id: Date.now(),
          name: '',
          position: '',
          department: '',
          managerAreaNumber: '지역번호',
          landlineNumber: '',
          phoneNumber: '',
          email: '',
          memo: '',
        }
        return { form: { ...state.form, headManagers: [...state.form.headManagers, newItem] } }
      } else if (type === 'personAttachedFile') {
        const personNewItems: OutsourcingContractPersonAttachedFile = {
          id: Date.now(),
          name: '',
          type: '',
          content: '',
          memo: '',
          files: [],
        }
        return {
          form: {
            ...state.form,
            personManagers: [...state.form.personManagers, personNewItems],
          },
        }
      } else {
        const newItem: OutsourcingContractAttachedFile = {
          id: Date.now(),
          name: '',
          memo: '',
          files: [],
        }
        return { form: { ...state.form, attachedFiles: [...state.form.attachedFiles, newItem] } }
      }
    }),

  updateItemField: <T>(
    type: 'manager' | 'attachedFile' | 'personAttachedFile',
    id: number,
    field: string,
    value: T,
  ) =>
    set((state) => {
      if (type === 'manager') {
        return {
          form: {
            ...state.form,
            headManagers: state.form.headManagers.map((m) =>
              m.id === id ? { ...m, [field]: value } : m,
            ),
          },
        }
      } else if (type === 'personAttachedFile') {
        return {
          form: {
            ...state.form,
            personManagers: state.form.personManagers.map((f) =>
              f.id === id ? { ...f, [field]: value } : f,
            ),
          },
        }
      } else {
        return {
          form: {
            ...state.form,
            attachedFiles: state.form.attachedFiles.map((f) =>
              f.id === id ? { ...f, [field]: value } : f,
            ),
          },
        }
      }
    }),

  toggleCheckItem: (type, id, checked) =>
    set((state) => {
      if (type === 'manager') {
        return {
          form: {
            ...state.form,
            checkedManagerIds: checked
              ? [...state.form.checkedManagerIds, id]
              : state.form.checkedManagerIds.filter((cid) => cid !== id),
          },
        }
      } else if (type === 'personAttachedFile') {
        return {
          form: {
            ...state.form,
            checkedPersonIds: checked
              ? [...state.form.checkedPersonIds, id]
              : state.form.checkedPersonIds.filter((cid) => cid !== id),
          },
        }
      } else {
        return {
          form: {
            ...state.form,
            checkedAttachedFileIds: checked
              ? [...state.form.checkedAttachedFileIds, id]
              : state.form.checkedAttachedFileIds.filter((cid) => cid !== id),
          },
        }
      }
    }),

  toggleCheckAllItems: (type, checked) =>
    set((state) => {
      if (type === 'manager') {
        return {
          form: {
            ...state.form,
            checkedManagerIds: checked ? state.form.headManagers.map((m) => m.id) : [],
          },
        }
      } else if (type === 'personAttachedFile') {
        return {
          form: {
            ...state.form,
            checkedPersonIds: checked ? state.form.personManagers.map((f) => f.id) : [],
          },
        }
      } else {
        return {
          form: {
            ...state.form,
            checkedAttachedFileIds: checked ? state.form.attachedFiles.map((f) => f.id) : [],
          },
        }
      }
    }),

  setRepresentativeManager: (id: number) =>
    set((state) => ({
      form: {
        ...state.form,
        headManagers: state.form.headManagers.map((m) => ({
          ...m,
          isMain: m.id === id,
        })),
      },
    })),

  removeCheckedItems: (type) =>
    set((state) => {
      if (type === 'manager') {
        return {
          form: {
            ...state.form,
            headManagers: state.form.headManagers.filter(
              (m) => !state.form.checkedManagerIds.includes(m.id),
            ),
            checkedManagerIds: [],
          },
        }
      } else if (type === 'personAttachedFile') {
        return {
          form: {
            ...state.form,
            personManagers: state.form.personManagers.filter(
              (f) => !state.form.checkedPersonIds.includes(f.id),
            ),
            checkedPersonIds: [],
          },
        }
      } else {
        return {
          form: {
            ...state.form,
            attachedFiles: state.form.attachedFiles.filter(
              (f) => !state.form.checkedAttachedFileIds.includes(f.id),
            ),
            checkedAttachedFileIds: [],
          },
        }
      }
    }),

  newOutsourcingContractData: () => {
    const form = get().form
    return {
      siteId: form.siteId,
      processId: form.processId,
      CompanyName: form.CompanyName,
      businessNumber: form.businessNumber,
      type: form.type,
      typeDescription: form.typeDescription,
      startedAt: form.startedAt,
      endedAt: form.endedAt,
      defaultDeductions: form.defaultDeductions,
      defaultDeductionsDescription: form.defaultDeductionsDescription,
      contractAmount: form.contractAmount,
      taxCalculat: form.taxCalculat,
      taxDay: form.taxDay,
      dayType: form.dayType,
      memo: form.memo,
      categoryType: form.categoryType,
      isActive: form.isActive === '1',
      contacts: form.headManagers.map((m) => ({
        id: m.id,
        name: m.name,
        position: m.position,
        department: m.department,
        landlineNumber: `${m.managerAreaNumber}-${m.landlineNumber}`,
        phoneNumber: m.phoneNumber,
        email: m.email,
        memo: m.memo,
        isMain: m.isMain ?? false,
      })),
      files: form.attachedFiles.flatMap((f) =>
        f.files.map((fileObj) => ({
          id: f.id,
          name: f.name,
          fileUrl: fileObj.publicUrl,
          originalFileName: fileObj.file?.name ?? 'testFile_2024.pdf',
          memo: f.memo,
        })),
      ),
      changeHistories: form.editedHistories ?? [],
    }
  },
}))
