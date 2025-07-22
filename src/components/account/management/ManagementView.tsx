'use client'

import { DataGrid } from '@mui/x-data-grid'
import { UserDataList, SubmitOptions, UseORnotOptions } from '@/config/erp.confing'
import { Pagination } from '@mui/material'
// import CommonInput from '@/components/common/Input'
import { userExcelFieldMap } from '@/utils/userExcelField'

import CommonSelect from '@/components/common/Select'
import CommonButton from '@/components/common/Button'
import { useOrderingContractSearchStore } from '@/stores/outsourcingContractStore'
import {
  AccountManagementService,
  UserDataExcelDownload,
} from '@/services/account/accountManagementService'
import { usePagination } from '@/hooks/usePagination'
import { useUserMg } from '@/hooks/useUserMg'
import { useAccountStore } from '@/stores/accountManagementStore'
import { getTodayDateString } from '@/utils/formatters'
import { UserInfoProps } from '@/types/accountManagement'
import { useState } from 'react'
import ExcelModal from '@/components/common/ExcelModal'
import InfiniteScrollSelect from '@/components/common/InfiniteScrollSelect'
import { useDebouncedValue } from '@/hooks/useDebouncedEffect'

export default function ManagementView() {
  const { ArrayStatusOptions, sortList, setSortList } = AccountManagementService()

  const { search } = useOrderingContractSearchStore()
  const { userQuery, deleteMutation, handleNewAccountCreate } = useUserMg()

  const [modalOpen, setModalOpen] = useState(false)

  const UserInfoList = userQuery.data?.data.content ?? []

  const { page, setPage, totalPages, displayedRows } = usePagination<UserInfoProps>(
    UserInfoList,
    10,
  )

  const { selectedIds, setSelectedIds } = useAccountStore()

  // 가공 로직
  const updatedUsers = displayedRows.map((user) => ({
    ...user,
    isActive: 'Y',
    createdAt: getTodayDateString(user.createdAt),
    updatedAt: getTodayDateString(user.updatedAt),
    lastLoginAt: getTodayDateString(user.lastLoginAt),
  }))

  // 필드 값 데이터 가공
  // userExcelFieldMap 객체를 { label: string, value: string }[] 배열로 바꿔줍니다.
  const fieldMapArray = Object.entries(userExcelFieldMap).map(([label, value]) => ({
    label,
    value,
  }))

  const handleDownloadExcel = async (fields: string[]) => {
    await UserDataExcelDownload({ fields })
  }

  const [keyword, setKeyword] = useState('')

  const { useUserInfiniteScroll } = useUserMg()

  const handleSelectUser = (user: UserInfoProps) => {
    setKeyword(user.username)
    search.setField('ceoName', user.username)
  }

  const debouncedKeyword = useDebouncedValue(keyword, 300)

  const { data, fetchNextPage, hasNextPage, isFetching, isLoading } =
    useUserInfiniteScroll(debouncedKeyword)

  const userList = data?.pages.flatMap((page) => page.data.content) ?? []

  return (
    <>
      <div className="border-10 border-gray-400 p-4">
        <div className="grid grid-cols-3">
          <div className="flex">
            <label className="w-36 text-[14px] flex items-center border border-gray-400  justify-center bg-gray-300  font-bold text-center">
              이름
            </label>
            {/* <div className="border border-gray-400 px-2 w-full flex justify-center items-center">
              <CommonInput
                placeholder="텍스트 입력"
                value={search.ceoName}
                onChange={(value) => search.setField('ceoName', value)}
                className="flex-1"
              />
            </div>
            
            */}
            <InfiniteScrollSelect<UserInfoProps>
              placeholder="이름을 입력하세요"
              keyword={keyword}
              onChangeKeyword={setKeyword}
              items={userList}
              hasNextPage={hasNextPage ?? false}
              fetchNextPage={fetchNextPage}
              renderItem={(item, isHighlighted) => (
                <div className={isHighlighted ? 'font-bold text-white p-1  bg-blue-600' : ''}>
                  {item.username}
                </div>
              )}
              onSelect={handleSelectUser}
              shouldShowList={true}
              isLoading={isLoading || isFetching}
              debouncedKeyword={debouncedKeyword}
            />
          </div>

          <div className="flex">
            <label className="w-36 text-[14px]  border border-gray-400  flex items-center justify-center bg-gray-300  font-bold text-center">
              직책
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
              권한 그룹
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
            <label className="w-36 text-[14px]  border border-gray-400 flex items-center justify-center bg-gray-300  font-bold text-center">
              권한 조건
            </label>
            <div className="border border-gray-400 px-2 w-full flex gap-3 items-center p-2 ">
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
              계정 상태
            </label>
            <div className="border border-gray-400 px-2 w-full flex gap-3 items-center p-2 ">
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
              최종접속일
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
              생성일자
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
            <label className="w-36 text-[14px] border border-gray-400  flex items-center justify-center bg-gray-300  font-bold text-center"></label>
            <div className="border border-gray-400 px-2 w-full flex justify-center items-center"></div>
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

                  deleteMutation.mutate({
                    userIds: idsArray,
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
                title="사용자 관리 - 엑셀 항목 선택"
                fieldMap={fieldMapArray}
                onDownload={handleDownloadExcel}
              />

              <CommonButton
                label="+ 신규등록"
                variant="secondary"
                onClick={handleNewAccountCreate}
                className="px-3"
              />
            </div>
          </div>
        </div>
      </div>
      <div style={{ height: 500, width: '100%' }}>
        <DataGrid
          rows={updatedUsers}
          columns={UserDataList.map((col) => ({
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
