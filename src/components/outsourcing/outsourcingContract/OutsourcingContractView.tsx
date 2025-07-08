'use client'

import { DataGrid } from '@mui/x-data-grid'
import { BusinessDataList, SubmitOptions, UseORnotOptions } from '@/config/erp.confing'
import { Pagination } from '@mui/material'
import CommonInput from '@/components/common/Input'
import CommonSelect from '@/components/common/Select'
import CommonButton from '@/components/common/Button'
import { useOrderingContractSearchStore } from '@/stores/outsourcingContractStore'
import { OutsourcingContractService } from '@/services/outsourcingContract/outsourcingContractService'

export default function OutsourcingContractView() {
  const {
    handleListRemove,
    handleDownloadExcel,
    handleNewBusinessCreate,
    ArrayStatusOptions,
    displayedRows,
    page,
    sortList,
    setSortList,
    setPage,
    // pageSize,
    setSelectedIds,
    totalPages,
  } = OutsourcingContractService()

  const { search } = useOrderingContractSearchStore()

  // if (isLoading) return <LoadingSkeletion />
  // if (error) throw error

  // alert(data)

  return (
    <>
      <div className="border-10 border-gray-400 p-4">
        <div className="grid grid-cols-3">
          <div className="flex">
            <label className="w-36 text-[14px] flex items-center border border-gray-400  justify-center bg-gray-300  font-bold text-center">
              현장명
            </label>
            <div className="border border-gray-400 px-2 w-full flex gap-3 items-center ">
              <CommonSelect
                fullWidth={true}
                value={search.isActive}
                onChange={(value) => search.setField('isActive', value)}
                options={UseORnotOptions}
              />
            </div>
          </div>

          <div className="flex">
            <label className="w-36 text-[14px]  border border-gray-400  flex items-center justify-center bg-gray-300  font-bold text-center">
              공정명
            </label>
            <div className="border border-gray-400 px-2 w-full flex gap-3 items-center ">
              <CommonSelect
                fullWidth={true}
                value={search.isActive}
                onChange={(value) => search.setField('isActive', value)}
                options={UseORnotOptions}
              />
            </div>
          </div>

          <div className="flex">
            <label className="w-36 text-[14px]  border border-gray-400  flex items-center justify-center bg-gray-300  font-bold text-center">
              외주업체명
            </label>
            <div className="border border-gray-400 px-2 w-full flex justify-center items-center">
              <CommonInput
                value={search.ceoName}
                onChange={(value) => search.setField('ceoName', value)}
                className="flex-1"
              />
            </div>
          </div>

          <div className="flex">
            <label className="w-36 text-[14px]  border border-gray-400 flex items-center justify-center bg-gray-300  font-bold text-center">
              사업자등록번호
            </label>
            <div className="border border-gray-400 px-2 p-2 w-full flex justify-center items-center">
              <CommonInput
                value={search.phoneNumber}
                onChange={(value) => search.setField('phoneNumber', value)}
                className="flex-1"
              />
            </div>
          </div>

          <div className="flex">
            <label className="w-36 text-[14px]  border border-gray-400  flex items-center justify-center bg-gray-300  font-bold text-center">
              계약구분
            </label>
            <div className="border border-gray-400 px-2 w-full flex gap-3 items-center ">
              <CommonSelect
                fullWidth={true}
                value={search.isActive}
                onChange={(value) => search.setField('isActive', value)}
                options={UseORnotOptions}
              />
            </div>
          </div>
          <div className="flex">
            <label className="w-36 text-[14px] border border-gray-400  flex items-center justify-center bg-gray-300  font-bold text-center">
              계약기간
            </label>
            <div className="border border-gray-400 px-2 w-full flex gap-3 items-center ">
              {/* <CommonDatePicker
                value={search.startDate}
                onChange={(value) => search.setField('startDate', value)}
              />
              ~
              <CommonDatePicker
                value={search.endDate}
                onChange={(value) => search.setField('endDate', value)}
              /> */}
            </div>
          </div>

          <div className="flex">
            <label className="w-36 text-[14px]  border border-gray-400  flex items-center justify-center bg-gray-300  font-bold text-center">
              상태
            </label>
            <div className="border border-gray-400 px-2 w-full flex gap-3 items-center p-3">
              <CommonSelect
                fullWidth={true}
                value={search.isSubmit}
                onChange={(value) => search.setField('isSubmit', value)}
                options={SubmitOptions}
              />
            </div>
          </div>

          <div className="flex">
            <label className="w-36 text-[14px] border border-gray-400  flex items-center justify-center bg-gray-300  font-bold text-center">
              외주업체 담당자명
            </label>
            <div className="border border-gray-400 px-2 w-full flex justify-center items-center">
              <CommonInput
                value={search.ceoName}
                onChange={(value) => search.setField('ceoName', value)}
                className="flex-1"
              />
            </div>
          </div>
          <div className="flex">
            <label className="w-36 text-[14px] border border-gray-400  flex items-center justify-center bg-gray-300  font-bold text-center">
              본사 담당자명
            </label>

            <div className="border border-gray-400 px-2 w-full flex justify-center items-center">
              <CommonInput
                value={search.ceoName}
                onChange={(value) => search.setField('ceoName', value)}
                className="flex-1"
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
            onClick={search.handleSearch}
            className="mt-3 px-20"
          />
        </div>
      </div>

      <div className="mt-6 mb-4">
        <div className="bg-white flex justify-between items-center">
          {/* 왼쪽 상태 요약 */}
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <span className="font-medium">전체 999개</span>
            <span className="text-gray-500">(진행중 000 / 종료 000)</span>
          </div>

          {/* 오른쪽 컨트롤 영역 */}
          <div className="flex items-center gap-4">
            {/* 정렬 */}
            <div className="flex items-center gap-2">
              <span className="text-base font-medium text-gray-600">정렬</span>
              <CommonSelect
                value={sortList}
                fullWidth={false}
                onChange={setSortList}
                options={ArrayStatusOptions}
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-base font-medium text-gray-600">페이지당 목록 수</span>
              <CommonSelect
                value={sortList}
                fullWidth={false}
                onChange={setSortList}
                options={ArrayStatusOptions}
              />
            </div>

            <div className="flex items-center gap-2">
              <CommonButton
                label="삭제"
                variant="reset"
                onClick={handleListRemove}
                className="px-3"
              />
              <CommonButton
                label="엑셀 다운로드"
                variant="reset"
                onClick={handleDownloadExcel}
                className="px-3"
              />
              <CommonButton
                label="+ 신규등록"
                variant="secondary"
                onClick={handleNewBusinessCreate}
                className="px-3"
              />
            </div>
          </div>
        </div>
      </div>
      <div style={{ height: 500, width: '100%' }}>
        <DataGrid
          rows={displayedRows}
          columns={BusinessDataList.map((col) => ({
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
          // selectionMode={selectedIds}
          onRowSelectionModelChange={(newSelection) => setSelectedIds(newSelection)}
        />
        <div className="flex justify-center mt-4 pb-6">
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, newPage) => setPage(newPage)}
            shape="rounded"
            color="primary"
          />
        </div>
      </div>
    </>
  )
}
