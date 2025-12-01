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
import { useFinalAggregationSearchStore } from '@/stores/finalAggregationStore'
import useFinalAggregationView from '@/hooks/useFinalAggregation'
import { myInfoProps } from '@/types/user'
import { useMenuPermission } from '../common/MenuPermissionView'

export default function AggregateLaborPayRollView() {
  const search = useFinalAggregationSearchStore((state) => state.search)
  const { yearMonth, siteId, siteProcessId } = search

  const directQuery = useFinalAggregationView({
    yearMonth,
    siteId,
    siteProcessId,
    type: 'DIRECT_CONTRACT',
    tabName: 'LABOR_DETAIL',
  })

  const outsourcingQuery = useFinalAggregationView({
    yearMonth,
    siteId,
    siteProcessId,
    type: 'OUTSOURCING',
    tabName: 'LABOR_DETAIL',
  })

  const directData = directQuery.LaborPayCostListQuery.data?.data || []
  const outsourcingData = outsourcingQuery.LaborPayCostListQuery.data?.data || []

  // ✅ 두 데이터 합치기
  const allData = [...directData, ...outsourcingData]

  // ✅ 값 포맷팅 함수
  const formatValue = (value: any) => {
    if (value === null || value === undefined || value === '') return '-'
    if (typeof value === 'number' && !isNaN(value)) return value
    return value
  }

  const formatNumber = (value: any) => {
    const num = Number(value)
    if (isNaN(num)) return '0'
    return num.toLocaleString()
  }

  // ✅ 백엔드 데이터를 UI용으로 변환
  const rows = allData.map((item: any, idx: number) => {
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
  const sum = rows.reduce(
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

  const handleExcelDownload = () => {
    const headers = [
      'No',
      '성명',
      '주민번호',
      '직종',
      '팀명칭',
      '주소',
      '주작업',
      '일당',
      ...Array.from({ length: 16 }, (_, i) => `${i + 1}`),
      ...Array.from({ length: 15 }, (_, i) => `${i + 17}`),
      '총 공수',
      '총 일수',
      '노무비 총액',
      '소득세',
      '주민세',
      '고용보험',
      '국민연금',
      '건강보험',
      '장기요양',
      '공제합계',
      '차감지급액',
      '휴대전화',
      '은행명',
      '계좌번호',
      '예금주',
    ]

    const excelData: any[] = []

    // 데이터 행
    rows.forEach((r: any) => {
      // 첫 번째 행: 1~16일
      excelData.push({
        No: r.no,
        성명: r.name,
        주민번호: r.id,
        직종: r.job,
        팀명칭: r.team,
        주소: r.address,
        주작업: r.mainWork,
        일당: formatNumber(r.salary),
        ...Object.fromEntries(r.days.slice(0, 16).map((v: any, i: number) => [`${i + 1}`, v])),
        ...Object.fromEntries(Array.from({ length: 15 }, (_, i) => [`${i + 17}`, ''])),
        '총 공수': r.totalWork,
        '총 일수': r.totalDays,
        '노무비 총액': r.totalLaborCost,
        소득세: r.incomeTax,
        주민세: r.residentTax,
        고용보험: r.employmentInsurance,
        국민연금: r.nationalPension,
        건강보험: r.healthInsurance,
        장기요양: r.longTermCare,
        공제합계: r.deductionTotal,
        차감지급액: r.payAfterDeduction,
        휴대전화: r.phone,
        은행명: r.bank,
        계좌번호: r.account,
        예금주: r.accountName,
      })

      // 두 번째 행: 17~31일
      excelData.push({
        No: '',
        성명: '',
        주민번호: '',
        직종: '',
        팀명칭: '',
        주소: '',
        주작업: '',
        일당: '',
        ...Object.fromEntries(Array.from({ length: 16 }, (_, i) => [`${i + 1}`, ''])),
        ...Object.fromEntries(r.days.slice(16, 31).map((v: any, i: number) => [`${i + 17}`, v])),
        '총 공수': '',
        '총 일수': '',
        '노무비 총액': '',
        소득세: '',
        주민세: '',
        고용보험: '',
        국민연금: '',
        건강보험: '',
        장기요양: '',
        공제합계: '',
        차감지급액: '',
        휴대전화: '',
        은행명: '',
        계좌번호: '',
        예금주: '',
      })
    })

    // 소계 행
    const sumRow1: any = {
      No: '',
      성명: '소계',
      주민번호: '',
      직종: '',
      팀명칭: '',
      주소: '',
      주작업: '',
      일당: '',
      ...Object.fromEntries(
        Array.from({ length: 16 }, (_, i) => [
          `${i + 1}`,
          rows.reduce((acc: any, r: any) => acc + (Number(r.days[i]) || 0), 0),
        ]),
      ),
      ...Object.fromEntries(Array.from({ length: 15 }, (_, i) => [`${i + 17}`, ''])),
      '총 공수': sum.totalWork,
      '총 일수': sum.totalDays,
      '노무비 총액': sum.totalLaborCost,
      소득세: sum.incomeTax,
      주민세: sum.residentTax,
      고용보험: sum.employmentInsurance,
      국민연금: sum.nationalPension,
      건강보험: sum.healthInsurance,
      장기요양: sum.longTermCare,
      공제합계: sum.deductionTotal,
      차감지급액: sum.payAfterDeduction,
      휴대전화: '',
      은행명: '',
      계좌번호: '',
      예금주: '',
    }

    const sumRow2: any = {
      No: '',
      성명: '',
      주민번호: '',
      직종: '',
      팀명칭: '',
      주소: '',
      주작업: '',
      일당: '',
      ...Object.fromEntries(Array.from({ length: 16 }, (_, i) => [`${i + 1}`, ''])),
      ...Object.fromEntries(
        Array.from({ length: 15 }, (_, i) => [
          `${i + 17}`,
          rows.reduce((acc: any, r: any) => acc + (Number(r.days[i + 16]) || 0), 0),
        ]),
      ),
      '총 공수': '',
      '총 일수': '',
      '노무비 총액': '',
      소득세: '',
      주민세: '',
      고용보험: '',
      국민연금: '',
      건강보험: '',
      장기요양: '',
      공제합계: '',
      차감지급액: '',
      휴대전화: '',
      은행명: '',
      계좌번호: '',
      예금주: '',
    }

    excelData.push(sumRow1)
    excelData.push(sumRow2)

    const worksheet = XLSX.utils.json_to_sheet(excelData, { header: headers })
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, '노무비대장')

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' })
    saveAs(blob, '노무비명세서.xlsx')
  }

  const cellStyle = {
    border: '1px solid #9ca3af',
    padding: '4px 6px',
    whiteSpace: 'nowrap',
  }

  const headerStyle = {
    ...cellStyle,
    backgroundColor: '#f3f4f6',
    fontWeight: 'bold',
    textAlign: 'center' as const,
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
    <Paper sx={{ p: 2 }}>
      <div className="flex justify-end mb-2">
        <Button
          variant="contained"
          disabled={!hasExcelDownload}
          color="success"
          onClick={handleExcelDownload}
        >
          엑셀 다운로드
        </Button>
      </div>

      <TableContainer sx={{ overflowX: 'auto' }}>
        <Table sx={{ borderCollapse: 'collapse', minWidth: 2400 }}>
          <TableHead>
            <TableRow>
              {['No', '성명', '주민번호', '직종', '팀명칭', '주소', '주작업', '일당'].map((h) => (
                <TableCell key={h} rowSpan={2} sx={headerStyle}>
                  {h}
                </TableCell>
              ))}
              {Array.from({ length: 16 }, (_, i) => i + 1).map((d) => (
                <TableCell key={d} sx={headerStyle}>
                  {d}
                </TableCell>
              ))}
              {[
                '총 공수',
                '총 일수',
                '노무비 총액',
                '소득세',
                '주민세',
                '고용보험',
                '국민연금',
                '건강보험',
                '장기요양',
                '공제합계',
                '차감지급액',
                '휴대전화',
                '은행명',
                '계좌번호',
                '예금주',
              ].map((h) => (
                <TableCell key={h} rowSpan={2} sx={headerStyle}>
                  {h}
                </TableCell>
              ))}
            </TableRow>

            <TableRow>
              {Array.from({ length: 15 }, (_, i) => i + 17).map((d) => (
                <TableCell key={d} sx={headerStyle}>
                  {d}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {rows.map((r: any) => (
              <React.Fragment key={r.no}>
                {/* 첫 번째 행: 1~16일 */}
                <TableRow>
                  <TableCell align="center" rowSpan={2} sx={cellStyle}>
                    {r.no}
                  </TableCell>
                  <TableCell align="center" rowSpan={2} sx={cellStyle}>
                    {r.name}
                  </TableCell>
                  <TableCell align="center" rowSpan={2} sx={cellStyle}>
                    {r.id}
                  </TableCell>
                  <TableCell align="center" rowSpan={2} sx={cellStyle}>
                    {r.job}
                  </TableCell>
                  <TableCell align="center" rowSpan={2} sx={cellStyle}>
                    {r.team}
                  </TableCell>
                  <TableCell align="center" rowSpan={2} sx={cellStyle}>
                    {r.address}
                  </TableCell>
                  <TableCell align="center" rowSpan={2} sx={cellStyle}>
                    {r.mainWork}
                  </TableCell>
                  <TableCell align="right" rowSpan={2} sx={cellStyle}>
                    {formatNumber(r.salary)}
                  </TableCell>

                  {/* 날짜 1~16일 */}
                  {r.days.slice(0, 16).map((v: any, i: number) => (
                    <TableCell key={`day1-${i}`} align="center" sx={cellStyle}>
                      {v}
                    </TableCell>
                  ))}

                  {/* 총 공수, 총 일수 등 */}
                  <TableCell align="center" rowSpan={2} sx={cellStyle}>
                    {r.totalWork}
                  </TableCell>
                  <TableCell align="center" rowSpan={2} sx={cellStyle}>
                    {r.totalDays}
                  </TableCell>
                  <TableCell align="right" rowSpan={2} sx={cellStyle}>
                    {formatNumber(r.totalLaborCost)}
                  </TableCell>
                  <TableCell align="right" rowSpan={2} sx={cellStyle}>
                    {formatNumber(r.incomeTax)}
                  </TableCell>
                  <TableCell align="right" rowSpan={2} sx={cellStyle}>
                    {formatNumber(r.residentTax)}
                  </TableCell>
                  <TableCell align="right" rowSpan={2} sx={cellStyle}>
                    {formatNumber(r.employmentInsurance)}
                  </TableCell>
                  <TableCell align="right" rowSpan={2} sx={cellStyle}>
                    {formatNumber(r.nationalPension)}
                  </TableCell>
                  <TableCell align="right" rowSpan={2} sx={cellStyle}>
                    {formatNumber(r.healthInsurance)}
                  </TableCell>
                  <TableCell align="right" rowSpan={2} sx={cellStyle}>
                    {formatNumber(r.longTermCare)}
                  </TableCell>
                  <TableCell align="right" rowSpan={2} sx={cellStyle}>
                    {formatNumber(r.deductionTotal)}
                  </TableCell>
                  <TableCell align="right" rowSpan={2} sx={cellStyle}>
                    {formatNumber(r.payAfterDeduction)}
                  </TableCell>
                  <TableCell align="center" rowSpan={2} sx={cellStyle}>
                    {r.phone}
                  </TableCell>
                  <TableCell align="center" rowSpan={2} sx={cellStyle}>
                    {r.bank}
                  </TableCell>
                  <TableCell align="center" rowSpan={2} sx={cellStyle}>
                    {r.account}
                  </TableCell>
                  <TableCell align="center" rowSpan={2} sx={cellStyle}>
                    {r.accountName}
                  </TableCell>
                </TableRow>

                {/* 두 번째 행: 17~31일 */}
                <TableRow>
                  {r.days.slice(16, 31).map((v: any, i: number) => (
                    <TableCell key={`day2-${i}`} align="center" sx={cellStyle}>
                      {v}
                    </TableCell>
                  ))}
                </TableRow>
              </React.Fragment>
            ))}

            {/* ✅ 소계 행 */}
            <TableRow sx={{ backgroundColor: '#f9fafb', fontWeight: 'bold' }}>
              <TableCell align="center" colSpan={8} sx={cellStyle} rowSpan={2}>
                소계
              </TableCell>

              {/* 날짜 1~16일 합계 */}
              {Array.from({ length: 16 }, (_, i) => (
                <TableCell key={`sum-day1-${i}`} align="center" sx={cellStyle}>
                  {formatNumber(
                    rows.reduce((acc: any, r: any) => acc + (Number(r.days[i]) || 0), 0),
                  )}
                </TableCell>
              ))}

              {/* 총 공수, 총 일수 등 */}
              <TableCell align="center" rowSpan={2} sx={cellStyle}>
                {sum.totalWork}
              </TableCell>
              <TableCell align="center" rowSpan={2} sx={cellStyle}>
                {sum.totalDays}
              </TableCell>
              <TableCell align="right" rowSpan={2} sx={cellStyle}>
                {formatNumber(sum.totalLaborCost)}
              </TableCell>
              <TableCell align="right" rowSpan={2} sx={cellStyle}>
                {formatNumber(sum.incomeTax)}
              </TableCell>
              <TableCell align="right" rowSpan={2} sx={cellStyle}>
                {formatNumber(sum.residentTax)}
              </TableCell>
              <TableCell align="right" rowSpan={2} sx={cellStyle}>
                {formatNumber(sum.employmentInsurance)}
              </TableCell>
              <TableCell align="right" rowSpan={2} sx={cellStyle}>
                {formatNumber(sum.nationalPension)}
              </TableCell>
              <TableCell align="right" rowSpan={2} sx={cellStyle}>
                {formatNumber(sum.healthInsurance)}
              </TableCell>
              <TableCell align="right" rowSpan={2} sx={cellStyle}>
                {formatNumber(sum.longTermCare)}
              </TableCell>
              <TableCell align="right" rowSpan={2} sx={cellStyle}>
                {formatNumber(sum.deductionTotal)}
              </TableCell>
              <TableCell align="right" rowSpan={2} sx={cellStyle}>
                {formatNumber(sum.payAfterDeduction)}
              </TableCell>

              {/* 휴대전화~예금주 공백 */}
              <TableCell align="center" colSpan={4} rowSpan={2} sx={cellStyle}></TableCell>
            </TableRow>

            {/* 날짜 17~31일 합계 */}
            <TableRow sx={{ backgroundColor: '#f9fafb', fontWeight: 'bold' }}>
              {Array.from({ length: 15 }, (_, i) => (
                <TableCell key={`sum-day2-${i}`} align="center" sx={cellStyle}>
                  {formatNumber(
                    rows.reduce((acc: any, r: any) => acc + (Number(r.days[i + 16]) || 0), 0),
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  )
}
