import { create } from 'zustand'
import { costItem, AttachedFile, CostFormStore, CostSearchState } from '@/types/managementCost'

export const ItemTypeLabelToValue: Record<string, string> = {
  보증금: 'DEPOSIT',
  월세: 'MONTHLY_RENT',
  관리비: 'MAINTENANCE',
  주차비: 'PARKING_FEE',
  식대: 'MEAL_FEE',
  전도금: 'KEY_MONEY',
  기타잡비: 'MISC_EXPENSE',
}

export const useCostSearchStore = create<{ search: CostSearchState }>((set) => ({
  search: {
    searchTrigger: 0,
    name: '',
    processName: '',
    itemType: '선택',
    itemDescription: '',
    paymentStartDate: null,
    paymentEndDate: null,
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
          processName: '',
          itemType: '선택',
          itemDescription: '',
          paymentStartDate: null,
          paymentEndDate: null,
          arraySort: '최신순',
          currentPage: 1,
          pageCount: '10',
          searchTrigger: 0,
        },
      })),
  },
}))

export const useManagementCostFormStore = create<CostFormStore>((set, get) => ({
  form: {
    siteId: 0,
    siteProcessId: 0,
    itemType: '선택',
    itemDescription: '',
    paymentDate: null,
    businessNumber: '',
    ceoName: '',
    accountNumber: '',
    accountHolder: '',
    bankName: '선택',
    memo: '',
    details: [],
    checkedCostIds: [],
    attachedFiles: [],
    checkedAttachedFileIds: [],
    modificationHistory: [],
  },

  reset: () =>
    set(() => ({
      form: {
        siteId: 0,
        siteProcessId: 0,
        itemType: '선택',
        itemDescription: '',
        paymentDate: null,
        businessNumber: '',
        ceoName: '',
        accountNumber: '',
        accountHolder: '',
        bankName: '선택',
        memo: '',
        details: [],
        checkedCostIds: [],
        attachedFiles: [],
        checkedAttachedFileIds: [],
        modificationHistory: [],
      },
    })),

  setField: (field, value) =>
    set((state) => ({
      form: { ...state.form, [field]: value },
    })),

  addItem: (type) =>
    set((state) => {
      const id = Date.now()
      if (type === 'costItem') {
        const newItem: costItem = {
          id,
          name: '',
          unitPrice: 0,
          supplyPrice: 0,
          vat: 0,
          total: 0,
          memo: '',
        }
        return { form: { ...state.form, details: [...state.form.details, newItem] } }
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

  updateItemField: (type, id, field, value) =>
    set((state) => {
      if (type === 'costItem') {
        return {
          form: {
            ...state.form,
            details: state.form.details.map((item) =>
              item.id === id
                ? {
                    ...item,
                    [field]: value,
                    ...(field === 'supplyPrice'
                      ? (() => {
                          const supply = Number(value) || 0
                          const vat = Math.floor(supply * 0.1)
                          const total = supply + vat
                          return {
                            vat: vat.toString(),
                            total: total.toString(),
                          }
                        })()
                      : {}),
                  }
                : item,
            ),
          },
        }
      } else {
        return {
          ...state,
          form: {
            ...state.form,
            attachedFiles: state.form.attachedFiles.map((item) =>
              item.id === id ? { ...item, [field]: value } : item,
            ),
          },
        }
      }
    }),

  toggleCheckItem: (type, id, checked) =>
    set((state) => {
      if (type === 'costItem') {
        return {
          form: {
            ...state.form,
            checkedCostIds: checked
              ? [...state.form.checkedCostIds, id]
              : state.form.checkedCostIds.filter((cid) => cid !== id),
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
      if (type === 'costItem') {
        return {
          form: {
            ...state.form,
            checkedCostIds: checked ? state.form.details.map((item) => item.id) : [],
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

  removeCheckedItems: (type) =>
    set((state) => {
      if (type === 'costItem') {
        return {
          form: {
            ...state.form,
            details: state.form.details.filter(
              (item) => !state.form.checkedCostIds.includes(item.id),
            ),
            checkedCostIds: [],
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

  newCostData: () => {
    const form = get().form
    return {
      siteId: form.siteId,
      siteProcessId: form.siteProcessId,
      itemType: form.itemType,
      itemDescription: form.itemDescription,
      paymentDate: form.paymentDate,
      businessNumber: form.businessNumber,
      ceoName: form.ceoName,
      accountNumber: form.accountNumber,
      accountHolder: form.accountHolder,
      bankName: form.bankName,
      memo: form.memo,
      details: form.details.map((item) => ({
        name: item.name,
        unitPrice: item.unitPrice,
        supplyPrice: item.supplyPrice,
        vat: item.vat,
        total: item.total,
        memo: item.memo,
      })),
      files: form.attachedFiles.flatMap((f) =>
        f.files.map((fileObj) => ({
          name: f.name,
          fileUrl: fileObj.publicUrl,
          originalFileName: fileObj.file?.name || '',
          memo: f.memo,
        })),
      ),
    }
  },
}))
