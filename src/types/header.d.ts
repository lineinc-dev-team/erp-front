interface ApiPermission {
  action: string // 예: '등록', '조회', '삭제', '승인'
}

interface ApiMenu {
  name: string // 메뉴 이름
  permissions: ApiPermission[]
}

interface MenuItemChild {
  label: string
  path: string
}

export interface HeaderMenuItem {
  title: string
  icon: React.ReactNode | null // 또는 string | null;
  children: MenuItemChild[]
}
