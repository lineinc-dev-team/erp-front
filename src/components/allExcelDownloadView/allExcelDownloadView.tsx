/* eslint-disable @typescript-eslint/no-explicit-any */

'use client'
import * as XLSX from 'xlsx-js-style'
import useFinalAggregationView from '@/hooks/useFinalAggregation'
import { useFinalAggregationSearchStore } from '@/stores/finalAggregationStore'
import { useEffect, useState } from 'react'

export default function AllExcelDownloadView({
  onComplete,
  fuelType,
}: {
  onComplete: () => void
  fuelType: any
}) {
  const search = useFinalAggregationSearchStore((state) => state.search)

  console.log('4044', search.siteName)

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

  useEffect(() => {
    if (!fuelDataReady || !laborDataReady) return // ✅ 기름 데이터 준비 안됐으면 실행 금지

    const workbook = XLSX.utils.book_new()

    // ✅ 여기부터 기존 Fuelrows 생성 코드 그대로 복붙
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

    const fileName = `${search.yearMonth}_${search.siteName}_사기성집계표.xlsx`

    XLSX.writeFile(workbook, fileName)

    onComplete()

    setReady(true)
  }, [fuelDataReady, laborDataReady])

  return null
}
