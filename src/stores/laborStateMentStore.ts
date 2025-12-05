/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  LaborStateMentSearchState,
  LaborSummaryFormState,
  LaborSummaryStore,
} from '@/types/laborStateMent'
import { create } from 'zustand'

export const useLaborStateMentSearchStore = create<{ search: LaborStateMentSearchState }>(
  (set) => ({
    search: {
      searchTrigger: 0,
      siteId: 0,
      siteName: '',
      processId: 0,
      processName: '',
      yearMonth: '',
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
            yearMonth: '',
            arraySort: '최신순',
            currentPage: 1,
            pageCount: '20',
          },
        })),
    },
  }),
)

type LaborSummaryPayload = Pick<
  LaborSummaryFormState,
  'memo' | 'changeHistories' | 'editedHistories'
>

export const useLaborSummaryFormStore = create<LaborSummaryStore>((set, get) => ({
  form: {
    siteId: 0,
    siteName: '',
    processId: 0,
    processName: '',
    yearMonth: '',
    memo: '',
    changeHistories: [],
    editedHistories: [],
    laborStateMentInfo: [],
  },

  editedRows: new Set<number>(),

  reset: () =>
    set(() => ({
      form: {
        siteId: 0,
        siteName: '',
        processId: 0,
        processName: '',
        yearMonth: '',
        memo: '',
        changeHistories: [],
        editedHistories: [],
        laborStateMentInfo: [],
      },
      editedRows: new Set<number>(),
    })),

  setField: (field, value) =>
    set((state) => ({
      form: {
        ...state.form,
        [field]: value,
      },
    })),

  updateItemField: <T>(
    type: 'REGULAR_EMPLOYEE' | 'DIRECT_CONTRACT' | 'ETC',
    id: number,
    field: string,
    value: T,
  ) =>
    set((state) => {
      // 수정된 row id를 기록할 Set 초기화
      const editedRows = state.editedRows ? new Set(state.editedRows) : new Set<number>()

      // 처리할 타입
      if (['REGULAR_EMPLOYEE', 'DIRECT_CONTRACT', 'ETC'].includes(type)) {
        const newLaborStateMentInfo = state.form.laborStateMentInfo.map((row) => {
          if (row.id !== id) return row

          // dailyWork 배열 업데이트인지 확인
          if (field.startsWith('dailyWork')) {
            const idx = Number(field.split('.')[1])
            const newDailyWork = [...row.dailyWork] // 불변성 유지
            newDailyWork[idx] = value
            return { ...row, dailyWork: newDailyWork }
          } else {
            return { ...row, [field]: value }
          }
        })

        // 수정된 row id 기록
        editedRows.add(id)

        return {
          form: {
            ...state.form,
            laborStateMentInfo: newLaborStateMentInfo,
          },
          editedRows,
        }
      }

      return state
    }),

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

  // 신규 등록용 payload
  newLaborSummary: (): LaborSummaryPayload => {
    const form = get().form
    return {
      memo: form.memo,
      changeHistories: form.changeHistories ?? [],
      editedHistories: form.editedHistories,
    }
  },

  updateLaborSummary: () => {
    const form = get().form
    const editedRows = get().editedRows // 수정된 row id Set

    return {
      laborPayrollInfos: form.laborStateMentInfo
        .filter((row) => editedRows.has(row.id)) // 수정된 row만 선택
        .map(
          ({
            task,
            no,
            position,
            type,
            company,
            name,
            idNumber,
            address,

            accountHolder,
            accountNumber,
            bankName,
            detailAddress,

            dailyWork,
            ...rest
          }) => {
            const dailyWorkObj: Record<string, number | null> = {}
            for (let i = 0; i < 31; i++) {
              dailyWorkObj[`day${String(i + 1).padStart(2, '0')}Hours`] = dailyWork[i] ?? null
            }
            return { ...rest, ...dailyWorkObj }
          },
        ),
    }
  },

  // updateLaborSummary: () => {
  //   const form = get().form

  //   return {
  //     laborPayrollInfos: form.laborStateMentInfo.map(
  //       ({ task, no, position, type, company, name, idNumber, dailyWork, ...rest }) => {
  //         // dailyWork 배열을 day01Hours ~ day31Hours 형태로 변환
  //         const dailyWorkObj: Record<string, number | null> = {}
  //         for (let i = 0; i < 31; i++) {
  //           dailyWorkObj[`day${String(i + 1).padStart(2, '0')}Hours`] = dailyWork[i] ?? null
  //         }

  //         return {
  //           ...rest,
  //           ...dailyWorkObj,
  //         }
  //       },
  //     ),
  //   }
  // },
}))
