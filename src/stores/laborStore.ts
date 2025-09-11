import { AttachedFile, LaborInfoFormStore, LaborSearchState } from '@/types/labor'
import { getTodayDateString } from '@/utils/formatters'
import { create } from 'zustand'

export const bankTypeValueToLabel: Record<string, string> = {
  '0': '선택',
  '1': '기업은행',
  '2': '농협은행',
  '3': '우리은행',
  '4': '카카오뱅크',
  '5': '국민은행',
  '6': '신한은행',
}

export const useLaborSearchStore = create<{ search: LaborSearchState }>((set) => ({
  search: {
    searchTrigger: 0,
    type: '',
    typeDescription: '',
    name: '',
    residentNumber: '',
    outsourcingCompanyId: -1,
    phoneNumber: '',
    isHeadOffice: null,
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
          type: '',
          typeDescription: '',
          name: '',
          residentNumber: '',
          outsourcingCompanyId: -1,
          phoneNumber: '',
          isHeadOffice: null,
          arraySort: '최신순',
          currentPage: 1,
          pageCount: '20',
        },
      })),
  },
}))

export const useLaborFormStore = create<LaborInfoFormStore>((set, get) => ({
  form: {
    currentPage: 1,
    type: '',
    typeDescription: '',
    outsourcingCompanyId: -1,
    outsourcingCompanyName: '',
    name: '',
    residentNumber: '',
    address: '',
    detailAddress: '',
    isModalOpen: false,
    phoneNumber: '',
    memo: '',
    workType: '',
    workTypeDescription: '',
    mainWork: '',
    dailyWage: 0,
    bankName: '0',
    accountNumber: '',
    accountHolder: '',
    hireDate: null,
    resignationDate: null,
    tenureDays: '',
    isSeverancePayEligible: '',
    initialHireDateAt: '',
    initialResignationDateAt: '',
    files: [
      {
        id: Date.now(),
        name: '신분증 사본',
        memo: '',
        files: [],
        type: 'ID_CARD',
      },
      {
        id: Date.now() + 1,
        name: '통장 사본',
        memo: '',
        files: [],
        type: 'BANKBOOK',
      },
      {
        id: Date.now() + 2,
        name: '서명이미지',
        memo: '',
        files: [],
        type: 'SIGNATURE_IMAGE',
      },
    ],
    checkedAttachedFileIds: [],
    changeHistories: [],
    editedHistories: [],
  },
  reset: () =>
    set(() => ({
      form: {
        currentPage: 1,
        type: '',
        typeDescription: '',
        outsourcingCompanyId: -1,
        outsourcingCompanyName: '',
        name: '',
        residentNumber: '',
        address: '',
        detailAddress: '',
        isModalOpen: false,
        phoneNumber: '',
        memo: '',
        workType: '',
        workTypeDescription: '',
        mainWork: '',
        dailyWage: 0,
        bankName: '0',
        accountNumber: '',
        accountHolder: '',
        hireDate: null,
        resignationDate: null,
        tenureDays: '',
        isSeverancePayEligible: '',
        initialHireDateAt: '',
        initialResignationDateAt: '',
        files: [
          {
            id: Date.now(),
            name: '신분증 사본',
            memo: '',
            files: [],
            type: 'ID_CARD',
          },
          {
            id: Date.now() + 1,
            name: '통장 사본',
            memo: '',
            files: [],
            type: 'BANKBOOK',
          },
          {
            id: Date.now() + 2,
            name: '서명이미지',
            memo: '',
            files: [],
            type: 'SIGNATURE_IMAGE',
          },
        ],
        checkedAttachedFileIds: [],
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
  updateMemo: (id, value) =>
    set((state) => {
      const updatedHistories = state.form.changeHistories.map((history) =>
        history.id === id ? { ...history, memo: value } : history,
      )
      const edited = state.form.editedHistories ?? []
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
      if (typeName === 'attachedFile') {
        const newFile: AttachedFile = {
          id: Date.now(),
          name: '',
          memo: '',
          files: [],
          type: 'BASIC',
        }
        return {
          form: {
            ...state.form,
            files: [...state.form.files, newFile],
          },
        }
      }
      return state
    }),
  updateItemField: (typeName, id, field, value) =>
    set((state) => {
      if (typeName === 'attachedFile') {
        return {
          form: {
            ...state.form,
            files: state.form.files.map((file) =>
              file.id === id ? { ...file, [field]: value } : file,
            ),
          },
        }
      }
      return state
    }),
  toggleCheckItem: (typeName, id, checked) =>
    set((state) => {
      if (typeName === 'attachedFile') {
        return {
          form: {
            ...state.form,
            checkedAttachedFileIds: checked
              ? [...state.form.checkedAttachedFileIds, id]
              : state.form.checkedAttachedFileIds.filter((cid) => cid !== id),
          },
        }
      }
      return state
    }),
  toggleCheckAllItems: (typeName, checked) =>
    set((state) => {
      if (typeName === 'attachedFile') {
        return {
          form: {
            ...state.form,
            checkedAttachedFileIds: checked ? state.form.files.map((f) => f.id) : [],
          },
        }
      }
      return state
    }),
  removeCheckedItems: (typeName) =>
    set((state) => {
      if (typeName === 'attachedFile') {
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
      return state
    }),
  newLaborData: () => {
    const form = get().form

    const hireDateStr = getTodayDateString(form.hireDate)
    const resignationDateStr = getTodayDateString(form.resignationDate)
    return {
      ...form,

      bankName: bankTypeValueToLabel[form.bankName] || '',
      hireDate: hireDateStr !== form.initialHireDateAt ? hireDateStr : form.initialHireDateAt,
      resignationDate:
        resignationDateStr !== form.initialResignationDateAt
          ? resignationDateStr
          : form.initialResignationDateAt,

      outsourcingCompanyId:
        form.outsourcingCompanyId === -1 ? undefined : form.outsourcingCompanyId,
      // 첨부파일에 파일 업로드를 안할 시 null 로 넣는다..
      files: form.files.flatMap((f) => {
        if (!f.files || f.files.length === 0) {
          // 파일이 없을 경우에도 name, memo는 전송
          return [
            {
              id: f.id || Date.now(),
              name: f.name,
              fileUrl: '',
              originalFileName: '',
              memo: f.memo || '',
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
      changeHistories: form.editedHistories ?? [],
    }
  },
}))
// materialItems
