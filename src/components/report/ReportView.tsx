/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useEffect, useMemo, useState } from 'react'
import { Checkbox, Paper } from '@mui/material'
import CommonButton from '../common/Button'
import CommonMonthPicker from '../common/MonthPicker'
import { useReportSearchStore } from '@/stores/reportStore'
import AddSiteModal from '../common/AddSiteModal'
import { Pie, PieChart, ResponsiveContainer, Cell, Tooltip } from 'recharts'
import { SiteIdInfoService } from '@/services/report/reportSearchService'
import { useSnackbarStore } from '@/stores/useSnackbarStore'

export default function ReportView({ isHeadOffice }: { isHeadOffice: boolean }) {
  type SelectedSite = { id: number | string; name: string }

  const { showSnackbar } = useSnackbarStore()

  const { search } = useReportSearchStore()
  const [openAddModal, setOpenAddModal] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  console.log('현재 본사 직원인가', isHeadOffice)

  const handleRemoveSite = (siteId: number | string) => {
    search.setField(
      'siteList',
      (search.siteList as SelectedSite[]).filter((x) => x.id !== siteId),
    )
  }

  const formatCurrency = (value: number) => value.toLocaleString('ko-KR')

  type CostDatum = { name: string; value: number; color: string }
  type CostChart = { title: string; total: number; data: CostDatum[] }
  type ApiMonthlyCost = {
    yearMonth: string
    materialCost: number
    laborCost: number
    managementCost: number
    equipmentCost: number
    outsourcingCost: number
    totalCost: number
  }
  type ApiSiteEntry = {
    site?: { id?: number; name?: string }
    monthlyCosts?: ApiMonthlyCost[]
  }

  type SimpleTooltipPayload = { name?: string; value?: number }
  type SimpleTooltipProps = { active?: boolean; payload?: ReadonlyArray<SimpleTooltipPayload> }
  const renderTooltip = ({ active, payload }: SimpleTooltipProps) => {
    if (active && payload && payload.length) {
      const { name, value } = payload[0] || {}
      return (
        <div className="rounded-md border border-gray-200 bg-white px-3 py-2 shadow-sm text-sm">
          <div className="font-semibold text-gray-800">{name}</div>
          <div className="text-gray-600">{formatCurrency(Number(value))} 원</div>
        </div>
      )
    }
    return null
  }

  const paletteSets = useMemo(
    () => ({
      total: ['#A784F7', '#8A6EEA', '#7A5FDB', '#6C52D0', '#5E45C4'],
      material: ['#28A745', '#60D18D', '#A8E6C5', '#7CD6A1', '#4ABB76'],
      labor: ['#E2B04A', '#F1C764', '#F8DFA6', '#EDB34F', '#DA9A35'],
      outsourcing: ['#E03A3A', '#EF6B6B', '#F8A4A4', '#F87C7C', '#C52C2C'],
      equipment: ['#1C7BF2', '#3C97FB', '#6AB1FF', '#5BA8FF', '#2C88FF'],
      management: ['#1F9D55', '#4BBE79', '#7DD7A4', '#9BE7BE', '#5ACB8B'],
    }),
    [],
  )

  const buildChartsFromResponse = (apiData: ApiSiteEntry[]): CostChart[] => {
    if (!apiData || apiData.length === 0) return []

    const charts: CostChart[] = [
      { title: '총 투입비', total: 0, data: [] },
      { title: '재료비', total: 0, data: [] },
      { title: '노무비', total: 0, data: [] },
      { title: '외주비', total: 0, data: [] },
      { title: '장비비', total: 0, data: [] },
      { title: '관리비', total: 0, data: [] },
    ]

    apiData.forEach((siteEntry: ApiSiteEntry, idx: number) => {
      const siteName = siteEntry.site?.name ?? `현장 ${idx + 1}`
      const monthly: ApiMonthlyCost[] = Array.isArray(siteEntry.monthlyCosts)
        ? siteEntry.monthlyCosts
        : []
      const sum = (key: keyof ApiMonthlyCost) =>
        monthly.reduce((acc: number, cur: ApiMonthlyCost) => acc + (Number(cur?.[key]) || 0), 0)

      const totals = {
        totalCost: sum('totalCost'),
        materialCost: sum('materialCost'),
        laborCost: sum('laborCost'),
        outsourcingCost: sum('outsourcingCost'),
        equipmentCost: sum('equipmentCost'),
        managementCost: sum('managementCost'),
      }

      charts[0].data.push({
        name: siteName,
        value: totals.totalCost,
        color: paletteSets.total[idx % paletteSets.total.length],
      })
      charts[1].data.push({
        name: siteName,
        value: totals.materialCost,
        color: paletteSets.material[idx % paletteSets.material.length],
      })
      charts[2].data.push({
        name: siteName,
        value: totals.laborCost,
        color: paletteSets.labor[idx % paletteSets.labor.length],
      })
      charts[3].data.push({
        name: siteName,
        value: totals.outsourcingCost,
        color: paletteSets.outsourcing[idx % paletteSets.outsourcing.length],
      })
      charts[4].data.push({
        name: siteName,
        value: totals.equipmentCost,
        color: paletteSets.equipment[idx % paletteSets.equipment.length],
      })
      charts[5].data.push({
        name: siteName,
        value: totals.managementCost,
        color: paletteSets.management[idx % paletteSets.management.length],
      })
    })

    charts.forEach((chart) => {
      chart.total = chart.data.reduce((acc, cur) => acc + (cur.value || 0), 0)
    })

    return charts
  }

  useEffect(() => {
    // 초기 로드 시 전체 기간 활성화, 차트는 목데이터 세팅
    if (!search.allPeriod) {
      search.setField('allPeriod', true)
    }
    search.setField('costCharts', [])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleChangeStartMonth = (date: Date | null) => {
    if (!date) {
      search.setField('startMonth', '')
      return
    }
    const formatted = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    search.setField('startMonth', formatted)
    if (search.allPeriod) search.setField('allPeriod', false)
  }

  const handleChangeEndMonth = (date: Date | null) => {
    if (!date) {
      search.setField('endMonth', '')
      return
    }
    const formatted = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    search.setField('endMonth', formatted)
    if (search.allPeriod) search.setField('allPeriod', false)
  }

  const handleToggleAllPeriod = (checked: boolean) => {
    search.setField('allPeriod', checked)
    if (checked) {
      // 전체 기간이면 날짜 초기화
      search.setField('startMonth', '')
      search.setField('endMonth', '')
    }
  }

  const handleSearch = async () => {
    if (search.siteList.length === 0) {
      showSnackbar('현장을 추가해주세요.', 'warning')
      return
    }
    console.log('search.siteList ', search.siteList)
    setIsLoading(true)
    try {
      const numericIds = (search.siteList as SelectedSite[])
        .map((site) => {
          const parsed = Number(site.id)
          if (Number.isFinite(parsed)) return parsed
          return null
        })
        .filter((v: number | null): v is number => v !== null)

      console.log('numericIdsnumericIds', numericIds)

      const siteIds =
        numericIds.length > 0
          ? numericIds
          : (search.siteList as SelectedSite[]).map((_, idx: number) => idx + 1)

      const startYearMonth = search.allPeriod
        ? undefined
        : (search.startMonth as string | undefined)
      const endYearMonth = search.allPeriod ? undefined : (search.endMonth as string | undefined)

      const res = await SiteIdInfoService({
        siteIds,
        startYearMonth,
        endYearMonth,
      })

      const apiData = res?.data ?? []
      const nextCharts = buildChartsFromResponse(apiData)
      search.setField('costCharts', nextCharts)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Paper
      sx={{
        p: 1,
        marginBottom: 20,
        background: '#f7f9fc',
        borderRadius: 2,
        '& .recharts-rectangle:focus': {
          outline: 'none',
        },
      }}
    >
      <div className="bg-white w-full rounded-xl shadow p-6">
        <h1 className="font-bold text-xl mb-4">현장 조회</h1>

        <div
          className="
      grid 
      grid-cols-1 
      lg:grid-cols-[1fr_auto_1fr] 
      gap-8
      items-start
      w-full
    "
        >
          {/* 좌측 - 선택된 현장 */}
          <div className="flex gap-6 w-full">
            <div className="border rounded-md bg-gray-50 p-3 min-h-[80px] w-full">
              <div className="flex flex-wrap gap-2">
                {(search.siteList as SelectedSite[]).map((site) => (
                  <div
                    key={site.id}
                    className="flex items-center gap-1 bg-white border rounded-full px-3 py-1 shadow-sm text-sm"
                  >
                    {site.name}
                    <button
                      className=" text-red-600 hover:text-red-800 cursor-pointer"
                      onClick={() => handleRemoveSite(site.id)}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* 현장 추가 / 비우기 버튼 */}
            <div className="flex flex-col justify-start items-end gap-2">
              <CommonButton
                label="현장 추가"
                variant="search"
                className="px-10 whitespace-nowrap"
                onClick={() => setOpenAddModal(true)}
              />

              <AddSiteModal
                open={openAddModal}
                onClose={() => setOpenAddModal(false)}
                onSelectSites={(sites) => search.setField('siteList', sites)}
                initialSelectedSites={search.siteList as { id: number | string; name: string }[]}
              />

              <CommonButton
                label="비우기"
                variant="reset"
                className="px-10 w-full whitespace-nowrap"
                onClick={() => search.setField('siteList', [])}
              />
            </div>
          </div>

          {/* 구분선 (큰 화면에서만 보이게) */}
          <div className="hidden lg:block border-r-2 border-black-300 h-36 mx-auto" />

          {/* 우측 - 기간 선택 */}
          <div className="flex flex-col gap-3 w-full">
            <div className="flex flex-wrap items-center gap-3">
              {/* 연월 */}
              <div className="flex flex-col gap-1 text-sm">
                <label>연월</label>
                <CommonMonthPicker
                  value={search.startMonth ? new Date(search.startMonth + '-01') : null}
                  onChange={(date) => handleChangeStartMonth(date)}
                />
              </div>

              <div className="flex items-center justify-center mt-[20px] px-2">
                <span className="text-gray-500 text-lg">~</span>
              </div>

              <div className="flex flex-col gap-1 text-sm">
                <label>연월</label>
                <CommonMonthPicker
                  value={search.endMonth ? new Date(search.endMonth + '-01') : null}
                  onChange={(date) => handleChangeEndMonth(date)}
                />
              </div>

              {/* 전체 기간 */}
              <div className="flex flex-col gap-1 text-sm">
                <label className="invisible">전체 기간</label>
                <div className="flex items-center">
                  <Checkbox
                    checked={search.allPeriod}
                    onChange={(e) => handleToggleAllPeriod(e.target.checked)}
                  />
                  <span className="text-sm">전체 기간</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-center mt-10 gap-4">
          <CommonButton
            label="초기화"
            variant="search"
            className="px-10 whitespace-nowrap"
            onClick={() => search.reset()}
          />
          <CommonButton
            label="조회"
            variant="reset"
            className="px-10  whitespace-nowrap"
            onClick={handleSearch}
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="bg-white w-full rounded-xl shadow p-6 mt-8">
        <h1 className="font-bold text-xl mb-6">항목별 비용</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {search.costCharts.map((chart: any) => (
            <div
              key={chart.title}
              className="flex flex-col sm:flex-row items-center sm:items-start gap-4 border border-gray-200 rounded-lg p-4"
            >
              <div className="w-[180px] h-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip
                      content={(props) => renderTooltip(props as SimpleTooltipProps)}
                      wrapperStyle={{ outline: 'none' }}
                    />
                    <Pie
                      data={chart.data}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={2}
                    >
                      {chart.data.map((entry: any) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="flex-1">
                <div className="text-lg font-semibold mb-2">{chart.title}</div>
                <div className="text-2xl font-bold mb-4">{formatCurrency(chart.total)} 원</div>
                <ul className="text-sm space-y-1">
                  {chart.data.map((item: any) => (
                    <li key={item.name} className="flex items-center gap-2 whitespace-nowrap">
                      <span
                        className="inline-block w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span>{item.name}</span>
                      <span className="text-gray-600">{formatCurrency(item.value)} 원</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white w-full rounded-xl shadow p-6 mt-8">
        <h1 className="font-bold text-xl mb-4">투입비 발생 추이</h1>
        <p className="text-sm text-gray-600">차트 데이터가 준비되면 이 영역에 표시됩니다.</p>
      </div>
    </Paper>
  )
}
