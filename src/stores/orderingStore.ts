import { create } from 'zustand'

export const useOrderingStore = create<OrderState>((set) => ({
  orderInfo: {
    orderName: '',
    businessNumber: '',
    ceoName: '',
    phoneNumber: '',
    chargeName: '',
    email: '',
    companyName: '',
  },
  startDate: null,
  endDate: null,
  useORnot: '전체',

  setField: (field, value) =>
    set((state) => ({
      orderInfo: { ...state.orderInfo, [field]: value },
    })),
  setStartDate: (date) => set({ startDate: date }),
  setEndDate: (date) => set({ endDate: date }),
  setUseORnot: (useORnot) => set({ useORnot }),
  resetFields: () =>
    set({
      orderInfo: {
        orderName: '',
        businessNumber: '',
        ceoName: '',
        phoneNumber: '',
        chargeName: '',
        email: '',
        companyName: '',
      },
      startDate: null,
      endDate: null,
      useORnot: '전체',
    }),
}))
