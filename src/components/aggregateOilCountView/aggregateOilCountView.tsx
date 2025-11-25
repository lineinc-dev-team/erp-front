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

type AggregateOilCountViewAllProps = {
  fuelType: string[] // 배열 형태로 fuelType을 받는다
}

export default function AggregateOilCountViewAll({ fuelType }: AggregateOilCountViewAllProps) {
  const search = useFinalAggregationSearchStore((state) => state.search)
  const { yearMonth, siteId, siteProcessId } = search

  const fuelTypes = fuelType // props에서 받은 fuelType 배열 사용

  const fuelTypeMap: Record<string, string> = {
    DIESEL: '경유',
    GASOLINE: '휘발유',
    UREA: '요소수',
  }

  // 가격

  const { fuelPricelListQuery } = useFinalAggregationView({
    yearMonth,
    siteId,
    siteProcessId,
    tabName: 'FUEL',
  })

  const dateColumns = Array.from({ length: 31 }, (_, i) => i + 1)

  // 단가 데이터 구조
  const fuelPriceData = fuelPricelListQuery?.data?.data || {}

  // 날짜별 단가 추출 헬퍼 함수
  const getFuelPrice = (day: number, key: 'dieselPrice' | 'gasolinePrice' | 'ureaPrice') => {
    const dayKey = `day${day.toString().padStart(2, '0')}`
    const value = fuelPriceData?.[dayKey]?.[key]
    return value ? value.toLocaleString() : '0'
  }

  const dieselQuery = useFinalAggregationView({
    yearMonth,
    siteId,
    siteProcessId,
    fuelType: 'DIESEL',
    tabName: 'FUEL',
  })
  const gasolineQuery = useFinalAggregationView({
    yearMonth,
    siteId,
    siteProcessId,
    fuelType: 'GASOLINE',
    tabName: 'FUEL',
  })
  const ureaQuery = useFinalAggregationView({
    yearMonth,
    siteId,
    siteProcessId,
    fuelType: 'UREA',
    tabName: 'FUEL',
  })

  const fuelData: Record<string, any[]> = {
    DIESEL: dieselQuery.OilListQuery.data?.data?.items || [],
    GASOLINE: gasolineQuery.OilListQuery.data?.data?.items || [],
    UREA: ureaQuery.OilListQuery.data?.data?.items || [],
  }

  // 테이블에 표시할 행
  const rows: any[] = []
  fuelTypes.forEach((fuelType) => {
    fuelData[fuelType].forEach((item: any, index: number) => {
      const outsourcing = item.outsourcingCompany || {}
      const equipment = item.outsourcingCompanyEquipment || {}
      const driver = item.outsourcingCompanyDriver || {}

      const dayValues: Record<number, number> = {}
      for (let i = 1; i <= 31; i++) {
        const key = `day${i.toString().padStart(2, '0')}`
        const dayData = item[key]
        dayValues[i] = dayData && dayData.amount ? dayData.amount : 0
      }

      const total = Object.values(dayValues).reduce((acc, cur) => acc + (cur as number), 0)

      rows.push({
        fuelType,
        no: index + 1,
        equipmentName: equipment.specification || '-',
        company: outsourcing.name || '-',
        ceo: driver.name || outsourcing.ceoName || '-',
        carNumber: equipment.vehicleNumber || '-',
        days: dayValues,
        total,
      })
    })
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

  // 엑셀 다운로드
  // 엑셀 다운로드
  const handleExcelDownload = () => {
    const formattedData: any[] = []

    // 1️⃣ 유종별 데이터 및 소계
    fuelTypes.forEach((fuelType) => {
      const fuelRows = rows.filter((r) => r.fuelType === fuelType)
      fuelRows.forEach((r) => {
        formattedData.push({
          NO: r.no,
          유류종류: fuelTypeMap[r.fuelType] || r.fuelType,
          장비명: r.equipmentName,
          업체명: r.company,
          대표자: r.ceo,
          차량번호: r.carNumber,
          ...Object.fromEntries(dateColumns.map((d) => [d + '일', r.days[d] || 0])),
          합계: r.total,
        })
      })

      // ✅ 유종별 소계
      const subtotalRow: any = {
        NO: '소계',
        유류종류: fuelTypeMap[fuelType] + ' 계',
        장비명: '',
        업체명: '',
        대표자: '',
        차량번호: '',
      }
      dateColumns.forEach((d) => {
        subtotalRow[d + '일'] = fuelRows
          .reduce((acc, r) => acc + (r.days[d] || 0), 0)
          .toLocaleString()
      })
      subtotalRow['합계'] = fuelRows.reduce((acc, r) => acc + r.total, 0).toLocaleString()
      formattedData.push(subtotalRow)
    })

    // 2️⃣ 직영 계
    const directRow: any = {
      NO: '직영 계',
      유류종류: '직영 계',
      장비명: '',
      업체명: '',
      대표자: '',
      차량번호: '',
    }
    dateColumns.forEach((d) => {
      directRow[d + '일'] = rows.reduce((acc, r) => acc + (r.days[d] || 0), 0).toLocaleString()
    })
    directRow['합계'] = rows.reduce((acc, r) => acc + r.total, 0).toLocaleString()
    formattedData.push(directRow)

    // 3️⃣ 수량 / 단가(VAT포함)
    const fuelsForPrice = ['DIESEL', 'GASOLINE', 'UREA']
    fuelsForPrice.forEach((ft) => {
      const fuelRows = rows.filter((r) => r.fuelType === ft)

      // ✅ 수량
      const qtyRow: any = {
        NO: '',
        유류종류: '',
        장비명: '직영 + 외주', // 병합 대상 1
        업체명: '',
        대표자: '',
        차량번호: fuelTypeMap[ft], // 병합 대상 2
      }
      dateColumns.forEach((d) => {
        qtyRow[d + '일'] = fuelRows.reduce((acc, r) => acc + (r.days[d] || 0), 0).toLocaleString()
      })
      qtyRow['합계'] = fuelRows.reduce((acc, r) => acc + r.total, 0).toLocaleString()
      formattedData.push(qtyRow)

      const priceRow: any = {
        NO: '',
        유류종류: '',
        장비명: '직영 + 외주',
        업체명: '',
        대표자: '',
        차량번호: fuelTypeMap[ft],
      }
      dateColumns.forEach((d) => {
        const rawPrice =
          ft === 'DIESEL'
            ? getFuelPrice(d, 'dieselPrice')
            : ft === 'GASOLINE'
            ? getFuelPrice(d, 'gasolinePrice')
            : getFuelPrice(d, 'ureaPrice')
        priceRow[d + '일'] = Number(
          String(rawPrice).replaceAll(',', '').trim() || 0,
        ).toLocaleString()
      })

      priceRow['합계'] = dateColumns
        .reduce((acc, d) => {
          const rawPrice =
            ft === 'DIESEL'
              ? getFuelPrice(d, 'dieselPrice')
              : ft === 'GASOLINE'
              ? getFuelPrice(d, 'gasolinePrice')
              : getFuelPrice(d, 'ureaPrice')
          return acc + (Number(String(rawPrice).replaceAll(',', '').trim()) || 0)
        }, 0)
        .toLocaleString()

      formattedData.push(priceRow)
    })

    // 4️⃣ 총합(VAT 포함)
    const grandTotalRow: any = {
      NO: '총합계',
      유류종류: '총 합계(VAT포함)',
      장비명: '',
      업체명: '',
      대표자: '',
      차량번호: '',
    }

    // 날짜별 (수량 × 단가)
    dateColumns.forEach((d) => {
      const dieselAmount = rows
        .filter((r) => r.fuelType === 'DIESEL')
        .reduce((acc, r) => acc + (r.days[d] || 0), 0)
      const gasolineAmount = rows
        .filter((r) => r.fuelType === 'GASOLINE')
        .reduce((acc, r) => acc + (r.days[d] || 0), 0)
      const ureaAmount = rows
        .filter((r) => r.fuelType === 'UREA')
        .reduce((acc, r) => acc + (r.days[d] || 0), 0)

      const dieselPrice =
        Number(String(getFuelPrice(d, 'dieselPrice')).replaceAll(',', '').trim()) || 0
      const gasolinePrice =
        Number(String(getFuelPrice(d, 'gasolinePrice')).replaceAll(',', '').trim()) || 0
      const ureaPrice = Number(String(getFuelPrice(d, 'ureaPrice')).replaceAll(',', '').trim()) || 0

      const totalForDay =
        dieselAmount * dieselPrice + gasolineAmount * gasolinePrice + ureaAmount * ureaPrice

      grandTotalRow[d + '일'] = totalForDay.toLocaleString()
    })

    grandTotalRow['합계'] = (() => {
      const dieselVatTotal = dateColumns.reduce((acc, d) => {
        const raw = getFuelPrice(d, 'dieselPrice')
        const price = Number(String(raw).replaceAll(',', '').trim()) || 0
        return acc + price
      }, 0)
      const gasolineVatTotal = dateColumns.reduce((acc, d) => {
        const raw = getFuelPrice(d, 'gasolinePrice')
        const price = Number(String(raw).replaceAll(',', '').trim()) || 0
        return acc + price
      }, 0)
      const ureaVatTotal = dateColumns.reduce((acc, d) => {
        const raw = getFuelPrice(d, 'ureaPrice')
        const price = Number(String(raw).replaceAll(',', '').trim()) || 0
        return acc + price
      }, 0)

      return (dieselVatTotal + gasolineVatTotal + ureaVatTotal).toLocaleString()
    })()

    formattedData.push(grandTotalRow)

    // 5️⃣ 워크시트 생성
    const worksheet = XLSX.utils.json_to_sheet(formattedData)

    worksheet['!merges'] = [
      {
        s: { r: formattedData.findIndex((r) => r.장비명 === '직영 + 외주') + 1, c: 3 },
        e: { r: formattedData.findIndex((r) => r.장비명 === '직영 + 외주') + 1, c: 4 },
      },
      {
        s: { r: formattedData.findIndex((r) => r.차량번호 === '경유') + 1, c: 6 },
        e: { r: formattedData.findIndex((r) => r.차량번호 === '경유') + 1, c: 7 },
      },
      // 휘발유
      {
        s: { r: formattedData.findIndex((r) => r.차량번호 === '휘발유') + 1, c: 6 },
        e: { r: formattedData.findIndex((r) => r.차량번호 === '휘발유') + 1, c: 7 },
      },
      // 요소수
      {
        s: { r: formattedData.findIndex((r) => r.차량번호 === '요소수') + 1, c: 6 },
        e: { r: formattedData.findIndex((r) => r.차량번호 === '요소수') + 1, c: 7 },
      },
    ]

    // 6️⃣ 엑셀 저장
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, '유류집계')
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
    saveAs(new Blob([excelBuffer], { type: 'application/octet-stream' }), '유류집계_집계표.xlsx')
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
  const { hasExcelDownload } = useMenuPermission(roleId, '집계(유류집계)', enabled)

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

        {/* 전체를 하나의 TableContainer로 감싸서 가로 스크롤 한번만 */}
        <TableContainer sx={{ overflowX: 'auto' }}>
          <Table sx={{ borderCollapse: 'collapse', minWidth: 2200 }}>
            <TableHead>
              <TableRow>
                <TableCell align="center" sx={headerStyle}>
                  No
                </TableCell>
                <TableCell align="center" sx={headerStyle}>
                  유류종류
                </TableCell>
                <TableCell align="center" sx={headerStyle}>
                  장비명
                </TableCell>
                <TableCell align="center" sx={headerStyle}>
                  업체명
                </TableCell>
                <TableCell align="center" sx={headerStyle}>
                  대표/기사
                </TableCell>
                <TableCell align="center" sx={headerStyle}>
                  차량번호
                </TableCell>
                {dateColumns.map((d) => (
                  <TableCell key={d} align="center" sx={headerStyle}>
                    {d}
                  </TableCell>
                ))}
                <TableCell align="center" sx={headerStyle}>
                  합계
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {fuelTypes.map((fuelType) => {
                const fuelRows = rows.filter((r) => r.fuelType === fuelType)

                return (
                  <React.Fragment key={fuelType}>
                    {/* 유종별 데이터 */}
                    {fuelRows.map((r) => (
                      <TableRow key={`${fuelType}-${r.no}`}>
                        <TableCell align="center" sx={cellStyle}>
                          {r.no}
                        </TableCell>
                        <TableCell align="center" sx={cellStyle}>
                          {fuelTypeMap[r.fuelType] || r.fuelType}
                        </TableCell>
                        <TableCell align="center" sx={cellStyle}>
                          {r.equipmentName}
                        </TableCell>
                        <TableCell align="center" sx={cellStyle}>
                          {r.company}
                        </TableCell>
                        <TableCell align="center" sx={cellStyle}>
                          {r.ceo}
                        </TableCell>
                        <TableCell align="center" sx={cellStyle}>
                          {r.carNumber}
                        </TableCell>
                        {dateColumns.map((d) => (
                          <TableCell key={d} align="right" sx={cellStyle}>
                            {r.days[d] ? r.days[d].toLocaleString() : 0}
                          </TableCell>
                        ))}
                        <TableCell align="right" sx={cellStyle}>
                          {r.total.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow sx={{ backgroundColor: '#d8d8d8', fontWeight: 'bold' }}>
                      <TableCell align="center" colSpan={6} sx={headerStyle}>
                        {fuelTypeMap[fuelType]} 계
                      </TableCell>
                      {dateColumns.map((d) => (
                        <TableCell align="right" key={d} sx={cellStyle}>
                          {fuelRows.reduce((acc, r) => acc + (r.days[d] || 0), 0).toLocaleString()}
                        </TableCell>
                      ))}
                      <TableCell align="right" sx={cellStyle}>
                        {fuelRows.reduce((acc, r) => acc + r.total, 0).toLocaleString()}
                      </TableCell>
                    </TableRow>

                    {fuelType === 'UREA' && (
                      <>
                        {/* 직영 계 */}
                        <TableRow sx={{ backgroundColor: '#d8d8d8', fontWeight: 'bold' }}>
                          <TableCell align="center" colSpan={6} sx={headerStyle}>
                            직영 계
                          </TableCell>
                          {dateColumns.map((d) => (
                            <TableCell align="right" key={d} sx={cellStyle}>
                              {rows.reduce((acc, r) => acc + (r.days[d] || 0), 0).toLocaleString()}
                            </TableCell>
                          ))}
                          <TableCell align="right" sx={cellStyle}>
                            {rows.reduce((acc, r) => acc + r.total, 0).toLocaleString()}
                          </TableCell>
                        </TableRow>

                        <>
                          <TableRow sx={{ fontWeight: 'normal' }}>
                            <TableCell align="center" rowSpan={2} colSpan={2} sx={cellStyle}>
                              직영 + 외주
                            </TableCell>
                            <TableCell align="center" rowSpan={2} colSpan={2} sx={cellStyle}>
                              경유
                            </TableCell>
                            <TableCell align="center" colSpan={2} sx={cellStyle}>
                              수량
                            </TableCell>
                            {dateColumns.map((d) => (
                              <TableCell align="right" key={d} sx={cellStyle}>
                                {rows
                                  .filter((r) => r.fuelType === 'DIESEL') // 전체 rows에서 DIESEL 필터링
                                  .reduce((acc, r) => acc + (r.days[d] || 0), 0)
                                  .toLocaleString()}
                              </TableCell>
                            ))}

                            <TableCell align="right" sx={cellStyle}>
                              {rows
                                .filter((r) => r.fuelType === 'DIESEL')
                                .reduce((acc, r) => acc + r.total, 0)
                                .toLocaleString()}
                            </TableCell>
                          </TableRow>
                          <TableRow sx={{ fontWeight: 'normal' }}>
                            <TableCell align="center" colSpan={2} sx={cellStyle}>
                              단가(VAT포함)
                            </TableCell>
                            {dateColumns.map((d) => (
                              <TableCell align="right" key={d} sx={cellStyle}>
                                {getFuelPrice(d, 'dieselPrice')?.toLocaleString?.() ?? '-'}
                              </TableCell>
                            ))}
                            <TableCell align="right" sx={cellStyle}>
                              {(() => {
                                const total = dateColumns.reduce((acc, d) => {
                                  const raw = getFuelPrice(d, 'dieselPrice')
                                  const price = Number(String(raw).replaceAll(',', '').trim()) || 0
                                  return acc + price
                                }, 0)
                                return total.toLocaleString()
                              })()}
                            </TableCell>
                          </TableRow>
                          {/* 휘발유 */}
                          <TableRow sx={{ fontWeight: 'normal' }}>
                            <TableCell align="center" rowSpan={2} colSpan={2} sx={cellStyle}>
                              직영 + 외주
                            </TableCell>
                            <TableCell align="center" rowSpan={2} colSpan={2} sx={cellStyle}>
                              휘발유
                            </TableCell>
                            <TableCell align="center" colSpan={2} sx={cellStyle}>
                              수량
                            </TableCell>
                            {dateColumns.map((d) => (
                              <TableCell align="right" key={d} sx={cellStyle}>
                                {rows
                                  .filter((r) => r.fuelType === 'GASOLINE') // 전체 rows에서 DIESEL 필터링
                                  .reduce((acc, r) => acc + (r.days[d] || 0), 0)
                                  .toLocaleString()}
                              </TableCell>
                            ))}

                            <TableCell align="right" sx={cellStyle}>
                              {rows
                                .filter((r) => r.fuelType === 'GASOLINE')
                                .reduce((acc, r) => acc + r.total, 0)
                                .toLocaleString()}
                            </TableCell>
                          </TableRow>
                          <TableRow sx={{ fontWeight: 'normal' }}>
                            <TableCell align="center" colSpan={2} sx={cellStyle}>
                              단가(VAT포함)
                            </TableCell>
                            {dateColumns.map((d) => (
                              <TableCell align="right" key={d} sx={cellStyle}>
                                {getFuelPrice(d, 'gasolinePrice')?.toLocaleString?.() ?? '-'}
                              </TableCell>
                            ))}
                            <TableCell align="right" sx={cellStyle}>
                              {(() => {
                                const total = dateColumns.reduce((acc, d) => {
                                  const raw = getFuelPrice(d, 'gasolinePrice')
                                  const price = Number(String(raw).replaceAll(',', '').trim()) || 0
                                  return acc + price
                                }, 0)
                                return total.toLocaleString()
                              })()}
                            </TableCell>
                          </TableRow>
                          {/* 요소수  */}
                          <TableRow sx={{ fontWeight: 'normal' }}>
                            <TableCell align="center" rowSpan={2} colSpan={2} sx={cellStyle}>
                              직영 + 외주
                            </TableCell>
                            <TableCell align="center" rowSpan={2} colSpan={2} sx={cellStyle}>
                              요소수
                            </TableCell>
                            <TableCell align="center" colSpan={2} sx={cellStyle}>
                              수량
                            </TableCell>
                            {dateColumns.map((d) => (
                              <TableCell align="right" key={d} sx={cellStyle}>
                                {fuelRows
                                  .filter((r) => r.fuelType === 'UREA') // 원하는 fuelType으로 필터링
                                  .reduce((acc, r) => acc + (r.days[d] || 0), 0)
                                  .toLocaleString()}
                              </TableCell>
                            ))}

                            <TableCell align="right" sx={cellStyle}>
                              {fuelRows
                                .filter((r) => r.fuelType === 'UREA') // 전체 합산도 필터링
                                .reduce((acc, r) => acc + r.total, 0)
                                .toLocaleString()}
                            </TableCell>
                          </TableRow>
                          <TableRow sx={{ fontWeight: 'normal' }}>
                            <TableCell align="center" colSpan={2} sx={cellStyle}>
                              단가(VAT포함)
                            </TableCell>
                            {dateColumns.map((d) => (
                              <TableCell align="right" key={d} sx={cellStyle}>
                                {getFuelPrice(d, 'ureaPrice')?.toLocaleString?.() ?? '-'}
                              </TableCell>
                            ))}
                            <TableCell align="right" sx={cellStyle}>
                              {(() => {
                                const total = dateColumns.reduce((acc, d) => {
                                  const raw = getFuelPrice(d, 'ureaPrice')
                                  const price = Number(String(raw).replaceAll(',', '').trim()) || 0
                                  return acc + price
                                }, 0)
                                return total.toLocaleString()
                              })()}
                            </TableCell>
                          </TableRow>
                        </>
                        <TableRow sx={{ backgroundColor: '#bfd1ed', fontWeight: 'bold' }}>
                          <TableCell align="center" colSpan={6} sx={headerStyle}>
                            총 합계(VAT포함)
                          </TableCell>
                          {dateColumns.map((d) => {
                            // 각 날짜별 단가 숫자 추출
                            const dieselPrice =
                              Number(
                                String(getFuelPrice(d, 'dieselPrice')).replaceAll(',', '').trim(),
                              ) || 0
                            const gasolinePrice =
                              Number(
                                String(getFuelPrice(d, 'gasolinePrice')).replaceAll(',', '').trim(),
                              ) || 0
                            const ureaPrice =
                              Number(
                                String(getFuelPrice(d, 'ureaPrice')).replaceAll(',', '').trim(),
                              ) || 0

                            // 각 날짜별 수량 합산
                            const dieselAmount = rows
                              .filter((r) => r.fuelType === 'DIESEL')
                              .reduce((acc, r) => acc + (r.days[d] || 0), 0)

                            const gasolineAmount = rows
                              .filter((r) => r.fuelType === 'GASOLINE')
                              .reduce((acc, r) => acc + (r.days[d] || 0), 0)

                            const ureaAmount = rows
                              .filter((r) => r.fuelType === 'UREA')
                              .reduce((acc, r) => acc + (r.days[d] || 0), 0)

                            // (수량 × 단가) 계산
                            const totalForDay =
                              dieselAmount * dieselPrice +
                              gasolineAmount * gasolinePrice +
                              ureaAmount * ureaPrice

                            return (
                              <TableCell align="right" key={d} sx={cellStyle}>
                                {totalForDay.toLocaleString()}
                              </TableCell>
                            )
                          })}
                          <TableCell align="right" sx={cellStyle}>
                            {(() => {
                              const dieselTotal = dateColumns.reduce((acc, d) => {
                                const raw = getFuelPrice(d, 'dieselPrice')
                                const price = Number(String(raw).replaceAll(',', '').trim()) || 0
                                return acc + price
                              }, 0)

                              const gasolineTotal = dateColumns.reduce((acc, d) => {
                                const raw = getFuelPrice(d, 'gasolinePrice')
                                const price = Number(String(raw).replaceAll(',', '').trim()) || 0
                                return acc + price
                              }, 0)

                              const ureaTotal = dateColumns.reduce((acc, d) => {
                                const raw = getFuelPrice(d, 'ureaPrice')
                                const price = Number(String(raw).replaceAll(',', '').trim()) || 0
                                return acc + price
                              }, 0)

                              const grandTotal = dieselTotal + gasolineTotal + ureaTotal

                              return grandTotal.toLocaleString()
                            })()}
                          </TableCell>
                        </TableRow>
                      </>
                    )}
                  </React.Fragment>
                )
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </div>
  )
}
