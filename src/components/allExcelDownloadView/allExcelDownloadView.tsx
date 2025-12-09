/* eslint-disable @typescript-eslint/no-explicit-any */

'use client'
import * as XLSX from 'xlsx-js-style'
import useFinalAggregationView from '@/hooks/useFinalAggregation'
import { useFinalAggregationSearchStore } from '@/stores/finalAggregationStore'

export default function AllExcelDownloadView({ onComplete }: { onComplete: () => void }) {
  const search = useFinalAggregationSearchStore((state) => state.search)
  const { MaterialListQuery } = useFinalAggregationView({
    yearMonth: search.yearMonth,
    siteId: search.siteId,
    siteProcessId: search.siteProcessId,
    tabName: 'MATERIAL',
  })

  const SiteManamentList = MaterialListQuery.data ?? []

  const allLists = [
    ...(SiteManamentList?.data?.fuelAggregations || []),
    ...(SiteManamentList?.data?.materialManagements || []),
    ...(SiteManamentList?.data?.steelManagements || []),
  ]

  const rows = allLists.map((item: any, index: number) => {
    const outsourcing = item.outsourcingCompany || {}
    const prev = item.previousBilling || {}
    const curr = item.currentBilling || {}

    const totalSupply = (prev.supplyPrice || 0) + (curr.supplyPrice || 0)
    const totalTax = (prev.vat || 0) + (curr.vat || 0)
    const totalDeduction = (prev.deductionAmount || 0) + (curr.deductionAmount || 0)
    const totalTotal = (prev.total || 0) + (curr.total || 0)

    const isSteel = SiteManamentList?.data?.steelManagements?.includes(item)

    return {
      no: index + 1,
      businessNumber: outsourcing.businessNumber || '-',
      item:
        item.inputType === '직접입력'
          ? item.inputTypeDescription
          : item.inputType || item.itemName || '-',
      company: isSteel ? '라인공영㈜' : outsourcing.name || '-',
      ceo: isSteel ? '윤병국' : outsourcing.ceoName || '-',
      contact: isSteel ? '031-223-1984' : outsourcing.landlineNumber || '-',
      bank: outsourcing.bankName || '-',
      accountNumber: outsourcing.accountNumber || '-',
      accountName: outsourcing.accountHolder || '-',
      prevSupply: prev.supplyPrice || 0,
      prevTax: prev.vat || 0,
      prevDeduction: prev.deductionAmount || 0,
      prevTotal: prev.total || 0,
      currSupply: curr.supplyPrice || 0,
      currTax: curr.vat || 0,
      currDeduction: curr.deductionAmount || 0,
      currTotal: curr.total || 0,
      totalSupply,
      totalTax,
      totalDeduction,
      totalTotal,
    }
  })

  const wb = XLSX.utils.book_new()

  const headerRow1 = [
    'NO.',
    '사업자등록번호',
    '품명',
    '업체명',
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

  const sheetData: any[] = [headerRow1, headerRow2]

  rows.forEach((r) => {
    sheetData.push([
      r.no,
      r.businessNumber,
      r.item,
      r.company,
      r.ceo,
      r.contact,
      r.bank,
      r.accountNumber,
      r.accountName,
      r.prevSupply.toLocaleString(),
      r.prevTax.toLocaleString(),
      r.prevDeduction.toLocaleString(),
      r.prevTotal.toLocaleString(),
      r.currSupply.toLocaleString(),
      r.currTax.toLocaleString(),
      r.currDeduction.toLocaleString(),
      r.currTotal.toLocaleString(),
      r.totalSupply.toLocaleString(),
      r.totalTax.toLocaleString(),
      r.totalDeduction.toLocaleString(),
      r.totalTotal.toLocaleString(),
    ])
  })

  const sum = (key: string) => rows.reduce((acc, r) => acc + (r as any)[key], 0)

  sheetData.push([
    '소계',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    sum('prevSupply').toLocaleString(),
    sum('prevTax').toLocaleString(),
    sum('prevDeduction').toLocaleString(),
    sum('prevTotal').toLocaleString(),
    sum('currSupply').toLocaleString(),
    sum('currTax').toLocaleString(),
    sum('currDeduction').toLocaleString(),
    sum('currTotal').toLocaleString(),
    sum('totalSupply').toLocaleString(),
    sum('totalTax').toLocaleString(),
    sum('totalDeduction').toLocaleString(),
    sum('totalTotal').toLocaleString(),
  ])

  const ws = XLSX.utils.aoa_to_sheet(sheetData)

  const lastRow = sheetData.length - 1

  ws['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 1, c: 0 } },
    { s: { r: 0, c: 1 }, e: { r: 1, c: 1 } },
    { s: { r: 0, c: 2 }, e: { r: 1, c: 2 } },
    { s: { r: 0, c: 3 }, e: { r: 1, c: 3 } },
    { s: { r: 0, c: 4 }, e: { r: 1, c: 4 } },
    { s: { r: 0, c: 5 }, e: { r: 1, c: 5 } },

    // 기성청구계좌 (6~8)
    { s: { r: 0, c: 6 }, e: { r: 0, c: 8 } },

    // 전회 (9~12)
    { s: { r: 0, c: 9 }, e: { r: 0, c: 12 } },

    // 금회 (13~16)
    { s: { r: 0, c: 13 }, e: { r: 0, c: 16 } },

    // 누계 (17~20)
    { s: { r: 0, c: 17 }, e: { r: 0, c: 20 } },

    // 소계 label 병합
    { s: { r: lastRow, c: 0 }, e: { r: lastRow, c: 8 } },
  ]

  // 스타일 적용
  const range = XLSX.utils.decode_range(ws['!ref']!)
  for (let R = range.s.r; R <= range.e.r; R++) {
    for (let C = range.s.c; C <= range.e.c; C++) {
      const cellRef = XLSX.utils.encode_cell({ r: R, c: C })
      if (!ws[cellRef]) ws[cellRef] = { v: '' }

      const isHeader = R < 2
      const isAmount = !isHeader && C >= 9
      const isSubtotal = R === lastRow

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
          horizontal: isHeader || isSubtotal ? 'center' : isAmount ? 'right' : 'center',
        },
      }
    }
  }

  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1')
  XLSX.writeFile(wb, '재료비.xlsx')
  onComplete() // 다운로드 후 상태 초기화

  return null
}
