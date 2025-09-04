import {
  AttachedFile,
  MaterialItem,
  SteelFormStore,
  SteelSearchState,
} from '@/types/managementSteel'
import { getTodayDateString } from '@/utils/formatters'
import { create } from 'zustand'

export const useSteelSearchStore = create<{ search: SteelSearchState }>((set) => ({
  search: {
    searchTrigger: 0,
    siteId: 0,
    siteName: '',
    processName: '',
    itemName: '',
    type: '',
    outsourcingCompanyName: '',
    startDate: null,
    endDate: null,
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
          siteId: 0,
          siteName: '',
          processName: '',
          itemName: '',
          type: '',
          outsourcingCompanyName: '',
          startDate: null,
          endDate: null,
          arraySort: '최신순',
          currentPage: 1,
          pageCount: '20',
          searchTrigger: 0,
        },
      })),
  },
}))

export const useManagementSteelFormStore = create<SteelFormStore>((set, get) => ({
  form: {
    siteId: 0,
    siteProcessId: 0,
    outsourcingCompanyId: 0,
    usage: '',
    type: 'BASE',
    typeCode: '',
    startDate: null,
    endDate: null,
    initialStartDateAt: '',
    initialEndDateAt: '',
    memo: '',
    businessNumber: '',
    details: [],
    checkedMaterialItemIds: [],

    attachedFiles: [],
    checkedAttachedFileIds: [],

    changeHistories: [],
  },

  reset: () =>
    set(() => ({
      form: {
        siteId: 0,
        siteProcessId: 0,
        outsourcingCompanyId: 0,
        usage: '',
        type: 'BASE',
        typeCode: '',
        startDate: null,
        endDate: null,
        initialStartDateAt: '',
        initialEndDateAt: '',
        memo: '',
        businessNumber: '',
        details: [],
        checkedMaterialItemIds: [],
        attachedFiles: [],
        checkedAttachedFileIds: [],

        changeHistories: [],
      },
    })),

  setField: (field, value) =>
    set((state) => ({
      form: { ...state.form, [field]: value },
    })),

  addItem: (typeName) =>
    set((state) => {
      const id = Date.now()
      if (typeName === 'MaterialItem') {
        const newItem: MaterialItem = {
          id,
          standard: '',
          name: '',
          unit: '',
          count: 0,
          length: 0,
          totalLength: 0,
          unitWeight: 0,
          quantity: 0,
          unitPrice: 0,
          supplyPrice: 0,
          memo: '',
        }
        return {
          form: {
            ...state.form,
            details: [...state.form.details, newItem],
          },
        }
      } else {
        const newFile: AttachedFile = {
          id,
          name: '',
          memo: '',
          files: [],
        }
        return { form: { ...state.form, attachedFiles: [...state.form.attachedFiles, newFile] } }
      }
    }),

  updateItemField: (typeName, id, field, value) =>
    set((state) => {
      if (typeName === 'MaterialItem') {
        return {
          form: {
            ...state.form,
            details: state.form.details.map((item) =>
              item.id === id ? { ...item, [field]: value } : item,
            ),
          },
        }
      } else {
        return {
          form: {
            ...state.form,
            attachedFiles: state.form.attachedFiles.map((file) =>
              file.id === id ? { ...file, [field]: value } : file,
            ),
          },
        }
      }
    }),

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

  // 도급금액 금액 합계
  getTotalContractAmount: () => {
    const { details } = get().form
    return details.reduce((sum, item) => {
      const amount = Number(item.quantity)
      return sum + (isNaN(amount) ? 0 : amount)
    }, 0)
  },

  // 외주계약금액 수량 합계
  getTotalOutsourceQty: () => {
    const { details } = get().form
    return details.reduce((sum, item) => {
      const qty = Number(item.unitPrice)
      return sum + (isNaN(qty) ? 0 : qty)
    }, 0)
  },

  // 외주계약금액 금액 합계
  getTotalOutsourceAmount: () => {
    const { details } = get().form
    return details.reduce((sum, item) => {
      const amount = Number(item.supplyPrice)
      return sum + (isNaN(amount) ? 0 : amount)
    }, 0)
  },

  toggleCheckItem: (typeName, id, checked) =>
    set((state) => {
      if (typeName === 'MaterialItem') {
        return {
          form: {
            ...state.form,
            checkedMaterialItemIds: checked
              ? [...state.form.checkedMaterialItemIds, id]
              : state.form.checkedMaterialItemIds.filter((cid) => cid !== id),
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
      if (type === 'MaterialItem') {
        return {
          form: {
            ...state.form,
            checkedMaterialItemIds: checked ? state.form.details.map((m) => m.id) : [],
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

  removeCheckedItems: (typeName) =>
    set((state) => {
      if (typeName === 'MaterialItem') {
        return {
          form: {
            ...state.form,
            details: state.form.details.filter(
              (item) => !state.form.checkedMaterialItemIds.includes(item.id),
            ),
            checkedMaterialItemIds: [],
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

  newSteelData: () => {
    const form = get().form

    const startedAtStr = getTodayDateString(form.startDate)
    const endedAtStr = getTodayDateString(form.endDate)

    return {
      ...form,
      outsourcingCompanyId: form.outsourcingCompanyId === 0 ? undefined : form.outsourcingCompanyId,
      startDate: startedAtStr !== form.initialStartDateAt ? startedAtStr : form.initialStartDateAt,
      endDate: endedAtStr !== form.initialEndDateAt ? endedAtStr : form.initialEndDateAt,
      details: form.details,
      // 첨부파일에 파일 업로드를 안할 시 null 로 넣는다..
      files: form.attachedFiles.flatMap((f) => {
        if (!f.files || f.files.length === 0) {
          // 파일이 없을 경우에도 name, memo는 전송
          return [
            {
              id: f.id || Date.now(),
              name: f.name,
              fileUrl: '',
              originalFileName: '',
              memo: f.memo || '',
            },
          ]
        }

        // 파일이 있을 경우
        return f.files.map((fileObj: FileUploadInfo) => ({
          id: f.id || Date.now(),
          name: f.name,
          fileUrl: fileObj.fileUrl || '',
          originalFileName: fileObj.name || fileObj.originalFileName,
          memo: f.memo || '',
        }))
      }),
      checkedMaterialItemIds: undefined,
      checkedAttachedFileIds: undefined,
      attachedFiles: undefined,
      typeCode: undefined,
      initialStartDateAt: undefined,
      initialEndDateAt: undefined,

      changeHistories: form.editedHistories ?? [],
    }
  },
}))
