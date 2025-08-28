'use client'

import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import {
  UserDataList,
  UseORnotOptions,
  ArrayStatusOptions,
  PageCount,
  UseStateOptions,
} from '@/config/erp.confing'
import { Pagination } from '@mui/material'

import CommonSelect from '@/components/common/Select'
import CommonButton from '@/components/common/Button'
import { useUserMg } from '@/hooks/useUserMg'
import { useAccountManagementStore, useAccountStore } from '@/stores/accountManagementStore'
import { getTodayDateString } from '@/utils/formatters'
import { UserInfoProps } from '@/types/accountManagement'
import { useState } from 'react'
import InfiniteScrollSelect from '@/components/common/InfiniteScrollSelect'
import { useDebouncedValue } from '@/hooks/useDebouncedEffect'
import CommonDatePicker from '@/components/common/DatePicker'
import ExcelModal from '@/components/common/ExcelModal'
import { UserDataExcelDownload } from '@/services/account/accountManagementService'
import { userExcelFieldMap } from '@/utils/userExcelField'
import { useRouter } from 'next/navigation'
import { useSnackbarStore } from '@/stores/useSnackbarStore'
import { useTabOpener } from '@/utils/openTab'

export default function ManagementView() {
  const { search } = useAccountManagementStore()

  const { userQuery, deleteMutation, departmentOptions, positionOptions, gradeOptions } =
    useUserMg()

  const openTab = useTabOpener()

  const UserInfoList = userQuery.data?.data.content ?? []

  const totalList = userQuery.data?.data.pageInfo.totalElements ?? 0
  const pageCount = Number(search.pageCount) || 10
  const totalPages = Math.ceil(totalList / pageCount)

  // 가공 로직
  const updatedUsers = UserInfoList.map((user: UserInfoProps) => ({
    ...user,
    isActive: user.isActive === true ? 'Y' : 'N',
    lastLoginAt: getTodayDateString(user.lastLoginAt),
    createdAt: getTodayDateString(user.createdAt),
    updatedAt: getTodayDateString(user.updatedAt),
  }))

  const { selectedIds, setSelectedIds } = useAccountStore()

  const router = useRouter()

  // 그리도 라우팅 로직!
  const enhancedColumns = UserDataList.map((col): GridColDef => {
    if (col.field === 'loginId') {
      return {
        ...col,
        headerAlign: 'center',
        align: 'center',
        flex: 1,

        renderCell: (params: GridRenderCellParams) => {
          const UserId = params.row.id
          return (
            <div
              onClick={() => router.push(`/account/registration/${UserId}`)}
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
    return {
      ...col,
      sortable: false,
      headerAlign: 'center',
      align: 'center',
      flex: 1,
    }
  })

  const { showSnackbar } = useSnackbarStore()

  // 이름에 대한 무한 스크롤

  const { useUserInfiniteScroll } = useUserMg()

  // 유저 선택 시 처리
  const handleSelectUser = (selectedUser: UserInfoProps) => {
    // 예: username 필드에 선택한 유저 이름 넣기
    search.setField('username', selectedUser.username)
  }

  const debouncedKeyword = useDebouncedValue(search.username, 300)

  const { data, fetchNextPage, hasNextPage, isFetching, isLoading } =
    useUserInfiniteScroll(debouncedKeyword)

  const rawList = data?.pages.flatMap((page) => page.data.content) ?? []
  const userList = Array.from(new Map(rawList.map((user) => [user.username, user])).values())

  const [modalOpen, setModalOpen] = useState(false)
  // // userExcelFieldMap 객체를 { label: string, value: string }[] 배열로 바꿔줍니다.
  const fieldMapArray = Object.entries(userExcelFieldMap).map(([label, value]) => ({
    label,
    value,
  }))

  const handleDownloadExcel = async (fields: string[]) => {
    await UserDataExcelDownload({
      sort: search.arraySort === '최신순' ? 'username,desc' : 'username,asc',
      username: search.username,
      roleId: search.roleId === '0' ? undefined : Number(search.roleId),
      isActive: search.isActive === '0' ? undefined : search.isActive,
      createdStartDate: getTodayDateString(search.createdStartDate),
      createdEndDate: getTodayDateString(search.createdEndDate),
      lastLoginStartDate: getTodayDateString(search.lastLoginStartDate),
      lastLoginEndDate: getTodayDateString(search.lastLoginEndDate),
      fields,
    })
  }

  console.log('search.currentPagesearch.currentPage', search.currentPage)
  return (
    <>
      <div className="border-10 border-gray-400 p-4">
        <div className="grid grid-cols-3">
          <div className="flex">
            <label className="w-35 text-[14px] flex items-center border border-gray-400  justify-center bg-gray-300  font-bold text-center">
              이름
            </label>
            <div className="border w-full  border-gray-400">
              <InfiniteScrollSelect<UserInfoProps>
                placeholder="이름을 입력하세요"
                keyword={search.username}
                onChangeKeyword={(newKeyword) => search.setField('username', newKeyword)} // ★필드명과 값 둘 다 넘겨야 함
                items={userList}
                hasNextPage={hasNextPage ?? false}
                fetchNextPage={fetchNextPage}
                renderItem={(item, isHighlighted) => (
                  <div className={isHighlighted ? 'font-bold text-white p-1  bg-gray-400' : ''}>
                    {item.username}
                  </div>
                )}
                onSelect={handleSelectUser}
                shouldShowList={true}
                isLoading={isLoading || isFetching}
                debouncedKeyword={debouncedKeyword}
              />
            </div>
          </div>

          <div className="flex">
            <label className="w-36 text-[14px]  border border-gray-400  flex items-center justify-center bg-gray-300  font-bold text-center">
              부서
            </label>
            <div className="border border-gray-400 px-2 w-full flex gap-3 items-center ">
              <CommonSelect
                fullWidth={true}
                value={search.departmentId}
                onChange={(value) => search.setField('departmentId', value)}
                options={departmentOptions}
              />
            </div>
          </div>

          <div className="flex">
            <label className="w-36 text-[14px]  border border-gray-400  flex items-center justify-center bg-gray-300  font-bold text-center">
              직책
            </label>
            <div className="border border-gray-400 px-2 w-full flex gap-3 items-center ">
              <CommonSelect
                fullWidth={true}
                value={search.positionId}
                onChange={(value) => search.setField('positionId', value)}
                options={positionOptions}
              />
            </div>
          </div>

          <div className="flex">
            <label className="w-36 text-[14px]  border border-gray-400 flex items-center justify-center bg-gray-300  font-bold text-center">
              직급
            </label>
            <div className="border border-gray-400 px-2 w-full flex gap-3 items-center p-2 ">
              <CommonSelect
                fullWidth={true}
                value={search.gradeId}
                onChange={(value) => search.setField('gradeId', value)}
                options={gradeOptions}
              />
            </div>
          </div>

          <div className="flex">
            <label className="w-36 text-[14px]  border border-gray-400  flex items-center justify-center bg-gray-300  font-bold text-center">
              권한그룹
            </label>
            <div className="border border-gray-400 px-2 w-full flex gap-3 items-center p-2 ">
              <CommonSelect
                fullWidth={true}
                value={search.roleId}
                onChange={(value) => search.setField('roleId', value)}
                options={UseORnotOptions}
              />
            </div>
          </div>
          <div className="flex">
            <label className="w-36 text-[14px] border border-gray-400  flex items-center justify-center bg-gray-300  font-bold text-center">
              계정상태
            </label>
            <div className="border border-gray-400 px-2 w-full flex gap-3 items-center ">
              <CommonSelect
                fullWidth={true}
                value={search.isActive}
                onChange={(value) => search.setField('isActive', value)}
                options={UseStateOptions}
              />
            </div>
          </div>

          <div className="flex">
            <label className="w-36 text-[14px]  border border-gray-400  flex items-center justify-center bg-gray-300  font-bold text-center">
              생성일자
            </label>

            <div className="border border-gray-400 px-2 w-full flex gap-3 items-center p-3">
              <CommonDatePicker
                value={search.createdStartDate}
                onChange={(value) => {
                  search.setField('createdStartDate', value)

                  if (
                    value !== null &&
                    search.createdEndDate !== null &&
                    new Date(search.createdEndDate) < new Date(value)
                  ) {
                    search.setField('createdEndDate', value)
                  }
                }}
              />
              ~
              <CommonDatePicker
                value={search.createdEndDate}
                onChange={(value) => {
                  if (
                    value !== null &&
                    search.createdStartDate !== null &&
                    new Date(value) < new Date(search.createdStartDate)
                  ) {
                    showSnackbar('종료일은 시작일 이후여야 합니다.', 'error')
                    return
                  }
                  search.setField('createdEndDate', value)
                }}
              />
            </div>
          </div>

          <div className="flex">
            <label className="w-36 text-[14px]  border border-gray-400  flex items-center justify-center bg-gray-300  font-bold text-center">
              최종접속일
            </label>

            <div className="border border-gray-400 px-2 w-full flex gap-3 items-center p-3">
              <CommonDatePicker
                value={search.lastLoginStartDate}
                onChange={(value) => {
                  search.setField('lastLoginStartDate', value)

                  if (
                    value !== null &&
                    search.lastLoginEndDate !== null &&
                    new Date(search.lastLoginEndDate) < new Date(value)
                  ) {
                    search.setField('lastLoginEndDate', value)
                  }
                }}
              />
              ~
              <CommonDatePicker
                value={search.lastLoginEndDate}
                onChange={(value) => {
                  if (
                    value !== null &&
                    search.lastLoginStartDate !== null &&
                    new Date(value) < new Date(search.lastLoginStartDate)
                  ) {
                    showSnackbar('종료일은 시작일 이후여야 합니다.', 'error')
                    return
                  }
                  search.setField('lastLoginEndDate', value)
                }}
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

                  if (window.confirm('정말 삭제하시겠습니까?')) {
                    deleteMutation.mutate({
                      userIds: idsArray,
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

              <ExcelModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                title="사용자 관리 - 엑셀 항목 선택"
                fieldMap={fieldMapArray}
                onDownload={handleDownloadExcel}
              />

              <CommonButton
                label="+ 신규등록"
                variant="secondary"
                onClick={() => openTab('/account/registration', '계정관리 - 등록')}
                className="px-3"
              />
            </div>
          </div>
        </div>
      </div>
      <div style={{ height: 500, width: '100%' }}>
        <DataGrid
          rows={updatedUsers}
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
