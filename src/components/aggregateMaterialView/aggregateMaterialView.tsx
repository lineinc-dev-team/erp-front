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
import { useMenuPermission } from '../common/MenuPermissionView'
import { myInfoProps } from '@/types/user'

export default function AggregateMaterialView() {
  const search = useFinalAggregationSearchStore((state) => state.search)
  const yearMonth = search.yearMonth
  const siteId = search.siteId
  const siteProcessId = search.siteProcessId

  const { MaterialListQuery } = useFinalAggregationView({
    yearMonth,
    siteId,
    siteProcessId,
    tabName: 'MATERIAL',
  })

  const SiteManamentList = MaterialListQuery.data ?? []

  const allLists = [
    ...(SiteManamentList?.data?.fuelAggregations || []),
    ...(SiteManamentList?.data?.materialManagements || []),
    ...(SiteManamentList?.data?.steelManagements || []),
  ]

  const rows = allLists.map((item: any, index: number) => {
    const outsourcing = item.outsourcingCompany || {}
    const prev = item.previousBilling || {}
    const curr = item.currentBilling || {}

    const totalSupply = (prev.supplyPrice || 0) + (curr.supplyPrice || 0)
    const totalTax = (prev.vat || 0) + (curr.vat || 0)
    const totalDeduction = (prev.deductionAmount || 0) + (curr.deductionAmount || 0)
    const totalTotal = (prev.total || 0) + (curr.total || 0)

    // steelManagements인지 확인
    const isSteel = SiteManamentList?.data?.steelManagements?.includes(item)

    return {
      no: index + 1,
      category: outsourcing.type || '-',
      businessNumber: outsourcing.businessNumber || '-',
      item:
        item.inputType === '직접입력'
          ? item.inputTypeDescription
          : item.inputType || item.itemName || '-',
      company: isSteel ? '라인공영㈜' : outsourcing.name || '-',
      ceo: isSteel ? '윤병국' : outsourcing.ceoName || '-',
      contact: isSteel ? '031-223-1984' : outsourcing.landlineNumber || '-',
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
    const wb = XLSX.utils.book_new()

    // 헤더 1행
    const headerRow1 = [
      'NO.',
      '사업자등록번호',
      '품명',
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

    const sheetData: any[] = []
    sheetData.push(headerRow1)
    sheetData.push(headerRow2)

    // rows 기준 데이터 삽입
    rows.forEach((r) => {
      sheetData.push([
        r.no,
        r.businessNumber,
        r.item,
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

    // 소계 계산
    const sum = (key: string) => rows.reduce((acc, r) => acc + (r as any)[key], 0)

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
      // 소계 텍스트 병합 (첫 9칸)
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

    const fileName = `${search.yearMonth}_${search.siteName}_재료비.xlsx`

    XLSX.utils.book_append_sheet(wb, ws, '재료비')
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
        <div className="flex justify-end">
          <Button
            variant="contained"
            disabled={!hasExcelDownload}
            color="success"
            onClick={handleExcelDownload}
            sx={{ mb: 2 }}
          >
            엑셀 다운로드
          </Button>
        </div>

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
              {rows.map((r) => (
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
                    {rows.reduce((acc, r) => acc + (r as any)[key], 0).toLocaleString()}
                  </TableCell>
                ))}
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </div>
  )
}
