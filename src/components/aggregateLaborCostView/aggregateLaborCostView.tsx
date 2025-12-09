import React, { useEffect, useMemo, useState } from 'react'
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

type Billing = {
  supplyPrice?: number
  vat?: number
  deductionAmount?: number
  total?: number
}

type OutsourcingCompany = {
  type?: string
  businessNumber?: string
  name?: string
  ceoName?: string
  landlineNumber?: string
  bankName?: string
  accountNumber?: string
  accountHolder?: string
}

type LaborInfo = {
  workType?: string
  name?: string
  phoneNumber?: string
  bankName?: string
  accountNumber?: string
  accountHolder?: string
}

type RawLaborItem = {
  outsourcingCompany?: OutsourcingCompany
  labor?: LaborInfo
  previousBilling?: Billing
  currentBilling?: Billing
}

type LaborRow = {
  no: number
  category: string
  businessNumber: string
  company: string
  item: string
  ceo: string
  contact: string
  bank: string
  accountNumber: string
  accountName: string
  prevSupply: number
  prevTax: number
  prevDeduction: number
  prevTotal: number
  currSupply: number
  currTax: number
  currDeduction: number
  currTotal: number
  totalSupply: number
  totalTax: number
  totalDeduction: number
  totalTotal: number
}

const amountKeys = [
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
] as const

type AmountKey = (typeof amountKeys)[number]

const headerRow1 = [
  'NO.',
  '사업자등록번호',
  '업체명',
  '공종명',
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

const cellStyle = {
  border: '1px solid #9ca3af',
  whiteSpace: 'nowrap',
  padding: '4px 8px',
}

const headerStyle = {
  ...cellStyle,
  fontWeight: 'bold',
  backgroundColor: '#f3f4f6',
  minWidth: 100,
}

const toRow = (item: RawLaborItem, index: number): LaborRow => {
  const outsourcing = item.outsourcingCompany || {}
  const labor = item?.labor
  const prev: Billing = item.previousBilling || {}
  const curr: Billing = item.currentBilling || {}

  return {
    no: index + 1,
    category: outsourcing.type || '-',
    businessNumber: outsourcing.businessNumber || '-',
    company: outsourcing.name || '-',
    item: labor?.workType || '-',
    ceo: outsourcing.ceoName || labor?.name || '-',
    contact: outsourcing.landlineNumber || labor?.phoneNumber || '-',
    bank: outsourcing.bankName || labor?.bankName || '-',
    accountNumber: outsourcing.accountNumber || labor?.accountNumber || '-',
    accountName: outsourcing.accountHolder || labor?.accountHolder || '-',
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
}

const sumRows = (rows: LaborRow[]) =>
  amountKeys.map((key) => rows.reduce<number>((acc, r) => acc + (r[key] || 0), 0))

const formatAmounts = (values: number[]) => values.map((v) => v.toLocaleString())

const buildSheetData = (
  rowsDirect: LaborRow[],
  rowsOutsourcing: LaborRow[],
  sumDirect: number[],
  sumOutsourcing: number[],
  sumTotal: number[],
) => {
  const sheet: (string | number)[][] = [headerRow1, headerRow2]

  const pushRows = (rows: LaborRow[]) =>
    rows.forEach((r) =>
      sheet.push([
        r.no,
        r.businessNumber,
        r.company,
        r.item,
        r.ceo,
        r.contact,
        r.bank,
        r.accountNumber,
        r.accountName,
        ...amountKeys.map((k) => (r[k] || 0).toLocaleString()),
      ]),
    )

  pushRows(rowsDirect)
  sheet.push(['직영소계', '', '', '', '', '', '', '', '', ...formatAmounts(sumDirect)])
  pushRows(rowsOutsourcing)
  sheet.push(['용역소계', '', '', '', '', '', '', '', '', ...formatAmounts(sumOutsourcing)])
  sheet.push(['합계', '', '', '', '', '', '', '', '', ...formatAmounts(sumTotal)])

  return sheet
}

const applySheetStyleAndMerge = (
  ws: XLSX.WorkSheet,
  rowsDirectLength: number,
  rowsOutsourcingLength: number,
) => {
  const directSubtotalRow = 2 + rowsDirectLength
  const outsourcingStartRow = directSubtotalRow + 1
  const outsourcingSubtotalRow = outsourcingStartRow + rowsOutsourcingLength
  const totalRow = outsourcingSubtotalRow + 1

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
    { s: { r: directSubtotalRow, c: 0 }, e: { r: directSubtotalRow, c: 8 } },
    { s: { r: outsourcingSubtotalRow, c: 0 }, e: { r: outsourcingSubtotalRow, c: 8 } },
    { s: { r: totalRow, c: 0 }, e: { r: totalRow, c: 8 } },
  ]

  const range = XLSX.utils.decode_range(ws['!ref']!)
  for (let R = 0; R <= range.e.r; R++) {
    for (let C = 0; C <= range.e.c; C++) {
      const cellRef = XLSX.utils.encode_cell({ r: R, c: C })
      if (!ws[cellRef]) ws[cellRef] = { v: '' }

      const cellValue = ws[cellRef].v
      const isHeader = R < 2
      const isAmount = !isHeader && C >= 9
      const isSubtotal =
        typeof cellValue === 'string' && (cellValue.includes('소계') || cellValue === '합계')

      ws[cellRef].s = {
        border: {
          top: { style: 'thin', color: { rgb: '000000' } },
          bottom: { style: 'thin', color: { rgb: '000000' } },
          left: { style: 'thin', color: { rgb: '000000' } },
          right: { style: 'thin', color: { rgb: '000000' } },
        },
        fill: isHeader ? { patternType: 'solid', fgColor: { rgb: 'C0C0C0' } } : undefined,
        alignment: {
          horizontal: isHeader || isSubtotal ? 'center' : isAmount ? 'right' : 'center',
          vertical: 'center',
        },
        font: { bold: isHeader || isSubtotal },
      }
    }
  }
}

export default function AggregateLaborCostView() {
  const search = useFinalAggregationSearchStore((state) => state.search)

  const { LaborCostListQuery } = useFinalAggregationView({
    yearMonth: search.yearMonth,
    siteId: search.siteId,
    siteProcessId: search.siteProcessId,
    laborType: 'DIRECT_CONTRACT',
    tabName: 'LABOR',
  })

  const { OutSourcingLaborCostListQuery } = useFinalAggregationView({
    yearMonth: search.yearMonth,
    siteId: search.siteId,
    siteProcessId: search.siteProcessId,
    tabName: 'LABOR',
  })

  const rowsDirect = useMemo(
    () => (LaborCostListQuery.data?.data?.items || []).map(toRow),
    [LaborCostListQuery.data],
  )
  const rowsOutsourcing = useMemo(
    () => (OutSourcingLaborCostListQuery.data?.data?.items || []).map(toRow),
    [OutSourcingLaborCostListQuery.data],
  )
  const allRows = useMemo(() => [...rowsDirect, ...rowsOutsourcing], [rowsDirect, rowsOutsourcing])

  const sumDirect = useMemo(() => sumRows(rowsDirect), [rowsDirect])
  const sumOutsourcing = useMemo(() => sumRows(rowsOutsourcing), [rowsOutsourcing])
  const sumTotal = useMemo(() => sumRows(allRows), [allRows])

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

  const { hasExcelDownload } = useMenuPermission(roleId, '집계 관리', enabled)

  const handleExcelDownload = () => {
    const wb = XLSX.utils.book_new()
    const sheetData = buildSheetData(
      rowsDirect,
      rowsOutsourcing,
      sumDirect,
      sumOutsourcing,
      sumTotal,
    )
    const ws = XLSX.utils.aoa_to_sheet(sheetData)

    applySheetStyleAndMerge(ws, rowsDirect.length, rowsOutsourcing.length)

    const fileName = `${search.yearMonth}_${search.siteName}_노무비.xlsx`
    XLSX.utils.book_append_sheet(wb, ws, '노무비')
    XLSX.writeFile(wb, fileName)
  }

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
              {rowsDirect.map((r: LaborRow) => (
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
                  {amountKeys.map((key: AmountKey) => (
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

              {rowsOutsourcing.map((r: LaborRow) => (
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
                  {amountKeys.map((key: AmountKey) => (
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
