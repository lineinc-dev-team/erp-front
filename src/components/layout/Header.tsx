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
import {
  Menu as MenuIcon,
  Business,
  ManageAccounts,
  ExpandLess,
  ExpandMore,
  Dashboard,
  Groups,
  AssignmentInd,
  Inventory,
  Description,
  Apartment,
  Assignment,
  PeopleAlt,
  AccountCircle,
} from '@mui/icons-material'
import { usePathname, useRouter } from 'next/navigation'
import CommonButton from '../common/Button'
import { API } from '@/api/config/env'
import { MenuService } from '@/services/sideMenu/menuService'
import { useQuery } from '@tanstack/react-query'
import { myInfoProps } from '@/types/user'
import { useSnackbarStore } from '@/stores/useSnackbarStore'
import { useTabStore } from '@/stores/useTabStore'

interface MenuItem {
  title?: string // 1 depth에서만 사용
  icon?: React.ReactNode
  label?: string
  path?: string
  children?: MenuItem[]
}
const menuItems: MenuItem[] = [
  {
    title: '대쉬보드',
    icon: <Dashboard />,
    children: [],
  },

  {
    title: '현장 관리',
    icon: <Apartment />, // 사업장: 건물 관련
    children: [
      { label: ' - 조회', path: '/sites' },
      { label: ' - 등록', path: '/sites/registration' },
    ],
  },

  {
    title: '발주처 관리',
    icon: <Business />, // 기업 아이콘
    children: [
      { label: ' - 조회', path: '/ordering' },
      { label: ' - 등록', path: '/ordering/registration' },
    ],
  },

  {
    title: '외주 업체관리',
    icon: <Groups />, // 그룹/사람들
    children: [
      { label: ' - 조회', path: '/outsourcingCompany' },
      { label: ' - 등록', path: '/outsourcingCompany/registration' },
    ],
  },

  {
    title: '외주 계약관리',
    icon: <Description />, // 계약서, 문서
    children: [
      { label: ' - 조회', path: '/outsourcingContract' },
      { label: ' - 등록', path: '/outsourcingContract/registration' },
    ],
  },

  {
    title: '외주 인력관리',
    icon: <AssignmentInd />, // 사람 + 태그: 인력관리
    children: [
      { label: ' - 조회', path: '/outsourcingHuman' },
      { label: ' - 등록', path: '/outsourcingHuman/registration' },
    ],
  },

  {
    title: '외주 장비관리',
    icon: <Inventory />, // 장비, 물품 아이콘
    children: [
      { label: ' - 조회', path: '/outsourcingEquipment' },
      { label: ' - 등록', path: '/outsourcingEquipment/registration' },
    ],
  },

  {
    title: '외주 정산관리',
    icon: <Assignment />, // 계산서 느낌의 아이콘
    children: [
      { label: ' - 조회', path: '/outsourcingCalculate' },
      { label: ' - 등록', path: '/outsourcingCalculate/registration' },
    ],
  },

  {
    title: '노무 - 인력 및 공수 관리',
    icon: <PeopleAlt />, // 인력 관련
    children: [
      { label: ' - 조회', path: '/laborWorkForce' },
      { label: ' - 등록', path: '/laborWorkForce/registration' },
    ],
  },

  {
    title: '노무 - 퇴직금 대상자 조회',
    icon: <AssignmentInd />, // 사람 + 태그
    children: [{ label: ' - 조회', path: '/outsourcingCalculate' }],
  },

  {
    title: '자재 관리',
    icon: <Inventory />, // 물품 관련
    children: [
      { label: '- 자재 조회', path: '/materials/view' },
      { label: '- 자재 등록', path: '/materials/register' },
    ],
  },

  {
    title: '계약/증빙',
    icon: <Description />, // 문서
    children: [
      { label: '- 계약서 조회', path: '/contracts/view' },
      { label: '- 계약서 등록', path: '/contracts/register' },
    ],
  },

  {
    title: '권한 관리',
    icon: <ManageAccounts />,
    children: [
      { label: '- 조회', path: '/permissionGroup' },
      { label: '- 등록', path: '/permissionGroup/registration' },
    ],
  },

  {
    title: '계정 관리',
    icon: <AccountCircle />,
    children: [
      { label: ' - 조회', path: '/account' },
      { label: ' - 등록', path: '/account/registration' },
    ],
  },
]

export default function Header() {
  const [open, setOpen] = useState(false)
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({})
  const router = useRouter()

  const pathname = usePathname()
  const { tabs, removeTab } = useTabStore()

  console.log('현재 접속한 탭!', tabs)

  // 전역 알림 메시지

  const { showSnackbar } = useSnackbarStore()

  // 세션스토리지 데이터
  const [myInfo, setMyInfo] = useState<myInfoProps | null>(null)

  useEffect(() => {
    const headerData = sessionStorage.getItem('myInfo')
    if (headerData) {
      setMyInfo(JSON.parse(headerData))
    }
  }, [])

  // react-query로 메뉴 호출
  const {
    data: menuData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['MenuService'],
    queryFn: MenuService,
  })

  if (isLoading) return <div>로딩중...</div>
  if (isError) return <div>권한이 없거나 에러 발생</div>

  console.log('menuData:', menuData)

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
          sx={{ pl: level * 3 }}
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
                  onClick={() => removeTab(tab.path)}
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
        <List sx={{ width: 240 }}>
          {!isLoading && !isError && renderMenu(menuItems)}

          {isLoading && <div>메뉴를 불러오는 중 </div>}
          {isError && <div>에러 발생했습니다.</div>}
        </List>
      </Drawer>
    </>
  )
}
