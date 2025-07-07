'use client'

import React from 'react'
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
  Settings,
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

const menuItems = [
  {
    title: '대쉬보드',
    icon: <Dashboard />,
    children: [],
  },
  {
    title: '사업장 관리',
    icon: <Business />,
    children: [
      { label: '- 사업장 조회', path: '/business/view' },
      { label: '- 사업장 등록', path: '/business/register' },
    ],
  },
  {
    title: '외주 관리',
    icon: <Groups />,
    children: [
      { label: '- 외주 조회', path: '/outsourcing/view' },
      { label: '- 외주 등록', path: '/outsourcing/register' },
    ],
  },
  {
    title: '노무 관리',
    icon: <AssignmentInd />,
    children: [
      { label: '- 노무 조회', path: '/labor/view' },
      { label: '- 노무 등록', path: '/labor/register' },
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
    title: '설정',
    icon: <Settings />,
    children: [{ label: '- 계정 관리', path: '/settings/account' }],
  },
]
export default function Header() {
  const [open, setOpen] = React.useState(false)
  const [openSections, setOpenSections] = React.useState<Record<string, boolean>>({})
  const router = useRouter()

  const handleToggleSection = (title: string) => {
    setOpenSections((prev) => ({ ...prev, [title]: !prev[title] }))
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

        alert('로그아웃 되었습니다.')

        if (!response.ok) {
          const data = await response.json()
          alert(data.message || '로그아웃에 실패했습니다.')
          return
        }

        router.push('/')
      } catch (err) {
        if (err instanceof Error) {
          alert('네트워크 에러입니다.')
        }
      }
    }
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
              <p className="text-sm text-white">이경호(로그인한 ID)</p>
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
          {menuItems.map((menu) => (
            <React.Fragment key={menu.title}>
              <ListItemButton onClick={() => handleToggleSection(menu.title)}>
                <ListItemIcon>{menu.icon}</ListItemIcon>
                <ListItemText primary={menu.title} />
                {openSections[menu.title] ? <ExpandLess /> : <ExpandMore />}
              </ListItemButton>
              <Collapse in={openSections[menu.title]} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {menu.children.map((child) => (
                    <ListItemButton
                      key={child.label}
                      sx={{ pl: 4 }}
                      onClick={() => {
                        router.push(child.path)
                        setOpen(false)
                      }}
                    >
                      <ListItemText primary={child.label} />
                    </ListItemButton>
                  ))}
                </List>
              </Collapse>
            </React.Fragment>
          ))}
        </List>
      </Drawer>
    </>
  )
}
