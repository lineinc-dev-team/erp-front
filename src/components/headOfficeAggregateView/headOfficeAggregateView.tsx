/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react'
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
import { useHeadOfficeAggregationSearchStore } from '@/stores/headOfficeAggregationStore'

export default function HeadOfficeAggregateView() {
  const search = useHeadOfficeAggregationSearchStore((state) => state.search)
  const yearMonth = search.yearMonth
  const siteId = search.siteId
  const siteProcessId = search.siteProcessId

  const { HeadOfficeListQuery } = useFinalAggregationView({
    yearMonth,
    siteId,
    siteProcessId,
  })

  const apiData = HeadOfficeListQuery.data?.data || {}

  const totalConstructionAmount = apiData.totalConstructionAmount || 0
  const costSummaries = apiData.costSummaries || []

  /* ------------------------
      🔥 데이터 매핑
  ------------------------- */
  const rows = costSummaries.map((item: any, index: number) => {
    const prev = item.previousSummary || {}
    const curr = item.currentSummary || {}

    const totalSupply = (prev.supplyPrice || 0) + (curr.supplyPrice || 0)
    const totalTax = (prev.vat || 0) + (curr.vat || 0)
    const totalDeduction = (prev.deductionAmount || 0) + (curr.deductionAmount || 0)
    const totalTotal = (prev.total || 0) + (curr.total || 0)

    return {
      no: index + 1,
      processName: item.processName || '-',
      contractAmount: '-', // 계약금액 없음 → "-" 고정

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

    const headerRow1 = [
      '총 공사금액',
      'NO.',
      '공종명',
      '계약금액',
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

    /* -------------------------------------
      2. UI 본문 rows 그대로 추가
  --------------------------------------*/
    rows.forEach((r: any, index: number) => {
      sheetData.push([
        index === 0 ? totalConstructionAmount.toLocaleString() : '',
        r.no,
        r.processName,
        r.contractAmount,

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

    /* -------------------------------------
      3. 소계 Row 추가
  --------------------------------------*/
    sheetData.push([
      '소계',
      '',
      '',
      '',
      rows.reduce((s: any, r: any) => s + r.prevSupply, 0).toLocaleString(),
      rows.reduce((s: any, r: any) => s + r.prevTax, 0).toLocaleString(),
      rows.reduce((s: any, r: any) => s + r.prevDeduction, 0).toLocaleString(),
      rows.reduce((s: any, r: any) => s + r.prevTotal, 0).toLocaleString(),

      rows.reduce((s: any, r: any) => s + r.currSupply, 0).toLocaleString(),
      rows.reduce((s: any, r: any) => s + r.currTax, 0).toLocaleString(),
      rows.reduce((s: any, r: any) => s + r.currDeduction, 0).toLocaleString(),
      rows.reduce((s: any, r: any) => s + r.currTotal, 0).toLocaleString(),

      rows.reduce((s: any, r: any) => s + r.totalSupply, 0).toLocaleString(),
      rows.reduce((s: any, r: any) => s + r.totalTax, 0).toLocaleString(),
      rows.reduce((s: any, r: any) => s + r.totalDeduction, 0).toLocaleString(),
      rows.reduce((s: any, r: any) => s + r.totalTotal, 0).toLocaleString(),
    ])

    /* -------------------------------------
      4. sheet 로 변환
  --------------------------------------*/
    const wsGenerated = XLSX.utils.aoa_to_sheet(sheetData)

    /* -------------------------------------
      5. 병합 영역 UI와 동일하게 적용
  --------------------------------------*/

    wsGenerated['!merges'] = [
      // 총 공사금액 (rowSpan = rows.length)
      {
        s: { r: 2, c: 0 }, // 시작: 3번째 줄 1번째 칸
        e: { r: 1 + rows.length, c: 0 }, // rows 만큼 아래로 병합
      },

      // 첫 번째 헤더 줄 병합
      { s: { r: 0, c: 0 }, e: { r: 1, c: 0 } }, // 총 공사금액 (2줄 병합)
      { s: { r: 0, c: 1 }, e: { r: 1, c: 1 } }, // NO
      { s: { r: 0, c: 2 }, e: { r: 1, c: 2 } }, // 공종명
      { s: { r: 0, c: 3 }, e: { r: 1, c: 3 } }, // 계약금액

      // 전회 colSpan=4
      { s: { r: 0, c: 4 }, e: { r: 0, c: 7 } },
      // 금회 colSpan=4
      { s: { r: 0, c: 8 }, e: { r: 0, c: 11 } },
      // 누계 colSpan=4
      { s: { r: 0, c: 12 }, e: { r: 0, c: 15 } },
    ]

    XLSX.utils.book_append_sheet(wb, wsGenerated, 'Sheet1')

    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' })
    saveAs(blob, '집계표(본사).xlsx')
  }

  /* ------------------------
      🔥 Style
  ------------------------- */
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
        <div className="flex justify-end">
          <Button variant="contained" color="success" onClick={handleExcelDownload} sx={{ mb: 2 }}>
            엑셀 다운로드
          </Button>
        </div>

        <TableContainer sx={{ overflowX: 'auto' }}>
          <Table sx={{ borderCollapse: 'collapse', minWidth: 1600 }}>
            <TableHead>
              <TableRow>
                <TableCell align="center" rowSpan={2} sx={headerStyle}>
                  총 공사금액
                </TableCell>

                <TableCell align="center" rowSpan={2} sx={headerStyle}>
                  NO.
                </TableCell>
                <TableCell align="center" rowSpan={2} sx={headerStyle}>
                  공종명
                </TableCell>
                <TableCell align="center" rowSpan={2} sx={headerStyle}>
                  계약금액
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
              {rows.map((r: any, index: number) => (
                <TableRow key={r.no}>
                  {index == 0 && (
                    <TableCell
                      align="center"
                      rowSpan={rows.length} // 마지막 소계 제외
                      sx={cellStyle}
                    >
                      {totalConstructionAmount.toLocaleString()}
                    </TableCell>
                  )}

                  <TableCell align="center" sx={cellStyle}>
                    {r.no}
                  </TableCell>
                  <TableCell align="center" sx={cellStyle}>
                    {r.processName}
                  </TableCell>
                  <TableCell align="center" sx={cellStyle}>
                    {r.contractAmount}
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
                <TableCell align="center" colSpan={4} sx={headerStyle}>
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
                    {rows.reduce((sum: any, r: any) => sum + r[key], 0).toLocaleString()}
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
