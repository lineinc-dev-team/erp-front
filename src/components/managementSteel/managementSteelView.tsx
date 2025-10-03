/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import CommonButton from '../common/Button'
import CommonSelect from '../common/Select'
import CommonDatePicker from '../common/DatePicker'
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import { Pagination } from '@mui/material'
import { useAccountStore } from '@/stores/accountManagementStore'
import { useRouter } from 'next/navigation'
import { LaborArrayStatusOptions, PageCount, SteelColumnList } from '@/config/erp.confing'
import { Fragment, useEffect, useState } from 'react'
import ExcelModal from '../common/ExcelModal'
import { SteelExcelFieldMap } from '@/utils/userExcelField'
import { useManagementSteel } from '@/hooks/useManagementSteel'
import { formatNumber, getTodayDateString } from '@/utils/formatters'
import { useSteelSearchStore } from '@/stores/managementSteelStore'
import {
  ManagementSteelService,
  SteelExcelDownload,
} from '@/services/managementSteel/managementSteelService'
import CommonSelectByName from '../common/CommonSelectByName'
import useOutSourcingContract from '@/hooks/useOutSourcingContract'
import { SitesProcessNameScroll } from '@/services/managementCost/managementCostRegistrationService'
import { useMenuPermission } from '../common/MenuPermissionView'
import { myInfoProps } from '@/types/user'
import { CustomNoRowsOverlay } from '../common/NoData'
import { useDebouncedValue } from '@/hooks/useDebouncedEffect'
import { InfiniteScrollSelect } from '../common/InfiniteScrollSelect'

export default function ManagementSteel() {
  const { handleNewSteelCreate } = ManagementSteelService()

  const { search } = useSteelSearchStore()

  const { SteelListQuery } = useManagementSteel()

  const {
    useSitePersonNameListInfiniteScroll,

    setProcessSearch,
    processOptions,
    processInfoFetchNextPage,
    processInfoHasNextPage,
    processInfoIsFetching,
    processInfoLoading,
  } = useOutSourcingContract()

  const SteelDataList = SteelListQuery.data?.data.content ?? []

  const totalList = SteelListQuery.data?.data.pageInfo.totalElements ?? 0
  const pageCount = Number(search.pageCount) || 10
  const totalPages = Math.ceil(totalList / pageCount)

  const updateSteelList = SteelDataList.flatMap((steel: any) => {
    return {
      id: steel.id, // 고유 ID
      siteName: steel.site.name,
      siteProcessName: steel.siteProcess.name,
      incomingOwnMaterial: `${formatNumber(steel.incomingOwnMaterialTotalWeight)} / ${formatNumber(
        steel.incomingOwnMaterialAmount,
      )}`,
      incomingPurchase: `${formatNumber(steel.incomingPurchaseTotalWeight)} / ${formatNumber(
        steel.incomingPurchaseAmount,
      )}`,
      incomingRental: `${formatNumber(steel.incomingRentalTotalWeight)} / ${formatNumber(
        steel.incomingRentalAmount,
      )}`,
      outgoingOwnMaterial: `${formatNumber(steel.outgoingOwnMaterialTotalWeight)} / ${formatNumber(
        steel.outgoingOwnMaterialAmount,
      )}`,
      outgoingPurchase: `${formatNumber(steel.outgoingPurchaseTotalWeight)} / ${formatNumber(
        steel.outgoingPurchaseAmount,
      )}`,
      outgoingRental: `${formatNumber(steel.outgoingRentalTotalWeight)} / ${formatNumber(
        steel.outgoingRentalAmount,
      )}`,
      onSiteStock: formatNumber(steel.onSiteStockTotalWeight),
      scrap: `${formatNumber(steel.scrapTotalWeight)} / ${formatNumber(steel.scrapAmount)}`,
      totalInvestmentAmount: formatNumber(steel.totalInvestmentAmount),
      onSiteRemainingWeight: formatNumber(steel.onSiteRemainingWeight),
      createdAt: getTodayDateString(steel.createdAt),
    }
  })

  const { setSelectedIds } = useAccountStore()

  const router = useRouter()

  // 그리도 라우팅 로직!
  const enhancedColumns = SteelColumnList.map((col): GridColDef => {
    if (col.field === 'siteProcessName') {
      return {
        ...col,
        headerAlign: 'center',
        align: 'center',
        flex: 1,
        renderCell: (params: GridRenderCellParams) => {
          const steelId = params.row.id

          const handleClick = () => {
            if (hasModify) {
              router.push(`/managementSteel/registration/${steelId}`)
            }
          }

          return (
            <div
              onClick={handleClick}
              className={`flex justify-center items-center ${
                hasModify
                  ? 'cursor-pointer text-orange-500 font-bold'
                  : 'cursor-not-allowed text-gray-400'
              }`}
              style={!hasModify ? { pointerEvents: 'none' } : {}}
            >
              <span>{params.value}</span>
            </div>
          )
        },
      }
    }
    if (col.field === 'no') {
      return {
        ...col,
        headerAlign: 'center',
        align: 'center',
        flex: 0.5,
        renderCell: (params: GridRenderCellParams) => {
          const sortedRowIds = params.api.getSortedRowIds?.() ?? []
          const indexInCurrentPage = sortedRowIds.indexOf(params.id)
          const no = totalList - ((search.currentPage - 1) * pageCount + indexInCurrentPage)
          return <span>{no}</span>
        },
      }
    }

    return {
      ...col,
      sortable: false,
      headerAlign: 'center',
      align: 'center',
      flex: 1,
    }
  })

  const [modalOpen, setModalOpen] = useState(false)
  // // userExcelFieldMap 객체를 { label: string, value: string }[] 배열로 바꿔줍니다.
  const fieldMapArray = Object.entries(SteelExcelFieldMap).map(([label, value]) => ({
    label,
    value,
  }))

  const handleDownloadExcel = async (fields: string[]) => {
    await SteelExcelDownload({
      sort: search.arraySort === '최신순' ? 'id,desc' : 'id,asc',
      siteName: search.siteName,
      siteProcessName: search.siteProcessName,
      startDate: search.startDate ? getTodayDateString(search.startDate) : undefined,
      endDate: search.endDate ? getTodayDateString(search.endDate) : undefined,
      fields, // 필수 필드: ["id", "name", "businessNumber", ...] })
    })
  }

  const [isSiteFocused, setIsSiteFocused] = useState(false)

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

  // 권한에 따른 버튼 활성화

  const [myInfo, setMyInfo] = useState<myInfoProps | null>(null)

  useEffect(() => {
    const headerData = sessionStorage.getItem('myInfo')
    search.reset()
    if (headerData) {
      setMyInfo(JSON.parse(headerData))
    }
  }, [])

  const roleId = Number(myInfo?.roles?.[0]?.id)

  const rolePermissionStatus = myInfo?.roles?.[0]?.deleted

  const enabled = rolePermissionStatus === false && !!roleId && !isNaN(roleId)

  // "계정 관리" 메뉴에 대한 권한
  const { hasCreate, hasModify } = useMenuPermission(roleId, '강재수불부 관리', enabled)

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
                    } else {
                      search.setField('siteProcessName', '')
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
              일자(기간)
            </label>
            <div className="border border-gray-400 px-2 w-full flex gap-3 items-center ">
              <CommonDatePicker
                value={search.startDate}
                onChange={(value) => search.setField('startDate', value)}
              />
              ~
              <CommonDatePicker
                value={search.endDate}
                onChange={(value) => search.setField('endDate', value)}
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
              search.setField('currentPage', 1) // 페이지 초기화
              search.handleSearch()
            }}
            className="mt-3 px-20"
          />
        </div>
      </div>

      <div className="mt-6 mb-4">
        <div className="bg-white flex justify-between items-center">
          {/* 왼쪽 상태 요약 */}
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <span className="font-medium">전체 : {totalList}</span>
            {/* <span className="text-gray-500">(진행중 000 / 종료 000)</span> */}
          </div>

          {/* 오른쪽 컨트롤 영역 */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-base font-medium text-gray-600">정렬</span>
              <CommonSelect
                value={search.arraySort}
                className="text-2xl w-full"
                onChange={(value) => {
                  search.setField('arraySort', value)
                  search.setField('currentPage', 1)
                }}
                options={LaborArrayStatusOptions}
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-base font-medium text-gray-600">페이지당 목록 수</span>
              <CommonSelect
                value={search.pageCount}
                className="text-2xl w-full"
                onChange={(value) => {
                  search.setField('pageCount', value)
                  search.setField('currentPage', 1) // 페이지 초기화 반드시 필요!
                }}
                options={PageCount}
              />
            </div>

            <div className="flex items-center gap-3">
              <CommonButton
                label="엑셀 다운로드"
                variant="reset"
                onClick={() => setModalOpen(true)}
                className="px-3"
              />

              {/* <ExcelModal open={modalOpen} onClose={() => setModalOpen(false)} /> */}
              <ExcelModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                title="강재수불부 관리 - 엑셀 항목 선택"
                fieldMap={fieldMapArray}
                onDownload={handleDownloadExcel}
              />
              <CommonButton
                label="+ 신규등록"
                disabled={!hasCreate} // 권한 없으면 비활성화
                variant="secondary"
                onClick={handleNewSteelCreate}
                className="px-3"
              />
            </div>
          </div>
        </div>
      </div>
      <div style={{ width: '100%' }}>
        <DataGrid
          rows={updateSteelList}
          columns={enhancedColumns.map((col) => ({
            ...col,
            sortable: false,
            headerAlign: 'center',
            align: 'center',
          }))}
          checkboxSelection
          disableRowSelectionOnClick
          keepNonExistentRowsSelected
          disableColumnFilter // 필터 비활성화
          hideFooter
          disableColumnMenu
          hideFooterPagination
          // pageSize={pageSize}
          getRowHeight={() => 'auto'}
          sx={{
            '& .MuiDataGrid-cell': {
              display: 'flex',
              justifyContent: 'center', // 가로 가운데 정렬
              alignItems: 'center', // 세로 가운데 정렬
              whiteSpace: 'normal', // 줄바꿈 허용
              lineHeight: '2.8rem', // 줄 간격
              paddingTop: '12px', // 위 여백
              paddingBottom: '12px', // 아래 여백
            },
          }}
          onRowSelectionModelChange={(newSelection) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            setSelectedIds(newSelection as any) // 타입 보장된다면 사용 가능
          }}
          slots={{
            noRowsOverlay: CustomNoRowsOverlay,
          }}
        />
        <div className="flex justify-center mt-4 pb-6">
          <Pagination
            count={totalPages}
            page={search.currentPage}
            onChange={(_, newPage) => search.setField('currentPage', newPage)}
            shape="rounded"
            color="primary"
          />
        </div>
      </div>
    </>
  )
}
