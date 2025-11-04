import {
  fuelDetailItem,
  FuelFormStore,
  FuelSearchState,
  SubEquipmentByFuleItems,
} from '@/types/fuelAggregation'
import { getTodayDateString } from '@/utils/formatters'
import { create } from 'zustand'

export const useFuelSearchStore = create<{ search: FuelSearchState }>((set) => ({
  search: {
    searchTrigger: 0,
    siteId: 0,
    siteName: '',
    processName: '',
    outsourcingCompanyName: '',
    outsourcingCompanyId: 0,
    fuelTypes: [],
    vehicleNumber: '',
    dateStartDate: null,
    dateEndDate: null,
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
          siteName: '',
          processName: '',
          siteNameId: 0,
          outsourcingCompanyName: '',
          outsourcingCompanyId: 0,
          fuelTypes: [],
          vehicleNumber: '',
          dateStartDate: null,
          dateEndDate: null,
          arraySort: '최신순',
          currentPage: 1,
          pageCount: '20',
          searchTrigger: 0,
        },
      })),
  },
}))

export const useFuelFormStore = create<FuelFormStore>((set, get) => ({
  form: {
    siteId: 0,
    siteName: '선택',
    siteProcessId: 0,
    siteProcessName: '선택',
    date: null,
    initialDateAt: '',
    weather: 'BASE',
    outsourcingCompanyId: 0,
    outsourcingCompanyName: '',

    gasolinePrice: 0,
    dieselPrice: 0,
    ureaPrice: 0,
    fuelInfos: [],
    checkedFuelItemIds: [],

    changeHistories: [],
  },

  reset: () =>
    set(() => ({
      form: {
        siteId: 0,
        siteName: '선택',
        siteProcessId: 0,
        siteProcessName: '선택',
        date: null,
        initialDateAt: '',
        weather: 'BASE',
        outsourcingCompanyId: 0,
        outsourcingCompanyName: '',
        gasolinePrice: 0,
        dieselPrice: 0,
        ureaPrice: 0,
        fuelInfos: [],
        checkedFuelItemIds: [],

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
      if (typeName === 'FuelInfo') {
        const newItem: fuelDetailItem = {
          checkId: Date.now(),
          id: null,
          outsourcingCompanyId: 0,
          driverId: 0,
          categoryType: 'EQUIPMENT',
          specificationName: '',
          equipmentId: 0,
          fuelType: '',
          fuelAmount: 0,
          files: [],
          memo: '',
        }
        return {
          form: {
            ...state.form,
            fuelInfos: [...state.form.fuelInfos, newItem],
          },
        }
      }
      return state
    }),

  updateItemField: (typeName, id, field, value) =>
    set((state) => {
      if (typeName === 'FuelInfo') {
        return {
          form: {
            ...state.form,
            fuelInfos: state.form.fuelInfos.map((item) =>
              item.checkId === id ? { ...item, [field]: value } : item,
            ),
          },
        }
      }
      return state
    }),

  toggleCheckItem: (typeName, id, checked) =>
    set((state) => {
      if (typeName === 'FuelInfo') {
        return {
          form: {
            ...state.form,
            checkedFuelItemIds: checked
              ? [...state.form.checkedFuelItemIds, id]
              : state.form.checkedFuelItemIds.filter((cid) => cid !== id),
          },
        }
      }
      return state // undefined 대신 기존 상태 그래도 반환
    }),

  toggleCheckAllItems: (typeName, checked) =>
    set((state) => {
      if (typeName === 'FuelInfo') {
        return {
          form: {
            ...state.form,
            checkedFuelItemIds: checked ? state.form.fuelInfos.map((i) => i.checkId) : [],
          },
        }
      }
      return state
    }),

  removeCheckedItems: (typeName) =>
    set((state) => {
      if (typeName === 'FuelInfo') {
        return {
          form: {
            ...state.form,
            fuelInfos: state.form.fuelInfos.filter(
              (item) => !state.form.checkedFuelItemIds.includes(item.checkId),
            ),
            checkedFuelItemIds: [],
          },
        }
      }
      return state
    }),

  updateContractDetailField: (
    managerId: number,
    itemId: number,
    field: keyof SubEquipmentByFuleItems,
    value: string | number,
  ) =>
    set((state) => ({
      form: {
        ...state.form,
        fuelInfos: state.form.fuelInfos.map((manager) =>
          manager.checkId === managerId
            ? {
                ...manager,
                subEquipments:
                  manager.subEquipments &&
                  manager.subEquipments.map((detail) =>
                    detail.checkId === itemId ? { ...detail, [field]: value } : detail,
                  ),
              }
            : manager,
        ),
      },
    })),

  setFuelRadioBtn: (id: number, categoryType: 'EQUIPMENT' | 'CONSTRUCTION') =>
    set((state) => ({
      form: {
        ...state.form,
        fuelInfos: state.form.fuelInfos.map((m) => (m.checkId === id ? { ...m, categoryType } : m)),
      },
    })),

  newFuelData: () => {
    const form = get().form
    const { initialDateAt, ...restForm } = form // initialDateAt 제외
    const dateStr = getTodayDateString(form.date)

    return {
      ...restForm, // initialDateAt 제외한 나머지
      date: dateStr !== initialDateAt ? dateStr : initialDateAt,
      changeHistories: form.editedHistories ?? [],
      fuelInfos: form.fuelInfos.map((item) => {
        const file = item.files[0]

        return {
          id: item.id,
          outsourcingCompanyId: item.outsourcingCompanyId,
          driverId: null,
          equipmentId: item.equipmentId,
          fuelType: item.fuelType,
          categoryType: item.categoryType,
          fuelAmount: item.fuelAmount,
          fileUrl: file?.fileUrl || null,
          originalFileName: file?.originalFileName || null,
          memo: item.memo,
          subEquipments: item.subEquipments,
        }
      }),
    }
  },
}))
