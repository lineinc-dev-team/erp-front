/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import CommonButton from '../common/Button'
import { Tooltip } from '@mui/material'

import CommonInput from '../common/Input'
import CommonSelect from '../common/Select'
import CommonDatePicker from '../common/DatePicker'
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import { Checkbox, ListItemText, MenuItem, Pagination, Select } from '@mui/material'
import { SiteExcelDownload } from '@/services/sites/siteService'
import { useSiteSearchStore } from '@/stores/siteStore'
import useSite from '@/hooks/useSite'
import { useAccountStore } from '@/stores/accountManagementStore'
import { useRouter } from 'next/navigation'
import {
  ArrayStatusOptions,
  CityOptions,
  DistrictGuOptions,
  PageCount,
  SiteColumnList,
  SiteProgressing,
} from '@/config/erp.confing'
import { OrderInfoProps, processStatuses, SiteListProps } from '@/types/site'
import { formatNumber, getTodayDateString } from '@/utils/formatters'
import { Fragment, useEffect, useState } from 'react'
import ExcelModal from '../common/ExcelModal'
import { SiteExcelFieldMap } from '@/utils/userExcelField'
import { useTabOpener } from '@/utils/openTab'
import CommonSelectByName from '../common/CommonSelectByName'
import { useSnackbarStore } from '@/stores/useSnackbarStore'
import useOutSourcingContract from '@/hooks/useOutSourcingContract'
import { myInfoProps } from '@/types/user'
import { useMenuPermission } from '../common/MenuPermissionView'
import { CustomNoRowsOverlay } from '../common/NoData'
import { useDebouncedValue } from '@/hooks/useDebouncedEffect'
import { InfiniteScrollSelect } from '../common/InfiniteScrollSelect'
import { SitesProcessNameScroll } from '@/services/managementCost/managementCostRegistrationService'

export default function SitesView() {
  const { search } = useSiteSearchStore()

  const openTab = useTabOpener()

  // 현장명 공정명 무한 스크롤
  const {
    useSitePersonNameListInfiniteScroll,

    setProcessSearch,
    processOptions,
    processInfoFetchNextPage,
    processInfoHasNextPage,
    processInfoIsFetching,
    processInfoLoading,
  } = useOutSourcingContract()

  const {
    SiteListQuery,
    SiteDeleteMutation,

    useOrderingNameListInfiniteScroll,
  } = useSite()

  const { showSnackbar } = useSnackbarStore()

  const SiteDataList = SiteListQuery.data?.data.content ?? []

  const totalList = SiteListQuery.data?.data.pageInfo.totalElements ?? 0
  const pageCount = Number(search.pageCount) || 10
  const totalPages = Math.ceil(totalList / pageCount)

  const updateSiteList = SiteDataList.map((site: SiteListProps) => ({
    ...site,
    processName: site.process?.name || '-', // 공정명
    managerName: site.manager?.username || '-', // 공정소장 이름
    // type: site.type || '-',
    contractAmount: formatNumber(site.contractAmount) || '-',
    hasFile: site.hasFile === true ? 'Y' : 'N',
    processStatuses: site.process?.status || '-', // 진행상태
    clientCompanyName: site.clientCompany?.name || '-', // 발주처명
    // period: getTodayDateString(site.startedAt) + ' ~ ' + getTodayDateString(site.endedAt),
    createdAt: getTodayDateString(site.createdAt),
    memo: site.memo || '-',
  }))

  const { selectedIds, setSelectedIds } = useAccountStore()

  const router = useRouter()

  // 그리도 라우팅 로직!
  const enhancedColumns = SiteColumnList.map((col): GridColDef => {
    if (col.field === 'address') {
      return {
        ...col,
        sortable: false,
        headerAlign: 'center',
        align: 'center',
        flex: 2,
        renderCell: (params: GridRenderCellParams) => {
          const item = params.row as SiteListProps

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
    if (col.field === 'period') {
      return {
        ...col,
        sortable: false,
        headerAlign: 'center',
        align: 'center',
        minWidth: 120,
        maxWidth: 120,
        renderCell: (params: GridRenderCellParams) => {
          const item = params.row as SiteListProps

          return (
            <div className="flex flex-col items-center">
              <Fragment>
                <div className="whitespace-pre-wrap">{getTodayDateString(item.startedAt)}</div>
                <div className="whitespace-pre-wrap">{getTodayDateString(item.endedAt)}</div>
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
        flex: 1,

        renderCell: (params: GridRenderCellParams) => {
          const siteId = params.row.id
          const handleClick = () => {
            if (hasModify) {
              router.push(`/sites/registration/${siteId}`)
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

    if (col.field === 'processName') {
      return {
        ...col,
        headerAlign: 'center',
        align: 'center',
        minWidth: 220,
        maxWidth: 220,
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

    if (col.field === 'memo') {
      return {
        ...col,
        headerAlign: 'center',
        align: 'center',
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

    if (col.field === 'hasFile') {
      return {
        ...col,
        headerAlign: 'center',
        align: 'center',
        minWidth: 70,
        maxWidth: 70,
      }
    }
    if (col.field === 'contractAmount') {
      return {
        ...col,
        headerAlign: 'right', // 헤더 텍스트 오른쪽 정렬
        align: 'right', // 셀 내용 오른쪽 정렬
        minWidth: 150,
        maxWidth: 150,
        renderCell: (params: GridRenderCellParams) => {
          const value = params.value as number
          return <span>{value?.toLocaleString() || '-'}</span> // 1,000 단위 콤마 표시
        },
      }
    }

    if (col.field === 'createdAt') {
      return {
        ...col,
        headerAlign: 'center',
        align: 'center',
        minWidth: 70,
        maxWidth: 70,
      }
    }

    if (col.field === 'createdBy') {
      return {
        ...col,
        headerAlign: 'center',
        align: 'center',
        minWidth: 70,
        maxWidth: 70,
      }
    }

    if (col.field === 'processStatuses') {
      return {
        ...col,
        headerAlign: 'center',
        align: 'center',
        minWidth: 70,
        maxWidth: 70,
      }
    }

    if (col.field === 'managerName') {
      return {
        ...col,
        headerAlign: 'center',
        align: 'center',
        minWidth: 70,
        maxWidth: 70,
      }
    }

    if (col.field === 'clientCompanyName') {
      return {
        ...col,
        headerAlign: 'center',
        align: 'center',
        minWidth: 100,
        maxWidth: 100,
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
  const fieldMapArray = Object.entries(SiteExcelFieldMap).map(([label, value]) => ({
    label,
    value,
  }))

  const handleDownloadExcel = async (fields: string[]) => {
    await SiteExcelDownload({
      sort: search.arraySort === '최신순' ? 'id,desc' : 'id,asc',
      name: search.name,
      processName: search.processName,
      city: search.city,
      district: search.district,
      // type: search.type,
      processStatuses: search.processStatuses,
      clientCompanyName: search.clientCompanyName,
      // managerName: search.managerName,
      startDate: search.startDate ? getTodayDateString(search.startDate) : undefined,
      endDate: search.endDate ? getTodayDateString(search.endDate) : undefined,
      createdStartDate: search.createdStartDate
        ? getTodayDateString(search.createdStartDate)
        : undefined,
      createdEndDate: search.createdEndDate ? getTodayDateString(search.createdEndDate) : undefined,
      createdBy: search.createdBy,
      fields,
    })
  }

  // 현장명 키워드 검색

  const [isSiteFocused, setIsSiteFocused] = useState(false)

  // 유저 선택 시 처리
  // const handleSelectSiting = (selectedUser: any) => {
  //   search.setField('name', selectedUser.name)
  // }

  const debouncedSiteKeyword = useDebouncedValue(search.name, 300)

  const {
    data: SiteNameData,
    fetchNextPage: SiteNameFetchNextPage,
    hasNextPage: SiteNameHasNextPage,
    isFetching: SiteNameIsFetching,
    isLoading: SiteNameIsLoading,
  } = useSitePersonNameListInfiniteScroll(debouncedSiteKeyword)

  const SiteRawList = SiteNameData?.pages.flatMap((page) => page.data.content) ?? []
  const siteList = Array.from(new Map(SiteRawList.map((user) => [user.name, user])).values())

  // 발주처 검색 키워드
  const [isOrderFocused, setIsOrderFocused] = useState(false)

  // 유저 선택 시 처리
  const handleSelectOrdering = (selectedUser: OrderInfoProps) => {
    // 예: username 필드에 선택한 유저 이름 넣기
    search.setField('clientCompanyName', selectedUser.name)
  }

  const debouncedOrderingKeyword = useDebouncedValue(search.clientCompanyName, 300)

  const {
    data: OrderNameData,
    fetchNextPage: OrderNameFetchNextPage,
    hasNextPage: OrderNameHasNextPage,
    isFetching: OrderNameIsFetching,
    isLoading: OrderNameIsLoading,
  } = useOrderingNameListInfiniteScroll(debouncedOrderingKeyword)

  const OrderRawList = OrderNameData?.pages.flatMap((page) => page.data.content) ?? []
  const orderList = Array.from(new Map(OrderRawList.map((user) => [user.name, user])).values())

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
    '현장 관리',
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
            <label className="w-[144px] text-[14px] flex items-center border border-gray-400  justify-center bg-gray-300  font-bold text-center">
              현장명
            </label>
            <div
              className="border border-gray-400 w-full flex items-center"
              onKeyDown={handleEnterKey}
            >
              <InfiniteScrollSelect
                placeholder="현장명을 입력하세요"
                keyword={search.name}
                // onChangeKeyword={(newKeyword) => search.setField('siteName', newKeyword)} // ★필드명과 값 둘 다 넘겨야 함
                onChangeKeyword={(newKeyword) => {
                  search.setField('name', newKeyword)

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
                  search.setField('nameId', selectedSite.id)
                  search.setField(
                    'name',
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
                disabled
              />
            </div>
          </div>

          <div className="flex">
            <label className="w-36 text-[14px] border border-gray-400 flex items-center justify-center bg-gray-300 font-bold text-center">
              지역(시/군/구)
            </label>
            <div
              className="border border-gray-400 gap-6 px-2 w-full flex justify-center items-center"
              onKeyDown={handleEnterKey}
            >
              {/* 시/도 선택 */}
              <CommonSelect
                className="text-2xl w-full"
                value={search.city || '0'}
                onChange={(value) => {
                  search.setField('city', value)
                  // 시/도 바뀌면 구 선택 초기화
                  search.setField('district', '0')
                }}
                options={CityOptions}
                fullWidth={true}
              />

              <CommonSelect
                className="text-2xl w-full"
                value={search.district || '0'}
                onChange={(value) => search.setField('district', value)}
                options={DistrictGuOptions.filter(
                  (d) => d.id === '0' || d.id.startsWith(search.city),
                )}
                fullWidth={true}
              />
            </div>
          </div>

          {/* <div className="flex">
            <label className="w-36 text-[14px]  border border-gray-400  flex items-center justify-center bg-gray-300  font-bold text-center">
              현장유형
            </label>
            <div className="border border-gray-400 px-2 w-full flex justify-center items-center">
              <CommonSelect
                fullWidth={true}
                className="text-xl"
                value={search.type || 'BASE'}
                displayLabel
                onChange={(value) => search.setField('type', value)}
                options={siteTypeOptions}
              />
            </div>
          </div> */}
          <div className="flex">
            <label className="w-36 text-[14px]  border border-gray-400  flex items-center justify-center bg-gray-300  font-bold text-center">
              진행상태
            </label>
            <div className="border p-2 border-gray-400 px-2 w-full flex justify-center items-center">
              <Select
                multiple
                value={search.processStatuses} // ProcessStatus[] (code 배열)
                onChange={(e) => {
                  search.setField('processStatuses', e.target.value as processStatuses[])
                }}
                renderValue={(selected) => {
                  if ((selected as processStatuses[]).length === 0) return '선택'

                  return (selected as processStatuses[])
                    .map((code) => SiteProgressing.find((item) => item.code === code)?.name ?? code)
                    .join(', ')
                }}
                displayEmpty
                className="w-full"
                sx={{
                  minHeight: 40,
                  '&.MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: 'black',
                      borderWidth: '1px',
                    },
                    '&:hover fieldset': {
                      borderColor: 'black',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'black',
                    },
                  },
                  '& .MuiSelect-select': {
                    paddingTop: '4px',
                    paddingBottom: '4px',
                    fontSize: '1rem',
                  },
                }}
              >
                {SiteProgressing.filter((item) => item.code !== '선택').map((option) => (
                  <MenuItem key={option.id} value={option.code}>
                    <Checkbox
                      checked={search.processStatuses.includes(option.code as processStatuses)}
                    />

                    <ListItemText primary={option.name} />
                  </MenuItem>
                ))}
              </Select>
            </div>
          </div>

          <div className="flex">
            <label className="w-[143px] text-[14px] flex items-center border border-gray-400 justify-center bg-gray-300 font-bold text-center">
              발주처
            </label>
            <div
              className="border border-gray-400  w-full flex items-center"
              onKeyDown={handleEnterKey}
            >
              <InfiniteScrollSelect
                placeholder="발주처명을 입력하세요"
                keyword={search.clientCompanyName}
                onChangeKeyword={(newKeyword) => search.setField('clientCompanyName', newKeyword)} // ★필드명과 값 둘 다 넘겨야 함
                items={orderList}
                hasNextPage={OrderNameHasNextPage ?? false}
                fetchNextPage={OrderNameFetchNextPage}
                renderItem={(item, isHighlighted) => (
                  <div className={isHighlighted ? 'font-bold text-white p-1  bg-gray-400' : ''}>
                    {item.name}
                  </div>
                )}
                onSelect={handleSelectOrdering}
                // shouldShowList={true}
                isLoading={OrderNameIsLoading || OrderNameIsFetching}
                debouncedKeyword={debouncedOrderingKeyword}
                shouldShowList={isOrderFocused}
                onFocus={() => setIsOrderFocused(true)}
                onBlur={() => setIsOrderFocused(false)}
              />
            </div>
          </div>

          <div className="flex">
            <label className="w-36 text-[14px]  border border-gray-400  flex items-center justify-center bg-gray-300  font-bold text-center">
              공정소장
            </label>
            <div className="border border-gray-400 px-2 w-full flex gap-3 items-center ">
              <CommonInput
                value={search.managerName}
                onKeyDown={handleEnterKey}
                onChange={(value) => search.setField('managerName', value)}
                className=" flex-1"
              />
            </div>
          </div>

          <div className="flex">
            <label className="w-36  border border-gray-400  flex items-center justify-center bg-gray-300  font-bold text-center">
              사업기간
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
            <label className="w-36  border border-gray-400  flex items-center justify-center bg-gray-300  font-bold text-center">
              등록일자
            </label>
            <div className="border border-gray-400 px-2 w-full flex gap-3 items-center ">
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
            <label className="w-36 text-[14px] border border-gray-400  flex items-center justify-center bg-gray-300  font-bold text-center">
              등록자
            </label>
            <div className="border border-gray-400 px-2 w-full flex gap-3 items-center ">
              <CommonInput
                value={search.createdBy}
                onKeyDown={handleEnterKey}
                onChange={(value) => search.setField('createdBy', value)}
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
                    SiteDeleteMutation.mutate({
                      siteIds: idsArray,
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
                disabled={!hasCreate} // 권한 없으면 비활성화
                variant="secondary"
                onClick={() => openTab('/sites/registration', '현장관리 - 등록')}
                className="px-3"
              />
            </div>
          </div>
        </div>
      </div>
      <div style={{ width: '100%' }}>
        <DataGrid
          rows={updateSiteList}
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
          getRowHeight={() => 'auto'}
          sx={{
            '& .MuiDataGrid-cell': {
              display: 'flex',
              alignItems: 'center',
              whiteSpace: 'normal',
              lineHeight: '2.8rem',
              paddingTop: '12px',
              paddingBottom: '12px',
            },
            // contractAmount 컬럼만 오른쪽 정렬
            '& .MuiDataGrid-cell[data-field="contractAmount"]': {
              justifyContent: 'flex-end',
              paddingRight: '16px', // 원하는 여백
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
            siblingCount={3} // 기본 1 → 증가
            boundaryCount={2} // 기본 1 → 2 정도로
          />
        </div>
      </div>

      {/* <ContractHistory open={contract} onClose={() => setContract(false)} /> */}
    </>
  )
}
