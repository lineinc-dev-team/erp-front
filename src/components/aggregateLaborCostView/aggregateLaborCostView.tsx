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
import { useFinalAggregationSearchStore } from '@/stores/finalAggregationStore'

export default function AggregateLaborCostView() {
  const search = useFinalAggregationSearchStore((state) => state.search)
  const yearMonth = search.yearMonth
  const siteId = search.siteId
  const siteProcessId = search.siteProcessId

  const { LaborCostListQuery } = useFinalAggregationView({
    yearMonth,
    siteId,
    siteProcessId,
    laborType: 'DIRECT_CONTRACT',
    tabName: 'LABOR',
  })

  const { OutSourcingLaborCostListQuery } = useFinalAggregationView({
    yearMonth,
    siteId,
    siteProcessId,
    tabName: 'LABOR',
  })

  const rowsDirect = (LaborCostListQuery.data?.data?.items || []).map(
    (item: any, index: number) => {
      const outsourcing = item.outsourcingCompany || {}
      const labor = item?.labor
      const prev = item.previousBilling || {}
      const curr = item.currentBilling || {}

      return {
        no: index + 1,
        category: outsourcing.type || '-',
        businessNumber: outsourcing.businessNumber || '-',
        company: outsourcing.name || '-',
        item: labor?.workType || '-',
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

  const rowsOutsourcing = (OutSourcingLaborCostListQuery.data?.data?.items || []).map(
    (item: any, index: number) => {
      const outsourcing = item.outsourcingCompany || {}
      const labor = item?.labor
      const prev = item.previousBilling || {}
      const curr = item.currentBilling || {}

      return {
        no: index + 1,
        category: outsourcing.type || '-',
        businessNumber: outsourcing.businessNumber || '-',
        company: outsourcing.name || '-',
        item: labor?.workType || '-',
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

  const allRows = [...rowsDirect, ...rowsOutsourcing]

  const handleExcelDownload = () => {
    const formattedData: any[] = []

    // 1️⃣ 직영 데이터 추가
    rowsDirect.forEach((r: any) => {
      formattedData.push({
        NO: r.no,
        사업자등록번호: r.businessNumber,
        업체명: r.company,
        공종명: r.item,
        대표자: r.ceo,
        연락처: r.contact,
        은행: r.bank,
        계좌번호: r.accountNumber,
        계좌명: r.accountName,
        전회_공급가: r.prevSupply,
        전회_부가세: r.prevTax,
        전회_공제금액: r.prevDeduction,
        전회_계: r.prevTotal,
        금회_공급가: r.currSupply,
        금회_부가세: r.currTax,
        금회_공제금액: r.currDeduction,
        금회_계: r.currTotal,
        누계_공급가: r.totalSupply,
        누계_부가세: r.totalTax,
        누계_공제금액: r.totalDeduction,
        누계_계: r.totalTotal,
      })
    })

    // 2️⃣ 직영 소계 추가
    const sumDirect = calculateSum(rowsDirect) // UI에서 쓰던 calculateSum 재사용
    formattedData.push({
      NO: '직영소계',
      사업자등록번호: '',
      업체명: '',
      공종명: '',
      대표자: '',
      연락처: '',
      은행: '',
      계좌번호: '',
      계좌명: '',
      전회_공급가: sumDirect[0],
      전회_부가세: sumDirect[1],
      전회_공제금액: sumDirect[2],
      전회_계: sumDirect[3],
      금회_공급가: sumDirect[4],
      금회_부가세: sumDirect[5],
      금회_공제금액: sumDirect[6],
      금회_계: sumDirect[7],
      누계_공급가: sumDirect[8],
      누계_부가세: sumDirect[9],
      누계_공제금액: sumDirect[10],
      누계_계: sumDirect[11],
    })

    // 3️⃣ 용역 데이터 추가
    rowsOutsourcing.forEach((r: any) => {
      formattedData.push({
        NO: r.no,
        사업자등록번호: r.businessNumber,
        업체명: r.company,
        공종명: r.item,
        대표자: r.ceo,
        연락처: r.contact,
        은행: r.bank,
        계좌번호: r.accountNumber,
        계좌명: r.accountName,
        전회_공급가: r.prevSupply,
        전회_부가세: r.prevTax,
        전회_공제금액: r.prevDeduction,
        전회_계: r.prevTotal,
        금회_공급가: r.currSupply,
        금회_부가세: r.currTax,
        금회_공제금액: r.currDeduction,
        금회_계: r.currTotal,
        누계_공급가: r.totalSupply,
        누계_부가세: r.totalTax,
        누계_공제금액: r.totalDeduction,
        누계_계: r.totalTotal,
      })
    })

    // 4️⃣ 용역 소계 추가
    const sumOutsourcing = calculateSum(rowsOutsourcing)
    formattedData.push({
      NO: '용역소계',
      사업자등록번호: '',
      업체명: '',
      공종명: '',
      대표자: '',
      연락처: '',
      은행: '',
      계좌번호: '',
      계좌명: '',
      전회_공급가: sumOutsourcing[0],
      전회_부가세: sumOutsourcing[1],
      전회_공제금액: sumOutsourcing[2],
      전회_계: sumOutsourcing[3],
      금회_공급가: sumOutsourcing[4],
      금회_부가세: sumOutsourcing[5],
      금회_공제금액: sumOutsourcing[6],
      금회_계: sumOutsourcing[7],
      누계_공급가: sumOutsourcing[8],
      누계_부가세: sumOutsourcing[9],
      누계_공제금액: sumOutsourcing[10],
      누계_계: sumOutsourcing[11],
    })

    // 5️⃣ 최종 합계 추가
    const sumTotal = calculateSum(allRows)
    formattedData.push({
      NO: '합계',
      사업자등록번호: '',
      업체명: '',
      공종명: '',
      대표자: '',
      연락처: '',
      은행: '',
      계좌번호: '',
      계좌명: '',
      전회_공급가: sumTotal[0],
      전회_부가세: sumTotal[1],
      전회_공제금액: sumTotal[2],
      전회_계: sumTotal[3],
      금회_공급가: sumTotal[4],
      금회_부가세: sumTotal[5],
      금회_공제금액: sumTotal[6],
      금회_계: sumTotal[7],
      누계_공급가: sumTotal[8],
      누계_부가세: sumTotal[9],
      누계_공제금액: sumTotal[10],
      누계_계: sumTotal[11],
    })

    const worksheet = XLSX.utils.json_to_sheet(formattedData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1')
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' })
    saveAs(blob, '노무비.xlsx')
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

  const sumDirect = calculateSum(rowsDirect)
  const sumOutsourcing = calculateSum(rowsOutsourcing)
  const sumTotal = calculateSum(allRows)

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
                  NO.
                </TableCell>
                <TableCell align="center" rowSpan={2} sx={headerStyle}>
                  사업자등록번호
                </TableCell>
                <TableCell align="center" rowSpan={2} sx={headerStyle}>
                  업체명
                </TableCell>
                <TableCell align="center" rowSpan={2} sx={headerStyle}>
                  공종명
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
                    {r.company}
                  </TableCell>
                  <TableCell align="center" sx={cellStyle}>
                    {r.item}
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

              <TableRow sx={{ backgroundColor: '#f9fafb', fontWeight: 'bold' }}>
                <TableCell align="center" colSpan={9} sx={headerStyle}>
                  직영소계
                </TableCell>
                {sumDirect.map((v, idx) => (
                  <TableCell align="right" sx={cellStyle} key={idx}>
                    {v.toLocaleString()}
                  </TableCell>
                ))}
              </TableRow>

              {rowsOutsourcing.map((r: any) => (
                <TableRow key={`outsourcing-${r.no}`}>
                  <TableCell align="center" sx={cellStyle}>
                    {r.no}
                  </TableCell>
                  <TableCell align="center" sx={cellStyle}>
                    {r.businessNumber}
                  </TableCell>
                  <TableCell align="center" sx={cellStyle}>
                    {r.company}
                  </TableCell>
                  <TableCell align="center" sx={cellStyle}>
                    {r.item}
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

              <TableRow sx={{ backgroundColor: '#f9fafb', fontWeight: 'bold' }}>
                <TableCell align="center" colSpan={9} sx={headerStyle}>
                  용역소계
                </TableCell>
                {sumOutsourcing.map((v, idx) => (
                  <TableCell align="right" sx={cellStyle} key={idx}>
                    {v.toLocaleString()}
                  </TableCell>
                ))}
              </TableRow>

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
