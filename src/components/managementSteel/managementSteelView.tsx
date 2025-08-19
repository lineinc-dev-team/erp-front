'use client'

import CommonButton from '../common/Button'
import CommonSelect from '../common/Select'
import CommonDatePicker from '../common/DatePicker'
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import { Pagination } from '@mui/material'
import { useAccountStore } from '@/stores/accountManagementStore'
import { useRouter } from 'next/navigation'
import { ArrayStatusOptions, PageCount, SteelColumnList } from '@/config/erp.confing'
import { useState } from 'react'
import ExcelModal from '../common/ExcelModal'
import { SteelExcelFieldMap } from '@/utils/userExcelField'
import CommonInput from '../common/Input'
import { useManagementSteel } from '@/hooks/useManagementSteel'
import { SteelList } from '@/types/managementSteel'
import { getTodayDateString } from '@/utils/formatters'
import { useSteelSearchStore } from '@/stores/managementSteelStore'
import {
  ManagementSteelService,
  SteelExcelDownload,
} from '@/services/managementSteel/managementSteelService'
import CommonSelectByName from '../common/CommonSelectByName'
import useOutSourcingContract from '@/hooks/useOutSourcingContract'
import { SitesProcessNameScroll } from '@/services/managementCost/managementCostRegistrationService'

export default function ManagementSteel() {
  const { handleNewSteelCreate } = ManagementSteelService()

  const { search } = useSteelSearchStore()

  const {
    // SteelDeleteMutation,
    SteelListQuery,
    SteelApproveMutation,
    SteelTypeMethodOptions,
    SteelReleaseMutation,
  } = useManagementSteel()

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

    setCompanySearch,
    companyOptions,
    comPanyNameFetchNextPage,
    comPanyNamehasNextPage,
    comPanyNameFetching,
    comPanyNameLoading,
  } = useOutSourcingContract()

  const SteelDataList = SteelListQuery.data?.data.content ?? []

  const totalList = SteelListQuery.data?.data.pageInfo.totalElements ?? 0
  const pageCount = Number(search.pageCount) || 10
  const totalPages = Math.ceil(totalList / pageCount)

  console.log('SteelDataListSteelDataList', SteelDataList)

  const updateSteelList = SteelDataList.flatMap((steel: SteelList) => {
    return {
      id: steel.id, // 고유 ID
      usage: steel.usage,
      type: steel.type,
      typeCode: steel.typeCode,

      // 날짜들 (string 변환 처리)
      orderDate: steel.orderDate ? getTodayDateString(steel.orderDate) : '-',
      startDate:
        steel.startDate && steel.endDate
          ? `${getTodayDateString(steel.startDate)} ~ ${getTodayDateString(steel.endDate)}`
          : '-',

      endDate: steel.endDate ? getTodayDateString(steel.endDate) : '-',
      approvalDate: steel.approvalDate ? getTodayDateString(steel.approvalDate) : '-',
      releaseDate: steel.releaseDate ? getTodayDateString(steel.releaseDate) : '-',

      memo: steel.memo,

      // 관계 객체
      site: steel.site?.name ?? '',
      process: steel.process?.name ?? '',
      outsourcingCompanyName: steel.outsourcingCompany?.name ?? '-',
      outsourcingCompanyBusinessNumber: steel.outsourcingCompany?.businessNumber ?? '-',

      // 숫자
      totalAmount: steel.totalAmount ?? null,
    }
  })

  const { selectedIds, setSelectedIds } = useAccountStore()

  const router = useRouter()

  // 그리도 라우팅 로직!
  const enhancedColumns = SteelColumnList.map((col): GridColDef => {
    if (col.field === 'process') {
      return {
        ...col,
        headerAlign: 'center',
        align: 'center',
        flex: 1,
        renderCell: (params: GridRenderCellParams) => {
          const steelId = params.row.id
          return (
            <div
              onClick={() => router.push(`/managementSteel/registration/${steelId}`)}
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
          const no = (search.currentPage - 1) * pageCount + indexInCurrentPage + 1
          return <span>{no}</span>
        },
      }
    }

    if (col.field === 'type') {
      return {
        ...col,
        headerAlign: 'center',
        align: 'center',
        flex: 1,
        renderCell: (params: GridRenderCellParams) => {
          const value = params.value

          const className =
            value === '승인'
              ? 'text-blue-500 font-bold'
              : value === '반출'
              ? 'text-red-500 font-bold'
              : ''

          return <span className={className}>{value}</span>
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
  const fieldMapArray = Object.entries(SteelExcelFieldMap).map(([label, value]) => ({
    label,
    value,
  }))

  const handleDownloadExcel = async (fields: string[]) => {
    await SteelExcelDownload({
      sort: search.arraySort === '최신순' ? 'id,desc' : 'id,asc',
      siteName: search.siteName,
      processName: search.processName,
      outsourcingCompanyName: search.outsourcingCompanyName,
      itemName: search.itemName,
      type: search.type,
      startDate: search.startDate ? getTodayDateString(search.startDate) : undefined,
      endDate: search.endDate ? getTodayDateString(search.endDate) : undefined,
      fields, // 필수 필드: ["id", "name", "businessNumber", ...] })
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
              품목
            </label>
            <div className="border border-gray-400 px-2 w-full flex gap-2  justify-center items-center">
              <CommonInput
                value={search.itemName}
                onChange={(value) => search.setField('itemName', value)}
                className=" flex-1"
              />
            </div>
          </div>
          <div className="flex">
            <label className="w-36 text-[14px] flex items-center border border-gray-400 justify-center bg-gray-300 font-bold text-center">
              구분
            </label>
            <div className="border flex items-center p-2 gap-4 border-gray-400 px-2 w-full">
              <CommonSelect
                fullWidth={true}
                className="text-2xl"
                value={search.type || 'BASE'}
                displayLabel
                onChange={(value) => search.setField('type', value)}
                options={SteelTypeMethodOptions}
              />
            </div>
          </div>
          <div className="flex">
            <label className="w-36 text-[14px]  border border-gray-400  flex items-center justify-center bg-gray-300  font-bold text-center">
              업체명
            </label>
            <div className="border border-gray-400 p-2 px-2 w-full">
              <CommonSelectByName
                fullWidth
                value={search.outsourcingCompanyName || '선택'}
                onChange={async (value) => {
                  const selectedCompany = companyOptions.find((opt) => opt.name === value)
                  if (!selectedCompany) return

                  search.setField('outsourcingCompanyName', selectedCompany.name)
                }}
                options={companyOptions}
                onScrollToBottom={() => {
                  if (comPanyNamehasNextPage && !comPanyNameFetching) comPanyNameFetchNextPage()
                }}
                onInputChange={(value) => setCompanySearch(value)}
                loading={comPanyNameLoading}
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

            <div className="flex items-center gap-3">
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

                  if (window.confirm('정말 삭제하시겠습니까?')) {
                    SteelDeleteMutation.mutate({ steelManagementIds: idsArray })
                  }
                }}
                className="px-3"
              /> */}
              <CommonButton
                label="승인"
                variant="primary"
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

                  // 이미 승인된 항목이 있는지 확인
                  const alreadyApproved = SteelDataList.filter(
                    (steel: SteelList) => idsArray.includes(steel.id) && steel.type === '승인',
                  )

                  if (alreadyApproved.length > 0) {
                    alert('이미 승인된 항목이 포함되어 있습니다.')
                    return
                  }

                  // 승인 요청
                  SteelApproveMutation.mutate({ steelManagementIds: idsArray })
                  selectedIds.ids.clear() // 체크박스 초기화
                }}
                className="px-3"
              />

              <CommonButton
                label="반출"
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

                  // 이미 승인된 항목이 있는지 확인
                  const alreadyReleased = SteelDataList.filter(
                    (steel: SteelList) => idsArray.includes(steel.id) && steel.type === '반출',
                  )

                  if (alreadyReleased.length > 0) {
                    alert('이미 반출된 항목이 포함되어 있습니다.')
                    return
                  }

                  // 승인 요청
                  SteelReleaseMutation.mutate({ steelManagementIds: idsArray })
                  selectedIds.ids.clear() // 체크박스 초기화
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
                title="강재수불부 - 엑셀 항목 선택"
                fieldMap={fieldMapArray}
                onDownload={handleDownloadExcel}
              />
              <CommonButton
                label="+ 신규등록"
                variant="secondary"
                onClick={handleNewSteelCreate}
                className="px-3"
              />
            </div>
          </div>
        </div>
      </div>
      <div style={{ height: 500, width: '100%' }}>
        <DataGrid
          rows={updateSteelList}
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

      {/* <ContractHistory open={contract} onClose={() => setContract(false)} /> */}
    </>
  )
}
