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
  KB증권: '7',
  BNK투자증권: '8',
  DB금융투자: '9',
  IBK투자증권: '10',
  KTB투자증권: '11',
  키움증권: '12',
  교보증권: '13',
  대신증권: '14',
  메리츠증권: '15',
  미래에셋증권: '16',
  부국증권: '17',
  삼성증권: '18',
  신한금융투자: '19',
  신영증권: '20',
  아이엠투자증권: '21',
  유안타증권: '22',
  유진투자증권: '23',
  이베스트투자증권: '24',
  케이에프투자증권: '25',
  한화증권: '26',
  하나금융투자: '27',
  SK증권: '28',
  카카오페이증권: '29',
}

export const bankTypeValueToLabel: Record<string, string> = {
  '0': '선택',
  '1': '기업은행',
  '2': '농협은행',
  '3': '우리은행',
  '4': '카카오뱅크',
  '5': '국민은행',
  '6': '신한은행',
  '7': 'KB증권',
  '8': 'BNK투자증권',
  '9': 'DB금융투자',
  '10': 'IBK투자증권',
  '11': 'KTB투자증권',
  '12': '키움증권',
  '13': '교보증권',
  '14': '대신증권',
  '15': '메리츠증권',
  '16': '미래에셋증권',
  '17': '부국증권',
  '18': '삼성증권',
  '19': '신한금융투자',
  '20': '신영증권',
  '21': '아이엠투자증권',
  '22': '유안타증권',
  '23': '유진투자증권',
  '24': '이베스트투자증권',
  '25': '케이에프투자증권',
  '26': '한화증권',
  '27': '하나금융투자',
  '28': 'SK증권',
  '29': '카카오페이증권',
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
          pageCount: '20',
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
    areaNumber: '지역번호',
    landlineNumber: '',
    phoneNumber: '',
    email: '',
    defaultDeductions: '',
    defaultDeductionsDescription: '',
    bankName: '0',
    accountNumber: '',
    accountHolder: '',
    memo: '',
    isActive: '1',

    searchTrigger: 0,
    arraySort: 'createdAt,desc',
    currentPage: 1,
    pageCount: '20',

    headManagers: [],
    checkedManagerIds: [],
    attachedFiles: [
      {
        id: Date.now(),
        name: '사업자등록증',
        memo: '',
        files: [],
        type: 'BUSINESS_LICENSE',
      },
    ],
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
        areaNumber: '지역번호',
        landlineNumber: '',
        phoneNumber: '',
        email: '',
        defaultDeductions: '',
        defaultDeductionsDescription: '',
        bankName: '0',
        accountNumber: '',
        accountHolder: '',
        memo: '',
        isActive: '1',

        searchTrigger: 0,
        arraySort: 'createdAt,desc',
        currentPage: 1,
        pageCount: '20',

        headManagers: [],
        checkedManagerIds: [],
        attachedFiles: [
          {
            id: Date.now(),
            name: '사업자등록증',
            memo: '',
            files: [],
            type: 'BUSINESS_LICENSE',
          },
        ],
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
          type: 'BASIC',
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
            checkedAttachedFileIds: checked
              ? state.form.attachedFiles
                  .filter((f) => f.type !== 'BUSINESS_LICENSE') // 제외
                  .map((f) => f.id) // id만 추출
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
      landlineNumber: `${form.areaNumber}-${form.landlineNumber}`,
      email: form.email,
      // defaultDeductions: form.defaultDeductions,
      // defaultDeductionsDescription: form.defaultDeductionsDescription,
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
              memo: f.memo || '',
              fileUrl: '',
              originalFileName: '',
              type: f.type,
            },
          ]
        }

        // 파일이 있을 경우
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
      changeHistories: form.editedHistories ?? [],
    }
  },
}))
