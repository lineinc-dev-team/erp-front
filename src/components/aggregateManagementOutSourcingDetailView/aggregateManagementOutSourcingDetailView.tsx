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
import useFinalAggregationView from '@/hooks/useFinalAggregation'
import { useFinalAggregationSearchStore } from '@/stores/finalAggregationStore'
import { myInfoProps } from '@/types/user'
import { useMenuPermission } from '../common/MenuPermissionView'

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
        acc.outsourcingUnitPrice += r.outsourcingUnitPrice || 0
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
      outsourcingUnitPrice: 0,
      outsourcingPrice: 0,

      prevQuantity: 0,
      prevAmount: 0,

      currQuantity: 0,
      currAmount: 0,

      totalQuantity: 0,
      totalAmount: 0,
    },
  )

  const handleExcelDownload = () => {
    const wb = XLSX.utils.book_new()

    const headerRow1 = [
      'NO.',
      '항목명',
      '항목',
      '규격',
      '단위',
      '도급단가',
      '도급금액',
      '',
      '외주계약금액',
      '',
      '',
      '전회 청구내역',
      '',
      '금회 청구내역',
      '',
      '누계 청구내역',
      '',
    ]
    const headerRow2 = [
      '',
      '',
      '',
      '',
      '',
      '',
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
    ]

    const sheetData: any[] = []
    sheetData.push(headerRow1)
    sheetData.push(headerRow2)

    // 그룹별 데이터
    groupedRows.forEach((group: any, groupIndex: any) => {
      group.rows.forEach((r: any, rowIdx: any) => {
        sheetData.push(
          [
            rowIdx === 0 ? groupIndex + 1 : '',
            rowIdx === 0 ? group.groupName : '',
            r.item,
            r.specification,
            r.unit,
            r.unitPrice,
            r.contractQuantity,
            r.contractPrice,
            r.outsourcingQuantity,
            r.outsourcingUnitPrice,
            r.outsourcingPrice,
            r.prevQuantity,
            r.prevAmount,
            r.currQuantity,
            r.currAmount,
            r.totalQuantity,
            r.totalAmount,
          ].map((v: any) => (typeof v === 'number' ? v.toLocaleString() : v)),
        )
      })
    })

    // 외주공사비 합계
    sheetData.push([
      '외주공사비',
      '',
      '',
      '',
      '',
      '',
      totals.contractQuantity.toLocaleString(),
      totals.contractPrice.toLocaleString(),

      totals.outsourcingQuantity.toLocaleString(),
      totals.outsourcingUnitPrice.toLocaleString(),
      totals.outsourcingPrice.toLocaleString(),

      totals.prevQuantity.toLocaleString(),
      totals.prevAmount.toLocaleString(),
      totals.currQuantity.toLocaleString(),
      totals.currAmount.toLocaleString(),
      totals.totalQuantity.toLocaleString(),
      totals.totalAmount.toLocaleString(),
    ])

    // deductionRows
    deductionRows.forEach((row) => {
      const prev = getPreviousAmount(row.key)
      const curr = getCurrentAmount(row.key)
      const total = getTotalAmount(row.key)
      sheetData.push([
        '',
        '',
        '공제금액',
        row.label,
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        prev.toLocaleString(),
        '',
        curr.toLocaleString(),
        '',
        total.toLocaleString(),
      ])
    })

    // 공제합계
    sheetData.push([
      '공제합계',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      deductionPrevSum.toLocaleString(),
      '',
      deductionCurrSum.toLocaleString(),
      '',
      deductionTotalSum.toLocaleString(),
    ])

    // 총계(공급가, 부가세, 세금계산서발행본)
    sheetData.push([
      '총계(소계1 - 소계2 (공제금액))',
      '',
      '',
      '',
      '',
      '공급가',
      '',
      '',
      '',
      '',
      '',
      '',
      totalPrevSupply.toLocaleString(),
      '',
      totalCurrSupply.toLocaleString(),

      '',
      totalFinalSupply.toLocaleString(),
    ])
    sheetData.push([
      '',
      '',
      '',
      '',
      '',
      '부가세',
      '',
      '',
      '',
      '',
      '',
      '',
      Math.round(totalPrevTax).toLocaleString(),

      '',
      Math.round(totalCurrTax).toLocaleString(),

      '',
      Math.round(totalTax).toLocaleString(),
    ])
    sheetData.push([
      '',
      '',
      '',
      '',
      '',
      '세금계산서발행본',
      '',
      '',
      '',
      '',
      '',
      '',
      totalPrevInvoice.toLocaleString(),

      '',
      totalCurrInvoice.toLocaleString(),

      '',
      totalInvoice.toLocaleString(),
    ])

    const ws = XLSX.utils.aoa_to_sheet(sheetData)

    // 병합
    ws['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 1, c: 0 } },
      { s: { r: 0, c: 1 }, e: { r: 1, c: 1 } },
      { s: { r: 0, c: 2 }, e: { r: 1, c: 2 } },
      { s: { r: 0, c: 3 }, e: { r: 1, c: 3 } },
      { s: { r: 0, c: 4 }, e: { r: 1, c: 4 } },
      { s: { r: 0, c: 5 }, e: { r: 1, c: 5 } },
      { s: { r: 0, c: 6 }, e: { r: 0, c: 7 } },
      { s: { r: 0, c: 8 }, e: { r: 0, c: 10 } },
      { s: { r: 0, c: 11 }, e: { r: 0, c: 12 } },
      { s: { r: 0, c: 13 }, e: { r: 0, c: 14 } },
      { s: { r: 0, c: 15 }, e: { r: 0, c: 16 } },
    ]
    const outsourcingRowIndex = sheetData.findIndex((row) => row[0] === '외주공사비')
    if (outsourcingRowIndex >= 0) {
      ws['!merges'].push({
        s: { r: outsourcingRowIndex, c: 0 },
        e: { r: outsourcingRowIndex, c: 5 },
      })
    }

    const deductionRowIndex = sheetData.findIndex((row) => row[0] === '공제합계')
    if (deductionRowIndex >= 0) {
      ws['!merges'].push({
        s: { r: deductionRowIndex, c: 0 },
        e: { r: deductionRowIndex, c: 5 }, // NO. ~ 도급단가까지 병합
      })
    }

    // 총계 병합
    const totalRowIndex = sheetData.findIndex((row) => row[0]?.startsWith('총계(소계1'))
    if (totalRowIndex >= 0) {
      ws['!merges'].push({
        s: { r: totalRowIndex, c: 0 }, // 시작 셀
        e: { r: totalRowIndex + 2, c: 4 }, // 아래 3칸, 오른쪽 5칸까지
      })
    }

    // 스타일 적용
    const range = XLSX.utils.decode_range(ws['!ref']!)
    for (let R = range.s.r; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cellRef = XLSX.utils.encode_cell({ r: R, c: C })
        if (!ws[cellRef]) ws[cellRef] = { v: '' }

        const isHeader = R < 2
        const isAmount = !isHeader && C >= 6
        const isSubtotalLabel = R >= sheetData.length - 3 && C === 0

        ws[cellRef].s = {
          border: {
            top: { style: 'thin', color: { rgb: '000000' } },
            bottom: { style: 'thin', color: { rgb: '000000' } },
            left: { style: 'thin', color: { rgb: '000000' } },
            right: { style: 'thin', color: { rgb: '000000' } },
          },
          fill: isHeader ? { patternType: 'solid', fgColor: { rgb: 'C0C0C0' } } : undefined,
          alignment: {
            vertical: 'center',
            horizontal: isHeader || isSubtotalLabel ? 'center' : isAmount ? 'right' : 'center',
          },
        }
      }
    }

    const fileName = `${search.yearMonth}_${search.outsourcingCompanyContractName}_외주계약.xlsx`

    XLSX.utils.book_append_sheet(wb, ws, '외주계약')
    XLSX.writeFile(wb, fileName)
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
                      {r.contractQuantity.toLocaleString()}
                    </TableCell>
                    <TableCell align="right" sx={cellStyle}>
                      {r.contractPrice.toLocaleString()}
                    </TableCell>

                    <TableCell align="right" sx={cellStyle}>
                      {r.outsourcingQuantity.toLocaleString()}
                    </TableCell>
                    <TableCell align="right" sx={cellStyle}>
                      {r.outsourcingUnitPrice.toLocaleString()}
                    </TableCell>
                    <TableCell align="right" sx={cellStyle}>
                      {r.outsourcingPrice.toLocaleString()}
                    </TableCell>

                    <TableCell align="right" sx={cellStyle}>
                      {r.prevQuantity.toLocaleString()}
                    </TableCell>
                    <TableCell align="right" sx={cellStyle}>
                      {r.prevAmount.toLocaleString()}
                    </TableCell>

                    <TableCell align="right" sx={cellStyle}>
                      {r.currQuantity.toLocaleString()}
                    </TableCell>
                    <TableCell align="right" sx={cellStyle}>
                      {r.currAmount.toLocaleString()}
                    </TableCell>

                    <TableCell align="right" sx={cellStyle}>
                      {r.totalQuantity.toLocaleString()}
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
                {totals.outsourcingQuantity.toLocaleString()}
              </TableCell>
              <TableCell align="right" sx={{ ...cellStyle, fontWeight: 'bold' }}>
                {totals.outsourcingUnitPrice.toLocaleString()}
              </TableCell>
              <TableCell align="right" sx={{ ...cellStyle, fontWeight: 'bold' }}>
                {totals.outsourcingPrice.toLocaleString()}
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
