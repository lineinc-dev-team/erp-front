import { create } from 'zustand'
import {
  OutsourcingAttachedFile,
  OutsourcingCompanyFormStore,
  OutsourcingManager,
  OutsourcingSearchState,
} from '@/types/outsourcingCompany'

export const idTypeValueToName: Record<string, string> = {
  기업은행: '1',
  농협은행: '2',
  우리은행: '3',
  카카오뱅크: '4',
  국민은행: '5',
  신한은행: '6',
}

export const bankTypeValueToLabel: Record<string, string> = {
  '1': '기업은행',
  '2': '농협은행',
  '3': '우리은행',
  '4': '카카오뱅크',
  '5': '국민은행',
  '6': '신한은행',
}

export const useOutsourcingSearchStore = create<{ search: OutsourcingSearchState }>((set) => ({
  search: {
    searchTrigger: 0,
    name: '',
    businessNumber: '',
    ceoName: '',
    landlineNumber: '',
    type: '',
    startDate: null,
    endDate: null,
    isActive: '0',
    arraySort: '최신순',
    currentPage: 1,
    pageCount: '10',

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
          name: '',
          businessNumber: '',
          ceoName: '',
          landlineNumber: '',
          type: '',
          startDate: null,
          endDate: null,
          isActive: '0',
          arraySort: '최신순',
          currentPage: 1,
          pageCount: '10',
          searchTrigger: 0,
        },
      })),
  },
}))

export const useOutsourcingFormStore = create<OutsourcingCompanyFormStore>((set, get) => ({
  form: {
    name: '',
    businessNumber: '',
    type: '',
    typeDescription: '',
    ceoName: '',
    address: '',
    detailAddress: '',
    isModalOpen: false,
    landlineNumber: '지역번호',
    landlineLastNumber: '',
    phoneNumber: '',
    email: '',
    defaultDeductions: '',
    defaultDeductionsDescription: '',
    bankName: '0',
    accountNumber: '',
    accountHolder: '',
    memo: '',
    isActive: '0',

    currentPage: 1,
    pageCount: '10',
    headManagers: [],
    checkedManagerIds: [],
    attachedFiles: [],
    checkedAttachedFileIds: [],
    changeHistories: [],
  },
  reset: () =>
    set(() => ({
      form: {
        name: '',
        businessNumber: '',
        type: '',
        typeDescription: '',
        ceoName: '',
        address: '',
        detailAddress: '',
        isModalOpen: false,
        landlineNumber: '지역번호',
        landlineLastNumber: '',
        phoneNumber: '',
        email: '',
        defaultDeductions: '',
        defaultDeductionsDescription: '',
        bankName: '0',
        accountNumber: '',
        accountHolder: '',
        memo: '',
        isActive: '0',
        currentPage: 1,
        pageCount: '10',
        headManagers: [],
        checkedManagerIds: [],
        attachedFiles: [],
        checkedAttachedFileIds: [],
        modificationHistory: [],
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

  addItem: (type) =>
    set((state) => {
      if (type === 'manager') {
        const newItem: OutsourcingManager = {
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
      } else {
        const newItem: OutsourcingAttachedFile = {
          id: Date.now(),
          name: '',
          memo: '',
          files: [],
        }
        return { form: { ...state.form, attachedFiles: [...state.form.attachedFiles, newItem] } }
      }
    }),

  updateItemField: (type, id, field, value) =>
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
      } else {
        return {
          form: {
            ...state.form,
            checkedAttachedFileIds: checked ? state.form.attachedFiles.map((f) => f.id) : [],
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

  newOutsourcingCompanyData: () => {
    const form = get().form
    return {
      name: form.name,
      businessNumber: form.businessNumber,
      type: form.type,
      typeDescription: form.typeDescription,
      ceoName: form.ceoName,
      address: form.address,
      detailAddress: form.detailAddress,
      landlineNumber: `${form.landlineNumber}-${form.landlineLastNumber}`,
      email: form.email,
      defaultDeductions: form.defaultDeductions,
      defaultDeductionsDescription: form.defaultDeductionsDescription,
      bankName: bankTypeValueToLabel[form.bankName] || '',
      accountNumber: form.accountNumber,
      accountHolder: form.accountHolder,
      memo: form.memo,
      isActive: form.isActive === '1' ? true : false,

      contacts: form.headManagers.map((m) => ({
        id: m.id,
        name: m.name,
        position: m.position,
        department: m.department,
        landlineNumber: `${m.managerAreaNumber}-${m.landlineNumber}`,
        phoneNumber: m.phoneNumber,
        email: m.email,
        memo: m.memo,
        isMain: m.isMain || false, // 여기 추가
      })),

      // 첨부파일에 파일 업로드를 안할 시 null 로 넣는다..
      files: form.attachedFiles.flatMap((f) => {
        if (!f.files || f.files.length === 0) {
          // 파일이 없을 경우에도 name, memo는 전송
          return [
            {
              id: f.id || Date.now(),
              name: f.name,
              fileUrl: '',
              originalFileName: '',
              memo: f.memo || '',
            },
          ]
        }

        // 파일이 있을 경우
        return f.files.map((fileObj: FileUploadInfo) => ({
          id: f.id || Date.now(),
          name: f.name,
          fileUrl: fileObj.fileUrl || '',
          originalFileName: fileObj.file?.name || '',
          memo: f.memo || '',
        }))
      }),
      changeHistories: form.editedHistories ?? [],
    }
  },
}))
