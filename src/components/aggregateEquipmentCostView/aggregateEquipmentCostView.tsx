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
import { myInfoProps } from '@/types/user'
import { useMenuPermission } from '../common/MenuPermissionView'

export default function AggregateEquipmentCostView() {
  const search = useFinalAggregationSearchStore((state) => state.search)
  const yearMonth = search.yearMonth
  const siteId = search.siteId
  const siteProcessId = search.siteProcessId

  const { EquipmentLaborCostListQuery } = useFinalAggregationView({
    yearMonth,
    siteId,
    siteProcessId,
    tabName: 'EQUIPMENT',
  })

  const rowsDirect = (EquipmentLaborCostListQuery.data?.data?.items || []).map(
    (item: any, index: number) => {
      const outsourcing = item.outsourcingCompany || {}
      const prev = item.previousBilling || {}
      const curr = item.currentBilling || {}

      return {
        no: index + 1,
        category: outsourcing.type || '-',
        businessNumber: outsourcing.businessNumber || '-',
        company: outsourcing.name || '-',
        specification: item?.specification || '-',
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
        totalSupply: (prev.supplyPrice || 0) + (curr.supplyPrice || 0),
        totalTax: (prev.vat || 0) + (curr.vat || 0),
        totalDeduction: (prev.deductionAmount || 0) + (curr.deductionAmount || 0),
        totalTotal: (prev.total || 0) + (curr.total || 0),
      }
    },
  )

  const allRows = [...rowsDirect]

  const handleExcelDownload = () => {
    const wb = XLSX.utils.book_new()

    // 헤더 1행
    const headerRow1 = [
      'NO.',
      '사업자등록번호',
      '규격',
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

    // 헤더 2행
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

    rowsDirect.forEach((r: any) => {
      sheetData.push([
        r.no,
        r.businessNumber,
        r.specification,
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

    // 🟢 소계 계산
    const sum = (key: string) => rowsDirect.reduce((acc: any, r: any) => acc + (r as any)[key], 0)

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

      // 소계 병합
      { s: { r: sheetData.length - 1, c: 0 }, e: { r: sheetData.length - 1, c: 8 } },
    ]

    // 스타일 적용 (기존 코드 그대로)
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

    const fileName = `${search.yearMonth}_${search.siteName}_장비비.xlsx`

    XLSX.utils.book_append_sheet(wb, ws, '장비비')
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

  const totalKeys = [
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
  ]

  const calculateSum = (rows: any[]) =>
    totalKeys.map((key) => rows.reduce((acc, r) => acc + (r[key] || 0), 0))

  const sumTotal = calculateSum(allRows)

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
            color="success"
            disabled={!hasExcelDownload}
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
                  규격
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
              {rowsDirect.map((r: any) => (
                <TableRow key={`direct-${r.no}`}>
                  <TableCell align="center" sx={cellStyle}>
                    {r.no}
                  </TableCell>
                  <TableCell align="center" sx={cellStyle}>
                    {r.businessNumber}
                  </TableCell>
                  <TableCell align="center" sx={cellStyle}>
                    {r.specification}
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
                  {totalKeys.map((key) => (
                    <TableCell align="right" sx={cellStyle} key={key}>
                      {(r[key] || 0).toLocaleString()}
                    </TableCell>
                  ))}
                </TableRow>
              ))}

              <TableRow sx={{ backgroundColor: '#f3f4f6', fontWeight: 'bold' }}>
                <TableCell align="center" colSpan={9} sx={headerStyle}>
                  합계
                </TableCell>
                {sumTotal.map((v, idx) => (
                  <TableCell align="right" sx={cellStyle} key={idx}>
                    {v.toLocaleString()}
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
