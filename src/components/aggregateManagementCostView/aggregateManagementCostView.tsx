/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react'
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
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import useFinalAggregationView from '@/hooks/useFinalAggregation'
import { useFinalAggregationSearchStore } from '@/stores/finalAggregationStore'
import AggregateManagementCostDetailView from '../aggregateManagementCostDetailView/aggregateManagementCostDetail'

export default function AggregateManagementCostView() {
  const search = useFinalAggregationSearchStore((state) => state.search)
  const yearMonth = search.yearMonth
  const siteId = search.siteId
  const siteProcessId = search.siteProcessId

  const outsourcingCompanyId = search.outsourcingCompanyId

  const [activeTab, setActiveTab] = useState('AGGREGATE')

  const { ManagementCostListQuery } = useFinalAggregationView({
    yearMonth,
    siteId,
    siteProcessId,
    tabName: 'MANAGEMENT',
    outsourcingCompanyId,
  })

  const { MealFeeCompanyListQuery } = useFinalAggregationView({
    yearMonth,
    siteId,
    siteProcessId,
    tabName: 'MANAGEMENT',
    outsourcingCompanyId,
  })

  const SiteManamentList = ManagementCostListQuery.data ?? []
  const MealFeeCompanyList = MealFeeCompanyListQuery?.data?.data ?? []

  // 기본 탭 + 백엔드 업체명 탭 생성
  const TAB_CONFIG = [
    { label: '집계', value: 'AGGREGATE' },
    ...MealFeeCompanyList?.map((company: any) => ({
      label: `식당-${company.name}`,
      value: company.id,
    })),
  ]

  // 기본 activeTab: AGGREGATE

  const handleTabClick = (value: any) => {
    if (value === 'AGGREGATE') {
      search.setField('outsourcingCompanyId', 0)
      setActiveTab(value)
      return
    }

    search.setField('outsourcingCompanyId', value)
    setActiveTab(value)
  }

  const items = SiteManamentList?.data?.items || []

  const rows = items.map((item: any, index: number) => {
    const outsourcing = item.outsourcingCompany || {}
    const prev = item.previousBilling || {}
    const curr = item.currentBilling || {}

    const totalSupply = (prev.supplyPrice || 0) + (curr.supplyPrice || 0)
    const totalTax = (prev.vat || 0) + (curr.vat || 0)
    const totalDeduction = (prev.deductionAmount || 0) + (curr.deductionAmount || 0)
    const totalTotal = (prev.total || 0) + (curr.total || 0)

    return {
      no: index + 1,
      category: outsourcing.type || '-',
      businessNumber: outsourcing.businessNumber || '-',
      item: item.itemTypeDescription || item.itemType || '-',
      company: outsourcing.name || '-',
      ceo: outsourcing.ceoName || '-',
      contact: outsourcing.landlineNumber || '-',
      bank: outsourcing.bankName || '-',
      accountNumber: outsourcing.accountNumber || '-',
      accountName: outsourcing.accountHolder || '-',
      prevSupply: prev.supplyPrice || 0,
      prevTax: prev.vat || 0,
      prevDeduction: prev.deductionAmount || 0,
      prevTotal: prev.total || 0,
      currSupply: curr.supplyPrice || 0,
      currTax: curr.vat || 0,
      currDeduction: curr.deductionAmount || 0,
      currTotal: curr.total || 0,
      totalSupply,
      totalTax,
      totalDeduction,
      totalTotal,
    }
  })

  const handleExcelDownload = () => {
    // 원래 데이터
    const formattedData = rows.map((r: any) => ({
      NO: String(r.no),
      사업자등록번호: r.businessNumber,
      품명: r.item,
      업체명: r.company,
      대표자: r.ceo,
      연락처: r.contact,
      은행: r.bank,
      계좌번호: r.accountNumber,
      계좌명: r.accountName,
      전회_공급가: r.prevSupply.toLocaleString(),
      전회_부가세: r.prevTax.toLocaleString(),
      전회_공제금액: r.prevDeduction.toLocaleString(),
      전회_계: r.prevTotal.toLocaleString(),
      금회_공급가: r.currSupply.toLocaleString(),
      금회_부가세: r.currTax.toLocaleString(),
      금회_공제금액: r.currDeduction.toLocaleString(),
      금회_계: r.currTotal.toLocaleString(),
      누계_공급가: r.totalSupply.toLocaleString(),
      누계_부가세: r.totalTax.toLocaleString(),
      누계_공제금액: r.totalDeduction.toLocaleString(),
      누계_계: r.totalTotal.toLocaleString(),
    }))

    // 소계 행 추가
    const subtotal = {
      NO: '소계',
      사업자등록번호: '',
      품명: '',
      업체명: '',
      대표자: '',
      연락처: '',
      은행: '',
      계좌번호: '',
      계좌명: '',
      전회_공급가: rows
        .reduce((sum: any, r: { prevSupply: any }) => sum + r.prevSupply, 0)
        .toLocaleString(),
      전회_부가세: rows
        .reduce((sum: any, r: { prevTax: any }) => sum + r.prevTax, 0)
        .toLocaleString(),
      전회_공제금액: rows
        .reduce((sum: any, r: { prevDeduction: any }) => sum + r.prevDeduction, 0)
        .toLocaleString(),
      전회_계: rows
        .reduce((sum: any, r: { prevTotal: any }) => sum + r.prevTotal, 0)
        .toLocaleString(),
      금회_공급가: rows
        .reduce((sum: any, r: { currSupply: any }) => sum + r.currSupply, 0)
        .toLocaleString(),
      금회_부가세: rows
        .reduce((sum: any, r: { currTax: any }) => sum + r.currTax, 0)
        .toLocaleString(),
      금회_공제금액: rows
        .reduce((sum: any, r: { currDeduction: any }) => sum + r.currDeduction, 0)
        .toLocaleString(),
      금회_계: rows
        .reduce((sum: any, r: { currTotal: any }) => sum + r.currTotal, 0)
        .toLocaleString(),
      누계_공급가: rows
        .reduce((sum: any, r: { totalSupply: any }) => sum + r.totalSupply, 0)
        .toLocaleString(),
      누계_부가세: rows
        .reduce((sum: any, r: { totalTax: any }) => sum + r.totalTax, 0)
        .toLocaleString(),
      누계_공제금액: rows
        .reduce((sum: any, r: { totalDeduction: any }) => sum + r.totalDeduction, 0)
        .toLocaleString(),
      누계_계: rows
        .reduce((sum: any, r: { totalTotal: any }) => sum + r.totalTotal, 0)
        .toLocaleString(),
    }

    formattedData.push(subtotal)

    const worksheet = XLSX.utils.json_to_sheet(formattedData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1')
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' })
    saveAs(blob, '관리비.xlsx')
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
  }

  return (
    <div>
      <Paper sx={{ p: 2 }}>
        <div>
          {TAB_CONFIG.map((tab) => {
            const isActive = activeTab === tab.value
            return (
              <Button
                key={tab.label}
                onClick={() => handleTabClick(tab.value)}
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
                    품명
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
                      {r.item}
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
          <AggregateManagementCostDetailView />
        )}
      </Paper>
    </div>
  )
}
