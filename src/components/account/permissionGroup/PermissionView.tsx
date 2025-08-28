'use client'

import CommonButton from '@/components/common/Button'
import CommonInput from '@/components/common/Input'
import CommonSelect from '@/components/common/Select'
import { ArrayStatusOptions, PageCount, PermissionDataList } from '@/config/erp.confing'
import { usePermission } from '@/hooks/usePermission'
import { useAccountStore } from '@/stores/accountManagementStore'
import { usePermissionSearchStore } from '@/stores/permissionStore'
import { PermissionGroupDetail } from '@/types/permssion'
import { getTodayDateString } from '@/utils/formatters'
import { useTabOpener } from '@/utils/openTab'
import { Pagination } from '@mui/material'
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import { useRouter } from 'next/navigation'

export default function PermissionView() {
  const { search } = usePermissionSearchStore()

  const { permissionListQuery, permissionDeleteMutation } = usePermission()

  const openTab = useTabOpener()

  const PermissonInfoList = permissionListQuery.data?.data.content ?? []

  const totalList = permissionListQuery.data?.data.pageInfo.totalElements ?? 0
  const pageCount = Number(search.pageCount) || 10
  const totalPages = Math.ceil(totalList / pageCount)

  // 가공 로직
  const updatedPermissionList = PermissonInfoList.map((item: PermissionGroupDetail) => ({
    ...item,
    sites:
      item.sites?.length && item.processes?.length
        ? `${item.sites.map((site) => site.name).join(', ')} / ${item.processes
            .map((proc) => proc.name)
            .join(', ')}`
        : '전체권한',

    createdAt: getTodayDateString(item.createdAt) + ' / ' + getTodayDateString(item.updatedAt),
  }))

  const { selectedIds, setSelectedIds } = useAccountStore()

  const router = useRouter()

  const enhancedColumns = PermissionDataList.map((col): GridColDef => {
    if (col.field === 'name') {
      return {
        ...col,
        headerAlign: 'center',
        align: 'center',
        flex: 1,

        renderCell: (params: GridRenderCellParams) => {
          const PermissionId = params.row.id
          return (
            <div
              onClick={() => router.push(`/permissionGroup/registration/${PermissionId}`)}
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

  return (
    <>
      <div className="flex gap-6 p-6">
        <div className="w-full">
          <div className="flex flex-col gap-2 mb-4">
            <div className="flex justify-between">
              <div className="flex items-center gap-2">
                <span className="font-bold text-[16px]">계정찾기</span>
                <CommonInput
                  placeholder="이름, 아이디"
                  value={search.userSearch}
                  onChange={(value) => search.setField('userSearch', value)}
                  className="flex-1"
                />
                <CommonButton
                  label="검색"
                  variant="search"
                  onClick={() => {
                    search.setField('currentPage', 1) // 페이지 초기화
                    search.handleSearch()
                  }}
                  className="px-5 py-2"
                />
                <CommonButton
                  label="초기화"
                  className="px-5 py-2"
                  variant="reset"
                  onClick={search.reset}
                />
              </div>
              <div className="flex gap-4">
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
                        permissionDeleteMutation.mutate({
                          roleIds: idsArray,
                        })
                      }
                    }}
                    className="px-3"
                  />
                  <CommonButton
                    label="+ 그룹등록"
                    variant="secondary"
                    onClick={() => openTab('/permissionGroup/registration', '권한 관리 - 등록')}
                    className="px-3"
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <span className="font-medium">전체 : {totalList}</span>
            </div>
          </div>

          <div style={{ height: 500, width: '100%' }}>
            <DataGrid
              rows={updatedPermissionList}
              columns={enhancedColumns.map((col) => ({
                ...col,
                sortable: false,
                headerAlign: 'center',
                align: 'center',
                flex: 1,
                headerClassName: 'bg-gray-200',
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
        </div>
      </div>
    </>
  )
}
