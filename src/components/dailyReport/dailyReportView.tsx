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
import { useRouter } from 'next/navigation'
import { Fragment, useEffect, useState } from 'react'
import { useTabOpener } from '@/utils/openTab'
import { LaborDataList } from '@/types/labor'
import { getTodayDateString } from '@/utils/formatters'
import { myInfoProps } from '@/types/user'
import { useMenuPermission } from '../common/MenuPermissionView'
import { CustomNoRowsOverlay } from '../common/NoData'
import { useDailySearchList } from '@/stores/dailyReportStore'
import { useDailyReport } from '@/hooks/useDailyReport'
import CommonSelectByName from '../common/CommonSelectByName'
import useOutSourcingContract from '@/hooks/useOutSourcingContract'
import CommonDatePicker from '../common/DatePicker'
import { SitesProcessNameScroll } from '@/services/managementCost/managementCostRegistrationService'

export default function DailyReportView() {
  const openTab = useTabOpener()

  const { search } = useDailySearchList()

  const { DailyListQuery } = useDailyReport()

  const {
    setSitesSearch,
    sitesOptions,
    siteNameFetchNextPage,
    siteNamehasNextPage,
    siteNameFetching,
    siteNameLoading,

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

      fuelEvidenceSubmitted: `${item.fuelEvidenceSubmitted ? 'Y' : 'N'}`,

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
        cellClassName: 'no-hover-bg', // 커스텀 클래스 지정
        renderCell: (params: GridRenderCellParams) => {
          const clientId = params.row.id

          const handleClick = () => {
            if (hasModify) {
              router.push(`/dailyReport/registration/${clientId}`)
            }
          }

          return (
            <div
              onClick={handleClick}
              className={`flex justify-center items-center ${
                hasModify && 'cursor-pointer text-black-500 font-bold'
              }`}
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
  const { hasCreate, hasModify } = useMenuPermission(roleId, '노무 관리', enabled)

  return (
    <>
      <div className="border-10 border-gray-400 p-4">
        <div className="grid grid-cols-3">
          <div className="flex">
            <label className="w-[144px] text-[14px] flex items-center border border-gray-400  justify-center bg-gray-300  font-bold text-center">
              현장명
            </label>
            <div className="border border-gray-400 px-2 p-2 w-full flex items-center">
              <CommonSelectByName
                value={search.siteName || '선택'}
                onChange={async (value) => {
                  const selectedSite = sitesOptions.find((opt) => opt.name === value)
                  if (!selectedSite) return

                  search.setField('siteId', selectedSite.id)
                  search.setField('siteName', selectedSite.name)

                  const res = await SitesProcessNameScroll({
                    pageParam: 0,
                    siteId: selectedSite.id,
                    keyword: '',
                  })

                  const processes = res.data?.content || []
                  if (processes.length > 0) {
                    // search.setField('processId', processes[0].id)
                    search.setField('processName', processes[0].name)
                  } else {
                    // search.setField('processId', 0)
                    search.setField('processName', '')
                  }
                }}
                options={sitesOptions}
                onScrollToBottom={() => {
                  if (siteNamehasNextPage && !siteNameFetching) siteNameFetchNextPage()
                }}
                onInputChange={(value) => setSitesSearch(value)}
                loading={siteNameLoading}
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
                onClick={() => openTab('/dailyReport/registration', '출역일보')}
                className="px-3"
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
          getRowClassName={(params) =>
            params.row.isSeverancePayEligible === 'Y' ? 'severance-row' : ''
          }
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
          />
        </div>
      </div>
    </>
  )
}
