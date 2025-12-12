/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { Box, Typography, Paper, Select, MenuItem, FormControl, InputLabel } from '@mui/material'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from 'recharts'

import Grid from '@mui/material/Unstable_Grid2' // Grid2 사용
import { useQuery } from '@tanstack/react-query'
import { DashBoardDetailInfoService } from '@/services/dashBoard/dashBoardService'
import useDashBoard from '@/hooks/useDashBoard'
import { useFinalDashboardSearchStore } from '@/stores/dashboardStore'
import { useDebouncedValue } from '@/hooks/useDebouncedEffect'
import { useSearchParams } from 'next/navigation'
import { useEffect, useMemo } from 'react'

const formatMonth = (ym: string) => {
  const [year, month] = ym.split('-')
  return `${year}년 ${Number(month)}월`
}

export default function DashBoardDetailView({ isHeadOffice }: { isHeadOffice: boolean }) {
  const { search } = useFinalDashboardSearchStore()

  const params = useSearchParams()
  const siteName = params.get('siteName')
  const siteId = params.get('siteId')
  const siteProcessId = params.get('siteProcessId')

  useEffect(() => {
    if (siteName) {
      search.setField('siteName', siteName)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [siteName])

  const { NoHeadOfficeDashBoardListQuery } = useDashBoard()

  // 필요 시 검색 기능 추가를 위해 주석 처리
  // const { setSitesSearch, siteNameFetchNextPage, siteNamehasNextPage, siteNameFetching, siteNameLoading } = usePermission()

  const noHeadOfficeQuery = NoHeadOfficeDashBoardListQuery('')

  const debouncedSiteKeyword = useDebouncedValue(search.siteName, 300)

  const { data: SiteNameData } = NoHeadOfficeDashBoardListQuery(debouncedSiteKeyword)

  const SiteRawList = SiteNameData?.pages.flatMap((page) => page.data) ?? []

  const siteList = Array.from(new Map(SiteRawList.map((item) => [item.site.id, item])).values())

  const sitesOptions = useMemo(() => {
    const defaultOption = {
      id: '0',
      name: '선택',
      siteProcessId: '0',
      siteProcessName: '선택',
    }

    const options =
      noHeadOfficeQuery.data?.pages
        ?.flatMap((page) => page.data)
        .map((item) => ({
          id: item.site?.id,
          name: item.site?.name,
          siteProcessId: item.siteProcess.id,
          siteProcessName: item.siteProcess.name,
        })) || []

    return [defaultOption, ...options]
  }, [noHeadOfficeQuery.data])

  useEffect(() => {
    if (!isHeadOffice && siteList.length > 0 && !search.siteId) {
      const firstSite = siteList[0]

      search.setField('siteId', firstSite.site.id)
      search.setField('siteName', firstSite.site.name)
      search.setField('siteProcessId', firstSite.siteProcess.id)
      search.setField('siteProcessName', firstSite.siteProcess.name)
    }
  }, [isHeadOffice, siteList, search])

  const effectiveSiteId = search.siteId && search.siteId !== 0 ? search.siteId : siteId

  const effectiveSiteProcessId =
    search.siteProcessId && search.siteProcessId !== 0 ? search.siteProcessId : siteProcessId

  const DashBoardDetailListQuery = useQuery({
    queryKey: ['dashBoardDetailInfo', effectiveSiteId, effectiveSiteProcessId],
    queryFn: () =>
      DashBoardDetailInfoService({
        siteId: effectiveSiteId,
        siteProcessId: effectiveSiteProcessId,
      }),
    enabled: Boolean(effectiveSiteId && effectiveSiteProcessId),
  })

  const apiData = DashBoardDetailListQuery.data?.data ?? []

  // 차트 데이터 변환
  const chartData = apiData.map((d: any) => ({
    month: formatMonth(d.yearMonth),
    equipmentCost: d.equipmentCost,
    laborCost: d.laborCost,
    managementCost: d.managementCost,
    materialCost: d.materialCost,
    outsourcingCost: d.outsourcingCost,
  }))

  const totalManagement = apiData.reduce((a: number, b: any) => a + b.managementCost, 0)

  const totalEquipment = apiData.reduce((a: number, b: any) => a + b.equipmentCost, 0)
  const totalLabor = apiData.reduce((a: number, b: any) => a + b.laborCost, 0)
  const totalMaterial = apiData.reduce((a: number, b: any) => a + b.materialCost, 0)
  const totalOutsourcing = apiData.reduce((a: number, b: any) => a + b.outsourcingCost, 0)

  const totalCost = totalEquipment + totalLabor + totalManagement + totalMaterial + totalOutsourcing

  const siteItemName = apiData[0]?.site?.name
  return (
    <Paper sx={{ p: 3 }}>
      <div className="flex justify-between items-center mb-4">
        <Typography variant="h5">
          <div style={{ width: '340px' }}>
            <FormControl fullWidth>
              <InputLabel>현장 선택</InputLabel>
              <Select
                value={search.siteId || siteId || '0'}
                label="현장 선택"
                onChange={(event) => {
                  const selectedId = event.target.value
                  if (selectedId === '0') {
                    // '선택' 옵션 선택 시 초기화
                    search.setField('siteId', 0)
                    search.setField('siteName', '')
                    search.setField('siteProcessId', 0)
                    search.setField('siteProcessName', '')
                    return
                  }

                  // 선택된 사이트 정보 찾기 (siteList에서 찾아야 siteProcess 정보도 가져올 수 있음)
                  const selectedSiteData = sitesOptions.find(
                    (item) => item.id === Number(selectedId),
                  )

                  console.log('4424', selectedSiteData)
                  if (selectedSiteData) {
                    search.setField('siteId', selectedSiteData.id)
                    search.setField('siteName', selectedSiteData.name)
                    search.setField('siteProcessId', selectedSiteData.siteProcessId)
                    search.setField('siteProcessName', selectedSiteData.siteProcessName)
                  }
                }}
              >
                {sitesOptions.map((option) => (
                  <MenuItem key={option.id} value={option.id}>
                    {option.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>
        </Typography>

        <Typography variant="h6" color="textSecondary">
          데이터 기준일 :{' '}
          {(() => {
            const today = new Date()
            today.setDate(today.getDate() - 1)
            return today.toLocaleDateString()
          })()}
        </Typography>
      </div>

      <Box
        sx={{
          p: 3,
          borderRadius: 2,
          border: '1px solid #ddd',
          background: '#fafafa',
          mb: 4,
        }}
      >
        <Typography variant="h5" fontWeight="bold" mb={2}>
          {siteItemName} - 상세 분석
        </Typography>
        <Typography fontSize={20} fontWeight="bold" mb={2}>
          총 투입비: <span style={{ color: 'red' }}>{totalCost.toLocaleString()}원</span>
        </Typography>

        <Grid container>
          <Grid xs={6} md={1.4}>
            <Typography fontWeight="bold" color="#F2C94C">
              관리비: {totalManagement.toLocaleString()}원
            </Typography>
          </Grid>
          <Grid xs={6} md={1.4}>
            <Typography fontWeight="bold" color="#4DB6AC">
              노무비: {totalLabor.toLocaleString()}원
            </Typography>
          </Grid>
          <Grid xs={6} md={1.4}>
            <Typography fontWeight="bold" color="#F27970">
              외주비: {totalOutsourcing.toLocaleString()}원
            </Typography>
          </Grid>

          <Grid xs={6} md={1.4}>
            <Typography fontWeight="bold" color="#7CB86F">
              장비비: {totalEquipment.toLocaleString()}원
            </Typography>
          </Grid>
          <Grid xs={6} md={1.4}>
            <Typography fontWeight="bold" color="#6D8BFA">
              재료비: {totalMaterial.toLocaleString()}원
            </Typography>
          </Grid>
        </Grid>
      </Box>

      <Box sx={{ width: '100%', height: 500, minHeight: 400 }}>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />

              <XAxis
                dataKey="month"
                interval={0}
                angle={-45}
                textAnchor="end"
                height={80}
                fontSize={12}
                stroke="#666"
              />

              <YAxis
                fontSize={12}
                stroke="#666"
                tickFormatter={(value: number) => `${(value / 10000).toFixed(0)}만원`}
              />

              <Tooltip
                formatter={(value: number, name: string) => [`${value.toLocaleString()}원`, name]}
                labelStyle={{ color: '#333' }}
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                }}
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />

              <Line
                type="monotone"
                dataKey="equipmentCost"
                name="장비비"
                stroke="#7CB86F"
                strokeWidth={3}
                dot={{ fill: '#7CB86F', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#7CB86F', strokeWidth: 2 }}
              />
              <Line
                type="monotone"
                dataKey="laborCost"
                name="노무비"
                stroke="#4DB6AC"
                strokeWidth={3}
                dot={{ fill: '#4DB6AC', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#4DB6AC', strokeWidth: 2 }}
              />
              <Line
                type="monotone"
                dataKey="managementCost"
                name="관리비"
                stroke="#F2C94C"
                strokeWidth={3}
                dot={{ fill: '#F2C94C', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#F2C94C', strokeWidth: 2 }}
              />
              <Line
                type="monotone"
                dataKey="materialCost"
                name="재료비"
                stroke="#6D8BFA"
                strokeWidth={3}
                dot={{ fill: '#6D8BFA', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#6D8BFA', strokeWidth: 2 }}
              />
              <Line
                type="monotone"
                dataKey="outsourcingCost"
                name="외주비"
                stroke="#F27970"
                strokeWidth={3}
                dot={{ fill: '#F27970', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#F27970', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <div className="text-lg mb-2">데이터가 없습니다</div>
              <div className="text-sm">현장을 선택해주세요</div>
            </div>
          </div>
        )}
      </Box>
    </Paper>
  )
}
