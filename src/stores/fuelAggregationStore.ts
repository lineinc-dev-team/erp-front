import {
  AttachedFile,
  MaterialFormStore,
  MaterialItem,
  MaterialSearchState,
} from '@/types/materialManagement'
import { getTodayDateString } from '@/utils/formatters'
import { create } from 'zustand'

export const MaterialTypeLabelToValue: Record<string, string> = {
  '주요자재(구매)': 'MAJOR_PURCHASE',
  '주요자재(임대)': 'MAJOR_LEASE',
  '주요자재(자사)': 'MAJOR_INTERNAL',
  부대토목자재: 'CIVIL_SUPPORT',
  '잡자재(공구)': 'TOOL_MISC',
  '잡자재(잡철)': 'METAL_MISC',
  '안전(안전관리비)': 'SAFETY',
  '환경(환경관리비)': 'ENVIRONMENT',
  운반비: 'TRANSPORT',
}

export const useMaterialSearchStore = create<{ search: MaterialSearchState }>((set) => ({
  search: {
    searchTrigger: 0,
    siteId: 0,
    siteName: '',
    processName: '',
    outsourcingCompanyName: '',
    outsourcingCompanyId: 0,
    materialName: '',
    deliveryStartDate: null,
    deliveryEndDate: null,
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
          siteName: '',
          processName: '',
          siteNameId: 0,
          outsourcingCompanyName: '',
          outsourcingCompanyId: 0,
          materialName: '',
          deliveryStartDate: null,
          deliveryEndDate: null,
          arraySort: '최신순',
          currentPage: 1,
          pageCount: '10',
          searchTrigger: 0,
        },
      })),
  },
}))

export const useManagementMaterialFormStore = create<MaterialFormStore>((set, get) => ({
  form: {
    siteId: 0,
    siteName: '선택',
    siteProcessId: 0,
    siteProcessName: '선택',
    outsourcingCompanyId: 0,
    inputType: 'BASE',
    inputTypeDescription: '',
    deliveryDate: null,
    initialDeliveryDateAt: '',
    memo: '',
    details: [],
    checkedMaterialItemIds: [],

    attachedFiles: [],
    checkedAttachedFileIds: [],

    modificationHistory: [],
    changeHistories: [],
  },

  reset: () =>
    set(() => ({
      form: {
        siteId: 0,
        siteName: '선택',
        siteProcessId: 0,
        siteProcessName: '선택',
        outsourcingCompanyId: 0,
        inputType: 'BASE',
        inputTypeDescription: '',
        deliveryDate: null,
        initialDeliveryDateAt: '',
        memo: '',
        details: [],
        checkedMaterialItemIds: [],
        attachedFiles: [],
        checkedAttachedFileIds: [],
        modificationHistory: [],

        changeHistories: [],
      },
    })),

  setField: (field, value) =>
    set((state) => ({
      form: { ...state.form, [field]: value },
    })),

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

  addItem: (typeName) =>
    set((state) => {
      const id = Date.now()
      if (typeName === 'MaterialItem') {
        const newItem: MaterialItem = {
          id,
          name: '',
          inputType: '',
          standard: '',
          usage: '',
          quantity: 0,
          unitPrice: 0,
          supplyPrice: 0,
          vat: 0,
          total: 0,
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
  getTotalQuantityAmount: () => {
    const { details } = get().form
    return details.reduce((sum, item) => {
      const qty = Number(item.quantity)
      return sum + (isNaN(qty) ? 0 : qty)
    }, 0)
  },
  getTotalUnitPrice: () => {
    const { details } = get().form
    return details.reduce((sum, item) => {
      const amount = Number(item.unitPrice)
      return sum + (isNaN(amount) ? 0 : amount)
    }, 0)
  },
  getTotalSupplyAmount: () => {
    const { details } = get().form
    return details.reduce((sum, item) => {
      const amount = Number(item.supplyPrice)
      return sum + (isNaN(amount) ? 0 : amount)
    }, 0)
  },
  getTotalSurtax: () => {
    const { details } = get().form
    return details.reduce((sum, item) => {
      const amount = Number(item.vat)
      return sum + (isNaN(amount) ? 0 : amount)
    }, 0)
  },
  getTotalSum: () => {
    const { details } = get().form
    return details.reduce((sum, item) => {
      const amount = Number(item.total)
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

  toggleCheckAllItems: (typeName, checked) =>
    set((state) => {
      if (typeName === 'MaterialItem') {
        return {
          form: {
            ...state.form,
            checkedMaterialItemIds: checked ? state.form.details.map((i) => i.id) : [],
          },
        }
      } else {
        return {
          form: {
            ...state.form,
            checkedAttachmentFileIds: checked ? state.form.attachedFiles.map((f) => f.id) : [],
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

  newMaterialData: () => {
    const form = get().form

    const deliveryDateStr = getTodayDateString(form.deliveryDate)

    return {
      ...form,
      details: form.details,
      deliveryDate:
        deliveryDateStr !== form.initialDeliveryDateAt
          ? deliveryDateStr
          : form.initialDeliveryDateAt,
      // 첨부파일에 파일 업로드를 안할 시 null 로 넣는다..
      files: form.attachedFiles.flatMap((f) => {
        if (!f.files || f.files.length === 0) {
          // 파일이 없을 경우에도 name, memo는 전송
          return [
            {
              id: f.id || 0,
              fileUrl: '',
              originalFileName: '',
              memo: f.memo || '',
            } as AttachedFile,
          ]
        }

        // 파일이 있을 경우
        return f.files.map((fileObj: FileUploadInfo) => ({
          id: f.id || 0,
          fileUrl: fileObj.fileUrl || '',
          originalFileName: fileObj.file?.name || '',
          memo: f.memo || '',
        }))
      }),
      changeHistories: form.editedHistories ?? [],
    }
  },
}))

// materialItems
