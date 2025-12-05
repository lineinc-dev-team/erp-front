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
import { useFinalAggregationSearchStore } from '@/stores/finalAggregationStore'
import useFinalAggregationView from '@/hooks/useFinalAggregation'
import { myInfoProps } from '@/types/user'
import { useMenuPermission } from '../common/MenuPermissionView'

export default function AggregateLaborPayRollView() {
  const search = useFinalAggregationSearchStore((state) => state.search)
  const { yearMonth, siteId, siteProcessId } = search

  const directQuery = useFinalAggregationView({
    yearMonth,
    siteId,
    siteProcessId,
    type: 'DIRECT_CONTRACT',
    tabName: 'LABOR_DETAIL',
  })

  const outsourcingQuery = useFinalAggregationView({
    yearMonth,
    siteId,
    siteProcessId,
    type: 'OUTSOURCING',
    tabName: 'LABOR_DETAIL',
  })

  const directData = directQuery.LaborPayCostListQuery.data?.data || []
  const outsourcingData = outsourcingQuery.LaborPayCostListQuery.data?.data || []

  // ✅ 두 데이터 합치기
  const allData = [...directData, ...outsourcingData]

  const formatValue = (value: any) => {
    if (value === null || value === undefined || value === ' ') return ' '
    if (typeof value === 'number' && !isNaN(value)) return value
    return value
  }

  const formatNumber = (value: any) => {
    const num = Number(value)
    if (isNaN(num)) return '0'
    return num.toLocaleString()
  }

  const rows = allData.map((item: any, idx: number) => {
    const labor = item.labor || {}
    const days = Array.from({ length: 31 }, (_, i) =>
      formatValue(item[`day${String(i + 1).padStart(2, '0')}Hours`]),
    )

    return {
      no: idx + 1,
      name: formatValue(labor.name),
      id: formatValue(labor.residentNumber),
      job: labor.type === '직영' ? formatValue(labor.workType) : '용역',
      team:
        labor.type === '직영'
          ? formatValue(labor.type)
          : formatValue(labor.outsourcingCompany.name),
      address: formatValue(labor.address),
      mainWork: labor.type === '직영' ? formatValue(labor.mainWork) : '용역',
      salary: item.dailyWage || 0,
      days,
      totalWork: item.totalWorkHours || 0,
      totalDays: item.totalWorkDays || 0,
      totalLaborCost: item.totalLaborCost || 0,
      incomeTax: item.incomeTax || 0,
      residentTax: item.localTax || 0,
      employmentInsurance: item.employmentInsurance || 0,
      nationalPension: item.nationalPension || 0,
      healthInsurance: item.healthInsurance || 0,
      longTermCare: item.longTermCareInsurance || 0,
      deductionTotal: item.totalDeductions || 0,
      payAfterDeduction: item.netPayment || 0,
      phone: formatValue(labor.phoneNumber),
      bank:
        labor.type === '직영'
          ? formatValue(labor.bankName)
          : formatValue(labor.outsourcingCompany.bankName),
      account:
        labor.type === '직영'
          ? formatValue(labor.accountNumber)
          : formatValue(labor.outsourcingCompany.accountNumber),
      accountName:
        labor.type === '직영'
          ? formatValue(labor.accountHolder)
          : formatValue(labor.outsourcingCompany.accountHolder),
    }
  })

  // ✅ 합계 계산
  const sum = rows.reduce(
    (acc: any, r: any) => {
      acc.totalWork += r.totalWork || 0
      acc.totalDays += r.totalDays || 0
      acc.totalLaborCost += r.totalLaborCost || 0
      acc.incomeTax += r.incomeTax || 0
      acc.residentTax += r.residentTax || 0
      acc.employmentInsurance += r.employmentInsurance || 0
      acc.nationalPension += r.nationalPension || 0
      acc.healthInsurance += r.healthInsurance || 0
      acc.longTermCare += r.longTermCare || 0
      acc.deductionTotal += r.deductionTotal || 0
      acc.payAfterDeduction += r.payAfterDeduction || 0
      return acc
    },
    {
      totalWork: 0,
      totalDays: 0,
      totalLaborCost: 0,
      incomeTax: 0,
      residentTax: 0,
      employmentInsurance: 0,
      nationalPension: 0,
      healthInsurance: 0,
      longTermCare: 0,
      deductionTotal: 0,
      payAfterDeduction: 0,
    },
  )

  const handleExcelDownload = () => {
    const dateColumns = Array.from({ length: 31 }, (_, i) => i + 1)

    // header
    const headerRow1 = [
      'No',
      '성명',
      '주민번호',
      '직종',
      '팀명칭',
      '주소',
      '주작업',
      '일당',
      ...dateColumns.slice(0, 15),
      '',
      '총 공수',
      '총 일수',
      '노무비 총액',
      '소득세',
      '주민세',
      '고용보험',
      '건강보험',
      '장기요양',
      '국민연금',
      '공제합계',
      '차감지급액',
      '휴대전화',
      '은행명',
      '계좌번호',
      '예금주',
    ]
    const headerRow2 = [...Array(8).fill(''), ...dateColumns.slice(16, 31), ...Array(14).fill('')]

    const formatNumberWithComma = (num: number | string) => {
      const n = Number(num) || 0
      return n.toLocaleString() // , 구분
    }

    const dataRows: any[][] = []

    rows.forEach((r) => {
      const row1 = [
        r.no,
        r.name,
        r.id,
        r.job,
        r.team,
        r.address,
        r.mainWork,
        formatNumberWithComma(r.salary),
        ...r.days.slice(0, 15),
        '',
        formatNumberWithComma(r.totalWork),
        formatNumberWithComma(r.totalDays),
        formatNumberWithComma(r.totalLaborCost),
        formatNumberWithComma(r.incomeTax),
        formatNumberWithComma(r.residentTax),
        formatNumberWithComma(r.employmentInsurance),
        formatNumberWithComma(r.healthInsurance),
        formatNumberWithComma(r.longTermCare),
        formatNumberWithComma(r.nationalPension),
        formatNumberWithComma(r.deductionTotal),
        formatNumberWithComma(r.payAfterDeduction),
        r.phone,
        r.bank,
        r.account,
        r.accountName,
      ]
      const row2 = [...Array(8).fill(''), ...r.days.slice(16, 31), ...Array(14).fill('')]
      dataRows.push(row1, row2)
    })

    const sumRow1 = [
      '소계',
      ...Array(7).fill(''),
      ...Array.from({ length: 15 }, (_, i) =>
        formatNumberWithComma(rows.reduce((acc, r) => acc + (Number(r.days[i]) || 0), 0)),
      ),
      '',
      formatNumberWithComma(sum.totalWork),
      formatNumberWithComma(sum.totalDays),
      formatNumberWithComma(sum.totalLaborCost),
      formatNumberWithComma(sum.incomeTax),
      formatNumberWithComma(sum.residentTax),
      formatNumberWithComma(sum.employmentInsurance),
      formatNumberWithComma(sum.healthInsurance),
      formatNumberWithComma(sum.longTermCare),
      formatNumberWithComma(sum.nationalPension),
      formatNumberWithComma(sum.deductionTotal),
      formatNumberWithComma(sum.payAfterDeduction),
      '',
      '',
      '',
      '',
    ]
    const sumRow2 = [
      ...Array(8).fill(''),
      ...Array.from({ length: 16 }, (_, i) =>
        formatNumberWithComma(rows.reduce((acc, r) => acc + (Number(r.days[i + 15]) || 0), 0)),
      ),
      ...Array(14).fill(''),
    ]

    const sheetAoA = [headerRow1, headerRow2, ...dataRows, sumRow1, sumRow2]
    const worksheet = XLSX.utils.aoa_to_sheet(sheetAoA)

    // 병합
    worksheet['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 1, c: 0 } },
      { s: { r: 0, c: 1 }, e: { r: 1, c: 1 } },
      { s: { r: 0, c: 2 }, e: { r: 1, c: 2 } },
      { s: { r: 0, c: 3 }, e: { r: 1, c: 3 } },
      { s: { r: 0, c: 4 }, e: { r: 1, c: 4 } },
      { s: { r: 0, c: 5 }, e: { r: 1, c: 5 } },
      { s: { r: 0, c: 6 }, e: { r: 1, c: 6 } },
      { s: { r: 0, c: 7 }, e: { r: 1, c: 7 } },
      { s: { r: sheetAoA.length - 2, c: 0 }, e: { r: sheetAoA.length - 1, c: 7 } },

      // { s: { r: 2, c: 0 }, e: { r: 3, c: 0 } },
      // { s: { r: 2, c: 1 }, e: { r: 3, c: 1 } },

      { s: { r: 0, c: 24 }, e: { r: 1, c: 24 } },
      { s: { r: 0, c: 25 }, e: { r: 1, c: 25 } },
      { s: { r: 0, c: 26 }, e: { r: 1, c: 26 } },
      { s: { r: 0, c: 27 }, e: { r: 1, c: 27 } },
      { s: { r: 0, c: 28 }, e: { r: 1, c: 28 } },
      { s: { r: 0, c: 29 }, e: { r: 1, c: 29 } },
      { s: { r: 0, c: 30 }, e: { r: 1, c: 30 } },
      { s: { r: 0, c: 31 }, e: { r: 1, c: 31 } },
      { s: { r: 0, c: 32 }, e: { r: 1, c: 32 } },
      { s: { r: 0, c: 33 }, e: { r: 1, c: 33 } },
      { s: { r: 0, c: 34 }, e: { r: 1, c: 34 } },
      { s: { r: 0, c: 35 }, e: { r: 1, c: 35 } },
      { s: { r: 0, c: 36 }, e: { r: 1, c: 36 } },
      { s: { r: 0, c: 37 }, e: { r: 1, c: 37 } },
      { s: { r: 0, c: 38 }, e: { r: 1, c: 38 } },
      { s: { r: sheetAoA.length - 2, c: 24 }, e: { r: sheetAoA.length - 1, c: 24 } },
      { s: { r: sheetAoA.length - 2, c: 25 }, e: { r: sheetAoA.length - 1, c: 25 } },
      { s: { r: sheetAoA.length - 2, c: 26 }, e: { r: sheetAoA.length - 1, c: 26 } },
      { s: { r: sheetAoA.length - 2, c: 27 }, e: { r: sheetAoA.length - 1, c: 27 } },
      { s: { r: sheetAoA.length - 2, c: 28 }, e: { r: sheetAoA.length - 1, c: 28 } },
      { s: { r: sheetAoA.length - 2, c: 29 }, e: { r: sheetAoA.length - 1, c: 29 } },
      { s: { r: sheetAoA.length - 2, c: 30 }, e: { r: sheetAoA.length - 1, c: 30 } },
      { s: { r: sheetAoA.length - 2, c: 31 }, e: { r: sheetAoA.length - 1, c: 31 } },
      { s: { r: sheetAoA.length - 2, c: 32 }, e: { r: sheetAoA.length - 1, c: 32 } },
      { s: { r: sheetAoA.length - 2, c: 33 }, e: { r: sheetAoA.length - 1, c: 33 } },
      { s: { r: sheetAoA.length - 2, c: 34 }, e: { r: sheetAoA.length - 1, c: 34 } },
      { s: { r: sheetAoA.length - 2, c: 35 }, e: { r: sheetAoA.length - 1, c: 38 } },
    ]

    const range = XLSX.utils.decode_range(worksheet['!ref'] ?? '')
    const totalRowStart = sheetAoA.length - 2
    const totalRowEnd = sheetAoA.length - 1

    const amountCols = [7, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34]

    for (let R = range.s.r; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cellRef = XLSX.utils.encode_cell({ r: R, c: C })
        if (!worksheet[cellRef]) worksheet[cellRef] = { v: '' }

        const isHeader = R < 2
        const isTotalRow = R === totalRowStart || R === totalRowEnd
        const isRightAlign = amountCols.includes(C)

        worksheet[cellRef].s = {
          border: {
            top: { style: 'thin', color: { rgb: '000000' } },
            bottom: { style: 'thin', color: { rgb: '000000' } },
            left: { style: 'thin', color: { rgb: '000000' } },
            right: { style: 'thin', color: { rgb: '000000' } },
          },
          fill:
            isHeader || isTotalRow
              ? { patternType: 'solid', fgColor: { rgb: 'C0C0C0' } }
              : undefined,
          alignment: {
            vertical: 'center',
            horizontal: isRightAlign ? 'right' : 'center',
          },
        }
      }
    }

    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, '노무비명세서')
    XLSX.writeFile(workbook, '노무비명세서.xlsx')
  }

  const cellStyle = {
    border: '1px solid #9ca3af',
    padding: '4px 6px',
    whiteSpace: 'nowrap',
    minWidth: 40,
    height: 30,
  }

  const headerStyle = {
    ...cellStyle,
    backgroundColor: '#f3f4f6',
    fontWeight: 'bold',
    textAlign: 'center' as const,
  }

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
    <Paper sx={{ p: 2 }}>
      <div className="flex justify-end mb-2">
        <Button
          variant="contained"
          disabled={!hasExcelDownload}
          color="success"
          onClick={handleExcelDownload}
        >
          엑셀 다운로드
        </Button>
      </div>

      <TableContainer sx={{ overflowX: 'auto' }}>
        <Table sx={{ borderCollapse: 'collapse', minWidth: 2400 }}>
          <TableHead>
            <TableRow>
              {['No', '성명', '주민번호', '직종', '팀명칭', '주소', '주작업', '일당'].map((h) => (
                <TableCell key={h} rowSpan={2} sx={headerStyle}>
                  {h}
                </TableCell>
              ))}
              {Array.from({ length: 16 }, (_, i) => (
                <TableCell key={i} sx={headerStyle}>
                  {i === 15 ? '' : i + 1}
                </TableCell>
              ))}

              {[
                '총 공수',
                '총 일수',
                '노무비 총액',
                '소득세',
                '주민세',
                '고용보험',
                '건강보험',

                '장기요양',

                '국민연금',

                '공제합계',
                '차감지급액',
                '휴대전화',
                '은행명',
                '계좌번호',
                '예금주',
              ].map((h) => (
                <TableCell key={h} rowSpan={2} sx={headerStyle}>
                  {h}
                </TableCell>
              ))}
            </TableRow>

            <TableRow>
              {Array.from({ length: 16 }, (_, i) => i + 16).map((d) => (
                <TableCell key={d} sx={headerStyle}>
                  {d}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {rows.map((r: any) => (
              <React.Fragment key={r.no}>
                {/* 첫 번째 행: 1~16일 */}
                <TableRow>
                  <TableCell align="center" rowSpan={2} sx={cellStyle}>
                    {r.no}
                  </TableCell>
                  <TableCell align="center" rowSpan={2} sx={cellStyle}>
                    {r.name}
                  </TableCell>
                  <TableCell align="center" rowSpan={2} sx={cellStyle}>
                    {r.id}
                  </TableCell>
                  <TableCell align="center" rowSpan={2} sx={cellStyle}>
                    {r.job}
                  </TableCell>
                  <TableCell align="center" rowSpan={2} sx={cellStyle}>
                    {r.team}
                  </TableCell>
                  <TableCell align="center" rowSpan={2} sx={cellStyle}>
                    {r.address}
                  </TableCell>
                  <TableCell align="center" rowSpan={2} sx={cellStyle}>
                    {r.mainWork}
                  </TableCell>
                  <TableCell align="right" rowSpan={2} sx={cellStyle}>
                    {formatNumber(r.salary)}
                  </TableCell>

                  {/* 날짜 1~16일 (16번째 칸은 빈칸) */}
                  {r.days.slice(0, 15).map((v: any, i: number) => (
                    <TableCell key={`day1-${i}`} align="center" sx={cellStyle}>
                      {v}
                    </TableCell>
                  ))}
                  {/* 15뒤에 빈칸 */}
                  <TableCell key="day1-empty" align="center" sx={cellStyle}></TableCell>

                  {/* 총 공수, 총 일수 등 */}
                  <TableCell align="center" rowSpan={2} sx={cellStyle}>
                    {r.totalWork}
                  </TableCell>
                  <TableCell align="center" rowSpan={2} sx={cellStyle}>
                    {r.totalDays}
                  </TableCell>
                  <TableCell align="right" rowSpan={2} sx={cellStyle}>
                    {formatNumber(r.totalLaborCost)}
                  </TableCell>
                  <TableCell align="right" rowSpan={2} sx={cellStyle}>
                    {formatNumber(r.incomeTax)}
                  </TableCell>
                  <TableCell align="right" rowSpan={2} sx={cellStyle}>
                    {formatNumber(r.residentTax)}
                  </TableCell>
                  <TableCell align="right" rowSpan={2} sx={cellStyle}>
                    {formatNumber(r.employmentInsurance)}
                  </TableCell>

                  <TableCell align="right" rowSpan={2} sx={cellStyle}>
                    {formatNumber(r.healthInsurance)}
                  </TableCell>
                  <TableCell align="right" rowSpan={2} sx={cellStyle}>
                    {formatNumber(r.longTermCare)}
                  </TableCell>
                  <TableCell align="right" rowSpan={2} sx={cellStyle}>
                    {formatNumber(r.nationalPension)}
                  </TableCell>

                  <TableCell align="right" rowSpan={2} sx={cellStyle}>
                    {formatNumber(r.deductionTotal)}
                  </TableCell>
                  <TableCell align="right" rowSpan={2} sx={cellStyle}>
                    {formatNumber(r.payAfterDeduction)}
                  </TableCell>
                  <TableCell align="center" rowSpan={2} sx={cellStyle}>
                    {r.phone}
                  </TableCell>
                  <TableCell align="center" rowSpan={2} sx={cellStyle}>
                    {r.bank}
                  </TableCell>
                  <TableCell align="center" rowSpan={2} sx={cellStyle}>
                    {r.account}
                  </TableCell>
                  <TableCell align="center" rowSpan={2} sx={cellStyle}>
                    {r.accountName}
                  </TableCell>
                </TableRow>

                {/* 두 번째 행: 17~31일 */}
                <TableRow>
                  {r.days.slice(16, 32).map((v: any, i: number) => (
                    <TableCell key={`day2-${i}`} align="center" sx={cellStyle}>
                      {v}
                    </TableCell>
                  ))}
                </TableRow>
              </React.Fragment>
            ))}

            {/* ✅ 소계 행 */}
            <TableRow sx={{ backgroundColor: '#f9fafb', fontWeight: 'bold' }}>
              <TableCell align="center" colSpan={8} sx={cellStyle} rowSpan={2}>
                소계
              </TableCell>

              {Array.from({ length: 15 }, (_, i) => (
                <TableCell key={`sum-day1-${i}`} align="center" sx={cellStyle}>
                  {formatNumber(
                    rows.reduce((acc: any, r: any) => acc + (Number(r.days[i]) || 0), 0),
                  )}
                </TableCell>
              ))}

              {/* 마지막 16번째 칸은 빈칸 */}
              <TableCell key="sum-day1-empty" align="center" sx={cellStyle}>
                {' '}
              </TableCell>

              {/* 총 공수, 총 일수 등 */}
              <TableCell align="center" rowSpan={2} sx={cellStyle}>
                {sum.totalWork}
              </TableCell>
              <TableCell align="center" rowSpan={2} sx={cellStyle}>
                {sum.totalDays}
              </TableCell>
              <TableCell align="right" rowSpan={2} sx={cellStyle}>
                {formatNumber(sum.totalLaborCost)}
              </TableCell>
              <TableCell align="right" rowSpan={2} sx={cellStyle}>
                {formatNumber(sum.incomeTax)}
              </TableCell>
              <TableCell align="right" rowSpan={2} sx={cellStyle}>
                {formatNumber(sum.residentTax)}
              </TableCell>
              <TableCell align="right" rowSpan={2} sx={cellStyle}>
                {formatNumber(sum.employmentInsurance)}
              </TableCell>
              <TableCell align="right" rowSpan={2} sx={cellStyle}>
                {formatNumber(sum.healthInsurance)}
              </TableCell>
              <TableCell align="right" rowSpan={2} sx={cellStyle}>
                {formatNumber(sum.longTermCare)}
              </TableCell>
              <TableCell align="right" rowSpan={2} sx={cellStyle}>
                {formatNumber(sum.nationalPension)}
              </TableCell>
              <TableCell align="right" rowSpan={2} sx={cellStyle}>
                {formatNumber(sum.deductionTotal)}
              </TableCell>
              <TableCell align="right" rowSpan={2} sx={cellStyle}>
                {formatNumber(sum.payAfterDeduction)}
              </TableCell>

              {/* 휴대전화~예금주 공백 */}
              <TableCell align="center" colSpan={4} rowSpan={2} sx={cellStyle}></TableCell>
            </TableRow>

            {/* 날짜 16~31일 합계 */}
            <TableRow sx={{ backgroundColor: '#f9fafb', fontWeight: 'bold' }}>
              {Array.from({ length: 16 }, (_, i) => (
                <TableCell key={`sum-day2-${i}`} align="center" sx={cellStyle}>
                  {formatNumber(
                    rows.reduce((acc: any, r: any) => acc + (Number(r.days[i + 15]) || 0), 0),
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  )
}
