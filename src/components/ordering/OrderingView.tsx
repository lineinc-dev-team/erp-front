'use client'

import CommonButton from '../common/Button'
import CommonInput from '../common/Input'
import CommonSelect from '../common/Select'
import CommonDatePicker from '../common/DatePicker'
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import { ArrayStatusOptions, PageCount, UseORnotOptions } from '@/config/erp.confing'
import { Button, Checkbox, FormControlLabel, Grid, Pagination } from '@mui/material'
import { useOrderingSearchStore } from '@/stores/orderingStore'
import { OrderingService } from '@/services/ordering/orderingService'
import CommonModal from '../common/Modal'
import ContractHistory from '../common/ContractHistory'
import { useRouter } from 'next/navigation'

export default function OrderingView() {
  const {
    modalOpen,
    setModalOpen,
    selectedFields,
    handleToggleField,
    handleSelectAll,
    handleReset,
    excelFields,
    printMode,
    handlePrint,
    handleNewOrderCreate,
    displayedRows,
    contract,
    setContract,
    page,
    setPage,
    totalPages,
    filteredColumns,
    handleExcelDownload,
  } = OrderingService()

  const { search } = useOrderingSearchStore()

  const router = useRouter()

  const enhancedColumns = filteredColumns.map((col): GridColDef => {
    if (col.field === 'siteCode') {
      return {
        ...col,
        headerAlign: 'center',
        align: 'center',
        flex: 1,

        renderCell: (params: GridRenderCellParams) => {
          if (params.field === 'siteCode') {
            return (
              <div
                onClick={() => router.push(`/ordering/registration/20`)}
                className="flex justify-center items-center cursor-pointer"
              >
                <span className="text-orange-500 font-bold">{params.value}</span>
              </div>
            )
          }
        },
      }
    }
    console.log('@24@', col)
    if (col.field === 'remark') {
      return {
        ...col,
        sortable: false,
        headerAlign: 'center',
        align: 'center',
        flex: 1,
        renderCell: (params: GridRenderCellParams) => {
          console.log('@@@', params)
          if (params.value === '확인') {
            return (
              <div
                onClick={(e) => {
                  e.preventDefault()
                  setContract(true)
                }}
                className="flex justify-center items-center cursor-pointer"
              >
                <button className=" text-blue-500 font-bold">{params.value}</button>
              </div>
            )
          }
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

  // if (isLoading) return <LoadingSkeletion />
  // if (error) throw error

  // alert(data)

  return (
    <>
      <div className="border-10 border-gray-400 p-4">
        <div className="grid grid-cols-3">
          <div className="flex">
            <label className="w-36 text-[14px] flex items-center border border-gray-400  justify-center bg-gray-300  font-bold text-center">
              발주처명
            </label>
            <div className="border border-gray-400 px-2 w-full">
              <CommonInput
                value={search.name}
                onChange={(value) => search.setField('name', value)}
                className=" flex-1"
              />
            </div>
          </div>

          <div className="flex">
            <label className="w-36 text-[14px]  border border-gray-400  flex items-center justify-center bg-gray-300  font-bold text-center">
              사업자등록번호
            </label>
            <div className="border border-gray-400 px-2 w-full">
              <CommonInput
                value={search.businessNumber}
                onChange={(value) => search.setField('businessNumber', value)}
                className="flex-1"
              />
            </div>
          </div>

          <div className="flex">
            <label className="w-36 text-[14px]  border border-gray-400  flex items-center justify-center bg-gray-300  font-bold text-center">
              대표자명
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
            <label className="w-36 text-[14px]  border border-gray-400  flex items-center justify-center bg-gray-300  font-bold text-center">
              전화번호
            </label>
            <div className="border border-gray-400 px-2 w-full flex justify-center items-center">
              <CommonInput
                value={search.landlineNumber}
                onChange={(value) => search.setField('landlineNumber', value)}
                className="flex-1"
              />
            </div>
          </div>
          <div className="flex">
            <label className="w-36 text-[14px]  border border-gray-400  flex items-center justify-center bg-gray-300  font-bold text-center">
              발주처 담당자명
            </label>
            <div className="border border-gray-400 px-2 w-full flex justify-center items-center">
              <CommonInput
                value={search.orderCEOname}
                onChange={(value) => search.setField('orderCEOname', value)}
                className="flex-1"
              />
            </div>
          </div>

          <div className="flex">
            <label className="w-36 text-[14px] border border-gray-400  flex items-center justify-center bg-gray-300  font-bold text-center">
              이메일
            </label>
            <div className="border border-gray-400 px-2 w-full flex gap-3 items-center ">
              <CommonInput
                value={search.email}
                onChange={(value) => search.setField('email', value)}
                className=" flex-1"
              />
            </div>
          </div>

          <div className="flex">
            <label className="w-36  border border-gray-400  flex items-center justify-center bg-gray-300  font-bold text-center">
              등록일자
            </label>
            <div className="border border-gray-400 px-2 w-full flex gap-3 items-center ">
              <CommonDatePicker
                value={search.startDate}
                onChange={(value) => search.setField('startDate', value)}
              />
              ~
              <CommonDatePicker
                value={search.startDate}
                onChange={(value) => search.setField('startDate', value)}
              />
            </div>
          </div>

          <div className="flex">
            <label className="w-36 text-[14px] border border-gray-400  flex items-center justify-center bg-gray-300  font-bold text-center">
              본사 담당자명
            </label>
            <div className="border border-gray-400 px-2 w-full flex gap-3 items-center ">
              <CommonInput
                value={search.bossName}
                onChange={(value) => search.setField('bossName', value)}
                className=" flex-1"
              />
            </div>
          </div>
          <div className="flex">
            <label className="w-36 text-[14px] border border-gray-400  flex items-center justify-center bg-gray-300  font-bold text-center">
              사용 여부
            </label>
            <div className="border border-gray-400 px-2 w-full flex items-center">
              <CommonSelect
                className="text-2xl w-full"
                value={search.isActive}
                onChange={(value) => search.setField('isActive', value)}
                options={UseORnotOptions}
                fullWidth={true}
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
            <div className="flex items-center gap-2">
              <span className="text-base font-medium text-gray-600">정렬</span>
              <CommonSelect
                value={search.arraySort}
                className="text-2xl w-full"
                onChange={(value) => search.setField('arraySort', value)}
                options={ArrayStatusOptions}
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-base font-medium text-gray-600">페이지당 목록 수</span>
              <CommonSelect
                value={search.pageCount}
                className="text-2xl w-full"
                onChange={(value) => search.setField('pageCount', value)}
                options={PageCount}
              />
            </div>

            <div className="flex items-center gap-2">
              <CommonButton
                label="삭제"
                variant="reset"
                onClick={search.handleOrderingListRemove}
                className="px-3"
              />
              <CommonButton
                label="엑셀 다운로드"
                variant="reset"
                onClick={() => setModalOpen(true)}
                className="px-3"
              />
              <CommonButton
                label="+ 신규등록"
                variant="secondary"
                onClick={handleNewOrderCreate}
                className="px-3"
              />
            </div>
          </div>
        </div>
      </div>
      <div style={{ height: 500, width: '100%' }}>
        <DataGrid
          rows={displayedRows}
          columns={enhancedColumns}
          checkboxSelection={!printMode} // 프린트 시 체크박스 제거
          disableRowSelectionOnClick
          keepNonExistentRowsSelected
          showToolbar
          disableColumnFilter
          hideFooter
          disableColumnMenu
          hideFooterPagination
          rowHeight={60}
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

      {/* 엑셀 모달 */}

      <CommonModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="발주처 관리 - 엑셀 출력 항목 선택"
        actions={
          <>
            <Button onClick={handlePrint}>프린트</Button>
            <Button variant="contained" onClick={handleExcelDownload}>
              엑셀 다운로드
            </Button>
            <Button onClick={() => setModalOpen(false)}>닫기</Button>
          </>
        }
      >
        <Grid container spacing={1}>
          {excelFields.map((field) => (
            <Grid key={field}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={selectedFields.includes(field)}
                    onChange={() => handleToggleField(field)}
                  />
                }
                label={field}
              />
            </Grid>
          ))}
        </Grid>
        <div className="flex gap-2 mt-4">
          <Button variant="outlined" onClick={handleReset}>
            초기화
          </Button>
          <Button variant="outlined" onClick={handleSelectAll}>
            전체 선택
          </Button>
        </div>
      </CommonModal>

      <ContractHistory open={contract} onClose={() => setContract(false)} />
    </>
  )
}
