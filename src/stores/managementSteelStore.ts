import {
  AttachedFile,
  MaterialItem,
  SteelFormStore,
  SteelSearchState,
} from '@/types/managementSteel'
import { create } from 'zustand'

export const useSteelSearchStore = create<{ search: SteelSearchState }>((set) => ({
  search: {
    searchTrigger: 0,
    siteId: 0,
    siteName: '',
    siteProcessName: '',
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
          siteProcessName: '',
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
    siteName: '',
    siteProcessId: 0,
    siteProcessName: '',
    type: 'INCOMING',
    details: [],
    checkedMaterialItemIds: [],

    attachedFiles: [],
    checkedAttachedFileIds: [],

    changeHistories: [],
  },

  isSaved: false, //

  setSaved: (saved: boolean) =>
    set((state) => ({
      ...state,
      isSaved: saved,
    })),

  reset: () =>
    set((state) => ({
      form: {
        siteId: 0,
        siteName: '',
        siteProcessId: 0,
        siteProcessName: '',
        type: state.form.type,
        details: [],
        checkedMaterialItemIds: [],
        attachedFiles: [],
        checkedAttachedFileIds: [],

        changeHistories: [],
      },
      isSaved: false,
    })),

  resetDetailData: () =>
    set((state) => ({
      form: {
        ...state.form,
        details: [],
      },
    })),

  setField: (field, value) =>
    set((state) => ({
      form: { ...state.form, [field]: value },
    })),

  addItem: (typeName) =>
    set((state) => {
      if (typeName === 'MaterialItem') {
        const newItem: MaterialItem = {
          checkId: Date.now(),
          id: null,
          outsourcingCompanyId: 1,
          name: 'H Bearn',
          specification: '',
          weight: 0,
          count: 0,
          totalWeight: 0,
          unitPrice: 0,
          isModifyType: true,
          amount: 0,
          category: '선택',
          files: [],
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
          id: Date.now(),
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
            details: state.form.details.map((item) => {
              if (item.checkId !== id) return item

              // 변경된 값 적용
              const updatedItem = { ...item, [field]: value }

              // weight, count, unitPrice 변경 시 totalWeight, amount 자동 계산
              if (['weight', 'count', 'unitPrice'].includes(field)) {
                // 고철 등 총 무게 직접 입력 타입이면 weight*count 계산 건너뛰기
                const isDirectTotalWeight =
                  field === 'unitPrice' &&
                  updatedItem.totalWeight &&
                  !updatedItem.weight &&
                  !updatedItem.count

                if (!isDirectTotalWeight) {
                  const weight = Number(field === 'weight' ? value : updatedItem.weight) || 0
                  const count = Number(field === 'count' ? value : updatedItem.count) || 0
                  const unitPrice =
                    Number(field === 'unitPrice' ? value : updatedItem.unitPrice) || 0

                  updatedItem.totalWeight = Number((weight * count).toFixed(4))
                  updatedItem.amount = Number((updatedItem.totalWeight * unitPrice).toFixed(0))
                } else {
                  // 총 무게 직접 입력 → 단가 변경 시 amount만 계산
                  const totalWeight = Number(updatedItem.totalWeight || '0')
                  const unitPrice = Number(updatedItem.unitPrice || '0')
                  updatedItem.amount = Math.round(totalWeight * unitPrice)
                }
              }

              return updatedItem
            }),
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

  // 무게합산
  getWeightAmount: () => {
    const { details } = get().form
    return details.reduce((sum, item) => {
      const weight = Number(item.weight)
      return sum + (isNaN(weight) ? 0 : weight)
    }, 0)
  },

  // 본 합산
  getCountAmount: () => {
    const { details } = get().form
    return details.reduce((sum, item) => {
      const count = Number(item.count)
      return sum + (isNaN(count) ? 0 : count)
    }, 0)
  },

  // 총 무게 합산
  getTotalWeightAmount: () => {
    const { details } = get().form
    return details.reduce((sum, item) => {
      const totalWeight = Number(item.totalWeight)
      return sum + (isNaN(totalWeight) ? 0 : totalWeight)
    }, 0)
  },

  // 단가 합산 (단순 합인지, 평균 내야 하는지 요구 확인 필요)
  getUnitPriceAmount: () => {
    const { details } = get().form
    return details.reduce((sum, item) => {
      const unitPrice = Number(item.unitPrice)
      return sum + (isNaN(unitPrice) ? 0 : unitPrice)
    }, 0)
  },

  // 금액 합산
  getAmountAmount: () => {
    const { details } = get().form
    return details.reduce((sum, item) => {
      const amount = Number(item.amount)
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
            checkedMaterialItemIds: checked ? state.form.details.map((m) => m.checkId) : [],
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
              (item) => !state.form.checkedMaterialItemIds.includes(item.checkId),
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

    return {
      ...form,
      // outsourcingCompanyId: form.outsourcingCompanyId === 0 ? undefined : form.outsourcingCompanyId,

      details: form.details.map((item) => {
        const file = item.files?.[0]
        return {
          id: item.id,
          outsourcingCompanyId: item.outsourcingCompanyId,
          type: form.type,
          name: item.name,
          specification: item.specification,
          weight: item.weight,
          count: item.count,
          totalWeight: item.totalWeight,
          unitPrice: item.unitPrice,
          amount: item.amount,
          category: item.category === '선택' ? null : item.category,
          fileUrl: file?.fileUrl || null,
          originalFileName: file?.originalFileName || null,
          memo: item.memo,
        }
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
