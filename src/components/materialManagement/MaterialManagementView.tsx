'use client'

import CommonButton from '../common/Button'
import CommonSelect from '../common/Select'
import CommonDatePicker from '../common/DatePicker'
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import { Pagination } from '@mui/material'
import { useAccountStore } from '@/stores/accountManagementStore'
import { useRouter } from 'next/navigation'
import { ArrayStatusOptions, MaterialColumnList, PageCount } from '@/config/erp.confing'
import { useState } from 'react'
import ExcelModal from '../common/ExcelModal'
import { MaterialExcelFieldMap } from '@/utils/userExcelField'
import CommonInput from '../common/Input'
import { useManagementMaterial } from '@/hooks/useMaterialManagement'
import {
  ManagementMaterialService,
  MaterialExcelDownload,
} from '@/services/materialManagement/materialManagementService'
import { useMaterialSearchStore } from '@/stores/materialManagementStore'
import { DetailItem, MaterialList } from '@/types/materialManagement'
import { getTodayDateString } from '@/utils/formatters'

export default function MaterialManagementView() {
  const { handleNewMaterialCreate } = ManagementMaterialService()

  const { search } = useMaterialSearchStore()

  const {
    MaterialListQuery,
    MaterialDeleteMutation,

    // 해당 개발 시 다시 수정해야함
    // 현장명 무한 스크롤
    // setSitesSearch,
    // sitesOptions,
    // fetchNextPage,
    // hasNextPage,
    // isFetching,
    // isLoading,

    // // 공정명

    // setProcessSearch,
    // processOptions,
  } = useManagementMaterial()

  const MaterialDataList = MaterialListQuery.data?.data.content ?? []

  const totalList = MaterialListQuery.data?.data.pageInfo.totalElements ?? 0
  const pageCount = Number(search.pageCount) || 10
  const totalPages = Math.ceil(totalList / pageCount)

  console.log('자재 관리', MaterialDataList)

  const updateMaterialList = MaterialDataList.flatMap((material: MaterialList) => {
    if (!material.details || material.details.length === 0) {
      // details가 없을 경우 기본 정보만 반환
      return [
        {
          id: material.id,
          site: material.site?.name ?? '',
          process: material.process?.name ?? '',
          deliveryDate: getTodayDateString(material.deliveryDate),
          memo: material.memo ?? '',
          inputType: material.inputType,
          inputTypeDescription: material.inputTypeDescription,
          hasFile: material.hasFile ? 'Y' : 'N',
          // detail 관련 항목은 null로 채움
          detailId: null,
          name: null,
          standard: null,
          unit: null,
          count: null,
          length: null,
          totalLength: null,
          unitWeight: null,
          quantity: null,
          unitPrice: null,
          supplyPrice: null,
          total: null,
          vat: null,
          usage: null,
        },
      ]
    }

    // details가 있는 경우 펼쳐서 처리
    return material.details.map((detail: DetailItem) => ({
      id: material.id,
      site: material.site?.name ?? '',
      process: material.process?.name ?? '',
      deliveryDate: getTodayDateString(material.deliveryDate),
      memo: material.memo ?? '',
      inputType: material.inputType,
      inputTypeDescription: material.inputTypeDescription,
      hasFile: material.hasFile ? 'Y' : 'N',

      // detail 정보
      detailId: detail.id,
      name: detail.name ?? '',
      standard: detail.standard ?? '',
      unit: detail.unit ?? '',
      count: detail.count ?? null,
      length: detail.length ?? null,
      totalLength: detail.totalLength ?? null,
      unitWeight: detail.unitWeight ?? null,
      quantity: detail.quantity ?? null,
      unitPrice: detail.unitPrice ?? null,
      supplyPrice: detail.supplyPrice ?? null,
      total: detail.total ?? null,
      vat: detail.vat ?? null,
      usage: detail.usage ?? '',
    }))
  })

  const { selectedIds, setSelectedIds } = useAccountStore()

  const router = useRouter()

  // 그리도 라우팅 로직!
  const enhancedColumns = MaterialColumnList.map((col): GridColDef => {
    if (col.field === 'process') {
      return {
        ...col,
        headerAlign: 'center',
        align: 'center',
        flex: 1,

        renderCell: (params: GridRenderCellParams) => {
          const materialId = params.row.id
          return (
            <div
              onClick={() => router.push(`/materialManagement/registration/${materialId}`)}
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
  const fieldMapArray = Object.entries(MaterialExcelFieldMap).map(([label, value]) => ({
    label,
    value,
  }))

  const handleDownloadExcel = async (fields: string[]) => {
    await MaterialExcelDownload({ fields })
  }
  return (
    <>
      <div className="border-10 border-gray-400 p-4">
        <div className="grid grid-cols-3">
          {/* <div className="flex">
            <label className="w-36  text-[14px] flex items-center border border-gray-400 justify-center bg-gray-300 font-bold text-center">
              현장명
            </label>
            <div className="border border-gray-400 px-2 p-2 w-full flex items-center">
              <CommonSelect
                fullWidth
                className="text-xl"
                value={
                  search.siteName === ''
                    ? '0' // '선택'일 경우 value는 '0'
                    : sitesOptions.find((opt) => opt.label === search.siteName)?.value || '0'
                }
                onChange={(value) => {
                  if (value === '0') {
                    // '선택'을 고른 경우 '' 저장
                    search.setField('siteName', '')
                  } else {
                    const selected = sitesOptions.find((opt) => opt.value === value)
                    search.setField('siteName', selected?.label ?? '')
                  }
                }}
                options={sitesOptions}
                displayLabel
                onScrollToBottom={() => {
                  if (hasNextPage && !isFetching) fetchNextPage()
                }}
                onInputChange={(value) => setSitesSearch(value)}
                loading={isLoading}
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
                value={
                  search.processName === ''
                    ? '0'
                    : processOptions.find((opt) => opt.label === search.processName)?.value || '0'
                }
                onChange={(value) => {
                  if (value === '0') {
                    search.setField('processName', '')
                  } else {
                    const selected = processOptions.find((opt) => opt.value === value)
                    search.setField('processName', selected?.label ?? '')
                  }
                }}
                options={processOptions}
                displayLabel
                onScrollToBottom={() => {
                  if (hasNextPage && !isFetching) fetchNextPage()
                }}
                onInputChange={(value) => setProcessSearch(value)}
                loading={isLoading}
              />
            </div>
          </div> */}
          <div className="flex">
            <label className="w-36 text-[14px]  border border-gray-400  flex items-center justify-center bg-gray-300  font-bold text-center">
              품명
            </label>
            <div className="border border-gray-400 px-2 w-full flex gap-2  justify-center items-center">
              <CommonInput
                value={search.materialName}
                onChange={(value) => search.setField('materialName', value)}
                className=" flex-1"
              />
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
              납품일자(기간)
            </label>
            <div className="border border-gray-400 px-2 w-full flex gap-3 items-center ">
              <CommonDatePicker
                value={search.deliveryStartDate}
                onChange={(value) => search.setField('deliveryStartDate', value)}
              />
              ~
              <CommonDatePicker
                value={search.deliveryEndDate}
                onChange={(value) => search.setField('deliveryEndDate', value)}
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

                  MaterialDeleteMutation.mutate({
                    materialManagementIds: idsArray,
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
                onClick={handleNewMaterialCreate}
                className="px-3"
              />
            </div>
          </div>
        </div>
      </div>
      <div style={{ height: 500, width: '100%' }}>
        <DataGrid
          rows={updateMaterialList}
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
