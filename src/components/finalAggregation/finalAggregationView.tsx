'use client'

import React, { useEffect, useState } from 'react'
import { Button } from '@mui/material'
import { useFinalAggregationSearchStore } from '@/stores/finalAggregationStore'
import { InfiniteScrollSelect } from '../common/InfiniteScrollSelect'
import { useDebouncedValue } from '@/hooks/useDebouncedEffect'
import useOutSourcingContract from '@/hooks/useOutSourcingContract'
import { SitesProcessNameScroll } from '@/services/managementCost/managementCostRegistrationService'
import CommonSelectByName from '../common/CommonSelectByName'
import CommonMonthPicker from '../common/MonthPicker'
import CommonButton from '../common/Button'
import AggregateMaterialView from '../aggregateMaterialView/aggregateMaterialView'
import AggregateOilCountView from '../aggregateOilCountView/aggregateOilCountView'
import AggregateLaborCostView from '../aggregateLaborCostView/aggregateLaborCostView'
import AggregateEquipmentCostView from '../aggregateEquipmentCostView/aggregateEquipmentCostView'
import AggregateEquipmentOperationStatusView from '../aggregateEquipmentOperationStatusView/aggregateEquipmentOperationStatusView'
import AggregateLaborPayRollView from '../aggregateLaborPayRollView/aggregateLaborPayRollView'
import AggregateManagementCostView from '../aggregateManagementCostView/aggregateManagementCostView'

const TAB_CONFIG = [
  { label: '재료비', value: 'MATERIAL' },
  { label: '유류집계', value: 'FUEL' },
  { label: '노무비', value: 'LABOR' },
  { label: '노무비명세서', value: 'LABOR_DETAIL' },
  { label: '장비비', value: 'EQUIPMENT' },
  { label: '장비가동현황', value: 'EQUIPMENT_OPERATION' },
  { label: '관리비', value: 'MANAGEMENT' },
  { label: '외주', value: 'OUTSOURCING' },
]

export default function FinalAggregationView() {
  const { search } = useFinalAggregationSearchStore()

  const {
    useSitePersonNameListInfiniteScroll,

    setProcessSearch,
    processOptions,
    processInfoFetchNextPage,
    processInfoHasNextPage,
    processInfoIsFetching,
    processInfoLoading,
  } = useOutSourcingContract()

  // 현장명 키워드 검색

  const [isSiteFocused, setIsSiteFocused] = useState(false)

  // 유저 선택 시 처리
  // const handleSelectSiting = (selectedUser: any) => {
  //   search.setField('name', selectedUser.name)
  // }

  const debouncedSiteKeyword = useDebouncedValue(search.siteName, 300)

  const {
    data: SiteNameData,
    fetchNextPage: SiteNameFetchNextPage,
    hasNextPage: SiteNameHasNextPage,
    isFetching: SiteNameIsFetching,
    isLoading: SiteNameIsLoading,
  } = useSitePersonNameListInfiniteScroll(debouncedSiteKeyword)

  const SiteRawList = SiteNameData?.pages.flatMap((page) => page.data.content) ?? []
  const siteList = Array.from(new Map(SiteRawList.map((user) => [user.name, user])).values())

  const [activeTab, setActiveTab] = useState<string>('MATERIAL')

  const handleTabClick = (value: string | undefined, label: string) => {
    if (activeTab === value) return // 같은 탭 클릭 시 무시

    setActiveTab(value || '')
    console.log(`${label} 탭으로 이동했습니다.`)
  }

  useEffect(() => {
    setActiveTab('MATERIAL') // 기본 탭 설정
  }, [])

  return (
    <>
      <div className="border-10 border-gray-400 p-4">
        <div className="grid grid-cols-3">
          <div className="flex">
            <label className="w-[144px] text-[14px] flex items-center border border-gray-400  justify-center bg-gray-300  font-bold text-center">
              현장명
            </label>
            <div className="border border-gray-400 w-full flex items-center">
              <InfiniteScrollSelect
                placeholder="현장명을 입력하세요"
                keyword={search.siteName}
                onChangeKeyword={(newKeyword) => {
                  search.setField('siteName', newKeyword)

                  // 현장명 지웠을 경우 공정명도 같이 초기화
                  if (newKeyword === '') {
                    search.setField('siteProcessName', '')
                  }
                }}
                items={siteList}
                hasNextPage={SiteNameHasNextPage ?? false}
                fetchNextPage={SiteNameFetchNextPage}
                renderItem={(item, isHighlighted) => (
                  <div className={isHighlighted ? 'font-bold text-white p-1  bg-gray-400' : ''}>
                    {item.name}
                  </div>
                )}
                // onSelect={handleSelectSiting}
                onSelect={async (selectedSite) => {
                  if (!selectedSite) return

                  // 선택된 현장 세팅
                  search.setField('siteId', selectedSite.id)
                  search.setField(
                    'siteName',
                    selectedSite.name + (selectedSite.deleted ? ' (삭제됨)' : ''),
                  )

                  if (selectedSite.deleted) {
                    search.setField('siteProcessName', '')
                    search.setField('siteProcessId', 0)

                    return
                  }

                  try {
                    // 공정 목록 조회
                    const res = await SitesProcessNameScroll({
                      pageParam: 0,
                      siteId: selectedSite.id,
                      keyword: '',
                    })

                    const processes = res.data?.content || []

                    if (processes.length > 0) {
                      // 첫 번째 공정 자동 세팅
                      search.setField('siteProcessName', processes[0].name)
                      search.setField('siteProcessId', processes[0].id)
                    } else {
                      search.setField('siteProcessName', '')
                      search.setField('siteProcessId', 0)
                    }
                  } catch (err) {
                    console.error('공정 조회 실패:', err)
                  }
                }}
                isLoading={SiteNameIsLoading || SiteNameIsFetching}
                debouncedKeyword={debouncedSiteKeyword}
                shouldShowList={isSiteFocused}
                onFocus={() => setIsSiteFocused(true)}
                onBlur={() => setIsSiteFocused(false)}
              />
            </div>
          </div>

          <div className="flex">
            <label className="w-36 text-[14px]  border border-gray-400  flex items-center justify-center bg-gray-300  font-bold text-center">
              공정명
            </label>
            <div className="border border-gray-400 px-2 p-2 w-full flex items-center">
              <CommonSelectByName
                fullWidth
                className="text-xl"
                value={search.siteProcessName || '선택'}
                onChange={(value) => {
                  const selectedProcess = processOptions.find((opt) => opt.name === value)
                  if (selectedProcess) {
                    // search.setField('processId', selectedProcess.id)
                    search.setField('siteProcessName', selectedProcess.name)
                  }
                }}
                options={processOptions}
                displayLabel
                onScrollToBottom={() => {
                  if (processInfoHasNextPage && !processInfoIsFetching) processInfoFetchNextPage()
                }}
                onInputChange={(value) => setProcessSearch(value)}
                loading={processInfoLoading}
                disabled
              />
            </div>
          </div>

          <div className="flex">
            <label className="w-36 text-[14px]  border border-gray-400  flex items-center justify-center bg-gray-300  font-bold text-center">
              조회월
            </label>
            <div className="border border-gray-400 px-2 w-full flex gap-3 items-center ">
              <CommonMonthPicker
                value={search.yearMonth ? new Date(search.yearMonth + '-01') : null}
                onChange={(date) => {
                  if (!date) {
                    search.setField('yearMonth', '')
                    return
                  }
                  const formatted = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
                    2,
                    '0',
                  )}`
                  search.setField('yearMonth', formatted)
                }}
              />
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center gap-6">
          <CommonButton
            label="초기화"
            variant="reset"
            onClick={search.reset}
            className="mt-3 px-20"
          />

          <CommonButton
            label="검색"
            variant="secondary"
            onClick={() => {
              search.handleSearch()
            }}
            className="mt-3 px-20"
          />
        </div>
      </div>

      <div className="flex border-b justify-between border-gray-400 mt-10 mb-4">
        <div>
          {TAB_CONFIG.map((tab) => {
            const isActive = activeTab === tab.value
            return (
              <Button
                key={tab.label}
                onClick={() => handleTabClick(tab.value, tab.label)}
                sx={{
                  borderRadius: '10px 10px 0 0',
                  borderBottom: '1px solid #161616',
                  backgroundColor: isActive ? '#ffffff' : '#e0e0e0',
                  color: isActive ? '#000000' : '#9e9e9e',
                  border: '1px solid #7a7a7a',
                  fontWeight: isActive ? 'bold' : 'normal',
                  padding: '6px 16px',
                  minWidth: '120px',
                  textTransform: 'none',
                }}
              >
                {tab.label}
              </Button>
            )
          })}
        </div>
      </div>

      {activeTab === 'MATERIAL' && <AggregateMaterialView />}
      {activeTab === 'FUEL' && <AggregateOilCountView fuelType={['DIESEL', 'GASOLINE', 'UREA']} />}
      {activeTab === 'LABOR' && <AggregateLaborCostView />}
      {activeTab === 'EQUIPMENT' && <AggregateEquipmentCostView />}
      {activeTab === 'EQUIPMENT_OPERATION' && <AggregateEquipmentOperationStatusView />}
      {activeTab === 'LABOR_DETAIL' && <AggregateLaborPayRollView />}
      {activeTab === 'MANAGEMENT' && <AggregateManagementCostView />}
    </>
  )
}
