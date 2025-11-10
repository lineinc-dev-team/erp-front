'use client'

import React, { useEffect, useState } from 'react'
import {
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  IconButton,
  AppBar,
  Toolbar,
  ListItemIcon,
  Collapse,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import {
  Menu as MenuIcon,
  AccountCircle,
  ManageAccounts,
  Business,
  Apartment,
  Assignment,
  Inventory,
  LocalGasStation,
  ReceiptLong,
  Groups,
  Description,
  WorkHistory,
  Today,
  ExpandLess,
  ExpandMore,
} from '@mui/icons-material'
import { usePathname, useRouter } from 'next/navigation'
import CommonButton from '../common/Button'
import { API } from '@/api/config/env'
import { myInfoProps } from '@/types/user'
import { useSnackbarStore } from '@/stores/useSnackbarStore'
import { useTabStore } from '@/stores/useTabStore'
import useMenu from '@/hooks/useMenu'
import { ApiMenu, ApiPermission, HeaderMenuItem } from '@/types/header'

interface MenuItem {
  title?: string // 1 depth에서만 사용
  icon?: React.ReactNode
  label?: string
  path?: string
  children?: MenuItem[]
}

const menuNameToBasePath: Record<string, string> = {
  '권한 관리': '/permissionGroup',
  '발주처 관리': '/ordering',
  '현장 관리': '/sites',
  '관리비 관리': '/managementCost',
  '강재 관리': '/managementSteel',
  '유류집계 관리': '/fuelAggregation',
  '자재 관리': '/materialManagement',
  '강재수불부 관리': '/managementSteel',
  '외주업체 관리': '/outsourcingCompany',
  '외주업체 계약 관리': '/outsourcingContract',
  '노무 관리': '/labors',
  출역일보: '/dailyReport',
  '노무명세서 관리': '/laborStatement',
  '계정 관리': '/account',
  '현장/본사 관리비 관리': '/siteManagement',
  '집계 관리': '/aggregation',
}

const menuNameToIcon: Record<string, React.ReactNode> = {
  '집계 관리': <ManageAccounts />, // 권한 설정 → 계정 관리 아이콘
  '권한 관리': <ManageAccounts />, // 권한 설정 → 계정 관리 아이콘
  '발주처 관리': <Business />, // 회사/거래처 → 건물 아이콘
  '현장 관리': <Apartment />, // 현장/프로젝트 → 아파트 아이콘
  '관리비 관리': <Assignment />, // 비용/리포트 → 과제/문서 아이콘
  '자재 관리': <Inventory />, // 자재 관리도 재고 아이콘
  '유류집계 관리': <LocalGasStation />, // 유류 → 주유소 아이콘
  '강재수불부 관리': <ReceiptLong />, // 수불부(장부 개념) → 장부/리포트 아이콘
  '외주업체 관리': <Groups />, // 협력사/외주업체 → 그룹 아이콘
  '외주업체 계약 관리': <Description />, // 계약 문서 → 문서 아이콘
  '노무 관리': <AccessTimeIcon />, // 근무/노무 → 출퇴근 기록 아이콘
  '노무명세서 관리': <WorkHistory />, // 근무/노무 → 출퇴근 기록 아이콘
  '계정 관리': <AccountCircle />, // 사용자 계정 → 프로필 아이콘
  '현장/본사 관리비 관리': <Assignment />, // 사용자 계정 → 프로필 아이콘

  출역일보: <Today />,
}

function convertApiMenusToMenuItems(apiMenus: ApiMenu[]): HeaderMenuItem[] {
  return apiMenus.map((menu) => {
    const basePath = menuNameToBasePath[menu.name] || '/'
    const icon = menuNameToIcon[menu.name] || null

    let filteredPermissions = menu.permissions.filter(
      (perm: ApiPermission) => !['승인', '수정', '삭제', '엑셀 다운로드'].includes(perm.action),
    )

    // 출역일보에서는 등록도 제거
    // if (menu.name === '출역일보') {
    //   filteredPermissions = filteredPermissions.filter(
    //     (perm: ApiPermission) => perm.action !== '등록',
    //   )
    // }

    if (menu.name === '노무명세서 관리') {
      filteredPermissions = filteredPermissions.filter(
        (perm: ApiPermission) => perm.action !== '등록',
      )
    }

    if (menu.name === '집계 관리') {
      filteredPermissions = filteredPermissions.map((perm: ApiPermission) =>
        perm.action === '등록'
          ? { ...perm, action: '집계표(본사)' } // '등록' → '집계표(본사)'로 변경
          : perm,
      )
    }

    if (menu.name === '유류집계 관리') {
      filteredPermissions = filteredPermissions.filter(
        (perm: ApiPermission) => perm.action !== '등록',
      )
    }

    const children = filteredPermissions.map((perm: ApiPermission) => {
      let path = basePath
      if (perm.action === '등록') path = `${basePath}/registration`
      else if (perm.action === '조회') path = basePath

      const labelPrefix = ' - ' // 항상 붙임

      return {
        label: `${labelPrefix}${perm.action}`,
        path,
      }
    })

    return {
      title: menu.name,
      icon,
      children,
    }
  })
}

export default function Header() {
  const [open, setOpen] = useState(false)
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({})
  const router = useRouter()

  const { useHeaderMenuListQuery } = useMenu()

  const pathname = usePathname()
  const { tabs, removeTab } = useTabStore()

  // 전역 알림 메시지

  const { showSnackbar } = useSnackbarStore()

  const [myInfo, setMyInfo] = useState<myInfoProps | null>(null)

  useEffect(() => {
    const headerData = sessionStorage.getItem('myInfo')
    if (headerData) {
      setMyInfo(JSON.parse(headerData))
    }
  }, [])

  const roleId = Number(myInfo?.roles?.[0]?.id)

  const rolePermissionStatus = myInfo?.roles?.[0]?.deleted

  const enabled = rolePermissionStatus === false && !!roleId && !isNaN(roleId)

  const { data, isLoading, isError } = useHeaderMenuListQuery(roleId, enabled)

  // (3) data가 있으면 변환해서 메뉴 생성
  const menuItemsFromApi = data ? convertApiMenusToMenuItems(data.data) : []

  const handleToggleSection = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const handleLogout = async () => {
    if (confirm('정말 로그아웃 하시겠습니까?')) {
      try {
        const response = await fetch(API.LOGOUT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          cache: 'no-store',
        })

        sessionStorage.removeItem('myInfo')
        sessionStorage.removeItem('tab-storage')
        sessionStorage.removeItem('tabs')

        if (response.status === 200) {
          showSnackbar('로그아웃 되었습니다.', 'success')
        } else {
          showSnackbar('로그아웃에 실패했습니다.', 'error')
        }
        router.push('/')
      } catch (err) {
        if (err instanceof Error) {
          showSnackbar('네트워크 에러입니다.', 'warning')
        }
      }
    }
  }

  //재귀함수
  const renderMenu = (items: MenuItem[], level = 1, parentTitles: string[] = []) => {
    return items.map((item) => {
      const key = item.label || item.title || 'unknown'
      const hasChildren = !!item.children && item.children.length > 0
      const isOpen = openSections[key]
      const newParentTitles = [...parentTitles, item.title || item.label || '']

      if (hasChildren) {
        return (
          <React.Fragment key={key}>
            <ListItemButton sx={{ pl: level * 3 }} onClick={() => handleToggleSection(key)}>
              {level === 1 && item.icon && <ListItemIcon>{item.icon}</ListItemIcon>}
              <ListItemText primary={key} />
              {isOpen ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
            <Collapse in={isOpen} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {renderMenu(item.children!, level + 1, newParentTitles)}
              </List>
            </Collapse>
          </React.Fragment>
        )
      }

      const tabLabel = [...parentTitles, key]

      return (
        <ListItemButton
          key={key}
          sx={{ pl: level * 4 }}
          onClick={() => {
            if (item.path) {
              const label = Array.isArray(tabLabel) ? tabLabel.join('') : tabLabel
              useTabStore.getState().addTab({ label, path: item.path })
              router.push(item.path)
              setOpen(false)
            }
          }}
        >
          {level === 1 && item.icon && <ListItemIcon>{item.icon}</ListItemIcon>}
          <ListItemText primary={key} />
        </ListItemButton>
      )
    })
  }

  return (
    <>
      <AppBar position="fixed">
        <Toolbar>
          <div className="flex justify-between w-full items-center">
            <div className="flex items-center space-x-4">
              <IconButton edge="start" color="inherit" onClick={() => setOpen(true)}>
                <MenuIcon />
              </IconButton>
              <span>LineInc ERP MENU</span>
            </div>

            <div className="flex items-center space-x-4">
              {myInfo ? (
                <p className="text-sm text-white">
                  {myInfo.username}({myInfo.loginId})
                </p>
              ) : (
                <p className="text-sm text-white">로그인 정보를 불러오는 중...</p>
              )}
              <CommonButton
                label="로그아웃"
                variant="secondary"
                onClick={handleLogout}
                className="text-sm"
              />
            </div>
          </div>
        </Toolbar>

        <div className="flex items-center text-[12px] bg-white px-4 py-2 space-x-2 overflow-x-auto whitespace-nowrap">
          {tabs.map((tab) => (
            <div
              key={tab.path}
              className={`flex cursor-pointer items-center px-3 py-1 rounded-full border ${
                pathname === tab.path
                  ? 'font-bold text-red-500 border-red-300 bg-red-50'
                  : 'text-gray-700 border-gray-300'
              }`}
            >
              <button className="cursor-pointer" onClick={() => router.push(tab.path)}>
                {tab.label}
              </button>
              {tab.path !== '/' && (
                <button
                  onClick={() => {
                    const currentPath = pathname
                    const tabIndex = tabs.findIndex((t) => t.path === tab.path)

                    // 현재 닫는 탭이 현재 경로라면
                    if (tab.path === currentPath) {
                      const nextTab = tabs[tabIndex + 1] || tabs[tabIndex - 1]

                      if (nextTab) {
                        router.push(nextTab.path)
                      } else {
                        router.push('/dashboard') // 기본 경로로 fallback
                      }
                    }

                    removeTab(tab.path)
                  }}
                  className="ml-2 text-sm cursor-pointer hover:text-red-500"
                >
                  <CloseIcon fontSize="small" />
                </button>
              )}
            </div>
          ))}
        </div>
      </AppBar>

      <Drawer anchor="left" open={open} onClose={() => setOpen(false)}>
        <List sx={{ width: 260 }}>
          {!isLoading && !isError && menuItemsFromApi.length > 0 && renderMenu(menuItemsFromApi)}

          {!isLoading && !isError && menuItemsFromApi.length === 0 && (
            <div className="text-xl px-4 py-2 text-green-700">설정된 권한이 없습니다.</div>
          )}

          {isLoading && <div className="px-4 py-2">메뉴를 불러오는 중...</div>}
          {isError && <div className="px-4 py-2 text-red-500">에러가 발생했습니다.</div>}
        </List>
      </Drawer>
    </>
  )
}
