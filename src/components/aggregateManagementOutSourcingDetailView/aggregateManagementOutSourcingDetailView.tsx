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

export default function AggregateManagementOutSourcingView() {
  const search = useFinalAggregationSearchStore((state) => state.search)

  const { ConstructionDetailListQuery } = useFinalAggregationView({
    yearMonth: search.yearMonth,
    siteId: search.siteId,
    siteProcessId: search.siteProcessId,
    tabName: 'OUTSOURCING',
    outsourcingCompanyContractId: search.outsourcingCompanyContractId,
  })

  const rawGroups = ConstructionDetailListQuery.data?.data?.constructionGroups || []

  const { DeductionAmountDetailListQuery } = useFinalAggregationView({
    yearMonth: search.yearMonth,
    siteId: search.siteId,
    siteProcessId: search.siteProcessId,
    tabName: 'OUTSOURCING',
    outsourcingCompanyContractId: search.outsourcingCompanyContractId,
  })

  const amountGroups = DeductionAmountDetailListQuery.data?.data || []

  const deductionRows = [
    { label: '식대(공급가)', key: 'mealFee' },
    { label: '간식대(공급가)', key: 'snackFee' },
    { label: '유류대(공급가)', key: 'fuelFee' },
    { label: '재료비(공급가)', key: 'materialCost' },
  ]

  // 🔥 이전(totalAmount)
  const getPreviousAmount = (key: string) => {
    return amountGroups?.[key]?.previousBilling?.totalAmount ?? 0
  }

  // 🔥 금회(totalAmount)
  const getCurrentAmount = (key: string) => {
    return amountGroups?.[key]?.currentBilling?.totalAmount ?? 0
  }

  const getTotalAmount = (key: string) => {
    const prev = amountGroups?.[key]?.previousBilling?.totalAmount ?? 0
    const curr = amountGroups?.[key]?.currentBilling?.totalAmount ?? 0
    return prev + curr
  }

  // deductionRows 가 이미 선언되어 있다고 가정
  const deductionKeys = deductionRows.map((d: any) => d.key)

  // 전회 합계
  const deductionPrevSum = deductionKeys.reduce((acc: number, k: string) => {
    const v = amountGroups?.[k]?.previousBilling?.totalAmount ?? 0
    return acc + (v || 0)
  }, 0)

  // 금회 합계
  const deductionCurrSum = deductionKeys.reduce((acc: number, k: string) => {
    const v = amountGroups?.[k]?.currentBilling?.totalAmount ?? 0
    return acc + (v || 0)
  }, 0)

  // 누계 합계 (전회 + 금회) — 키별로 더해도 되고 위에서 더한 값 합쳐도 됨
  const deductionTotalSum = deductionPrevSum + deductionCurrSum

  const groupedRows = rawGroups.map((group: any) => {
    const groupName = group.outsourcingCompanyContractConstructionGroup?.itemName || '-'
    const items = group.items || []

    const formattedItems = items.map((it: any) => {
      const prev = it.previousBilling || {}
      const curr = it.currentBilling || {}

      return {
        id: it.id,
        item: it.item,
        specification: it.specification,
        unit: it.unit,
        unitPrice: it.unitPrice,
        contractQuantity: it.contractQuantity,
        contractPrice: it.contractPrice,

        outsourcingQuantity: it.outsourcingContractQuantity,
        outsourcingUnitPrice: it.outsourcingContractUnitPrice,
        outsourcingPrice: it.outsourcingContractPrice,

        prevQuantity: prev.totalQuantity || 0,
        prevAmount: prev.totalAmount || 0,
        currQuantity: curr.totalQuantity || 0,
        currAmount: curr.totalAmount || 0,

        totalQuantity: (prev.totalQuantity || 0) + (curr.totalQuantity || 0),
        totalAmount: (prev.totalAmount || 0) + (curr.totalAmount || 0),
      }
    })

    return {
      groupName,
      rowSpan: formattedItems.length,
      rows: formattedItems,
    }
  })

  const totals = groupedRows.reduce(
    (acc: any, group: any) => {
      group.rows.forEach((r: any) => {
        acc.contractQuantity += r.contractQuantity || 0
        acc.contractPrice += r.contractPrice || 0

        acc.outsourcingQuantity += r.outsourcingQuantity || 0
        acc.outsourcingPrice += r.outsourcingPrice || 0

        acc.prevQuantity += r.prevQuantity || 0
        acc.prevAmount += r.prevAmount || 0

        acc.currQuantity += r.currQuantity || 0
        acc.currAmount += r.currAmount || 0

        acc.totalQuantity += r.totalQuantity || 0
        acc.totalAmount += r.totalAmount || 0
      })
      return acc
    },
    {
      contractQuantity: 0,
      contractPrice: 0,

      outsourcingQuantity: 0,
      outsourcingPrice: 0,

      prevQuantity: 0,
      prevAmount: 0,

      currQuantity: 0,
      currAmount: 0,

      totalQuantity: 0,
      totalAmount: 0,
    },
  )

  /** ===============================
   ** 2) 엑셀 다운로드
   ** =============================== */
  const handleExcelDownload = () => {
    const flatData: any[] = []

    // 1. 그룹별 항목
    groupedRows.forEach((g: any) => {
      g.rows.forEach((r: any) => {
        flatData.push({
          항목명: g.groupName,
          항목: r.item,
          규격: r.specification,
          단위: r.unit,
          도급단가: r.unitPrice,
          도급수량: r.contractQuantity,
          도급금액: r.contractPrice,
          외주_수량: r.outsourcingQuantity,
          외주_단가: r.outsourcingUnitPrice,
          외주_금액: r.outsourcingPrice,
          전회_수량: r.prevQuantity,
          전회_금액: r.prevAmount,
          금회_수량: r.currQuantity,
          금회_금액: r.currAmount,
          누계_수량: r.totalQuantity,
          누계_금액: r.totalAmount,
        })
      })
    })

    // 2. 외주공사비 합계
    flatData.push({
      항목명: '외주공사비',
      항목: '',
      규격: '',
      단위: '',
      도급단가: '',
      계약수량: totals.contractQuantity,
      계약금액: totals.contractPrice,
      외주_수량: '',
      외주_단가: '',
      외주_금액: '',
      전회_수량: totals.prevQuantity,
      전회_금액: totals.prevAmount,
      금회_수량: totals.currQuantity,
      금회_금액: totals.currAmount,
      누계_수량: totals.totalQuantity,
      누계_금액: totals.totalAmount,
    })

    // 3. 공제합계
    deductionRows.forEach((row) => {
      const previousAmount = getPreviousAmount(row.key) ?? 0
      const currentAmount = getCurrentAmount(row.key) ?? 0
      const totalAmount = getTotalAmount(row.key)

      flatData.push({
        항목명: '공제합계',
        항목: '공제금액',
        규격: row.label,
        단위: '',
        도급단가: '',
        계약수량: '',
        계약금액: '',
        외주_수량: '',
        외주_단가: '',
        외주_금액: '',
        전회_수량: '',
        전회_금액: previousAmount,
        금회_수량: '',
        금회_금액: currentAmount,
        누계_수량: '',
        누계_금액: totalAmount,
      })
    })

    // 4. 총계(공급가, 부가세, 세금계산서발행본)
    flatData.push(
      {
        항목명: '총계(공급가)',
        항목: '',
        규격: '',
        단위: '',
        도급단가: '',
        계약수량: '',
        계약금액: '',
        외주_수량: '',
        외주_단가: '',
        외주_금액: '',
        전회_수량: totalPrevSupply,
        전회_금액: '',
        금회_수량: totalCurrSupply,
        금회_금액: '',
        누계_수량: '',
        누계_금액: totalFinalSupply,
      },
      {
        항목명: '총계(부가세)',
        항목: '',
        규격: '',
        단위: '',
        도급단가: '',
        계약수량: '',
        계약금액: '',
        외주_수량: '',
        외주_단가: '',
        외주_금액: '',
        전회_수량: totalPrevTax,
        전회_금액: '',
        금회_수량: totalCurrTax,
        금회_금액: '',
        누계_수량: '',
        누계_금액: totalTax,
      },
      {
        항목명: '총계(세금계산서발행본)',
        항목: '',
        규격: '',
        단위: '',
        도급단가: '',
        계약수량: '',
        계약금액: '',
        외주_수량: '',
        외주_단가: '',
        외주_금액: '',
        전회_수량: totalPrevInvoice,
        전회_금액: '',
        금회_수량: totalCurrInvoice,
        금회_금액: '',
        누계_수량: '',
        누계_금액: totalInvoice,
      },
    )

    const worksheet = XLSX.utils.json_to_sheet(flatData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1')

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' })
    saveAs(blob, '외주공사_집계.xlsx')
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

  // ================= 최종 총계 (공급가, 부가세, 세금계산서발행본) =================
  const totalPrevSupply = totals.prevAmount - deductionPrevSum
  const totalCurrSupply = totals.currAmount - deductionCurrSum
  const totalFinalSupply = totals.totalAmount - deductionTotalSum

  const totalPrevTax = totalPrevSupply * 0.1
  const totalCurrTax = totalCurrSupply * 0.1
  const totalTax = totalFinalSupply * 0.1

  const totalPrevInvoice = totalPrevSupply + totalPrevTax
  const totalCurrInvoice = totalCurrSupply + totalCurrTax
  const totalInvoice = totalFinalSupply + totalTax

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
                  NO
                </TableCell>
                <TableCell align="center" rowSpan={2} sx={headerStyle}>
                  항목명
                </TableCell>
                <TableCell align="center" rowSpan={2} sx={headerStyle}>
                  항목
                </TableCell>
                <TableCell align="center" rowSpan={2} sx={headerStyle}>
                  규격
                </TableCell>
                <TableCell align="center" rowSpan={2} sx={headerStyle}>
                  단위
                </TableCell>
                <TableCell align="center" rowSpan={2} sx={headerStyle}>
                  도급단가
                </TableCell>

                <TableCell align="center" colSpan={2} sx={headerStyle}>
                  도급금액
                </TableCell>

                <TableCell align="center" colSpan={3} sx={headerStyle}>
                  외주계약금액
                </TableCell>

                <TableCell align="center" colSpan={2} sx={headerStyle}>
                  전회 청구내역
                </TableCell>

                <TableCell align="center" colSpan={2} sx={headerStyle}>
                  금회 청구내역
                </TableCell>

                <TableCell align="center" colSpan={2} sx={headerStyle}>
                  누계 청구내역
                </TableCell>
              </TableRow>

              <TableRow>
                {[
                  '수량',
                  '금액',
                  '수량',
                  '단가',
                  '금액',
                  '수량',
                  '금액',
                  '수량',
                  '금액',
                  '수량',
                  '금액',
                ].map((text, idx) => (
                  <TableCell align="center" key={idx} sx={headerStyle}>
                    {text}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {groupedRows.map((group: any, groupIndex: number) =>
                group.rows.map((r: any, rowIdx: number) => (
                  <TableRow key={r.id}>
                    {rowIdx === 0 && (
                      <>
                        <TableCell
                          align="center"
                          rowSpan={group.rowSpan}
                          sx={{ ...cellStyle, fontWeight: 'bold' }}
                        >
                          {groupIndex + 1}
                        </TableCell>
                        <TableCell
                          align="center"
                          rowSpan={group.rowSpan}
                          sx={{ ...cellStyle, fontWeight: 'bold' }}
                        >
                          {group.groupName}
                        </TableCell>
                      </>
                    )}

                    <TableCell align="center" sx={cellStyle}>
                      {r.item}
                    </TableCell>
                    <TableCell align="center" sx={cellStyle}>
                      {r.specification}
                    </TableCell>
                    <TableCell align="center" sx={cellStyle}>
                      {r.unit}
                    </TableCell>
                    <TableCell align="right" sx={cellStyle}>
                      {r.unitPrice.toLocaleString()}
                    </TableCell>

                    <TableCell align="right" sx={cellStyle}>
                      {r.contractQuantity}
                    </TableCell>
                    <TableCell align="right" sx={cellStyle}>
                      {r.contractPrice.toLocaleString()}
                    </TableCell>

                    <TableCell align="right" sx={cellStyle}>
                      {r.outsourcingQuantity}
                    </TableCell>
                    <TableCell align="right" sx={cellStyle}>
                      {r.outsourcingUnitPrice.toLocaleString()}
                    </TableCell>
                    <TableCell align="right" sx={cellStyle}>
                      {r.outsourcingPrice.toLocaleString()}
                    </TableCell>

                    <TableCell align="right" sx={cellStyle}>
                      {r.prevQuantity}
                    </TableCell>
                    <TableCell align="right" sx={cellStyle}>
                      {r.prevAmount.toLocaleString()}
                    </TableCell>

                    <TableCell align="right" sx={cellStyle}>
                      {r.currQuantity}
                    </TableCell>
                    <TableCell align="right" sx={cellStyle}>
                      {r.currAmount.toLocaleString()}
                    </TableCell>

                    <TableCell align="right" sx={cellStyle}>
                      {r.totalQuantity}
                    </TableCell>
                    <TableCell align="right" sx={cellStyle}>
                      {r.totalAmount.toLocaleString()}
                    </TableCell>
                  </TableRow>
                )),
              )}
            </TableBody>

            <TableRow sx={{ backgroundColor: '#e0e0e0' }}>
              <TableCell align="center" colSpan={6} sx={{ ...cellStyle, fontWeight: 'bold' }}>
                외주공사비
              </TableCell>

              {/* 도급금액 */}
              <TableCell align="right" sx={{ ...cellStyle, fontWeight: 'bold' }}>
                {totals.contractQuantity.toLocaleString()}
              </TableCell>
              <TableCell align="right" sx={{ ...cellStyle, fontWeight: 'bold' }}>
                {totals.contractPrice.toLocaleString()}
              </TableCell>

              <TableCell align="right" sx={{ ...cellStyle, fontWeight: 'bold' }}>
                {/* {totals.outsourcingQuantity.toLocaleString()} */}
              </TableCell>
              <TableCell align="center" sx={cellStyle}></TableCell>
              <TableCell align="right" sx={{ ...cellStyle, fontWeight: 'bold' }}>
                {/* {totals.outsourcingPrice.toLocaleString()} */}
              </TableCell>

              {/* 전회 청구내역 */}
              <TableCell align="right" sx={{ ...cellStyle, fontWeight: 'bold' }}>
                {totals.prevQuantity.toLocaleString()}
              </TableCell>
              <TableCell align="right" sx={{ ...cellStyle, fontWeight: 'bold' }}>
                {totals.prevAmount.toLocaleString()}
              </TableCell>

              {/* 금회 청구내역 */}
              <TableCell align="right" sx={{ ...cellStyle, fontWeight: 'bold' }}>
                {totals.currQuantity.toLocaleString()}
              </TableCell>
              <TableCell align="right" sx={{ ...cellStyle, fontWeight: 'bold' }}>
                {totals.currAmount.toLocaleString()}
              </TableCell>

              {/* 누계 청구내역 */}
              <TableCell align="right" sx={{ ...cellStyle, fontWeight: 'bold' }}>
                {totals.totalQuantity.toLocaleString()}
              </TableCell>
              <TableCell align="right" sx={{ ...cellStyle, fontWeight: 'bold' }}>
                {totals.totalAmount.toLocaleString()}
              </TableCell>
            </TableRow>

            {deductionRows.map((row) => {
              const previousAmount = getPreviousAmount(row.key) ?? 0
              const currentAmount = getCurrentAmount(row.key) ?? 0
              const totalAmount = getTotalAmount(row.key)

              return (
                <TableRow key={row.key} sx={{ backgroundColor: '#ffffff' }}>
                  <TableCell align="center" sx={{ ...cellStyle, fontWeight: 'bold' }}></TableCell>

                  <TableCell align="right" sx={{ ...cellStyle, fontWeight: 'bold' }}></TableCell>

                  <TableCell align="right" sx={{ ...cellStyle, fontWeight: 'bold' }}>
                    공제금액
                  </TableCell>

                  <TableCell align="right" sx={{ ...cellStyle, fontWeight: 'bold' }}>
                    {row.label}
                  </TableCell>

                  <TableCell align="right" sx={{ ...cellStyle, fontWeight: 'bold' }}></TableCell>
                  <TableCell align="right" sx={{ ...cellStyle, fontWeight: 'bold' }}></TableCell>
                  <TableCell align="right" sx={{ ...cellStyle, fontWeight: 'bold' }}></TableCell>
                  <TableCell align="right" sx={{ ...cellStyle, fontWeight: 'bold' }}></TableCell>
                  <TableCell align="right" sx={{ ...cellStyle, fontWeight: 'bold' }}></TableCell>
                  <TableCell align="right" sx={{ ...cellStyle, fontWeight: 'bold' }}></TableCell>
                  <TableCell align="right" sx={{ ...cellStyle, fontWeight: 'bold' }}></TableCell>
                  <TableCell align="right" sx={{ ...cellStyle, fontWeight: 'bold' }}></TableCell>

                  <TableCell align="right" sx={{ ...cellStyle, fontWeight: 'bold' }}>
                    {previousAmount.toLocaleString()}
                  </TableCell>

                  <TableCell align="right" sx={{ ...cellStyle, fontWeight: 'bold' }}></TableCell>

                  <TableCell align="right" sx={{ ...cellStyle, fontWeight: 'bold' }}>
                    {currentAmount.toLocaleString()}
                  </TableCell>

                  <TableCell align="right" sx={{ ...cellStyle, fontWeight: 'bold' }}></TableCell>

                  <TableCell align="right" sx={{ ...cellStyle, fontWeight: 'bold' }}>
                    {totalAmount.toLocaleString()}
                  </TableCell>
                </TableRow>
              )
            })}

            <TableRow sx={{ backgroundColor: '#e0e0e0' }}>
              <TableCell align="center" colSpan={6} sx={{ ...cellStyle, fontWeight: 'bold' }}>
                공제합계
              </TableCell>

              {/* 도급금액 */}
              <TableCell align="right" sx={{ ...cellStyle, fontWeight: 'bold' }}></TableCell>
              <TableCell align="right" sx={{ ...cellStyle, fontWeight: 'bold' }}></TableCell>

              {/* 외주계약금액 (단가 등) 자리 — 계속 '-' */}
              <TableCell align="right" sx={{ ...cellStyle, fontWeight: 'bold' }}></TableCell>
              <TableCell align="center" sx={cellStyle}></TableCell>
              <TableCell align="right" sx={{ ...cellStyle, fontWeight: 'bold' }}></TableCell>

              <TableCell align="right" sx={{ ...cellStyle, fontWeight: 'bold' }}></TableCell>
              <TableCell align="right" sx={{ ...cellStyle, fontWeight: 'bold' }}>
                {deductionPrevSum.toLocaleString()}
              </TableCell>

              <TableCell align="right" sx={{ ...cellStyle, fontWeight: 'bold' }}></TableCell>
              <TableCell align="right" sx={{ ...cellStyle, fontWeight: 'bold' }}>
                {deductionCurrSum.toLocaleString()}
              </TableCell>

              {/* 누계 청구내역 (공제 합계의 누계) */}

              <TableCell align="right" sx={{ ...cellStyle, fontWeight: 'bold' }}></TableCell>
              <TableCell align="right" sx={{ ...cellStyle, fontWeight: 'bold' }}>
                {deductionTotalSum.toLocaleString()}
              </TableCell>
            </TableRow>

            {/* 총계(공제금액 적용) */}
            <TableRow sx={{ backgroundColor: '#e0e0e0' }}>
              <TableCell
                align="center"
                colSpan={4}
                rowSpan={4}
                sx={{ ...cellStyle, fontWeight: 'bold' }}
              >
                총계(소계1 - 소계2 (공제금액))
              </TableCell>
            </TableRow>

            {/* 공급가 */}
            <TableRow sx={{ backgroundColor: '#e0e0e0' }}>
              <TableCell
                align="right"
                colSpan={2}
                sx={{ ...cellStyle, fontWeight: 'bold', backgroundColor: '#e0e0e0' }}
              >
                공급가
              </TableCell>
              <TableCell
                align="right"
                sx={{ ...cellStyle, fontWeight: 'bold', backgroundColor: '#e0e0e0' }}
              ></TableCell>
              <TableCell
                align="right"
                sx={{ ...cellStyle, fontWeight: 'bold', backgroundColor: '#e0e0e0' }}
              ></TableCell>

              {/* 외주계약금액 등은 그대로 '-' */}
              <TableCell
                align="right"
                sx={{ ...cellStyle, fontWeight: 'bold', backgroundColor: '#e0e0e0' }}
              ></TableCell>
              <TableCell
                align="center"
                sx={{ ...cellStyle, backgroundColor: '#e0e0e0' }}
              ></TableCell>
              <TableCell
                align="right"
                sx={{ ...cellStyle, fontWeight: 'bold', backgroundColor: '#e0e0e0' }}
              ></TableCell>
              <TableCell
                align="right"
                sx={{ ...cellStyle, fontWeight: 'bold', backgroundColor: '#e0e0e0' }}
              ></TableCell>
              <TableCell
                align="right"
                sx={{ ...cellStyle, fontWeight: 'bold', backgroundColor: '#e0e0e0' }}
              >
                {totalPrevSupply.toLocaleString()}
              </TableCell>
              <TableCell
                align="right"
                sx={{ ...cellStyle, fontWeight: 'bold', backgroundColor: '#e0e0e0' }}
              ></TableCell>
              <TableCell
                align="right"
                sx={{ ...cellStyle, fontWeight: 'bold', backgroundColor: '#e0e0e0' }}
              >
                {totalCurrSupply.toLocaleString()}
              </TableCell>
              <TableCell
                align="right"
                sx={{ ...cellStyle, fontWeight: 'bold', backgroundColor: '#e0e0e0' }}
              ></TableCell>
              <TableCell
                align="right"
                sx={{ ...cellStyle, fontWeight: 'bold', backgroundColor: '#e0e0e0' }}
              >
                {totalFinalSupply.toLocaleString()}
              </TableCell>
            </TableRow>

            {/* 부가세 */}
            <TableRow sx={{ backgroundColor: '#e0e0e0' }}>
              <TableCell
                align="right"
                colSpan={2}
                sx={{ ...cellStyle, fontWeight: 'bold', backgroundColor: '#e0e0e0' }}
              >
                부가세
              </TableCell>
              <TableCell
                align="right"
                sx={{ ...cellStyle, fontWeight: 'bold', backgroundColor: '#e0e0e0' }}
              ></TableCell>
              <TableCell
                align="right"
                sx={{ ...cellStyle, fontWeight: 'bold', backgroundColor: '#e0e0e0' }}
              ></TableCell>

              {/* 외주계약금액 등은 그대로 '-' */}
              <TableCell
                align="right"
                sx={{ ...cellStyle, fontWeight: 'bold', backgroundColor: '#e0e0e0' }}
              ></TableCell>
              <TableCell
                align="center"
                sx={{ ...cellStyle, backgroundColor: '#e0e0e0' }}
              ></TableCell>
              <TableCell
                align="right"
                sx={{ ...cellStyle, fontWeight: 'bold', backgroundColor: '#e0e0e0' }}
              ></TableCell>
              <TableCell
                align="right"
                sx={{ ...cellStyle, fontWeight: 'bold', backgroundColor: '#e0e0e0' }}
              ></TableCell>
              <TableCell
                align="right"
                sx={{ ...cellStyle, fontWeight: 'bold', backgroundColor: '#e0e0e0' }}
              >
                {Math.round(totalPrevTax).toLocaleString()}
              </TableCell>
              <TableCell
                align="right"
                sx={{ ...cellStyle, fontWeight: 'bold', backgroundColor: '#e0e0e0' }}
              ></TableCell>
              <TableCell
                align="right"
                sx={{ ...cellStyle, fontWeight: 'bold', backgroundColor: '#e0e0e0' }}
              >
                {Math.round(totalCurrTax).toLocaleString()}
              </TableCell>
              <TableCell
                align="right"
                sx={{ ...cellStyle, fontWeight: 'bold', backgroundColor: '#e0e0e0' }}
              ></TableCell>
              <TableCell
                align="right"
                sx={{ ...cellStyle, fontWeight: 'bold', backgroundColor: '#e0e0e0' }}
              >
                {Math.round(totalTax).toLocaleString()}
              </TableCell>
            </TableRow>

            {/* 세금계산서발행본 */}
            <TableRow sx={{ backgroundColor: '#e0e0e0' }}>
              <TableCell
                align="right"
                colSpan={2}
                sx={{ ...cellStyle, fontWeight: 'bold', backgroundColor: '#e0e0e0' }}
              >
                세금계산서발행본
              </TableCell>
              <TableCell
                align="right"
                sx={{ ...cellStyle, fontWeight: 'bold', backgroundColor: '#e0e0e0' }}
              ></TableCell>
              <TableCell
                align="right"
                sx={{ ...cellStyle, fontWeight: 'bold', backgroundColor: '#e0e0e0' }}
              ></TableCell>

              {/* 외주계약금액 등은 그대로 '-' */}
              <TableCell
                align="right"
                sx={{ ...cellStyle, fontWeight: 'bold', backgroundColor: '#e0e0e0' }}
              ></TableCell>
              <TableCell
                align="center"
                sx={{ ...cellStyle, backgroundColor: '#e0e0e0' }}
              ></TableCell>
              <TableCell
                align="right"
                sx={{ ...cellStyle, fontWeight: 'bold', backgroundColor: '#e0e0e0' }}
              ></TableCell>
              <TableCell
                align="right"
                sx={{ ...cellStyle, fontWeight: 'bold', backgroundColor: '#e0e0e0' }}
              ></TableCell>
              <TableCell
                align="right"
                sx={{ ...cellStyle, fontWeight: 'bold', backgroundColor: '#e0e0e0' }}
              >
                {totalPrevInvoice.toLocaleString()}
              </TableCell>
              <TableCell
                align="right"
                sx={{ ...cellStyle, fontWeight: 'bold', backgroundColor: '#e0e0e0' }}
              ></TableCell>
              <TableCell
                align="right"
                sx={{ ...cellStyle, fontWeight: 'bold', backgroundColor: '#e0e0e0' }}
              >
                {totalCurrInvoice.toLocaleString()}
              </TableCell>
              <TableCell
                align="right"
                sx={{ ...cellStyle, fontWeight: 'bold', backgroundColor: '#e0e0e0' }}
              ></TableCell>
              <TableCell
                align="right"
                sx={{ ...cellStyle, fontWeight: 'bold', backgroundColor: '#e0e0e0' }}
              >
                {totalInvoice.toLocaleString()}
              </TableCell>
            </TableRow>
          </Table>
        </TableContainer>
      </Paper>
    </div>
  )
}
