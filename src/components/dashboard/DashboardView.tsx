/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { Box, Typography, Paper } from '@mui/material'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ResponsiveContainer,
  LabelList,
} from 'recharts'
import { useRouter } from 'next/navigation'
import useDashBoard from '@/hooks/useDashBoard'
import { useFinalDashboardSearchStore } from '@/stores/dashboardStore'

const CustomXAxisTick = (props: any) => {
  const { x, y, payload } = props
  const text = payload.value
  const maxCharPerLine = 6
  const lines: string[] = []

  for (let i = 0; i < text.length; i += maxCharPerLine) {
    lines.push(text.slice(i, i + maxCharPerLine))
  }

  const rotateAngle = text.length > maxCharPerLine ? -24 : 0

  return (
    <g transform={`translate(${x},${y + 15})`}>
      {lines.map((line, index) => (
        <text
          key={index}
          x={0}
          y={index * 18}
          textAnchor={rotateAngle ? 'end' : 'middle'}
          fill="#333"
          fontSize={16}
          fontWeight={500}
          transform={`rotate(${rotateAngle})`}
        >
          {line}
        </text>
      ))}
    </g>
  )
}

const ClickableCursor = (props: any) => {
  const { x, y, width, height, payload } = props
  const router = useRouter()
  const { search } = useFinalDashboardSearchStore()

  const handleClick = () => {
    if (!payload) return

    const { siteId, siteProcessId, siteName } = payload[0].payload

    search.setField('siteId', siteId)
    search.setField('siteProcessId', siteProcessId)
    search.setField('siteName', siteName)

    router.push(
      `/dashboard/${siteId}?siteId=${siteId}&siteProcessId=${siteProcessId}&siteName=${encodeURIComponent(
        siteName,
      )}`,
    )
  }

  return (
    <rect
      x={x}
      y={y}
      width={width}
      height={height}
      fill="rgba(200,200,200,0.3)"
      style={{ cursor: 'pointer' }}
      onClick={handleClick}
    />
  )
}

export default function ChartPage() {
  const router = useRouter()
  const { DashBoardListQuery } = useDashBoard()
  const { search } = useFinalDashboardSearchStore()

  const chartData = DashBoardListQuery?.data?.data.map((item: any) => ({
    name: item.site.name,
    material: item.materialCost,
    labor: item.laborCost,
    outsourcing: item.outsourcingCost,
    equipment: item.equipmentCost,
    management: item.managementCost,
    total: item.totalCost,
    siteId: item.site.id,
    siteName: item.site.name,
    siteProcessId: item.siteProcess.id,
  }))

  const handleBarClick = (e: any) => {
    if (!e || !e.payload) return
    const { siteId, siteProcessId, siteName } = e.payload
    search.setField('siteId', siteId)
    search.setField('siteProcessId', siteProcessId)
    search.setField('siteName', siteName)
    router.push(
      `/dashboard/${siteId}?siteId=${siteId}&siteProcessId=${siteProcessId}&siteName=${encodeURIComponent(
        siteName,
      )}`,
    )
  }

  return (
    <Paper
      sx={{
        p: 4,
        background: '#f7f9fc',
        borderRadius: 4,
        '& .recharts-rectangle:focus': {
          outline: 'none',
        },
      }}
    >
      <div className="flex justify-between items-center mb-4">
        <Typography variant="h5" fontWeight="bold">
          사업장 현황
        </Typography>

        <Typography variant="h6" color="textSecondary">
          {/* 데이터 기준일 :
          {DashboarDaysQuery?.data?.data?.lastExecutionTime
            ? new Date(DashboarDaysQuery.data.data.lastExecutionTime).toLocaleDateString()
            : ''} */}
          데이터 기준일 :{' '}
          {(() => {
            const today = new Date()
            today.setDate(today.getDate() - 1)
            return today.toLocaleDateString()
          })()}
        </Typography>
      </div>

      <Box sx={{ width: '1400px', height: 650, margin: '0 auto' }}>
        <ResponsiveContainer>
          <BarChart
            data={chartData}
            barSize={90}
            barCategoryGap="35%"
            margin={{ top: 40, right: 40, left: 20, bottom: 80 }}
          >
            <CartesianGrid stroke="#d5d5d5" vertical={false} strokeWidth={1.2} />

            <Legend
              verticalAlign="top"
              align="center"
              wrapperStyle={{ paddingBottom: 30, fontSize: 16, fontWeight: 600 }}
            />

            <XAxis dataKey="name" tick={<CustomXAxisTick />} interval={0} height={80} />

            <YAxis hide />

            <Tooltip
              formatter={(v: any) => v.toLocaleString() + '원'}
              cursor={<ClickableCursor />}
              contentStyle={{
                background: '#fff',
                borderRadius: 12,
                border: '1px solid #ccc',
                boxShadow: '0 3px 10px rgba(0,0,0,0.15)',
                fontSize: 16,
                padding: 12,
              }}
            />

            <Bar
              dataKey="material"
              stackId="cost"
              name="재료"
              fill="#6D8BFA"
              style={{ cursor: 'pointer' }}
              onClick={handleBarClick}
            />
            <Bar
              dataKey="labor"
              stackId="cost"
              name="노무"
              fill="#4DB6AC"
              style={{ cursor: 'pointer' }}
              onClick={handleBarClick}
            />
            <Bar
              dataKey="outsourcing"
              stackId="cost"
              name="외주"
              fill="#F27970"
              style={{ cursor: 'pointer' }}
              onClick={handleBarClick}
            />
            <Bar
              dataKey="equipment"
              stackId="cost"
              name="장비"
              fill="#7CB86F"
              style={{ cursor: 'pointer' }}
              onClick={handleBarClick}
            />
            <Bar
              dataKey="management"
              stackId="cost"
              name="관리"
              fill="#F2C94C"
              style={{ cursor: 'pointer' }}
              onClick={handleBarClick}
            >
              <LabelList
                dataKey="total"
                position="top"
                formatter={(v: any) => v.toLocaleString() + '원'}
                style={{ fontWeight: 'bold', fill: '#222', fontSize: 18 }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  )
}
