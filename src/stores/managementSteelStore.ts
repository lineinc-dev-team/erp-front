import {
  AttachedFile,
  MaterialItem,
  SteelFormStore,
  SteelSearchState,
} from '@/types/managementSteel'
import { create } from 'zustand'

export const useSteelSearchStore = create<{ search: SteelSearchState }>((set) => ({
  search: {
    searchTrigger: 0,
    siteName: '',
    processName: '',
    itemName: '',
    type: '',
    paymentStartDate: null,
    paymentEndDate: null,
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
          siteName: '',
          processName: '',
          itemName: '',
          type: '',
          paymentStartDate: null,
          paymentEndDate: null,
          arraySort: '최신순',
          currentPage: 1,
          pageCount: '10',
          searchTrigger: 0,
        },
      })),
  },
}))

export const useManagementSteelFormStore = create<SteelFormStore>((set, get) => ({
  form: {
    siteId: 0,
    siteProcessId: 0,
    usage: '',
    type: '선택',
    paymentDate: null,
    memo: '',

    clientName: '',
    businessNumber: '',
    rentalStartDate: null,
    rentalEndDate: null,

    details: [],
    checkedMaterialItemIds: [],

    attachedFiles: [],
    checkedAttachedFileIds: [],

    modificationHistory: [],
  },

  reset: () =>
    set(() => ({
      form: {
        siteId: 0,
        siteProcessId: 0,
        usage: '',
        type: '선택',
        paymentDate: null,
        memo: '',
        clientName: '',
        businessNumber: '',
        rentalStartDate: null,
        rentalEndDate: null,
        details: [],
        checkedMaterialItemIds: [],
        attachedFiles: [],
        checkedAttachedFileIds: [],
        modificationHistory: [],
      },
    })),

  setField: (field, value) =>
    set((state) => ({
      form: { ...state.form, [field]: value },
    })),

  addItem: (typeName) =>
    set((state) => {
      const id = Date.now()
      if (typeName === 'MaterialItem') {
        const newItem: MaterialItem = {
          id,
          standard: '',
          name: '',
          unit: '',
          count: 0,
          length: 0,
          totalLength: 0,
          unitWeight: 0,
          quantity: 0,
          unitPrice: 0,
          supplyPrice: 0,
          memo: '',
        }
        return {
          form: {
            ...state.form,
            details: [...state.form.details, newItem],
          },
        }
      } else {
        const newFile: AttachedFile = {
          id,
          name: '',
          memo: '',
          files: [],
        }
        return { form: { ...state.form, attachedFiles: [...state.form.attachedFiles, newFile] } }
      }
    }),

  updateItemField: (typeName, id, field, value) =>
    set((state) => {
      if (typeName === 'MaterialItem') {
        return {
          form: {
            ...state.form,
            details: state.form.details.map((item) =>
              item.id === id ? { ...item, [field]: value } : item,
            ),
          },
        }
      } else {
        return {
          form: {
            ...state.form,
            attachedFiles: state.form.attachedFiles.map((file) =>
              file.id === id ? { ...file, [field]: value } : file,
            ),
          },
        }
      }
    }),

  toggleCheckItem: (typeName, id, checked) =>
    set((state) => {
      if (typeName === 'MaterialItem') {
        return {
          form: {
            ...state.form,
            checkedMaterialItemIds: checked
              ? [...state.form.checkedMaterialItemIds, id]
              : state.form.checkedMaterialItemIds.filter((cid) => cid !== id),
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

  toggleCheckAllItems: (typeName, checked) =>
    set((state) => {
      if (typeName === 'MaterialItem') {
        return {
          form: {
            ...state.form,
            checkedMaterialItemIds: checked ? state.form.details.map((i) => i.id) : [],
          },
        }
      } else {
        return {
          form: {
            ...state.form,
            checkedAttachmentFileIds: checked ? state.form.attachedFiles.map((f) => f.id) : [],
          },
        }
      }
    }),

  removeCheckedItems: (typeName) =>
    set((state) => {
      if (typeName === 'MaterialItem') {
        return {
          form: {
            ...state.form,
            details: state.form.details.filter(
              (item) => !state.form.checkedMaterialItemIds.includes(item.id),
            ),
            checkedMaterialItemIds: [],
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

  newSteelData: () => {
    const form = get().form
    console.log('폼 데이터가 들어옴>>', form.details)
    return {
      ...form,
      details: form.details,
      files: form.attachedFiles.flatMap((f) =>
        f.files.map((fileObj) => ({
          name: f.name,
          fileUrl: fileObj.publicUrl,
          originalFileName: fileObj.file?.name || '',
          memo: f.memo,
        })),
      ),
    }
  },
}))

// materialItems
