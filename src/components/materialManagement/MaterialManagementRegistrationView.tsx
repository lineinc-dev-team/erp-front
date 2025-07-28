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
import { materialTypeOptions } from '@/config/erp.confing'
import CommonDatePicker from '../common/DatePicker'
import { useManagementCost } from '@/hooks/useManagementCost'
import { formatNumber, unformatNumber } from '@/utils/formatters'
import { useManagementMaterial } from '@/hooks/useMaterialManagement'
import {
  MaterialTypeLabelToValue,
  useManagementMaterialFormStore,
} from '@/stores/materialManagementStore'
import { MaterialDetailService } from '@/services/materialManagement/materialManagementRegistrationService'
import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import { AttachedFile, DetailItem } from '@/types/materialManagement'
// import { useEffect } from 'react'
// import { AttachedFile, DetailItem } from '@/types/managementSteel'

export default function MaterialManagementRegistrationView({ isEditMode = false }) {
  const {
    setField,
    form,
    updateItemField,
    removeCheckedItems,
    reset,
    addItem,
    toggleCheckItem,
    toggleCheckAllItems,
  } = useManagementMaterialFormStore()

  const {
    setSitesSearch,
    sitesOptions,
    setProcessSearch,
    processOptions,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isLoading,
  } = useManagementCost()

  const { createMaterialMutation, MaterialModifyMutation } = useManagementMaterial()

  // 체크 박스에 활용
  const managers = form.details
  const checkedIds = form.checkedMaterialItemIds
  const isAllChecked = managers.length > 0 && checkedIds.length === managers.length

  const attachedFiles = form.attachedFiles
  const fileCheckIds = form.checkedAttachedFileIds
  const isFilesAllChecked = attachedFiles.length > 0 && fileCheckIds.length === attachedFiles.length

  // 상세페이지 로직

  const params = useParams()
  const materialDetailId = Number(params?.id)

  const { data } = useQuery({
    queryKey: ['MaterialDetailInfo'],
    queryFn: () => MaterialDetailService(materialDetailId),
    enabled: isEditMode && !!materialDetailId, // 수정 모드일 때만 fetch
  })

  useEffect(() => {
    if (data && isEditMode === true) {
      const client = data.data

      console.log('발주처 데이터 확2222인', client)

      // // 상세 항목 가공
      const formattedDetails = (client.details ?? []).map((c: DetailItem) => ({
        id: c.id,
        name: c.name,
        quantity: c.quantity,
        total: c.total,
        usage: c.usage,
        vat: c.vat,
        unitPrice: c.unitPrice,
        supplyPrice: c.supplyPrice,
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

      const mappedItemType = MaterialTypeLabelToValue[client.inputType ?? '']

      setField('attachedFiles', formattedFiles)

      // 각 필드에 값 세팅
      setField('siteId', client.site?.id ?? '')
      setField('siteProcessId', client.process?.id ?? '')
      setField('deliveryDate', client.deliveryDate ? new Date(client.deliveryDate) : null)
      setField('inputType', mappedItemType)
      setField('inputTypeDescription', client.inputTypeDescription)
      setField('memo', client.memo ?? '')
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
              투입구분
            </label>
            <div className="border flex items-center p-2 gap-4 border-gray-400 px-2 w-full">
              <CommonSelect
                className="text-2xl"
                value={form.inputType}
                displayLabel
                onChange={(value) => setField('inputType', value)}
                options={materialTypeOptions}
              />

              <CommonInput
                placeholder="텍스트 입력"
                value={form.inputTypeDescription}
                onChange={(value) => setField('inputTypeDescription', value)}
                className=" flex-1"
              />
            </div>
          </div>

          <div className="flex">
            <label className="w-36 text-[14px] flex items-center border border-gray-400 justify-center bg-gray-300 font-bold text-center">
              납품일자
            </label>
            <div className="border flex items-center gap-4 border-gray-400 px-2 w-full">
              <CommonDatePicker
                value={form.deliveryDate}
                onChange={(value) => setField('deliveryDate', value)}
              />
            </div>
          </div>

          <div className="flex">
            <label className="w-36  text-[14px] flex items-center border border-gray-400 justify-center bg-gray-300 font-bold text-center">
              자재업체명 추후 넣기
            </label>
            <div className="border flex  items-center border-gray-400 px-2 w-full">
              {/* <CommonInput
                placeholder="텍스트 입력"
                value={form.usage}
                onChange={(value) => setField('usage', value)}
                className="flex-1"
              /> */}
            </div>
          </div>

          <div className="flex">
            <label className="w-36 text-[14px] flex items-center border border-gray-400 justify-center bg-gray-300 font-bold text-center">
              비교
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
          <span className="font-bold border-b-2 mb-4">자재</span>
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
                  '품명',
                  '규격',
                  '사용용도',
                  '수량',
                  '단가',
                  '공급가',
                  '부가세',
                  '합계',
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
                      value={m.usage}
                      onChange={(e) =>
                        updateItemField('MaterialItem', m.id, 'usage', e.target.value)
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
                      value={formatNumber(m.quantity)}
                      onChange={(value) => {
                        const numericValue = unformatNumber(value)
                        updateItemField('MaterialItem', m.id, 'quantity', numericValue)
                      }}
                    />
                  </TableCell>

                  <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                    <CommonInput
                      className="flex-1 "
                      value={formatNumber(m.unitPrice)}
                      onChange={(value) => {
                        const numericValue = unformatNumber(value)
                        updateItemField('MaterialItem', m.id, 'unitPrice', numericValue)
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
                      value={m.vat}
                      onChange={(e) => updateItemField('MaterialItem', m.id, 'vat', e.target.value)}
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
                      value={m.total}
                      onChange={(e) =>
                        updateItemField('MaterialItem', m.id, 'total', e.target.value)
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
              MaterialModifyMutation.mutate(materialDetailId)
            } else {
              createMaterialMutation.mutate()
            }
          }}
        />
      </div>
    </>
  )
}
