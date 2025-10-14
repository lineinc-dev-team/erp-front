/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import CommonButton from '../common/Button'
import CommonSelect from '../common/Select'
import CommonDatePicker from '../common/DatePicker'
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import { Pagination, Tooltip } from '@mui/material'
import { useAccountStore } from '@/stores/accountManagementStore'
import { useRouter } from 'next/navigation'
import { LaborArrayStatusOptions, MaterialColumnList, PageCount } from '@/config/erp.confing'
import { useEffect, useState } from 'react'
import ExcelModal from '../common/ExcelModal'
import { MaterialExcelFieldMap } from '@/utils/userExcelField'
import { useManagementMaterial } from '@/hooks/useMaterialManagement'
import {
  ManagementMaterialService,
  MaterialExcelDownload,
} from '@/services/materialManagement/materialManagementService'
import { useMaterialSearchStore } from '@/stores/materialManagementStore'
import { MaterialList } from '@/types/materialManagement'
import { formatNumber, getTodayDateString } from '@/utils/formatters'
import useOutSourcingContract from '@/hooks/useOutSourcingContract'
import CommonSelectByName from '../common/CommonSelectByName'
import { SitesProcessNameScroll } from '@/services/managementCost/managementCostRegistrationService'
import { myInfoProps } from '@/types/user'
import { useMenuPermission } from '../common/MenuPermissionView'
import { CustomNoRowsOverlay } from '../common/NoData'
import { useDebouncedValue } from '@/hooks/useDebouncedEffect'
import { InfiniteScrollSelect } from '../common/InfiniteScrollSelect'

export default function MaterialManagementView() {
  const { handleNewMaterialCreate } = ManagementMaterialService()

  const { search } = useMaterialSearchStore()

  const {
    MaterialListQuery,
    // MaterialDeleteMutation,
    productOptions,
    setProductSearch,
    productNameFetchNextPage,
    productNamehasNextPage,
    productNameFetching,
    productNameLoading,
  } = useManagementMaterial()

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

  const MaterialDataList = MaterialListQuery.data?.data.content ?? []

  const totalList = MaterialListQuery.data?.data.pageInfo.totalElements ?? 0
  const pageCount = Number(search.pageCount) || 10
  const totalPages = Math.ceil(totalList / pageCount)

  const updateMaterialList = MaterialDataList.flatMap(
    (material: MaterialList, materialIndex: number) => {
      // detail이 없을 때 기본값
      if (!material.detail) {
        return [
          {
            rowId: `material-${materialIndex}`, // DataGrid용 고유 ID
            backendId: material.id, // 백엔드 수정용
            detailId: null,

            outsourcingCompanyName: material.outsourcingCompany?.name ?? '-',
            site: material.site?.name ?? '-',
            process: material.process?.name ?? '-',
            deliveryDate: getTodayDateString(material.deliveryDate) ?? '-',
            memo: material.memo ?? '-',
            inputType: material.inputType ?? '-',
            inputTypeDescription: material.inputTypeDescription ?? '-',
            hasFile: material.hasFile ? 'Y' : 'N',

            // detail 관련 항목은 null/빈값
            name: '-',
            standard: '-',
            unit: '-',
            count: '-',
            length: '-',
            totalLength: '-',
            unitWeight: '-',
            quantity: '-',
            unitPrice: '-',
            supplyPrice: '-',
            total: '-',
            vat: '-',
            usage: '-',
          },
        ]
      }

      // detail이 있는 경우 (단일 객체이므로 배열로 감쌈)
      const details = Array.isArray(material.detail) ? material.detail : [material.detail]

      return details.map((detail, detailIndex) => ({
        rowId: `material-${materialIndex}-detail-${detailIndex}`, // DataGrid용 고유 ID
        backendId: material.id, // 백엔드 수정용
        detailId: detail.id, // 백엔드 수정용

        outsourcingCompanyName: material.outsourcingCompany?.name || '-',
        site: material.site?.name || '-',
        process: material.process?.name || '-',
        deliveryDate: getTodayDateString(material.deliveryDate) || '-',
        memo: material.memo || '-',
        inputType: material.inputType || '-',
        inputTypeDescription: material.inputTypeDescription || '-',
        hasFile: material.hasFile ? 'Y' : 'N',

        // detail 정보
        name: detail.name ?? '-',
        standard: detail.standard !== undefined ? formatNumber(detail.standard) : '-',
        unit: detail.unit ?? '-',
        count: detail.count !== undefined ? formatNumber(detail.count) : '-',
        length: detail.length !== undefined ? formatNumber(detail.length) : '-',
        totalLength: detail.totalLength !== undefined ? formatNumber(detail.totalLength) : '-',
        unitWeight: detail.unitWeight !== undefined ? formatNumber(detail.unitWeight) : '-',
        quantity: detail.quantity !== undefined ? formatNumber(detail.quantity) : '-',
        unitPrice: detail.unitPrice !== undefined ? formatNumber(detail.unitPrice) : '-',
        supplyPrice: detail.supplyPrice !== undefined ? formatNumber(detail.supplyPrice) : '-',
        total: detail.total !== undefined ? formatNumber(detail.total) : '-',
        vat: detail.vat !== undefined ? formatNumber(detail.vat) : '-',
        usage: detail.usage ?? '-',
      }))
    },
  )

  const { setSelectedIds } = useAccountStore()

  const router = useRouter()

  // 그리도 라우팅 로직!
  const enhancedColumns = MaterialColumnList.map((col): GridColDef => {
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
    if (col.field === 'name') {
      return {
        ...col,
        headerAlign: 'center',
        align: 'center',
        flex: 1,

        renderCell: (params: GridRenderCellParams) => {
          const materialId = params.row.backendId
          const handleClick = () => {
            if (hasModify) {
              router.push(`/materialManagement/registration/${materialId}`)
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
    await MaterialExcelDownload({
      sort: search.arraySort === '최신순' ? 'id,desc' : 'id,asc',
      siteName: search.siteName,
      processName: search.processName,
      outsourcingCompanyName: search.outsourcingCompanyName,
      materialName: search.materialName,
      deliveryStartDate: getTodayDateString(search.deliveryStartDate),
      deliveryEndDate: getTodayDateString(search.deliveryEndDate),
      fields,
    })
  }

  // 현장명 키워드 검색

  const [isSiteFocused, setIsSiteFocused] = useState(false)

  // 유저 선택 시 처리
  // const handleSelectSiting = (selectedUser: any) => {
  //   search.setField('name', selectedUser.name)
  // }

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

  // 업체명 키워드 검색

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
    search.reset()
    if (headerData) {
      setMyInfo(JSON.parse(headerData))
    }
  }, [])

  const roleId = Number(myInfo?.roles?.[0]?.id)

  const rolePermissionStatus = myInfo?.roles?.[0]?.deleted

  const enabled = rolePermissionStatus === false && !!roleId && !isNaN(roleId)

  // "계정 관리" 메뉴에 대한 권한
  const { hasCreate, hasModify, hasExcelDownload } = useMenuPermission(roleId, '자재 관리', enabled)

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
            <label className="w-[144px] text-[14px] flex items-center border border-gray-400  justify-center bg-gray-300  font-bold text-center">
              품명
            </label>
            <div className="border border-gray-400 px-2 p-2 w-full flex items-center">
              <CommonSelectByName
                value={search.materialName || '선택'}
                onChange={async (value) => {
                  const selectedProduct = productOptions.find((opt) => opt.name === value)
                  if (!selectedProduct) return
                  search.setField('materialName', selectedProduct.name)
                }}
                options={productOptions}
                onScrollToBottom={() => {
                  if (productNamehasNextPage && !productNameFetching) productNameFetchNextPage()
                }}
                onInputChange={(value) => setProductSearch(value)}
                loading={productNameLoading}
              />
            </div>
          </div>
          <div className="flex">
            <label className="w-36  text-[14px] flex items-center border border-gray-400  justify-center bg-gray-300  font-bold text-center">
              자재업체명
            </label>
            {/* <div className="border border-gray-400 p-2 px-2 w-full">
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
                loading={comPanyNameLoading}
              />
            </div> */}

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
            <label className="w-36 text-[14px]   border border-gray-400  flex items-center justify-center bg-gray-300  font-bold text-center">
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
              <CommonButton
                label="엑셀 다운로드"
                disabled={!hasExcelDownload} // 권한 없으면 비활성화
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
                disabled={!hasCreate}
                variant="secondary"
                onClick={handleNewMaterialCreate}
                className="px-3"
              />
            </div>
          </div>
        </div>
      </div>
      <div style={{ width: '100%' }}>
        <DataGrid
          rows={updateMaterialList}
          columns={enhancedColumns.map((col) => ({
            ...col,
            sortable: false,
            headerAlign: 'center',
            align: 'center',
          }))}
          getRowId={(row) => row.rowId} // DataGrid에는 rowId를 유니크 키로 사용
          // checkboxSelection
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
    </>
  )
}
