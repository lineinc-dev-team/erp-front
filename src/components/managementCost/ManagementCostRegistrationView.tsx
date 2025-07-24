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
import { useClientCompany } from '@/hooks/useClientCompany'
import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useParams } from 'next/navigation'
import { ClientDetailService } from '@/services/ordering/orderingRegistrationService'
import { useManagementCostFormStore } from '@/stores/managementCostsStore'
import CommonDatePicker from '../common/DatePicker'
import { useManagementCost } from '@/hooks/useManagementCost'
import CommonInputnumber from '@/utils/formatBusinessNumber'

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

  const { ClientModifyMutation } = useClientCompany()

  const {
    createCostMutation,
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
  const clientCompanyId = Number(params?.id)

  const { data } = useQuery({
    queryKey: ['ClientDetailInfo'],
    queryFn: () => ClientDetailService(clientCompanyId),
    enabled: isEditMode && !!clientCompanyId, // 수정 모드일 때만 fetch
  })

  console.log('상세데이터', data)

  useEffect(() => {
    if (data && isEditMode === true) {
      const client = data.data

      console.log('발주처 데터 화긴', client)

      // 담당자 데이터 가공
      //   const formattedContacts = (client.contacts ?? []).map((c: Manager) => ({
      //     id: c.id,
      //     name: c.name,
      //     position: c.position,
      //     phoneNumber: c.phoneNumber,
      //     landlineNumber: c.landlineNumber,
      //     email: c.email,
      //     memo: c.memo,
      //   }))

      //   // 첨부파일 데이터 가공
      //   const formattedFiles = (client.files ?? []).map((item: AttachedFile) => ({
      //     id: item.id,
      //     name: item.name,
      //     memo: item.memo,
      //     files: [
      //       {
      //         publicUrl: item.fileUrl,
      //         file: {
      //           name: item.originalFileName,
      //         },
      //       },
      //     ],
      //   }))

      //   if (client.paymentMethod === 'BILL') {
      //     setField('paymentMethod', '어음')
      //   }
      //   if (client.paymentMethod === 'CASH') {
      //     setField('paymentMethod', '현금')
      //   }
      //   if (client.isActive === false) {
      //     setField('isActive', '미사용')
      //   }

      //   if (client.landlineNumber) {
      //     const parts = client.landlineNumber.split('-')
      //     if (parts.length >= 2) {
      //       const area = parts[0] // 지역번호
      //       const number = parts.slice(1).join('-') // 나머지 번호
      //       setField('areaNumber', area)
      //       setField('landlineNumber', number)
      //     } else {
      //       // fallback (예외 처리)
      //       setField('landlineNumber', client.landlineNumber)
      //     }
      //   } else {
      //     setField('landlineNumber', '')
      //     setField('areaNumber', '')
      //   }

      //   // 각 필드에 set
      //   setField('name', client.name)
      //   setField('businessNumber', client.businessNumber)
      //   setField('address', client.address)
      //   setField('phoneNumber', client.phoneNumber)
      //   setField('detailAddress', client.detailAddress)
      //   setField('ceoName', client.ceoName)
      //   setField('email', client.email)
      //   setField('paymentPeriod', client.paymentPeriod)
      //   setField('isActive', client.isActive ? '사용' : '미사용')

      //   setField('userId', client.user.id)

      //   setField('memo', client.memo)
      //   setField('headManagers', formattedContacts)
      //   setField('attachedFiles', formattedFiles)
    } else {
      reset()
    }
  }, [data])

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
              청구계좌 / 계좌명
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
                placeholder="메모"
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
                      placeholder="텍스트 입력"
                      size="small"
                      value={m.name}
                      onChange={(e) => updateItemField('costItem', m.id, 'name', e.target.value)}
                    />
                  </TableCell>
                  <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                    <TextField
                      placeholder="텍스트 입력"
                      size="small"
                      value={m.unitPrice}
                      onChange={(e) =>
                        updateItemField('costItem', m.id, 'unitPrice', e.target.value)
                      }
                    />
                  </TableCell>
                  <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                    <TextField
                      size="small"
                      placeholder="'-'없이 숫자만 입력"
                      value={m.supplyPrice}
                      onChange={(e) =>
                        updateItemField('costItem', m.id, 'supplyPrice', e.target.value)
                      }
                    />
                  </TableCell>
                  <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                    <TextField
                      size="small"
                      placeholder="'-'없이 숫자만 입력"
                      value={m.vat}
                      onChange={(e) => updateItemField('costItem', m.id, 'vat', e.target.value)}
                    />
                  </TableCell>
                  <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                    <TextField
                      size="small"
                      placeholder="텍스트 입력"
                      value={m.total}
                      onChange={(e) => updateItemField('costItem', m.id, 'total', e.target.value)}
                    />
                  </TableCell>
                  <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                    <TextField
                      size="small"
                      placeholder="텍스트 입력"
                      value={m.memo}
                      onChange={(e) => updateItemField('costItem', m.id, 'memo', e.target.value)}
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
              ClientModifyMutation.mutate(clientCompanyId)
            } else {
              createCostMutation.mutate()
            }
          }}
        />
      </div>
    </>
  )
}
