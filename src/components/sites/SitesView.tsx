'use client'

import CommonButton from '../common/Button'
import { Tooltip } from '@mui/material'

import CommonInput from '../common/Input'
import CommonSelect from '../common/Select'
import CommonDatePicker from '../common/DatePicker'
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import { Checkbox, ListItemText, MenuItem, Pagination, Select } from '@mui/material'
import { SiteExcelDownload } from '@/services/sites/siteService'
import { useSiteSearchStore } from '@/stores/siteStore'
import useSite from '@/hooks/useSite'
import { useAccountStore } from '@/stores/accountManagementStore'
import { useRouter } from 'next/navigation'
import {
  ArrayStatusOptions,
  CityOptions,
  DistrictGuOptions,
  PageCount,
  SiteColumnList,
  SiteProgressing,
} from '@/config/erp.confing'
import { processStatuses, SiteListProps } from '@/types/site'
import { formatNumber, getTodayDateString } from '@/utils/formatters'
import { Fragment, useEffect, useState } from 'react'
import ExcelModal from '../common/ExcelModal'
import { SiteExcelFieldMap } from '@/utils/userExcelField'
import { useTabOpener } from '@/utils/openTab'
import CommonSelectByName from '../common/CommonSelectByName'
import { useSnackbarStore } from '@/stores/useSnackbarStore'
import useOutSourcingContract from '@/hooks/useOutSourcingContract'
import { myInfoProps } from '@/types/user'
import { useMenuPermission } from '../common/MenuPermissionView'
import { CustomNoRowsOverlay } from '../common/NoData'

export default function SitesView() {
  const { search } = useSiteSearchStore()

  const openTab = useTabOpener()

  // 현장명 공정명 무한 스크롤
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

  const {
    SiteListQuery,
    SiteDeleteMutation,
    setOrderSearch,
    orderPersonFetchNextPage,
    orderPersonHasNextPage,
    orderPersonIsFetching,
    orderPersonIsLoading,
    orderOptions,
    siteTypeOptions,
  } = useSite()

  const { showSnackbar } = useSnackbarStore()

  const SiteDataList = SiteListQuery.data?.data.content ?? []

  const totalList = SiteListQuery.data?.data.pageInfo.totalElements ?? 0
  const pageCount = Number(search.pageCount) || 10
  const totalPages = Math.ceil(totalList / pageCount)

  const updateSiteList = SiteDataList.map((site: SiteListProps) => ({
    ...site,
    processName: site.process?.name || '-', // 공정명
    managerName: site.manager?.username || '-', // 공정소장 이름
    contractAmount: formatNumber(site.contractAmount) || '-',
    hasFile: site.hasFile === true ? 'Y' : 'N',
    processStatuses: site.process?.status || '-', // 진행상태
    clientCompanyName: site.clientCompany?.name || '-', // 발주처명
    // period: getTodayDateString(site.startedAt) + ' ~ ' + getTodayDateString(site.endedAt),
    createdAt: getTodayDateString(site.createdAt),
    memo: site.memo || '-',
  }))

  const { selectedIds, setSelectedIds } = useAccountStore()

  const router = useRouter()

  // 그리도 라우팅 로직!
  const enhancedColumns = SiteColumnList.map((col): GridColDef => {
    if (col.field === 'address') {
      return {
        ...col,
        sortable: false,
        headerAlign: 'center',
        align: 'center',
        flex: 2,
        renderCell: (params: GridRenderCellParams) => {
          const item = params.row as SiteListProps

          if (!item.address && !item.detailAddress) {
            return <div className="flex flex-col items-center">-</div>
          }

          return (
            <div className="flex flex-col items-center">
              <div className="whitespace-pre-wrap">{item.address || '-'}</div>
              <div className="whitespace-pre-wrap">{item.detailAddress || '-'}</div>
            </div>
          )
        },
      }
    }
    if (col.field === 'period') {
      return {
        ...col,
        sortable: false,
        headerAlign: 'center',
        align: 'center',
        flex: 2,
        renderCell: (params: GridRenderCellParams) => {
          const item = params.row as SiteListProps

          return (
            <div className="flex flex-col items-center">
              <Fragment>
                <div className="whitespace-pre-wrap">{getTodayDateString(item.startedAt)}</div>
                <div className="whitespace-pre-wrap">{getTodayDateString(item.endedAt)}</div>
              </Fragment>
            </div>
          )
        },
      }
    }
    if (col.field === 'name') {
      return {
        ...col,
        headerAlign: 'center',
        align: 'center',
        flex: 1,

        renderCell: (params: GridRenderCellParams) => {
          const siteId = params.row.id
          const handleClick = () => {
            if (hasModify) {
              router.push(`/sites/registration/${siteId}`)
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
  const fieldMapArray = Object.entries(SiteExcelFieldMap).map(([label, value]) => ({
    label,
    value,
  }))

  const handleDownloadExcel = async (fields: string[]) => {
    await SiteExcelDownload({
      sort: search.arraySort === '최신순' ? 'id,desc' : 'id,asc',
      name: search.name,
      processName: search.processName,
      city: search.city,
      district: search.district,
      type: search.type,
      processStatuses: search.processStatuses,
      clientCompanyName: search.clientCompanyName,
      // managerName: search.managerName,
      startDate: search.startDate ? getTodayDateString(search.startDate) : undefined,
      endDate: search.endDate ? getTodayDateString(search.endDate) : undefined,
      createdStartDate: search.createdStartDate
        ? getTodayDateString(search.createdStartDate)
        : undefined,
      createdEndDate: search.createdEndDate ? getTodayDateString(search.createdEndDate) : undefined,
      createdBy: search.createdBy,
      fields,
    })
  }

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
  const { hasDelete, hasCreate, hasModify } = useMenuPermission(roleId, '현장 관리', enabled)

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
                value={search.name || '선택'}
                onChange={async (value) => {
                  const selectedSite = sitesOptions.find((opt) => opt.name === value)
                  if (!selectedSite) return

                  search.setField('nameId', selectedSite.id)
                  search.setField('name', selectedSite.name)

                  // const res = await SitesProcessNameScroll({
                  //   pageParam: 0,
                  //   siteId: selectedSite.id,
                  //   keyword: '',
                  // })

                  // const processes = res.data?.content || []
                  // if (processes.length > 0) {
                  //   search.setField('processId', processes[0].id)
                  //   search.setField('processName', processes[0].name)
                  // } else {
                  //   search.setField('processId', 0)
                  //   search.setField('processName', '')
                  // }
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
              />
            </div>
          </div>

          <div className="flex">
            <label className="w-36 text-[14px] border border-gray-400 flex items-center justify-center bg-gray-300 font-bold text-center">
              지역(시/군/구)
            </label>
            <div className="border border-gray-400 gap-6 px-2 w-full flex justify-center items-center">
              {/* 시/도 선택 */}
              <CommonSelect
                className="text-2xl w-full"
                value={search.city || '0'}
                onChange={(value) => {
                  search.setField('city', value)
                  // 시/도 바뀌면 구 선택 초기화
                  search.setField('district', '0')
                }}
                options={CityOptions}
                fullWidth={true}
              />

              <CommonSelect
                className="text-2xl w-full"
                value={search.district || '0'}
                onChange={(value) => search.setField('district', value)}
                options={DistrictGuOptions.filter(
                  (d) => d.id === '0' || d.id.startsWith(search.city),
                )}
                fullWidth={true}
              />
            </div>
          </div>

          <div className="flex">
            <label className="w-36 text-[14px]  border border-gray-400  flex items-center justify-center bg-gray-300  font-bold text-center">
              현장유형
            </label>
            <div className="border border-gray-400 px-2 w-full flex justify-center items-center">
              <CommonSelect
                fullWidth={true}
                className="text-xl"
                value={search.type || 'BASE'}
                displayLabel
                onChange={(value) => search.setField('type', value)}
                options={siteTypeOptions}
              />
            </div>
          </div>
          <div className="flex">
            <label className="w-36 text-[14px]  border border-gray-400  flex items-center justify-center bg-gray-300  font-bold text-center">
              진행상태
            </label>
            <div className="border p-2 border-gray-400 px-2 w-full flex justify-center items-center">
              <Select
                multiple
                value={search.processStatuses} // ProcessStatus[] (code 배열)
                onChange={(e) => {
                  search.setField('processStatuses', e.target.value as processStatuses[])
                }}
                renderValue={(selected) => {
                  if ((selected as processStatuses[]).length === 0) return '선택'

                  return (selected as processStatuses[])
                    .map((code) => SiteProgressing.find((item) => item.code === code)?.name ?? code)
                    .join(', ')
                }}
                displayEmpty
                className="w-full"
                sx={{
                  minHeight: 40,
                  '&.MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: 'black',
                      borderWidth: '1px',
                    },
                    '&:hover fieldset': {
                      borderColor: 'black',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'black',
                    },
                  },
                  '& .MuiSelect-select': {
                    paddingTop: '4px',
                    paddingBottom: '4px',
                    fontSize: '1rem',
                  },
                }}
              >
                {SiteProgressing.filter((item) => item.code !== '선택').map((option) => (
                  <MenuItem key={option.id} value={option.code}>
                    <Checkbox
                      checked={search.processStatuses.includes(option.code as processStatuses)}
                    />

                    <ListItemText primary={option.name} />
                  </MenuItem>
                ))}
              </Select>
            </div>
          </div>

          <div className="flex">
            <label className="w-36  text-[14px] flex items-center border border-gray-400 justify-center bg-gray-300 font-bold text-center">
              발주처
            </label>
            <div className="border border-gray-400 px-2 p-2 w-full flex items-center">
              <CommonSelectByName
                value={search.clientCompanyName || '선택'} // 현재 선택된 name 값
                onChange={(value) => {
                  search.setField('clientCompanyName', value) // 선택된 name을 상태로 저장
                }}
                options={orderOptions}
                displayLabel
                onScrollToBottom={() => {
                  if (orderPersonHasNextPage && !orderPersonIsFetching) orderPersonFetchNextPage()
                }}
                onInputChange={(value) => setOrderSearch(value)}
                loading={orderPersonIsLoading}
              />
            </div>
          </div>

          <div className="flex">
            <label className="w-36 text-[14px]  border border-gray-400  flex items-center justify-center bg-gray-300  font-bold text-center">
              공정소장
            </label>
            <div className="border border-gray-400 px-2 w-full flex gap-3 items-center ">
              <CommonInput
                value={search.managerName}
                onChange={(value) => search.setField('managerName', value)}
                className=" flex-1"
              />
            </div>
          </div>

          <div className="flex">
            <label className="w-36  border border-gray-400  flex items-center justify-center bg-gray-300  font-bold text-center">
              사업기간
            </label>
            <div className="border border-gray-400 px-2 w-full flex gap-3 items-center ">
              <CommonDatePicker
                value={search.startDate}
                onChange={(value) => {
                  search.setField('startDate', value)

                  if (
                    value !== null &&
                    search.endDate !== null &&
                    new Date(search.endDate) < new Date(value)
                  ) {
                    search.setField('endDate', value)
                  }
                }}
              />
              ~
              <CommonDatePicker
                value={search.endDate}
                onChange={(value) => {
                  if (
                    value !== null &&
                    search.startDate !== null &&
                    new Date(value) < new Date(search.startDate)
                  ) {
                    showSnackbar('종료일은 시작일 이후여야 합니다.', 'error')
                    return
                  }
                  search.setField('endDate', value)
                }}
              />
            </div>
          </div>

          <div className="flex">
            <label className="w-36  border border-gray-400  flex items-center justify-center bg-gray-300  font-bold text-center">
              등록일자
            </label>
            <div className="border border-gray-400 px-2 w-full flex gap-3 items-center ">
              <CommonDatePicker
                value={search.createdStartDate}
                onChange={(value) => {
                  search.setField('createdStartDate', value)

                  if (
                    value !== null &&
                    search.createdEndDate !== null &&
                    new Date(search.createdEndDate) < new Date(value)
                  ) {
                    search.setField('createdEndDate', value)
                  }
                }}
              />
              ~
              <CommonDatePicker
                value={search.createdEndDate}
                onChange={(value) => {
                  if (
                    value !== null &&
                    search.createdStartDate !== null &&
                    new Date(value) < new Date(search.createdStartDate)
                  ) {
                    showSnackbar('종료일은 시작일 이후여야 합니다.', 'error')
                    return
                  }
                  search.setField('createdEndDate', value)
                }}
              />
            </div>
          </div>

          <div className="flex">
            <label className="w-36 text-[14px] border border-gray-400  flex items-center justify-center bg-gray-300  font-bold text-center">
              등록자
            </label>
            <div className="border border-gray-400 px-2 w-full flex gap-3 items-center ">
              <CommonInput
                value={search.createdBy}
                onChange={(value) => search.setField('createdBy', value)}
                className=" flex-1"
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
                options={ArrayStatusOptions}
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
                label="삭제"
                variant="danger"
                disabled={!hasDelete} // 권한 없으면 비활성화
                onClick={() => {
                  if (!selectedIds || !(selectedIds.ids instanceof Set)) {
                    alert('체크박스를 선택해주세요.')
                    return
                  }

                  const idsArray = [...selectedIds.ids]
                  if (idsArray.length === 0) {
                    alert('체크박스를 선택해주세요.')
                    return
                  }
                  if (window.confirm('정말 삭제하시겠습니까?')) {
                    SiteDeleteMutation.mutate({
                      siteIds: idsArray,
                    })
                  }
                }}
                className="px-3"
              />
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
                title="현장 관리 - 엑셀 항목 선택"
                fieldMap={fieldMapArray}
                onDownload={handleDownloadExcel}
              />
              <CommonButton
                label="+ 신규등록"
                disabled={!hasCreate} // 권한 없으면 비활성화
                variant="secondary"
                onClick={() => openTab('/sites/registration', '현장관리 - 등록')}
                className="px-3"
              />
            </div>
          </div>
        </div>
      </div>
      <div style={{ height: 500, width: '100%' }}>
        <DataGrid
          rows={updateSiteList}
          columns={enhancedColumns.map((col) => ({
            ...col,
            sortable: false,
            headerAlign: 'center',
            align: 'center',
            flex: 1,
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

      {/* <ContractHistory open={contract} onClose={() => setContract(false)} /> */}
    </>
  )
}
