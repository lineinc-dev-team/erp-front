'use client'

import CommonButton from '../common/Button'
import CommonInput from '../common/Input'
import CommonSelect from '../common/Select'
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import { LaborArrayStatusOptions, LaborColumnList, PageCount } from '@/config/erp.confing'
import { Pagination } from '@mui/material'
import { useAccountStore } from '@/stores/accountManagementStore'
import { useRouter } from 'next/navigation'
import ExcelModal from '../common/ExcelModal'
import { Fragment, useEffect, useState } from 'react'
import { laborExcelFieldMap } from '@/utils/userExcelField'
import { useTabOpener } from '@/utils/openTab'
import { useLaborSearchStore } from '@/stores/laborStore'
import { useLaborInfo } from '@/hooks/useLabor'
import { LaborDataList } from '@/types/labor'
import { formatNumber, getTodayDateString } from '@/utils/formatters'
import { LaborExcelDownload } from '@/services/labor/laborService'
import CommonSelectByName from '../common/CommonSelectByName'
import { myInfoProps } from '@/types/user'
import { useMenuPermission } from '../common/MenuPermissionView'
import { CustomNoRowsOverlay } from '../common/NoData'
import { InfiniteScrollSelect } from '../common/InfiniteScrollSelect'
import { useDebouncedValue } from '@/hooks/useDebouncedEffect'

export default function LaborView() {
  const openTab = useTabOpener()

  const { search } = useLaborSearchStore()

  const {
    LaborListQuery,
    LaborDeleteMutation,

    useOutsourcingNameListInfiniteScroll,

    etcDesOptions,
    setETCdesSearch,
    etcDescriptionFetchNextPage,
    etcDescriptionhasNextPage,
    etcDescriptionFetching,
    etcDescriptionLoading,

    LaborTypeMethodOptions,
  } = useLaborInfo()

  const laborList = LaborListQuery.data?.data.content ?? []

  const totalList = LaborListQuery.data?.data.pageInfo.totalElements ?? 0
  const pageCount = Number(search.pageCount) || 10
  const totalPages = Math.ceil(totalList / pageCount)

  const updateClientList = laborList.map((item: LaborDataList) => {
    return {
      ...item,
      outsourcingCompanyName: item.outsourcingCompany?.name ?? '라인공영',
      residentNumber: item.residentNumber || '-',
      workType: item.workType || '-',
      mainWork: item.mainWork || '-',
      phoneNumber: item.phoneNumber || '-',
      dailyWage: formatNumber(item.dailyWage),
      hasFile: item.hasFile ? 'Y' : 'N',
      isSeverancePayEligible: item.isSeverancePayEligible ? 'Y' : 'N',
      hasBankbook: item.hasBankbook ? 'Y' : 'N',
      hasIdCard: item.hasIdCard ? 'Y' : 'N',
      hasLaborContract: item.hasLaborContract ? 'Y' : 'N',

      hireDate: item.hireDate ? `${getTodayDateString(item.hireDate)}` : '-',
      resignationDate: item.resignationDate ? getTodayDateString(item.resignationDate) : '-',
    }
  })

  const { selectedIds, setSelectedIds } = useAccountStore()

  const router = useRouter()

  // 그리도 라우팅 로직!
  const enhancedColumns = LaborColumnList.map((col): GridColDef => {
    // if (col.field === 'memo') {
    //   return {
    //     ...col,
    //     headerAlign: 'center',
    //     align: 'center',
    //     flex: 2,
    //     renderCell: (params: GridRenderCellParams) => {
    //       const text = params.value as string
    //       if (!text) return <span style={{ fontSize: 12 }}>-</span>

    //       return (
    //         <Tooltip title={text} arrow>
    //           <span style={{ fontSize: 12 }}>
    //             {text.length > 10 ? `${text.slice(0, 10)}...` : text}
    //           </span>
    //         </Tooltip>
    //       )
    //     },
    //   }
    // }

    if (col.field === 'hasFile') {
      return {
        ...col,
        headerAlign: 'center',
        align: 'center',
        minWidth: 80,
        maxWidth: 80,
      }
    }

    if (col.field === 'hasLaborContract') {
      return {
        ...col,
        headerAlign: 'center',
        align: 'center',
        minWidth: 100,
        maxWidth: 100,
      }
    }

    if (col.field === 'hasIdCard') {
      return {
        ...col,
        headerAlign: 'center',
        align: 'center',
        minWidth: 90,
        maxWidth: 90,
      }
    }

    if (col.field === 'hasBankbook') {
      return {
        ...col,
        headerAlign: 'center',
        align: 'center',
        minWidth: 80,
        maxWidth: 80,
      }
    }

    if (col.field === 'tenureMonths') {
      return {
        ...col,
        headerAlign: 'center',
        align: 'center',
        minWidth: 80,
        maxWidth: 80,
      }
    }

    if (col.field === 'dailyWage') {
      return {
        ...col,
        headerAlign: 'center',
        align: 'center',
        minWidth: 80,
      }
    }

    if (col.field === 'workType') {
      return {
        ...col,
        headerAlign: 'center',
        align: 'center',
        minWidth: 120,
      }
    }

    if (col.field === 'mainWork') {
      return {
        ...col,
        headerAlign: 'center',
        align: 'center',
        minWidth: 80,
        maxWidth: 80,
      }
    }

    if (col.field === 'phoneNumber') {
      return {
        ...col,
        headerAlign: 'center',
        align: 'center',
        minWidth: 80,
      }
    }

    if (col.field === 'isSeverancePayEligible') {
      return {
        ...col,
        headerAlign: 'center',
        align: 'center',
        minWidth: 90,
        maxWidth: 90,
      }
    }

    if (col.field === 'residentNumber') {
      return {
        ...col,
        headerAlign: 'center',
        align: 'center',
        minWidth: 130,
        maxWidth: 130,
      }
    }

    if (col.field === 'name') {
      return {
        ...col,
        headerAlign: 'center',
        align: 'center',
        minWidth: 70,
        maxWidth: 70,
      }
    }

    if (col.field === 'accountNumber') {
      return {
        ...col,
        sortable: false,
        headerAlign: 'center',
        align: 'center',
        minWidth: 110,
        maxWidth: 110,
        renderCell: (params: GridRenderCellParams) => {
          const item = params.row as LaborDataList

          return (
            <div className="flex flex-col items-center">
              <Fragment>
                <div className="whitespace-pre-wrap">{item.bankName || '-'}</div>
                <div className="whitespace-pre-wrap">{item.accountNumber}</div>
              </Fragment>
            </div>
          )
        },
      }
    }

    if (col.field === 'tenureMonths') {
      return {
        ...col,
        headerAlign: 'center',
        align: 'center',
        flex: 1,
        renderCell: (params: GridRenderCellParams) => {
          const value = params.value as number | string

          // 문자열이면 '일' 제거 후 숫자로 변환
          const numericValue = typeof value === 'string' ? Number(value.replace('개월', '')) : value

          return <div>{numericValue ?? '-'}</div>
        },
      }
    }
    if (col.field === 'type') {
      return {
        ...col,
        headerAlign: 'center',
        align: 'center',
        minWidth: 90,
        maxWidth: 90,
        cellClassName: 'no-hover-bg', // 커스텀 클래스 지정
        renderCell: (params: GridRenderCellParams) => {
          const clientId = params.row.id

          const handleClick = () => {
            if (hasModify) {
              router.push(`/labors/registration/${clientId}`)
            }
          }

          return (
            <div
              onClick={handleClick}
              className={`flex justify-center items-center ${
                hasModify && 'cursor-pointer text-black-500 font-bold'
              }`}
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
        minWidth: 40,
        maxWidth: 40,
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
  const fieldMapArray = Object.entries(laborExcelFieldMap).map(([label, value]) => ({
    label,
    value,
  }))

  const handleDownloadExcel = async (fields: string[]) => {
    await LaborExcelDownload({
      sort: search.arraySort === '최신순' ? 'id,desc' : 'id,asc',
      type: search.type,
      typeDescription: search.typeDescription,
      name: search.name,
      residentNumber: search.residentNumber,
      outsourcingCompanyId: search.outsourcingCompanyId,
      phoneNumber: search.phoneNumber,
      isHeadOffice: search.isHeadOffice === null ? undefined : search.isHeadOffice,
      fields, // 필수 필드: ["id", "name", "businessNumber", ...]
    })
  }
  // 업체명 키워드 검색

  const [isOutsourcingFocused, setIsOutsourcingFocused] = useState(false)

  // 유저 선택 시 처리
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSelectOutsourcing = (selectedUser: any) => {
    search.setField('outsourcingCompanyName', selectedUser.name)
    search.setField('outsourcingCompanyId', selectedUser.id)
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
  // const outsourcingList = Array.from(
  //   new Map(OutsourcingRawList.map((user) => [user.name, user])).values(),
  // )

  let outsourcingList = Array.from(
    new Map(OutsourcingRawList.map((user) => [user.name, user])).values(),
  )

  if (
    debouncedOutsourcingKeyword === '' || // 아무것도 입력 안 한 상태
    debouncedOutsourcingKeyword.includes('라인') // '라인'이 포함된 경우
  ) {
    const alreadyExists = outsourcingList.some((item) => item.name === '라인공영')
    if (!alreadyExists) {
      outsourcingList = [{ id: 0, name: '라인공영' }, ...outsourcingList]
    }
  }

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
  const { hasDelete, hasCreate, hasModify, hasExcelDownload } = useMenuPermission(
    roleId,
    '근로자 관리',
    enabled,
  )

  return (
    <>
      <div className="border-10 border-gray-400 p-4">
        <div className="grid grid-cols-3">
          <div className="flex">
            <label className="w-36 text-[14px] flex items-center border border-gray-400  justify-center bg-gray-300  font-bold text-center">
              구분
            </label>
            <div className="border border-gray-400 p-2 w-full">
              <CommonSelect
                fullWidth={true}
                className="text-2xl"
                value={search.type || 'BASE'}
                onChange={(value) => search.setField('type', value)}
                options={LaborTypeMethodOptions}
              />
            </div>
          </div>

          {search.type === 'ETC' && (
            <div className="flex">
              <label className="w-36 text-[14px] flex items-center border border-gray-400 justify-center bg-gray-300 font-bold text-center">
                구분(설명)
              </label>
              <div className="border border-gray-400 p-2 w-full">
                <CommonSelectByName
                  fullWidth
                  value={search.typeDescription || '선택'}
                  onChange={async (value) => {
                    const selectedEtcDes = etcDesOptions.find(
                      (opt) => opt.typeDescription === value,
                    )
                    if (!selectedEtcDes) return
                    search.setField('typeDescription', selectedEtcDes.typeDescription)
                  }}
                  options={etcDesOptions}
                  displayLabel
                  onScrollToBottom={() => {
                    if (etcDescriptionhasNextPage && !etcDescriptionFetching) {
                      etcDescriptionFetchNextPage()
                    }
                  }}
                  onInputChange={(value) => setETCdesSearch(value)}
                  loading={etcDescriptionLoading}
                />
              </div>
            </div>
          )}

          <div className="flex">
            <label className="w-36 text-[14px]  border border-gray-400  flex items-center justify-center bg-gray-300  font-bold text-center">
              이름
            </label>
            <div className="border border-gray-400 px-2 w-full">
              <CommonInput
                value={search.name}
                onChange={(value) => search.setField('name', value)}
                className="flex-1"
                placeholder="이름을 입력해주세요."
              />
            </div>
          </div>

          <div className="flex">
            <label className="w-36 text-[14px]  border border-gray-400  flex items-center justify-center bg-gray-300  font-bold text-center">
              주민번호
            </label>
            <div className="border border-gray-400 px-2 w-full flex justify-center items-center">
              <CommonInput
                value={search.residentNumber}
                onChange={(value) => search.setField('residentNumber', value)}
                className="flex-1"
                placeholder="앞자리 수만 입력"
              />
            </div>
          </div>

          <div className="flex">
            <label className="w-36 text-[14px]  border border-gray-400  flex items-center justify-center bg-gray-300  font-bold text-center">
              소속업체
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
            <label className="w-36 text-[14px]  border border-gray-400  flex items-center justify-center bg-gray-300  font-bold text-center">
              개인휴대폰
            </label>
            <div className="border border-gray-400 p-2 w-full">
              <CommonInput
                placeholder="'-'없이 숫자만 입력"
                value={search.phoneNumber}
                onChange={(value) => {
                  search.setField('phoneNumber', value)
                }}
                className=" flex-1"
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
                    LaborDeleteMutation.mutate({
                      laborIds: idsArray,
                    })
                  }
                }}
                className="px-3"
              />
              <CommonButton
                label="엑셀 다운로드"
                disabled={!hasExcelDownload}
                variant="reset"
                onClick={() => setModalOpen(true)}
                className="px-3"
              />

              <ExcelModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                title="노무 관리 - 엑셀 항목 선택"
                fieldMap={fieldMapArray}
                onDownload={handleDownloadExcel}
              />
              <CommonButton
                label="+ 신규등록"
                disabled={!hasCreate}
                variant="secondary"
                onClick={() => openTab('/labors/registration', '노무 관리 - 등록')}
                className="px-3"
              />
            </div>
          </div>
        </div>
      </div>
      <div style={{ width: '100%' }}>
        <DataGrid
          rows={updateClientList}
          columns={enhancedColumns.map((col) => ({
            ...col,
            sortable: false,
            headerAlign: 'center',
            align: 'center',
          }))}
          checkboxSelection
          disableRowSelectionOnClick
          keepNonExistentRowsSelected
          disableColumnFilter
          hideFooter
          disableColumnMenu
          hideFooterPagination
          getRowHeight={() => 'auto'}
          getRowClassName={
            (params) =>
              [
                params.row.isSeverancePayEligible === 'Y' ? 'severance-row' : '',
                params.row.name === '임시' ? 'Temporary-row' : '',
              ]
                .filter(Boolean) // 빈 문자열 제거
                .join(' ') // 공백으로 합치기
          }
          sx={{
            '& .MuiDataGrid-row:hover': {
              backgroundColor: 'inherit !important', // hover 효과 제거
              color: 'black',
            },
            '& .MuiDataGrid-cell': {
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              whiteSpace: 'normal',
              lineHeight: '2.8rem',
              paddingTop: '12px',
              paddingBottom: '12px',
            },
            '& .MuiDataGrid-cell[data-field="dailyWage"]': {
              justifyContent: 'flex-end',
              paddingRight: '16px', // 원하는 여백
            },
            '& .severance-row': {
              backgroundColor: 'red',
              color: 'white',
            },

            '& .Temporary-row .MuiDataGrid-cell:nth-of-type(5)': {
              color: 'red', // 첫 번째 cell만 이름이라고 가정하고 붉게
            },
          }}
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
