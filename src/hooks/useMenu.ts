import { HeaderMenuService } from '@/services/sideMenu/menuService'
import { useQuery } from '@tanstack/react-query'

export default function useMenu() {
  // 조회에서 이름 검색 스크롤
  const useHeaderMenuListQuery = (roleId: number) => {
    return useQuery({
      queryKey: ['sideMenuInfo', roleId],
      queryFn: () => HeaderMenuService(roleId),
      enabled: !!roleId && !isNaN(roleId), // <-- 유효할 때만 호출
    })
  }

  return { useHeaderMenuListQuery }
}
