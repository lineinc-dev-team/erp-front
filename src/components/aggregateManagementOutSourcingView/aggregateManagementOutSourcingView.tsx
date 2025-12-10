/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
} from '@mui/material'
import * as XLSX from 'xlsx-js-style'
import useFinalAggregationView from '@/hooks/useFinalAggregation'
import { useFinalAggregationSearchStore } from '@/stores/finalAggregationStore'
import AggregateManagementOutSourcingDetailView from '../aggregateManagementOutSourcingDetailView/aggregateManagementOutSourcingDetailView'
import { useMenuPermission } from '../common/MenuPermissionView'
import { myInfoProps } from '@/types/user'

export default function AggregateManagementOutSourcingView() {
  const search = useFinalAggregationSearchStore((state) => state.search)
  const yearMonth = search.yearMonth
  const siteId = search.siteId
  const siteProcessId = search.siteProcessId
  const outsourcingCompanyContractId = search.outsourcingCompanyContractId

  const [activeTab, setActiveTab] = useState('AGGREGATE')

  const { ManagementOutSourcingListQuery } = useFinalAggregationView({
    yearMonth,
    siteId,
    siteProcessId,
    tabName: 'OUTSOURCING',
    outsourcingCompanyContractId,
  })

  const { ConstructionListQuery } = useFinalAggregationView({
    siteId,
    siteProcessId,
    tabName: 'OUTSOURCING',
    outsourcingCompanyContractId,
  })

  const SiteManamentList = ManagementOutSourcingListQuery.data ?? []
  const ConstructionList = ConstructionListQuery?.data?.data ?? []

  // 기본 탭 + 백엔드 업체명 탭 생성
  const TAB_CONFIG = [
    { label: '집계', value: 'AGGREGATE' },
    ...ConstructionList?.map((company: any) => ({
      label: `${company?.outsourcingCompanyContract.contractName}`,
      value: company?.outsourcingCompanyContract.id,
    })),
  ]

  // 기본 activeTab: AGGREGATE

  const handleTabClick = (value: any, label: any) => {
    if (value === 'AGGREGATE') {
      search.setField('outsourcingCompanyContractId', 0)
      setActiveTab(value)
      return
    }

    search.setField('outsourcingCompanyContractId', value)
    search.setField('outsourcingCompanyContractName', label)
    setActiveTab(value)
  }

  console.log('outsourcingCompanyContractId24', search.outsourcingCompanyContractId)

  const items = SiteManamentList?.data?.items || []

  const rows = items.map((item: any, index: number) => {
    const contract = item.outsourcingCompanyContract || {}
    const outsourcing = contract.outsourcingCompany || {}

    const prev = item.previousBilling || {}
    const curr = item.currentBilling || {}

    const totalSupply = (prev.supplyPrice || 0) + (curr.supplyPrice || 0)
    const totalTax = (prev.vat || 0) + (curr.vat || 0)
    const totalDeduction = (prev.deduction || 0) + (curr.deduction || 0)
    const totalTotal = (prev.total || 0) + (curr.total || 0)

    return {
      no: index + 1,
      category: outsourcing.type || '-', // 관리 / 기타 등
      businessNumber: outsourcing.businessNumber || '-',
      contractName: contract.contractName || '-', // 계약명
      company: outsourcing.name || '-',
      ceo: outsourcing.ceoName || '-',
      contact: outsourcing.landlineNumber || '-',
      bank: outsourcing.bankName || '-',
      accountNumber: outsourcing.accountNumber || '-',
      accountName: outsourcing.accountHolder || '-',

      prevSupply: prev.supplyPrice || 0,
      prevTax: prev.vat || 0,
      prevDeduction: prev.deduction || 0,
      prevTotal: prev.total || 0,

      currSupply: curr.supplyPrice || 0,
      currTax: curr.vat || 0,
      currDeduction: curr.deduction || 0,
      currTotal: curr.total || 0,

      totalSupply,
      totalTax,
      totalDeduction,
      totalTotal,
    }
  })

  const handleExcelDownload = () => {
    const wb = XLSX.utils.book_new()

    const headerRow1 = [
      'NO.',
      '사업자등록번호',
      '계약명',
      '업체명',
      '대표자',
      '연락처',
      '기성청구계좌',
      '',
      '',
      '전회까지 청구내역',
      '',
      '',
      '',
      '금회 청구내역',
      '',
      '',
      '',
      '누계 청구내역',
      '',
      '',
      '',
    ]

    const headerRow2 = [
      '',
      '',
      '',
      '',
      '',
      '',
      '은행',
      '계좌번호',
      '계좌명',
      '공급가',
      '부가세',
      '공제금액',
      '계',
      '공급가',
      '부가세',
      '공제금액',
      '계',
      '공급가',
      '부가세',
      '공제금액',
      '계',
    ]

    const sheetData: any[] = [headerRow1, headerRow2]

    rows.forEach((r: any) => {
      sheetData.push([
        r.no,
        r.businessNumber,
        r.contractName, // item 대신 계약명
        r.company,
        r.ceo,
        r.contact,
        r.bank,
        r.accountNumber,
        r.accountName,
        r.prevSupply.toLocaleString(),
        r.prevTax.toLocaleString(),
        r.prevDeduction.toLocaleString(),
        r.prevTotal.toLocaleString(),
        r.currSupply.toLocaleString(),
        r.currTax.toLocaleString(),
        r.currDeduction.toLocaleString(),
        r.currTotal.toLocaleString(),
        r.totalSupply.toLocaleString(),
        r.totalTax.toLocaleString(),
        r.totalDeduction.toLocaleString(),
        r.totalTotal.toLocaleString(),
      ])
    })

    // 소계
    const sum = (key: string) => rows.reduce((acc: number, r: any) => acc + (r[key] || 0), 0)
    sheetData.push([
      '소계',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      sum('prevSupply').toLocaleString(),
      sum('prevTax').toLocaleString(),
      sum('prevDeduction').toLocaleString(),
      sum('prevTotal').toLocaleString(),
      sum('currSupply').toLocaleString(),
      sum('currTax').toLocaleString(),
      sum('currDeduction').toLocaleString(),
      sum('currTotal').toLocaleString(),
      sum('totalSupply').toLocaleString(),
      sum('totalTax').toLocaleString(),
      sum('totalDeduction').toLocaleString(),
      sum('totalTotal').toLocaleString(),
    ])

    const ws = XLSX.utils.aoa_to_sheet(sheetData)

    // 병합
    ws['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 1, c: 0 } },
      { s: { r: 0, c: 1 }, e: { r: 1, c: 1 } },
      { s: { r: 0, c: 2 }, e: { r: 1, c: 2 } },
      { s: { r: 0, c: 3 }, e: { r: 1, c: 3 } },
      { s: { r: 0, c: 4 }, e: { r: 1, c: 4 } },
      { s: { r: 0, c: 5 }, e: { r: 1, c: 5 } },
      { s: { r: 0, c: 6 }, e: { r: 0, c: 8 } },
      { s: { r: 0, c: 9 }, e: { r: 0, c: 12 } },
      { s: { r: 0, c: 13 }, e: { r: 0, c: 16 } },
      { s: { r: 0, c: 17 }, e: { r: 0, c: 20 } },
      { s: { r: sheetData.length - 1, c: 0 }, e: { r: sheetData.length - 1, c: 8 } },
    ]

    // 스타일
    const range = XLSX.utils.decode_range(ws['!ref']!)
    for (let R = range.s.r; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cellRef = XLSX.utils.encode_cell({ r: R, c: C })
        if (!ws[cellRef]) ws[cellRef] = { v: '' }

        const isHeader = R < 2
        const isAmount = !isHeader && C >= 9
        const isSubtotalLabel = R === sheetData.length - 1 && C === 0

        ws[cellRef].s = {
          border: {
            top: { style: 'thin', color: { rgb: '000000' } },
            bottom: { style: 'thin', color: { rgb: '000000' } },
            left: { style: 'thin', color: { rgb: '000000' } },
            right: { style: 'thin', color: { rgb: '000000' } },
          },
          fill: isHeader ? { patternType: 'solid', fgColor: { rgb: 'C0C0C0' } } : undefined,
          alignment: {
            vertical: 'center',
            horizontal: isHeader || isSubtotalLabel ? 'center' : isAmount ? 'right' : 'center',
          },
        }
      }
    }

    const fileName = `${search.yearMonth}_${search.siteName}_외주집계.xlsx`

    XLSX.utils.book_append_sheet(wb, ws, '외주집계')
    XLSX.writeFile(wb, fileName)
  }

  const cellStyle = {
    border: '1px solid #9ca3af',
    whiteSpace: 'nowrap',
    padding: '4px 8px',
  }

  const headerStyle = {
    ...cellStyle,
    fontWeight: 'bold',
    backgroundColor: '#f3f4f6',
    minWidth: 100, // 숫자 칸 최소 너비
  }

  // 권한에 따른 버튼 활성화

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

  // "계정 관리" 메뉴에 대한 권한
  const { hasExcelDownload } = useMenuPermission(roleId, '집계 관리', enabled)

  return (
    <div>
      <Paper sx={{ p: 2 }}>
        <div>
          {TAB_CONFIG.map((tab) => {
            const isActive = activeTab === tab.value
            return (
              <Button
                key={tab.label}
                onClick={() => handleTabClick(tab.value, tab.label)}
                sx={{
                  borderRadius: '10px 10px 0 0',
                  borderBottom: '1px solid #161616',
                  backgroundColor: isActive ? '#ffffff' : '#e0e0e0',
                  color: isActive ? '#000000' : '#9e9e9e',
                  border: '1px solid #7a7a7a',
                  fontWeight: isActive ? 'bold' : 'normal',
                  padding: '6px 16px',
                  minWidth: '120px',
                  textTransform: 'none',
                }}
              >
                {tab.label}
              </Button>
            )
          })}
        </div>

        {activeTab === 'AGGREGATE' && (
          <div className="flex justify-end">
            <Button
              variant="contained"
              color="success"
              disabled={!hasExcelDownload}
              onClick={handleExcelDownload}
              sx={{ mb: 2 }}
            >
              엑셀 다운로드
            </Button>
          </div>
        )}

        {activeTab === 'AGGREGATE' ? (
          <TableContainer sx={{ overflowX: 'auto' }}>
            <Table sx={{ borderCollapse: 'collapse', minWidth: 1600 }}>
              <TableHead>
                <TableRow>
                  <TableCell align="center" rowSpan={2} sx={headerStyle}>
                    NO.
                  </TableCell>
                  <TableCell align="center" rowSpan={2} sx={headerStyle}>
                    사업자등록번호
                  </TableCell>
                  <TableCell align="center" rowSpan={2} sx={headerStyle}>
                    계약명
                  </TableCell>
                  <TableCell align="center" rowSpan={2} sx={headerStyle}>
                    업체명
                  </TableCell>
                  <TableCell align="center" rowSpan={2} sx={headerStyle}>
                    대표자
                  </TableCell>
                  <TableCell align="center" rowSpan={2} sx={headerStyle}>
                    연락처
                  </TableCell>
                  <TableCell align="center" colSpan={3} sx={headerStyle}>
                    기성청구계좌
                  </TableCell>
                  <TableCell align="center" colSpan={4} sx={headerStyle}>
                    전회까지 청구내역
                  </TableCell>
                  <TableCell align="center" colSpan={4} sx={headerStyle}>
                    금회 청구내역
                  </TableCell>
                  <TableCell align="center" colSpan={4} sx={headerStyle}>
                    누계 청구내역
                  </TableCell>
                </TableRow>
                <TableRow>
                  {[
                    '은행',
                    '계좌번호',
                    '계좌명',
                    '공급가',
                    '부가세',
                    '공제금액',
                    '계',
                    '공급가',
                    '부가세',
                    '공제금액',
                    '계',
                    '공급가',
                    '부가세',
                    '공제금액',
                    '계',
                  ].map((text, idx) => (
                    <TableCell align="center" key={idx} sx={headerStyle}>
                      {text}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>

              <TableBody>
                {rows.map((r: any) => (
                  <TableRow key={r.no}>
                    <TableCell align="center" sx={cellStyle}>
                      {r.no}
                    </TableCell>
                    <TableCell align="center" sx={cellStyle}>
                      {r.businessNumber}
                    </TableCell>
                    <TableCell align="center" sx={cellStyle}>
                      {r.contractName}
                    </TableCell>
                    <TableCell align="center" sx={cellStyle}>
                      {r.company}
                    </TableCell>
                    <TableCell align="center" sx={cellStyle}>
                      {r.ceo}
                    </TableCell>
                    <TableCell align="center" sx={cellStyle}>
                      {r.contact}
                    </TableCell>
                    <TableCell align="center" sx={cellStyle}>
                      {r.bank}
                    </TableCell>
                    <TableCell align="center" sx={cellStyle}>
                      {r.accountNumber}
                    </TableCell>
                    <TableCell align="center" sx={cellStyle}>
                      {r.accountName}
                    </TableCell>

                    <TableCell align="right" sx={cellStyle}>
                      {r.prevSupply.toLocaleString()}
                    </TableCell>
                    <TableCell align="right" sx={cellStyle}>
                      {r.prevTax.toLocaleString()}
                    </TableCell>
                    <TableCell align="right" sx={cellStyle}>
                      {r.prevDeduction.toLocaleString()}
                    </TableCell>
                    <TableCell align="right" sx={cellStyle}>
                      {r.prevTotal.toLocaleString()}
                    </TableCell>

                    <TableCell align="right" sx={cellStyle}>
                      {r.currSupply.toLocaleString()}
                    </TableCell>
                    <TableCell align="right" sx={cellStyle}>
                      {r.currTax.toLocaleString()}
                    </TableCell>
                    <TableCell align="right" sx={cellStyle}>
                      {r.currDeduction.toLocaleString()}
                    </TableCell>
                    <TableCell align="right" sx={cellStyle}>
                      {r.currTotal.toLocaleString()}
                    </TableCell>

                    <TableCell align="right" sx={cellStyle}>
                      {r.totalSupply.toLocaleString()}
                    </TableCell>
                    <TableCell align="right" sx={cellStyle}>
                      {r.totalTax.toLocaleString()}
                    </TableCell>
                    <TableCell align="right" sx={cellStyle}>
                      {r.totalDeduction.toLocaleString()}
                    </TableCell>
                    <TableCell align="right" sx={cellStyle}>
                      {r.totalTotal.toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}

                <TableRow sx={{ backgroundColor: '#f9fafb', fontWeight: 'bold' }}>
                  <TableCell align="center" colSpan={9} sx={headerStyle}>
                    소계
                  </TableCell>
                  {[
                    'prevSupply',
                    'prevTax',
                    'prevDeduction',
                    'prevTotal',
                    'currSupply',
                    'currTax',
                    'currDeduction',
                    'currTotal',
                    'totalSupply',
                    'totalTax',
                    'totalDeduction',
                    'totalTotal',
                  ].map((key) => (
                    <TableCell align="right" sx={cellStyle} key={key}>
                      {rows.reduce((acc: any, r: any) => acc + (r as any)[key], 0).toLocaleString()}
                    </TableCell>
                  ))}
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <AggregateManagementOutSourcingDetailView />
        )}
      </Paper>
    </div>
  )
}
