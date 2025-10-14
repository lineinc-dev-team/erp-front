'use client'

import CommonButton from '../common/Button'
import CommonSelect from '../common/Select'
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import { LaborArrayStatusOptions, LaborStateMentColumnList, PageCount } from '@/config/erp.confing'
import { Pagination, Tooltip } from '@mui/material'
import { useAccountStore } from '@/stores/accountManagementStore'
import { useRouter } from 'next/navigation'
import ExcelModal from '../common/ExcelModal'
import { useEffect, useState } from 'react'
import { laborStateMentExcelFieldMap } from '@/utils/userExcelField'
import { useLaborStateMentInfo } from '@/hooks/useLaborStateMent'
import CommonSelectByName from '../common/CommonSelectByName'
import { useLaborStateMentSearchStore } from '@/stores/laborStateMentStore'
import useOutSourcingContract from '@/hooks/useOutSourcingContract'
import { SitesProcessNameScroll } from '@/services/managementCost/managementCostRegistrationService'
import CommonMonthPicker from '../common/MonthPicker'
import { LaborStateMentExcelDownload } from '@/services/laborStateMent/laborStateMentService'
import { formatNumber } from '@/utils/formatters'
import { CustomNoRowsOverlay } from '../common/NoData'
import { useDebouncedValue } from '@/hooks/useDebouncedEffect'
import { InfiniteScrollSelect } from '../common/InfiniteScrollSelect'
import { myInfoProps } from '@/types/user'
import { useMenuPermission } from '../common/MenuPermissionView'

export default function LaborStateMentView() {
  const { search } = useLaborStateMentSearchStore()

  const { LaborStateMentListQuery } = useLaborStateMentInfo()

  const {
    useSitePersonNameListInfiniteScroll,

    setProcessSearch,
    processOptions,
    processInfoFetchNextPage,
    processInfoHasNextPage,
    processInfoIsFetching,
    processInfoLoading,
  } = useOutSourcingContract()

  const laborStateMentList = LaborStateMentListQuery.data?.data.content ?? []

  const totalList = LaborStateMentListQuery.data?.data.pageInfo.totalElements ?? 0

  const pageCount = Number(search.pageCount) || 10
  const totalPages = Math.ceil(totalList / pageCount)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateClientList = laborStateMentList.map((item: any) => {
    return {
      ...item,
      siteName: item.site?.name || '-',
      processName: item.siteProcess.name || '-',
      memo: item.memo || '-',
      totalLaborCost: formatNumber(item.totalLaborCost) || '-',
      totalDeductions: formatNumber(item.totalDeductions) || '-',
      totalNetPayment: formatNumber(item.totalNetPayment) || '-',
    }
  })

  const { setSelectedIds } = useAccountStore()

  const router = useRouter()

  // 그리도 라우팅 로직!
  const enhancedColumns = LaborStateMentColumnList.map((col): GridColDef => {
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

    if (col.field === 'siteName') {
      return {
        ...col,
        headerAlign: 'center',
        align: 'center',
        flex: 1,

        renderCell: (params: GridRenderCellParams) => {
          const clientId = params.row.id

          const handleClick = () => {
            if (hasModify) {
              router.push(`/laborStatement/registration/${clientId}`)
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

  const [modalOpen, setModalOpen] = useState(false)
  const fieldMapArray = Object.entries(laborStateMentExcelFieldMap).map(([label, value]) => ({
    label,
    value,
  }))

  const handleDownloadExcel = async (fields: string[]) => {
    await LaborStateMentExcelDownload({
      sort: search.arraySort === '최신순' ? 'id,desc' : 'id,asc',
      siteName: search.siteName,
      processName: search.processName,
      yearMonth: search.yearMonth ? search.yearMonth : undefined,
      fields, // 필수 필드: ["id", "name", "businessNumber", ...]
    })
  }

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
  const { hasModify, hasExcelDownload } = useMenuPermission(roleId, '노무명세서 관리', enabled)

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
                    search.setField('processId', selectedProcess.id)
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
              조회월
            </label>
            <div className="border border-gray-400 px-2 w-full flex justify-center items-center">
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
              search.setField('currentPage', 1) // 페이지 초기화
              search.handleSearch()
            }}
            className="mt-3 px-20"
          />
        </div>
      </div>

      <div className="mt-6 mb-4">
        <div className="bg-white flex justify-between items-center">
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
                label="엑셀 다운로드"
                disabled={!hasExcelDownload}
                variant="reset"
                onClick={() => setModalOpen(true)}
                className="px-3"
              />

              <ExcelModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                title="노무명세서 관리 - 엑셀 항목 선택"
                fieldMap={fieldMapArray}
                onDownload={handleDownloadExcel}
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
