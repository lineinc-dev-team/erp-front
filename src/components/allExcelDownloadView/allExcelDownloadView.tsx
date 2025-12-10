/* eslint-disable @typescript-eslint/no-explicit-any */

'use client'
import * as XLSX from 'xlsx-js-style'
import useFinalAggregationView from '@/hooks/useFinalAggregation'
import { useFinalAggregationSearchStore } from '@/stores/finalAggregationStore'
import { useEffect, useState } from 'react'
import {
  GetConstructionDetailServiceByAggregate,
  GetdeductionAmountServiceByAggregate,
  GetMealFeeDetailServiceByAggregate,
} from '@/services/finalAggregation/finalAggregationService'

export default function AllExcelDownloadView({
  onComplete,
  fuelType,
}: {
  onComplete: () => void
  fuelType: any
}) {
  const search = useFinalAggregationSearchStore((state) => state.search)

  const [, setReady] = useState(false)
  const [fuelDataReady, setFuelDataReady] = useState(false)
  const [laborDataReady, setLaborDataReady] = useState(false)

  // 유류집계
  const fuelTypes = fuelType // props에서 받은 fuelType 배열 사용

  const fuelTypeMap: Record<string, string> = {
    DIESEL: '경유',
    GASOLINE: '휘발유',
    UREA: '요소수',
  }

  const { fuelPricelListQuery } = useFinalAggregationView({
    yearMonth: search.yearMonth,
    siteId: search.siteId,
    siteProcessId: search.siteProcessId,
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
    yearMonth: search.yearMonth,
    siteId: search.siteId,
    siteProcessId: search.siteProcessId,
    fuelType: 'DIESEL',
  })
  const gasolineQuery = useFinalAggregationView({
    yearMonth: search.yearMonth,
    siteId: search.siteId,
    siteProcessId: search.siteProcessId,
    fuelType: 'GASOLINE',
  })
  const ureaQuery = useFinalAggregationView({
    yearMonth: search.yearMonth,
    siteId: search.siteId,
    siteProcessId: search.siteProcessId,
    fuelType: 'UREA',
  })

  useEffect(() => {
    const dieselLoaded = !!dieselQuery.OilListQuery.data
    const gasolineLoaded = !!gasolineQuery.OilListQuery.data
    const ureaLoaded = !!ureaQuery.OilListQuery.data

    if (dieselLoaded && gasolineLoaded && ureaLoaded) {
      setFuelDataReady(true)
    }
  }, [dieselQuery.OilListQuery.data, gasolineQuery.OilListQuery.data, ureaQuery.OilListQuery.data])

  const fuelData: Record<string, any[]> = {
    DIESEL: dieselQuery.OilListQuery.data?.data?.items || [],
    GASOLINE: gasolineQuery.OilListQuery.data?.data?.items || [],
    UREA: ureaQuery.OilListQuery.data?.data?.items || [],
  }

  // 테이블에 표시할 행
  const Fuelrows: any[] = []
  fuelTypes.forEach((fuelType: any) => {
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

      // const total = Object.values(dayValues).reduce((acc, cur) => acc + (cur as number), 0)

      const total = Object.entries(dayValues).reduce((acc, [day, amount]) => {
        const dayNum = Number(day)
        const price =
          fuelType === 'DIESEL'
            ? Number(String(getFuelPrice(dayNum, 'dieselPrice')).replaceAll(',', '').trim()) || 0
            : fuelType === 'GASOLINE'
            ? Number(String(getFuelPrice(dayNum, 'gasolinePrice')).replaceAll(',', '').trim()) || 0
            : Number(String(getFuelPrice(dayNum, 'ureaPrice')).replaceAll(',', '').trim()) || 0

        return acc + amount * price
      }, 0)

      Fuelrows.push({
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

  // 엑셀 다운로드
  const formattedData: any[] = []

  // 1️⃣ 데이터 + 소계
  fuelTypes.forEach((fuelType: any) => {
    const fuelRows = Fuelrows.filter((r: any) => r.fuelType === fuelType)
    fuelRows.forEach((r: any) => {
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

    const subtotalRow: any = {
      NO: fuelTypeMap[fuelType] + ' 계',
      유류종류: '',
      장비명: '',
      업체명: '',
      대표자: '',
      차량번호: '',
    }
    dateColumns.forEach((d) => {
      subtotalRow[d + '일'] = fuelRows
        .reduce((acc, r: any) => acc + (r.days[d] || 0), 0)
        .toLocaleString()
    })
    subtotalRow['합계'] = fuelRows.reduce((acc, r: any) => acc + r.total, 0).toLocaleString()
    formattedData.push(subtotalRow)
  })

  const directRow: any = {
    NO: '직영 계',
    유류종류: '',
    장비명: '',
    업체명: '',
    대표자: '',
    차량번호: '',
  }
  dateColumns.forEach((d: any) => {
    directRow[d + '일'] = Fuelrows.reduce(
      (acc, r: any) => acc + (r.days[d] || 0),
      0,
    ).toLocaleString()
  })
  directRow['합계'] = Fuelrows.reduce((acc, r: any) => acc + r.total, 0).toLocaleString()
  formattedData.push(directRow)

  // 2️⃣ 수량 / 단가(VAT 포함)
  const fuelsForPrice = ['DIESEL', 'GASOLINE', 'UREA']
  fuelsForPrice.forEach((ft: any) => {
    const fuelRows = Fuelrows.filter((r: any) => r.fuelType === ft)

    // 수량 행
    const qtyRow: any = {
      NO: '직영 + 외주',
      유류종류: '',
      장비명: fuelTypeMap[ft],
      업체명: '',
      대표자: '수량',
      차량번호: '',
    }
    dateColumns.forEach((d) => {
      qtyRow[d + '일'] = fuelRows
        .reduce((acc, r: any) => acc + (r.days[d] || 0), 0)
        .toLocaleString()
    })
    qtyRow['합계'] = fuelRows
      .reduce((acc, r: any) => {
        const rowTotal = Object.values(r.days).reduce((sum: any, cur) => sum + (cur || 0), 0)
        return acc + rowTotal
      }, 0)
      .toLocaleString()
    formattedData.push(qtyRow)

    // 단가(VAT 포함) 행
    const priceRow: any = {
      NO: '',
      유류종류: '',
      장비명: '',
      업체명: '',
      대표자: '단가(VAT포함)',
      차량번호: '',
    }

    // 날짜별 셀에는 단가(원/단위)를 표시
    dateColumns.forEach((d) => {
      const rawPrice =
        ft === 'DIESEL'
          ? getFuelPrice(d, 'dieselPrice')
          : ft === 'GASOLINE'
          ? getFuelPrice(d, 'gasolinePrice')
          : getFuelPrice(d, 'ureaPrice')

      priceRow[d + '일'] = Number(String(rawPrice).replaceAll(',', '').trim() || 0).toLocaleString()
    })

    // ✅ 합계는 "해당 연료의 각 날짜별 (수량 * 단가)"의 합
    priceRow['합계'] = dateColumns
      .reduce((acc, d) => {
        // 해당 날짜의 단가
        const rawPrice =
          ft === 'DIESEL'
            ? getFuelPrice(d, 'dieselPrice')
            : ft === 'GASOLINE'
            ? getFuelPrice(d, 'gasolinePrice')
            : getFuelPrice(d, 'ureaPrice')

        const price = Number(String(rawPrice).replaceAll(',', '').trim()) || 0

        // 해당 날짜의 전체 수량 (해당 연료만)
        const qtyForDay = fuelRows.reduce((a, r: any) => a + (r.days[d] || 0), 0)

        return acc + qtyForDay * price
      }, 0)
      .toLocaleString()

    formattedData.push(priceRow)
  })

  // 3️⃣ 총합(VAT 포함)
  const grandTotalRow: any = {
    NO: '총 합계(VAT포함)',
    유류종류: '',
    장비명: '',
    업체명: '',
    대표자: '',
    차량번호: '',
  }

  let totalAmount = 0 // 날짜별 금액 합계 저장

  dateColumns.forEach((d) => {
    const dieselAmount = Fuelrows.filter((r: any) => r.fuelType === 'DIESEL').reduce(
      (acc, r: any) => acc + (r.days[d] || 0),
      0,
    )
    const gasolineAmount = Fuelrows.filter((r: any) => r.fuelType === 'GASOLINE').reduce(
      (acc, r: any) => acc + (r.days[d] || 0),
      0,
    )
    const ureaAmount = Fuelrows.filter((r: any) => r.fuelType === 'UREA').reduce(
      (acc, r: any) => acc + (r.days[d] || 0),
      0,
    )

    const dieselPrice =
      Number(String(getFuelPrice(d, 'dieselPrice')).replaceAll(',', '').trim()) || 0
    const gasolinePrice =
      Number(String(getFuelPrice(d, 'gasolinePrice')).replaceAll(',', '').trim()) || 0
    const ureaPrice = Number(String(getFuelPrice(d, 'ureaPrice')).replaceAll(',', '').trim()) || 0

    const dailyTotal =
      dieselAmount * dieselPrice + gasolineAmount * gasolinePrice + ureaAmount * ureaPrice
    grandTotalRow[d + '일'] = dailyTotal.toLocaleString()
    totalAmount += dailyTotal
  })

  // 마지막 합계 컬럼에 날짜별 금액 합계 넣기
  grandTotalRow['합계'] = totalAmount.toLocaleString()

  formattedData.push(grandTotalRow)

  const fuelSheet = XLSX.utils.json_to_sheet(formattedData)

  // → 여기에 병합 코드 추가
  fuelSheet['!merges'] = fuelSheet['!merges'] || []

  const grandTotalRowIndex = formattedData.findIndex((r) => r.NO === '총 합계(VAT포함)') + 1
  if (grandTotalRowIndex > -1) {
    fuelSheet['!merges'].push({
      s: { r: grandTotalRowIndex, c: 0 },
      e: { r: grandTotalRowIndex, c: 5 },
    })
  }

  const fuelTypesForMerge = ['DIESEL', 'GASOLINE', 'UREA']

  fuelTypesForMerge.forEach((ft) => {
    const equipmentName = ft === 'DIESEL' ? '경유' : ft === 'GASOLINE' ? '휘발유' : '요소수'
    const dieselTotalRowIndex = formattedData.findIndex((r) => r.장비명 === equipmentName) + 1
    if (dieselTotalRowIndex > -1) {
      fuelSheet['!merges'] = fuelSheet['!merges'] || []
      fuelSheet['!merges'].push({
        s: { r: dieselTotalRowIndex, c: 2 },
        e: { r: dieselTotalRowIndex + 1, c: 3 },
      })
    }
  })

  // 병합할 행 정보 배열
  const mergeRows = [
    { key: '수량', startCol: 4 },
    { key: '단가(VAT포함)', startCol: 4 },
  ]

  mergeRows.forEach(({ key, startCol }) => {
    const rowIndex = formattedData.findIndex((r) => r.대표자 === key) + 1
    if (rowIndex > -1) {
      fuelSheet['!merges'] = fuelSheet['!merges'] || []
      fuelSheet['!merges'].push({
        s: { r: rowIndex, c: startCol },
        e: { r: rowIndex, c: startCol + 1 },
      })
    }
  })

  mergeRows.forEach(({ key, startCol }) => {
    const rowIndex = formattedData.findIndex((r) => r.대표자 === key) + 3
    if (rowIndex > -1) {
      fuelSheet['!merges'] = fuelSheet['!merges'] || []
      fuelSheet['!merges'].push({
        s: { r: rowIndex, c: startCol },
        e: { r: rowIndex, c: startCol + 1 },
      })
    }
  })

  mergeRows.forEach(({ key, startCol }) => {
    const rowIndex = formattedData.findIndex((r) => r.대표자 === key) + 5
    if (rowIndex > -1) {
      fuelSheet['!merges'] = fuelSheet['!merges'] || []
      fuelSheet['!merges'].push({
        s: { r: rowIndex, c: startCol },
        e: { r: rowIndex, c: startCol + 1 },
      })
    }
  })

  const directNameIndex = formattedData.findIndex((r) => r.NO === '직영 + 외주') + 1
  if (directNameIndex > -1) {
    fuelSheet['!merges'].push({
      s: { r: directNameIndex, c: 0 }, // 시작: NO 컬럼
      e: { r: directNameIndex + 1, c: 1 }, // 끝: 마지막 컬럼
    })
  }

  const directNameSecondIndex = formattedData.findIndex((r) => r.NO === '직영 + 외주') + 3
  if (directNameSecondIndex > -1) {
    fuelSheet['!merges'].push({
      s: { r: directNameSecondIndex, c: 0 }, // 시작: NO 컬럼
      e: { r: directNameSecondIndex + 1, c: 1 }, // 끝: 마지막 컬럼
    })
  }

  const directNameThirdIndex = formattedData.findIndex((r) => r.NO === '직영 + 외주') + 5
  if (directNameThirdIndex > -1) {
    fuelSheet['!merges'].push({
      s: { r: directNameThirdIndex, c: 0 }, // 시작: NO 컬럼
      e: { r: directNameThirdIndex + 1, c: 1 }, // 끝: 마지막 컬럼
    })
  }

  // 경유

  const directRowIndex = formattedData.findIndex((r) => r.NO === '직영 계') + 1
  if (directRowIndex > -1) {
    fuelSheet['!merges'].push({
      s: { r: directRowIndex, c: 0 }, // 시작: NO 컬럼
      e: { r: directRowIndex, c: 5 }, // 끝: 마지막 컬럼
    })
  }

  fuelTypes.forEach((ft: any) => {
    const rowIndex = formattedData.findIndex((r) => r.NO === fuelTypeMap[ft] + ' 계') + 1
    if (rowIndex > -1) {
      fuelSheet['!merges'] = fuelSheet['!merges'] || []
      fuelSheet['!merges'].push({
        s: { r: rowIndex, c: 0 },
        e: { r: rowIndex, c: 5 },
      })
    }
  })

  // 5️⃣ 셀 스타일 적용
  const range = XLSX.utils.decode_range(fuelSheet['!ref']!)
  for (let R = range.s.r; R <= range.e.r; ++R) {
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cellRef = XLSX.utils.encode_cell({ r: R, c: C })
      if (!fuelSheet[cellRef]) fuelSheet[cellRef] = { v: '' }

      const isHeader = R < 1
      const isAmount = C >= 6 // 날짜 컬럼 시작 index
      const isSubtotalLabel = R === formattedData.length - 1 && C === 0
      fuelSheet[cellRef].s = {
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
        numFmt: isAmount ? '#,##0' : undefined, // 숫자에 쉼표 적용
      }
    }
  }

  // 재료비
  const { MaterialListQuery } = useFinalAggregationView({
    yearMonth: search.yearMonth,
    siteId: search.siteId,
    siteProcessId: search.siteProcessId,
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

  const materialSheet = XLSX.utils.aoa_to_sheet(sheetData)

  const lastRow = sheetData.length - 1

  materialSheet['!merges'] = [
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
  const rangeMaterial = XLSX.utils.decode_range(materialSheet['!ref']!)
  for (let R = rangeMaterial.s.r; R <= rangeMaterial.e.r; R++) {
    for (let C = rangeMaterial.s.c; C <= rangeMaterial.e.c; C++) {
      const cellRef = XLSX.utils.encode_cell({ r: R, c: C })
      if (!materialSheet[cellRef]) materialSheet[cellRef] = { v: '' }

      const isHeader = R < 2
      const isAmount = !isHeader && C >= 9
      const isSubtotal = R === sheetData.length - 1 && C === 0

      materialSheet[cellRef].s = {
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

  // 노무비 엑셀다운로드

  const { LaborCostListQuery } = useFinalAggregationView({
    yearMonth: search.yearMonth,
    siteId: search.siteId,
    siteProcessId: search.siteProcessId,
    laborType: 'DIRECT_CONTRACT',
    tabName: 'LABOR',
  })

  const { OutSourcingLaborCostListQuery } = useFinalAggregationView({
    yearMonth: search.yearMonth,
    siteId: search.siteId,
    siteProcessId: search.siteProcessId,
    tabName: 'LABOR',
  })

  useEffect(() => {
    const laborInfoLoaded = !!LaborCostListQuery.data
    if (laborInfoLoaded) {
      setLaborDataReady(true)
    }
  }, [LaborCostListQuery.data])

  const rowsDirect = (LaborCostListQuery.data?.data?.items || []).map(
    (item: any, index: number) => {
      const outsourcing = item.outsourcingCompany || {}
      const labor = item?.labor
      const prev = item.previousBilling || {}
      const curr = item.currentBilling || {}

      return {
        no: index + 1,
        category: outsourcing.type || '-',
        businessNumber: outsourcing.businessNumber || '-',
        company: outsourcing.name || '-',
        item: labor?.workType || '-',
        ceo: outsourcing.ceoName || labor?.name || '-',
        contact: outsourcing.landlineNumber || labor?.phoneNumber || '-',
        bank: outsourcing.bankName || labor?.bankName || '-',
        accountNumber: outsourcing.accountNumber || labor?.accountNumber || '-',
        accountName: outsourcing.accountHolder || labor?.accountHolder || '-',
        prevSupply: prev.supplyPrice || 0,
        prevTax: prev.vat || 0,
        prevDeduction: prev.deductionAmount || 0,
        prevTotal: prev.total || 0,
        currSupply: curr.supplyPrice || 0,
        currTax: curr.vat || 0,
        currDeduction: curr.deductionAmount || 0,
        currTotal: curr.total || 0,
        totalSupply: (prev.supplyPrice || 0) + (curr.supplyPrice || 0),
        totalTax: (prev.vat || 0) + (curr.vat || 0),
        totalDeduction: (prev.deductionAmount || 0) + (curr.deductionAmount || 0),
        totalTotal: (prev.total || 0) + (curr.total || 0),
      }
    },
  )

  const rowsOutsourcing = (OutSourcingLaborCostListQuery.data?.data?.items || []).map(
    (item: any, index: number) => {
      const outsourcing = item.outsourcingCompany || {}
      const labor = item?.labor
      const prev = item.previousBilling || {}
      const curr = item.currentBilling || {}

      return {
        no: index + 1,
        category: outsourcing.type || '-',
        businessNumber: outsourcing.businessNumber || '-',
        company: outsourcing.name || '-',
        item: labor?.workType || '-',
        ceo: outsourcing.ceoName || labor?.name || '-',
        contact: outsourcing.landlineNumber || '-',
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
        totalSupply: (prev.supplyPrice || 0) + (curr.supplyPrice || 0),
        totalTax: (prev.vat || 0) + (curr.vat || 0),
        totalDeduction: (prev.deductionAmount || 0) + (curr.deductionAmount || 0),
        totalTotal: (prev.total || 0) + (curr.total || 0),
      }
    },
  )

  // const allRows = [...rowsDirect, ...rowsOutsourcing]

  // 1️⃣ 헤더
  const laborHeaderRow1 = [
    'NO.',
    '사업자등록번호',
    '업체명',
    '공종명',
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

  const laborHeaderRow2 = [
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

  const laborSheetData: any[] = []
  laborSheetData.push(laborHeaderRow1)
  laborSheetData.push(laborHeaderRow2)

  // 총합에 사용할 키 배열 (이 위치에 있어야 calculateSum에서 참조 가능)
  const totalKeys = [
    'prevSupply',
    'prevTax',
    'prevDeduction',
    'prevTotal',
    'currSupply',
    'currTax',
    'currDeduction',
    'currTotal',
    'totalSupply',
    'totalTax',
    'totalDeduction',
    'totalTotal',
  ]

  const calculateSum = (arr: any[]) =>
    totalKeys.map((key) => arr.reduce((acc, r) => acc + (r?.[key] || 0), 0))

  // 합계 계산
  const sumDirect = calculateSum(rowsDirect)
  const sumOutsourcing = calculateSum(rowsOutsourcing)
  const sumTotal = calculateSum([...rowsDirect, ...rowsOutsourcing])

  // ➊ 직영 rows 추가
  rowsDirect.forEach((r: any) => {
    laborSheetData.push([
      r.no,
      r.businessNumber,
      r.company,
      r.item,
      r.ceo,
      r.contact,
      r.bank,
      r.accountNumber,
      r.accountName,
      r.prevSupply?.toLocaleString(),
      r.prevTax?.toLocaleString(),
      r.prevDeduction?.toLocaleString(),
      r.prevTotal?.toLocaleString(),
      r.currSupply?.toLocaleString(),
      r.currTax?.toLocaleString(),
      r.currDeduction?.toLocaleString(),
      r.currTotal?.toLocaleString(),
      r.totalSupply?.toLocaleString(),
      r.totalTax?.toLocaleString(),
      r.totalDeduction?.toLocaleString(),
      r.totalTotal?.toLocaleString(),
    ])
  })

  laborSheetData.push([
    '직영소계',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    ...sumDirect.map((v) => v.toLocaleString()),
  ])

  // ➌ 용역 rows 추가
  rowsOutsourcing.forEach((r: any) => {
    laborSheetData.push([
      r.no,
      r.businessNumber,
      r.company,
      r.item,
      r.ceo,
      r.contact,
      r.bank,
      r.accountNumber,
      r.accountName,
      r.prevSupply?.toLocaleString(),
      r.prevTax?.toLocaleString(),
      r.prevDeduction?.toLocaleString(),
      r.prevTotal?.toLocaleString(),
      r.currSupply?.toLocaleString(),
      r.currTax?.toLocaleString(),
      r.currDeduction?.toLocaleString(),
      r.currTotal?.toLocaleString(),
      r.totalSupply?.toLocaleString(),
      r.totalTax?.toLocaleString(),
      r.totalDeduction?.toLocaleString(),
      r.totalTotal?.toLocaleString(),
    ])
  })

  // ➍ 용역 소계
  laborSheetData.push([
    '용역소계',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    ...sumOutsourcing.map((v) => v.toLocaleString()),
  ])

  // ➎ 전체 합계
  laborSheetData.push([
    '합계',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    ...sumTotal.map((v) => v.toLocaleString()),
  ])

  const laborCostSheet = XLSX.utils.aoa_to_sheet(laborSheetData)

  const directSubtotalRow = 2 + rowsDirect.length
  const outsourcingStartRow = directSubtotalRow + 1
  const outsourcingSubtotalRow = outsourcingStartRow + rowsOutsourcing.length
  const totalRow = outsourcingSubtotalRow + 1

  // 병합 설정
  laborCostSheet['!merges'] = [
    // 헤더 1~2줄 병합
    { s: { r: 0, c: 0 }, e: { r: 1, c: 0 } },
    { s: { r: 0, c: 1 }, e: { r: 1, c: 1 } },
    { s: { r: 0, c: 2 }, e: { r: 1, c: 2 } },
    { s: { r: 0, c: 3 }, e: { r: 1, c: 3 } },
    { s: { r: 0, c: 4 }, e: { r: 1, c: 4 } },
    { s: { r: 0, c: 5 }, e: { r: 1, c: 5 } },
    { s: { r: 0, c: 6 }, e: { r: 0, c: 8 } },
    { s: { r: 0, c: 9 }, e: { r: 0, c: 12 } },
    { s: { r: 0, c: 13 }, e: { r: 0, c: 16 } },
    { s: { r: 0, c: 17 }, e: { r: 0, c: 20 } },

    // 직영소계 병합
    { s: { r: directSubtotalRow, c: 0 }, e: { r: directSubtotalRow, c: 8 } },

    // 용역소계 병합
    { s: { r: outsourcingSubtotalRow, c: 0 }, e: { r: outsourcingSubtotalRow, c: 8 } },

    // 전체 합계 병합
    { s: { r: totalRow, c: 0 }, e: { r: totalRow, c: 8 } },
  ]

  // 스타일 적용
  const laborRange = XLSX.utils.decode_range(laborCostSheet['!ref']!)
  for (let R = 0; R <= laborRange.e.r; R++) {
    for (let C = 0; C <= laborRange.e.c; C++) {
      const cellRef = XLSX.utils.encode_cell({ r: R, c: C })
      if (!laborCostSheet[cellRef]) laborCostSheet[cellRef] = { v: '' }

      const cellValue = laborCostSheet[cellRef].v
      const isHeader = R < 2
      const isAmount = !isHeader && C >= 9
      const isSubtotal =
        typeof cellValue === 'string' && (cellValue.includes('소계') || cellValue === '합계')

      laborCostSheet[cellRef].s = {
        border: {
          top: { style: 'thin', color: { rgb: '000000' } },
          bottom: { style: 'thin', color: { rgb: '000000' } },
          left: { style: 'thin', color: { rgb: '000000' } },
          right: { style: 'thin', color: { rgb: '000000' } },
        },
        fill: isHeader ? { patternType: 'solid', fgColor: { rgb: 'C0C0C0' } } : undefined,
        alignment: {
          horizontal: isHeader || isSubtotal ? 'center' : isAmount ? 'right' : 'center',
          vertical: 'center',
        },
        font: { bold: isHeader || isSubtotal },
      }
    }
  }

  // 노무비 명세서

  const directQuery = useFinalAggregationView({
    yearMonth: search.yearMonth,
    siteId: search.siteId,
    siteProcessId: search.siteProcessId,
    type: 'DIRECT_CONTRACT',
    tabName: 'LABOR_DETAIL',
  })

  const outsourcingQuery = useFinalAggregationView({
    yearMonth: search.yearMonth,
    siteId: search.siteId,
    siteProcessId: search.siteProcessId,
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

  // const formatNumber = (value: any) => {
  //   const num = Number(value)
  //   if (isNaN(num)) return '0'
  //   return num.toLocaleString()
  // }

  const laborCostRows = allData.map((item: any, idx: number) => {
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
  const laborPaySum = laborCostRows.reduce(
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

  const laborPayColumns = Array.from({ length: 31 }, (_, i) => i + 1)

  // header
  const laborPayHeaderRow1 = [
    'No',
    '성명',
    '주민번호',
    '직종',
    '팀명칭',
    '주소',
    '주작업',
    '일당',
    ...laborPayColumns.slice(0, 15),
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
  const laborPayHeaderRow2 = [
    ...Array(8).fill(''),
    ...laborPayColumns.slice(15, 31),
    ...Array(15).fill(''),
  ]

  const formatNumberWithComma = (num: number | string) => {
    const n = Number(num) || 0
    return n.toLocaleString() // , 구분
  }

  const dataRows: any[][] = []

  laborCostRows.forEach((r) => {
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
    const row2 = [...Array(8).fill(''), ...r.days.slice(15, 31), ...Array(15).fill('')]
    dataRows.push(row1, row2)
  })

  const sumRow1 = [
    '소계',
    ...Array(7).fill(''),
    ...Array.from({ length: 15 }, (_, i) =>
      formatNumberWithComma(laborCostRows.reduce((acc, r) => acc + (Number(r.days[i]) || 0), 0)),
    ),
    '',
    formatNumberWithComma(laborPaySum.totalWork),
    formatNumberWithComma(laborPaySum.totalDays),
    formatNumberWithComma(laborPaySum.totalLaborCost),
    formatNumberWithComma(laborPaySum.incomeTax),
    formatNumberWithComma(laborPaySum.residentTax),
    formatNumberWithComma(laborPaySum.employmentInsurance),
    formatNumberWithComma(laborPaySum.healthInsurance),
    formatNumberWithComma(laborPaySum.longTermCare),
    formatNumberWithComma(laborPaySum.nationalPension),
    formatNumberWithComma(laborPaySum.deductionTotal),
    formatNumberWithComma(laborPaySum.payAfterDeduction),
    '',
    '',
    '',
    '',
  ]
  const sumRow2 = [
    ...Array(8).fill(''),
    ...Array.from({ length: 16 }, (_, i) =>
      formatNumberWithComma(
        laborCostRows.reduce((acc, r) => acc + (Number(r.days[i + 15]) || 0), 0),
      ),
    ),
    ...Array(14).fill(''),
  ]

  const sheetAoA = [laborPayHeaderRow1, laborPayHeaderRow2, ...dataRows, sumRow1, sumRow2]
  const laborPaySheet = XLSX.utils.aoa_to_sheet(sheetAoA)

  // 병합
  laborPaySheet['!merges'] = [
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

  const laborPayRange = XLSX.utils.decode_range(laborPaySheet['!ref'] ?? '')
  const totalRowStart = sheetAoA.length - 2
  const totalRowEnd = sheetAoA.length - 1

  const amountCols = [7, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34]

  for (let R = laborPayRange.s.r; R <= laborPayRange.e.r; ++R) {
    for (let C = laborPayRange.s.c; C <= laborPayRange.e.c; ++C) {
      const cellRef = XLSX.utils.encode_cell({ r: R, c: C })
      if (!laborPaySheet[cellRef]) laborPaySheet[cellRef] = { v: '' }

      const isHeader = R < 2
      const isTotalRow = R === totalRowStart || R === totalRowEnd
      const isRightAlign = amountCols.includes(C)

      laborPaySheet[cellRef].s = {
        border: {
          top: { style: 'thin', color: { rgb: '000000' } },
          bottom: { style: 'thin', color: { rgb: '000000' } },
          left: { style: 'thin', color: { rgb: '000000' } },
          right: { style: 'thin', color: { rgb: '000000' } },
        },
        fill:
          isHeader || isTotalRow ? { patternType: 'solid', fgColor: { rgb: 'C0C0C0' } } : undefined,
        alignment: {
          vertical: 'center',
          horizontal: isRightAlign ? 'right' : 'center',
        },
      }
    }
  }

  // 장비비 엑셀다운로드

  const { EquipmentLaborCostListQuery } = useFinalAggregationView({
    yearMonth: search.yearMonth,
    siteId: search.siteId,
    siteProcessId: search.siteProcessId,
    tabName: 'EQUIPMENT',
  })

  const eqRowsDirect = (EquipmentLaborCostListQuery.data?.data?.items || []).map(
    (item: any, index: number) => {
      const outsourcing = item.outsourcingCompany || {}
      const prev = item.previousBilling || {}
      const curr = item.currentBilling || {}

      return {
        no: index + 1,
        category: outsourcing.type || '-',
        businessNumber: outsourcing.businessNumber || '-',
        company: outsourcing.name || '-',
        specification: item?.specification || '-',
        ceo: outsourcing.ceoName || '-',
        contact: outsourcing.landlineNumber || '-',
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
        totalSupply: (prev.supplyPrice || 0) + (curr.supplyPrice || 0),
        totalTax: (prev.vat || 0) + (curr.vat || 0),
        totalDeduction: (prev.deductionAmount || 0) + (curr.deductionAmount || 0),
        totalTotal: (prev.total || 0) + (curr.total || 0),
      }
    },
  )

  // 헤더 1행
  const eqHeaderRow1 = [
    'NO.',
    '사업자등록번호',
    '규격',
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

  // 헤더 2행
  const eqHeaderRow2 = [
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

  const eqSheetData: any[] = []
  eqSheetData.push(eqHeaderRow1)
  eqSheetData.push(eqHeaderRow2)

  eqRowsDirect.forEach((r: any) => {
    eqSheetData.push([
      r.no,
      r.businessNumber,
      r.specification,
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

  const EqSum = (key: string) => eqRowsDirect.reduce((acc: any, r: any) => acc + (r as any)[key], 0)

  eqSheetData.push([
    '소계',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    EqSum('prevSupply').toLocaleString(),
    EqSum('prevTax').toLocaleString(),
    EqSum('prevDeduction').toLocaleString(),
    EqSum('prevTotal').toLocaleString(),
    EqSum('currSupply').toLocaleString(),
    EqSum('currTax').toLocaleString(),
    EqSum('currDeduction').toLocaleString(),
    EqSum('currTotal').toLocaleString(),
    EqSum('totalSupply').toLocaleString(),
    EqSum('totalTax').toLocaleString(),
    EqSum('totalDeduction').toLocaleString(),
    EqSum('totalTotal').toLocaleString(),
  ])

  const equipmentCostSheet = XLSX.utils.aoa_to_sheet(eqSheetData)

  // 병합
  equipmentCostSheet['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 1, c: 0 } },
    { s: { r: 0, c: 1 }, e: { r: 1, c: 1 } },
    { s: { r: 0, c: 2 }, e: { r: 1, c: 2 } },
    { s: { r: 0, c: 3 }, e: { r: 1, c: 3 } },
    { s: { r: 0, c: 4 }, e: { r: 1, c: 4 } },
    { s: { r: 0, c: 5 }, e: { r: 1, c: 5 } },

    { s: { r: 0, c: 6 }, e: { r: 0, c: 8 } },
    { s: { r: 0, c: 9 }, e: { r: 0, c: 12 } },
    { s: { r: 0, c: 13 }, e: { r: 0, c: 16 } },
    { s: { r: 0, c: 17 }, e: { r: 0, c: 20 } },

    // 소계 병합
    { s: { r: eqSheetData.length - 1, c: 0 }, e: { r: eqSheetData.length - 1, c: 8 } },
  ]

  // 스타일 적용 (기존 코드 그대로)
  const Eqrange = XLSX.utils.decode_range(equipmentCostSheet['!ref']!)
  for (let R = Eqrange.s.r; R <= Eqrange.e.r; ++R) {
    for (let C = Eqrange.s.c; C <= Eqrange.e.c; ++C) {
      const cellRef = XLSX.utils.encode_cell({ r: R, c: C })
      if (!equipmentCostSheet[cellRef]) equipmentCostSheet[cellRef] = { v: '' }

      const isHeader = R < 2
      const isAmount = !isHeader && C >= 9
      const isSubtotalLabel = R === eqSheetData.length - 1 && C === 0

      equipmentCostSheet[cellRef].s = {
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

  // 장비가동현황 엑셀 다운로드

  const { EquipmentStatusLaborCostListQuery } = useFinalAggregationView({
    yearMonth: search.yearMonth,
    siteId: search.siteId,
    siteProcessId: search.siteProcessId,
    tabName: 'EQUIPMENT_OPERATION',
  })

  const { WeatherInfoListQuery } = useFinalAggregationView({
    yearMonth: search.yearMonth,
    siteId: search.siteId,
    siteProcessId: search.siteProcessId,
    tabName: 'EQUIPMENT_OPERATION',
  })

  const EqOperationDateColumns = Array.from({ length: 31 }, (_, i) => i + 1)

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

  const eqOperationRows = equipmentStatusList.map((item: any, index: number) => {
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

  // 합계 계산
  const verticalSums: {
    amounts: number[]
    totalHours: number
    totalUnitPrice: number
    totalSubtotal: number
  } = {
    amounts: Array(EqOperationDateColumns.length).fill(0),
    totalHours: 0,
    totalUnitPrice: 0,
    totalSubtotal: 0,
  }

  eqOperationRows.forEach((r: any) => {
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

      const subtotal = totalHours * displayUnitPrice

      // vertical sums
      verticalSums.totalHours += totalHours
      verticalSums.totalUnitPrice += displayUnitPrice
      verticalSums.totalSubtotal += subtotal

      EqOperationDateColumns.forEach((d, idx) => {
        verticalSums.amounts[idx] += eq.days[d]?.amount || 0
      })
    })
  })

  const rowTotals = eqOperationRows.map((r: any) => {
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

  const formattedRows: any[][] = []

  const formatNumber = (num: number) => {
    if (num == null || isNaN(num)) return ''
    return Number(num).toLocaleString('ko-KR')
  }

  eqOperationRows.forEach((r: any) => {
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
      const averageUnitPrice = unitPriceDays.length > 0 ? totalUnitPrice / unitPriceDays.length : 0

      let displayUnitPrice: number
      if (eq.type === '유류대') {
        // const otherEquipmentsTotalHours = 0
        //   .filter((e: any) => e.type !== '유류대')
        //   .reduce(
        //     (sum: number, e: any) =>
        //       sum +
        //       Object.values(e?.days || {}).reduce((a: number, d: any) => a + (d?.amount || 0), 0),
        //     0,
        //   )

        displayUnitPrice = 0
        // otherEquipmentsTotalHours > 0 ? totalHours / otherEquipmentsTotalHours : 0
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
        ...EqOperationDateColumns.map((d) => formatNumber(eq.days[d]?.amount || 0)),
        formatNumber(totalHours),
        formatNumber(displayUnitPrice),
        formatNumber(displaySubtotal),
        idx === 0 ? formatNumber(rowTotals[r.no - 1] || 0) : '',
      ]

      formattedRows.push(rowArr)
    })
  })

  // -----------------------------
  // 2️⃣ 헤더
  // -----------------------------
  const headerRowDates = [
    'No',
    '직영',
    '규격',
    '업체명',
    '대표/기사',
    '차량번호',
    '구분',
    ...EqOperationDateColumns.map((d) => `${d}`),
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
    ...EqOperationDateColumns.map((d) => {
      const key = `day${d.toString().padStart(2, '0')}`
      return WeatherInfo[key] ? weatherMap[WeatherInfo[key]] || WeatherInfo[key] : '-'
    }),
    '',
    '',
    '',
    '',
  ]

  // -----------------------------
  // 3️⃣ 총합계 행
  // -----------------------------
  const eqOperationtotalRow = [
    '총합계',
    '',
    '',
    '',
    '',
    '',
    '',
    ...EqOperationDateColumns.map((_, idx) => formatNumber(verticalSums.amounts[idx] || 0)),
    formatNumber(verticalSums.totalHours),
    formatNumber(verticalSums.totalUnitPrice),
    formatNumber(verticalSums.totalSubtotal),
    formatNumber(verticalSums.totalSubtotal),
  ]

  // AoA 생성
  const eqOperationSheetAoA = [
    headerRowDates,
    headerRowWeather,
    ...formattedRows,
    eqOperationtotalRow,
  ]

  const equipmentOperationSheet = XLSX.utils.aoa_to_sheet(eqOperationSheetAoA)

  // 전체 eqOperationRows 기반 index 계산
  const totalRowIndex = 2 + formattedRows.length

  // -----------------------------
  // 4️⃣ 병합(Merge)
  // -----------------------------
  equipmentOperationSheet['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 1, c: 0 } },
    { s: { r: 0, c: 1 }, e: { r: 1, c: 1 } },
    { s: { r: 0, c: 2 }, e: { r: 1, c: 2 } },
    { s: { r: 0, c: 3 }, e: { r: 1, c: 3 } },
    { s: { r: 0, c: 4 }, e: { r: 1, c: 4 } },
    { s: { r: 0, c: 5 }, e: { r: 1, c: 5 } },
    { s: { r: 0, c: 6 }, e: { r: 1, c: 6 } },
    {
      s: { r: 0, c: 7 + EqOperationDateColumns.length },
      e: { r: 1, c: 7 + EqOperationDateColumns.length },
    },
    {
      s: { r: 0, c: 8 + EqOperationDateColumns.length },
      e: { r: 1, c: 8 + EqOperationDateColumns.length },
    },
    {
      s: { r: 0, c: 9 + EqOperationDateColumns.length },
      e: { r: 1, c: 9 + EqOperationDateColumns.length },
    },
    {
      s: { r: 0, c: 10 + EqOperationDateColumns.length },
      e: { r: 1, c: 10 + EqOperationDateColumns.length },
    },

    // ⭐ 총합계 셀 병합 (1~7열)
    { s: { r: totalRowIndex, c: 0 }, e: { r: totalRowIndex, c: 6 } },
  ]

  const equipmentOperationRange = XLSX.utils.decode_range(equipmentOperationSheet['!ref'] ?? '')

  // 금액 컬럼 index 계산
  const amountStartCol = 7 + EqOperationDateColumns.length // 총계
  const unitPriceCol = amountStartCol + 1 // 단가
  const subtotalCol = amountStartCol + 2 // 소계
  const totalSumCol = amountStartCol + 3 // 총합계

  for (let R = equipmentOperationRange.s.r; R <= equipmentOperationRange.e.r; ++R) {
    for (let C = equipmentOperationRange.s.c; C <= equipmentOperationRange.e.c; ++C) {
      const cellRef = XLSX.utils.encode_cell({ r: R, c: C })
      if (!equipmentOperationSheet[cellRef]) equipmentOperationSheet[cellRef] = { v: '' }

      const isHeader = R < 2
      const isTotalRow = R === totalRowIndex

      // 오른쪽 정렬 대상 컬럼인지 체크
      const isRightAlign = C === unitPriceCol || C === subtotalCol || C === totalSumCol

      equipmentOperationSheet[cellRef].s = {
        border: {
          top: { style: 'thin', color: { rgb: '000000' } },
          bottom: { style: 'thin', color: { rgb: '000000' } },
          left: { style: 'thin', color: { rgb: '000000' } },
          right: { style: 'thin', color: { rgb: '000000' } },
        },
        fill:
          isHeader || isTotalRow ? { patternType: 'solid', fgColor: { rgb: 'C0C0C0' } } : undefined,
        alignment: {
          vertical: 'center',
          horizontal: isRightAlign ? 'right' : 'center',
        },
      }
    }
  }

  // 외주 엑셀 다운로드

  const { ManagementOutSourcingListQuery } = useFinalAggregationView({
    yearMonth: search.yearMonth,
    siteId: search.siteId,
    siteProcessId: search.siteProcessId,
    tabName: 'OUTSOURCING',
    outsourcingCompanyContractId: search.outsourcingCompanyContractId,
  })

  const { ConstructionListQuery } = useFinalAggregationView({
    siteId: search.siteId,
    siteProcessId: search.siteProcessId,
    tabName: 'OUTSOURCING',
  })

  const ConstructionList = ConstructionListQuery?.data?.data ?? []

  const OutSourcingNameMenuList = ManagementOutSourcingListQuery.data ?? []

  const items = OutSourcingNameMenuList?.data?.items || []

  const outRows = items.map((item: any, index: number) => {
    const contract = item.outsourcingCompanyContract || {}
    const outsourcing = contract.outsourcingCompany || {}

    const prev = item.previousBilling || {}
    const curr = item.currentBilling || {}

    const totalSupply = (prev.supplyPrice || 0) + (curr.supplyPrice || 0)
    const totalTax = (prev.vat || 0) + (curr.vat || 0)
    const totalDeduction = (prev.deduction || 0) + (curr.deduction || 0)
    const totalTotal = (prev.total || 0) + (curr.total || 0)

    return {
      no: index + 1,
      category: outsourcing.type || '-', // 관리 / 기타 등
      businessNumber: outsourcing.businessNumber || '-',
      contractName: contract.contractName || '-', // 계약명
      company: outsourcing.name || '-',
      ceo: outsourcing.ceoName || '-',
      contact: outsourcing.landlineNumber || '-',
      bank: outsourcing.bankName || '-',
      accountNumber: outsourcing.accountNumber || '-',
      accountName: outsourcing.accountHolder || '-',

      prevSupply: prev.supplyPrice || 0,
      prevTax: prev.vat || 0,
      prevDeduction: prev.deduction || 0,
      prevTotal: prev.total || 0,

      currSupply: curr.supplyPrice || 0,
      currTax: curr.vat || 0,
      currDeduction: curr.deduction || 0,
      currTotal: curr.total || 0,

      totalSupply,
      totalTax,
      totalDeduction,
      totalTotal,
    }
  })

  const outHeaderRow1 = [
    'NO.',
    '사업자등록번호',
    '계약명',
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

  const outHeaderRow2 = [
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

  const outSheetData: any[] = [outHeaderRow1, outHeaderRow2]

  outRows.forEach((r: any) => {
    outSheetData.push([
      r.no,
      r.businessNumber,
      r.contractName, // item 대신 계약명
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

  // 소계
  const outSum = (key: string) => outRows.reduce((acc: number, r: any) => acc + (r[key] || 0), 0)
  outSheetData.push([
    '소계',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    outSum('prevSupply').toLocaleString(),
    outSum('prevTax').toLocaleString(),
    outSum('prevDeduction').toLocaleString(),
    outSum('prevTotal').toLocaleString(),
    outSum('currSupply').toLocaleString(),
    outSum('currTax').toLocaleString(),
    outSum('currDeduction').toLocaleString(),
    outSum('currTotal').toLocaleString(),
    outSum('totalSupply').toLocaleString(),
    outSum('totalTax').toLocaleString(),
    outSum('totalDeduction').toLocaleString(),
    outSum('totalTotal').toLocaleString(),
  ])

  const outSourcingSheet = XLSX.utils.aoa_to_sheet(outSheetData)

  // 병합
  outSourcingSheet['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 1, c: 0 } },
    { s: { r: 0, c: 1 }, e: { r: 1, c: 1 } },
    { s: { r: 0, c: 2 }, e: { r: 1, c: 2 } },
    { s: { r: 0, c: 3 }, e: { r: 1, c: 3 } },
    { s: { r: 0, c: 4 }, e: { r: 1, c: 4 } },
    { s: { r: 0, c: 5 }, e: { r: 1, c: 5 } },
    { s: { r: 0, c: 6 }, e: { r: 0, c: 8 } },
    { s: { r: 0, c: 9 }, e: { r: 0, c: 12 } },
    { s: { r: 0, c: 13 }, e: { r: 0, c: 16 } },
    { s: { r: 0, c: 17 }, e: { r: 0, c: 20 } },
    { s: { r: outSheetData.length - 1, c: 0 }, e: { r: outSheetData.length - 1, c: 8 } },
  ]

  // 스타일
  const outSourcingRange = XLSX.utils.decode_range(outSourcingSheet['!ref']!)
  for (let R = outSourcingRange.s.r; R <= outSourcingRange.e.r; ++R) {
    for (let C = outSourcingRange.s.c; C <= outSourcingRange.e.c; ++C) {
      const cellRef = XLSX.utils.encode_cell({ r: R, c: C })
      if (!outSourcingSheet[cellRef]) outSourcingSheet[cellRef] = { v: '' }

      const isHeader = R < 2
      const isAmount = !isHeader && C >= 9
      const isSubtotalLabel = R === outSheetData.length - 1 && C === 0

      outSourcingSheet[cellRef].s = {
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

  // 관리비 엑셀 다운로드

  const { ManagementCostListQuery } = useFinalAggregationView({
    yearMonth: search.yearMonth,
    siteId: search.siteId,
    siteProcessId: search.siteProcessId,
    tabName: 'MANAGEMENT',
    outsourcingCompanyId: search.outsourcingCompanyId,
  })

  const CostMenuList = ManagementCostListQuery.data ?? []

  const Costitems = CostMenuList?.data?.items || []

  const CostRows = Costitems.map((item: any, index: number) => {
    const outsourcing = item.outsourcingCompany || {}
    const prev = item.previousBilling || {}
    const curr = item.currentBilling || {}

    const totalSupply = (prev.supplyPrice || 0) + (curr.supplyPrice || 0)
    const totalTax = (prev.vat || 0) + (curr.vat || 0)
    const totalDeduction = (prev.deductionAmount || 0) + (curr.deductionAmount || 0)
    const totalTotal = (prev.total || 0) + (curr.total || 0)

    return {
      no: index + 1,
      category: outsourcing.type || '-',
      businessNumber: outsourcing.businessNumber || '-',
      item: item.itemTypeDescription || item.itemType || '-',
      company: outsourcing.name || '-',
      ceo: outsourcing.ceoName || '-',
      contact: outsourcing.landlineNumber || '-',
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

  // 헤더 1행
  const manageMentCostHeaderRow1 = [
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

  // 헤더 2행
  const manageMentCostHeaderRow2 = [
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

  const managementCostSheetData: any[] = []
  managementCostSheetData.push(manageMentCostHeaderRow1)
  managementCostSheetData.push(manageMentCostHeaderRow2)

  // 테이블 데이터 추가
  CostRows.forEach((r: any) => {
    managementCostSheetData.push([
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

  // 소계 계산
  const managementCostSum = (key: string) =>
    CostRows.reduce((acc: number, r: any) => acc + (r[key] || 0), 0)

  managementCostSheetData.push([
    '소계',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    managementCostSum('prevSupply').toLocaleString(),
    managementCostSum('prevTax').toLocaleString(),
    managementCostSum('prevDeduction').toLocaleString(),
    managementCostSum('prevTotal').toLocaleString(),
    managementCostSum('currSupply').toLocaleString(),
    managementCostSum('currTax').toLocaleString(),
    managementCostSum('currDeduction').toLocaleString(),
    managementCostSum('currTotal').toLocaleString(),
    managementCostSum('totalSupply').toLocaleString(),
    managementCostSum('totalTax').toLocaleString(),
    managementCostSum('totalDeduction').toLocaleString(),
    managementCostSum('totalTotal').toLocaleString(),
  ])

  const managementCostSheet = XLSX.utils.aoa_to_sheet(managementCostSheetData)

  // 병합
  managementCostSheet['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 1, c: 0 } },
    { s: { r: 0, c: 1 }, e: { r: 1, c: 1 } },
    { s: { r: 0, c: 2 }, e: { r: 1, c: 2 } },
    { s: { r: 0, c: 3 }, e: { r: 1, c: 3 } },
    { s: { r: 0, c: 4 }, e: { r: 1, c: 4 } },
    { s: { r: 0, c: 5 }, e: { r: 1, c: 5 } },

    { s: { r: 0, c: 6 }, e: { r: 0, c: 8 } },
    { s: { r: 0, c: 9 }, e: { r: 0, c: 12 } },
    { s: { r: 0, c: 13 }, e: { r: 0, c: 16 } },
    { s: { r: 0, c: 17 }, e: { r: 0, c: 20 } },

    // 소계 병합 (첫 9칸)
    {
      s: { r: managementCostSheetData.length - 1, c: 0 },
      e: { r: managementCostSheetData.length - 1, c: 8 },
    },
  ]

  // 스타일 적용
  const CostRange = XLSX.utils.decode_range(managementCostSheet['!ref']!)
  for (let R = CostRange.s.r; R <= CostRange.e.r; ++R) {
    for (let C = CostRange.s.c; C <= CostRange.e.c; ++C) {
      const cellRef = XLSX.utils.encode_cell({ r: R, c: C })
      if (!managementCostSheet[cellRef]) managementCostSheet[cellRef] = { v: '' }

      const isHeader = R < 2
      const isAmount = !isHeader && C >= 9
      const isSubtotalLabel = R === managementCostSheetData.length - 1 && C === 0

      managementCostSheet[cellRef].s = {
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

  // 계약업체별 정보와 ID 매핑
  const contractInfoMap = ConstructionList.reduce((acc: any, item: any) => {
    const contractId = item.outsourcingCompanyContract.id
    const contractName = item.outsourcingCompanyContract.contractName || '계약명없음'
    acc[contractId] = {
      id: contractId,
      contractName,
      rawGroups: [],
      amountGroups: {},
    }
    return acc
  }, {})

  const ConstructionIdList = Object.keys(contractInfoMap).map(Number)

  //외주 쪽 상세 엑셀 다운로드 데이터 - 각 계약업체별로 분리
  const [contractDataMap, setContractDataMap] = useState<Record<number, any>>({})

  // 각 contractId에 대해 순차적으로 API 호출
  useEffect(() => {
    const fetchAllData = async () => {
      if (ConstructionIdList.length === 0) return

      const newContractDataMap: Record<number, any> = {}

      // 각 contractId에 대해 순차적으로 API 호출
      for (const contractId of ConstructionIdList) {
        try {
          // ConstructionDetail 데이터 가져오기
          const constructionParams = {
            siteId: search.siteId === 0 ? undefined : search.siteId,
            siteProcessId: search.siteProcessId === 0 ? undefined : search.siteProcessId,
            yearMonth: search.yearMonth,
            outsourcingCompanyContractId: contractId === 0 ? undefined : contractId,
          }

          const filteredConstructionParams = Object.fromEntries(
            Object.entries(constructionParams).filter(
              ([, value]) =>
                value !== undefined &&
                value !== null &&
                value !== '' &&
                !(typeof value === 'number' && isNaN(value)),
            ),
          )

          const constructionResponse = await GetConstructionDetailServiceByAggregate(
            filteredConstructionParams,
          )
          const groups = constructionResponse?.data?.constructionGroups || []

          // DeductionAmount 데이터 가져오기
          const deductionParams = {
            siteId: search.siteId === 0 ? undefined : search.siteId,
            siteProcessId: search.siteProcessId === 0 ? undefined : search.siteProcessId,
            yearMonth: search.yearMonth,
            outsourcingCompanyContractId: contractId === 0 ? undefined : contractId,
          }

          const filteredDeductionParams = Object.fromEntries(
            Object.entries(deductionParams).filter(
              ([, value]) =>
                value !== undefined &&
                value !== null &&
                value !== '' &&
                !(typeof value === 'number' && isNaN(value)),
            ),
          )

          const deductionResponse = await GetdeductionAmountServiceByAggregate(
            filteredDeductionParams,
          )
          const amountData = deductionResponse?.data || {}

          // 각 계약업체별로 데이터 저장
          newContractDataMap[contractId] = {
            contractId,
            contractName: contractInfoMap[contractId]?.contractName || '계약명없음',
            rawGroups: groups,
            amountGroups: amountData,
          }
        } catch (error) {
          console.error(`contractId ${contractId} 데이터 가져오기 실패:`, error)
        }
      }

      setContractDataMap(newContractDataMap)
    }

    fetchAllData()
  }, [ConstructionIdList, search.yearMonth, search.siteId, search.siteProcessId])

  // 각 계약업체별 엑셀 시트 생성 함수
  const createContractDetailSheet = (rawGroups: any[], amountGroups: Record<string, any>) => {
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

    // 누계 합계
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

    const outDetailHeaderRow1 = [
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
    const outDetailHeaderRow2 = [
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

    const outDetailSheetData: any[] = []
    outDetailSheetData.push(outDetailHeaderRow1)
    outDetailSheetData.push(outDetailHeaderRow2)

    // 그룹별 데이터
    groupedRows.forEach((group: any, groupIndex: any) => {
      group.rows.forEach((r: any, rowIdx: any) => {
        outDetailSheetData.push(
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
    outDetailSheetData.push([
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
      outDetailSheetData.push([
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
    outDetailSheetData.push([
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
    outDetailSheetData.push([
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
    outDetailSheetData.push([
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
    outDetailSheetData.push([
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

    const outDetailExcelSheet = XLSX.utils.aoa_to_sheet(outDetailSheetData)

    // 병합
    outDetailExcelSheet['!merges'] = [
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
    const outsourcingRowIndex = outDetailSheetData.findIndex((row) => row[0] === '외주공사비')
    if (outsourcingRowIndex >= 0) {
      outDetailExcelSheet['!merges'].push({
        s: { r: outsourcingRowIndex, c: 0 },
        e: { r: outsourcingRowIndex, c: 5 },
      })
    }

    const deductionRowIndex = outDetailSheetData.findIndex((row) => row[0] === '공제합계')
    if (deductionRowIndex >= 0) {
      outDetailExcelSheet['!merges'].push({
        s: { r: deductionRowIndex, c: 0 },
        e: { r: deductionRowIndex, c: 5 }, // NO. ~ 도급단가까지 병합
      })
    }

    // 총계 병합
    const outDetailTotalRowIndex = outDetailSheetData.findIndex((row) =>
      row[0]?.startsWith('총계(소계1'),
    )
    if (outDetailTotalRowIndex >= 0) {
      outDetailExcelSheet['!merges'].push({
        s: { r: outDetailTotalRowIndex, c: 0 }, // 시작 셀
        e: { r: outDetailTotalRowIndex + 2, c: 4 }, // 아래 3칸, 오른쪽 5칸까지
      })
    }

    // 스타일 적용
    const outDetailRange = XLSX.utils.decode_range(outDetailExcelSheet['!ref']!)
    for (let R = outDetailRange.s.r; R <= outDetailRange.e.r; ++R) {
      for (let C = outDetailRange.s.c; C <= outDetailRange.e.c; ++C) {
        const cellRef = XLSX.utils.encode_cell({ r: R, c: C })
        if (!outDetailExcelSheet[cellRef]) outDetailExcelSheet[cellRef] = { v: '' }

        const isHeader = R < 2
        const isAmount = !isHeader && C >= 6
        const isSubtotalLabel = R >= outDetailSheetData.length - 3 && C === 0

        outDetailExcelSheet[cellRef].s = {
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

    return outDetailExcelSheet
  }

  // 관리비 상세데이터 엑셀 다운로드

  const { MealFeeCompanyListQuery } = useFinalAggregationView({
    yearMonth: search.yearMonth,
    siteId: search.siteId,
    siteProcessId: search.siteProcessId,
    tabName: 'MANAGEMENT',
  })

  const MealFeeCompanyList = MealFeeCompanyListQuery?.data?.data ?? []

  // 업체별 정보와 ID 매핑
  const companyInfoMap = MealFeeCompanyList.reduce((acc: any, item: any) => {
    const companyId = item.id
    const companyName = item.name || '업체명없음'
    acc[companyId] = {
      id: companyId,
      companyName,
    }
    return acc
  }, {})

  const ComPanyIdList = Object.keys(companyInfoMap).map(Number)

  // 관리비 상세 데이터 - 각 업체별로 분리
  const [companyDataMap, setCompanyDataMap] = useState<Record<number, any>>({})

  // 각 companyId에 대해 순차적으로 API 호출
  useEffect(() => {
    const fetchAllCompanyData = async () => {
      if (ComPanyIdList.length === 0) return

      const newCompanyDataMap: Record<number, any> = {}

      // 각 companyId에 대해 순차적으로 API 호출
      for (const companyId of ComPanyIdList) {
        try {
          const mealFeeParams = {
            siteId: search.siteId === 0 ? undefined : search.siteId,
            siteProcessId: search.siteProcessId === 0 ? undefined : search.siteProcessId,
            yearMonth: search.yearMonth,
            outsourcingCompanyId: companyId === 0 ? undefined : companyId,
          }

          const filteredMealFeeParams = Object.fromEntries(
            Object.entries(mealFeeParams).filter(
              ([, value]) =>
                value !== undefined &&
                value !== null &&
                value !== '' &&
                !(typeof value === 'number' && isNaN(value)),
            ),
          )

          const mealFeeResponse = await GetMealFeeDetailServiceByAggregate(filteredMealFeeParams)
          const items = mealFeeResponse?.data?.items || []

          // 각 업체별로 데이터 저장
          newCompanyDataMap[companyId] = {
            companyId,
            companyName: companyInfoMap[companyId]?.companyName || '업체명없음',
            items,
          }
        } catch (error) {
          console.error(`companyId ${companyId} 데이터 가져오기 실패:`, error)
        }
      }

      setCompanyDataMap(newCompanyDataMap)
    }

    fetchAllCompanyData()
  }, [ComPanyIdList, search.yearMonth, search.siteId, search.siteProcessId])

  // 각 업체별 관리비 상세 엑셀 시트 생성 함수
  const createMealFeeDetailSheet = (mealFeeDetailList: any[]) => {
    const dateColumns = Array.from({ length: 31 }, (_, i) => i + 1)

    const getMealCounts = (
      item: any,
      mealType: 'breakfastCount' | 'lunchCount' | 'dinnerCount',
    ) => {
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

    const formattedRows: any[][] = []

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

      const totalAmount = totalMeals * avgUnitPrice

      r.meals.forEach((meal: any, idx: number) => {
        const dayCounts = dateColumns.map((d) => meal.days[d].count)

        const row = [
          idx === 0 ? r.no : '',
          idx === 0 ? r.jobType : '',
          idx === 0 ? r.name : '',
          meal.type,
          ...dayCounts,
          idx === 0 ? totalMeals.toLocaleString() : '',
          idx === 0 ? avgUnitPrice.toLocaleString() : '',
          idx === 0 ? totalAmount.toLocaleString() : '',
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
      .toLocaleString()

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
      .toLocaleString()

    const totalAmountByMeal = (
      Number(totalMealsByMeal.replace(/,/g, '')) * Number(totalUnitPriceByMeal.replace(/,/g, ''))
    ).toLocaleString()

    const meals = ['조식', '중식', '석식']

    meals.forEach((mealType: any, idx: any) => {
      const row: any[] = []
      if (idx === 0) {
        row.push('계', '', '')
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

    // 헤더
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

    // 셀 스타일: 테두리, 회색 헤더
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
          fill: rowIndex === 0 ? { fgColor: { rgb: 'CCCCCC' } } : undefined,
        }
      })
    })

    // 마지막 계 3x3 병합
    worksheet['!merges'] = [
      {
        s: { r: sheetAoA.length - 3, c: 0 },
        e: { r: sheetAoA.length - 1, c: 2 },
      },
      {
        s: { r: sheetAoA.length - 3, c: sheetAoA[0].length - 3 },
        e: { r: sheetAoA.length - 1, c: sheetAoA[0].length - 3 },
      },
      {
        s: { r: sheetAoA.length - 3, c: sheetAoA[0].length - 2 },
        e: { r: sheetAoA.length - 1, c: sheetAoA[0].length - 2 },
      },
      {
        s: { r: sheetAoA.length - 3, c: sheetAoA[0].length - 1 },
        e: { r: sheetAoA.length - 1, c: sheetAoA[0].length - 1 },
      },
      ...rows.flatMap((_: any, rIdx: any) => {
        const startRow = 1 + rIdx * 3
        return [
          { s: { r: startRow, c: 0 }, e: { r: startRow + 2, c: 0 } },
          { s: { r: startRow, c: 1 }, e: { r: startRow + 2, c: 1 } },
          { s: { r: startRow, c: 2 }, e: { r: startRow + 2, c: 2 } },
          {
            s: { r: startRow, c: sheetAoA[0].length - 3 },
            e: { r: startRow + 2, c: sheetAoA[0].length - 3 },
          },
          {
            s: { r: startRow, c: sheetAoA[0].length - 2 },
            e: { r: startRow + 2, c: sheetAoA[0].length - 2 },
          },
          {
            s: { r: startRow, c: sheetAoA[0].length - 1 },
            e: { r: startRow + 2, c: sheetAoA[0].length - 1 },
          },
        ]
      }),
    ]

    return worksheet
  }

  useEffect(() => {
    if (!fuelDataReady || !laborDataReady) return

    if (!contractDataMap || Object.keys(contractDataMap).length === 0) return
    if (!companyDataMap || Object.keys(companyDataMap).length === 0) return

    const workbook = XLSX.utils.book_new()

    const Fuelrows: any[] = []

    fuelTypes.forEach((fuelType: any) => {
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

        const total = Object.entries(dayValues).reduce((acc, [day, amount]) => {
          const dayNum = Number(day)
          const price =
            fuelType === 'DIESEL'
              ? Number(String(getFuelPrice(dayNum, 'dieselPrice')).replaceAll(',', '').trim()) || 0
              : fuelType === 'GASOLINE'
              ? Number(String(getFuelPrice(dayNum, 'gasolinePrice')).replaceAll(',', '').trim()) ||
                0
              : Number(String(getFuelPrice(dayNum, 'ureaPrice')).replaceAll(',', '').trim()) || 0

          return acc + amount * price
        }, 0)

        Fuelrows.push({
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

    // ➌ 용역 rows 추가
    rowsOutsourcing.forEach((r: any) => {
      laborSheetData.push([
        r.no,
        r.businessNumber,
        r.company,
        r.item,
        r.ceo,
        r.contact,
        r.bank,
        r.accountNumber,
        r.accountName,
        r.prevSupply?.toLocaleString(),
        r.prevTax?.toLocaleString(),
        r.prevDeduction?.toLocaleString(),
        r.prevTotal?.toLocaleString(),
        r.currSupply?.toLocaleString(),
        r.currTax?.toLocaleString(),
        r.currDeduction?.toLocaleString(),
        r.currTotal?.toLocaleString(),
        r.totalSupply?.toLocaleString(),
        r.totalTax?.toLocaleString(),
        r.totalDeduction?.toLocaleString(),
        r.totalTotal?.toLocaleString(),
      ])
    })

    laborSheetData.push([
      '용역소계',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      ...sumOutsourcing.map((v) => v.toLocaleString()),
    ])

    XLSX.utils.book_append_sheet(workbook, materialSheet, '재료비')
    XLSX.utils.book_append_sheet(workbook, fuelSheet, '유류집계')
    XLSX.utils.book_append_sheet(workbook, laborCostSheet, '노무비')
    XLSX.utils.book_append_sheet(workbook, laborPaySheet, '노무비명세서')
    XLSX.utils.book_append_sheet(workbook, equipmentCostSheet, '장비비')
    XLSX.utils.book_append_sheet(workbook, equipmentOperationSheet, '장비가동현황')

    XLSX.utils.book_append_sheet(workbook, outSourcingSheet, '외주집계')

    // 각 계약업체별로 별도의 엑셀 시트 생성

    if (Object.keys(contractDataMap) && Object.keys(contractDataMap).length > 0) {
      Object.values(contractDataMap).forEach((contractData: any) => {
        if (contractData.rawGroups && contractData.rawGroups.length > 0) {
          const contractSheet = createContractDetailSheet(
            contractData.rawGroups,
            contractData.amountGroups,
          )
          const sheetName = `외주_${contractData.contractName}`.substring(0, 31) // 엑셀 시트 이름 최대 31자
          XLSX.utils.book_append_sheet(workbook, contractSheet, sheetName)
        }
      })
    }

    XLSX.utils.book_append_sheet(workbook, managementCostSheet, '관리비집계')

    // 각 업체별로 별도의 관리비 상세 엑셀 시트 생성

    if (Object.keys(companyDataMap) && Object.keys(companyDataMap).length > 0) {
      Object.values(companyDataMap).forEach((companyData: any) => {
        if (companyData.items && companyData.items.length > 0) {
          const companySheet = createMealFeeDetailSheet(companyData.items)
          const sheetName = `관리비_${companyData.companyName}`.substring(0, 31) // 엑셀 시트 이름 최대 31자
          XLSX.utils.book_append_sheet(workbook, companySheet, sheetName)
        }
      })
    }

    const fileName = `${search.yearMonth}_${search.siteName}_사기성집계표.xlsx`

    XLSX.writeFile(workbook, fileName)

    onComplete()

    setReady(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fuelDataReady, laborDataReady, contractDataMap, companyDataMap])

  return null
}
