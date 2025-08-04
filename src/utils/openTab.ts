import { useRouter } from 'next/navigation'
import { useTabStore } from '@/stores/useTabStore'

export function useTabOpener() {
  const router = useRouter()

  return (tabPath: string, tabLabel: string) => {
    const storedTabs = JSON.parse(sessionStorage.getItem('tabs') || '[]') as Array<{
      path: string
      label: string
    }>

    const tabExists = storedTabs.some((tab) => tab.path === tabPath)
    if (!tabExists) {
      const newTabs = [...storedTabs, { path: tabPath, label: tabLabel }]
      sessionStorage.setItem('tabs', JSON.stringify(newTabs))
    }

    const tabStore = useTabStore.getState()
    if (!tabStore.tabs.find((t) => t.path === tabPath)) {
      tabStore.addTab({ path: tabPath, label: tabLabel })
    }

    router.push(tabPath)
  }
}
