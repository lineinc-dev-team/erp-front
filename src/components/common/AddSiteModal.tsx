'use client'

import { useState, useMemo, useEffect } from 'react'
import SiteDateListModal from './siteDateListModal'
import useSite from '@/hooks/useSite'
import useOutSourcingContract from '@/hooks/useOutSourcingContract'

export default function AddSiteModal({
  open,
  onClose,
  onSelectSites,
  initialSelectedSites = [],
}: {
  open: boolean
  onClose: () => void
  onSelectSites: (sites: string[]) => void
  initialSelectedSites?: string[]
}) {
  // 카테고리 키(순서 고정)
  const categoryList = ['지역별', '발주처별', '연도별']

  const { useOrderingNameListByReport, useRegionListByReport } = useSite()
  const { useSiteNameByReportScorll } = useOutSourcingContract()

  const [selectedCategory, setSelectedCategory] = useState<string>(categoryList[0])
  const [selectedSites, setSelectedSites] = useState<string[]>([])
  const [selectedCategoryItems, setSelectedCategoryItems] = useState<string[]>([])
  const [warningMessage, setWarningMessage] = useState<string>('')

  const [keyword] = useState('')
  const [siteKeyword, setSiteKeyword] = useState('')

  // 모달이 열릴 때 선택된 현장 초기화
  useEffect(() => {
    if (open) {
      setSelectedSites([...initialSelectedSites])
    }
  }, [open, initialSelectedSites])

  // 선택된 카테고리별 항목을 API 파라미터로 변환
  const getSiteFilterParams = () => {
    const params: {
      keyword?: string
      clientCompanyId?: number | null
      year?: number | null
      region?: string | null
    } = {
      keyword: siteKeyword || undefined,
    }

    // 발주처별 선택 시
    if (selectedCategory === '발주처별' && selectedCategoryItems.length > 0) {
      // 선택된 발주처명을 ID로 변환 (실제로는 orderingNames에서 찾아야 함)
      const selectedOrdering = orderingNames.find(
        (item: { id: string | number; name: string }) => item.name === selectedCategoryItems[0],
      )
      if (selectedOrdering) {
        params.clientCompanyId = selectedOrdering.id as number
      }
    }

    // 연도별 선택 시
    if (selectedCategory === '연도별' && selectedCategoryItems.length > 0) {
      params.year = parseInt(selectedCategoryItems[0])
    }

    // 지역별 선택 시
    if (selectedCategory === '지역별' && selectedCategoryItems.length > 0) {
      params.region = selectedCategoryItems[0]
    }

    return params
  }
  // "발주처별" 선택 시에만 API 호출
  const { data, fetchNextPage, hasNextPage, isFetching, isLoading } = useOrderingNameListByReport(
    keyword,
    {
      enabled: selectedCategory === '발주처별',
    },
  )
  // 발주처 배열로 정리 (id와 name)
  const orderingNames = useMemo(() => {
    if (!data) return []
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return data.pages.flatMap((page: any) =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      page.data.content.filter((item: any) => !item.deleted).map((item: any) => item),
    )
  }, [data])

  const { data: regionList } = useRegionListByReport(keyword, {
    enabled: selectedCategory === '지역별',
  })

  // API에서 받은 지역 이름 배열
  const regionNames = useMemo(() => {
    if (!regionList) return []
    // API 결과 구조에 맞게 map
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return regionList.pages.flatMap((page: any) => page.data.map((item: any) => item))
  }, [regionList])

  // 카테고리별 항목(목데이터)
  const categoryMap: Record<string, string[]> = useMemo(
    () => ({
      지역별: regionNames,
      발주처별: orderingNames,
      연도별: [
        '2020',
        '2021',
        '2022',
        '2023',
        '2024',
        '2025',
        '2026',
        '2027',
        '2028',
        '2029',
        '2030',
        '2031',
        '2032',
        '2033',
        '2034',
        '2035',
        '2036',
        '2037',
        '2038',
        '2039',
        '2040',
        '2041',
        '2042',
        '2043',
        '2044',
        '2045',
        '2046',
        '2047',
        '2048',
        '2049',
        '2050',
      ],
    }),
    [orderingNames, regionNames],
  )

  // 현장 목록 API 호출
  const siteFilterParams = getSiteFilterParams()
  const {
    data: siteData,
    fetchNextPage: fetchSiteNextPage,
    hasNextPage: hasSiteNextPage,
    isFetching: isSiteFetching,
    isLoading: isSiteLoading,
  } = useSiteNameByReportScorll(siteFilterParams)

  // 현장 목록 가공
  const siteList = useMemo(() => {
    if (!siteData) return []
    return siteData.pages.flatMap(
      (page: { data: { content?: { id: string | number; name: string }[] } }) =>
        page.data.content?.map((site: { id: string | number; name: string }) => ({
          id: site.id,
          name: site.name,
        })) || [],
    )
  }, [siteData])

  const handleSelectSite = (site: string) => {
    if (selectedSites.includes(site)) return
    if (selectedSites.length >= 5) {
      setWarningMessage('최대 5개의 현장까지 선택 가능합니다.')
      setTimeout(() => setWarningMessage(''), 3000) // 3초 후 메시지 사라짐
      return
    }
    setSelectedSites((prev) => [...prev, site])
    setWarningMessage('') // 성공적으로 추가되면 경고 메시지 제거
  }

  const handleRemove = (site: string) => setSelectedSites((prev) => prev.filter((x) => x !== site))

  const handleSelectCategoryItem = (item: string) => {
    setSelectedCategoryItems((prev) => {
      if (prev.includes(item)) {
        return [] // 선택 해제 시 빈 배열로 설정
      } else {
        return [item] // 새로운 항목 선택 시 해당 항목만 선택
      }
    })
  }

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
    setSelectedCategoryItems([]) // 카테고리 변경 시 선택된 항목 초기화
  }

  const handleSubmit = () => {
    onSelectSites(selectedSites)
    onClose()
  }

  return (
    <SiteDateListModal open={open} onClose={onClose} title="조회 현장 추가">
      <div className="flex gap-6">
        {/* ====== 분류 (왼쪽 컬럼: 카테고리 목록 + 해당 항목) ====== */}

        <div className="w-[574px]  bg-white  rounded-xl p-4 shadow-xl  flex-col">
          <h2 className="text-[20px] font-bold mb-2">분류</h2>

          {/* 카테고리 리스트 (왼쪽 세로) */}
          <div className="flex">
            <div className="w-[260px]   border-gray-400   border rounded">
              <div className="flex flex-col">
                {categoryList.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => handleCategoryChange(cat)}
                    className={`px-3 py-2 border-b border-gray-400 text-[16px] hover:bg-gray-100 cursor-pointer
                    odd:bg-[#E5F3FF] even:bg-[#F9FCFF]
                    flex justify-center items-center text-center
                    ${selectedCategory === cat ? 'bg-blue-200 font-bold' : ''}
                `}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* 선택된 카테고리의 항목 (오른쪽) */}
            <div className="w-[236px] ">
              <div
                className="h-[360px]  border-gray-400   border  overflow-y-auto"
                onScroll={(e) => {
                  // 발주처별일 때만 무한 스크롤 적용
                  if (selectedCategory === '발주처별') {
                    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget
                    if (
                      scrollTop + clientHeight >= scrollHeight - 10 &&
                      hasNextPage &&
                      !isFetching
                    ) {
                      fetchNextPage()
                    }
                  }
                }}
              >
                {selectedCategory === '발주처별' ? (
                  <>
                    {orderingNames.map((item: { id: string | number; name: string }) => (
                      <div
                        key={item.id}
                        onClick={() => handleSelectCategoryItem(item.name)}
                        className={`px-3 py-2 border-b border-gray-400 cursor-pointer flex justify-between items-center hover:bg-gray-100
                        ${
                          selectedCategoryItems.includes(item.name)
                            ? 'bg-blue-100 border-blue-300'
                            : ''
                        }`}
                      >
                        <span>{item.name}</span>
                        {selectedCategoryItems.includes(item.name) && (
                          <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs">✓</span>
                          </div>
                        )}
                      </div>
                    ))}
                    {(isLoading || isFetching) && (
                      <div className="text-center text-sm py-2">불러오는 중...</div>
                    )}
                  </>
                ) : selectedCategory === '지역별' ? (
                  regionNames.map((item: string) => (
                    <div
                      key={item}
                      onClick={() => handleSelectCategoryItem(item)}
                      className={`px-3 py-2 border-b border-gray-400 cursor-pointer flex justify-between items-center hover:bg-gray-100
                      ${selectedCategoryItems.includes(item) ? 'bg-blue-100 border-blue-300' : ''}`}
                    >
                      <span>{item}</span>
                      {selectedCategoryItems.includes(item) && (
                        <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  // 연도별
                  categoryMap[selectedCategory]?.map((item: string) => (
                    <div
                      key={item}
                      onClick={() => handleSelectCategoryItem(item)}
                      className={`px-3 py-2 border-b border-gray-400 cursor-pointer flex justify-between items-center hover:bg-gray-100
                      ${selectedCategoryItems.includes(item) ? 'bg-blue-100 border-blue-300' : ''}`}
                    >
                      <span>{item}</span>
                      {selectedCategoryItems.includes(item) && (
                        <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="w-[456px] bg-white  rounded-xl p-4 shadow-xl">
          <div className="w-full flex justify-between items-center">
            <h2 className="text-[20px] font-bold mb-2">현장 목록</h2>
            <span className="text-xs text-gray-500">(최대 5개의 현장까지 선택 가능합니다.)</span>
          </div>

          {/* 경고 메시지 표시 */}
          {warningMessage && (
            <div className="mb-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-800">
              {warningMessage}
            </div>
          )}

          {/* 선택된 카테고리별 항목 표시 */}
          {selectedCategoryItems.length > 0 && (
            <div className="mb-3 p-2 bg-blue-50 rounded border border-blue-200">
              <div className="text-sm font-medium text-blue-800 mb-1">
                선택된 {selectedCategory.slice(0, -1)}: {selectedCategoryItems.length}개
              </div>
              <div className="flex flex-wrap gap-1">
                {selectedCategoryItems.map((item) => (
                  <span
                    key={item}
                    className="inline-flex items-center px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
                  >
                    {item}
                    <button
                      onClick={() => handleSelectCategoryItem(item)}
                      className="ml-1 text-red-600 hover:text-red-800 cursor-pointer"
                      type="button"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          <input
            placeholder="현장명 검색"
            value={siteKeyword}
            onChange={(e) => setSiteKeyword(e.target.value)}
            className=" border-gray-400 border  w-full px-3 py-2 rounded mb-3 text-sm"
          />

          <div
            className="h-[360px] bg-[#F9FCFF]  overflow-y-auto  border-gray-400 border rounded"
            onScroll={(e) => {
              const { scrollTop, scrollHeight, clientHeight } = e.currentTarget
              if (
                scrollTop + clientHeight >= scrollHeight - 10 &&
                hasSiteNextPage &&
                !isSiteFetching
              ) {
                fetchSiteNextPage()
              }
            }}
          >
            {/* 현장 리스트 표시 */}
            {siteList.length === 0 && !isSiteLoading ? (
              <div className="text-sm text-gray-500 p-4 text-center">
                {selectedCategoryItems.length === 0
                  ? `${selectedCategory}에서 항목을 선택해주세요.`
                  : '검색 결과가 없습니다.'}
              </div>
            ) : (
              <>
                {siteList.map((site) => (
                  <div
                    key={site.id}
                    className={`px-3 py-2 border-b  border-gray-400   text-[16px] hover:bg-gray-100 cursor-pointer flex justify-between items-center
                           odd:bg-[#E5F3FF] even:bg-[#F9FCFF]`}
                    onClick={() => handleSelectSite(site.name)}
                  >
                    <span>{site.name}</span>
                  </div>
                ))}
                {(isSiteLoading || isSiteFetching) && (
                  <div className="text-center text-sm py-2">불러오는 중...</div>
                )}
              </>
            )}
          </div>
        </div>

        <div className="w-[470px] bg-[#ffffff] rounded-xl p-4 shadow-xl">
          <h2 className="text-[20px] font-bold mb-2">
            선택 현장 목록
            <span className="text-xs text-gray-500 ml-1">
              (최대 5개의 현장까지 선택 가능합니다.)
            </span>
          </h2>

          <div className="border  border-gray-400  bg-[#F9FCFF]  rounded p-3 h-[360px] overflow-y-auto">
            {selectedSites.length === 0 && (
              <div className="text-sm  text-gray-400">선택된 현장이 없습니다.</div>
            )}
            {selectedSites.map((site) => (
              <div
                key={site}
                className="flex items-center gap-2 b bg-white border px-3 py-1 rounded-[10px] text-sm w-fit mb-2"
              >
                {site}
                <button
                  className=" text-red-600 hover:text-red-800 cursor-pointer"
                  onClick={() => handleRemove(site)}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          <div className="mt-[17px] flex justify-end">
            <button
              onClick={() => setSelectedSites([])}
              className="border px-4 py-1 rounded text-sm"
            >
              비우기
            </button>
          </div>
        </div>
      </div>

      {/* ====== Footer (buttons) ====== */}
      <div className="flex justify-center gap-6 mt-8">
        <button className="border px-6 py-2 rounded text-sm" onClick={onClose}>
          취소
        </button>

        <button
          className="border px-6 py-2 rounded text-sm bg-blue-50 hover:bg-blue-100"
          onClick={handleSubmit}
        >
          선택완료
        </button>
      </div>
    </SiteDateListModal>
  )
}
