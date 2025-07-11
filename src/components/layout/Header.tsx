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
} from '@mui/icons-material'
import { useRouter } from 'next/navigation'
import CommonButton from '../common/Button'
import { API } from '@/api/config/env'
import { MenuService } from '@/services/sideMenu/menuService'
import { useQuery } from '@tanstack/react-query'
import { myInfoProps } from '@/types/user'
import { useSnackbarStore } from '@/stores/useSnackbarStore'

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
    title: '사업장 관리',
    icon: <Business />,
    children: [
      {
        label: '↳ 발주처 관리',
        children: [
          { label: '- 조회', path: '/ordering' },
          { label: '- 등록', path: '/ordering/registration' },
        ],
      },
      { label: '- 조회', path: '/business' },
      { label: '- 등록', path: '/business/registration' },
    ],
  },
  {
    title: '외주 관리',
    icon: <Groups />,
    children: [
      {
        label: '↳ 외주 업체관리',
        children: [
          { label: '- 조회', path: '/outsourcingCompany' },
          { label: '- 등록', path: '/outsourcingCompany/registration' },
        ],
      },
      {
        label: '↳ 외주 계약관리',
        children: [
          { label: '- 조회', path: '/outsourcingContract' },
          { label: '- 등록', path: '/outsourcingContract/registration' },
        ],
      },
      {
        label: '↳ 외주 인력관리',
        children: [
          { label: '- 조회', path: '/outsourcingHuman' },
          { label: '- 등록', path: '/outsourcingHuman/registration' },
        ],
      },
      {
        label: '↳ 외주 장비관리',
        children: [
          { label: '- 조회', path: '/outsourcingEquipment' },
          { label: '- 등록', path: '/outsourcingEquipment/registration' },
        ],
      },
      {
        label: '↳ 외주 정산관리',
        children: [
          { label: '- 조회', path: '/outsourcingCalculate' },
          { label: '- 등록', path: '/outsourcingCalculate/registration' },
        ],
      },
    ],
  },
  {
    title: '노무 관리',
    icon: <AssignmentInd />,
    children: [
      {
        label: '↳ 인력 및 공수 관리',
        children: [
          { label: '- 조회', path: '/laborWorkForce' },
          { label: '- 등록', path: '/laborWorkForce/registration' },
        ],
      },
      {
        label: '↳ 퇴직금 대상자 조회',
        children: [
          { label: '- 조회', path: '/outsourcingCalculate' },
          // { label: '- 등록', path: '/outsourcingCalculate/registration' },
        ],
      },
    ],
  },
  {
    title: '자재 관리',
    icon: <Inventory />,
    children: [
      { label: '- 자재 조회', path: '/materials/view' },
      { label: '- 자재 등록', path: '/materials/register' },
    ],
  },
  {
    title: '계약/증빙',
    icon: <Description />,
    children: [
      { label: '- 계약서 조회', path: '/contracts/view' },
      { label: '- 계약서 등록', path: '/contracts/register' },
    ],
  },
  {
    title: '계정 관리',
    icon: <ManageAccounts />,
    children: [
      {
        label: '↳ 권한 그룹 관리',
        children: [
          { label: '- 조회', path: '/permissionGroup' },
          { label: '- 등록', path: '/permissionGroup/registration' },
        ],
      },
      { label: '- 조회', path: '/account' },
      { label: '- 등록', path: '/account/registration' },
    ],
  },
]

export default function Header() {
  const [open, setOpen] = useState(false)
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({})
  const router = useRouter()

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

  // 재귀 렌더링 함수
  // level이 높아질수록 paddingLeft 증가
  const renderMenu = (items: MenuItem[], level = 1) => {
    return items.map((item) => {
      const key = item.label || item.title || 'unknown'
      const hasChildren = !!item.children && item.children.length > 0
      const isOpen = openSections[key]

      if (hasChildren) {
        return (
          <React.Fragment key={key}>
            <ListItemButton sx={{ pl: level * 3 }} onClick={() => handleToggleSection(key)}>
              {/* 1depth에서는 아이콘 렌더링 */}
              {level === 1 && item.icon && <ListItemIcon>{item.icon}</ListItemIcon>}
              <ListItemText primary={key} />
              {isOpen ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
            <Collapse in={isOpen} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {renderMenu(item.children!, level + 1)}
              </List>
            </Collapse>
          </React.Fragment>
        )
      }

      return (
        <ListItemButton
          key={key}
          sx={{ pl: level * 3 }}
          onClick={() => {
            if (item.path) {
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
          <div className="flex justify-between w-full">
            <div>
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
