import {
  mealFeeDetailEquipmentsDetail,
  mealFeeDetailOutsourcingContractsDetail,
} from './../types/managementCost.d'
import { create } from 'zustand'
import {
  AttachedFile,
  CostFormStore,
  CostItem,
  CostSearchState,
  KeyMoneyDetail,
  MealFeeDetail,
  mealFeeDetailDirectContractsDetail,
  mealFeeDetailOutsourcingsDetail,
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
    siteName: '',
    siteProcessId: 0,
    siteProcessName: '',
    outsourcingCompanyName: '',
    outsourcingCompanyId: -1,
    isDeductible: false,

    deductionCompanyId: 0,
    deductionCompanyName: '',

    deductionCompanyContractId: 0,
    deductionCompanyContractName: '',

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

    mealFeeDetailDirectContracts: [],
    checkedMealFeeDetailDirectContractIds: [],

    mealFeeDetailOutsourcings: [],
    checkedMealFeeDetailOutsourcingIds: [],

    mealFeeDetailEquipments: [],
    checkedMealFeeDetailEquipments: [],

    mealFeeDetailOutsourcingContracts: [],
    checkedMealFeeDetailOutsourcingContracts: [],

    attachedFiles: [],
    checkedAttachedFileIds: [],

    editedHistories: [],
    changeHistories: [],
  },

  reset: () =>
    set(() => ({
      form: {
        siteId: 0,
        siteName: '',
        siteProcessId: 0,
        siteProcessName: '',
        outsourcingCompanyName: '',
        outsourcingCompanyId: -1,
        isDeductible: false,

        deductionCompanyId: 0,
        deductionCompanyName: '',

        deductionCompanyContractId: 0,
        deductionCompanyContractName: '',

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

        mealFeeDetailDirectContracts: [],
        checkedMealFeeDetailDirectContractIds: [],

        mealFeeDetailOutsourcings: [],
        checkedMealFeeDetailOutsourcingIds: [],

        mealFeeDetailEquipments: [],
        checkedMealFeeDetailEquipments: [],

        mealFeeDetailOutsourcingContracts: [],
        checkedMealFeeDetailOutsourcingContracts: [],

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
          quantity: 0,
          unitPrice: 0,
          supplyPrice: 0,
          vat: 0,
          total: 0,
          memo: '',
        }
        return { form: { ...state.form, details: [...state.form.details, newItem] } }
      } else if (type === 'attachedFile') {
        const newFile: AttachedFile = {
          id,
          name: '',
          memo: '',
          files: [],
        }
        return { form: { ...state.form, attachedFiles: [...state.form.attachedFiles, newFile] } }
      } else if (type === 'mealListData') {
        const newMeal: MealFeeDetail = {
          id: Date.now(),
          laborId: null,
          name: '',
          breakfastCount: 0,
          lunchCount: 0,
          dinnerCount: 0,
          unitPrice: 0,
          amount: 0,
          memo: '',
        }
        return { form: { ...state.form, mealFeeDetails: [...state.form.mealFeeDetails, newMeal] } }
      } else if (type === 'mealFeeDetailDirectContracts') {
        const newMeal: mealFeeDetailDirectContractsDetail = {
          id: Date.now(),
          laborId: null,
          breakfastCount: 0,
          lunchCount: 0,
          dinnerCount: 0,
          unitPrice: 0,
          amount: 0,
          memo: '',
        }
        return {
          form: {
            ...state.form,
            mealFeeDetailDirectContracts: [...state.form.mealFeeDetailDirectContracts, newMeal],
          },
        }
      } else if (type === 'mealFeeDetailOutsourcings') {
        const newMeal: mealFeeDetailOutsourcingsDetail = {
          id: Date.now(),
          outsourcingCompanyId: 0,
          laborId: null,
          breakfastCount: 0,
          lunchCount: 0,
          dinnerCount: 0,
          unitPrice: 0,
          amount: 0,
          memo: '',
        }
        return {
          form: {
            ...state.form,
            mealFeeDetailOutsourcings: [...state.form.mealFeeDetailOutsourcings, newMeal],
          },
        }
      } else if (type === 'mealFeeDetailEquipments') {
        const newMeal: mealFeeDetailEquipmentsDetail = {
          id: Date.now(),
          outsourcingCompanyId: 0,
          outsourcingCompanyContractDriverId: 0,
          breakfastCount: 0,
          lunchCount: 0,
          dinnerCount: 0,
          unitPrice: 0,
          amount: 0,
          memo: '',
        }
        return {
          form: {
            ...state.form,
            mealFeeDetailEquipments: [...state.form.mealFeeDetailEquipments, newMeal],
          },
        }
      } else if (type === 'mealFeeDetailOutsourcingContracts') {
        const newMeal: mealFeeDetailOutsourcingContractsDetail = {
          id: Date.now(),
          outsourcingCompanyId: 0,
          laborId: null,
          breakfastCount: 0,
          lunchCount: 0,
          dinnerCount: 0,
          unitPrice: 0,
          amount: 0,
          memo: '',
        }
        return {
          form: {
            ...state.form,
            mealFeeDetailOutsourcingContracts: [
              ...state.form.mealFeeDetailOutsourcingContracts,
              newMeal,
            ],
          },
        }
      } else if (type === 'keyMoneyList') {
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
      } else if (type === 'mealFeeDetailDirectContracts') {
        return {
          form: {
            ...state.form,
            mealFeeDetailDirectContracts: state.form.mealFeeDetailDirectContracts.map((item) =>
              item.id === id ? { ...item, [field]: value } : item,
            ),
          },
        }
      } else if (type === 'mealFeeDetailOutsourcings') {
        return {
          form: {
            ...state.form,
            mealFeeDetailOutsourcings: state.form.mealFeeDetailOutsourcings.map((item) =>
              item.id === id ? { ...item, [field]: value } : item,
            ),
          },
        }
      } else if (type === 'mealFeeDetailEquipments') {
        return {
          form: {
            ...state.form,
            mealFeeDetailEquipments: state.form.mealFeeDetailEquipments.map((item) =>
              item.id === id ? { ...item, [field]: value } : item,
            ),
          },
        }
      } else if (type === 'mealFeeDetailOutsourcingContracts') {
        return {
          form: {
            ...state.form,
            mealFeeDetailOutsourcingContracts: state.form.mealFeeDetailOutsourcingContracts.map(
              (item) => (item.id === id ? { ...item, [field]: value } : item),
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
      } else if (type === 'attachedFile') {
        return {
          form: {
            ...state.form,
            checkedAttachedFileIds: checked
              ? [...state.form.checkedAttachedFileIds, id]
              : state.form.checkedAttachedFileIds.filter((cid) => cid !== id),
          },
        }
      } else if (type === 'mealListData') {
        return {
          form: {
            ...state.form,
            checkedMealFeeIds: checked
              ? [...state.form.checkedMealFeeIds, id]
              : state.form.checkedMealFeeIds.filter((cid) => cid !== id),
          },
        }
      } else if (type === 'mealFeeDetailDirectContracts') {
        return {
          form: {
            ...state.form,
            checkedMealFeeDetailDirectContractIds: checked
              ? [...state.form.checkedMealFeeDetailDirectContractIds, id]
              : state.form.checkedMealFeeDetailDirectContractIds.filter((cid) => cid !== id),
          },
        }
      } else if (type === 'mealFeeDetailOutsourcings') {
        return {
          form: {
            ...state.form,
            checkedMealFeeDetailOutsourcingIds: checked
              ? [...state.form.checkedMealFeeDetailOutsourcingIds, id]
              : state.form.checkedMealFeeDetailOutsourcingIds.filter((cid) => cid !== id),
          },
        }
      } else if (type === 'mealFeeDetailEquipments') {
        return {
          form: {
            ...state.form,
            checkedMealFeeDetailEquipments: checked
              ? [...state.form.checkedMealFeeDetailEquipments, id]
              : state.form.checkedMealFeeDetailEquipments.filter((cid) => cid !== id),
          },
        }
      } else if (type === 'mealFeeDetailOutsourcingContracts') {
        return {
          form: {
            ...state.form,
            checkedMealFeeDetailOutsourcingContracts: checked
              ? [...state.form.checkedMealFeeDetailOutsourcingContracts, id]
              : state.form.checkedMealFeeDetailOutsourcingContracts.filter((cid) => cid !== id),
          },
        }
      } else if (type === 'keyMoneyList') {
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
      } else if (type === 'mealFeeDetailDirectContracts') {
        return {
          form: {
            ...state.form,
            checkedMealFeeDetailDirectContractIds: checked
              ? state.form.mealFeeDetailDirectContracts.map((m) => m.id)
              : [],
          },
        }
      } else if (type === 'mealFeeDetailOutsourcings') {
        return {
          form: {
            ...state.form,
            checkedMealFeeDetailOutsourcingIds: checked
              ? state.form.mealFeeDetailOutsourcings.map((m) => m.id)
              : [],
          },
        }
      } else if (type === 'mealFeeDetailEquipments') {
        return {
          form: {
            ...state.form,
            checkedMealFeeDetailEquipments: checked
              ? state.form.mealFeeDetailEquipments.map((m) => m.id)
              : [],
          },
        }
      } else if (type === 'mealFeeDetailOutsourcingContracts') {
        return {
          form: {
            ...state.form,
            checkedMealFeeDetailOutsourcingContracts: checked
              ? state.form.mealFeeDetailOutsourcingContracts.map((m) => m.id)
              : [],
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

  getQuantityTotal: () => {
    const { details } = get().form
    return details.reduce((sum, item) => {
      const amount = Number(item.quantity)
      return sum + (isNaN(amount) ? 0 : amount)
    }, 0)
  },

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

  // 조식 , 중식 , 석식

  getBreakfastTotalCount: () => {
    const {
      mealFeeDetails,
      mealFeeDetailDirectContracts,
      mealFeeDetailOutsourcings,
      mealFeeDetailEquipments,
      mealFeeDetailOutsourcingContracts,
    } = get().form

    const allItems = [
      ...mealFeeDetails,
      ...mealFeeDetailDirectContracts,
      ...mealFeeDetailOutsourcings,
      ...mealFeeDetailEquipments,
      ...mealFeeDetailOutsourcingContracts,
    ]

    return allItems.reduce((sum, item) => {
      const count = Number(item.breakfastCount)
      return sum + (isNaN(count) ? 0 : count)
    }, 0)
  },

  getLunchTotalCount: () => {
    const form = get().form
    const allItems = [
      ...form.mealFeeDetails,
      ...form.mealFeeDetailDirectContracts,
      ...form.mealFeeDetailOutsourcings,
      ...form.mealFeeDetailEquipments,
      ...form.mealFeeDetailOutsourcingContracts,
    ]

    return allItems.reduce((sum, item) => {
      const count = Number(item.lunchCount)
      return sum + (isNaN(count) ? 0 : count)
    }, 0)
  },

  getDinnerTotalCount: () => {
    const form = get().form
    const allItems = [
      ...form.mealFeeDetails,
      ...form.mealFeeDetailDirectContracts,
      ...form.mealFeeDetailOutsourcings,
      ...form.mealFeeDetailEquipments,
      ...form.mealFeeDetailOutsourcingContracts,
    ]

    return allItems.reduce((sum, item) => {
      const count = Number(item.dinnerCount)
      return sum + (isNaN(count) ? 0 : count)
    }, 0)
  },

  // 계에대한 변수를 만들어서 다시 넣어야함
  getMealTotal: () => {
    const form = get().form

    const mealArrays = [
      form.mealFeeDetails,
      form.mealFeeDetailDirectContracts,
      form.mealFeeDetailOutsourcings,
      form.mealFeeDetailEquipments,
      form.mealFeeDetailOutsourcingContracts,
    ]

    return mealArrays.flat().reduce((sum, item) => {
      const amount =
        Number(item.breakfastCount) + Number(item.lunchCount) + Number(item.dinnerCount)
      return sum + (isNaN(amount) ? 0 : amount)
    }, 0)
  },

  getMealPriceTotal: () => {
    const form = get().form

    const mealArrays = [
      form.mealFeeDetails,
      form.mealFeeDetailDirectContracts,
      form.mealFeeDetailOutsourcings,
      form.mealFeeDetailEquipments,
      form.mealFeeDetailOutsourcingContracts,
    ]

    const total = mealArrays.flat().reduce((sum, item) => {
      const amount = Number(item.unitPrice)
      return sum + (isNaN(amount) ? 0 : amount)
    }, 0)

    return Math.floor(total) // 소수점 버림
  },
  getMealTotalCount: () => {
    const form = get().form

    const mealArrays = [
      form.mealFeeDetails,
      form.mealFeeDetailDirectContracts,
      form.mealFeeDetailOutsourcings,
      form.mealFeeDetailEquipments,
      form.mealFeeDetailOutsourcingContracts,
    ]

    return mealArrays.flat().reduce((sum, item) => {
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
      } else if (type === 'mealFeeDetailDirectContracts') {
        return {
          form: {
            ...state.form,
            mealFeeDetailDirectContracts: state.form.mealFeeDetailDirectContracts.filter(
              (m) => !state.form.checkedMealFeeDetailDirectContractIds.includes(m.id),
            ),
            checkedMealFeeDetailDirectContractIds: [],
          },
        }
      } else if (type === 'mealFeeDetailOutsourcings') {
        return {
          form: {
            ...state.form,
            mealFeeDetailOutsourcings: state.form.mealFeeDetailOutsourcings.filter(
              (m) => !state.form.checkedMealFeeDetailOutsourcingIds.includes(m.id),
            ),
            checkedMealFeeDetailOutsourcingIds: [],
          },
        }
      } else if (type === 'mealFeeDetailEquipments') {
        return {
          form: {
            ...state.form,
            mealFeeDetailEquipments: state.form.mealFeeDetailEquipments.filter(
              (m) => !state.form.checkedMealFeeDetailEquipments.includes(m.id),
            ),
            checkedMealFeeDetailEquipments: [],
          },
        }
      } else if (type === 'mealFeeDetailOutsourcingContracts') {
        return {
          form: {
            ...state.form,
            mealFeeDetailOutsourcingContracts: state.form.mealFeeDetailOutsourcingContracts.filter(
              (m) => !state.form.checkedMealFeeDetailOutsourcingContracts.includes(m.id),
            ),
            checkedMealFeeDetailOutsourcingContracts: [],
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
      outsourcingCompanyId: form.outsourcingCompanyId === -1 ? null : form.outsourcingCompanyId,
      deductionCompanyId: form.deductionCompanyId === 0 ? null : form.deductionCompanyId,
      deductionCompanyContractId:
        form.deductionCompanyContractId === 0 ? null : form.deductionCompanyContractId,
      itemType: form.itemType,
      itemTypeDescription: form.itemTypeDescription,
      paymentDate:
        paymentDateStr !== form.initialDeliveryDateAt ? paymentDateStr : form.initialDeliveryDateAt,
      outsourcingCompanyInfo: form.outsourcingCompanyInfo,
      memo: form.memo,
      details: form.details,
      keyMoneyDetails: form.keyMoneyDetails,

      mealFeeDetails: form.mealFeeDetails.map((detail: MealFeeDetail) => {
        const base = {
          id: detail.id,
          breakfastCount: detail.breakfastCount,
          lunchCount: detail.lunchCount,
          dinnerCount: detail.dinnerCount,
          unitPrice: detail.unitPrice,
          amount: detail.amount,
          memo: detail.memo,
        }

        if (detail.laborId !== null && detail.laborId !== 0 && detail.laborId !== -1) {
          return {
            ...base,
            name: '',
            laborId: detail.laborId, // laborId만 보냄
          }
        }

        return {
          ...base,
          laborId: detail.laborId,
          name: detail.name, // laborId가 0 또는 -1이면 name만 보냄
        }
      }),

      mealFeeDetailDirectContracts: form.mealFeeDetailDirectContracts.map(
        (detail: mealFeeDetailDirectContractsDetail) => {
          return {
            id: detail.id,
            laborId: detail.laborId,
            breakfastCount: detail.breakfastCount,
            lunchCount: detail.lunchCount,
            dinnerCount: detail.dinnerCount,
            unitPrice: detail.unitPrice,
            amount: detail.amount,
            memo: detail.memo,
          }
        },
      ),

      mealFeeDetailOutsourcings: form.mealFeeDetailOutsourcings.map(
        (detail: mealFeeDetailOutsourcingsDetail) => {
          return {
            id: detail.id,
            outsourcingCompanyId: detail.outsourcingCompanyId,
            laborId: detail.laborId,
            breakfastCount: detail.breakfastCount,
            lunchCount: detail.lunchCount,
            dinnerCount: detail.dinnerCount,
            unitPrice: detail.unitPrice,
            amount: detail.amount,
            memo: detail.memo,
          }
        },
      ),

      mealFeeDetailEquipments: form.mealFeeDetailEquipments.map((item) => {
        return {
          id: item.id,
          outsourcingCompanyId: item.outsourcingCompanyId,
          outsourcingCompanyContractDriverId: item.outsourcingCompanyContractDriverId,
          breakfastCount: item.breakfastCount,
          lunchCount: item.lunchCount,
          dinnerCount: item.dinnerCount,
          unitPrice: item.unitPrice,
          amount: item.amount,
          memo: item.memo,
        }
      }),

      mealFeeDetailOutsourcingContracts: form.mealFeeDetailOutsourcingContracts.map(
        (detail: mealFeeDetailOutsourcingContractsDetail) => {
          return {
            id: detail.id,
            outsourcingCompanyId: detail.outsourcingCompanyId,
            laborId: detail.laborId,
            breakfastCount: detail.breakfastCount,
            lunchCount: detail.lunchCount,
            dinnerCount: detail.dinnerCount,
            unitPrice: detail.unitPrice,
            amount: detail.amount,
            memo: detail.memo,
          }
        },
      ),

      files: form.attachedFiles.flatMap((f) =>
        f.files.length === 0
          ? [
              {
                id: f.id || Date.now(),
                name: f.name,
                memo: f.memo,
                fileUrl: '',
                originalFileName: '',
              },
            ]
          : f.files.map((fileObj) => ({
              id: f.id || Date.now(),
              name: f.name,
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
