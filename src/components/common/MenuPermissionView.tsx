// hooks/useMenuPermission.ts
import { useMemo } from 'react'
import { Menu } from '@/types/permssion'
import { ApiPermission } from '@/types/header'
import useMenu from '@/hooks/useMenu'

export function useMenuPermission(roleId: number, menuName: string, enabled: boolean) {
  const { useHeaderMenuListQuery } = useMenu()
  const { data: MenuListData } = useHeaderMenuListQuery(roleId, enabled)

  const permissions = useMemo(() => {
    const menu = MenuListData?.data?.find((m: Menu) => m.name === menuName)

    return menu?.permissions ?? []
  }, [MenuListData, menuName])

  return {
    hasDelete: permissions.some((p: ApiPermission) => p.action === '삭제'),
    hasCreate: permissions.some((p: ApiPermission) => p.action === '등록'),
    hasModify: permissions.some((p: ApiPermission) => p.action === '수정'),
    hasView: permissions.some((p: ApiPermission) => p.action === '조회'),
    hasApproval: permissions.some((p: ApiPermission) => p.action === '승인'),
    hasExcelDownload: permissions.some((p: ApiPermission) => p.action === '엑셀 다운로드'),
  }
}
