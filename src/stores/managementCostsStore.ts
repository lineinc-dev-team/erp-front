import { create } from 'zustand'
import {
  AttachedFile,
  CostFormStore,
  CostItem,
  CostSearchState,
  KeyMoneyDetail,
  MealFeeDetail,
} from '@/types/managementCost'
import { getTodayDateString } from '@/utils/formatters'

export const useCostSearchStore = create<{ search: CostSearchState }>((set) => ({
  search: {
    searchTrigger: 0,
    siteId: 0,
    siteName: '',
    processId: 0,
    processName: '',
    outsourcingCompanyName: '',
    itemType: '',
    itemTypeDescription: '',
    paymentStartDate: null,
    paymentEndDate: null,
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
          processId: 0,
          processName: '',
          itemType: '',
          itemDescription: '',
          outsourcingCompanyName: '',
          paymentStartDate: null,
          paymentEndDate: null,
          arraySort: '최신순',
          currentPage: 1,
          pageCount: '20',
          searchTrigger: 0,
        },
      })),
  },
}))

export const useManagementCostFormStore = create<CostFormStore>((set, get) => ({
  form: {
    siteId: 0,
    siteProcessId: 0,
    outsourcingCompanyId: -1,
    itemType: '',
    itemTypeDescription: '',
    paymentDate: null,
    initialDeliveryDateAt: '',
    outsourcingCompanyInfo: null,

    memo: '',
    details: [],
    checkedCostIds: [],

    keyMoneyDetails: [],
    checkedKeyMoneyIds: [],

    mealFeeDetails: [],
    checkedMealFeeIds: [],

    attachedFiles: [],
    checkedAttachedFileIds: [],

    editedHistories: [],
    changeHistories: [],
  },

  reset: () =>
    set(() => ({
      form: {
        siteId: 0,
        siteProcessId: 0,
        outsourcingCompanyId: -1,
        itemType: '',
        itemTypeDescription: '',
        paymentDate: null,
        initialDeliveryDateAt: '',
        outsourcingCompanyInfo: null,
        memo: '',
        details: [],
        checkedCostIds: [],
        keyMoneyDetails: [],
        checkedKeyMoneyIds: [],
        mealFeeDetails: [],
        checkedMealFeeIds: [],
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
      const id = Date.now()
      if (type === 'costItem') {
        const newItem: CostItem = {
          id: Date.now(),
          name: '',
          unitPrice: 0,
          supplyPrice: 0,
          vat: 0,
          total: 0,
          memo: '',
        }
        return { form: { ...state.form, details: [...state.form.details, newItem] } }
      }
      if (type === 'attachedFile') {
        const newFile: AttachedFile = {
          id,
          memo: '',
          files: [],
        }
        return { form: { ...state.form, attachedFiles: [...state.form.attachedFiles, newFile] } }
      }
      if (type === 'mealListData') {
        const newMeal: MealFeeDetail = {
          id: Date.now(),
          workType: '',
          laborId: null,
          name: '',
          breakfastCount: 0,
          lunchCount: 0,
          mealCount: 0,
          unitPrice: 0,
          amount: 0,
          memo: '',
        }
        return { form: { ...state.form, mealFeeDetails: [...state.form.mealFeeDetails, newMeal] } }
      }
      if (type === 'keyMoneyList') {
        const newKeyMoney: KeyMoneyDetail = {
          id: Date.now(),
          account: '',
          purpose: '',
          personnelCount: 0,
          amount: 0,
          memo: '',
        }
        return {
          form: { ...state.form, keyMoneyDetails: [...state.form.keyMoneyDetails, newKeyMoney] },
        }
      }
      return state
    }),

  updateItemField: (type, id, field, value) =>
    set((state) => {
      if (type === 'costItem') {
        return {
          form: {
            ...state.form,
            details: state.form.details.map((item) =>
              item.id === id ? { ...item, [field]: value } : item,
            ),
          },
        }
      } else if (type === 'attachedFile') {
        return {
          form: {
            ...state.form,
            attachedFiles: state.form.attachedFiles.map((item) =>
              item.id === id ? { ...item, [field]: value } : item,
            ),
          },
        }
      } else if (type === 'mealListData') {
        return {
          form: {
            ...state.form,
            mealFeeDetails: state.form.mealFeeDetails.map((item) =>
              item.id === id ? { ...item, [field]: value } : item,
            ),
          },
        }
      } else if (type === 'keyMoneyList') {
        return {
          form: {
            ...state.form,
            keyMoneyDetails: state.form.keyMoneyDetails.map((item) =>
              item.id === id ? { ...item, [field]: value } : item,
            ),
          },
        }
      }
      return state
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
      }
      if (type === 'attachedFile') {
        return {
          form: {
            ...state.form,
            checkedAttachedFileIds: checked
              ? [...state.form.checkedAttachedFileIds, id]
              : state.form.checkedAttachedFileIds.filter((cid) => cid !== id),
          },
        }
      }
      if (type === 'mealListData') {
        return {
          form: {
            ...state.form,
            checkedMealFeeIds: checked
              ? [...state.form.checkedMealFeeIds, id]
              : state.form.checkedMealFeeIds.filter((cid) => cid !== id),
          },
        }
      }
      if (type === 'keyMoneyList') {
        return {
          form: {
            ...state.form,
            checkedKeyMoneyIds: checked
              ? [...state.form.checkedKeyMoneyIds, id]
              : state.form.checkedKeyMoneyIds.filter((cid) => cid !== id),
          },
        }
      }
      return state
    }),

  toggleCheckAllItems: (type, checked) =>
    set((state) => {
      if (type === 'costItem') {
        return {
          form: {
            ...state.form,
            checkedCostIds: checked ? state.form.details.map((m) => m.id) : [],
          },
        }
      } else if (type === 'attachedFile') {
        return {
          form: {
            ...state.form,
            checkedAttachedFileIds: checked ? state.form.attachedFiles.map((f) => f.id) : [],
          },
        }
      } else if (type === 'mealListData') {
        return {
          form: {
            ...state.form,
            checkedMealFeeIds: checked ? state.form.mealFeeDetails.map((m) => m.id) : [],
          },
        }
      } else if (type === 'keyMoneyList') {
        return {
          form: {
            ...state.form,
            checkedKeyMoneyIds: checked ? state.form.keyMoneyDetails.map((m) => m.id) : [],
          },
        }
      }
      return state
    }),

  getPriceTotal: () => {
    const { details } = get().form
    return details.reduce((sum, item) => {
      const amount = Number(item.unitPrice)
      return sum + (isNaN(amount) ? 0 : amount)
    }, 0)
  },

  getSupplyTotal: () => {
    const { details } = get().form
    return details.reduce((sum, item) => {
      const amount = Number(item.supplyPrice)
      return sum + (isNaN(amount) ? 0 : amount)
    }, 0)
  },

  getVatTotal: () => {
    const { details } = get().form
    return details.reduce((sum, item) => sum + (Number(item.vat) || 0), 0)
  },

  getTotalCount: () => {
    const { details } = get().form
    return details.reduce((sum, item) => sum + (Number(item.total) || 0), 0)
  },

  getPersonTotal: () => {
    const { keyMoneyDetails } = get().form
    return keyMoneyDetails.reduce((sum, item) => {
      const amount = item.personnelCount
      return sum + (isNaN(amount) ? 0 : amount)
    }, 0)
  },

  getAmountTotal: () => {
    const { keyMoneyDetails } = get().form
    return keyMoneyDetails.reduce((sum, item) => {
      const amount = Number(item.amount)
      return sum + (isNaN(amount) ? 0 : amount)
    }, 0)
  },

  getMealTotal: () => {
    const { mealFeeDetails } = get().form
    return mealFeeDetails.reduce((sum, item) => {
      const amount = Number(item.breakfastCount) + Number(item.lunchCount)
      return sum + (isNaN(amount) ? 0 : amount)
    }, 0)
  },

  getMealPriceTotal: () => {
    const { mealFeeDetails } = get().form
    const total = mealFeeDetails.reduce((sum, item) => {
      const amount = Number(item.unitPrice)
      return sum + (isNaN(amount) ? 0 : amount)
    }, 0)

    return Math.floor(total) // 소수점 버림
  },
  getMealTotalCount: () => {
    const { mealFeeDetails } = get().form
    return mealFeeDetails.reduce((sum, item) => {
      const amount = Number(item.amount)
      return sum + (isNaN(amount) ? 0 : amount)
    }, 0)
  },

  removeCheckedItems: (type) =>
    set((state) => {
      if (type === 'costItem') {
        return {
          form: {
            ...state.form,
            details: state.form.details.filter((m) => !state.form.checkedCostIds.includes(m.id)),
            checkedCostIds: [],
          },
        }
      } else if (type === 'attachedFile') {
        return {
          form: {
            ...state.form,
            attachedFiles: state.form.attachedFiles.filter(
              (f) => !state.form.checkedAttachedFileIds.includes(f.id),
            ),
            checkedAttachedFileIds: [],
          },
        }
      } else if (type === 'mealListData') {
        return {
          form: {
            ...state.form,
            mealFeeDetails: state.form.mealFeeDetails.filter(
              (m) => !state.form.checkedMealFeeIds.includes(m.id),
            ),
            checkedMealFeeIds: [],
          },
        }
      } else if (type === 'keyMoneyList') {
        return {
          form: {
            ...state.form,
            keyMoneyDetails: state.form.keyMoneyDetails.filter(
              (m) => !state.form.checkedKeyMoneyIds.includes(m.id),
            ),
            checkedKeyMoneyIds: [],
          },
        }
      }
      return state
    }),

  newCostData: () => {
    const form = get().form

    const paymentDateStr = getTodayDateString(form.paymentDate)

    return {
      siteId: form.siteId,
      siteProcessId: form.siteProcessId,
      outsourcingCompanyId: form.outsourcingCompanyId === -2 ? null : form.outsourcingCompanyId,
      itemType: form.itemType,
      itemTypeDescription: form.itemTypeDescription,
      paymentDate:
        paymentDateStr !== form.initialDeliveryDateAt ? paymentDateStr : form.initialDeliveryDateAt,
      outsourcingCompanyInfo: form.outsourcingCompanyInfo,
      memo: form.memo,
      details: form.details,
      keyMoneyDetails: form.keyMoneyDetails,
      mealFeeDetails: form.mealFeeDetails,
      files: form.attachedFiles.flatMap((f) =>
        f.files.length === 0
          ? [
              {
                id: f.id || Date.now(),
                memo: f.memo,
                fileUrl: '',
                originalFileName: '',
              },
            ]
          : f.files.map((fileObj) => ({
              id: f.id || Date.now(),
              memo: f.memo,
              fileUrl: fileObj.fileUrl,
              originalFileName: fileObj.name || fileObj.originalFileName,
            })),
      ),
      changeHistories: form.editedHistories ?? [],
      initialDeliveryDateAt: undefined,
    }
  },
}))
