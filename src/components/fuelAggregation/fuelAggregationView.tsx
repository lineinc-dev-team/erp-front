/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import CommonButton from '../common/Button'
import CommonSelect from '../common/Select'
import CommonDatePicker from '../common/DatePicker'
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import { Checkbox, ListItemText, MenuItem, Pagination, Select, Tooltip } from '@mui/material'
import { useAccountStore } from '@/stores/accountManagementStore'
import { useRouter } from 'next/navigation'
import {
  FuelColumnList,
  FuelStatusesing,
  LaborArrayStatusOptions,
  PageCount,
} from '@/config/erp.confing'
import { useEffect, useState } from 'react'
import ExcelModal from '../common/ExcelModal'
import { fuelExcelFieldMap } from '@/utils/userExcelField'
import { useManagementMaterial } from '@/hooks/useMaterialManagement'
import { formatNumber, getTodayDateString } from '@/utils/formatters'
import useOutSourcingContract from '@/hooks/useOutSourcingContract'
import CommonSelectByName from '../common/CommonSelectByName'
import { useFuelAggregation } from '@/hooks/useFuelAggregation'
import { fuelStatuses } from '@/types/fuelAggregation'
import { useFuelSearchStore } from '@/stores/fuelAggregationStore'
import { FuelExcelDownload } from '@/services/fuelAggregation/fuelAggregationService'
import { myInfoProps } from '@/types/user'
import { useMenuPermission } from '../common/MenuPermissionView'
import { CustomNoRowsOverlay } from '../common/NoData'
import { InfiniteScrollSelect } from '../common/InfiniteScrollSelect'
import { useDebouncedValue } from '@/hooks/useDebouncedEffect'
import { SitesProcessNameScroll } from '@/services/managementCost/managementCostRegistrationService'

export default function FuelAggregationView() {
  const { search } = useFuelSearchStore()

  const {
    // MaterialDeleteMutation,
  } = useManagementMaterial()

  const {
    FuelListQuery,
    carNumberOptions,
    setCarNumberSearch,
    carNumberFetchNextPage,
    carNumberHasNextPage,
    carNumberIsFetching,
    carNumberLoading,
  } = useFuelAggregation()

  const {
    useSitePersonNameListInfiniteScroll,

    // 공정명
    setProcessSearch,
    processOptions,
    processInfoFetchNextPage,
    processInfoHasNextPage,
    processInfoIsFetching,
    processInfoLoading,

    // 업체명

    useOutsourcingNameListInfiniteScroll,
  } = useOutSourcingContract()

  const FuelDataList = FuelListQuery.data?.data.content ?? []

  const totalList = FuelListQuery.data?.data.pageInfo.totalElements ?? 0
  const pageCount = Number(search.pageCount) || 10
  const totalPages = Math.ceil(totalList / pageCount)

  const updateFuelList = FuelDataList.flatMap((fuel: any, fuelIndex: number) => {
    const fuelInfo = fuel.fuelInfo

    return [
      {
        rowId: `fuel-${fuelIndex}`,
        backendId: fuel.id,
        fuelInfoId: fuelInfo?.id ?? null,
        site: fuel.site.name,
        process: fuel.process.name,
        date: getTodayDateString(fuel.date),

        outsourcingCompany: fuelInfo?.outsourcingCompany?.name ?? '-',
        fuelCompany: fuel.outsourcingCompany.name,
        createdAt: `${getTodayDateString(fuel.createdAt)} / ${getTodayDateString(fuel.updatedAt)}`,
        memo: fuelInfo?.memo ?? '-',

        // fuelInfo 필드
        driverName: fuelInfo?.driver?.name || '-',
        vehicleNumber: fuelInfo?.equipment?.vehicleNumber || '-',
        fuelType: fuelInfo?.fuelType || '-',
        fuelAmount: formatNumber(fuelInfo?.fuelAmount) || '-',

        amount: formatNumber(fuelInfo?.amount) || '-',
        specification: fuelInfo?.equipment?.specification || '-',
      },
    ]
  })

  const { setSelectedIds } = useAccountStore()

  const router = useRouter()

  // 그리도 라우팅 로직!
  const enhancedColumns = FuelColumnList.map((col): GridColDef => {
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

    if (col.field === 'vehicleNumber') {
      return {
        ...col,
        headerAlign: 'center',
        align: 'center',
        flex: 1,

        renderCell: (params: GridRenderCellParams) => {
          const materialId = params.row.backendId

          const handleClick = () => {
            if (hasModify) {
              router.push(`/fuelAggregation/registration/${materialId}`)
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
          // const no = (search.currentPage - 1) * pageCount + indexInCurrentPage + 1
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
  const fieldMapArray = Object.entries(fuelExcelFieldMap).map(([label, value]) => ({
    label,
    value,
  }))

  const handleDownloadExcel = async (fields: string[]) => {
    await FuelExcelDownload({
      sort: search.arraySort === '최신순' ? 'id,desc' : 'id,asc',
      siteName: search.siteName,
      processName: search.processName,
      fuelTypes: search.fuelTypes,
      outsourcingCompanyName: search.outsourcingCompanyName,
      vehicleNumber: search.vehicleNumber,
      dateStartDate: search.dateStartDate ? getTodayDateString(search.dateStartDate) : undefined,
      dateEndDate: search.dateEndDate ? getTodayDateString(search.dateEndDate) : undefined,
      fields,
    })
  }

  // 현장명 키워드 검색

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

  const [isOutsourcingFocused, setIsOutsourcingFocused] = useState(false)

  // 유저 선택 시 처리
  const handleSelectOutsourcing = (selectedUser: any) => {
    search.setField('outsourcingCompanyName', selectedUser.name)
  }

  const debouncedOutsourcingKeyword = useDebouncedValue(search.outsourcingCompanyName, 300)

  const {
    data: OutsourcingNameData,
    fetchNextPage: OutsourcingeNameFetchNextPage,
    hasNextPage: OutsourcingNameHasNextPage,
    isFetching: OutsourcingNameIsFetching,
    isLoading: OutsourcingNameIsLoading,
  } = useOutsourcingNameListInfiniteScroll(debouncedOutsourcingKeyword)

  const OutsourcingRawList = OutsourcingNameData?.pages.flatMap((page) => page.data.content) ?? []
  const outsourcingList = Array.from(
    new Map(OutsourcingRawList.map((user) => [user.name, user])).values(),
  )

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
  const { hasModify, hasExcelDownload } = useMenuPermission(roleId, '유류집계 관리', enabled)

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
              유종
            </label>
            <div className="border p-2 border-gray-400 px-2 w-full flex justify-center items-center">
              <Select
                multiple
                value={search.fuelTypes} // ProcessStatus[] (code 배열)
                onChange={(e) => {
                  search.setField('fuelTypes', e.target.value as fuelStatuses[])
                }}
                renderValue={(selected) => {
                  if ((selected as fuelStatuses[]).length === 0) return '선택'

                  return (selected as fuelStatuses[])
                    .map((code) => FuelStatusesing.find((item) => item.code === code)?.name ?? code)
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
                {FuelStatusesing.filter((item) => item.code !== '선택').map((option) => (
                  <MenuItem key={option.id} value={option.code}>
                    <Checkbox checked={search.fuelTypes.includes(option.code as fuelStatuses)} />

                    <ListItemText primary={option.name} />
                  </MenuItem>
                ))}
              </Select>
            </div>
          </div>
          <div className="flex">
            <label className="w-36  text-[14px] flex items-center border border-gray-400  justify-center bg-gray-300  font-bold text-center">
              업체명
            </label>
            <div className="border border-gray-400  w-full flex items-center">
              <InfiniteScrollSelect
                placeholder="업체명을 입력하세요"
                keyword={search.outsourcingCompanyName}
                onChangeKeyword={(newKeyword) =>
                  search.setField('outsourcingCompanyName', newKeyword)
                } // ★필드명과 값 둘 다 넘겨야 함
                items={outsourcingList}
                hasNextPage={OutsourcingNameHasNextPage ?? false}
                fetchNextPage={OutsourcingeNameFetchNextPage}
                renderItem={(item, isHighlighted) => (
                  <div className={isHighlighted ? 'font-bold text-white p-1  bg-gray-400' : ''}>
                    {item.name}
                  </div>
                )}
                onSelect={handleSelectOutsourcing}
                // shouldShowList={true}
                isLoading={OutsourcingNameIsLoading || OutsourcingNameIsFetching}
                debouncedKeyword={debouncedOutsourcingKeyword}
                shouldShowList={isOutsourcingFocused}
                onFocus={() => setIsOutsourcingFocused(true)}
                onBlur={() => setIsOutsourcingFocused(false)}
              />
            </div>
          </div>

          <div className="flex">
            <label className="w-36  text-[14px] flex items-center border border-gray-400  justify-center bg-gray-300  font-bold text-center">
              차량번호
            </label>
            <div className="border border-gray-400 p-2 px-2 w-full">
              <CommonSelectByName
                fullWidth
                value={search.vehicleNumber || '선택'}
                onChange={async (value) => {
                  const selectedVehicleNumber = carNumberOptions.find(
                    (opt) => opt.vehicleNumber === value,
                  )
                  if (!selectedVehicleNumber) return

                  search.setField('vehicleNumber', selectedVehicleNumber.vehicleNumber)
                }}
                options={carNumberOptions}
                onScrollToBottom={() => {
                  if (carNumberHasNextPage && !carNumberIsFetching) carNumberFetchNextPage()
                }}
                onInputChange={(value) => setCarNumberSearch(value)}
                loading={carNumberLoading}
              />
            </div>
          </div>
          <div className="flex">
            <label className="w-36 text-[14px]   border border-gray-400  flex items-center justify-center bg-gray-300  font-bold text-center">
              기간
            </label>
            <div className="border border-gray-400 px-2 w-full flex gap-3 items-center ">
              <CommonDatePicker
                value={search.dateStartDate}
                onChange={(value) => search.setField('dateStartDate', value)}
              />
              ~
              <CommonDatePicker
                value={search.dateEndDate}
                onChange={(value) => search.setField('dateEndDate', value)}
              />
            </div>
          </div>
          <div className="flex">
            <label className="w-36 text-[14px]   border border-gray-400  flex items-center justify-center bg-gray-300  font-bold text-center"></label>
            <div className="border border-gray-400 px-2 w-full flex gap-3 items-center "></div>
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

            <div className="flex items-center gap-2">
              {/* <CommonButton
                label="삭제"
                variant="danger"
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

                  MaterialDeleteMutation.mutate({
                    materialManagementIds: idsArray,
                  })
                }}
                className="px-3"
              /> */}
              <CommonButton
                label="엑셀 다운로드"
                disabled={!hasExcelDownload}
                variant="reset"
                onClick={() => setModalOpen(true)}
                className="px-3"
              />

              {/* <ExcelModal open={modalOpen} onClose={() => setModalOpen(false)} /> */}
              <ExcelModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                title="유류집계 관리 - 엑셀 항목 선택"
                fieldMap={fieldMapArray}
                onDownload={handleDownloadExcel}
              />
              {/* <CommonButton
                label="+ 신규등록"
                disabled={!hasCreate}
                variant="secondary"
                onClick={() => openTab('/fuelAggregation/registration', '유류집계 관리 - 등록')}
                className="px-3"
              /> */}
            </div>
          </div>
        </div>
      </div>
      <div style={{ width: '100%' }}>
        <DataGrid
          rows={updateFuelList}
          columns={enhancedColumns.map((col) => ({
            ...col,
            sortable: false,
            headerAlign: 'center',
            align: 'center',
          }))}
          getRowId={(row) => row.rowId} // DataGrid에는 rowId를 유니크 키로 사용
          checkboxSelection
          disableRowSelectionOnClick
          keepNonExistentRowsSelected
          disableColumnFilter // 필터 비활성화
          hideFooter
          disableColumnMenu
          hideFooterPagination
          rowHeight={60}
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
