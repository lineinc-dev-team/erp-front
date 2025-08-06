'use client'

import CommonButton from '../common/Button'
import CommonSelect from '../common/Select'
import CommonDatePicker from '../common/DatePicker'
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import { Pagination } from '@mui/material'
import { useAccountStore } from '@/stores/accountManagementStore'
import { useRouter } from 'next/navigation'
import {
  ArrayStatusOptions,
  CostColumnList,
  itemTypeOptions,
  PageCount,
} from '@/config/erp.confing'
import { useState } from 'react'
import ExcelModal from '../common/ExcelModal'
import { CostExcelFieldMap } from '@/utils/userExcelField'
import {
  CostExcelDownload,
  ManagementCostService,
} from '@/services/managementCost/managementCostService'
import { useManagementCost } from '@/hooks/useManagementCost'
import { useCostSearchStore } from '@/stores/managementCostsStore'
import { CostList } from '@/types/managementCost'
import { getTodayDateString } from '@/utils/formatters'

export default function ManagementCost() {
  const { handleNewCostCreate } = ManagementCostService()

  const { search } = useCostSearchStore()

  const {
    CostListQuery,
    setSitesSearch,
    sitesOptions,
    setProcessSearch,
    processOptions,

    siteNameFetchNextPage,
    siteNamehasNextPage,
    siteNameFetching,
    siteNameLoading,

    processInfoFetchNextPage,
    processInfoHasNextPage,
    processInfoIsFetching,
    processInfoLoading,
    CostDeleteMutation,
  } = useManagementCost()

  const CostDataList = CostListQuery.data?.data.content ?? []

  const totalList = CostListQuery.data?.data.pageInfo.totalElements ?? 0
  const pageCount = Number(search.pageCount) || 10
  const totalPages = Math.ceil(totalList / pageCount)

  const updateCostList = CostDataList.map((cost: CostList) => {
    const supplyPrices = cost.details.map((d) => Number(d.supplyPrice).toLocaleString()).join(', ')

    const vats = cost.details.map((d) => Number(d.vat).toLocaleString()).join(', ')

    const totals = cost.details.map((d) => Number(d.total).toLocaleString()).join(', ')

    const memos = cost.details.map((d) => d.memo).join(', ')

    console.log('vatsvatsvats', vats)
    return {
      ...cost,
      site: cost.site.name,
      process: cost.process.name,
      hasFile: 'Y',
      paymentDate: getTodayDateString(cost.paymentDate),
      supplyPrice: supplyPrices,
      vat: vats,
      total: totals,
      memo: memos,
    }
  })

  const { selectedIds, setSelectedIds } = useAccountStore()

  const router = useRouter()

  // 그리도 라우팅 로직!
  const enhancedColumns = CostColumnList.map((col): GridColDef => {
    if (col.field === 'itemType') {
      return {
        ...col,
        headerAlign: 'center',
        align: 'center',
        flex: 1,

        renderCell: (params: GridRenderCellParams) => {
          const costId = params.row.id
          return (
            <div
              onClick={() => router.push(`/managementCost/registration/${costId}`)}
              className="flex justify-center items-center cursor-pointer"
            >
              <span className="text-orange-500 font-bold">{params.value}</span>
            </div>
          )
        },
      }
    }
    if (col.field === 'remark') {
      return {
        ...col,
        sortable: false,
        headerAlign: 'center',
        align: 'center',
        flex: 1,
        renderCell: (params: GridRenderCellParams) => {
          return <span>{params.value}</span>
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
  const fieldMapArray = Object.entries(CostExcelFieldMap).map(([label, value]) => ({
    label,
    value,
  }))

  const handleDownloadExcel = async (fields: string[]) => {
    await CostExcelDownload({ fields })
  }
  return (
    <>
      <div className="border-10 border-gray-400 p-4">
        <div className="grid grid-cols-3">
          <div className="flex">
            <label className="w-36  text-[14px] flex items-center border border-gray-400 justify-center bg-gray-300 font-bold text-center">
              현장명
            </label>
            <div className="border border-gray-400 px-2 p-2 w-full flex items-center">
              <CommonSelect
                fullWidth
                className="text-xl"
                value={sitesOptions.find((opt) => opt.id === search.name)?.name || '0'} // UI에 보여질 값은 id 기반 (value)
                onChange={(value) => {
                  const selected = sitesOptions.find((opt) => opt.name === value)
                  search.setField('name', selected?.id ?? '') // ← label 값을 상태로 저장
                }}
                options={sitesOptions}
                displayLabel
                onScrollToBottom={() => {
                  if (siteNamehasNextPage && !siteNameFetching) siteNameFetchNextPage()
                }}
                onInputChange={(value) => setSitesSearch(value)}
                loading={siteNameLoading}
              />
            </div>
          </div>
          <div className="flex">
            <label className="w-36  text-[14px] flex items-center border border-gray-400 justify-center bg-gray-300 font-bold text-center">
              공정명
            </label>
            <div className="border border-gray-400 px-2 p-2 w-full flex items-center">
              <CommonSelect
                fullWidth
                className="text-xl"
                value={processOptions.find((opt) => opt.id === search.processName)?.name || '0'}
                onChange={(value) => {
                  const selected = processOptions.find((opt) => opt.name === value)
                  search.setField('processName', selected?.id ?? '')
                }}
                // value={search.processName}
                // onChange={(value) => search.setField('processName', value)}
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
              항목
            </label>
            <div className="border border-gray-400 px-2 w-full flex gap-2  justify-center items-center">
              <CommonSelect
                fullWidth={true}
                className="text-2xl"
                value={search.itemType}
                displayLabel
                onChange={(value) => search.setField('itemType', value)}
                options={itemTypeOptions}
              />
              {/* <CommonInput
                value={search.itemDescription}
                onChange={(value) => search.setField('itemDescription', value)}
                className=" flex-1"
              /> */}
            </div>
          </div>
          <div className="flex">
            <label className="w-36 text-[14px]  border border-gray-400  flex items-center justify-center bg-gray-300  font-bold text-center">
              업체명
            </label>
            <div className="border border-gray-400 p-2 px-2 w-full flex justify-center items-center">
              {/* <CommonSelect
                fullWidth={true}
                className="text-xl"
                value={search.type}
                displayLabel
                onChange={(value) =>
                  search.setField(
                    'type',
                    value as 'CONSTRUCTION' | 'CIVIL_ENGINEERING' | 'OUTSOURCING' | '선택',
                  )
                }
                options={SiteOptions}
              /> */}
            </div>
          </div>
          <div className="flex">
            <label className="w-36  border border-gray-400  flex items-center justify-center bg-gray-300  font-bold text-center">
              일자(기간)
            </label>
            <div className="border border-gray-400 px-2 w-full flex gap-3 items-center ">
              <CommonDatePicker
                value={search.paymentStartDate}
                onChange={(value) => search.setField('paymentStartDate', value)}
              />
              ~
              <CommonDatePicker
                value={search.paymentEndDate}
                onChange={(value) => search.setField('paymentEndDate', value)}
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

                  CostDeleteMutation.mutate({
                    managementCostIds: idsArray,
                  })
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
                variant="secondary"
                onClick={handleNewCostCreate}
                className="px-3"
              />
            </div>
          </div>
        </div>
      </div>
      <div style={{ height: 500, width: '100%' }}>
        <DataGrid
          rows={updateCostList}
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
          showToolbar
          disableColumnFilter // 필터 비활성화
          hideFooter
          disableColumnMenu
          hideFooterPagination
          // pageSize={pageSize}
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

      {/* <ContractHistory open={contract} onClose={() => setContract(false)} /> */}
    </>
  )
}
