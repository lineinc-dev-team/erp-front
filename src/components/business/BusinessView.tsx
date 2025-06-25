'use client'

import CommonButton from '../common/Button'
import CommonInput from '../common/Input'
import CommonSelect from '../common/Select'
// import { LocationStatusOptions, ProcessStatusOptions, statusOptions } from '@/config/business.confing'
import CommonDatePicker from '../common/DatePicker'
import { BusinessService } from '@/services/businessService'
import { DataGrid } from '@mui/x-data-grid'
import { BusinessDataList } from '@/config/business.confing'

export default function BusinessView() {
  const {
    businessInfo,
    status,
    setStatus,
    location,
    setLocation,
    process,
    setProcess,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    handleChange,
    handleCreate,
    handleReset,
    handleListRemove,
    handleDownloadExcel,
    handleNewBusinessCreate,
    LocationStatusOptions,
    ProcessStatusOptions,
    statusOptions,
    ArrayStatusOptions,
    sortList,
    setSortList,
  } = BusinessService()

  const rows = [
    {
      id: 1,
      siteCode: 'A123',
      location: '서울',
      siteType: '본사',
      period: '2025-01-01~2025-12-31',
      status: '운영중',
      registrar: '홍길동',
      registeredDate: '2025-01-01',
      modifiedDate: '2025-01-15',
      attachments: '파일1.pdf',
      remark: '비고 없음',
    },
    {
      id: 2,
      siteCode: 'B456',
      location: '부산',
      siteType: '지사',
      period: '2025-01-01~2025-06-30',
      status: '중단',
      registrar: '이영희',
      registeredDate: '2025-01-02',
      modifiedDate: '2025-01-10',
      attachments: '파일2.xlsx',
      remark: '중단됨',
    },
  ]

  return (
    <>
      <div className="border-10 border-gray-400 p-4">
        <div className="grid grid-cols-3">
          <div className="flex">
            <label className="w-36 flex items-center border border-gray-400  justify-center bg-gray-100 font-bold text-center">
              사업자명
            </label>
            <div className="border border-gray-400 px-2 w-full">
              <CommonInput
                value={businessInfo.name}
                onChange={(value) => handleChange('name', value)}
                className=" flex-1"
              />
            </div>
          </div>

          <div className="flex">
            <label className="w-36  border border-gray-400  flex items-center justify-center bg-gray-100 font-bold text-center">
              현장코드
            </label>
            <div className="border border-gray-400 px-2 w-full">
              <CommonInput
                value={businessInfo.code}
                onChange={(value) => handleChange('code', value)}
                className="flex-1"
              />
            </div>
          </div>

          <div className="flex">
            <label className="w-36  border border-gray-400  flex items-center justify-center bg-gray-100 font-bold text-center">
              위치 (지역)
            </label>
            <div className="border border-gray-400 px-2 w-full flex justify-center items-center">
              <CommonSelect value={location} onChange={setLocation} options={LocationStatusOptions} />
            </div>
          </div>

          <div className="flex">
            <label className="w-36  border border-gray-400 flex items-center justify-center bg-gray-100 font-bold text-center">
              사업장 유형
            </label>
            <div className="border border-gray-400 px-2 p-2 w-full flex justify-center items-center">
              <CommonSelect value={status} onChange={setStatus} options={statusOptions} />
            </div>
          </div>

          <div className="flex">
            <label className="w-36  border border-gray-400  flex items-center justify-center bg-gray-100 font-bold text-center">
              사업기간
            </label>
            <div className="border border-gray-400 px-2 w-full flex gap-3 items-center ">
              <CommonDatePicker value={startDate} onChange={setStartDate} />
              ~
              <CommonDatePicker value={endDate} onChange={setEndDate} />
            </div>
          </div>
          <div className="flex">
            <label className="w-36 border border-gray-400  flex items-center justify-center bg-gray-100 font-bold text-center">
              진행 상태
            </label>
            <div className="border border-gray-400 px-2 w-full flex justify-center items-center">
              <CommonSelect value={process} onChange={setProcess} options={ProcessStatusOptions} />
            </div>
          </div>

          <div className="flex">
            <label className="w-36  border border-gray-400  flex items-center justify-center bg-gray-100 font-bold text-center">
              등록자
            </label>

            <div className="border border-gray-400 px-2 w-full flex gap-3 items-center ">
              <CommonInput
                value={businessInfo.description}
                onChange={(value) => handleChange('description', value)}
                className=" flex-1"
              />
            </div>
          </div>
          <div className="flex">
            <label className="w-36 border border-gray-400  flex items-center justify-center bg-gray-100 font-bold text-center">
              등록일자
            </label>
            <div className="border border-gray-400 px-2 w-full flex gap-3 items-center ">
              <CommonDatePicker value={startDate} onChange={setStartDate} />
              ~
              <CommonDatePicker value={endDate} onChange={setEndDate} />
            </div>
          </div>
          <div className="flex">
            <label className="w-36 border border-gray-400  flex items-center justify-center bg-gray-100 font-bold text-center"></label>
            <div className="border border-gray-400 px-2 w-full flex gap-3 items-center "></div>
          </div>
        </div>
        <div className="flex items-center justify-center gap-6">
          <CommonButton label="초기화" variant="reset" onClick={handleReset} className="mt-3 px-20" />

          <CommonButton label="검색" variant="secondary" onClick={handleCreate} className="mt-3 px-20" />
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
              <span className="text-sm font-medium text-gray-600">정렬</span>
              <CommonSelect value={sortList} fullWidth={false} onChange={setSortList} options={ArrayStatusOptions} />
            </div>

            {/* 페이지당 목록 수 */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-600">페이지당 목록 수</span>
              <CommonSelect value={sortList} fullWidth={false} onChange={setSortList} options={ArrayStatusOptions} />
            </div>

            {/* 버튼들 */}
            <div className="flex items-center gap-2">
              <CommonButton label="삭제" variant="reset" onClick={handleListRemove} className="px-3" />
              <CommonButton label="엑셀 다운로드" variant="reset" onClick={handleDownloadExcel} className="px-3" />
              <CommonButton label="+ 신규등록" variant="secondary" onClick={handleNewBusinessCreate} className="px-3" />
            </div>
          </div>
        </div>
      </div>
      <div style={{ height: 500, width: '100%' }}>
        <DataGrid
          rows={rows}
          columns={BusinessDataList.map((col) => ({ ...col, sortable: false }))}
          checkboxSelection
          disableColumnMenu
          hideFooterPagination
        />
      </div>
    </>
  )
}
