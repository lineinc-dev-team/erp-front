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
import { bankOptions, itemTypeOptions } from '@/config/erp.confing'
import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useParams } from 'next/navigation'
import { ItemTypeLabelToValue, useManagementCostFormStore } from '@/stores/managementCostsStore'
import CommonDatePicker from '../common/DatePicker'
import { useManagementCost } from '@/hooks/useManagementCost'
import CommonInputnumber from '@/utils/formatBusinessNumber'
import { formatNumber, unformatNumber } from '@/utils/formatters'
import { CostDetailService } from '@/services/managementCost/managementCostRegistrationService'
import { AttachedFile, DetailItem } from '@/types/managementCost'

export default function ManagementCostRegistrationView({ isEditMode = false }) {
  const {
    setField,
    form,
    updateItemField,
    removeCheckedItems,
    reset,
    addItem,
    toggleCheckItem,
    toggleCheckAllItems,
  } = useManagementCostFormStore()

  const {
    createCostMutation,
    CostModifyMutation,
    setSitesSearch,
    sitesOptions,
    setProcessSearch,
    processOptions,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isLoading,
  } = useManagementCost()

  // 체크 박스에 활용
  const managers = form.details
  const checkedIds = form.checkedCostIds
  const isAllChecked = managers.length > 0 && checkedIds.length === managers.length

  const attachedFiles = form.attachedFiles
  const fileCheckIds = form.checkedAttachedFileIds
  const isFilesAllChecked = attachedFiles.length > 0 && fileCheckIds.length === attachedFiles.length

  // 상세페이지 로직

  const params = useParams()
  const costDetailId = Number(params?.id)

  const { data } = useQuery({
    queryKey: ['CostDetailInfo'],
    queryFn: () => CostDetailService(costDetailId),
    enabled: isEditMode && !!costDetailId, // 수정 모드일 때만 fetch
  })

  console.log('상세데이터', data)

  useEffect(() => {
    if (data && isEditMode === true) {
      const client = data.data

      console.log('발주처 데이터 확인', client)

      // 상세 항목 가공
      const formattedDetails = (client.details ?? []).map((c: DetailItem) => ({
        id: c.id,
        name: c.name,
        unitPrice: c.unitPrice,
        supplyPrice: c.supplyPrice,
        vat: c.vat,
        total: c.total,
        memo: c.memo,
      }))

      // 첨부 파일 가공
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

      // 각 필드에 값 세팅
      setField('siteId', client.site?.id ?? '') // 현장명
      setField('siteProcessId', client.process?.id ?? '') // 공정명
      setField('businessNumber', client.businessNumber ?? '')
      setField('ceoName', client.ceoName ?? '')
      setField('paymentDate', client.paymentDate ? new Date(client.paymentDate) : null)
      setField('accountHolder', client.accountHolder ?? '')
      setField('accountNumber', client.accountNumber ?? '')
      setField('bankName', client.bankName ?? '')

      const mappedItemType = ItemTypeLabelToValue[client.itemType ?? '']

      if (mappedItemType) {
        setField('itemType', mappedItemType)
      } else {
        setField('itemType', '') // 혹은 기본값 처리
      }

      setField('itemDescription', client.itemDescription ?? '')
      setField('memo', client.memo ?? '')
      setField('details', formattedDetails)
      setField('attachedFiles', formattedFiles)
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
                  if (hasNextPage && !isFetching) fetchNextPage()
                }}
                onInputChange={(value) => setSitesSearch(value)}
                loading={isLoading}
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
                  if (hasNextPage && !isFetching) fetchNextPage()
                }}
                onInputChange={(value) => setProcessSearch(value)}
                loading={isLoading}
              />
            </div>
          </div>
          <div className="flex">
            <label className="w-36 text-[14px] flex items-center border border-gray-400 justify-center bg-gray-300 font-bold text-center">
              품목
            </label>
            <div className="border flex items-center gap-4 border-gray-400 px-2 w-full">
              <CommonSelect
                className="text-2xl"
                value={form.itemType}
                displayLabel
                onChange={(value) => setField('itemType', value)}
                options={itemTypeOptions}
              />

              <CommonInput
                placeholder="텍스트 입력"
                value={form.itemDescription}
                onChange={(value) => setField('itemDescription', value)}
                className=" flex-1"
              />
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
            <label className="w-36 text-[14px] flex items-center border border-gray-400 justify-center bg-gray-300 font-bold text-center">
              업체명 추후 넣기
            </label>
            <div className="border flex items-center gap-4 border-gray-400 px-2 w-full">
              {/* <CommonSelect
                className="text-2xl"
                value={form.paymentMethod}
                onChange={(value) => setField('paymentMethod', value)}
                options={PayInfo}
              />

              <CommonInput
                placeholder="텍스트 입력"
                value={form.paymentPeriod}
                onChange={(value) => setField('paymentPeriod', value)}
                className=" flex-1"
              /> */}
            </div>
          </div>

          <div className="flex">
            <label className="w-36 text-[14px] flex items-center border border-gray-400 justify-center bg-gray-300 font-bold text-center">
              사업장등록번호
            </label>
            <div className="border border-gray-400 px-2 w-full">
              <CommonInput
                placeholder="'-'없이 숫자만 입력"
                value={CommonInputnumber(form.businessNumber)}
                onChange={(value) => setField('businessNumber', value)}
                className="flex-1"
              />
            </div>
          </div>

          <div className="flex">
            <label className="w-36  text-[14px] flex items-center border border-gray-400 justify-center bg-gray-300 font-bold text-center">
              대표자명
            </label>
            <div className="border flex  items-center border-gray-400 px-2 w-full">
              <CommonInput
                placeholder="텍스트 입력"
                value={form.ceoName}
                onChange={(value) => setField('ceoName', value)}
                className="flex-1"
              />
            </div>
          </div>

          <div className="flex">
            <label className="w-36 text-[14px] flex items-center border border-gray-400 justify-center bg-gray-300 font-bold text-center">
              청구계좌 / 예금주명
            </label>
            <div className="border flex items-center gap-4 border-gray-400 px-2 w-full">
              <CommonSelect
                className="text-2xl"
                value={form.bankName}
                onChange={(value) => setField('bankName', value)}
                options={bankOptions}
              />

              <CommonInput
                placeholder="텍스트 입력"
                value={form.accountNumber}
                onChange={(value) => setField('accountNumber', value)}
                className=" flex-1"
              />

              <CommonInput
                placeholder="예금주"
                value={form.accountHolder}
                onChange={(value) => setField('accountHolder', value)}
                className=" flex-1"
              />
            </div>
          </div>

          {/* <div className="flex">
            <label className="w-36  text-[14px] flex items-center border border-gray-400 justify-center bg-gray-300 font-bold text-center">
              본사 담당자명
            </label>
            <div className="border border-gray-400 px-2 p-2 w-full flex items-center">
              <CommonSelect
                fullWidth
                className="text-xl"
                value={form.userId}
                onChange={(value) => setField('userId', value)}
                options={userOptions}
                displayLabel
                onScrollToBottom={() => {
                  if (hasNextPage && !isFetching) fetchNextPage()
                }}
                onInputChange={(value) => setUserSearch(value)}
                loading={isLoading}
              />
            </div>
          </div> */}

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

      {/* 담당자 */}
      <div>
        <div className="flex justify-between items-center mt-10 mb-2">
          <span className="font-bold border-b-2 mb-4">품목상세</span>
          <div className="flex gap-4">
            <CommonButton
              label="삭제"
              className="px-7"
              variant="danger"
              onClick={() => removeCheckedItems('costItem')}
            />
            <CommonButton
              label="추가"
              className="px-7"
              variant="secondary"
              onClick={() => addItem('costItem')}
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
                    onChange={(e) => toggleCheckAllItems('costItem', e.target.checked)}
                    sx={{ color: 'black' }}
                  />
                </TableCell>
                {['품명', '단가', '공급가', '부가세', '합계', '비고'].map((label) => (
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
                      onChange={(e) => toggleCheckItem('costItem', m.id, e.target.checked)}
                    />
                  </TableCell>

                  <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                    <TextField
                      size="small"
                      placeholder="텍스트 입력"
                      value={m.name}
                      onChange={(e) => updateItemField('costItem', m.id, 'name', e.target.value)}
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
                      value={formatNumber(m.unitPrice)}
                      onChange={(value) => {
                        const numericValue = unformatNumber(value)
                        updateItemField('costItem', m.id, 'unitPrice', numericValue)
                      }}
                    />
                  </TableCell>
                  <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                    <CommonInput
                      className="flex-1 "
                      value={formatNumber(m.supplyPrice)}
                      onChange={(value) => {
                        const numericValue = unformatNumber(value)
                        updateItemField('costItem', m.id, 'supplyPrice', numericValue)
                      }}
                    />
                  </TableCell>
                  <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                    <TextField
                      size="small"
                      value={m.vat}
                      InputProps={{ readOnly: true }}
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
                      value={m.total}
                      InputProps={{ readOnly: true }}
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
                      onChange={(e) => updateItemField('costItem', m.id, 'memo', e.target.value)}
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
              CostModifyMutation.mutate(costDetailId)
            } else {
              createCostMutation.mutate()
            }
          }}
        />
      </div>
    </>
  )
}
