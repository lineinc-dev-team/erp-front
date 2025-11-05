/* eslint-disable @typescript-eslint/no-explicit-any */
// CreateModal.tsx
'use client'

import React, { useEffect } from 'react'
import CommonSelect from '../common/Select'
import CommonDatePicker from '../common/DatePicker'
import { useDailyFormStore, useDailySearchList } from '@/stores/dailyReportStore'
import { useFuelAggregation } from '@/hooks/useFuelAggregation'
import { SitesProcessNameScroll } from '@/services/managementCost/managementCostRegistrationService'
import useOutSourcingContract from '@/hooks/useOutSourcingContract'
import { useDailyReport } from '@/hooks/useDailyReport'

type Props = {
  open: boolean
  onClose: () => void
  title?: string
}

export default function CreateModal({ open, onClose, title }: Props) {
  const { form, setField } = useDailyFormStore()
  const { WeatherTypeMethodOptions } = useFuelAggregation()
  const {
    sitesOptions,
    siteNameFetchNextPage,
    siteNamehasNextPage,
    siteNameFetching,
    siteNameLoading,
    processOptions,
    processInfoFetchNextPage,
    processInfoHasNextPage,
    processInfoIsFetching,
    processInfoLoading,
  } = useOutSourcingContract()

  const { createDailyMutation } = useDailyReport()

  const { search } = useDailySearchList()

  useEffect(() => {
    if (createDailyMutation.isSuccess) {
      onClose()
    }
  }, [createDailyMutation.isSuccess, onClose, search])

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/5 backdrop-blur-[1px] flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-[90%] max-w-6xl p-6 border border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">{title ?? '출역일보 등록'}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-black text-xl font-bold">
            ✕
          </button>
        </div>

        <div className="flex flex-wrap gap-6">
          {/* 현장명 */}
          <div className="flex w-[48%]">
            <label className="w-36 text-[14px] flex items-center justify-center bg-gray-300 border border-gray-400 font-bold">
              현장명 <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="border border-gray-400 px-2 p-2 w-full flex items-center">
              <CommonSelect
                fullWidth
                value={form.siteId || 0}
                onChange={async (value) => {
                  const selectedSite = sitesOptions.find((opt: any) => opt.id === value)
                  if (!selectedSite) return

                  setField('siteId', selectedSite.id)

                  const res = await SitesProcessNameScroll({
                    pageParam: 0,
                    siteId: selectedSite.id,
                    keyword: '',
                  })

                  const processes = res.data?.content || []
                  setField('siteProcessId', processes[0]?.id ?? 0)
                }}
                options={sitesOptions}
                onScrollToBottom={() => {
                  if (siteNamehasNextPage && !siteNameFetching) siteNameFetchNextPage()
                }}
                loading={siteNameLoading}
              />
            </div>
          </div>

          {/* 공정명 */}
          <div className="flex w-[48%]">
            <label className="w-36 text-[14px] flex items-center justify-center bg-gray-300 border border-gray-400 font-bold">
              공정명 <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="border border-gray-400 px-2 p-2 w-full flex items-center">
              <CommonSelect
                fullWidth
                value={form.siteProcessId || 0}
                onChange={(value) => {
                  const selectedProcess = processOptions.find((opt: any) => opt.name === value)
                  if (selectedProcess) setField('siteProcessId', selectedProcess.id)
                }}
                options={processOptions}
                displayLabel
                onScrollToBottom={() => {
                  if (processInfoHasNextPage && !processInfoIsFetching) processInfoFetchNextPage()
                }}
                loading={processInfoLoading}
                disabled
              />
            </div>
          </div>

          {/* 일자 */}
          <div className="flex w-[48%]">
            <label className="w-36 text-[14px] flex items-center justify-center bg-gray-300 border border-gray-400 font-bold">
              일자 <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="border border-gray-400 px-2 p-2 w-full flex items-center">
              <CommonDatePicker
                value={form.reportDate || null}
                onChange={(value) => setField('reportDate', value)}
              />
            </div>
          </div>

          {/* 날씨 */}
          <div className="flex w-[48%]">
            <label className="w-36 text-[14px] flex items-center justify-center bg-gray-300 border border-gray-400 font-bold">
              날씨 <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="border border-gray-400 px-2 p-2 w-full flex items-center">
              <CommonSelect
                fullWidth
                value={form.weather || 'BASE'}
                onChange={(value) => setField('weather', value)}
                options={WeatherTypeMethodOptions}
              />
            </div>
          </div>
        </div>

        {/* 하단 버튼 */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-400 rounded-md hover:bg-gray-100"
          >
            닫기
          </button>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            onClick={() => {
              createDailyMutation.mutate(undefined, {})
            }}
          >
            등록
          </button>
        </div>
      </div>
    </div>
  )
}
