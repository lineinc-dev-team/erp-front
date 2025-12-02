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
import { myInfoProps } from '@/types/user'
import { useMenuPermission } from '../common/MenuPermissionView'

export default function AggregateEquipmentOperationStatusView() {
  const search = useFinalAggregationSearchStore((state) => state.search)
  const { yearMonth, siteId, siteProcessId } = search

  const { EquipmentStatusLaborCostListQuery } = useFinalAggregationView({
    yearMonth,
    siteId,
    siteProcessId,
    tabName: 'EQUIPMENT_OPERATION',
  })

  const { WeatherInfoListQuery } = useFinalAggregationView({
    yearMonth,
    siteId,
    siteProcessId,
    tabName: 'EQUIPMENT_OPERATION',
  })

  const dateColumns = Array.from({ length: 31 }, (_, i) => i + 1)
  const equipmentStatusList = EquipmentStatusLaborCostListQuery?.data?.data?.items || []
  const WeatherInfo = WeatherInfoListQuery?.data?.data || {}

  const weatherMap: Record<string, string> = {
    SUNNY: '맑음',
    CLOUDY: '흐림',
    RAINY: '비',
    SNOWY: '눈',
    WINDY: '바람',
  }

  function getDays(data: any, count: number) {
    const result: Record<number, { amount: number; unitPrice: number }> = {}
    for (let i = 1; i <= count; i++) {
      const key = `day${i.toString().padStart(2, '0')}`
      const hours = data?.[key]?.hours || data?.[key]?.amount || 0
      const unitPrice = data?.[key]?.unitPrice || 0
      result[i] = { amount: hours, unitPrice }
    }
    return result
  }

  const rows = equipmentStatusList.map((item: any, index: number) => {
    const outsourcing = item.outsourcingCompany || {}
    const driver = item.driver || {}
    const subEquipments = item.subEquipments || []

    const mainEquipment = {
      name: '직영',
      specification: item.specification || '-',
      company: outsourcing.name || '-',
      ceo:
        driver.name && outsourcing.ceoName
          ? `${outsourcing.ceoName} (${driver.name})`
          : driver.name
          ? driver.name
          : outsourcing.ceoName
          ? `(${outsourcing.ceoName})`
          : '-',
      carNumber: item.vehicleNumber || '-',
    }

    const allEquipments = [
      {
        type: item.equipment?.type || '-',
        days: getDays(item.equipment, 31),
      },
      ...subEquipments.map((s: any) => ({
        type: s.typeDescription || '-',
        days: getDays(s, 31),
      })),
      {
        type: '유류대',
        days: getDays(item.fuel, 31), // getDays는 null이면 자동으로 0 처리됨
      },
    ]

    return { no: index + 1, mainEquipment, allEquipments }
  })

  const cellStyle = {
    border: '1px solid #9ca3af',
    whiteSpace: 'nowrap',
    padding: '4px 6px',
  }

  const headerStyle = {
    ...cellStyle,
    fontWeight: 'bold',
    backgroundColor: '#f3f4f6',
    minWidth: 100, // 숫자 칸 최소 너비
  }

  // 합계 계산
  const verticalSums: {
    amounts: number[]
    totalHours: number
    totalUnitPrice: number
    totalSubtotal: number
  } = {
    amounts: Array(dateColumns.length).fill(0),
    totalHours: 0,
    totalUnitPrice: 0,
    totalSubtotal: 0,
  }

  rows.forEach((r: any) => {
    r.allEquipments.forEach((eq: any) => {
      const days = Object.values(eq.days)
      const totalHours = days.reduce((hAcc: number, cur: any) => hAcc + (cur.amount || 0), 0)

      const unitPriceDays = days.filter((d: any) => (d.unitPrice || 0) > 0)
      const totalUnitPrice: number = unitPriceDays.reduce(
        (pAcc: number, cur: any) => pAcc + (cur.unitPrice as number),
        0,
      )
      const unitPriceDaysCount = unitPriceDays.length
      const displayUnitPrice = unitPriceDaysCount > 0 ? totalUnitPrice / unitPriceDaysCount : 0

      // 유류대 단가 계산
      // if (eq.type === '유류대') {
      //   const fuelTotal = totalHours
      //   const equipmentTotalHours = r.allEquipments.reduce((acc: number, equipment: any) => {
      //     if (equipment.type === '유류대') return acc
      //     return (
      //       acc +
      //       Object.values(equipment.days).reduce((a: number, cur: any) => a + (cur.amount || 0), 0)
      //     )
      //   }, 0)
      //   displayUnitPrice = equipmentTotalHours > 0 ? fuelTotal / equipmentTotalHours : 0
      // }

      const subtotal = totalHours * displayUnitPrice

      // vertical sums
      verticalSums.totalHours += totalHours
      verticalSums.totalUnitPrice += displayUnitPrice
      verticalSums.totalSubtotal += subtotal

      dateColumns.forEach((d, idx) => {
        verticalSums.amounts[idx] += eq.days[d]?.amount || 0
      })
    })
  })

  const grandTotal = +verticalSums.totalSubtotal // 소계

  const rowTotals = rows.map((r: any) => {
    let total = 0

    r.allEquipments.forEach((eq: any) => {
      const totalHours = Object.values(eq.days).reduce(
        (acc: number, cur: any) => acc + (cur.amount || 0),
        0,
      )

      const unitPriceDays = Object.values(eq.days).filter((d: any) => (d.unitPrice || 0) > 0)
      const totalUnitPrice = unitPriceDays.reduce(
        (acc: number, cur: any) => acc + (cur.unitPrice || 0),
        0,
      )
      const unitPriceDaysCount = unitPriceDays.length

      const averageUnitPrice = unitPriceDaysCount > 0 ? totalUnitPrice / unitPriceDaysCount : 0

      let displayUnitPrice = averageUnitPrice
      // 유류대는 따로 계산한다.

      // 유류대면 별도 로직 적용
      if (eq.type === '유류대') {
        // r.allEquipments 전체 총 시간 합계
        const totalHoursAllEquipments = r.allEquipments.reduce((acc: number, eq: any) => {
          // 유류대는 제외
          if (eq.type === '유류대') return acc

          const eqTotal = Object.values(eq.days).reduce(
            (sum: number, cur: any) => sum + (cur.amount || 0),
            0,
          )

          return acc + eqTotal
        }, 0)

        displayUnitPrice = totalHoursAllEquipments > 0 ? totalHours / totalHoursAllEquipments : 0
      }

      console.log(
        'totalHours * displayUnitPrice totalHours * displayUnitPrice ',
        totalHours * displayUnitPrice,
      )

      const subtotal = totalHours * averageUnitPrice

      total += subtotal
    })

    return total
  })

  const handleExcelDownload = () => {
    const formattedRows: any[][] = []

    // 숫자 포맷 함수: 소수점이 없으면 정수, 있으면 2자리까지
    const formatNumber = (num: number) => {
      if (!num || isNaN(num)) return 0
      return Number.isInteger(num) ? num : Number(num.toFixed(2))
    }

    rows.forEach((r: any) => {
      r.allEquipments.forEach((eq: any, idx: number) => {
        const totalHours = Object.values(eq.days).reduce(
          (acc: number, d: any) => acc + (d.amount || 0),
          0,
        )

        const unitPriceDays = Object.values(eq.days).filter((d: any) => (d.unitPrice || 0) > 0)
        const totalUnitPrice = unitPriceDays.reduce(
          (acc: number, d: any) => acc + (d.unitPrice || 0),
          0,
        )
        const averageUnitPrice =
          unitPriceDays.length > 0 ? totalUnitPrice / unitPriceDays.length : 0

        // 유류대 단가 계산 (UI 방식 그대로)
        // 유류대 단가 계산 (UI와 동일, 0으로 나누기 방지)
        let displayUnitPrice: number

        if (eq.type === '유류대') {
          // 유류대 제외 장비들의 총 시간 합계
          const otherEquipmentsTotalHours = r.allEquipments
            .filter((e: any) => e.type !== '유류대')
            .reduce(
              (sum: number, e: any) =>
                sum +
                Object.values(e?.days || {}).reduce((a: number, d: any) => a + (d?.amount || 0), 0),
              0,
            )

          displayUnitPrice =
            otherEquipmentsTotalHours > 0 ? totalHours / otherEquipmentsTotalHours : 0
        } else {
          displayUnitPrice = averageUnitPrice
        }

        const displaySubtotal = totalHours * displayUnitPrice

        const rowArr = [
          idx === 0 ? r.no : '',
          idx === 0 ? r.mainEquipment.name : '',
          idx === 0 ? r.mainEquipment.specification : '',
          idx === 0 ? r.mainEquipment.company : '',
          idx === 0 ? r.mainEquipment.ceo : '',
          idx === 0 ? r.mainEquipment.carNumber : '',
          eq.type,
          ...dateColumns.map((d) => formatNumber(eq.days[d]?.amount || 0)),
          formatNumber(totalHours),
          formatNumber(displayUnitPrice),
          formatNumber(displaySubtotal),
          idx === 0 ? formatNumber(rowTotals[r.no - 1] || 0) : '',
        ]

        formattedRows.push(rowArr)
      })
    })

    const headerRowDates = [
      'No',
      '직영',
      '규격',
      '업체명',
      '대표/기사',
      '차량번호',
      '구분',
      ...dateColumns.map((d) => `${d}`),
      '총계',
      '단가',
      '소계',
      '총합계',
    ]

    const headerRowWeather = [
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      ...dateColumns.map((d) => {
        const key = `day${d.toString().padStart(2, '0')}`
        return WeatherInfo[key] ? weatherMap[WeatherInfo[key]] || WeatherInfo[key] : '-'
      }),
      '',
      '',
      '',
      '',
    ]

    const totalRow = [
      '총합계',
      '',
      '',
      '',
      '',
      '',
      '',
      ...dateColumns.map((_, idx) => formatNumber(verticalSums.amounts[idx] || 0)),
      formatNumber(verticalSums.totalHours),
      formatNumber(verticalSums.totalUnitPrice),
      formatNumber(verticalSums.totalSubtotal),
      formatNumber(verticalSums.totalSubtotal),
    ]

    const sheetAoA = [headerRowDates, headerRowWeather, ...formattedRows, totalRow]
    const worksheet = XLSX.utils.aoa_to_sheet(sheetAoA)

    // 병합 설정 (UI rowspan과 동일하게)
    worksheet['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 1, c: 0 } }, // No
      { s: { r: 0, c: 1 }, e: { r: 1, c: 1 } }, // 직영
      { s: { r: 0, c: 2 }, e: { r: 1, c: 2 } }, // 규격
      { s: { r: 0, c: 3 }, e: { r: 1, c: 3 } }, // 업체명
      { s: { r: 0, c: 4 }, e: { r: 1, c: 4 } }, // 대표/기사
      { s: { r: 0, c: 5 }, e: { r: 1, c: 5 } }, // 차량번호
      { s: { r: 0, c: 6 }, e: { r: 1, c: 6 } }, // 구분
      { s: { r: 0, c: 7 + dateColumns.length }, e: { r: 1, c: 7 + dateColumns.length } }, // 총계
      { s: { r: 0, c: 8 + dateColumns.length }, e: { r: 1, c: 8 + dateColumns.length } }, // 단가
      { s: { r: 0, c: 9 + dateColumns.length }, e: { r: 1, c: 9 + dateColumns.length } }, // 소계
      { s: { r: 0, c: 10 + dateColumns.length }, e: { r: 1, c: 10 + dateColumns.length } }, // 총합계
    ]

    worksheet['!cols'] = Array(headerRowDates.length).fill({ wch: 12 })

    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, '장비운행집계')
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })
    saveAs(blob, '장비가동현황_집계표.xlsx')
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
          <Table sx={{ borderCollapse: 'collapse', minWidth: 2200 }}>
            <TableHead>
              <TableRow>
                <TableCell align="center" rowSpan={2} sx={headerStyle}>
                  No
                </TableCell>
                <TableCell align="center" rowSpan={2} sx={headerStyle}>
                  직영
                </TableCell>
                <TableCell align="center" rowSpan={2} sx={headerStyle}>
                  규격
                </TableCell>
                <TableCell align="center" rowSpan={2} sx={headerStyle}>
                  업체명
                </TableCell>
                <TableCell align="center" rowSpan={2} sx={headerStyle}>
                  대표/기사
                </TableCell>
                <TableCell align="center" rowSpan={2} sx={headerStyle}>
                  차량번호
                </TableCell>
                <TableCell align="center" rowSpan={2} sx={headerStyle}>
                  구분
                </TableCell>
                {dateColumns.map((d) => (
                  <TableCell key={d} align="center" sx={headerStyle}>
                    {d}
                  </TableCell>
                ))}
                <TableCell align="center" rowSpan={2} sx={headerStyle}>
                  총계
                </TableCell>
                <TableCell align="center" rowSpan={2} sx={headerStyle}>
                  단가
                </TableCell>
                <TableCell align="center" rowSpan={2} sx={headerStyle}>
                  소계
                </TableCell>
                <TableCell align="center" rowSpan={2} sx={headerStyle}>
                  총합계
                </TableCell>
              </TableRow>

              <TableRow>
                {dateColumns.map((d) => {
                  const key = `day${d.toString().padStart(2, '0')}`
                  const value = WeatherInfo[key]
                  const displayValue = value ? weatherMap[value] || value : '-'
                  return (
                    <TableCell key={d} align="center" sx={headerStyle}>
                      {displayValue}
                    </TableCell>
                  )
                })}
              </TableRow>
            </TableHead>

            <TableBody>
              {rows.map((r: any) => {
                const eqLength = r.allEquipments.length
                return r.allEquipments.map((eq: any, idx: number) => {
                  const totalHours: number = Object.values(eq.days).reduce(
                    (acc: number, cur: any) => acc + (cur.amount || 0),
                    0,
                  )

                  const unitPriceDays = Object.values(eq.days).filter(
                    (d: any) => (d.unitPrice || 0) > 0,
                  )

                  const totalUnitPrice: number = unitPriceDays.reduce(
                    (acc: number, cur: any) => acc + (cur.unitPrice as number),
                    0,
                  )

                  const unitPriceDaysCount = unitPriceDays.length
                  const averageUnitPrice =
                    unitPriceDaysCount > 0 ? totalUnitPrice / unitPriceDaysCount : 0

                  const subtotal = totalHours * averageUnitPrice

                  // 유류대 단가 처리
                  let displayUnitPrice = averageUnitPrice

                  // 유류대 단가 처리

                  if (eq.type === '유류대') {
                    // 1) 유류대 총계 = eq.days.amount 총합
                    const fuelTotal = totalHours

                    const equipmentTotalHours = r.allEquipments.reduce(
                      (acc: number, equipment: any) => {
                        if (equipment.type === '유류대') return acc // 유류대는 제외
                        const sum = Object.values(equipment.days).reduce(
                          (a: number, cur: any) => a + (cur.amount || 0),
                          0,
                        )
                        return acc + sum
                      },
                      0,
                    )

                    // 3) 유류대 단가 = 유류대 총계 / 전체 장비 합계
                    displayUnitPrice = equipmentTotalHours > 0 ? fuelTotal / equipmentTotalHours : 0
                  }

                  const displaySubtotal =
                    eq.type === '유류대'
                      ? totalHours * displayUnitPrice
                      : totalHours * averageUnitPrice

                  console.log('displaySubtotal', displaySubtotal)

                  return (
                    <TableRow key={`${r.no}-${idx}`}>
                      {idx === 0 && (
                        <>
                          <TableCell align="center" rowSpan={eqLength} sx={cellStyle}>
                            {r.no}
                          </TableCell>
                          <TableCell align="center" rowSpan={eqLength} sx={cellStyle}>
                            {r.mainEquipment.name}
                          </TableCell>
                          <TableCell align="center" rowSpan={eqLength} sx={cellStyle}>
                            {r.mainEquipment.specification}
                          </TableCell>
                          <TableCell align="center" rowSpan={eqLength} sx={cellStyle}>
                            {r.mainEquipment.company}
                          </TableCell>
                          <TableCell align="center" rowSpan={eqLength} sx={cellStyle}>
                            {r.mainEquipment.ceo}
                          </TableCell>
                          <TableCell align="center" rowSpan={eqLength} sx={cellStyle}>
                            {r.mainEquipment.carNumber}
                          </TableCell>
                        </>
                      )}

                      <TableCell align="center" sx={cellStyle}>
                        {eq.type}
                      </TableCell>

                      {dateColumns.map((d) => (
                        <TableCell key={d} align="right" sx={cellStyle}>
                          {(eq.days[d]?.amount || 0).toLocaleString()}
                        </TableCell>
                      ))}

                      {/* 총계 */}
                      <TableCell align="right" sx={cellStyle}>
                        {totalHours.toLocaleString()}
                      </TableCell>

                      {/* 단가 */}
                      <TableCell align="right" sx={cellStyle}>
                        {(totalHours === 0
                          ? 0
                          : eq.type === '유류대'
                          ? 0
                          : // displayUnitPrice
                            averageUnitPrice
                        ).toLocaleString(
                          undefined, // 로케일 기본값
                          { minimumFractionDigits: 0, maximumFractionDigits: 2 }, // 소수점 2자리, 반올림
                        )}
                      </TableCell>

                      {/* 소계 */}
                      <TableCell align="right" sx={cellStyle}>
                        {eq.type === '유류대'
                          ? 0
                          : // displaySubtotal.toLocaleString(
                            //     undefined, // 로케일 기본값
                            //     { minimumFractionDigits: 0, maximumFractionDigits: 2 }, // 소수점 2자리, 반올림
                            //   )
                            subtotal.toLocaleString(
                              undefined, // 로케일 기본값
                              { minimumFractionDigits: 0, maximumFractionDigits: 2 }, // 소수점 2자리, 반올림
                            )}
                      </TableCell>

                      {idx === 0 && (
                        <>
                          <TableCell align="right" rowSpan={eqLength} sx={cellStyle}>
                            {idx === 0
                              ? rowTotals[r.no - 1].toLocaleString(
                                  undefined, // 로케일 기본값
                                  { minimumFractionDigits: 0, maximumFractionDigits: 2 }, // 소수점 2자리, 반올림
                                )
                              : null}
                          </TableCell>
                        </>
                      )}
                      {/* 총합계 */}
                    </TableRow>
                  )
                })
              })}

              {/* 총합계 행 */}
              <TableRow>
                <TableCell
                  align="center"
                  colSpan={7}
                  sx={{ backgroundColor: '#f0f0f0', fontWeight: 'bold' }}
                >
                  합계
                </TableCell>
                {verticalSums.amounts.map((sum, idx) => (
                  <TableCell key={idx} align="right" sx={cellStyle}>
                    {sum.toLocaleString(
                      undefined, // 로케일 기본값
                      { minimumFractionDigits: 0, maximumFractionDigits: 2 }, // 소수점 2자리, 반올림
                    )}
                  </TableCell>
                ))}
                <TableCell align="right" sx={cellStyle}>
                  {verticalSums.totalHours.toLocaleString(
                    undefined, // 로케일 기본값
                    { minimumFractionDigits: 0, maximumFractionDigits: 2 }, // 소수점 2자리, 반올림
                  )}
                </TableCell>
                <TableCell align="right" sx={cellStyle}>
                  {verticalSums.totalUnitPrice.toLocaleString(
                    undefined, // 로케일 기본값
                    { minimumFractionDigits: 0, maximumFractionDigits: 2 }, // 소수점 2자리, 반올림
                  )}
                </TableCell>
                <TableCell align="right" sx={cellStyle}>
                  {verticalSums.totalSubtotal.toLocaleString(
                    undefined, // 로케일 기본값
                    { minimumFractionDigits: 0, maximumFractionDigits: 2 }, // 소수점 2자리, 반올림
                  )}
                </TableCell>
                <TableCell align="right" sx={cellStyle}>
                  {grandTotal.toLocaleString(
                    undefined, // 로케일 기본값
                    { minimumFractionDigits: 0, maximumFractionDigits: 2 }, // 소수점 2자리, 반올림
                  )}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </div>
  )
}
