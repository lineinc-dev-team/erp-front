/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import CommonSelect from '../common/Select'
import { useManagementSteelFormStore } from '@/stores/managementSteelStore'
import { useManagementSteel } from '@/hooks/useManagementSteel'
import { useEffect, useState } from 'react'
import useOutSourcingContract from '@/hooks/useOutSourcingContract'
import { SitesProcessNameScroll } from '@/services/managementCost/managementCostRegistrationService'
import { InfiniteScrollSelect } from '../common/InfiniteScrollSelect'
import { useDebouncedValue } from '@/hooks/useDebouncedEffect'

type Props = {
  open: boolean
  onClose: () => void
  title?: string
}

export default function SteelCreateModal({ open, onClose, title }: Props) {
  const { setField, form, reset } = useManagementSteelFormStore()

  const {
    // 공정명
    setProcessSearch,
    processOptions,
    processInfoFetchNextPage,
    processInfoHasNextPage,
    processInfoIsFetching,
    processInfoLoading,

    useSitePersonNameListInfiniteScroll,
  } = useOutSourcingContract()

  const { createSteelMutation } = useManagementSteel()

  useEffect(() => {
    if (createSteelMutation.isSuccess) {
      onClose()
    }
  }, [createSteelMutation.isSuccess, onClose])

  useEffect(() => {
    reset()
  }, [])

  const [isSiteFocused, setIsSiteFocused] = useState(false)

  const debouncedSiteKeyword = useDebouncedValue(form.siteName, 300)

  const {
    data: SiteNameData,
    fetchNextPage: SiteNameFetchNextPage,
    hasNextPage: SiteNameHasNextPage,
    isFetching: SiteNameIsFetching,
    isLoading: SiteNameIsLoading,
  } = useSitePersonNameListInfiniteScroll(debouncedSiteKeyword)

  const SiteRawList = SiteNameData?.pages.flatMap((page) => page.data.content) ?? []
  const siteList = Array.from(new Map(SiteRawList.map((user) => [user.name, user])).values())

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

        <div>
          <div className="grid grid-cols-2 mt-1 ">
            <div className="flex">
              <label className="w-36  text-[14px] flex items-center border border-gray-400  justify-center bg-gray-300  font-bold text-center">
                현장명 <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="border border-gray-400 w-full flex items-center">
                <InfiniteScrollSelect
                  disabled={false}
                  placeholder="현장명을 입력하세요"
                  keyword={form.siteName}
                  onChangeKeyword={(newKeyword) => {
                    setField('siteName', newKeyword)

                    // 현장명 지웠을 경우 공정명도 같이 초기화
                    if (newKeyword === '') {
                      setField('siteProcessName', '')
                      setField('siteProcessId', 0)
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
                    setField('siteId', selectedSite.id)
                    setField(
                      'siteName',
                      selectedSite.name + (selectedSite.deleted ? ' (삭제됨)' : ''),
                    )

                    if (selectedSite.deleted) {
                      setField('siteProcessName', '')
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
                        setField('siteProcessName', processes[0].name)
                        setField('siteProcessId', processes[0].id)
                      } else {
                        setField('siteProcessName', '')
                        setField('siteProcessId', 0)
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
                공정명 <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="border border-gray-400 px-2 p-2 w-full flex items-center">
                <CommonSelect
                  fullWidth
                  className="text-xl"
                  value={form.siteProcessId || 0}
                  onChange={(value) => {
                    const selectedProcess = processOptions.find((opt) => opt.name === value)
                    if (selectedProcess) {
                      setField('siteProcessId', selectedProcess.id)
                      setField('siteProcessName', selectedProcess.name)
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
              createSteelMutation.mutate(undefined, {})
            }}
          >
            등록
          </button>
        </div>
      </div>
    </div>
  )
}
