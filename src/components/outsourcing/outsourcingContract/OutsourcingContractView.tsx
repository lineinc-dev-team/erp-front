'use client'

import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import { ArrayStatusOptions, outsourcingContractListData, PageCount } from '@/config/erp.confing'
import { Pagination } from '@mui/material'
import CommonInput from '@/components/common/Input'
import CommonSelect from '@/components/common/Select'
import CommonButton from '@/components/common/Button'
import { useContractSearchStore } from '@/stores/outsourcingContractStore'
import useOutSourcingContract from '@/hooks/useOutSourcingContract'
import CommonDatePicker from '@/components/common/DatePicker'
import { useSnackbarStore } from '@/stores/useSnackbarStore'
import { useAccountStore } from '@/stores/accountManagementStore'
import { useRouter } from 'next/navigation'
import { useTabOpener } from '@/utils/openTab'
import { OutsourcingContractList } from '@/types/outsourcingContract'
import { getTodayDateString } from '@/utils/formatters'
import CommonSelectByName from '@/components/common/CommonSelectByName'
import { SitesProcessNameScroll } from '@/services/managementCost/managementCostRegistrationService'
import ExcelModal from '@/components/common/ExcelModal'
import { useState } from 'react'
import { OutsourcingContractExcelDownload } from '@/services/outsourcingContract/outsourcingContractService'
import { outsourcingContractExcelFieldMap } from '@/utils/userExcelField'

export default function OutsourcingContractView() {
  const { search } = useContractSearchStore()

  const { showSnackbar } = useSnackbarStore()
  const openTab = useTabOpener()

  const {
    OutsourcingContractListQuery,
    statusMethodOptions,
    typeMethodOptions,

    OutsourcingContractDeleteMutation,

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

  const OutsourcingContractDataList = OutsourcingContractListQuery.data?.data.content ?? []

  const totalList = OutsourcingContractListQuery.data?.data.pageInfo.totalElements ?? 0
  const pageCount = Number(search.pageCount) || 10
  const totalPages = Math.ceil(totalList / pageCount)

  const { selectedIds, setSelectedIds } = useAccountStore()

  const router = useRouter()

  // 리스트 데이터 파싱

  const updateOutsourcingList = OutsourcingContractDataList.map((user: OutsourcingContractList) => {
    const mainContact = user.contacts?.find((contact) => contact.isMain === true)

    return {
      ...user,
      type: user.contractType,
      contactName: mainContact?.name || '-',
      hasFile: 'Y',
      contractStartDate: `${getTodayDateString(user.contractStartDate)} / ${getTodayDateString(
        user.contractEndDate,
      )}`,
    }
  })

  // 그리도 라우팅 로직!
  const enhancedColumns = outsourcingContractListData.map((col): GridColDef => {
    if (col.field === 'companyName') {
      return {
        ...col,
        headerAlign: 'center',
        align: 'center',
        flex: 1,

        renderCell: (params: GridRenderCellParams) => {
          const clientId = params.row.id
          return (
            <div
              onClick={() => router.push(`/outsourcingContract/registration/${clientId}`)}
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
  // userExcelFieldMap 객체를 { label: string, value: string }[] 배열로 바꿔줍니다.

  const fieldMapArray = Object.entries(outsourcingContractExcelFieldMap).map(([label, value]) => ({
    label,
    value,
  }))

  const handleDownloadExcel = async (fields: string[]) => {
    await OutsourcingContractExcelDownload({
      sort: search.arraySort === '최신순' ? 'id,desc' : 'id,asc',
      siteName: search.siteName,
      processName: search.processName,
      companyName: search.companyName,
      businessNumber: search.businessNumber,
      contractType: search.contractType,
      contractStatus: search.contractStatus,
      contractStartDate: search.contractStartDate
        ? getTodayDateString(search.contractStartDate)
        : undefined,
      contractEndDate: search.contractEndDate
        ? getTodayDateString(search.contractEndDate)
        : undefined,
      contactName: search.contactName,
      fields, // 필수 필드: ["id", "name", "businessNumber", ...]
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
                    search.setField('processId', processes[0].id)
                    search.setField('processName', processes[0].name)
                  } else {
                    search.setField('processId', 0)
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
            <label className="w-36 text-[14px]  border border-gray-400  flex items-center justify-center bg-gray-300  font-bold text-center">
              외주업체명
            </label>
            <div className="border border-gray-400 px-2 w-full flex justify-center items-center">
              <CommonInput
                value={search.companyName}
                onChange={(value) => search.setField('companyName', value)}
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
                value={search.businessNumber}
                onChange={(value) => search.setField('businessNumber', value)}
                className="flex-1"
              />
            </div>
          </div>

          <div className="flex">
            <label className="w-36 text-[14px]  border border-gray-400  flex items-center justify-center bg-gray-300  font-bold text-center">
              구분
            </label>
            <div className="border border-gray-400 px-2 w-full flex gap-3 items-center ">
              <CommonSelect
                fullWidth={true}
                value={search.contractType || 'BASE'}
                onChange={(value) => search.setField('contractType', value)}
                options={typeMethodOptions}
              />
            </div>
          </div>
          <div className="flex">
            <label className="w-36 text-[14px] border border-gray-400  flex items-center justify-center bg-gray-300  font-bold text-center">
              계약기간
            </label>
            <div className="border border-gray-400 px-2 w-full flex gap-3 items-center ">
              <CommonDatePicker
                value={search.contractStartDate}
                onChange={(value) => {
                  search.setField('contractStartDate', value)

                  if (
                    value !== null &&
                    search.contractEndDate !== null &&
                    new Date(search.contractEndDate) < new Date(value)
                  ) {
                    search.setField('contractEndDate', value)
                  }
                }}
              />
              ~
              <CommonDatePicker
                value={search.contractEndDate}
                onChange={(value) => {
                  if (
                    value !== null &&
                    search.contractStartDate !== null &&
                    new Date(value) < new Date(search.contractStartDate)
                  ) {
                    showSnackbar('종료일은 시작일 이후여야 합니다.', 'error')
                    return
                  }
                  search.setField('contractEndDate', value)
                }}
              />
            </div>
          </div>

          <div className="flex">
            <label className="w-36 text-[14px]  border border-gray-400  flex items-center justify-center bg-gray-300  font-bold text-center">
              상태
            </label>
            <div className="border border-gray-400 px-2 w-full flex gap-3 items-center p-3">
              <CommonSelect
                fullWidth={true}
                value={search.contractStatus || 'BASE'}
                onChange={(value) => search.setField('contractStatus', value)}
                options={statusMethodOptions}
              />
            </div>
          </div>

          <div className="flex">
            <label className="w-36 text-[14px] border border-gray-400  flex items-center justify-center bg-gray-300  font-bold text-center">
              담당자명
            </label>
            <div className="border border-gray-400 px-2 w-full flex justify-center items-center">
              <CommonInput
                value={search.contactName}
                onChange={(value) => search.setField('contactName', value)}
                className="flex-1"
              />
            </div>
          </div>
          <div className="flex">
            <label className="w-36 text-[14px] border border-gray-400  flex items-center justify-center bg-gray-300  font-bold text-center"></label>

            <div className="border border-gray-400 px-2 w-full flex justify-center items-center"></div>
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

                  OutsourcingContractDeleteMutation.mutate({
                    contractIds: idsArray,
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

              <ExcelModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                title="발주처 관리 - 엑셀 항목 선택"
                fieldMap={fieldMapArray}
                onDownload={handleDownloadExcel}
              />
              <CommonButton
                label="+ 신규등록"
                variant="secondary"
                onClick={() => openTab('/outsourcingContract/registration', '외주계약 - 등록')}
                className="px-3"
              />
            </div>
          </div>
        </div>
      </div>
      <div style={{ height: 500, width: '100%' }}>
        <DataGrid
          rows={updateOutsourcingList}
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
