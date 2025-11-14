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

export default function AggregateManagementCostDetailView() {
  const search = useFinalAggregationSearchStore((state) => state.search)
  const { yearMonth, siteId, siteProcessId, outsourcingCompanyId } = search

  const { MealFeeDetailListQuery } = useFinalAggregationView({
    yearMonth,
    siteId,
    siteProcessId,
    tabName: 'MANAGEMENT',
    outsourcingCompanyId,
  })

  const mealFeeDetailList = MealFeeDetailListQuery.data?.data?.items || []
  const dateColumns = Array.from({ length: 31 }, (_, i) => i + 1)

  const getMealCounts = (item: any, mealType: 'breakfastCount' | 'lunchCount' | 'dinnerCount') => {
    const result: Record<number, { count: number; unitPrice: number; amount: number }> = {}
    for (let i = 1; i <= 31; i++) {
      const key = `day${i.toString().padStart(2, '0')}`
      result[i] = {
        count: item?.[key]?.[mealType] || 0,
        unitPrice: item?.[key]?.unitPrice || 0,
        amount: item?.[key]?.amount || 0,
      }
    }
    return result
  }

  const rows = mealFeeDetailList.map((item: any, index: number) => ({
    no: index + 1,
    jobType: item.workType || '-',
    name:
      item.workType === '장비'
        ? item.driver?.name
        : item.workType === '용역'
        ? item.outsourcingCompany?.name
        : item.workType === '외주'
        ? item.outsourcingCompanyContract?.contractName
        : item.labor?.name || '-',

    meals: [
      { type: '조식', days: getMealCounts(item, 'breakfastCount') },
      { type: '중식', days: getMealCounts(item, 'lunchCount') },
      { type: '석식', days: getMealCounts(item, 'dinnerCount') },
    ],
  }))

  const cellStyle = {
    border: '1px solid #9ca3af',
    whiteSpace: 'nowrap',
    padding: '4px 6px',
    textAlign: 'center',
  }
  const headerStyle = { ...cellStyle, fontWeight: 'bold', backgroundColor: '#f3f4f6' }

  const handleExcelDownload = () => {
    const formattedRows: any[][] = []

    rows.forEach((r: any) => {
      // 전체 식사 합계
      const totalMeals = r.meals.reduce((sum: number, meal: any) => {
        return sum + Object.values(meal.days).reduce((a: number, b: any) => a + b.count, 0)
      }, 0)

      // 단가 계산
      const allUnitPrices = r.meals.flatMap((meal: any) =>
        Object.values(meal.days).map((d: any) => d.unitPrice),
      )
      const unitPriceSum = allUnitPrices.reduce((a: any, b: any) => a + b, 0)
      const unitPriceCount = allUnitPrices.filter((v: any) => v > 0).length
      const avgUnitPrice = unitPriceCount ? unitPriceSum / unitPriceCount : 0

      // 총합계 계산(amount 평균)
      const allAmounts = r.meals.flatMap((meal: any) =>
        Object.values(meal.days).map((d: any) => d.amount),
      )
      const amountSum = allAmounts.reduce((a: any, b: any) => a + b, 0)
      const amountCount = allAmounts.filter((v: any) => v > 0).length
      const avgAmount = amountCount ? amountSum / amountCount : 0

      r.meals.forEach((meal: any, idx: number) => {
        const dayCounts = dateColumns.map((d) => meal.days[d].count)

        const row = [
          idx === 0 ? r.no : '',
          idx === 0 ? r.jobType : '',
          idx === 0 ? r.name : '',
          meal.type,
          ...dayCounts,
          idx === 0 ? totalMeals : '',
          idx === 0 ? avgUnitPrice : '',
          idx === 0 ? avgAmount : '',
        ]

        formattedRows.push(row)
      })
    })

    const headerRow = [
      'No',
      '직종',
      '성명',
      '구분',
      ...dateColumns.map((d) => `${d}`),
      '계',
      '단가',
      '총합계',
    ]

    const sheetAoA = [headerRow, ...formattedRows]
    const worksheet = XLSX.utils.aoa_to_sheet(sheetAoA)

    // 칼럼 너비 자동 조절
    worksheet['!cols'] = sheetAoA[0].map((h) => ({
      wch: Math.max(10, String(h).length + 5),
    }))

    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, '식대집계')

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
    saveAs(
      new Blob([excelBuffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      }),
      '식대집계.xlsx',
    )
  }

  return (
    <Paper sx={{ p: 2 }}>
      <div className="flex justify-end">
        <Button variant="contained" color="success" onClick={handleExcelDownload} sx={{ mb: 2 }}>
          엑셀 다운로드
        </Button>
      </div>

      <TableContainer sx={{ overflowX: 'auto' }}>
        <Table sx={{ borderCollapse: 'collapse', minWidth: 1800 }}>
          <TableHead>
            <TableRow>
              <TableCell rowSpan={2} sx={headerStyle}>
                No
              </TableCell>
              <TableCell rowSpan={2} sx={headerStyle}>
                직종
              </TableCell>
              <TableCell rowSpan={2} sx={headerStyle}>
                성명
              </TableCell>
              <TableCell rowSpan={2} sx={headerStyle}>
                구분
              </TableCell>
              {dateColumns.map((d) => (
                <TableCell key={d} sx={headerStyle}>
                  {d}
                </TableCell>
              ))}
              <TableCell rowSpan={2} sx={headerStyle}>
                계
              </TableCell>
              <TableCell rowSpan={2} sx={headerStyle}>
                단가
              </TableCell>
              <TableCell rowSpan={2} sx={headerStyle}>
                총합계
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {rows.map((r: any) => {
              // 사람 전체 식사 합계 계산
              const totalMeals = r.meals.reduce((sum: any, meal: any) => {
                return sum + Object.values(meal.days).reduce((a: any, b: any) => a + b.count, 0)
              }, 0)

              return r.meals.map((meal: any, idx: any) => {
                const unitPrices = Object.values(meal.days).map((d: any) => d.unitPrice)
                const eachAmounts = Object.values(meal.days).map((d: any) => d.amount)

                const unitPriceSum = unitPrices.reduce((a, b) => a + b, 0)
                const unitPriceCount = unitPrices.filter((v) => v > 0).length
                const avgUnitPrice = unitPriceCount ? unitPriceSum / unitPriceCount : 0

                const amountSum = eachAmounts.reduce((a, b) => a + b, 0)
                const amountCount = eachAmounts.filter((v) => v > 0).length

                const avgAmount = amountCount ? amountSum / amountCount : 0

                return (
                  <TableRow key={`${r.no}-${meal.type}`}>
                    {idx === 0 && (
                      <>
                        <TableCell rowSpan={r.meals.length} sx={cellStyle}>
                          {r.no}
                        </TableCell>
                        <TableCell rowSpan={r.meals.length} sx={cellStyle}>
                          {r.jobType}
                        </TableCell>
                        <TableCell rowSpan={r.meals.length} sx={cellStyle}>
                          {r.name}
                        </TableCell>
                        <TableCell sx={cellStyle}>{meal.type}</TableCell>
                        {dateColumns.map((d) => (
                          <TableCell key={d} sx={cellStyle}>
                            {meal.days[d].count}
                          </TableCell>
                        ))}
                        <TableCell rowSpan={r.meals.length} sx={cellStyle}>
                          {totalMeals.toLocaleString()} {/* 전체 식사 합계 */}
                        </TableCell>
                        <TableCell rowSpan={r.meals.length} sx={cellStyle}>
                          {avgUnitPrice.toLocaleString()}
                        </TableCell>
                        <TableCell rowSpan={r.meals.length} sx={cellStyle}>
                          {avgAmount.toLocaleString()}
                        </TableCell>
                      </>
                    )}
                    {idx !== 0 && (
                      <>
                        <TableCell sx={cellStyle}>{meal.type}</TableCell>
                        {dateColumns.map((d) => (
                          <TableCell key={d} sx={cellStyle}>
                            {meal.days[d].count}
                          </TableCell>
                        ))}
                      </>
                    )}
                  </TableRow>
                )
              })
            })}

            <TableRow sx={{ backgroundColor: '#f9fafb', fontWeight: 'bold' }}>
              <TableCell align="center" colSpan={3} sx={cellStyle} rowSpan={3}>
                계
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  )
}
