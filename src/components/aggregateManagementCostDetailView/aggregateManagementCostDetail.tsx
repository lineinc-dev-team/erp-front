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

  const handleExcelDownload = () => {
    const formattedRows: any[][] = []

    // 1️⃣ 사람별 데이터
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

      const totalAmount = totalMeals * avgUnitPrice // ✅ 계 * 단가

      r.meals.forEach((meal: any, idx: number) => {
        const dayCounts = dateColumns.map((d) => meal.days[d].count)

        const row = [
          idx === 0 ? r.no : '',
          idx === 0 ? r.jobType : '',
          idx === 0 ? r.name : '',
          meal.type,
          ...dayCounts,
          idx === 0 ? totalMeals.toLocaleString() : '', // 천 단위 , 적용
          idx === 0 ? avgUnitPrice.toLocaleString() : '',
          idx === 0 ? totalAmount.toLocaleString() : '',
        ]

        formattedRows.push(row)
      })
    })

    // 2️⃣ 총합계 계산
    const totalPerDayByMeal = ['조식', '중식', '석식'].map((mealType) =>
      dateColumns.map((d) =>
        rows.reduce((sum: number, r: any) => {
          const meal = r.meals.find((m: any) => m.type === mealType)
          return sum + (meal?.days[d]?.count || 0)
        }, 0),
      ),
    )

    const totalMealsByMeal = rows
      .reduce((sum: number, r: any) => {
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
      .toLocaleString() // ✅ 천 단위

    const totalUnitPriceByMeal = rows
      .reduce((sum: number, r: any) => {
        const allPrices = r.meals.flatMap((meal: any) =>
          Object.values(meal.days || {}).map((d: any) => d.unitPrice),
        )
        const filtered = allPrices.filter((v: any) => v > 0)
        const avg = filtered.length
          ? filtered.reduce((a: any, b: any) => a + b, 0) / filtered.length
          : 0
        return sum + avg
      }, 0)
      .toLocaleString() // ✅ 천 단위

    const totalAmountByMeal = (
      Number(totalMealsByMeal.replace(/,/g, '')) * Number(totalUnitPriceByMeal.replace(/,/g, ''))
    ).toLocaleString() // ✅ 계 * 단가, 천 단위

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

    // 3️⃣ 헤더
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

    // 4️⃣ 셀 스타일: 테두리, 회색 헤더
    const borderStyle = {
      top: { style: 'thin', color: { rgb: '000000' } },
      bottom: { style: 'thin', color: { rgb: '000000' } },
      left: { style: 'thin', color: { rgb: '000000' } },
      right: { style: 'thin', color: { rgb: '000000' } },
    }

    sheetAoA.forEach((row, rowIndex) => {
      row.forEach((_, colIndex) => {
        const cell = worksheet[XLSX.utils.encode_cell({ r: rowIndex, c: colIndex })]
        if (!cell) return
        cell.s = {
          border: borderStyle,
          alignment: { vertical: 'center', horizontal: 'center' },
          fill: rowIndex === 0 ? { fgColor: { rgb: 'CCCCCC' } } : undefined, // 헤더 회색
        }
      })
    })

    // 마지막 계 3x3 병합
    worksheet['!merges'] = [
      // 기존 마지막 계 텍스트 3x3 (No, 직종, 성명)
      {
        s: { r: sheetAoA.length - 3, c: 0 },
        e: { r: sheetAoA.length - 1, c: 2 },
      },

      // 마지막 열 계, 단가, 총합계 세로 병합
      {
        s: { r: sheetAoA.length - 3, c: sheetAoA[0].length - 3 },
        e: { r: sheetAoA.length - 1, c: sheetAoA[0].length - 3 },
      }, // 계
      {
        s: { r: sheetAoA.length - 3, c: sheetAoA[0].length - 2 },
        e: { r: sheetAoA.length - 1, c: sheetAoA[0].length - 2 },
      }, // 단가
      {
        s: { r: sheetAoA.length - 3, c: sheetAoA[0].length - 1 },
        e: { r: sheetAoA.length - 1, c: sheetAoA[0].length - 1 },
      }, // 총합계

      // 기존 사람별 세로 병합
      ...rows.flatMap((_: any, rIdx: any) => {
        const startRow = 1 + rIdx * 3
        return [
          { s: { r: startRow, c: 0 }, e: { r: startRow + 2, c: 0 } }, // No
          { s: { r: startRow, c: 1 }, e: { r: startRow + 2, c: 1 } }, // 직종
          { s: { r: startRow, c: 2 }, e: { r: startRow + 2, c: 2 } }, // 성명

          // 마지막 3칸 병합 (계, 단가, 총합계)
          {
            s: { r: startRow, c: sheetAoA[0].length - 3 },
            e: { r: startRow + 2, c: sheetAoA[0].length - 3 },
          }, // 계
          {
            s: { r: startRow, c: sheetAoA[0].length - 2 },
            e: { r: startRow + 2, c: sheetAoA[0].length - 2 },
          }, // 단가
          {
            s: { r: startRow, c: sheetAoA[0].length - 1 },
            e: { r: startRow + 2, c: sheetAoA[0].length - 1 },
          }, // 총합계
        ]
      }),
    ]

    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, '식대집계')

    const fileName = `${search.yearMonth}_${search.outsourcingCompanyName}_관리비업체.xlsx`

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array', cellStyles: true })
    saveAs(
      new Blob([excelBuffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      }),
      fileName,
    )
  }

  const cellStyle = {
    border: '1px solid #9ca3af',
    whiteSpace: 'nowrap',
    padding: '4px 6px',
    textAlign: 'center',
  }
  const headerStyle = { ...cellStyle, fontWeight: 'bold', backgroundColor: '#f3f4f6' }

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

                const unitPriceSum = unitPrices.reduce((a, b) => a + b, 0)
                const unitPriceCount = unitPrices.filter((v) => v > 0).length
                const avgUnitPrice = unitPriceCount ? unitPriceSum / unitPriceCount : 0

                const avgAmount = totalMeals * avgUnitPrice

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

              const mealTypes = ['조식', '중식', '석식']

              const totalAmountsByMealArray = mealTypes.map((mealType) =>
                rows.reduce((sum: number, r: any) => {
                  const meal = r.meals.find((m: any) => m.type === mealType)
                  if (!meal) return sum

                  const mealTotal = Object.values(meal.days).reduce((acc: number, day: any) => {
                    const count = day.count || 0
                    const unitPrice = day.unitPrice || 0
                    return acc + count * unitPrice
                  }, 0)

                  return sum + mealTotal
                }, 0),
              )
              // 2️⃣ 모든 식사 합계
              const finalGrandTotal = totalAmountsByMealArray.reduce((acc, val) => acc + val, 0)

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
                        {finalGrandTotal.toLocaleString()}
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
