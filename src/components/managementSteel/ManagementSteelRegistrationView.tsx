'use client'

import CommonInput from '../common/Input'
import CommonSelect from '../common/Select'
import CommonButton from '../common/Button'
import CommonFileInput from '../common/FileInput'
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
} from '@mui/material'
import { steelTypeOptions } from '@/config/erp.confing'
import { useQuery } from '@tanstack/react-query'
import { useParams } from 'next/navigation'
import CommonDatePicker from '../common/DatePicker'
import { useManagementCost } from '@/hooks/useManagementCost'
import { formatNumber, unformatNumber } from '@/utils/formatters'
import { useManagementSteelFormStore } from '@/stores/managementSteelStore'
import { useManagementSteel } from '@/hooks/useManagementSteel'
import { useEffect } from 'react'
import { SteelDetailService } from '@/services/managementSteel/managementSteelRegistrationService'
import { AttachedFile, DetailItem } from '@/types/managementSteel'

export default function ManagementSteelRegistrationView({ isEditMode = false }) {
  const {
    setField,
    form,
    updateItemField,
    removeCheckedItems,
    reset,
    addItem,
    toggleCheckItem,
    toggleCheckAllItems,
  } = useManagementSteelFormStore()

  const {
    setSitesSearch,
    sitesOptions,
    setProcessSearch,
    processOptions,

    siteNameFetchNextPage,
    siteNamehasNextPage,
    siteNameFetching,
    siteNameLoading,

    processInfoFetchNextPage,
    processInfoHasNextPage,
    processInfoIsFetching,
    processInfoLoading,
  } = useManagementCost()

  const { createSteelMutation, SteelModifyMutation } = useManagementSteel()

  // 체크 박스에 활용
  const managers = form.details
  const checkedIds = form.checkedMaterialItemIds
  const isAllChecked = managers.length > 0 && checkedIds.length === managers.length

  const attachedFiles = form.attachedFiles
  const fileCheckIds = form.checkedAttachedFileIds
  const isFilesAllChecked = attachedFiles.length > 0 && fileCheckIds.length === attachedFiles.length

  // 상세페이지 로직

  const params = useParams()
  const steelDetailId = Number(params?.id)

  const { data } = useQuery({
    queryKey: ['SteelDetailInfo'],
    queryFn: () => SteelDetailService(steelDetailId),
    enabled: isEditMode && !!steelDetailId, // 수정 모드일 때만 fetch
  })

  console.log('상세데이터', data)

  useEffect(() => {
    if (data && isEditMode === true) {
      const client = data.data

      console.log('발주처 데이터 확인', client)

      // // 상세 항목 가공
      const formattedDetails = (client.details ?? []).map((c: DetailItem) => ({
        id: c.id,
        name: c.name,
        quantity: c.quantity,
        unit: c.unit,
        unitPrice: c.unitPrice,
        supplyPrice: c.supplyPrice,
        count: c.count,
        length: c.length,
        totalLength: c.totalLength,
        unitWeight: c.unitWeight,
        standard: c.standard,
        memo: c.memo,
      }))
      setField('details', formattedDetails)

      // // 첨부 파일 가공
      const formattedFiles = (client.files ?? []).map((item: AttachedFile) => ({
        id: item.id,
        name: item.name,
        memo: item.memo,
        files: [
          {
            publicUrl: item.fileUrl,
            file: {
              name: item.originalFileName,
            },
          },
        ],
      }))
      setField('attachedFiles', formattedFiles)

      // 각 필드에 값 세팅
      setField('siteId', client.site?.id ?? '')
      setField('siteProcessId', client.process?.id ?? '')
      setField('paymentDate', client.paymentDate ? new Date(client.paymentDate) : null)
      setField('type', client.type ?? '') // 예: '승인' 같은 필드
      setField('usage', client.usage ?? '')
      setField('memo', client.memo ?? '')
      // const mappedItemType = ItemTypeLabelToValue[client.itemType ?? '']

      // if (mappedItemType) {
      //   setField('itemType', mappedItemType)
      // } else {
      //   setField('itemType', '') // 혹은 기본값 처리
      // }

      // setField('itemDescription', client.itemDescription ?? '')
      // setField('memo', client.memo ?? '')
      // setField('details', formattedDetails)
      // setField('attachedFiles', formattedFiles)
    } else {
      reset()
    }
  }, [data, isEditMode, reset, setField])

  return (
    <>
      <div>
        <span className="font-bold border-b-2 mb-4">기본 정보</span>
        <div className="grid grid-cols-2 mt-1 ">
          <div className="flex">
            <label className="w-36  text-[14px] flex items-center border border-gray-400 justify-center bg-gray-300 font-bold text-center">
              현장명
            </label>
            <div className="border border-gray-400 px-2 p-2 w-full flex items-center">
              <CommonSelect
                fullWidth
                className="text-xl"
                value={form.siteId}
                onChange={(value) => setField('siteId', value)}
                options={sitesOptions}
                displayLabel
                onScrollToBottom={() => {
                  if (siteNamehasNextPage && !siteNameFetching) siteNameFetchNextPage()
                }}
                onInputChange={(value) => setSitesSearch(value)}
                loading={siteNameLoading}
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
                value={form.siteProcessId}
                onChange={(value) => setField('siteProcessId', value)}
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
              구분
            </label>
            <div className="border flex items-center p-2 gap-4 border-gray-400 px-2 w-full">
              {isEditMode ? (
                <span className={`text-[16px] ${form.type}`}>{form.type || '-'}</span>
              ) : (
                <CommonSelect
                  fullWidth={true}
                  className="text-2xl"
                  value={form.type}
                  displayLabel
                  onChange={(value) => setField('type', value)}
                  options={steelTypeOptions}
                />
              )}
            </div>
          </div>

          <div className="flex">
            <label className="w-36 text-[14px] flex items-center border border-gray-400 justify-center bg-gray-300 font-bold text-center">
              일자
            </label>
            <div className="border flex items-center gap-4 border-gray-400 px-2 w-full">
              <CommonDatePicker
                value={form.paymentDate}
                onChange={(value) => setField('paymentDate', value)}
              />
            </div>
          </div>

          <div className="flex">
            <label className="w-36  text-[14px] flex items-center border border-gray-400 justify-center bg-gray-300 font-bold text-center">
              용도
            </label>
            <div className="border flex  items-center border-gray-400 px-2 w-full">
              <CommonInput
                placeholder="텍스트 입력"
                value={form.usage}
                onChange={(value) => setField('usage', value)}
                className="flex-1"
              />
            </div>
          </div>

          <div className="flex">
            <label className="w-36 text-[14px] flex items-center border border-gray-400 justify-center bg-gray-300 font-bold text-center">
              비교 / 메모
            </label>
            <div className="border border-gray-400 px-2 w-full">
              <CommonInput
                value={form.memo}
                onChange={(value) => setField('memo', value)}
                className="flex-1"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 나중에 수정해야함!!! */}
      <div className="mt-6">
        <span className="font-bold border-b-2 mb-4">거래선</span>
        <div className="grid grid-cols-2 mt-1 ">
          <div className="flex">
            <label className="w-36  text-[14px] flex items-center border border-gray-400 justify-center bg-gray-300 font-bold text-center">
              업체명
            </label>
            <div className="border border-gray-400 px-2 p-2 w-full flex items-center">
              <CommonSelect
                fullWidth
                className="text-xl"
                value={form.clientName}
                onChange={(value) => setField('clientName', value)}
                options={sitesOptions}
                displayLabel
                onScrollToBottom={() => {
                  if (processInfoHasNextPage && !processInfoIsFetching) processInfoFetchNextPage()
                }}
                onInputChange={(value) => setSitesSearch(value)}
                loading={processInfoLoading}
              />
            </div>
          </div>
          <div className="flex">
            <label className="w-36 text-[14px]  border border-gray-400  flex items-center justify-center bg-gray-300  font-bold text-center">
              사업자등록번호
            </label>
            <div className="border border-gray-400 px-2 w-full">
              <CommonInput
                value={form.businessNumber}
                onChange={(value) => setField('businessNumber', value)}
                className="flex-1"
              />
            </div>
          </div>

          <div className="flex">
            <label className="w-36 text-[14px] flex items-center border border-gray-400 justify-center bg-gray-300 font-bold text-center">
              임대기간
            </label>
            <div className="border flex items-center gap-4 border-gray-400 p-2 px-2 w-full">
              <CommonDatePicker
                value={form.rentalStartDate}
                onChange={(value) => setField('rentalStartDate', value)}
              />
              ~
              <CommonDatePicker
                value={form.rentalEndDate}
                onChange={(value) => setField('rentalEndDate', value)}
              />
            </div>
          </div>

          <div className="flex">
            <label className="w-36  text-[14px] flex items-center border border-gray-400 justify-center bg-gray-300 font-bold text-center"></label>
            <div className="border flex  items-center border-gray-400 px-2 w-full"></div>
          </div>
        </div>
      </div>

      {/* 담당자 */}
      <div>
        <div className="flex justify-between items-center mt-10 mb-2">
          <span className="font-bold border-b-2 mb-4">품목상세</span>
          <div className="flex gap-4">
            <CommonButton
              label="삭제"
              className="px-7"
              variant="danger"
              onClick={() => removeCheckedItems('MaterialItem')}
            />
            <CommonButton
              label="추가"
              className="px-7"
              variant="secondary"
              onClick={() => addItem('MaterialItem')}
            />
          </div>
        </div>
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: '#D1D5DB', border: '1px solid  #9CA3AF' }}>
                <TableCell padding="checkbox" sx={{ border: '1px solid  #9CA3AF' }}>
                  <Checkbox
                    checked={isAllChecked}
                    indeterminate={checkedIds.length > 0 && !isAllChecked}
                    onChange={(e) => toggleCheckAllItems('MaterialItem', e.target.checked)}
                    sx={{ color: 'black' }}
                  />
                </TableCell>
                {[
                  '규격',
                  '품명',
                  '단위',
                  '본',
                  '길이',
                  '총 길이',
                  '단위중량',
                  '수량',
                  '단가',
                  '공급가',
                  '비고',
                ].map((label) => (
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
              {managers.map((m) => (
                <TableRow key={m.id}>
                  <TableCell
                    padding="checkbox"
                    align="center"
                    sx={{ border: '1px solid  #9CA3AF' }}
                  >
                    <Checkbox
                      checked={checkedIds.includes(m.id)}
                      onChange={(e) => toggleCheckItem('MaterialItem', m.id, e.target.checked)}
                    />
                  </TableCell>

                  <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                    <TextField
                      size="small"
                      placeholder="입력"
                      value={m.standard}
                      onChange={(e) =>
                        updateItemField('MaterialItem', m.id, 'standard', e.target.value)
                      }
                      variant="outlined"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': {
                            borderColor: 'black', // 기본 테두리 색 검은색
                          },
                          '&:hover fieldset': {
                            borderColor: 'black', // 호버 시에도 검은색 유지
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: 'black', // 포커스 시에도 검은색 유지
                          },
                        },
                      }}
                    />
                  </TableCell>
                  <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                    <TextField
                      size="small"
                      placeholder=" 입력"
                      value={m.name}
                      onChange={(e) =>
                        updateItemField('MaterialItem', m.id, 'name', e.target.value)
                      }
                      variant="outlined"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': {
                            borderColor: 'black', // 기본 테두리 색 검은색
                          },
                          '&:hover fieldset': {
                            borderColor: 'black', // 호버 시에도 검은색 유지
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: 'black', // 포커스 시에도 검은색 유지
                          },
                        },
                      }}
                    />
                  </TableCell>
                  <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                    <TextField
                      size="small"
                      placeholder=" 입력"
                      value={m.unit}
                      onChange={(e) =>
                        updateItemField('MaterialItem', m.id, 'unit', e.target.value)
                      }
                      variant="outlined"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': {
                            borderColor: 'black', // 기본 테두리 색 검은색
                          },
                          '&:hover fieldset': {
                            borderColor: 'black', // 호버 시에도 검은색 유지
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: 'black', // 포커스 시에도 검은색 유지
                          },
                        },
                      }}
                    />
                  </TableCell>
                  <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                    <CommonInput
                      className="flex-1 "
                      value={formatNumber(m.count)}
                      onChange={(value) => {
                        const numericValue = unformatNumber(value)
                        updateItemField('MaterialItem', m.id, 'count', numericValue)
                      }}
                    />
                  </TableCell>
                  <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                    <CommonInput
                      className="flex-1 "
                      value={formatNumber(m.length)}
                      onChange={(value) => {
                        const numericValue = unformatNumber(value)
                        updateItemField('MaterialItem', m.id, 'length', numericValue)
                      }}
                    />
                  </TableCell>
                  <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                    <CommonInput
                      className="flex-1 "
                      value={formatNumber(m.totalLength)}
                      onChange={(value) => {
                        const numericValue = unformatNumber(value)
                        updateItemField('MaterialItem', m.id, 'totalLength', numericValue)
                      }}
                    />
                  </TableCell>
                  <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                    <CommonInput
                      className="flex-1 "
                      value={formatNumber(m.unitWeight)}
                      onChange={(value) => {
                        const numericValue = unformatNumber(value)
                        updateItemField('MaterialItem', m.id, 'unitWeight', numericValue)
                      }}
                    />
                  </TableCell>
                  <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                    <CommonInput
                      className="flex-1 "
                      value={formatNumber(m.quantity)}
                      onChange={(value) => {
                        const numericValue = unformatNumber(value)
                        updateItemField('MaterialItem', m.id, 'quantity', numericValue)
                      }}
                    />
                  </TableCell>
                  <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                    <TextField
                      size="small"
                      value={m.unitPrice}
                      onChange={(e) =>
                        updateItemField('MaterialItem', m.id, 'unitPrice', e.target.value)
                      }
                      variant="outlined"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': {
                            borderColor: 'black', // 기본 테두리 색 검은색
                          },
                          '&:hover fieldset': {
                            borderColor: 'black', // 호버 시에도 검은색 유지
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: 'black', // 포커스 시에도 검은색 유지
                          },
                        },
                      }}
                    />
                  </TableCell>
                  <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                    <TextField
                      size="small"
                      value={m.supplyPrice}
                      onChange={(e) =>
                        updateItemField('MaterialItem', m.id, 'supplyPrice', e.target.value)
                      }
                      variant="outlined"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': {
                            borderColor: 'black', // 기본 테두리 색 검은색
                          },
                          '&:hover fieldset': {
                            borderColor: 'black', // 호버 시에도 검은색 유지
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: 'black', // 포커스 시에도 검은색 유지
                          },
                        },
                      }}
                    />
                  </TableCell>
                  <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                    <TextField
                      size="small"
                      placeholder="텍스트 입력"
                      value={m.memo}
                      onChange={(e) =>
                        updateItemField('MaterialItem', m.id, 'memo', e.target.value)
                      }
                      variant="outlined"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': {
                            borderColor: 'black', // 기본 테두리 색 검은색
                          },
                          '&:hover fieldset': {
                            borderColor: 'black', // 호버 시에도 검은색 유지
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: 'black', // 포커스 시에도 검은색 유지
                          },
                        },
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>

      {/* 첨부파일 */}
      <div>
        <div className="flex justify-between items-center mt-10 mb-2">
          <span className="font-bold border-b-2 mb-4">증빙서류</span>
          <div className="flex gap-4">
            <CommonButton
              label="삭제"
              className="px-7"
              variant="danger"
              onClick={() => removeCheckedItems('attachedFile')}
            />
            <CommonButton
              label="추가"
              className="px-7"
              variant="secondary"
              onClick={() => addItem('attachedFile')}
            />
          </div>
        </div>
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: '#D1D5DB', border: '1px solid  #9CA3AF' }}>
                <TableCell padding="checkbox" sx={{ border: '1px solid  #9CA3AF' }}>
                  <Checkbox
                    checked={isFilesAllChecked}
                    indeterminate={fileCheckIds.length > 0 && !isFilesAllChecked}
                    onChange={(e) => toggleCheckAllItems('attachedFile', e.target.checked)}
                    sx={{ color: 'black' }}
                  />
                </TableCell>
                {['문서명', '첨부', '비고'].map((label) => (
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
              {attachedFiles.map((m) => (
                <TableRow key={m.id} sx={{ border: '1px solid  #9CA3AF' }}>
                  <TableCell
                    padding="checkbox"
                    align="center"
                    sx={{ border: '1px solid  #9CA3AF' }}
                  >
                    <Checkbox
                      checked={fileCheckIds.includes(m.id)}
                      onChange={(e) => toggleCheckItem('attachedFile', m.id, e.target.checked)}
                    />
                  </TableCell>
                  <TableCell sx={{ border: '1px solid  #9CA3AF' }} align="center">
                    <TextField
                      size="small"
                      placeholder="텍스트 입력"
                      sx={{ width: '100%' }}
                      value={m.name}
                      onChange={(e) =>
                        updateItemField('attachedFile', m.id, 'name', e.target.value)
                      }
                    />
                  </TableCell>

                  <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                    <div className="px-2 p-2 w-full flex gap-2.5 items-center justify-center">
                      <CommonFileInput
                        acceptedExtensions={[
                          'pdf',
                          'jpg',
                          'png',
                          'hwp',
                          'xlsx',
                          'zip',
                          'jpeg',
                          'ppt',
                        ]}
                        files={m.files} // 각 항목별 files
                        onChange={
                          (newFiles) => updateItemField('attachedFile', m.id, 'files', newFiles) //  해당 항목만 업데이트
                        }
                        uploadTarget="CLIENT_COMPANY"
                      />
                    </div>
                  </TableCell>
                  <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                    <TextField
                      size="small"
                      placeholder="텍스트 입력"
                      sx={{ width: '100%' }}
                      value={m.memo}
                      onChange={(e) =>
                        updateItemField('attachedFile', m.id, 'memo', e.target.value)
                      }
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>

      <div className="flex justify-center gap-10 mt-10">
        <CommonButton
          label="취소"
          variant="reset"
          className="px-10"
          onClick={() => console.log('취소')}
        />
        <CommonButton
          label={isEditMode ? '+ 수정' : '+ 등록'}
          className="px-10 font-bold"
          variant="secondary"
          onClick={() => {
            if (isEditMode) {
              SteelModifyMutation.mutate(steelDetailId)
            } else {
              createSteelMutation.mutate()
            }
          }}
        />
      </div>
    </>
  )
}
