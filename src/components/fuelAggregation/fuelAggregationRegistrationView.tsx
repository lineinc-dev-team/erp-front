'use client'

import CommonSelect from '../common/Select'
import CommonButton from '../common/Button'
import {
  Checkbox,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material'
import CommonDatePicker from '../common/DatePicker'
import { formatDateTime, getTodayDateString, unformatNumber } from '@/utils/formatters'
import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { useCallback, useEffect, useRef } from 'react'
import useOutSourcingContract from '@/hooks/useOutSourcingContract'
import { SitesProcessNameScroll } from '@/services/managementCost/managementCostRegistrationService'
import { useSnackbarStore } from '@/stores/useSnackbarStore'
import { useFuelAggregation } from '@/hooks/useFuelAggregation'
import { useFuelFormStore } from '@/stores/fuelAggregationStore'
import CommonInput from '../common/Input'
import { FuelDetailService } from '@/services/fuelAggregation/fuelAggregationRegistrationService'
import { FuelInfo, FuelListInfoData, HistoryItem } from '@/types/fuelAggregation'
// import { useEffect } from 'react'
// import { AttachedFile, DetailItem } from '@/types/managementSteel'

export default function FuelAggregationRegistrationView({ isEditMode = false }) {
  const {
    setField,
    form,
    updateItemField,
    removeCheckedItems,
    reset,
    addItem,
    updateMemo,
    toggleCheckItem,
  } = useFuelFormStore()

  const { showSnackbar } = useSnackbarStore()

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

    setCompanySearch,
    companyOptions,
    comPanyNameFetchNextPage,
    comPanyNamehasNextPage,
    comPanyNameFetching,
    comPanyNameLoading,
  } = useOutSourcingContract()

  const {
    WeatherTypeMethodOptions,
    FuelCancel,
    FuelModifyMutation,

    setDriverSearch,
    fuelDriverOptions,
    fuelDriverFetchNextPage,
    fuelDriverHasNextPage,
    fuelDriverIsFetching,
    fuelDriverLoading,

    // 차량번호 & 장비명
    setEquipmentSearch,
    fuelEquipmentOptions,
    fuelEquipmentFetchNextPage,
    fuelEquipmentHasNextPage,
    fuelEquipmentIsFetching,
    fuelEquipmentLoading,

    createFuelMutation,
    OilTypeMethodOptions,

    useFuelHistoryDataQuery,
  } = useFuelAggregation()

  const textFieldStyle = {
    '& .MuiOutlinedInput-root': {
      '& fieldset': { borderColor: 'black' },
      '&:hover fieldset': { borderColor: 'black' },
      '&.Mui-focused fieldset': { borderColor: 'black' },
    },
  }

  // 체크 박스에 활용
  const fuelInfo = form.fuelInfos
  const checkedIds = form.checkedFuelItemIds
  // const isAllChecked = managers.length > 0 && checkedIds.length === managers.length

  // 상세페이지 로직

  const params = useParams()
  const fuelDetailId = Number(params?.id)

  const { data } = useQuery({
    queryKey: ['FuelDetailInfo'],
    queryFn: () => FuelDetailService(fuelDetailId),
    enabled: isEditMode && !!fuelDetailId, // 수정 모드일 때만 fetch
  })

  const PROPERTY_NAME_MAP: Record<string, string> = {
    siteName: '현장명',
    processName: '공정명',
    outsourcingCompanyName: '업체명',
    dateFormat: '일자',
    weatherName: '날씨',
    driverName: '기사명',
    equipmentSpecification: '차량번호',
    fuelTypeName: '유종',
    fuelAmount: '주유량',
    memo: '메모',
  }

  const {
    data: materialHistoryList,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useFuelHistoryDataQuery(fuelDetailId, isEditMode)

  const historyList = useFuelFormStore((state) => state.form.changeHistories)

  useEffect(() => {
    if (data && isEditMode === true) {
      const client = data.data

      console.log('상세 자재 !!', client)
      // // 상세 항목 가공
      const formattedDetails = (client.fuelInfos ?? []).map((item: FuelListInfoData) => ({
        id: item.id,
        outsourcingCompanyId: item.outsourcingCompany?.id ?? 0,
        businessNumber: item.outsourcingCompany?.businessNumber ?? '',
        driverId: item.driver.id ?? '',
        specificationName: item.equipment.specification ?? '',
        fuelType: item.fuelTypeCode ?? '',
        fuelAmount: item.fuelAmount ?? '0',
        equipmentId: item.equipment.id ?? '',
        createdAt: item.createdAt ?? '',
        updatedAt: item.updatedAt ?? '',
        memo: item.memo,
        modifyDate: `${getTodayDateString(item.createdAt)} / ${getTodayDateString(item.updatedAt)}`,
      }))

      console.log('formattedDetailsformattedDetails', formattedDetails)
      setField('fuelInfos', formattedDetails)

      // 각 필드에 값 세팅
      setField('siteId', client.site?.id ?? '')
      setField('siteProcessId', client.process?.id ?? '')

      setField('date', client.date ? new Date(client.date) : null)
      setField('weather', client.weatherCode)
    } else {
      reset()
    }
  }, [data, isEditMode, reset, setField])

  const formatChangeDetail = (getChanges: string) => {
    try {
      const parsed = JSON.parse(getChanges)
      if (!Array.isArray(parsed)) return '-'

      return parsed.map(
        (item: { property: string; before: string | null; after: string | null }, idx: number) => {
          const propertyKo = PROPERTY_NAME_MAP[item.property] || item.property

          const convertValue = (value: string | null) => {
            if (value === 'true') return '사용'
            if (value === 'false') return '미사용'
            if (value === null || value === 'null') return 'null'
            return value
          }

          let before = convertValue(item.before)
          let after = convertValue(item.after)

          // 스타일 결정
          let style = {}
          if (before === 'null') {
            before = '추가'
            style = { color: '#1976d2' } // 파란색 - 추가
          } else if (after === 'null') {
            after = '삭제'
            style = { color: '#d32f2f' } // 빨간색 - 삭제
          }

          return (
            <Typography key={idx} component="div" style={style}>
              {before === '추가'
                ? `추가됨 => ${after}`
                : after === '삭제'
                ? ` ${before} => 삭제됨`
                : `${propertyKo} : ${before} => ${after}`}
            </Typography>
          )
        },
      )
    } catch (e) {
      if (e instanceof Error) return '-'
    }
  }

  // 수정이력 데이터가 들어옴
  useEffect(() => {
    if (materialHistoryList?.pages) {
      const allHistories = materialHistoryList.pages.flatMap((page) =>
        page.data.content.map((item: HistoryItem) => ({
          id: item.id,
          type: item.type,
          content: formatChangeDetail(item.getChanges), // 여기 변경
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
          updatedBy: item.updatedBy,
          memo: item.memo ?? '',
        })),
      )
      setField('changeHistories', allHistories)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [materialHistoryList, setField])

  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadMoreRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (isLoading || isFetchingNextPage) return
      if (observerRef.current) observerRef.current.disconnect()

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasNextPage) {
          fetchNextPage()
        }
      })

      if (node) observerRef.current.observe(node)
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage, isLoading],
  )

  function validateFuelForm(form: FuelInfo) {
    if (!form.siteId) return '현장명을 선택하세요.'
    if (!form.siteProcessId) return '공정명을 선택하세요.'
    if (!form.date) return '일자를 입력하세요.'
    if (form.weather === 'BASE') return '날씨를 선택하세요.'

    // 담당자 유효성 체크
    if (fuelInfo.length > 0) {
      for (const item of fuelInfo) {
        if (!item.outsourcingCompanyId) return '업체명을 선택하세요.'
        if (!item.driverId) return '기사명을 선택하세요.'
        if (!item.equipmentId) return '차량번호를 선택하세요.'
        if (!item.specificationName?.trim()) return '규격이 올바르지 않습니다.'
        if (!item.fuelType?.trim()) return '유종을 선택하세요.'
        if (!item.fuelAmount) return '주유량을 입력하세요.'
      }
    }

    return null
  }

  const handleFuelSubmit = () => {
    const errorMsg = validateFuelForm(form)
    if (errorMsg) {
      showSnackbar(errorMsg, 'warning')
      return
    }

    if (!form.fuelInfos || form.fuelInfos.length === 0) {
      showSnackbar('유류정보 항목을 1개 이상 입력해주세요.', 'warning')
      return
    }

    if (isEditMode) {
      if (window.confirm('수정하시겠습니까?')) {
        FuelModifyMutation.mutate(fuelDetailId)
      }
    } else {
      createFuelMutation.mutate()
    }
  }

  return (
    <>
      <div>
        <span className="font-bold border-b-2 mb-4">기본 정보</span>
        <div className="grid grid-cols-2 mt-1 ">
          <div className="flex">
            <label className="w-36  text-[14px] flex items-center border border-gray-400  justify-center bg-gray-300  font-bold text-center">
              현장명
            </label>
            <div className="border border-gray-400 px-2 p-2 w-full flex items-center">
              <CommonSelect
                fullWidth
                value={form.siteId || 0}
                onChange={async (value) => {
                  const selectedSite = sitesOptions.find((opt) => opt.id === value)
                  if (!selectedSite) return

                  setField('siteId', selectedSite.id)
                  setField('siteName', selectedSite.name)

                  const res = await SitesProcessNameScroll({
                    pageParam: 0,
                    siteId: selectedSite.id,
                    keyword: '',
                  })

                  const processes = res.data?.content || []
                  if (processes.length > 0) {
                    setField('siteProcessId', processes[0].id)
                    setField('siteProcessName', processes[0].name)
                  } else {
                    setField('siteProcessId', 0)
                    setField('siteProcessName', '')
                  }
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
              <CommonSelect
                fullWidth
                className="text-xl"
                value={form.siteProcessId || 0}
                onChange={(value) => {
                  const selectedProcess = processOptions.find((opt) => opt.name === value)
                  if (selectedProcess) {
                    setField('siteProcessId', selectedProcess.id)
                    setField('siteProcessName', selectedProcess.name)
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
            <label className="w-36 text-[14px] flex items-center border border-gray-400 justify-center bg-gray-300 font-bold text-center">
              일자
            </label>
            <div className="border flex items-center gap-4 border-gray-400 px-2 w-full">
              <CommonDatePicker value={form.date} onChange={(value) => setField('date', value)} />
            </div>
          </div>

          <div className="flex">
            <label className="w-36  text-[14px] flex items-center border border-gray-400  justify-center bg-gray-300  font-bold text-center">
              날씨
            </label>
            <div className="border border-gray-400 px-2 w-full flex gap-3 items-center p-3">
              <CommonSelect
                fullWidth={true}
                value={form.weather || 'BASE'}
                onChange={(value) => setField('weather', value)}
                options={WeatherTypeMethodOptions}
              />
            </div>
          </div>
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mt-10 mb-2">
          <span className="font-bold border-b-2 mb-4">유류정보</span>
          <div className="flex gap-4">
            <CommonButton
              label="삭제"
              className="px-7"
              variant="danger"
              onClick={() => removeCheckedItems('FuelInfo')}
            />
            <CommonButton
              label="추가"
              className="px-7"
              variant="secondary"
              onClick={() => addItem('FuelInfo')}
            />
          </div>
        </div>
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: '#D1D5DB', border: '1px solid  #9CA3AF' }}>
                <TableCell padding="checkbox" sx={{ border: '1px solid  #9CA3AF' }}></TableCell>
                {['업체명', '기사명', '차량번호', '규격', '유종', '주유량', '비고'].map((label) => (
                  <TableCell
                    key={label}
                    align="center"
                    sx={{
                      backgroundColor: '#D1D5DB',
                      border: '1px solid  #9CA3AF',
                      color: 'black',
                      fontWeight: 'bold',
                    }}
                  >
                    {label}
                  </TableCell>
                ))}
                {isEditMode && (
                  <TableCell
                    align="center"
                    sx={{
                      backgroundColor: '#D1D5DB',
                      border: '1px solid  #9CA3AF',
                      color: 'black',
                      fontWeight: 'bold',
                    }}
                  >
                    등록/수정일
                  </TableCell>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {fuelInfo.map((m) => (
                <TableRow key={m.id}>
                  {/* 체크박스 */}
                  <TableCell padding="checkbox" sx={{ border: '1px solid  #9CA3AF' }}>
                    <Checkbox
                      checked={checkedIds.includes(m.id)}
                      onChange={(e) => toggleCheckItem('FuelInfo', m.id, e.target.checked)}
                    />
                  </TableCell>
                  {/*   업체명 */}
                  <TableCell>
                    <CommonSelect
                      fullWidth
                      value={m.outsourcingCompanyId || 0}
                      onChange={async (value) => {
                        const selectedCompany = companyOptions.find((opt) => opt.id === value)
                        if (!selectedCompany) return

                        updateItemField(
                          'FuelInfo',
                          m.id,
                          'outsourcingCompanyId',
                          selectedCompany.id,
                        )
                      }}
                      options={companyOptions}
                      onScrollToBottom={() => {
                        if (comPanyNamehasNextPage && !comPanyNameFetching)
                          comPanyNameFetchNextPage()
                      }}
                      onInputChange={(value) => setCompanySearch(value)}
                      loading={comPanyNameLoading}
                    />
                  </TableCell>
                  {/* 기사명 */}
                  <TableCell sx={{ border: '1px solid  #9CA3AF', width: '140px' }}>
                    <CommonSelect
                      fullWidth
                      value={m.driverId}
                      onChange={async (value) => {
                        const selectedDriver = fuelDriverOptions.find((opt) => opt.id === value)
                        if (!selectedDriver) return

                        updateItemField('FuelInfo', m.id, 'driverId', selectedDriver.id)
                      }}
                      options={fuelDriverOptions}
                      onScrollToBottom={() => {
                        if (fuelDriverHasNextPage && !fuelDriverIsFetching)
                          fuelDriverFetchNextPage()
                      }}
                      onInputChange={(value) => setDriverSearch(value)}
                      loading={fuelDriverLoading}
                    />
                  </TableCell>
                  {/* 차량번호 */}
                  {/* 차량번호 */}
                  <TableCell sx={{ border: '1px solid  #9CA3AF', width: '140px' }}>
                    <CommonSelect
                      fullWidth
                      value={m.equipmentId || 0} // 장비 선택은 ID 기준
                      onChange={async (value) => {
                        const selectedEquipment = fuelEquipmentOptions.find(
                          (opt) => opt.id === value,
                        )
                        if (!selectedEquipment) return

                        // 차량번호
                        updateItemField('FuelInfo', m.id, 'equipmentId', selectedEquipment.id)

                        // ID는 equipmentId에, 차량번호는 specificationName 필드에 저장
                        updateItemField(
                          'FuelInfo',
                          m.id,
                          'specificationName',
                          selectedEquipment.specification || '',
                        )
                      }}
                      options={fuelEquipmentOptions}
                      onScrollToBottom={() => {
                        if (fuelEquipmentHasNextPage && !fuelEquipmentIsFetching)
                          fuelEquipmentFetchNextPage()
                      }}
                      onInputChange={(value) => setEquipmentSearch(value)}
                      loading={fuelEquipmentLoading}
                    />
                  </TableCell>

                  {/* 규격 */}
                  <TableCell sx={{ border: '1px solid  #9CA3AF', width: '150px' }}>
                    <CommonInput
                      placeholder="자동 입력"
                      value={m.specificationName ?? ''}
                      onChange={(value) =>
                        updateItemField('FuelInfo', m.id, 'specificationName', value)
                      }
                      disabled={true}
                      className=" flex-1"
                    />
                  </TableCell>
                  {/* 유종 */}
                  <TableCell sx={{ border: '1px solid  #9CA3AF' }}>
                    <CommonSelect
                      fullWidth={true}
                      value={m.fuelType || 'BASE'}
                      onChange={async (value) => {
                        updateItemField('FuelInfo', m.id, 'fuelType', value)
                      }}
                      options={OilTypeMethodOptions}
                    />
                  </TableCell>
                  {/* 주유량 */}
                  <TableCell align="center" sx={{ border: '1px solid #9CA3AF', width: '120px' }}>
                    <TextField
                      size="small"
                      placeholder="'-'없이 숫자만 입력"
                      value={m.fuelAmount}
                      onChange={(e) => {
                        const formatted = unformatNumber(e.target.value)
                        updateItemField('FuelInfo', m.id, 'fuelAmount', formatted)
                      }}
                    />
                  </TableCell>
                  {/* 비고 */}
                  <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                    <TextField
                      size="small"
                      placeholder="텍스트 입력"
                      value={m.memo}
                      onChange={(e) => updateItemField('FuelInfo', m.id, 'memo', e.target.value)}
                      variant="outlined"
                      sx={textFieldStyle}
                    />
                  </TableCell>
                  {isEditMode && (
                    <TableCell align="center" sx={{ border: '1px solid  #9CA3AF', width: '260px' }}>
                      <CommonInput
                        placeholder="자동 입력"
                        value={m.modifyDate ?? ''}
                        onChange={(value) => updateItemField('FuelInfo', m.id, 'modifyDate', value)}
                        disabled={true}
                        className=" flex-1"
                      />
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>

      {isEditMode && (
        <div>
          <div className="flex justify-between items-center mt-10 mb-2">
            <span className="font-bold border-b-2 mb-4">수정이력</span>
            <div className="flex gap-4">
              {/* <CommonButton
                          label="삭제"
                          className="px-7"
                          variant="danger"
                          onClick={() => removeCheckedItems('manager')}
                        />
                        <CommonButton
                          label="추가"
                          className="px-7"
                          variant="secondary"
                          onClick={() => addItem('manager')}
                        /> */}
            </div>
          </div>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: '#D1D5DB', border: '1px solid  #9CA3AF' }}>
                  {['수정일시', '항목', '수정항목', '수정자', '비고 / 메모'].map((label) => (
                    <TableCell
                      key={label}
                      align="center"
                      sx={{
                        backgroundColor: '#D1D5DB',
                        border: '1px solid  #9CA3AF',
                        color: 'black',
                        fontWeight: 'bold',
                      }}
                    >
                      {label}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {historyList.map((item: HistoryItem) => (
                  <TableRow key={item.id}>
                    <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                      {formatDateTime(item.createdAt)} / {formatDateTime(item.updatedAt)}
                    </TableCell>
                    <TableCell
                      align="left"
                      sx={{
                        border: '1px solid  #9CA3AF',
                        textAlign: 'center',
                        whiteSpace: 'pre-line',
                      }}
                    >
                      {item.type}
                    </TableCell>
                    <TableCell
                      align="left"
                      sx={{ border: '1px solid  #9CA3AF', whiteSpace: 'pre-line' }}
                    >
                      {item.content}
                    </TableCell>
                    <TableCell
                      align="left"
                      sx={{ border: '1px solid  #9CA3AF', whiteSpace: 'pre-line' }}
                    >
                      {item.updatedBy}
                    </TableCell>
                    <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                      <TextField
                        fullWidth
                        size="small"
                        value={item.memo ?? ''}
                        placeholder="메모 입력"
                        onChange={(e) => updateMemo(item.id, e.target.value)}
                        multiline
                        inputProps={{ maxLength: 500 }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
                {hasNextPage && (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ border: 'none' }}>
                      <div ref={loadMoreRef} className="p-4 text-gray-500 text-sm">
                        불러오는 중...
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      )}

      <div className="flex justify-center gap-10 mt-10">
        <CommonButton label="취소" variant="reset" className="px-10" onClick={FuelCancel} />

        <CommonButton
          label={isEditMode ? '+ 수정' : '+ 등록'}
          className="px-10 font-bold"
          variant="secondary"
          onClick={handleFuelSubmit}
        />
      </div>
    </>
  )
}
