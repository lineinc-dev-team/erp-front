'use client'

import { useState } from 'react'
import { Checkbox, Paper } from '@mui/material'
import CommonButton from '../common/Button'
import CommonMonthPicker from '../common/MonthPicker'
import { useReportSearchStore } from '@/stores/reportStore'
import AddSiteModal from '../common/AddSiteModal'

export default function ReportView({ isHeadOffice }: { isHeadOffice: boolean }) {
  const { search } = useReportSearchStore()
  const [openAddModal, setOpenAddModal] = useState(false)

  console.log('현재 본사 직원인가', isHeadOffice)

  const handleRemoveSite = (name: string) => {
    search.setField(
      'siteList',
      search.siteList.filter((x: string) => x !== name),
    )
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
                {search.siteList.map((site: string) => (
                  <div
                    key={site}
                    className="flex items-center gap-1 bg-white border rounded-full px-3 py-1 shadow-sm text-sm"
                  >
                    {site}
                    <button
                      className=" text-red-600 hover:text-red-800 cursor-pointer"
                      onClick={() => handleRemoveSite(site)}
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
                initialSelectedSites={search.siteList}
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
                  onChange={(date) => {
                    if (!date) {
                      search.setField('startMonth', '')
                      return
                    }
                    const formatted = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
                      2,
                      '0',
                    )}`
                    search.setField('startMonth', formatted)
                  }}
                />
              </div>

              <div className="flex items-center justify-center mt-[20px] px-2">
                <span className="text-gray-500 text-lg">~</span>
              </div>

              <div className="flex flex-col gap-1 text-sm">
                <label>연월</label>
                <CommonMonthPicker
                  value={search.endMonth ? new Date(search.endMonth + '-01') : null}
                  onChange={(date) => {
                    if (!date) {
                      search.setField('endMonth', '')
                      return
                    }
                    const formatted = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
                      2,
                      '0',
                    )}`
                    search.setField('endMonth', formatted)
                  }}
                />
              </div>

              {/* 전체 기간 */}
              <div className="flex flex-col gap-1 text-sm">
                <label className="invisible">전체 기간</label>
                <div className="flex items-center">
                  <Checkbox
                    checked={search.allPeriod}
                    onChange={(e) => search.setField('allPeriod', e.target.checked)}
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
            onClick={() => search.handleSearch()}
          />
        </div>
      </div>
    </Paper>
  )
}
