import { create } from 'zustand'

export const useBusinessStore = create<BusinessState>((set) => ({
  businessInfo: { name: '', code: '', description: '' },
  status: '전체',
  location: '전체',
  process: '전체',
  startDate: null,
  endDate: null,

  setField: (field, value) =>
    set((state) => ({ businessInfo: { ...state.businessInfo, [field]: value } })),
  setStatus: (status) => set({ status }),
  setLocation: (location) => set({ location }),
  setProcess: (process) => set({ process }),
  setStartDate: (date) => set({ startDate: date }),
  setEndDate: (date) => set({ endDate: date }),
  resetFields: () =>
    set({
      businessInfo: { name: '', code: '', description: '' },
      status: '전체',
      location: '전체',
      process: '전체',
      startDate: null,
      endDate: null,
    }),
}))
