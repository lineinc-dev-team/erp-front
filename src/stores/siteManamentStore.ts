/* eslint-disable @typescript-eslint/no-unused-vars */

import { SiteManagementSearchState, SiteManamentStore } from '@/types/siteManagement'
import { create } from 'zustand'

export const useSiteManamentSearchStore = create<{ search: SiteManagementSearchState }>((set) => ({
  search: {
    searchTrigger: 0,
    siteId: 0,
    siteName: '',
    siteProcessId: 0,
    siteProcessName: '',
    startYearMonth: null,
    endYearMonth: null,
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
          searchTrigger: 0,
          siteId: 0,
          siteName: '',
          siteProcessId: 0,
          siteProcessName: '',
          startYearMonth: null,
          endYearMonth: null,
          arraySort: '최신순',
          currentPage: 1,
          pageCount: '20',
        },
      })),
  },
}))

export const useSiteManamentFormStore = create<SiteManamentStore>((set, get) => ({
  form: {
    yearMonth: null,
    siteId: 0,
    siteName: '',
    siteProcessId: 0,
    siteProcessName: '',
    employeeSalary: 0,
    employeeSalaryMemo: '',
    regularRetirementPension: 0,
    regularRetirementPensionMemo: '',
    retirementDeduction: 0,
    retirementDeductionMemo: '',
    majorInsuranceRegular: 0,
    majorInsuranceRegularMemo: '',
    majorInsuranceDaily: 0,
    majorInsuranceDailyMemo: '',
    contractGuaranteeFee: 0,
    contractGuaranteeFeeMemo: '',
    equipmentGuaranteeFee: 0,
    equipmentGuaranteeFeeMemo: '',
    nationalTaxPayment: 0,
    nationalTaxPaymentMemo: '',
    headquartersManagementCost: 0,
    headquartersManagementCostMemo: '',

    changeHistories: [],
    editedHistories: [],
  },

  reset: () =>
    set(() => ({
      form: {
        yearMonth: null,
        siteId: 0,
        siteName: '',
        siteProcessId: 0,
        siteProcessName: '',
        employeeSalary: 0,
        employeeSalaryMemo: '',
        regularRetirementPension: 0,
        regularRetirementPensionMemo: '',
        retirementDeduction: 0,
        retirementDeductionMemo: '',
        majorInsuranceRegular: 0,
        majorInsuranceRegularMemo: '',
        majorInsuranceDaily: 0,
        majorInsuranceDailyMemo: '',
        contractGuaranteeFee: 0,
        contractGuaranteeFeeMemo: '',
        equipmentGuaranteeFee: 0,
        equipmentGuaranteeFeeMemo: '',
        nationalTaxPayment: 0,
        nationalTaxPaymentMemo: '',
        headquartersManagementCost: 0,
        headquartersManagementCostMemo: '',

        changeHistories: [],
        editedHistories: [],
      },
    })),

  setField: (field, value) =>
    set((state) => ({
      form: {
        ...state.form,
        [field]: value,
      },
    })),

  //   updateItemField: (type, id, field, value) =>
  //     set((state) => {
  //       if (type === 'siteCost') {
  //         return {
  //           form: {
  //             ...state.form,
  //             headManagers: state.form.headManagers.map((m) =>
  //               m.id === id ? { ...m, [field]: value } : m,
  //             ),
  //           },
  //         }
  //       }
  //     }),

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

  // 신규 등록용 payload
  newSiteManamentSummary: () => {
    const form = get().form
    return {
      yearMonth: form.yearMonth,
      siteId: form.siteId || 0,
      siteName: form.siteName || '',
      siteProcessId: form.siteProcessId || 0,
      siteProcessName: form.siteProcessName || '',
      employeeSalary: form.employeeSalary,
      employeeSalaryMemo: form.employeeSalaryMemo,
      regularRetirementPension: form.regularRetirementPension,
      regularRetirementPensionMemo: form.regularRetirementPensionMemo,
      retirementDeduction: form.retirementDeduction || 0,
      retirementDeductionMemo: form.retirementDeductionMemo || '',
      majorInsuranceRegular: form.majorInsuranceRegular || 0,
      majorInsuranceRegularMemo: form.majorInsuranceRegularMemo || '',
      majorInsuranceDaily: form.majorInsuranceDaily || 0,
      majorInsuranceDailyMemo: form.majorInsuranceDailyMemo || '',
      contractGuaranteeFee: form.contractGuaranteeFee || 0,
      contractGuaranteeFeeMemo: form.contractGuaranteeFeeMemo || '',
      equipmentGuaranteeFee: form.equipmentGuaranteeFee || 0,
      equipmentGuaranteeFeeMemo: form.equipmentGuaranteeFeeMemo || '',
      nationalTaxPayment: form.nationalTaxPayment || 0,
      nationalTaxPaymentMemo: form.nationalTaxPaymentMemo || '',
      headquartersManagementCost: form.headquartersManagementCost || 0,
      headquartersManagementCostMemo: form.headquartersManagementCostMemo || '',

      changeHistories: form.changeHistories ?? [],
    }
  },
}))
