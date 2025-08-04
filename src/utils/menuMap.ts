// menuMap.ts
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
      { label: '조회', path: '/sites' },
      { label: '등록', path: '/sites/registration' },
    ],
  },

  {
    title: '발주처 관리',
    icon: <Business />, // 기업 아이콘
    children: [
      { label: '조회', path: '/ordering' },
      { label: '등록', path: '/ordering/registration' },
    ],
  },

  {
    title: '강재 관리',
    icon: <Inventory />, // 기업 아이콘
    children: [
      { label: '조회', path: '/managementSteel' },
      { label: '등록', path: '/managementSteel/registration' },
    ],
  },
  {
    title: '관리비 관리',
    icon: <Assignment />, // 기업 아이콘
    children: [
      { label: '조회', path: '/managementCost' },
      { label: '등록', path: '/managementCost/registration' },
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

  // {
  //   title: '노무 - 인력 및 공수 관리',
  //   icon: <PeopleAlt />, // 인력 관련
  //   children: [
  //     { label: ' - 조회', path: '/laborWorkForce' },
  //     { label: ' - 등록', path: '/laborWorkForce/registration' },
  //   ],
  // },

  // {
  //   title: '노무 - 퇴직금 대상자 조회',
  //   icon: <AssignmentInd />, // 사람 + 태그
  //   children: [{ label: ' - 조회', path: '/outsourcingCalculate' }],
  // },

  {
    title: '자재 관리',
    icon: <Inventory />, // 물품 관련
    children: [
      { label: '조회', path: '/materials/view' },
      { label: '등록', path: '/materials/register' },
    ],
  },

  // {
  //   title: '계약/증빙',
  //   icon: <Description />, // 문서
  //   children: [
  //     { label: '계약서 조회', path: '/contracts/view' },
  //     { label: '- 계약서 등록', path: '/contracts/register' },
  //   ],
  // },

  {
    title: '권한 관리',
    icon: <ManageAccounts />,
    children: [
      { label: '조회', path: '/permissionGroup' },
      { label: '등록', path: '/permissionGroup/registration' },
    ],
  },

  {
    title: '계정 관리',
    icon: <AccountCircle />,
    children: [
      { label: '조회', path: '/account' },
      { label: '등록', path: '/account/registration' },
    ],
  },
]
