'use client'

import { Fragment, useEffect } from 'react'
import CommonButton from '../common/Button'
import CommonInput from '../common/Input'
import CommonSelect from '../common/Select'
import CommonDatePicker from '../common/DatePicker'
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import {
  ArrayStatusOptions,
  clientCompanyList,
  PageCount,
  UseORnotOptions,
} from '@/config/erp.confing'
import { Pagination, Tooltip } from '@mui/material'
import { useOrderingSearchStore } from '@/stores/orderingStore'
import { ClientCompanyExcelDownload } from '@/services/ordering/orderingService'
import { useClientCompany } from '@/hooks/useClientCompany'
import { ClientCompany } from '@/types/ordering'
import { useAccountStore } from '@/stores/accountManagementStore'
import { useRouter } from 'next/navigation'
import ExcelModal from '../common/ExcelModal'
import { useState } from 'react'
import { clientCompanyExcelFieldMap } from '@/utils/userExcelField'
import { getTodayDateString } from '@/utils/formatters'
import { useTabOpener } from '@/utils/openTab'
import { useSnackbarStore } from '@/stores/useSnackbarStore'
import { useMenuPermission } from '../common/MenuPermissionView'
import { myInfoProps } from '@/types/user'
import { CustomNoRowsOverlay } from '../common/NoData'

export default function OrderingView() {
  const openTab = useTabOpener()

  const { showSnackbar } = useSnackbarStore()

  const { search } = useOrderingSearchStore()

  const { ClientQuery, ClientDeleteMutation } = useClientCompany()

  const ClientCompanyList = ClientQuery.data?.data.content ?? []

  const totalList = ClientQuery.data?.data.pageInfo.totalElements ?? 0
  const pageCount = Number(search.pageCount) || 10
  const totalPages = Math.ceil(totalList / pageCount)

  const updateClientList = ClientCompanyList.map((user: ClientCompany) => {
    const mainContact = user.contacts?.find((contact) => contact.isMain === true)

    return {
      ...user,
      businessNumber: user.businessNumber || '-',
      email: user.email || '-',
      contactName: mainContact?.name || '-',
      headquarter: user.user?.username || '-',
      isActive: user.isActive === true ? 'Y' : 'N',
      hasFile: user.hasFile === true ? 'Y' : 'N',
      memo: user.memo || '-',
    }
  })

  const { selectedIds, setSelectedIds } = useAccountStore()

  const router = useRouter()

  // 그리도 라우팅 로직!
  const enhancedColumns = clientCompanyList.map((col): GridColDef => {
    if (col.field === 'businessNumber') {
      return {
        ...col,
        headerAlign: 'center',
        align: 'center',
        minWidth: 120,
        maxWidth: 120,
      }
    }

    if (col.field === 'ceoName') {
      return {
        ...col,
        headerAlign: 'center',
        align: 'center',
        minWidth: 70,
        maxWidth: 70,
      }
    }

    if (col.field === 'email') {
      return {
        ...col,
        headerAlign: 'center',
        align: 'center',
        minWidth: 120,
        maxWidth: 120,
      }
    }

    if (col.field === 'landlineNumber') {
      return {
        ...col,
        headerAlign: 'center',
        align: 'center',
        minWidth: 120,
        maxWidth: 120,
      }
    }

    if (col.field === 'contactName') {
      return {
        ...col,
        headerAlign: 'center',
        align: 'center',
        minWidth: 80,
        maxWidth: 80,
      }
    }

    if (col.field === 'headquarter') {
      return {
        ...col,
        headerAlign: 'center',
        align: 'center',
        minWidth: 100,
        maxWidth: 100,
      }
    }

    if (col.field === 'isActive') {
      return {
        ...col,
        headerAlign: 'center',
        align: 'center',
        minWidth: 70,
        maxWidth: 70,
      }
    }

    if (col.field === 'hasFile') {
      return {
        ...col,
        headerAlign: 'center',
        align: 'center',
        minWidth: 100,
        maxWidth: 100,
      }
    }

    if (col.field === 'address') {
      return {
        ...col,
        sortable: false,
        headerAlign: 'center',
        align: 'center',
        minWidth: 440,
        maxWidth: 440,
        renderCell: (params: GridRenderCellParams) => {
          const item = params.row as ClientCompany

          if (!item.address && !item.detailAddress) {
            return <div className="flex flex-col items-center">-</div>
          }

          return (
            <div className="flex flex-col items-center">
              <div className="whitespace-pre-wrap">{item.address || '-'}</div>
              <div className="whitespace-pre-wrap">{item.detailAddress || '-'}</div>
            </div>
          )
        },
      }
    }

    if (col.field === 'contactPositionAndDepartment') {
      return {
        ...col,
        sortable: false,
        headerAlign: 'center',
        align: 'center',
        // 헤더에 딱 맞게 화면에서 보이게
        minWidth: 100,
        maxWidth: 100,
        flex: 0.4,
        renderCell: (params: GridRenderCellParams) => {
          const item = params.row as ClientCompany

          if (!item.contacts || item.contacts.length === 0) {
            return <div className="flex flex-col items-center">-</div>
          }

          // 대표 연락처만 필터링
          const mainContacts = item.contacts.filter((c) => c.isMain)

          if (mainContacts.length === 0) {
            return <div className="flex flex-col items-center">-</div>
          }

          return (
            <div className="flex flex-col items-center">
              {mainContacts.map((contact, index) => (
                <Fragment key={index}>
                  <div className="whitespace-pre-wrap">{contact.position || '-'}</div>
                  <div className="whitespace-pre-wrap">{contact.department || '-'}</div>
                </Fragment>
              ))}
            </div>
          )
        },
      }
    }

    if (col.field === 'memo') {
      return {
        ...col,
        headerAlign: 'center',
        align: 'center',
        // 헤더에 딱 맞게 화면에서 보이게
        minWidth: 80,
        maxWidth: 80,
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

    if (col.field === 'contactInfo') {
      return {
        ...col,
        sortable: false,
        headerAlign: 'center',
        align: 'center',
        minWidth: 150,
        maxWidth: 150,
        renderCell: (params: GridRenderCellParams) => {
          const item = params.row as ClientCompany

          if (!item.contacts || item.contacts.length === 0) {
            return <div className="flex flex-col items-center">-</div>
          }

          // isMain === true 인 연락처만 필터링
          const mainContacts = item.contacts.filter((c) => c.isMain)

          if (mainContacts.length === 0) {
            return <div className="flex flex-col items-center">-</div>
          }

          return (
            <div className="flex flex-col items-center">
              {mainContacts.map((contact, index) => (
                <Fragment key={index}>
                  <div className="whitespace-pre-wrap">{contact.phoneNumber || '-'}</div>
                  <div className="whitespace-pre-wrap">{contact.email || '-'}</div>
                </Fragment>
              ))}
            </div>
          )
        },
      }
    }

    if (col.field === 'createdAt') {
      return {
        ...col,
        sortable: false,
        headerAlign: 'center',
        align: 'center',
        minWidth: 100,
        maxWidth: 100,
        renderCell: (params: GridRenderCellParams) => {
          const item = params.row as ClientCompany

          return (
            <div className="flex flex-col items-center">
              <Fragment>
                <div className="whitespace-pre-wrap">{getTodayDateString(item.createdAt)}</div>
                <div className="whitespace-pre-wrap">{getTodayDateString(item.updatedAt)}</div>
              </Fragment>
            </div>
          )
        },
      }
    }

    if (col.field === 'name') {
      return {
        ...col,
        headerAlign: 'center',
        align: 'center',
        flex: 0.4,
        minWidth: 100,
        maxWidth: 100,
        renderCell: (params: GridRenderCellParams) => {
          const clientId = params.row.id

          const handleClick = () => {
            if (hasModify) {
              router.push(`/ordering/registration/${clientId}`)
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

  // if (isLoading) return <LoadingSkeletion />
  // if (error) throw error

  const [modalOpen, setModalOpen] = useState(false)
  // userExcelFieldMap 객체를 { label: string, value: string }[] 배열로 바꿔줍니다.
  const fieldMapArray = Object.entries(clientCompanyExcelFieldMap).map(([label, value]) => ({
    label,
    value,
  }))

  const handleDownloadExcel = async (fields: string[]) => {
    await ClientCompanyExcelDownload({
      sort: search.arraySort === '최신순' ? 'id,desc' : 'id,asc',
      name: search.name,
      businessNumber: search.businessNumber,
      ceoName: search.ceoName,
      landlineNumber: search.landlineNumber,
      contactName: search.contactName,
      email: search.email,
      userName: search.userName,
      createdStartDate: search.startDate ? getTodayDateString(search.startDate) : undefined,
      createdEndDate: search.endDate ? getTodayDateString(search.endDate) : undefined,
      isActive: search.isActive !== 'N',
      fields, // 필수 필드: ["id", "name", "businessNumber", ...]
    })
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
    '발주처 관리',
    enabled,
  )
  const handleEnterKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      search.setField('currentPage', 1) // 페이지 초기화
      search.handleSearch()
    }
  }

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
                onKeyDown={handleEnterKey}
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
                onKeyDown={handleEnterKey}
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
                onKeyDown={handleEnterKey}
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
                onChange={(value) => {
                  const resultAreaNumber = value
                  search.setField('landlineNumber', resultAreaNumber)
                }}
                onKeyDown={handleEnterKey}
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
                value={search.contactName}
                onChange={(value) => search.setField('contactName', value)}
                onKeyDown={handleEnterKey}
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
                onKeyDown={handleEnterKey}
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
                onChange={(value) => {
                  search.setField('startDate', value)

                  if (
                    value !== null &&
                    search.endDate !== null &&
                    new Date(search.endDate) < new Date(value)
                  ) {
                    search.setField('endDate', value)
                  }
                }}
              />
              ~
              <CommonDatePicker
                value={search.endDate}
                onChange={(value) => {
                  if (
                    value !== null &&
                    search.startDate !== null &&
                    new Date(value) < new Date(search.startDate)
                  ) {
                    showSnackbar('종료일은 시작일 이후여야 합니다.', 'error')
                    return
                  }
                  search.setField('endDate', value)
                }}
              />
            </div>
          </div>

          <div className="flex">
            <label className="w-36 text-[14px] border border-gray-400  flex items-center justify-center bg-gray-300  font-bold text-center">
              본사 담당자명
            </label>
            <div className="border border-gray-400 px-2 w-full flex gap-3 items-center ">
              <CommonInput
                value={search.userName}
                onChange={(value) => search.setField('userName', value)}
                onKeyDown={handleEnterKey}
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
            onClick={() => {
              search.setField('currentPage', 1)
              search.handleSearch()
            }}
            // onKeyDown={(e) => {
            //   if (e.key === 'Enter') {
            //     search.setField('currentPage', 1)
            //     search.handleSearch()
            //   }
            // }}
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
                disabled={!hasDelete} // 권한 없으면 비활성화
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
                    ClientDeleteMutation.mutate({
                      userIds: idsArray,
                    })
                  }
                }}
                className="px-3"
              />
              <CommonButton
                label="엑셀 다운로드"
                disabled={!hasExcelDownload} // 권한 없으면 비활성화
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
                disabled={!hasCreate}
                label="+ 신규등록"
                variant="secondary"
                onClick={() => openTab('/ordering/registration', '발주처 관리 - 등록')}
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
          getRowHeight={() => 'auto'}
          sx={{
            '& .MuiDataGrid-cell': {
              display: 'flex',
              justifyContent: 'center', // 가로 가운데 정렬
              alignItems: 'center', // 세로 가운데 정렬
              whiteSpace: 'normal', // 줄바꿈 허용
              lineHeight: '2.8rem', // 줄 간격
              paddingTop: '12px', // 위 여백
              paddingBottom: '12px', // 아래 여백
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

      {/* <ContractHistory open={contract} onClose={() => setContract(false)} /> */}
    </>
  )
}
