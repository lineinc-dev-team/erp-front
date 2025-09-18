import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useSnackbarStore } from './useSnackbarStore'

type TabItem = {
  label: string
  path: string
  meta?: {
    displayName?: string
    isDetailPage?: boolean
  }
}

type TabStore = {
  tabs: TabItem[]
  addTab: (tab: TabItem) => void
  removeTab: (path: string) => void
  resetTabs: () => void
}

export const useTabStore = create<TabStore>()(
  persist(
    (set, get) => ({
      tabs: [{ label: '대쉬보드 - 조회', path: '/dashboard' }],
      // tabs: [{ label: '출역일보 - 조회', path: '/dailyReport/registration' }],

      addTab: (tab) => {
        const tabs = get().tabs
        const exists = tabs.some((t) => t.path === tab.path)

        if (!exists) {
          if (tabs.length < 10) {
            set({ tabs: [...tabs, tab] })
          } else {
            const { showSnackbar } = useSnackbarStore.getState()
            showSnackbar('탭은 최대 10개까지 열 수 있습니다.', 'warning')
          }
        }
      },

      removeTab: (path) => {
        const tabs = get().tabs.filter((t) => t.path !== path)
        set({ tabs })
      },
      resetTabs: () => set({ tabs: [] }),
    }),
    {
      name: 'tab-storage',
      storage: {
        getItem: (name) => {
          const item = sessionStorage.getItem(name)
          return item ? JSON.parse(item) : null
        },
        setItem: (name, value) => {
          sessionStorage.setItem(name, JSON.stringify(value))
        },
        removeItem: (name) => {
          sessionStorage.removeItem(name)
        },
      },
    },
  ),
)
