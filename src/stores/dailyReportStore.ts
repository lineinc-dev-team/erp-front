import { create } from 'zustand'
import {
  DailyAttachedFile,
  DailyReportFormStore,
  EmployeesItem,
  EquipmentsItem,
  FuelsItem,
  OutsourcingsItem,
} from '@/types/dailyReport'

export const useDailyFormStore = create<DailyReportFormStore>((set, get) => ({
  form: {
    siteId: 0,
    siteProcessId: 0,
    reportDate: null,
    weather: '',
    employees: [],
    checkedManagerIds: [],
    outsourcings: [],
    checkedOutsourcingIds: [],
    outsourcingEquipments: [],
    checkedEquipmentIds: [],
    fuels: [],
    checkedFuelsIds: [],
    files: [],
    checkedAttachedFileIds: [],
  },

  reset: () =>
    set(() => ({
      form: {
        siteId: 0,
        siteProcessId: 0,
        reportDate: null,
        weather: '',
        employees: [],
        checkedManagerIds: [],
        outsourcings: [],
        checkedOutsourcingIds: [],
        outsourcingEquipments: [],
        checkedEquipmentIds: [],
        fuels: [],
        checkedFuelsIds: [],
        files: [],
        checkedAttachedFileIds: [],
      },
    })),

  resetEmployees: () =>
    set((state) => ({
      form: {
        ...state.form,
        employees: [],
      },
    })),

  resetOutsourcing: () =>
    set((state) => ({
      form: {
        ...state.form,
        outsourcings: [],
      },
    })),

  resetEquipment: () =>
    set((state) => ({
      form: {
        ...state.form,
        outsourcingEquipments: [],
      },
    })),

  resetFile: () =>
    set((state) => ({
      form: {
        ...state.form,
        DailyAttachedFile: [],
      },
    })),

  resetFuel: () =>
    set((state) => ({
      form: {
        ...state.form,
        FuelsItem: [],
      },
    })),

  setField: (field, value) =>
    set((state) => ({
      form: { ...state.form, [field]: value },
    })),

  addItem: (type) =>
    set((state) => {
      if (type === 'Employees') {
        const newItem: EmployeesItem = {
          id: Date.now(),
          laborId: 0,
          workContent: '',
          workQuantity: 0,
          memo: '',
        }
        return { form: { ...state.form, employees: [...state.form.employees, newItem] } }
      } else if (type === 'outsourcings') {
        const newItem: OutsourcingsItem = {
          id: Date.now(),
          outsourcingCompanyId: 0,
          outsourcingCompanyContractWorkerId: 0,
          category: '',
          workContent: '',
          workQuantity: 0,
          memo: '',
        }
        return { form: { ...state.form, outsourcings: [...state.form.outsourcings, newItem] } }
      } else if (type === 'equipment') {
        const newItem: EquipmentsItem = {
          id: Date.now(),
          outsourcingCompanyId: 0,
          outsourcingCompanyContractDriverId: 0,
          outsourcingCompanyContractEquipmentId: 0,
          specificationName: '',
          type: '',
          workContent: '',
          unitPrice: 0,
          workHours: 0,
          memo: '',
        }
        return {
          form: {
            ...state.form,
            outsourcingEquipments: [...state.form.outsourcingEquipments, newItem],
          },
        }
      } else if (type === 'fuel') {
        const newItem: FuelsItem = {
          id: Date.now(),
          outsourcingCompanyId: 0,
          outsourcingCompanyContractDriverId: 0,
          outsourcingCompanyContractEquipmentId: 0,
          specificationName: '',
          fuelType: '',
          fuelAmount: 0,
          memo: '',
        }
        return {
          form: {
            ...state.form,
            fuels: [...state.form.fuels, newItem],
          },
        }
      } else {
        const newItem: DailyAttachedFile = {
          id: Date.now(),
          memo: '',
          description: '',
          files: [],
        }
        return { form: { ...state.form, files: [...state.form.files, newItem] } }
      }
    }),

  updateItemField: (type, id, field, value) =>
    set((state) => {
      if (type === 'Employees') {
        return {
          form: {
            ...state.form,
            employees: state.form.employees.map((m) =>
              m.id === id ? { ...m, [field]: value } : m,
            ),
          },
        }
      } else if (type === 'outsourcings') {
        return {
          form: {
            ...state.form,
            outsourcings: state.form.outsourcings.map((m) =>
              m.id === id ? { ...m, [field]: value } : m,
            ),
          },
        }
      } else if (type === 'equipment') {
        return {
          form: {
            ...state.form,
            outsourcingEquipments: state.form.outsourcingEquipments.map((m) =>
              m.id === id ? { ...m, [field]: value } : m,
            ),
          },
        }
      } else if (type === 'fuel') {
        return {
          form: {
            ...state.form,
            fuels: state.form.fuels.map((m) => (m.id === id ? { ...m, [field]: value } : m)),
          },
        }
      } else {
        return {
          form: {
            ...state.form,
            files: state.form.files.map((f) => (f.id === id ? { ...f, [field]: value } : f)),
          },
        }
      }
    }),

  toggleCheckItem: (type, id, checked) =>
    set((state) => {
      if (type === 'Employees') {
        return {
          form: {
            ...state.form,
            checkedManagerIds: checked
              ? [...state.form.checkedManagerIds, id]
              : state.form.checkedManagerIds.filter((cid) => cid !== id),
          },
        }
      } else if (type === 'outsourcings') {
        return {
          form: {
            ...state.form,
            checkedOutsourcingIds: checked
              ? [...state.form.checkedOutsourcingIds, id]
              : state.form.checkedOutsourcingIds.filter((cid) => cid !== id),
          },
        }
      } else if (type === 'equipment') {
        return {
          form: {
            ...state.form,
            checkedEquipmentIds: checked
              ? [...state.form.checkedEquipmentIds, id]
              : state.form.checkedEquipmentIds.filter((cid) => cid !== id),
          },
        }
      } else if (type === 'fuel') {
        return {
          form: {
            ...state.form,
            checkedFuelsIds: checked
              ? [...state.form.checkedFuelsIds, id]
              : state.form.checkedFuelsIds.filter((cid) => cid !== id),
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
      if (type === 'Employees') {
        return {
          form: {
            ...state.form,
            checkedManagerIds: checked ? state.form.employees.map((m) => m.id) : [],
          },
        }
      } else if (type === 'outsourcings') {
        return {
          form: {
            ...state.form,
            checkedOutsourcingIds: checked ? state.form.outsourcings.map((m) => m.id) : [],
          },
        }
      } else if (type === 'equipment') {
        return {
          form: {
            ...state.form,
            checkedEquipmentIds: checked ? state.form.outsourcingEquipments.map((m) => m.id) : [],
          },
        }
      } else if (type === 'fuel') {
        return {
          form: {
            ...state.form,
            checkedFuelsIds: checked ? state.form.fuels.map((m) => m.id) : [],
          },
        }
      } else {
        return {
          form: {
            ...state.form,
            checkedAttachedFileIds: checked ? state.form.files.map((f) => f.id) : [],
          },
        }
      }
    }),

  removeCheckedItems: (type) =>
    set((state) => {
      if (type === 'Employees') {
        return {
          form: {
            ...state.form,
            employees: state.form.employees.filter(
              (m) => !state.form.checkedManagerIds.includes(m.id),
            ),
            checkedManagerIds: [],
          },
        }
      } else if (type === 'outsourcings') {
        return {
          form: {
            ...state.form,
            outsourcings: state.form.outsourcings.filter(
              (m) => !state.form.checkedOutsourcingIds.includes(m.id),
            ),
            checkedOutsourcingIds: [],
          },
        }
      } else if (type === 'equipment') {
        return {
          form: {
            ...state.form,
            outsourcingEquipments: state.form.outsourcingEquipments.filter(
              (m) => !state.form.checkedEquipmentIds.includes(m.id),
            ),
            checkedEquipmentIds: [],
          },
        }
      } else if (type === 'fuel') {
        return {
          form: {
            ...state.form,
            fuels: state.form.fuels.filter((m) => !state.form.checkedFuelsIds.includes(m.id)),
            checkedFuelsIds: [],
          },
        }
      } else {
        return {
          form: {
            ...state.form,
            files: state.form.files.filter(
              (f) => !state.form.checkedAttachedFileIds.includes(f.id),
            ),
            checkedAttachedFileIds: [],
          },
        }
      }
    }),

  newDailyReportData: () => {
    const form = get().form
    return {
      files: form.files.flatMap((f) => {
        if (!f.files || f.files.length === 0) {
          // 파일이 없을 경우에도 name, memo는 전송
          return [
            {
              id: f.id || Date.now(),
              fileUrl: '',
              originalFileName: '',
              memo: f.memo || '',
              description: f.description || '',
            },
          ]
        }

        // 파일이 있을 경우
        return f.files.map((fileObj: FileUploadInfo) => ({
          id: f.id || Date.now(),
          fileUrl: fileObj.fileUrl || '',
          originalFileName: fileObj.name || fileObj.originalFileName,
          memo: f.memo || '',
          description: f.description || '',
        }))
      }),
      siteId: form.siteId,
      siteProcessId: form.siteProcessId,
      reportDate: form.reportDate,
      weather: form.weather === 'BASE' || form.weather === '' ? undefined : form.weather,
      employees: form.employees,
      outsourcings: form.outsourcings,
      outsourcingEquipments: form.outsourcingEquipments,
      fuels: form.fuels,
    }
  },

  modifyEmployees: () => {
    const form = get().form
    return {
      files: undefined,
      siteId: undefined,
      siteProcessId: undefined,
      reportDate: undefined,
      weather: undefined,
      employees: form.employees,
      outsourcings: undefined,
      outsourcingEquipments: undefined,
      fuels: undefined,
    }
  },

  modifyOutsourcing: () => {
    const form = get().form
    return {
      files: undefined,
      siteId: undefined,
      siteProcessId: undefined,
      reportDate: undefined,
      weather: undefined,
      employees: undefined,
      outsourcings: form.outsourcings,
      outsourcingEquipments: undefined,
      fuels: undefined,
    }
  },

  modifyEquipment: () => {
    const form = get().form
    return {
      files: undefined,
      siteId: undefined,
      siteProcessId: undefined,
      reportDate: undefined,
      weather: undefined,
      employees: undefined,
      outsourcings: undefined,
      outsourcingEquipments: form.outsourcingEquipments,
      fuels: undefined,
    }
  },

  modifyFuel: () => {
    const form = get().form
    return {
      files: undefined,
      siteId: undefined,
      siteProcessId: undefined,
      reportDate: undefined,
      weather: undefined,
      employees: undefined,
      outsourcings: undefined,
      outsourcingEquipments: undefined,
      fuels: form.fuels,
    }
  },

  modifyFile: () => {
    const form = get().form
    return {
      files: form.files.flatMap((f) => {
        if (!f.files || f.files.length === 0) {
          // 파일이 없을 경우에도 name, memo는 전송
          return [
            {
              id: f.id || Date.now(),
              fileUrl: '',
              originalFileName: '',
              memo: f.memo || '',
              description: f.description || '',
            },
          ]
        }

        // 파일이 있을 경우
        return f.files.map((fileObj: FileUploadInfo) => ({
          id: f.id || Date.now(),
          fileUrl: fileObj.fileUrl || '',
          originalFileName: fileObj.name || fileObj.originalFileName,
          memo: f.memo || '',
          description: f.description || '',
        }))
      }),
      siteId: undefined,
      siteProcessId: undefined,
      reportDate: undefined,
      weather: undefined,
      employees: undefined,
      outsourcings: undefined,
      outsourcingEquipments: undefined,
      fuels: undefined,
    }
  },
}))
