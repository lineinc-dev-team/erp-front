import { AttachedFile, LaborInfoFormStore, LaborSearchState } from '@/types/labor'
import { getTodayDateString } from '@/utils/formatters'
import { create } from 'zustand'

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
          pageCount: '10',
        },
      })),
  },
}))

export const useLaborFormStore = create<LaborInfoFormStore>((set, get) => ({
  form: {
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
    bankName: '선택',
    accountNumber: '',
    accountHolder: '',
    hireDate: null,
    resignationDate: null,
    initialHireDateAt: '',
    initialResignationDateAt: '',
    files: [],
    checkedAttachedFileIds: [],
    changeHistories: [],
    editedHistories: [],
  },
  reset: () =>
    set(() => ({
      form: {
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
        bankName: '선택',
        accountNumber: '',
        accountHolder: '',
        hireDate: null,
        resignationDate: null,
        initialHireDateAt: '',
        initialResignationDateAt: '',
        files: [],
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
      const id = Date.now()
      if (typeName === 'attachedFile') {
        const newFile: AttachedFile = {
          id,
          name: '',
          memo: '',
          files: [],
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

      hireDate: hireDateStr !== form.initialHireDateAt ? hireDateStr : form.initialHireDateAt,
      resignationDate:
        resignationDateStr !== form.initialResignationDateAt
          ? resignationDateStr
          : form.initialResignationDateAt,

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
// materialItems
