/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { Box, Typography, Paper } from '@mui/material'
import {
  LineChart,
  Line,
  XAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from 'recharts'

import Grid from '@mui/material/Unstable_Grid2' // Grid2 사용
import { useQuery } from '@tanstack/react-query'
import { DashBoardDetailInfoService } from '@/services/dashBoard/dashBoardService'
import { useSearchParams } from 'next/navigation'
import useDashBoard from '@/hooks/useDashBoard'
import { InfiniteScrollSelect } from '../common/InfiniteScrollSelect'
import { useFinalDashboardSearchStore } from '@/stores/dashboardStore'
import { useDebouncedValue } from '@/hooks/useDebouncedEffect'
import { useEffect, useState } from 'react'

const formatMonth = (ym: string) => {
  const [year, month] = ym.split('-')
  return `${year}년 ${Number(month)}월`
}

export default function DashBoardDetailView({ isHeadOffice }: { isHeadOffice: boolean }) {
  const { search } = useFinalDashboardSearchStore()

  const { NoHeadOfficeDashBoardListQuery } = useDashBoard()

  const params = useSearchParams()
  const siteName = params.get('siteName')

  useEffect(() => {
    if (siteName) {
      search.setField('siteName', siteName)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [siteName])

  const [isSiteFocused, setIsSiteFocused] = useState(false)

  const debouncedSiteKeyword = useDebouncedValue(search.siteName, 300)

  const {
    data: SiteNameData,
    fetchNextPage: SiteNameFetchNextPage,
    hasNextPage: SiteNameHasNextPage,
    isFetching: SiteNameIsFetching,
    isLoading: SiteNameIsLoading,
  } = NoHeadOfficeDashBoardListQuery(debouncedSiteKeyword)

  const SiteRawList = SiteNameData?.pages.flatMap((page) => page.data) ?? []

  const siteList = Array.from(new Map(SiteRawList.map((item) => [item.site.id, item])).values())

  useEffect(() => {
    if (!isHeadOffice && siteList.length > 0 && !search.siteId) {
      const firstSite = siteList[0]

      search.setField('siteId', firstSite.site.id)
      search.setField('siteName', firstSite.site.name)
      search.setField('siteProcessId', firstSite.siteProcess.id)
      search.setField('siteProcessName', firstSite.siteProcess.name)
    }
  }, [isHeadOffice, siteList, search])

  const DashBoardDetailListQuery = useQuery({
    queryKey: ['dashBoardDetailInfo', search.siteId, search.siteProcessId],
    queryFn: () => {
      return DashBoardDetailInfoService({
        siteId: search.siteId,
        siteProcessId: search.siteProcessId,
      })
    },
    enabled: Boolean(search.siteId && search.siteProcessId),
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
            <InfiniteScrollSelect
              placeholder="현장명을 입력하세요"
              keyword={search.siteName || ''}
              onChangeKeyword={(newKeyword) => search.setField('siteName', newKeyword)}
              items={siteList}
              hasNextPage={SiteNameHasNextPage ?? false}
              fetchNextPage={SiteNameFetchNextPage}
              renderItem={(item, isHighlighted) => (
                <div className={isHighlighted ? 'font-bold text-white p-1 bg-gray-400' : ''}>
                  {item.site.name}
                </div>
              )}
              onSelect={(selectedItem) => {
                if (!selectedItem) return

                const { site, siteProcess } = selectedItem

                search.setField('siteId', site.id)
                search.setField('siteName', site.name)

                search.setField('siteProcessId', siteProcess.id)
                search.setField('siteProcessName', siteProcess.name)
              }}
              isLoading={SiteNameIsLoading || SiteNameIsFetching}
              debouncedKeyword={debouncedSiteKeyword}
              shouldShowList={isSiteFocused}
              onFocus={() => setIsSiteFocused(true)}
              onBlur={() => setIsSiteFocused(false)}
            />
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

      <Box sx={{ width: '100%', height: 500 }}>
        <ResponsiveContainer>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis
              dataKey="month"
              interval={0}
              padding={{ left: 50, right: 50 }} // 좌우 여백 추가
            />

            <Tooltip formatter={(v: number) => `${v.toLocaleString()}원`} />
            <Legend />

            <Line
              type="monotone"
              dataKey="equipmentCost"
              name="장비"
              stroke="#7CB86F"
              strokeWidth={3}
              dot
            />
            <Line
              type="monotone"
              dataKey="laborCost"
              name="노무"
              stroke="#4DB6AC"
              strokeWidth={3}
              dot
            />
            <Line
              type="monotone"
              dataKey="managementCost"
              name="관리"
              stroke="#F2C94C"
              strokeWidth={3}
              dot
            />
            <Line
              type="monotone"
              dataKey="materialCost"
              name="재료"
              stroke="#6D8BFA"
              strokeWidth={3}
              dot
            />
            <Line
              type="monotone"
              dataKey="outsourcingCost"
              name="외주"
              stroke="#F27970"
              strokeWidth={3}
              dot
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  )
}
