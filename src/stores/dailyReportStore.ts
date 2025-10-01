import { create } from 'zustand'
import {
  DailyAttachedFile,
  DailyProofAttachedFile,
  DailyReportFormStore,
  directContractsItem,
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

    employeeFile: [],
    employeeCheckId: [],

    directContracts: [],
    checkeddirectContractsIds: [],

    contractProofFile: [],
    contractProofCheckId: [],

    outsourcings: [],
    checkedOutsourcingIds: [],

    outsourcingProofFile: [],
    outsourcingProofCheckId: [],

    outsourcingEquipments: [],
    checkedEquipmentIds: [],

    equipmentProofFile: [],
    equipmentProofCheckId: [],

    fuelInfos: [],
    checkedFuelsIds: [],

    fuelProofFile: [],
    fuelProofCheckId: [],

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
        employeeFile: [],
        employeeCheckId: [],

        directContracts: [],
        checkeddirectContractsIds: [],

        contractProofFile: [],
        contractProofCheckId: [],

        outsourcings: [],
        checkedOutsourcingIds: [],

        outsourcingProofFile: [],
        outsourcingProofCheckId: [],

        equipmentProofFile: [],
        equipmentProofCheckId: [],

        outsourcingEquipments: [],
        checkedEquipmentIds: [],
        fuelInfos: [],
        checkedFuelsIds: [],

        fuelProofFile: [],
        fuelProofCheckId: [],

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

  resetEmployeesEvidenceFile: () =>
    set((state) => ({
      form: {
        ...state.form,
        employeeFile: [],
      },
    })),

  resetContractEvidenceFile: () =>
    set((state) => ({
      form: {
        ...state.form,
        contractProofFile: [],
      },
    })),

  resetOutsourcingEvidenceFile: () =>
    set((state) => ({
      form: {
        ...state.form,
        outsourcingProofFile: [],
      },
    })),

  resetEquipmentEvidenceFile: () =>
    set((state) => ({
      form: {
        ...state.form,
        equipmentProofFile: [],
      },
    })),

  resetFuelEvidenceFile: () =>
    set((state) => ({
      form: {
        ...state.form,
        fuelProofFile: [],
      },
    })),

  resetDirectContracts: () =>
    set((state) => ({
      form: {
        ...state.form,
        directContracts: [],
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
        fuelInfos: [],
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
          files: [],
          memo: '',
        }
        return { form: { ...state.form, employees: [...state.form.employees, newItem] } }
      } else if (type === 'EmployeeFiles') {
        const newItem: DailyProofAttachedFile = {
          id: Date.now(),
          name: '',
          memo: '',
          files: [],
        }

        return { form: { ...state.form, employeeFile: [...state.form.employeeFile, newItem] } }
      } else if (type === 'directContractFiles') {
        const newItem: DailyProofAttachedFile = {
          id: Date.now(),
          name: '',
          memo: '',
          files: [],
        }

        return {
          form: { ...state.form, contractProofFile: [...state.form.contractProofFile, newItem] },
        }
      } else if (type === 'outsourcingFiles') {
        const newItem: DailyProofAttachedFile = {
          id: Date.now(),
          name: '',
          memo: '',
          files: [],
        }

        return {
          form: {
            ...state.form,
            outsourcingProofFile: [...state.form.outsourcingProofFile, newItem],
          },
        }
      } else if (type === 'directContracts') {
        const newItem: directContractsItem = {
          // id: Date.now(),
          id: null,
          checkId: Date.now(),
          outsourcingCompanyId: 0,
          laborId: 0,
          position: '',
          workContent: '',
          previousPrice: 0,
          unitPrice: 0,
          workQuantity: 0,
          files: [],
          memo: '',
          isTemporary: false,
          temporaryLaborName: '',
        }
        return {
          form: { ...state.form, directContracts: [...state.form.directContracts, newItem] },
        }
      } else if (type === 'outsourcings') {
        const newItem: OutsourcingsItem = {
          id: Date.now(),
          outsourcingCompanyId: 0,
          outsourcingCompanyContractWorkerId: 0,
          category: '',
          workContent: '',
          workQuantity: 0,
          files: [],
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
          files: [],
          memo: '',
        }
        return {
          form: {
            ...state.form,
            outsourcingEquipments: [...state.form.outsourcingEquipments, newItem],
          },
        }
      } else if (type === 'equipmentFile') {
        const newItem: DailyProofAttachedFile = {
          id: Date.now(),
          name: '',
          memo: '',
          files: [],
        }

        return {
          form: { ...state.form, equipmentProofFile: [...state.form.equipmentProofFile, newItem] },
        }
      } else if (type === 'fuel') {
        const newItem: FuelsItem = {
          id: Date.now(),
          outsourcingCompanyId: 0,
          driverId: 0,
          equipmentId: 0,
          specificationName: '',
          fuelType: '',
          fuelAmount: 0,
          memo: '',
          files: [],
        }
        return {
          form: {
            ...state.form,
            fuelInfos: [...state.form.fuelInfos, newItem],
          },
        }
      } else if (type === 'fuelFile') {
        const newItem: DailyProofAttachedFile = {
          id: Date.now(),
          name: '',
          memo: '',
          files: [],
        }

        return { form: { ...state.form, fuelProofFile: [...state.form.fuelProofFile, newItem] } }
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

  addTemporaryCheckedItems: (type) =>
    set((state) => {
      if (type === 'directContracts') {
        const newItem: directContractsItem = {
          id: null,
          checkId: Date.now(),
          outsourcingCompanyId: null,
          laborId: null,
          position: '',
          workContent: '',
          previousPrice: 0,
          unitPrice: 0,
          workQuantity: 0,
          files: [],
          memo: '',
          isTemporary: true,
          temporaryLaborName: '',
        }
        return {
          form: { ...state.form, directContracts: [...state.form.directContracts, newItem] },
        }
      }
      return state // 👈 type이 안 맞으면 기존 state 반환
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
      } else if (type === 'EmployeeFiles') {
        return {
          form: {
            ...state.form,
            employeeFile: state.form.employeeFile.map((f) =>
              f.id === id ? { ...f, [field]: value } : f,
            ),
          },
        }
      } else if (type === 'fuelFile') {
        return {
          form: {
            ...state.form,
            fuelProofFile: state.form.fuelProofFile.map((f) =>
              f.id === id ? { ...f, [field]: value } : f,
            ),
          },
        }
      } else if (type === 'directContractFiles') {
        return {
          form: {
            ...state.form,
            contractProofFile: state.form.contractProofFile.map((f) =>
              f.id === id ? { ...f, [field]: value } : f,
            ),
          },
        }
      } else if (type === 'equipmentFile') {
        return {
          form: {
            ...state.form,
            equipmentProofFile: state.form.equipmentProofFile.map((f) =>
              f.id === id ? { ...f, [field]: value } : f,
            ),
          },
        }
      } else if (type === 'directContracts') {
        return {
          form: {
            ...state.form,
            directContracts: state.form.directContracts.map((m) =>
              m.checkId === id ? { ...m, [field]: value } : m,
            ),
          },
        }
      } else if (type === 'outsourcingFiles') {
        return {
          form: {
            ...state.form,
            outsourcingProofFile: state.form.outsourcingProofFile.map((f) =>
              f.id === id ? { ...f, [field]: value } : f,
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
            fuelInfos: state.form.fuelInfos.map((m) =>
              m.id === id ? { ...m, [field]: value } : m,
            ),
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
      } else if (type === 'EmployeeFiles') {
        return {
          form: {
            ...state.form,
            employeeCheckId: checked
              ? [...state.form.employeeCheckId, id]
              : state.form.employeeCheckId.filter((cid) => cid !== id),
          },
        }
      } else if (type === 'fuelFile') {
        return {
          form: {
            ...state.form,
            fuelProofCheckId: checked
              ? [...state.form.fuelProofCheckId, id]
              : state.form.fuelProofCheckId.filter((cid) => cid !== id),
          },
        }
      } else if (type === 'equipmentFile') {
        return {
          form: {
            ...state.form,
            equipmentProofCheckId: checked
              ? [...state.form.equipmentProofCheckId, id]
              : state.form.equipmentProofCheckId.filter((cid) => cid !== id),
          },
        }
      } else if (type === 'directContractFiles') {
        return {
          form: {
            ...state.form,
            contractProofCheckId: checked
              ? [...state.form.contractProofCheckId, id]
              : state.form.contractProofCheckId.filter((cid) => cid !== id),
          },
        }
      } else if (type === 'directContracts') {
        return {
          form: {
            ...state.form,
            checkeddirectContractsIds: checked
              ? [...state.form.checkeddirectContractsIds, id]
              : state.form.checkeddirectContractsIds.filter((cid) => cid !== id),
          },
        }
      } else if (type === 'outsourcingFiles') {
        return {
          form: {
            ...state.form,
            outsourcingProofCheckId: checked
              ? [...state.form.outsourcingProofCheckId, id]
              : state.form.outsourcingProofCheckId.filter((cid) => cid !== id),
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
      } else if (type === 'EmployeeFiles') {
        return {
          form: {
            ...state.form,
            employeeCheckId: checked ? state.form.employeeFile.map((f) => f.id) : [],
          },
        }
      } else if (type === 'fuelFile') {
        return {
          form: {
            ...state.form,
            fuelProofCheckId: checked ? state.form.fuelProofFile.map((f) => f.id) : [],
          },
        }
      } else if (type === 'equipmentFile') {
        return {
          form: {
            ...state.form,
            equipmentProofCheckId: checked ? state.form.equipmentProofFile.map((f) => f.id) : [],
          },
        }
      } else if (type === 'directContractFiles') {
        return {
          form: {
            ...state.form,
            contractProofCheckId: checked ? state.form.contractProofFile.map((f) => f.id) : [],
          },
        }
      } else if (type === 'directContracts') {
        return {
          form: {
            ...state.form,
            checkeddirectContractsIds: checked
              ? state.form.directContracts.map((m) => m.checkId)
              : [],
          },
        }
      } else if (type === 'outsourcingFiles') {
        return {
          form: {
            ...state.form,
            outsourcingProofCheckId: checked
              ? state.form.outsourcingProofFile.map((f) => f.id)
              : [],
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
            checkedFuelsIds: checked ? state.form.fuelInfos.map((m) => m.id) : [],
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
      } else if (type === 'EmployeeFiles') {
        return {
          form: {
            ...state.form,
            files: state.form.employeeFile.filter(
              (f) => !state.form.employeeCheckId.includes(f.id),
            ),
            employeeCheckId: [],
          },
        }
      } else if (type === 'fuelFile') {
        return {
          form: {
            ...state.form,
            files: state.form.fuelProofFile.filter(
              (f) => !state.form.fuelProofCheckId.includes(f.id),
            ),
            fuelProofCheckId: [],
          },
        }
      } else if (type === 'equipmentFile') {
        return {
          form: {
            ...state.form,
            files: state.form.equipmentProofFile.filter(
              (f) => !state.form.equipmentProofCheckId.includes(f.id),
            ),
            equipmentProofCheckId: [],
          },
        }
      } else if (type === 'directContractFiles') {
        return {
          form: {
            ...state.form,
            files: state.form.contractProofFile.filter(
              (f) => !state.form.contractProofCheckId.includes(f.id),
            ),
            contractProofCheckId: [],
          },
        }
      } else if (type === 'directContracts') {
        return {
          form: {
            ...state.form,
            directContracts: state.form.directContracts.filter(
              (m) => !state.form.checkeddirectContractsIds.includes(m.checkId),
            ),
            checkeddirectContractsIds: [],
          },
        }
      } else if (type === 'outsourcingFiles') {
        return {
          form: {
            ...state.form,
            files: state.form.outsourcingProofFile.filter(
              (f) => !state.form.outsourcingProofCheckId.includes(f.id),
            ),
            outsourcingProofCheckId: [],
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
            fuelInfos: state.form.fuelInfos.filter(
              (m) => !state.form.checkedFuelsIds.includes(m.id),
            ),
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

  // newDailyReportData: () => {
  //   const form = get().form
  //   return {
  //     files: form.files.flatMap((f) => {
  //       if (!f.files || f.files.length === 0) {
  //         // 파일이 없을 경우에도 name, memo는 전송
  //         return [
  //           {
  //             id: f.id || Date.now(),
  //             fileUrl: '',
  //             originalFileName: '',
  //             memo: f.memo || '',
  //             description: f.description || '',
  //           },
  //         ]
  //       }

  //       // 파일이 있을 경우
  //       return f.files.map((fileObj: FileUploadInfo) => ({
  //         id: f.id || Date.now(),
  //         fileUrl: fileObj.fileUrl || '',
  //         originalFileName: fileObj.name || fileObj.originalFileName,
  //         memo: f.memo || '',
  //         description: f.description || '',
  //       }))
  //     }),
  //     siteId: form.siteId,
  //     siteProcessId: form.siteProcessId,
  //     reportDate: form.reportDate,
  //     weather: form.weather,
  //     employees: form.employees.map((emp) => {
  //       const file = emp.files?.[0] // 1개만 허용
  //       return {
  //         laborId: emp.laborId,
  //         workContent: emp.workContent,
  //         workQuantity: emp.workQuantity,
  //         fileUrl: file?.fileUrl || null,
  //         originalFileName: file?.originalFileName || null,
  //         memo: emp.memo,
  //       }
  //     }),

  //     evidenceFiles: [
  //       {
  //         files: form.employeeFile.flatMap((f) => {
  //           if (!f.files || f.files.length === 0) {
  //             // 파일이 없을 경우에도 name, memo는 전송
  //             return [
  //               {
  //                 id: f.id || Date.now(),
  //                 name: f.name,
  //                 memo: f.memo || '',
  //                 fileUrl: '',
  //                 originalFileName: '',
  //               },
  //             ]
  //           }

  //           // 파일이 있을 경우
  //           return f.files.map((fileObj: FileUploadInfo) => ({
  //             id: f.id || Date.now(),
  //             name: f.name,
  //             fileUrl: fileObj.fileUrl || '',
  //             originalFileName: fileObj.name || fileObj.originalFileName,
  //             memo: f.memo || '',
  //           }))
  //         }),
  //       },
  //     ],
  //     directContracts: form.directContracts.map((item) => {
  //       const file = item.files[0]

  //       return {
  //         outsourcingCompanyId: item.outsourcingCompanyId,
  //         laborId: item.laborId,
  //         position: item.position,
  //         workContent: item.workContent,
  //         unitPrice: item.unitPrice,
  //         workQuantity: item.workQuantity,
  //         fileUrl: file?.fileUrl || null,
  //         originalFileName: file?.originalFileName || null,
  //         memo: item.memo,
  //         isTemporary: item.isTemporary,
  //         temporaryLaborName: item.temporaryLaborName === '' ? null : item.temporaryLaborName,
  //       }
  //     }),
  //     outsourcings: form.outsourcings.map((item) => {
  //       const file = item.files[0]

  //       return {
  //         outsourcingCompanyId: item.outsourcingCompanyId,
  //         outsourcingCompanyContractWorkerId: item.outsourcingCompanyContractWorkerId,
  //         category: item.category,
  //         workContent: item.workContent,
  //         workQuantity: item.workContent,
  //         fileUrl: file?.fileUrl || null,
  //         originalFileName: file?.originalFileName || null,
  //         memo: item.memo,
  //       }
  //     }),
  //     outsourcingEquipments: form.outsourcingEquipments,
  //     fuelInfos: form.fuelInfos,
  //   }
  // },

  newDailyReportData: () => {
    const form = get().form

    // fileType 별로 evidenceFiles 생성
    const evidenceFiles = [
      { type: 'EMPLOYEE', items: form.employeeFile || [] },
      { type: 'DIRECT_CONTRACT', items: form.contractProofFile || [] },
      { type: 'OUTSOURCING', items: form.outsourcingProofFile || [] },
      { type: 'EQUIPMENT', items: form.equipmentProofFile || [] },
      { type: 'FUEL', items: form.fuelProofFile || [] },
    ]
      .filter((f) => f.items?.length) // 비어있는 타입 제외
      .map((f) => ({
        fileType: f.type,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        files: f.items.flatMap((item: any) => {
          if (!item.files || item.files.length === 0) {
            return [
              {
                id: item.id || Date.now(),
                name: item.name || '',
                memo: item.memo || '',
                fileUrl: '',
                originalFileName: '',
              },
            ]
          }
          return item.files.map((fileObj: FileUploadInfo) => ({
            id: item.id || Date.now(),
            name: item.name || '',
            fileUrl: fileObj.fileUrl || '',
            originalFileName: fileObj.name || fileObj.originalFileName,
            memo: item.memo || '',
          }))
        }),
      }))

    return {
      files: form.files.flatMap((f) => {
        if (!f.files || f.files.length === 0) {
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
      weather: form.weather,
      employees: form.employees.map((emp) => {
        const file = emp.files?.[0]
        return {
          laborId: emp.laborId,
          workContent: emp.workContent,
          workQuantity: emp.workQuantity,
          fileUrl: file?.fileUrl || null,
          originalFileName: file?.originalFileName || null,
          memo: emp.memo,
        }
      }),
      directContracts: form.directContracts.map((item) => {
        const file = item.files[0]

        return {
          outsourcingCompanyId: item.outsourcingCompanyId,
          laborId: item.laborId,
          position: item.position,
          workContent: item.workContent,
          unitPrice: item.unitPrice,
          workQuantity: item.workQuantity,
          fileUrl: file?.fileUrl || null,
          originalFileName: file?.originalFileName || null,
          memo: item.memo,
          isTemporary: item.isTemporary,
          temporaryLaborName: item.temporaryLaborName === '' ? null : item.temporaryLaborName,
        }
      }),

      outsourcings: form.outsourcings.map((item) => {
        const file = item.files[0]

        return {
          outsourcingCompanyId: item.outsourcingCompanyId,
          outsourcingCompanyContractWorkerId: item.outsourcingCompanyContractWorkerId,
          category: item.category,
          workContent: item.workContent,
          workQuantity: item.workContent,
          fileUrl: file?.fileUrl || null,
          originalFileName: file?.originalFileName || null,
          memo: item.memo,
        }
      }),
      outsourcingEquipments: form.outsourcingEquipments.map((item) => {
        const file = item.files[0]

        return {
          outsourcingCompanyId: item.outsourcingCompanyId,
          outsourcingCompanyContractDriverId: item.outsourcingCompanyContractDriverId,
          outsourcingCompanyContractEquipmentId: item.outsourcingCompanyContractEquipmentId,
          workContent: item.workContent,
          unitPrice: item.unitPrice,
          workHours: item.workHours,
          fileUrl: file?.fileUrl || null,
          originalFileName: file?.originalFileName || null,
          memo: item.memo,
        }
      }),
      fuelInfos: form.fuelInfos.map((item) => {
        const file = item.files[0]

        return {
          outsourcingCompanyId: item.outsourcingCompanyId,
          driverId: item.driverId,
          equipmentId: item.equipmentId,
          fuelType: item.fuelType,
          fuelAmount: item.fuelAmount,
          fileUrl: file?.fileUrl || null,
          originalFileName: file?.originalFileName || null,
          memo: item.memo,
        }
      }),
      evidenceFiles, // 수정된 evidenceFiles
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

      employees: form.employees.map((emp: EmployeesItem) => ({
        id: emp.id,
        laborId: emp.laborId,
        workContent: emp.workContent,
        workQuantity: emp.workQuantity,
        memo: emp.memo,

        fileUrl: emp.files?.[0]?.fileUrl ?? null,
        originalFileName: emp.files?.[0]?.originalFileName ?? null,
      })),

      outsourcings: undefined,
      outsourcingEquipments: undefined,
      fuelInfos: undefined,
    }
  },

  modifyDirectContracts: () => {
    const form = get().form
    return {
      files: undefined,
      siteId: undefined,
      siteProcessId: undefined,
      reportDate: undefined,
      weather: undefined,
      employees: undefined,
      directContracts: form.directContracts.map((item: directContractsItem) => ({
        id: item.id, // 신규면 0 or undefined, 수정이면 기존 id
        outsourcingCompanyId: item.outsourcingCompanyId, // 선택된 외주업체 id
        laborId: item.laborId, // 선택된 근로자 id
        position: item.position, // 직종
        workContent: item.workContent, // 작업 내용
        unitPrice: item.unitPrice, // 단가
        workQuantity: item.workQuantity, // 수량
        memo: item.memo, // 메모
        isTemporary: item.isTemporary ?? false, // 임시 근로자 여부
        temporaryLaborName: item.temporaryLaborName === '' ? null : item.temporaryLaborName,

        fileUrl: item.files?.[0]?.fileUrl ?? null,
        originalFileName: item.files?.[0]?.originalFileName ?? null,
      })),

      outsourcings: undefined,
      outsourcingEquipments: undefined,
      fuelInfos: undefined,
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

      outsourcings: form.outsourcings.map((item: OutsourcingsItem) => ({
        id: item.id, // 수정이면 기존 id, 신규면 0 또는 undefined
        outsourcingCompanyId: item.outsourcingCompanyId,
        outsourcingCompanyContractWorkerId: item.outsourcingCompanyContractWorkerId,
        category: item.category,
        workContent: item.workContent,
        workQuantity: item.workQuantity,
        memo: item.memo,

        fileUrl: item.files?.[0]?.fileUrl ?? null,
        originalFileName: item.files?.[0]?.originalFileName ?? null,
      })),

      outsourcingEquipments: undefined,
      fuelInfos: undefined,
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
      outsourcingEquipments: form.outsourcingEquipments.map((item: EquipmentsItem) => ({
        id: item.id,
        outsourcingCompanyId: item.outsourcingCompanyId,
        outsourcingCompanyContractDriverId: item.outsourcingCompanyContractDriverId,
        outsourcingCompanyContractEquipmentId: item.outsourcingCompanyContractEquipmentId,
        workContent: item.workContent,
        unitPrice: item.unitPrice,
        workHours: item.workHours,
        memo: item.memo,

        fileUrl: item.files?.[0]?.fileUrl ?? null,
        originalFileName: item.files?.[0]?.originalFileName ?? null,
      })),
      fuelInfos: undefined,
    }
  },

  modifyFuel: () => {
    const form = get().form
    return {
      files: undefined,
      siteId: form.siteId,
      siteProcessId: form.siteProcessId,
      date: form.reportDate,
      weather: form.weather,
      employees: undefined,
      outsourcings: undefined,
      outsourcingEquipments: undefined,
      fuelInfos: form.fuelInfos.map((item: FuelsItem) => ({
        id: item.id,
        outsourcingCompanyId: item.outsourcingCompanyId,
        driverId: item.driverId,
        equipmentId: item.equipmentId,
        fuelType: item.fuelType,
        fuelAmount: item.fuelAmount,
        memo: item.memo,

        fileUrl: item.files?.[0]?.fileUrl ?? null,
        originalFileName: item.files?.[0]?.originalFileName ?? null,
      })),
    }
  },

  modifyWeather: () => {
    const form = get().form

    // fileType 별로 evidenceFiles 생성
    const evidenceFiles = [
      { type: 'EMPLOYEE', items: form.employeeFile || [] },
      { type: 'DIRECT_CONTRACT', items: form.contractProofFile || [] },
      { type: 'OUTSOURCING', items: form.outsourcingProofFile || [] },
      { type: 'EQUIPMENT', items: form.equipmentProofFile || [] },
      { type: 'FUEL', items: form.fuelProofFile || [] },
    ]
      .filter((f) => f.items?.length) // 비어있는 타입 제외
      .map((f) => ({
        fileType: f.type,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        files: f.items.flatMap((item: any) => {
          if (!item.files || item.files.length === 0) {
            return [
              {
                id: item.id || Date.now(),
                name: item.name || '',
                memo: item.memo || '',
                fileUrl: '',
                originalFileName: '',
              },
            ]
          }
          return item.files.map((fileObj: FileUploadInfo) => ({
            id: item.id || Date.now(),
            name: item.name || '',
            fileUrl: fileObj.fileUrl || '',
            originalFileName: fileObj.name || fileObj.originalFileName,
            memo: item.memo || '',
          }))
        }),
      }))
    return {
      files: undefined,
      siteId: undefined,
      siteProcessId: undefined,
      reportDate: undefined,
      weather: form.weather,
      evidenceFiles: evidenceFiles,
      employees: undefined,
      outsourcings: undefined,
      outsourcingEquipments: undefined,
      fuelInfos: undefined,
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
      fuelInfos: undefined,
    }
  },
}))
