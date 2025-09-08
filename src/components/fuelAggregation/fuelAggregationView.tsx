'use client'

import CommonButton from '../common/Button'
import CommonSelect from '../common/Select'
import CommonDatePicker from '../common/DatePicker'
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import { Checkbox, ListItemText, MenuItem, Pagination, Select } from '@mui/material'
import { useAccountStore } from '@/stores/accountManagementStore'
import { useRouter } from 'next/navigation'
import {
  ArrayStatusOptions,
  FuelColumnList,
  FuelStatusesing,
  PageCount,
} from '@/config/erp.confing'
import { useState } from 'react'
import ExcelModal from '../common/ExcelModal'
import { fuelExcelFieldMap } from '@/utils/userExcelField'
import { useManagementMaterial } from '@/hooks/useMaterialManagement'
import { getTodayDateString } from '@/utils/formatters'
import useOutSourcingContract from '@/hooks/useOutSourcingContract'
import CommonSelectByName from '../common/CommonSelectByName'
import { SitesProcessNameScroll } from '@/services/managementCost/managementCostRegistrationService'
import { useTabOpener } from '@/utils/openTab'
import { useFuelAggregation } from '@/hooks/useFuelAggregation'
import { FuelDataList, fuelStatuses } from '@/types/fuelAggregation'
import { useFuelSearchStore } from '@/stores/fuelAggregationStore'
import { FuelExcelDownload } from '@/services/fuelAggregation/fuelAggregationService'

export default function FuelAggregationView() {
  const openTab = useTabOpener()
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
    setSitesSearch,
    sitesOptions,
    siteNameFetchNextPage,
    siteNamehasNextPage,
    siteNameFetching,
    siteNameLoading,

    // 공정명
    setProcessSearch,
    processOptions,
    processInfoFetchNextPage,
    processInfoHasNextPage,
    processInfoIsFetching,
    processInfoLoading,

    // 업체명

    companyOptions,
    comPanyNameFetchNextPage,
    comPanyNamehasNextPage,
    comPanyNameFetching,
    comPanyNameLoading,
  } = useOutSourcingContract()

  const FuelDataList = FuelListQuery.data?.data.content ?? []

  const totalList = FuelListQuery.data?.data.pageInfo.totalElements ?? 0
  const pageCount = Number(search.pageCount) || 10
  const totalPages = Math.ceil(totalList / pageCount)

  const updateFuelList = FuelDataList.flatMap((fuel: FuelDataList, fuelIndex: number) => {
    const fuelInfo = fuel.fuelInfo

    return [
      {
        rowId: `fuel-${fuelIndex}`,
        backendId: fuel.id,
        fuelInfoId: fuelInfo?.id ?? null,

        outsourcingCompany: fuelInfo?.outsourcingCompany?.name ?? '-',
        createdAt: `${getTodayDateString(fuel.createdAt)} / ${getTodayDateString(fuel.updatedAt)}`,
        memo: fuelInfo?.memo ?? '-',

        // fuelInfo 필드
        driverName: fuelInfo?.driver.name ?? '-',
        vehicleNumber: fuelInfo?.equipment.vehicleNumber ?? '-',
        fuelType: fuelInfo?.fuelType ?? '-',
        fuelAmount: fuelInfo?.fuelAmount ?? '-',
        specification: fuelInfo?.equipment.specification ?? '-',
      },
    ]
  })

  const { setSelectedIds } = useAccountStore()

  const router = useRouter()

  // 그리도 라우팅 로직!
  const enhancedColumns = FuelColumnList.map((col): GridColDef => {
    if (col.field === 'vehicleNumber') {
      return {
        ...col,
        headerAlign: 'center',
        align: 'center',
        flex: 1,

        renderCell: (params: GridRenderCellParams) => {
          const materialId = params.row.backendId
          return (
            <div
              onClick={() => router.push(`/fuelAggregation/registration/${materialId}`)}
              className="flex justify-center items-center cursor-pointer"
            >
              <span className="text-orange-500 font-bold">{params.value}</span>
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
                    search.setField('processName', processes[0].name)
                  } else {
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
            <div className="border border-gray-400 p-2 px-2 w-full">
              <CommonSelectByName
                fullWidth
                value={search.outsourcingCompanyName || '선택'}
                onChange={async (value) => {
                  const selectedCompany = companyOptions.find((opt) => opt.name === value)
                  if (!selectedCompany) return

                  search.setField('outsourcingCompanyId', selectedCompany.id)
                  search.setField('outsourcingCompanyName', selectedCompany.name)
                }}
                options={companyOptions}
                onScrollToBottom={() => {
                  if (comPanyNamehasNextPage && !comPanyNameFetching) comPanyNameFetchNextPage()
                }}
                // onInputChange={(value) => setCompanySearch(value)}
                loading={comPanyNameLoading}
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
                variant="reset"
                onClick={() => setModalOpen(true)}
                className="px-3"
              />

              {/* <ExcelModal open={modalOpen} onClose={() => setModalOpen(false)} /> */}
              <ExcelModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                title="자재 관리 - 엑셀 항목 선택"
                fieldMap={fieldMapArray}
                onDownload={handleDownloadExcel}
              />
              <CommonButton
                label="+ 신규등록"
                variant="secondary"
                onClick={() => openTab('/fuelAggregation/registration', '유류집계 관리 - 등록')}
                className="px-3"
              />
            </div>
          </div>
        </div>
      </div>
      <div style={{ height: 500, width: '100%' }}>
        <DataGrid
          rows={updateFuelList}
          columns={enhancedColumns.map((col) => ({
            ...col,
            sortable: false,
            headerAlign: 'center',
            align: 'center',
            flex: 1,
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
