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
        type: s.type || '-',
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
  }

  // 각 열 별 총합계 계산
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

      // 총 시간 계산
      const totalHours = days.reduce((hAcc: number, cur: any) => hAcc + (cur.amount || 0), 0)

      // unitPrice가 있는 날만 필터
      const unitPriceDays = days.filter((d: any) => (d.unitPrice || 0) > 0)

      // 총 단가 계산 (타입 명시)
      const totalUnitPrice: number = unitPriceDays.reduce(
        (pAcc: number, cur: any) => pAcc + (cur.unitPrice as number),
        0,
      )

      const unitPriceDaysCount = unitPriceDays.length

      const averageUnitPrice = unitPriceDaysCount > 0 ? totalUnitPrice / unitPriceDaysCount : 0

      const subtotal = totalHours * averageUnitPrice

      verticalSums.totalHours += totalHours
      verticalSums.totalUnitPrice += averageUnitPrice
      verticalSums.totalSubtotal += subtotal

      // 날짜별 합계
      dateColumns.forEach((d, idx) => {
        verticalSums.amounts[idx] += eq.days[d]?.amount || 0
      })
    })
  })

  const handleExcelDownload = () => {
    const formattedRows: any[][] = []

    // 데이터 행 생성 (각 행은 배열)
    rows.forEach((r: any) => {
      r.allEquipments.forEach((eq: any, idx: number) => {
        // 총시간
        const totalHours: number = Object.values(eq.days).reduce(
          (acc: number, cur: any) => acc + (cur.amount || 0),
          0,
        )

        // 단가 평균 계산 (unitPrice가 있는 날만)
        const unitPriceDays = Object.values(eq.days).filter((d: any) => (d.unitPrice || 0) > 0)
        const totalUnitPrice: number = unitPriceDays.reduce(
          (acc: number, cur: any) => acc + (cur.unitPrice as number),
          0,
        )
        const unitPriceDaysCount = unitPriceDays.length
        const averageUnitPrice = unitPriceDaysCount > 0 ? totalUnitPrice / unitPriceDaysCount : 0
        // const subtotal = totalHours * averageUnitPrice

        // 유류대 전용 단가 표시 로직 (기존 로직 유지)
        let displayUnitPrice = averageUnitPrice
        if (eq.type === '유류대') {
          const firstEqTotalHours = Object.values(r.allEquipments[0].days).reduce(
            (acc: number, cur: any) => acc + (cur.amount || 0),
            0,
          )
          displayUnitPrice = firstEqTotalHours > 0 ? totalHours / firstEqTotalHours : 0
        }

        const displaySubtotal =
          eq.type === '유류대' ? totalHours * displayUnitPrice : totalHours * averageUnitPrice

        // 행 배열 생성 (날짜는 숫자으로 넣음)
        const rowArr = [
          idx === 0 ? r.no : '',
          idx === 0 ? r.mainEquipment.name : '',
          idx === 0 ? r.mainEquipment.specification : '',
          idx === 0 ? r.mainEquipment.company : '',
          idx === 0 ? r.mainEquipment.ceo : '',
          idx === 0 ? r.mainEquipment.carNumber : '',
          eq.type,
          ...dateColumns.map((d) => eq.days[d]?.amount || 0), // 1~31일
          totalHours,
          // 단가와 소계는 숫자 넣되 보기 편하게 string으로 포맷해도 됨. 여기선 숫자로 넣고 셀 포맷은 엑셀에 맡김
          Number(
            (eq.type === '유류대' ? displayUnitPrice : averageUnitPrice) === 0
              ? 0
              : eq.type === '유류대'
              ? displayUnitPrice
              : averageUnitPrice,
          ),
          Number(displaySubtotal || 0),
          idx === 0 ? Number(verticalSums.totalSubtotal || 0) : '',
        ]

        formattedRows.push(rowArr)
      })
    })

    // 헤더 행 구성
    const headerRowDates = [
      'No',
      '직영',
      '규격',
      '업체명',
      '대표/기사',
      '차량번호',
      '구분',
      ...dateColumns.map((d) => `${d}`), // 날짜(1,2,3...)
      '총계',
      '단가',
      '소계',
      '총합계',
    ]

    const headerRowWeather = [
      '', // No
      '', // 직영
      '', // 규격
      '', // 업체명
      '', // 대표/기사
      '', // 차량번호
      '', // 구분
      ...dateColumns.map((d) => {
        const key = `day${d.toString().padStart(2, '0')}`
        const value = WeatherInfo[key]
        return value ? weatherMap[value] || value : '-'
      }), // 날씨(1~31일)
      '', // 총계
      '', // 단가
      '', // 소계
      '', // 총합계
    ]

    // 합계 행 생성 (날짜별 합계 및 총합계)
    const totalRow = [
      '총합계',
      '',
      '',
      '',
      '',
      '',
      '',
      ...dateColumns.map((d, idx) => verticalSums.amounts[idx] || 0),
      verticalSums.totalHours || 0,
      Number(verticalSums.totalUnitPrice || 0),
      Number(verticalSums.totalSubtotal || 0),
      Number(verticalSums.totalSubtotal || 0),
    ]

    // 시트 생성 (2단 헤더 + 데이터 + 합계)
    const sheetAoA = [headerRowDates, headerRowWeather, ...formattedRows, totalRow]
    const worksheet = XLSX.utils.aoa_to_sheet(sheetAoA)

    // 병합 설정: 상단 고정 칼럼들 (No ~ 구분)은 두 행 병합 (r:0~1)
    worksheet['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 1, c: 0 } }, // No
      { s: { r: 0, c: 1 }, e: { r: 1, c: 1 } }, // 직영
      { s: { r: 0, c: 2 }, e: { r: 1, c: 2 } }, // 규격
      { s: { r: 0, c: 3 }, e: { r: 1, c: 3 } }, // 업체명
      { s: { r: 0, c: 4 }, e: { r: 1, c: 4 } }, // 대표/기사
      { s: { r: 0, c: 5 }, e: { r: 1, c: 5 } }, // 차량번호
      { s: { r: 0, c: 6 }, e: { r: 1, c: 6 } }, // 구분
      // 총계 / 단가 / 소계 / 총합계 컬럼도 2행 병합
      { s: { r: 0, c: 7 + dateColumns.length }, e: { r: 1, c: 7 + dateColumns.length } }, // 총계
      { s: { r: 0, c: 8 + dateColumns.length }, e: { r: 1, c: 8 + dateColumns.length } }, // 단가
      { s: { r: 0, c: 9 + dateColumns.length }, e: { r: 1, c: 9 + dateColumns.length } }, // 소계
      { s: { r: 0, c: 10 + dateColumns.length }, e: { r: 1, c: 10 + dateColumns.length } }, // 총합계
    ]

    // 열 너비 자동설정 (간단)
    const colCount = headerRowDates.length
    worksheet['!cols'] = Array.from({ length: colCount }).map((_, i) => {
      const headerText = headerRowDates[i] ?? ''
      return { wch: Math.max(8, String(headerText).length + 5) }
    })

    // 워크북 생성 및 저장
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, '장비운행집계')
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })
    saveAs(blob, '장비가동현황_집계표.xlsx')
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
                  if (eq.type === '유류대') {
                    const firstEqTotalHours = Object.values(r.allEquipments[0].days).reduce(
                      (acc: number, cur: any) => acc + (cur.amount || 0),
                      0,
                    )
                    displayUnitPrice =
                      firstEqTotalHours > 0
                        ? verticalSums.amounts.reduce((acc, cur) => acc + cur, 0) /
                          firstEqTotalHours
                        : 0
                  }

                  if (eq.type === '유류대') {
                    const firstEqTotalHours = Object.values(r.allEquipments[0].days).reduce(
                      (acc: number, cur: any) => acc + (cur.amount || 0),
                      0,
                    )
                    // 유류대 단가 = 유류대 총합 / 첫 번째 타입 총계
                    displayUnitPrice = firstEqTotalHours > 0 ? totalHours / firstEqTotalHours : 0
                  }

                  const displaySubtotal =
                    eq.type === '유류대'
                      ? totalHours * displayUnitPrice
                      : totalHours * averageUnitPrice

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
                        {eq.type === '유류대'
                          ? displayUnitPrice.toLocaleString()
                          : averageUnitPrice.toLocaleString()}
                      </TableCell>

                      {/* 소계 */}
                      <TableCell align="right" sx={cellStyle}>
                        {eq.type === '유류대'
                          ? displaySubtotal.toLocaleString()
                          : subtotal.toLocaleString()}
                      </TableCell>

                      {/* 총합계 */}
                      <TableCell align="right" sx={cellStyle}>
                        {idx === 0 ? verticalSums.totalSubtotal.toLocaleString() : null}
                      </TableCell>
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
                    {sum.toLocaleString()}
                  </TableCell>
                ))}
                <TableCell align="right" sx={cellStyle}>
                  {verticalSums.totalHours.toLocaleString()}
                </TableCell>
                <TableCell align="right" sx={cellStyle}>
                  {verticalSums.totalUnitPrice.toLocaleString()}
                </TableCell>
                <TableCell align="right" sx={cellStyle}>
                  {verticalSums.totalSubtotal.toLocaleString()}
                </TableCell>
                <TableCell align="right" sx={cellStyle}>
                  {verticalSums.totalSubtotal.toLocaleString()}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </div>
  )
}
