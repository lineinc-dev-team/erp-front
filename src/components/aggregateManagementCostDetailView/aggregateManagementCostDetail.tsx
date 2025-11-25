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
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import useFinalAggregationView from '@/hooks/useFinalAggregation'
import { useFinalAggregationSearchStore } from '@/stores/finalAggregationStore'
import { useMenuPermission } from '../common/MenuPermissionView'
import { myInfoProps } from '@/types/user'

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

    // 사람별 데이터
    rows.forEach((r: any) => {
      const totalMeals = r.meals.reduce(
        (sum: number, meal: any) =>
          sum + Object.values(meal.days).reduce((a: number, b: any) => a + b.count, 0),
        0,
      )

      const allUnitPrices = r.meals.flatMap((meal: any) =>
        Object.values(meal.days).map((d: any) => d.unitPrice),
      )
      const unitPriceSum = allUnitPrices.reduce((a: any, b: any) => a + b, 0)
      const unitPriceCount = allUnitPrices.filter((v: any) => v > 0).length
      const avgUnitPrice = unitPriceCount ? unitPriceSum / unitPriceCount : 0

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

    // 총합계 계산
    const totalPerDayByMeal = ['조식', '중식', '석식'].map((mealType) =>
      dateColumns.map((d) =>
        rows.reduce((sum: number, r: any) => {
          const meal = r.meals.find((m: any) => m.type === mealType)
          return sum + (meal?.days[d]?.count || 0)
        }, 0),
      ),
    )

    const totalMealsByMeal = rows.reduce((sum: number, r: any) => {
      return (
        sum +
        r.meals.reduce(
          (mealSum: number, meal: any) =>
            mealSum +
            Object.values(meal.days || {}).reduce((c: number, d: any) => c + (d.count || 0), 0),
          0,
        )
      )
    }, 0)

    const totalUnitPriceByMeal = rows.reduce((sum: number, r: any) => {
      const allPrices = r.meals.flatMap((meal: any) =>
        Object.values(meal.days || {}).map((d: any) => d.unitPrice),
      )
      const filtered = allPrices.filter((v: any) => v > 0)
      const avg = filtered.length
        ? filtered.reduce((a: any, b: any) => a + b, 0) / filtered.length
        : 0
      return sum + avg
    }, 0)

    const totalAmountByMeal = rows.reduce((sum: number, r: any) => {
      const allAmounts = r.meals.flatMap((meal: any) =>
        Object.values(meal.days || {}).map((d: any) => d.amount),
      )
      const filtered = allAmounts.filter((v: any) => v > 0)
      const avg = filtered.length
        ? filtered.reduce((a: any, b: any) => a + b, 0) / filtered.length
        : 0
      return sum + avg
    }, 0)

    const meals = ['조식', '중식', '석식']

    meals.forEach((mealType: any, idx: any) => {
      const row: any[] = []
      if (idx === 0) {
        row.push('계', '', '') // No, 직종, 성명
      } else {
        row.push('', '', '')
      }
      row.push(mealType)
      row.push(...totalPerDayByMeal[idx])
      if (idx === 0) {
        row.push(totalMealsByMeal, totalUnitPriceByMeal, totalAmountByMeal)
      } else {
        row.push('', '', '')
      }
      formattedRows.push(row)
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

            {/* 최종 총계 행 */}
            {['조식', '중식', '석식'].map((mealType, idx) => {
              const totalPerDayByMeal = dateColumns.map((d) =>
                rows.reduce((sum: number, r: any) => {
                  const meal = r.meals.find((m: any) => m.type === mealType)
                  return sum + (meal?.days[d]?.count || 0)
                }, 0),
              )

              // 모든 식사 총합 계산 (한 번만)
              const totalMealsByMeal = rows.reduce((sum: number, r: any) => {
                return (
                  sum +
                  r.meals.reduce(
                    (mealSum: number, meal: any) =>
                      mealSum +
                      Object.values(meal.days || {}).reduce(
                        (c: number, d: any) => c + (d.count || 0),
                        0,
                      ),
                    0,
                  )
                )
              }, 0)

              const totalUnitPriceByMeal = rows.reduce((sum: number, r: any) => {
                const meal = r.meals.find((m: any) => m.type === mealType)
                const prices = Object.values(meal?.days || {}).map((d: any) => d.unitPrice)
                const filtered = prices.filter((v) => v > 0)
                const avg = filtered.length
                  ? filtered.reduce((a, b) => a + b, 0) / filtered.length
                  : 0
                return sum + avg
              }, 0)

              const totalAmountByMeal = rows.reduce((sum: number, r: any) => {
                const meal = r.meals.find((m: any) => m.type === mealType)
                const prices = Object.values(meal?.days || {}).map((d: any) => d.amount)
                const filtered = prices.filter((v) => v > 0)
                const avg = filtered.length
                  ? filtered.reduce((a, b) => a + b, 0) / filtered.length
                  : 0
                return sum + avg
              }, 0)

              return (
                <TableRow key={mealType} sx={{ backgroundColor: '#e5e7eb', fontWeight: 'bold' }}>
                  {idx === 0 && (
                    <TableCell align="center" rowSpan={3} colSpan={3} sx={cellStyle}>
                      계
                    </TableCell>
                  )}
                  <TableCell sx={cellStyle}>{mealType}</TableCell>
                  {totalPerDayByMeal.map((v, d) => (
                    <TableCell key={d} sx={cellStyle}>
                      {v.toLocaleString()}
                    </TableCell>
                  ))}
                  {idx === 0 && (
                    <>
                      <TableCell rowSpan={3} sx={cellStyle}>
                        {totalMealsByMeal.toLocaleString()}
                      </TableCell>
                      <TableCell rowSpan={3} sx={cellStyle}>
                        {totalUnitPriceByMeal.toLocaleString()}
                      </TableCell>
                      <TableCell rowSpan={3} sx={cellStyle}>
                        {totalAmountByMeal.toLocaleString()}
                      </TableCell>
                    </>
                  )}
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  )
}
