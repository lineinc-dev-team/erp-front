import { create } from 'zustand'
import {
  ContractDetailItems,
  OutsourcingArticleInfoAttachedFile,
  OutsourcingContractAttachedFile,
  OutsourcingContractFormStore,
  OutsourcingContractItem,
  OutsourcingContractManager,
  OutsourcingContractPersonAttachedFile,
  OutsourcingContractSearchState,
  OutsourcingEquipmentInfoAttachedFile,
  subEquipmentInfo,
} from '@/types/outsourcingContract'
import { getTodayDateString } from '@/utils/formatters'

// const defaultAttachedFiles = [
//   { id: Date.now(), name: '계약서', memo: '', files: [], type: 'CONTRACT' },
//   { id: Date.now() + 1, name: '보증서', memo: '', files: [], type: 'GUARANTEE' },
// ]

export const useContractSearchStore = create<{ search: OutsourcingContractSearchState }>((set) => ({
  search: {
    searchTrigger: 0,
    siteId: 0,
    siteName: '',
    processId: 0,
    processName: '',
    companyName: '',
    businessNumber: '',
    contractType: '',
    contractStatus: '',
    contractStartDate: null,
    contractEndDate: null,
    contactName: '',
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
          processId: 0,
          processName: '',
          companyName: '',
          businessNumber: '',
          contractType: '',
          contractStatus: '',
          contractStartDate: null,
          contractEndDate: null,
          contactName: '',
          arraySort: '최신순',
          pageCount: '20',
          currentPage: 1,
        },
      })),
  },
}))

export const useContractFormStore = create<OutsourcingContractFormStore>((set, get) => ({
  form: {
    siteId: 0,
    siteName: '',
    processId: 0,
    processName: '',
    CompanyId: 0,
    CompanyName: '',
    businessNumber: '',
    type: '',
    typeDescription: '',
    contractStartDate: null,
    contractEndDate: null,
    contractAmount: 0,
    defaultDeductions: '',
    defaultDeductionsDescription: '',
    taxCalculat: '',
    taxInvoiceIssueDayOfMonth: 0,
    memo: '',
    category: '',
    status: '',
    workTypeName: '',
    headManagers: [],
    checkedManagerIds: [],
    attachedFiles: [],
    checkedAttachedFileIds: [],

    personManagers: [],
    checkedPersonIds: [],

    contractManagers: [],
    checkedContractIds: [],
    articleManagers: [],
    checkedArticleIds: [],
    equipmentManagers: [],
    checkedEquipmentIds: [],
  },

  reset: () =>
    set(() => ({
      form: {
        siteId: 0,
        siteName: '',
        processId: 0,
        processName: '',
        CompanyId: 0,
        CompanyName: '',
        businessNumber: '',
        type: '',
        typeDescription: '',
        contractStartDate: null,
        contractEndDate: null,
        contractAmount: 0,
        defaultDeductions: '',
        defaultDeductionsDescription: '',
        taxCalculat: '',
        taxInvoiceIssueDayOfMonth: 0,
        status: '',

        workTypeName: '',
        memo: '',
        category: '',
        headManagers: [],
        checkedManagerIds: [],
        personManagers: [],
        checkedPersonIds: [],
        attachedFiles: [],
        checkedAttachedFileIds: [],
        contractManagers: [],
        checkedContractIds: [],
        articleManagers: [],
        checkedArticleIds: [],
        equipmentManagers: [],
        checkedEquipmentIds: [],
      },
    })),

  resetType: () =>
    set((state) => ({
      form: {
        ...state.form,
        personManagers: [],
        checkedPersonIds: [],

        contractManagers: [],
        checkedContractIds: [],
        articleManagers: [],
        checkedArticleIds: [],
        equipmentManagers: [],
        checkedEquipmentIds: [],
      },
    })),

  setField: (field, value) =>
    set((state) => ({
      form: { ...state.form, [field]: value },
    })),

  setForm: (newForm) =>
    set((state) => ({
      form: { ...state.form, ...newForm },
    })),

  updateMemo: (id, value) =>
    set((state) => {
      const updatedHistories = state?.form?.changeHistories?.map((history) =>
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

  addItem: (type) =>
    set((state) => {
      if (type === 'manager') {
        const newItem: OutsourcingContractManager = {
          id: Date.now(),
          name: '',
          position: '',
          department: '',
          managerAreaNumber: '지역번호',
          landlineNumber: '',
          phoneNumber: '',
          email: '',
          memo: '',
        }
        return { form: { ...state.form, headManagers: [...state.form.headManagers, newItem] } }
      } else if (type === 'personAttachedFile') {
        const personNewItems: OutsourcingContractPersonAttachedFile = {
          id: Date.now(),
          name: '',
          category: '',
          taskDescription: '',
          memo: '',
          files: [],
        }
        return {
          form: {
            ...state.form,
            personManagers: [...state.form.personManagers, personNewItems],
          },
        }
      } else if (type === 'workSize') {
        const contractNewItems: OutsourcingContractItem = {
          id: Date.now(),
          itemName: '',
          items: [
            {
              id: Date.now(),
              item: '',
              specification: '',
              unit: '',
              unitPrice: 0,
              contractQuantity: 0,
              contractPrice: 0,
              outsourcingContractQuantity: 0,
              outsourcingContractPrice: 0,
              memo: '',
            },
          ],
        }
        return {
          form: {
            ...state.form,
            contractManagers: [...state.form.contractManagers, contractNewItems],
          },
        }
      } else if (type === 'equipment') {
        const equipmentNewItems: OutsourcingEquipmentInfoAttachedFile = {
          id: Date.now(),
          specification: '',
          vehicleNumber: '',
          category: '기본장비',
          unitPrice: 0,
          type: '',
          taskDescription: '',
          memo: '',
        }
        return {
          form: {
            ...state.form,
            equipmentManagers: [...state.form.equipmentManagers, equipmentNewItems],
          },
        }
      } else if (type === 'articleInfo') {
        const articleNewItems: OutsourcingArticleInfoAttachedFile = {
          id: Date.now(),
          name: '',
          memo: '',
          driverLicense: [],
          safeEducation: [],
          ETCfiles: [],
        }
        return {
          form: {
            ...state.form,
            articleManagers: [...state.form.articleManagers, articleNewItems],
          },
        }
      } else {
        const newItem: OutsourcingContractAttachedFile = {
          id: Date.now(),
          name: '',
          memo: '',
          files: [],
          type: 'BASIC',
        }
        return { form: { ...state.form, attachedFiles: [...state.form.attachedFiles, newItem] } }
      }
    }),

  updateItemField: <T>(
    type:
      | 'manager'
      | 'attachedFile'
      | 'personAttachedFile'
      | 'workSize'
      | 'articleInfo'
      | 'equipment',
    id: number,
    field: string,
    value: T,
  ) =>
    set((state) => {
      if (type === 'manager') {
        return {
          form: {
            ...state.form,
            headManagers: state.form.headManagers.map((m) =>
              m.id === id ? { ...m, [field]: value } : m,
            ),
          },
        }
      } else if (type === 'personAttachedFile') {
        return {
          form: {
            ...state.form,
            personManagers: state.form.personManagers.map((f) =>
              f.id === id ? { ...f, [field]: value } : f,
            ),
          },
        }
      } else if (type === 'workSize') {
        return {
          form: {
            ...state.form,
            contractManagers: state.form.contractManagers.map((f) =>
              f.id === id ? { ...f, [field]: value } : f,
            ),
          },
        }
      } else if (type === 'equipment') {
        return {
          form: {
            ...state.form,
            equipmentManagers: state.form.equipmentManagers.map((f) =>
              f.id === id ? { ...f, [field]: value } : f,
            ),
          },
        }
      } else if (type === 'articleInfo') {
        return {
          form: {
            ...state.form,
            articleManagers: state.form.articleManagers.map((f) =>
              f.id === id ? { ...f, [field]: value } : f,
            ),
          },
        }
      } else {
        return {
          form: {
            ...state.form,
            attachedFiles: state.form.attachedFiles.map((f) =>
              f.id === id ? { ...f, [field]: value } : f,
            ),
          },
        }
      }
    }),

  toggleCheckItem: (type, id, checked) =>
    set((state) => {
      if (type === 'manager') {
        return {
          form: {
            ...state.form,
            checkedManagerIds: checked
              ? [...state.form.checkedManagerIds, id]
              : state.form.checkedManagerIds.filter((cid) => cid !== id),
          },
        }
      } else if (type === 'personAttachedFile') {
        return {
          form: {
            ...state.form,
            checkedPersonIds: checked
              ? [...state.form.checkedPersonIds, id]
              : state.form.checkedPersonIds.filter((cid) => cid !== id),
          },
        }
      } else if (type === 'workSize') {
        return {
          form: {
            ...state.form,
            checkedContractIds: checked
              ? [...state.form.checkedContractIds, id]
              : state.form.checkedContractIds.filter((cid) => cid !== id),
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
      } else if (type === 'articleInfo') {
        return {
          form: {
            ...state.form,
            checkedArticleIds: checked
              ? [...state.form.checkedArticleIds, id]
              : state.form.checkedArticleIds.filter((cid) => cid !== id),
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
      if (type === 'manager') {
        return {
          form: {
            ...state.form,
            checkedManagerIds: checked ? state.form.headManagers.map((m) => m.id) : [],
          },
        }
      } else if (type === 'personAttachedFile') {
        return {
          form: {
            ...state.form,
            checkedPersonIds: checked ? state.form.personManagers.map((f) => f.id) : [],
          },
        }
      } else if (type === 'workSize') {
        return {
          form: {
            ...state.form,
            checkedContractIds: checked ? state.form.contractManagers.map((f) => f.id) : [],
          },
        }
      } else if (type === 'equipment') {
        return {
          form: {
            ...state.form,
            checkedEquipmentIds: checked ? state.form.equipmentManagers.map((f) => f.id) : [],
          },
        }
      } else if (type === 'articleInfo') {
        return {
          form: {
            ...state.form,
            checkedArticleIds: checked ? state.form.articleManagers.map((f) => f.id) : [],
          },
        }
      } else {
        return {
          form: {
            ...state.form,
            checkedAttachedFileIds: checked
              ? state.form.attachedFiles
                  .filter((f) => f.type !== 'GUARANTEE' && f.type !== 'CONTRACT') // 제외
                  .map((f) => f.id)
              : [],
          },
        }
      }
    }),

  setRepresentativeManager: (id: number) =>
    set((state) => ({
      form: {
        ...state.form,
        headManagers: state.form.headManagers.map((m) => ({
          ...m,
          isMain: m.id === id,
        })),
      },
    })),

  removeCheckedItems: (type) =>
    set((state) => {
      if (type === 'manager') {
        return {
          form: {
            ...state.form,
            headManagers: state.form.headManagers.filter(
              (m) => !state.form.checkedManagerIds.includes(m.id),
            ),
            checkedManagerIds: [],
          },
        }
      } else if (type === 'personAttachedFile') {
        return {
          form: {
            ...state.form,
            personManagers: state.form.personManagers.filter(
              (f) => !state.form.checkedPersonIds.includes(f.id),
            ),
            checkedPersonIds: [],
          },
        }
      } else if (type === 'workSize') {
        return {
          form: {
            ...state.form,
            contractManagers: state.form.contractManagers.filter(
              (f) => !state.form.checkedContractIds.includes(f.id),
            ),
            checkedContractIds: [],
          },
        }
      } else if (type === 'equipment') {
        return {
          form: {
            ...state.form,
            equipmentManagers: state.form.equipmentManagers.filter(
              (f) => !state.form.checkedEquipmentIds.includes(f.id),
            ),
            checkedEquipmentIds: [],
          },
        }
      } else if (type === 'articleInfo') {
        return {
          form: {
            ...state.form,
            articleManagers: state.form.articleManagers.filter(
              (f) => !state.form.checkedArticleIds.includes(f.id),
            ),
            checkedArticleIds: [],
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

  addSubEquipment: (equipmentId: number) =>
    set((state) => ({
      form: {
        ...state.form,
        equipmentManagers: state.form.equipmentManagers.map((equipment) =>
          equipment.id === equipmentId
            ? {
                ...equipment,
                subEquipments: equipment.subEquipments
                  ? [
                      ...equipment.subEquipments,
                      {
                        id: Date.now(),
                        typeCode: 'BASE',
                        description: '',
                        taskDescription: '',
                        unitPrice: 0,
                        memo: '',
                      },
                    ]
                  : [
                      {
                        id: Date.now(),
                        typeCode: 'BASE',
                        taskDescription: '',
                        description: '',
                        unitPrice: 0,
                        memo: '',
                      },
                    ],
              }
            : equipment,
        ),
      },
    })),
  removeSubEquipment: (equipmentId: number, subEquipmentId: number) =>
    set((state) => ({
      form: {
        ...state.form,
        equipmentManagers: state.form.equipmentManagers.map((equipment) =>
          equipment.id === equipmentId
            ? {
                ...equipment,
                subEquipments:
                  equipment.subEquipments?.filter((sub) => sub.id !== subEquipmentId) ?? [],
              }
            : equipment,
        ),
      },
    })),
  // 장비에서 구분 추가 로직
  updateSubEquipmentField: (
    equipmentId: number,
    subEquipmentId: number,
    field: keyof subEquipmentInfo,
    value: string,
  ) => {
    set((state) => ({
      form: {
        ...state.form,
        equipmentManagers: state.form.equipmentManagers.map((equipment) =>
          equipment.id === equipmentId
            ? {
                ...equipment,
                subEquipments: equipment.subEquipments?.map((sub) =>
                  sub.id === subEquipmentId ? { ...sub, [field]: value } : sub,
                ),
              }
            : equipment,
        ),
      },
    }))
  },

  getTotalContractQty: () => {
    const { contractManagers } = get().form
    return contractManagers.reduce((sum, manager) => {
      const qtySum = manager.items.reduce((innerSum, item) => {
        const qty = Number(item.contractQuantity)
        return innerSum + (isNaN(qty) ? 0 : qty)
      }, 0)
      return sum + qtySum
    }, 0)
  },

  // 도급금액 금액 합계
  getTotalContractAmount: () => {
    const { contractManagers } = get().form
    return contractManagers.reduce((sum, manager) => {
      const itemSum = manager.items.reduce((innerSum, item) => {
        const amount = Number(item.contractPrice)
        return innerSum + (isNaN(amount) ? 0 : amount)
      }, 0)
      return sum + itemSum
    }, 0)
  },

  // 외주계약 수량 총합
  getTotalOutsourceQty: () => {
    const { contractManagers } = get().form
    return contractManagers.reduce((sum, manager) => {
      const qtySum = manager.items.reduce((innerSum, item) => {
        const qty = Number(item.outsourcingContractQuantity)
        return innerSum + (isNaN(qty) ? 0 : qty)
      }, 0)
      return sum + qtySum
    }, 0)
  },

  // 외주계약 금액 총합
  getTotalOutsourceAmount: () => {
    const { contractManagers } = get().form
    return contractManagers.reduce((sum, manager) => {
      const amountSum = manager.items.reduce((innerSum, item) => {
        const amount = Number(item.outsourcingContractPrice)
        return innerSum + (isNaN(amount) ? 0 : amount)
      }, 0)
      return sum + amountSum
    }, 0)
  },

  // 세부 항목(ContractDetailItems) 추가
  addContractDetailItem: (managerId: number) =>
    set((state) => ({
      form: {
        ...state.form,
        contractManagers: state.form.contractManagers.map((manager) =>
          manager.id === managerId
            ? {
                ...manager,
                items: [
                  ...manager.items,
                  {
                    id: Date.now(),
                    item: '',
                    specification: '',
                    unit: '',
                    unitPrice: 0,
                    contractQuantity: 0,
                    contractPrice: 0,
                    outsourcingContractQuantity: 0,
                    outsourcingContractPrice: 0,
                    memo: '',
                  },
                ],
              }
            : manager,
        ),
      },
    })),

  // 세부 항목 삭제
  removeContractDetailItem: (managerId: number, itemId: number) =>
    set((state) => ({
      form: {
        ...state.form,
        contractManagers: state.form.contractManagers.map((manager) =>
          manager.id === managerId
            ? {
                ...manager,
                items: manager.items.filter((item) => item.id !== itemId),
              }
            : manager,
        ),
      },
    })),

  // 세부 항목 수정
  updateContractDetailField: (
    managerId: number,
    itemId: number,
    field: keyof ContractDetailItems,
    value: string | number,
  ) =>
    set((state) => ({
      form: {
        ...state.form,
        contractManagers: state.form.contractManagers.map((manager) =>
          manager.id === managerId
            ? {
                ...manager,
                items: manager.items.map((detail) =>
                  detail.id === itemId ? { ...detail, [field]: value } : detail,
                ),
              }
            : manager,
        ),
      },
    })),

  newOutsourcingContractData: () => {
    const form = get().form
    return {
      siteId: form.siteId,
      siteProcessId: form.processId,
      outsourcingCompanyId: form.CompanyId,
      type: form.type,
      typeDescription: form.typeDescription,
      contractStartDate: getTodayDateString(form.contractStartDate),
      contractEndDate: getTodayDateString(form.contractEndDate),
      contractAmount: form.contractAmount,

      defaultDeductionsType: form.defaultDeductions,
      defaultDeductionsDescription: form.defaultDeductionsDescription,
      taxInvoiceCondition: form.taxCalculat,
      taxInvoiceIssueDayOfMonth: form.taxInvoiceIssueDayOfMonth,
      category: form.category === '' ? undefined : form.category,
      status: form.status,
      workTypeName: form.workTypeName,
      memo: form.memo,
      contacts: form.headManagers.map((m) => ({
        id: m.id || Date.now(),
        name: m.name,
        position: m.position,
        department: m.department,
        landlineNumber: `${m.managerAreaNumber}-${m.landlineNumber}`,
        phoneNumber: m.phoneNumber,
        email: m.email,
        memo: m.memo,
        isMain: m.isMain ?? false,
      })),

      // 첨부파일에 파일 업로드를 안할 시 null 로 넣는다..
      files: form.attachedFiles.flatMap((f) => {
        if (!f.files || f.files.length === 0) {
          // 파일이 없을 경우에도 name, memo는 전송
          return [
            {
              id: f.id || Date.now(),
              name: f.name,
              memo: f.memo || '',
              fileUrl: '',
              originalFileName: '',
              type: f.type,
            },
          ]
        }

        // 파일이 있을 경우
        return f.files.map((fileObj: FileUploadInfo) => ({
          id: f.id || Date.now(),
          name: f.name,
          fileUrl: fileObj.fileUrl || '',
          originalFileName: fileObj.name || fileObj.originalFileName,
          memo: f.memo || '',
          type: f.type,
        }))
      }),

      workers: form.personManagers.map((item) => ({
        id: item.id || Date.now(),
        name: item.name,
        category: item.category,
        taskDescription: item.taskDescription,
        memo: item.memo,
        files: (item.files ?? []).map((fileObj) => ({
          id: fileObj.id || Date.now(),
          fileUrl: fileObj.fileUrl,
          originalFileName: fileObj.originalFileName,
        })),
      })),

      constructionsV2: form.contractManagers.map((m) => ({
        id: m.id || Date.now(),
        itemName: m.itemName,
        items: m.items,
        // item: m.item,
        // specification: m.specification,
        // unit: m.unit,
        // unitPrice: m.unitPrice,
        // contractQuantity: m.contractQuantity,
        // contractPrice: m.contractPrice,
        // outsourcingContractQuantity: m.outsourcingContractQuantity,
        // outsourcingContractPrice: m.outsourcingContractPrice,
        // memo: m.memo,
      })),

      equipments: form.equipmentManagers.map((item) => ({
        id: item.id || Date.now(),
        specification: item.specification,
        vehicleNumber: item.vehicleNumber,
        category: item.category,
        unitPrice: item.unitPrice,
        taskDescription: item.taskDescription,
        memo: item.memo,
        subEquipments:
          item.subEquipments?.map((sub) => ({
            id: sub.id || Date.now(),
            type: sub.typeCode,
            description: sub.description,
            unitPrice: sub.unitPrice,
            memo: sub.memo,
          })) || [],
      })),

      // 우선은 한일 파일만 첨부됌
      drivers: form.articleManagers.map((item) => {
        const driverLicenseFiles = item.driverLicense || []
        const safeEducationFiles = item.safeEducation || []
        const etcDocumentFiles = item.ETCfiles || []

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const files: any = []

        driverLicenseFiles.forEach((fileObj) => {
          if (fileObj.file || fileObj.fileUrl) {
            files.push({
              id: fileObj.id || Date.now(),
              documentType: 'DRIVER_LICENSE',
              fileUrl: fileObj.fileUrl || '',
              originalFileName: fileObj.originalFileName || '',
            })
          }
        })

        safeEducationFiles.forEach((fileObj) => {
          if (fileObj.file || fileObj.fileUrl) {
            files.push({
              id: fileObj.id || Date.now(),
              documentType: 'SAFETY_EDUCATION',
              fileUrl: fileObj.fileUrl || '',
              originalFileName: fileObj.originalFileName || '',
            })
          }
        })

        etcDocumentFiles.forEach((fileObj) => {
          if (fileObj.file || fileObj.fileUrl) {
            files.push({
              id: fileObj.id || Date.now(),
              documentType: 'ETC_DOCUMENT',
              fileUrl: fileObj.fileUrl || '',
              originalFileName: fileObj.originalFileName || '',
            })
          }
        })

        return {
          id: item.id || Date.now(),
          name: item.name,
          memo: item.memo,
          files,
        }
      }),

      changeHistories: form.editedHistories ?? [],
    }
  },
}))
