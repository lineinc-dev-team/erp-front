import { create } from 'zustand'
import type {
  Manager,
  AttachedFile,
  OrderingSearchState,
  ClientCompanyFormStore,
} from '@/types/ordering'

export const useOrderingSearchStore = create<{ search: OrderingSearchState }>((set) => ({
  search: {
    searchTrigger: 0,
    name: '',
    businessNumber: '',
    ceoName: '',
    userName: '',
    landlineNumber: '',
    contactName: '',
    email: '',
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
          searchTrigger: 0,
          name: '',
          businessNumber: '',
          currentPage: 1,
          ceoName: '',
          userName: '',
          areaNumber: '',
          landlineNumber: '',
          contactName: '',
          email: '',
          startDate: null,
          endDate: null,
          arraySort: '최신순',
          pageCount: '20',
          isActive: '0',
        },
      })),

    handleOrderingListRemove: () => {
      alert('리스트에 대한 삭제가 됩니다.')
    },
  },
}))

export const useOrderingFormStore = create<ClientCompanyFormStore>((set, get) => ({
  form: {
    name: '',
    businessNumber: null,
    ceoName: '',
    address: '',
    detailAddress: '',
    areaNumber: '지역번호',
    landlineNumber: '',
    phoneNumber: '',
    isModalOpen: false,
    email: '',
    paymentMethod: '',
    paymentPeriod: '',
    memo: '',
    isActive: '1',
    userId: 0,
    userName: '',
    homepageUrl: '',
    homepageLoginId: '',
    homepagePassword: '',
    headManagers: [
      {
        id: Date.now(),
        name: '',
        position: '',
        department: '',
        managerAreaNumber: '지역번호',
        landlineNumber: '',
        phoneNumber: '',
        email: '',
        memo: '',
        isMain: false, //대표 담당자
      },
    ],
    checkedManagerIds: [],
    attachedFiles: [
      // {
      //   id: Date.now(),
      //   name: '사업자등록증',
      //   memo: '',
      //   files: [],
      //   type: 'BUSINESS_LICENSE',
      // },
    ],
    checkedAttachedFileIds: [],
    modificationHistory: [],
    changeHistories: [],
  },
  reset: () =>
    set(() => ({
      form: {
        name: '',
        businessNumber: null,
        ceoName: '',
        address: '',
        userId: 0,
        userName: '',
        detailAddress: '',
        areaNumber: '지역번호',
        landlineNumber: '',
        phoneNumber: '',
        isModalOpen: false,
        email: '',
        paymentMethod: '',
        paymentPeriod: '',
        memo: '',
        isActive: '1',
        homepageUrl: '',
        homepageLoginId: '',
        homepagePassword: '',
        headManagers: [
          {
            id: Date.now(),
            name: '',
            position: '',
            department: '',
            managerAreaNumber: '지역번호',
            landlineNumber: '',
            phoneNumber: '',
            email: '',
            memo: '',
            isMain: false, //대표 담당자
          },
        ],
        checkedManagerIds: [],
        attachedFiles: [
          // {
          //   id: Date.now(),
          //   name: '사업자등록증',
          //   memo: '',
          //   files: [],
          //   type: 'BUSINESS_LICENSE',
          // },
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
        const newItem: Manager = {
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
        // 기존 파일 개수 확인

        const newItem: AttachedFile = {
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

  newClientCompanyData: () => {
    const form = get().form
    return {
      name: form.name,
      businessNumber: form.businessNumber,
      ceoName: form.ceoName,
      address: form.address,
      detailAddress: form.detailAddress,
      landlineNumber:
        `${form.areaNumber}-${form.landlineNumber}` === '지역번호-'
          ? null
          : `${form.areaNumber}-${form.landlineNumber}`,
      phoneNumber: form.phoneNumber === '' ? null : form.phoneNumber,
      email: form.email,
      paymentMethod: form.paymentMethod === '' ? null : form.paymentMethod,
      paymentPeriod: form.paymentPeriod,
      memo: form.memo,
      isActive: form.isActive === '1' ? true : false,
      userId: form.userId === 0 ? null : form.userId,
      homepageUrl: form.homepageUrl,
      homepageLoginId: form.homepageLoginId,
      homepagePassword: form.homepagePassword,
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
