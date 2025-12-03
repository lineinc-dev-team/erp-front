/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import CommonButton from '../common/Button'
import CommonSelect from '../common/Select'
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import {
  DailyColumnList,
  DeadLineInfo,
  LaborArrayStatusOptions,
  PageCount,
} from '@/config/erp.confing'
import { Pagination, Tooltip } from '@mui/material'
import { useAccountStore } from '@/stores/accountManagementStore'
import { Fragment, useEffect, useState } from 'react'
import { LaborDataList } from '@/types/labor'
import { formatNumber, getTodayDateString } from '@/utils/formatters'
import { myInfoProps } from '@/types/user'
import { useMenuPermission } from '../common/MenuPermissionView'
import { CustomNoRowsOverlay } from '../common/NoData'
import { useDailySearchList } from '@/stores/dailyReportStore'
import { useDailyReport } from '@/hooks/useDailyReport'
import CommonSelectByName from '../common/CommonSelectByName'
import useOutSourcingContract from '@/hooks/useOutSourcingContract'
import CommonDatePicker from '../common/DatePicker'
import { SitesProcessNameScroll } from '@/services/managementCost/managementCostRegistrationService'
import { useDebouncedValue } from '@/hooks/useDebouncedEffect'
import { InfiniteScrollSelect } from '../common/InfiniteScrollSelect'
import { useRouter } from 'next/navigation'
import CreateModal from '../common/CreateModal'

export default function DailyReportView() {
  const { search } = useDailySearchList()

  const { DailyListQuery } = useDailyReport()

  const {
    useSitePersonNameListInfiniteScroll,

    setProcessSearch,
    processOptions,
    processInfoFetchNextPage,
    processInfoHasNextPage,
    processInfoIsFetching,
    processInfoLoading,
  } = useOutSourcingContract()

  const DailyList = DailyListQuery.data?.data.content ?? []

  const totalList = DailyListQuery.data?.data.pageInfo.totalElements ?? 0
  const pageCount = Number(search.pageCount) || 10
  const totalPages = Math.ceil(totalList / pageCount)

  const updateClientList = DailyList.map((item: any) => {
    return {
      ...item,
      siteId: item.site?.id,
      processId: item.siteProcess?.id,
      siteName: item.site?.name,

      site: item.site?.name || '-',
      employeeWorkQuantitySum: `${item.employeeWorkQuantitySum || 0} / ${
        item.employeeEvidenceSubmitted ? 'Y' : 'N'
      }`,

      directContractWorkQuantitySum: `${item.directContractWorkQuantitySum || 0} / ${
        item.directContractEvidenceSubmitted ? 'Y' : 'N'
      }`,

      outsourcingWorkQuantitySum: `${item.outsourcingWorkQuantitySum || 0} / ${
        item.outsourcingEvidenceSubmitted ? 'Y' : 'N'
      }`,

      equipmentTotalHours: `${item.equipmentTotalHours || 0} / ${
        item.equipmentEvidenceSubmitted ? 'Y' : 'N'
      }`,

      fuelEvidenceSubmitted: ` ${item.fuelEvidenceSubmitted ? 'Y' : 'N'}`,

      isConstructionReport: item.isConstructionReport ? 'Y' : 'N',

      sitePhotoSubmitted: item.sitePhotoSubmitted ? 'Y' : 'N',

      gasolineTotalAmount: formatNumber(item.gasolineTotalAmount),

      dieselTotalAmount: formatNumber(item.dieselTotalAmount),
      ureaTotalAmount: formatNumber(item.ureaTotalAmount),
      etcTotalAmount: formatNumber(item.etcTotalAmount),

      siteProcess: item.siteProcess.name || '-',
      reportDate: item.reportDate ? `${getTodayDateString(item.reportDate)}` : '-',
      status: item.status === 'PENDING' ? 'N' : 'Y',
    }
  })

  const { setSelectedIds } = useAccountStore()

  const router = useRouter()

  // 그리도 라우팅 로직!
  const enhancedColumns = DailyColumnList.map((col): GridColDef => {
    if (col.field === 'memo') {
      return {
        ...col,
        headerAlign: 'center',
        align: 'center',
        flex: 2,
        renderCell: (params: GridRenderCellParams) => {
          const text = params.value as string
          if (!text) return <span style={{ fontSize: 12 }}>-</span>

          return (
            <Tooltip title={text} arrow>
              <span style={{ fontSize: 12 }}>
                {text.length > 10 ? `${text.slice(0, 10)}...` : text}
              </span>
            </Tooltip>
          )
        },
      }
    }

    if (col.field === 'status') {
      return {
        ...col,
        headerAlign: 'center',
        align: 'center',
        flex: 1,
        minWidth: 60,
        maxWidth: 60,
        renderCell: (params: GridRenderCellParams) => {
          const value = params.value as string
          return (
            <span
              style={{
                color: value === 'N' ? 'red' : 'inherit',
                fontWeight: value === 'N' ? 'bold' : 'normal',
              }}
            >
              {value}
            </span>
          )
        },
      }
    }

    if (col.field === 'accountNumber') {
      return {
        ...col,
        sortable: false,
        headerAlign: 'center',
        align: 'center',
        flex: 2,
        renderCell: (params: GridRenderCellParams) => {
          const item = params.row as LaborDataList

          return (
            <div className="flex flex-col items-center">
              <Fragment>
                <div className="whitespace-pre-wrap">{item.bankName || '-'}</div>
                <div className="whitespace-pre-wrap">{item.accountNumber}</div>
              </Fragment>
            </div>
          )
        },
      }
    }

    if (col.field === 'tenureMonths') {
      return {
        ...col,
        headerAlign: 'center',
        align: 'center',
        flex: 1,
        renderCell: (params: GridRenderCellParams) => {
          const value = params.value as number | string

          // 문자열이면 '일' 제거 후 숫자로 변환
          const numericValue = typeof value === 'string' ? Number(value.replace('개월', '')) : value

          return <div>{numericValue ?? '-'}</div>
        },
      }
    }
    if (col.field === 'reportDate') {
      return {
        ...col,
        headerAlign: 'center',
        align: 'center',
        flex: 1,
        minWidth: 100,
        maxWidth: 100,
        cellClassName: 'no-hover-bg', // 커스텀 클래스 지정
        renderCell: (params: GridRenderCellParams) => {
          const clientReportDate = params.row.reportDate
          const clientReportSiteId = params.row.siteId
          const clientProcessId = params.row.processId
          const clientReportSiteName = params.row.siteName

          console.log('clientIdclientId', params.row)

          const handleClick = () => {
            if (hasModify) {
              const queryString = new URLSearchParams({
                date: clientReportDate,
                site: clientReportSiteId,
                process: clientProcessId,
                siteName: clientReportSiteName,
              }).toString()

              router.push(`/dailyReport/registration?${queryString}`)
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

    if (col.field === 'sitePhotoSubmitted') {
      return {
        ...col,
        headerAlign: 'center',
        align: 'center',
        minWidth: 100,
        maxWidth: 100,
      }
    }

    if (col.field === 'weather') {
      return {
        ...col,
        headerAlign: 'center',
        align: 'center',
        minWidth: 60,
        maxWidth: 60,
      }
    }

    if (col.field === 'no') {
      return {
        ...col,
        headerAlign: 'center',
        align: 'center',
        flex: 0.5,
        minWidth: 40,
        maxWidth: 40,
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

  // 권한에 따른 버튼 활성화

  const [myInfo, setMyInfo] = useState<myInfoProps | null>(null)

  useEffect(() => {
    const headerData = sessionStorage.getItem('myInfo')
    if (headerData) {
      setMyInfo(JSON.parse(headerData))
    }
  }, [])

  const roleId = Number(myInfo?.roles?.[0]?.id)

  const rolePermissionStatus = myInfo?.roles?.[0]?.deleted

  const enabled = rolePermissionStatus === false && !!roleId && !isNaN(roleId)

  // "계정 관리" 메뉴에 대한 권한
  const { hasCreate, hasModify } = useMenuPermission(roleId, '출역일보', enabled)

  const [createModalOpen, setCreateModalOpen] = useState(false)

  const handleEnterKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      search.setField('currentPage', 1) // 페이지 초기화
      search.handleSearch()
    }
  }

  return (
    <>
      <div className="border-10 border-gray-400 p-4">
        <div className="grid grid-cols-3">
          <div className="flex">
            <label className="w-[144px] text-[14px] flex items-center border border-gray-400  justify-center bg-gray-300  font-bold text-center">
              현장명
            </label>
            <div
              className="border border-gray-400 w-full flex items-center"
              onKeyDown={handleEnterKey}
            >
              <InfiniteScrollSelect
                placeholder="현장명을 입력하세요"
                keyword={search.siteName}
                // onChangeKeyword={(newKeyword) => search.setField('siteName', newKeyword)} // ★필드명과 값 둘 다 넘겨야 함
                onChangeKeyword={(newKeyword) => {
                  search.setField('siteName', newKeyword)

                  // 현장명 지웠을 경우 공정명도 같이 초기화
                  if (newKeyword === '') {
                    search.setField('processName', '')
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
                    search.setField('processName', '')
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
                      search.setField('processName', processes[0].name)
                    } else {
                      search.setField('processName', '')
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
                value={search.processName || '선택'}
                onChange={(value) => {
                  const selectedProcess = processOptions.find((opt) => opt.name === value)
                  if (selectedProcess) {
                    // search.setField('processId', selectedProcess.id)
                    search.setField('processName', selectedProcess.name)
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

          <div className="flex">
            <label className="w-36 text-[14px]  border border-gray-400  flex items-center justify-center bg-gray-300  font-bold text-center">
              마감여부
            </label>
            <div className="border border-gray-400 px-2 w-full flex justify-center items-center">
              <CommonSelect
                fullWidth={true}
                className="text-2xl"
                value={search.isCompleted || 'BASE'}
                displayLabel
                onChange={(value) => search.setField('isCompleted', value)}
                options={DeadLineInfo}
              />
            </div>
          </div>
          <div className="flex">
            <label className="w-36 text-[14px]  border border-gray-400  flex items-center justify-center bg-gray-300  font-bold text-center">
              첨부누락여부
            </label>
            <div className="border border-gray-400 p-2 w-full">
              <CommonSelect
                fullWidth={true}
                className="text-2xl"
                value={search.isEvidenceSubmitted || 'BASE'}
                displayLabel
                onChange={(value) => search.setField('isEvidenceSubmitted', value)}
                options={DeadLineInfo}
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

          {/* <CommonButton
            label="검색"
            variant="secondary"
            onClick={search.handleSearch}
            className="mt-3 px-20"
          /> */}

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

            <div className="flex items-center gap-2">
              <CommonButton
                label="+ 신규등록"
                disabled={!hasCreate}
                variant="secondary"
                // onClick={() => openTab('/dailyReport/registration', '출역일보')}
                onClick={() => setCreateModalOpen(true)}
                className="px-3"
              />

              <CreateModal
                open={createModalOpen}
                onClose={() => {
                  setCreateModalOpen(false)
                  window.location.reload()
                }}
                title="출역일보 등록"
              />
            </div>
          </div>
        </div>
      </div>
      <div style={{ width: '100%' }}>
        <DataGrid
          rows={updateClientList}
          columns={enhancedColumns.map((col) => ({
            ...col,
            sortable: false,
            headerAlign: 'center',
            align: 'center',
          }))}
          checkboxSelection
          disableRowSelectionOnClick
          keepNonExistentRowsSelected
          disableColumnFilter
          hideFooter
          disableColumnMenu
          hideFooterPagination
          getRowHeight={() => 'auto'}
          getRowClassName={(params) => {
            if (params.row.isSeverancePayEligible === 'Y') return 'severance-row'
            return ''
          }}
          sx={{
            '& .MuiDataGrid-row:hover': {
              backgroundColor: 'inherit !important', // hover 효과 제거
              color: 'black',
            },
            '& .MuiDataGrid-cell': {
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              whiteSpace: 'normal',
              lineHeight: '2.8rem',
              paddingTop: '12px',
              paddingBottom: '12px',
            },
            '& .severance-row': {
              backgroundColor: 'red',
              color: 'white',
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
            siblingCount={3} // 기본 1 → 증가
            boundaryCount={2} // 기본 1 → 2 정도로
          />
        </div>
      </div>
    </>
  )
}
