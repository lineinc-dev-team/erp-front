/* eslint-disable @typescript-eslint/no-unused-vars */

import {
  SiteManagementSearchState,
  SiteManamentFormState,
  SiteManamentStore,
} from '@/types/siteManagement'
import { create } from 'zustand'

export const useSiteManamentSearchStore = create<{ search: SiteManagementSearchState }>((set) => ({
  search: {
    searchTrigger: 0,
    siteId: 0,
    siteName: '',
    siteProcessId: 0,
    siteProcessName: '',
    startYearMonth: '',
    endYearMonth: '',
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
          startYearMonth: '',
          endYearMonth: '',
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
    employeeSalarySupplyPrice: 0,
    employeeSalaryVat: 0,
    employeeSalaryDeduction: 0,
    employeeSalaryMemo: '',

    regularRetirementPension: 0,
    regularRetirementPensionSupplyPrice: 0,
    regularRetirementPensionVat: 0,
    regularRetirementPensionDeduction: 0,
    regularRetirementPensionMemo: '',

    retirementDeduction: 0,
    retirementDeductionSupplyPrice: 0,
    retirementDeductionVat: 0,
    retirementDeductionDeduction: 0,
    retirementDeductionMemo: '',

    majorInsuranceRegular: 0,
    majorInsuranceRegularSupplyPrice: 0,
    majorInsuranceRegularVat: 0,
    majorInsuranceRegularDeduction: 0,
    majorInsuranceRegularMemo: '',

    majorInsuranceDaily: 0,
    majorInsuranceDailySupplyPrice: 0,
    majorInsuranceDailyVat: 0,
    majorInsuranceDailyDeduction: 0,
    majorInsuranceDailyMemo: '',

    contractGuaranteeFee: 0,
    contractGuaranteeFeeSupplyPrice: 0,
    contractGuaranteeFeeVat: 0,
    contractGuaranteeFeeDeduction: 0,

    contractGuaranteeFeeMemo: '',
    equipmentGuaranteeFee: 0,
    equipmentGuaranteeFeeSupplyPrice: 0,
    equipmentGuaranteeFeeVat: 0,
    equipmentGuaranteeFeeDeduction: 0,

    equipmentGuaranteeFeeMemo: '',
    nationalTaxPayment: 0,
    nationalTaxPaymentSupplyPrice: 0,
    nationalTaxPaymentVat: 0,
    nationalTaxPaymentDeduction: 0,
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
        employeeSalarySupplyPrice: 0,
        employeeSalaryVat: 0,
        employeeSalaryDeduction: 0,
        employeeSalaryMemo: '',

        regularRetirementPension: 0,
        regularRetirementPensionSupplyPrice: 0,
        regularRetirementPensionVat: 0,
        regularRetirementPensionDeduction: 0,
        regularRetirementPensionMemo: '',

        retirementDeduction: 0,
        retirementDeductionSupplyPrice: 0,
        retirementDeductionVat: 0,
        retirementDeductionDeduction: 0,
        retirementDeductionMemo: '',

        majorInsuranceRegular: 0,
        majorInsuranceRegularSupplyPrice: 0,
        majorInsuranceRegularVat: 0,
        majorInsuranceRegularDeduction: 0,
        majorInsuranceRegularMemo: '',

        majorInsuranceDaily: 0,
        majorInsuranceDailySupplyPrice: 0,
        majorInsuranceDailyVat: 0,
        majorInsuranceDailyDeduction: 0,
        majorInsuranceDailyMemo: '',

        contractGuaranteeFee: 0,
        contractGuaranteeFeeSupplyPrice: 0,
        contractGuaranteeFeeVat: 0,
        contractGuaranteeFeeDeduction: 0,

        contractGuaranteeFeeMemo: '',
        equipmentGuaranteeFee: 0,
        equipmentGuaranteeFeeSupplyPrice: 0,
        equipmentGuaranteeFeeVat: 0,
        equipmentGuaranteeFeeDeduction: 0,

        equipmentGuaranteeFeeMemo: '',
        nationalTaxPayment: 0,
        nationalTaxPaymentSupplyPrice: 0,
        nationalTaxPaymentVat: 0,
        nationalTaxPaymentDeduction: 0,
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

  AutomaticAmount: (prefix: string) => {
    const form = get().form

    const supplyPrice = Number(form[`${prefix}SupplyPrice` as keyof SiteManamentFormState] ?? 0)
    const vat = Number(form[`${prefix}Vat` as keyof SiteManamentFormState] ?? 0)
    const deduction = Number(form[`${prefix}Deduction` as keyof SiteManamentFormState] ?? 0)

    const result = supplyPrice + vat - deduction

    set((state) => ({
      form: {
        ...state.form,
        [prefix]: result,
      },
    }))

    return result
  },

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

      employeeSalarySupplyPrice: form.employeeSalarySupplyPrice || 0,
      employeeSalaryVat: form.employeeSalaryVat || 0,
      employeeSalaryDeduction: form.employeeSalaryDeduction || 0,
      employeeSalary: form.employeeSalary || 0,
      employeeSalaryMemo: form.employeeSalaryMemo || '',

      regularRetirementPensionSupplyPrice: form.regularRetirementPensionSupplyPrice || 0,
      regularRetirementPensionVat: form.regularRetirementPensionVat || 0,
      regularRetirementPensionDeduction: form.regularRetirementPensionDeduction || 0,
      regularRetirementPension: form.regularRetirementPension || 0,
      regularRetirementPensionMemo: form.regularRetirementPensionMemo || '',

      retirementDeductionSupplyPrice: form.retirementDeductionSupplyPrice || 0,
      retirementDeductionVat: form.retirementDeductionVat || 0,
      retirementDeductionDeduction: form.retirementDeductionDeduction || 0,
      retirementDeduction: form.retirementDeduction || 0,
      retirementDeductionMemo: form.retirementDeductionMemo || '',

      majorInsuranceRegularSupplyPrice: form.majorInsuranceRegularSupplyPrice || 0,
      majorInsuranceRegularVat: form.majorInsuranceRegularVat || 0,
      majorInsuranceRegularDeduction: form.majorInsuranceRegularDeduction || 0,
      majorInsuranceRegular: form.majorInsuranceRegular || 0,
      majorInsuranceRegularMemo: form.majorInsuranceRegularMemo || '',

      majorInsuranceDailySupplyPrice: form.majorInsuranceDailySupplyPrice || 0,
      majorInsuranceDailyVat: form.majorInsuranceDailyVat || 0,
      majorInsuranceDailyDeduction: form.majorInsuranceDailyDeduction || 0,
      majorInsuranceDaily: form.majorInsuranceDaily || 0,
      majorInsuranceDailyMemo: form.majorInsuranceDailyMemo || '',

      contractGuaranteeFeeSupplyPrice: form.contractGuaranteeFeeSupplyPrice || 0,
      contractGuaranteeFeeVat: form.contractGuaranteeFeeVat || 0,
      contractGuaranteeFeeDeduction: form.contractGuaranteeFeeDeduction || 0,
      contractGuaranteeFee: form.contractGuaranteeFee || 0,
      contractGuaranteeFeeMemo: form.contractGuaranteeFeeMemo || '',

      equipmentGuaranteeFeeSupplyPrice: form.equipmentGuaranteeFeeSupplyPrice || 0,
      equipmentGuaranteeFeeVat: form.equipmentGuaranteeFeeVat || 0,
      equipmentGuaranteeFeeDeduction: form.equipmentGuaranteeFeeDeduction || 0,
      equipmentGuaranteeFee: form.equipmentGuaranteeFee || 0,
      equipmentGuaranteeFeeMemo: form.equipmentGuaranteeFeeMemo || '',

      nationalTaxPaymentSupplyPrice: form.nationalTaxPaymentSupplyPrice || 0,
      nationalTaxPaymentVat: form.nationalTaxPaymentVat || 0,
      nationalTaxPaymentDeduction: form.nationalTaxPaymentDeduction || 0,
      nationalTaxPayment: form.nationalTaxPayment || 0,
      nationalTaxPaymentMemo: form.nationalTaxPaymentMemo || '',

      headquartersManagementCost: form.headquartersManagementCost || 0,
      headquartersManagementCostMemo: form.headquartersManagementCostMemo || '',

      changeHistories: form.changeHistories ?? [],
    }
  },
}))
