'use client'

import CommonButton from '../common/Button'
import CommonSelect from '../common/Select'
import CommonDatePicker from '../common/DatePicker'
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import { Pagination, Tooltip } from '@mui/material'
import { useAccountStore } from '@/stores/accountManagementStore'
import { useRouter } from 'next/navigation'
import { CostColumnList, LaborArrayStatusOptions, PageCount } from '@/config/erp.confing'
import { useEffect, useState } from 'react'
import ExcelModal from '../common/ExcelModal'
import { CostExcelFieldMap } from '@/utils/userExcelField'
import { CostExcelDownload } from '@/services/managementCost/managementCostService'
import { useManagementCost } from '@/hooks/useManagementCost'
import { useCostSearchStore } from '@/stores/managementCostsStore'
import { CostList } from '@/types/managementCost'
import { formatNumber, getTodayDateString } from '@/utils/formatters'
import useOutSourcingContract from '@/hooks/useOutSourcingContract'
import CommonSelectByName from '../common/CommonSelectByName'
import { useTabOpener } from '@/utils/openTab'
import { myInfoProps } from '@/types/user'
import { useMenuPermission } from '../common/MenuPermissionView'
import { CustomNoRowsOverlay } from '../common/NoData'

export default function ManagementCost() {
  const { search } = useCostSearchStore()

  const openTab = useTabOpener()

  const {
    CostListQuery,

    CostNameTypeMethodOptions,
    CostDeleteMutation,

    costDesOptions,
    setCostItemDesSearch,
    CostItemDesFetchNextPage,
    CostItemDeshasNextPage,
    CostItemDesFetching,
    CostItemDesLoading,
  } = useManagementCost()

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

  const CostDataList = CostListQuery.data?.data.content ?? []

  const totalList = CostListQuery.data?.data.pageInfo.totalElements ?? 0
  const pageCount = Number(search.pageCount) || 10
  const totalPages = Math.ceil(totalList / pageCount)

  const updateCostList = CostDataList.map((cost: CostList) => {
    return {
      ...cost,
      site: cost.site.name,
      process: cost.process.name,
      outsourcingCompany: cost.outsourcingCompany?.name,
      accountNumber: `${cost.outsourcingCompany.bankName ?? ''} / ${
        cost.outsourcingCompany.accountNumber ?? ''
      }`,
      hasFile: cost.hasFile === true ? 'Y' : 'N',
      businessNumber: cost.outsourcingCompany?.businessNumber ?? '-',
      ceoName: cost.outsourcingCompany?.ceoName ?? '-',
      accountHolder: cost.outsourcingCompany?.accountHolder ?? '-',
      supplyPrice: formatNumber(cost.supplyPrice) || '-',
      vat: formatNumber(cost.vat) || '-',
      total:
        formatNumber(cost.total) ||
        formatNumber(cost.mealFeeAmountTotal) ||
        formatNumber(cost.keyMoneyAmountTotal) ||
        '-',
      paymentDate: getTodayDateString(cost.paymentDate),
    }
  })

  const { selectedIds, setSelectedIds } = useAccountStore()

  const router = useRouter()

  // 그리도 라우팅 로직!
  const enhancedColumns = CostColumnList.map((col): GridColDef => {
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
    if (col.field === 'itemType') {
      return {
        ...col,
        headerAlign: 'center',
        align: 'center',
        flex: 1,

        renderCell: (params: GridRenderCellParams) => {
          const costId = params.row.id
          const handleClick = () => {
            if (hasModify) {
              router.push(`/managementCost/registration/${costId}`)
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
          // const no = (search.currentPage - 1) * pageCount + indexInCurrentPage + 1
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
  const fieldMapArray = Object.entries(CostExcelFieldMap).map(([label, value]) => ({
    label,
    value,
  }))

  const handleDownloadExcel = async (fields: string[]) => {
    await CostExcelDownload({
      sort: search.arraySort === '최신순' ? 'id,desc' : 'id,asc',
      siteName: search.siteName,
      processName: search.processName,
      itemType: search.itemType,
      itemTypeDescription: search.itemTypeDescription,
      paymentStartDate: getTodayDateString(search.paymentStartDate),
      paymentEndDate: getTodayDateString(search.paymentEndDate),
      fields,
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
  const { hasDelete, hasCreate, hasModify } = useMenuPermission(roleId, '관리비 관리', enabled)

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

                  // const res = await SitesProcessNameScroll({
                  //   pageParam: 0,
                  //   siteId: selectedSite.id,
                  //   keyword: '',
                  // })

                  // const processes = res.data?.content || []
                  // if (processes.length > 0) {
                  //   search.setField('processName', processes[0].name)
                  // } else {
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
              항목
            </label>
            <div className="border border-gray-400 px-2 w-full flex gap-2  justify-center items-center">
              <CommonSelect
                fullWidth
                className="text-2xl"
                value={search.itemType || 'BASE'}
                onChange={(value) => search.setField('itemType', value)}
                options={CostNameTypeMethodOptions}
              />
            </div>
          </div>

          {search.itemType === 'ETC' && (
            <div className="flex">
              <label className="w-36 text-[14px] flex items-center border border-gray-400 justify-center bg-gray-300 font-bold text-center">
                구분(설명)
              </label>
              <div className="border border-gray-400 p-2 w-full">
                <CommonSelectByName
                  fullWidth
                  value={search.itemTypeDescription || '선택'}
                  onChange={async (value) => {
                    const selectedEtcDes = costDesOptions.find(
                      (opt) => opt.itemTypeDescription === value,
                    )
                    if (!selectedEtcDes) return
                    search.setField('itemTypeDescription', selectedEtcDes.itemTypeDescription)
                  }}
                  options={costDesOptions}
                  displayLabel
                  onScrollToBottom={() => {
                    if (CostItemDeshasNextPage && !CostItemDesFetching) {
                      CostItemDesFetchNextPage()
                    }
                  }}
                  onInputChange={(value) => setCostItemDesSearch(value)}
                  loading={CostItemDesLoading}
                />
              </div>
            </div>
          )}
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

                  search.setField('outsourcingCompanyName', selectedCompany.name)
                }}
                options={companyOptions}
                onScrollToBottom={() => {
                  if (comPanyNamehasNextPage && !comPanyNameFetching) comPanyNameFetchNextPage()
                }}
                loading={comPanyNameLoading}
              />
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
                label="삭제"
                disabled={!hasDelete}
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
                    CostDeleteMutation.mutate({
                      managementCostIds: idsArray,
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
                title="관리비 관리 - 엑셀 항목 선택"
                fieldMap={fieldMapArray}
                onDownload={handleDownloadExcel}
              />
              <CommonButton
                label="+ 신규등록"
                disabled={!hasCreate}
                variant="secondary"
                onClick={() => openTab('/managementCost/registration', '관리비 관리 - 등록')}
                className="px-3"
              />
            </div>
          </div>
        </div>
      </div>
      <div style={{ width: '100%' }}>
        <DataGrid
          rows={updateCostList}
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

      {/* <ContractHistory open={contract} onClose={() => setContract(false)} /> */}
    </>
  )
}
