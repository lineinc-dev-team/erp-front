import {
  AttachedFile,
  MaterialFormStore,
  MaterialItem,
  MaterialSearchState,
} from '@/types/materialManagement'
import { create } from 'zustand'

export const MaterialTypeLabelToValue: Record<string, string> = {
  '주요자재(구매)': 'MAJOR_PURCHASE',
  '주요자재(임대)': 'MAJOR_LEASE',
  '주요자재(자사)': 'MAJOR_INTERNAL',
  부대토목자재: 'CIVIL_SUPPORT',
  '잡자재(공구)': 'TOOL_MISC',
  '잡자재(잡철)': 'METAL_MISC',
  '안전(안전관리비)': 'SAFETY',
  '환경(환경관리비)': 'ENVIRONMENT',
  운반비: 'TRANSPORT',
}

export const useMaterialSearchStore = create<{ search: MaterialSearchState }>((set) => ({
  search: {
    searchTrigger: 0,
    siteName: '',
    processName: '',
    materialName: '',
    deliveryStartDate: null,
    deliveryEndDate: null,
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
          materialName: '',
          deliveryStartDate: null,
          deliveryEndDate: null,
          arraySort: '최신순',
          currentPage: 1,
          pageCount: '10',
          searchTrigger: 0,
        },
      })),
  },
}))

export const useManagementMaterialFormStore = create<MaterialFormStore>((set, get) => ({
  form: {
    siteId: 0,
    siteProcessId: 0,
    inputType: '선택',
    inputTypeDescription: '',
    deliveryDate: null,
    memo: '',
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
        inputType: '선택',
        inputTypeDescription: '',
        deliveryDate: null,
        memo: '',
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
          name: '',
          standard: '',
          usage: '',
          quantity: 0,
          unitPrice: 0,
          supplyPrice: 0,
          vat: 0,
          total: 0,
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

  newMaterialData: () => {
    const form = get().form
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
