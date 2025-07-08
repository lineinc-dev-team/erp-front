'use client'

import CommonSelect from '@/components/common/Select'
import CommonButton from '@/components/common/Button'
import CommonFileInput from '@/components/common/FileInput'
import {
  Checkbox,
  FormControlLabel,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
} from '@mui/material'
import { UseORnotOptions } from '@/config/erp.confing'
import CommonInput from '@/components/common/Input'
import CommonDatePicker from '@/components/common/DatePicker'
import { useOrderingContractStore } from '@/stores/outsourcingContractStore'

export default function OutsourcingEquipmentRegistrationView({ isEditMode = false }) {
  const { form } = useOrderingContractStore()

  const attachedFiles = form.attachedFiles
  const fileCheckIds = form.checkedAttachedFileIds
  const isFilesAllChecked = attachedFiles.length > 0 && fileCheckIds.length === attachedFiles.length

  console.log('number', form.areaNumber, form.phoneNumber)

  return (
    <>
      <div>
        <span className="font-bold border-b-2 mb-4">장비 기본 정보</span>
        <div className="grid grid-cols-2 mt-1">
          <div className="flex">
            <label className="w-36  text-[14px] flex items-center border border-gray-400  justify-center bg-gray-300  font-bold text-center">
              장비명
            </label>
            <div className="border border-gray-400 flex items-center px-2 w-full">
              <CommonInput
                placeholder="텍스트 입력"
                value={form.ceoName}
                onChange={(value) => form.setField('ceoName', value)}
                className=" flex-1"
              />
            </div>
          </div>
          <div className="flex">
            <label className="w-36  text-[14px] flex items-center border border-gray-400  justify-center bg-gray-300  font-bold text-center">
              번호판
            </label>
            <div className="border border-gray-400 flex items-center px-2 w-full">
              <CommonInput
                placeholder="012가3456"
                value={form.ceoName}
                onChange={(value) => form.setField('ceoName', value)}
                className=" flex-1"
              />
            </div>
          </div>

          <div className="flex">
            <label className="w-36  text-[14px] flex items-center border border-gray-400 justify-center bg-gray-300  font-bold text-center">
              장비유형
            </label>
            <div className="border flex items-center gap-4 border-gray-400 px-2 w-full p-2">
              <CommonSelect
                fullWidth={true}
                className="text-2xl"
                value={form.isActive}
                onChange={(value) => form.setField('isActive', value)}
                options={UseORnotOptions}
              />
            </div>
          </div>

          <div className="flex">
            <label className="w-36  text-[14px]  border border-gray-400 flex items-center justify-center bg-gray-300  font-bold text-center">
              장비규격
            </label>
            <div className="border flex items-center gap-4 border-gray-400 px-2 w-full p-2">
              <CommonSelect
                fullWidth={true}
                className="text-2xl"
                value={form.isActive}
                onChange={(value) => form.setField('isActive', value)}
                options={UseORnotOptions}
              />
            </div>
          </div>

          <div className="flex">
            <label className="w-36  text-[14px]  border border-gray-400  flex items-center justify-center bg-gray-300  font-bold text-center">
              외주업체
            </label>
            <div className="border flex items-center gap-4 border-gray-400 px-2 w-full p-2">
              <CommonSelect
                fullWidth={true}
                className="text-2xl"
                value={form.isActive}
                onChange={(value) => form.setField('isActive', value)}
                options={UseORnotOptions}
              />
            </div>
          </div>

          <div className="flex">
            <label className="w-36  text-[13px]  border border-gray-400 flex items-center justify-center bg-gray-300  font-bold text-center">
              사용상태
            </label>
            <div className="border flex items-center gap-4 border-gray-400 px-2 w-full p-2">
              <CommonSelect
                fullWidth={true}
                className="text-2xl"
                value={form.isActive}
                onChange={(value) => form.setField('isActive', value)}
                options={UseORnotOptions}
              />
            </div>
          </div>

          <div className="flex">
            <label className="w-36  text-[14px] border border-gray-400  flex items-center justify-center bg-gray-300  font-bold text-center">
              담당 기사
            </label>
            <div className="border flex items-center gap-4 border-gray-400 px-2 w-full p-2">
              <CommonSelect
                className="text-2xl w-3xs"
                value={form.isActive}
                onChange={(value) => form.setField('isActive', value)}
                options={UseORnotOptions}
              />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={form.sameAsOwner}
                    onChange={(e) => form.setField('sameAsOwner', e.target.checked)}
                  />
                }
                label="사업주 동일"
              />
            </div>
          </div>
          <div className="flex">
            <label className="w-36  text-[14px] border border-gray-400  flex items-center justify-center bg-gray-300  font-bold text-center">
              비고 / 메모
            </label>
            <div className="border border-gray-400 px-2 w-full ">
              <CommonInput
                value={form.memo}
                onChange={(value) => form.setField('memo', value)}
                className=" flex-1"
              />
            </div>
          </div>
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mt-10 mb-2">
          <div className="mt-4">
            <span className="font-bold border-b-2 mb-4">장비 첨부파일</span>
          </div>
          <div className="flex gap-4">
            <CommonButton
              label="삭제"
              className="px-7"
              variant="danger"
              onClick={() => form.removeCheckedItems('attachedFile')}
            />
            <CommonButton
              label="추가"
              className="px-7"
              variant="secondary"
              onClick={() => form.addItem('attachedFile')}
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
                    onChange={(e) => form.toggleCheckAllItems('attachedFile', e.target.checked)}
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
                      onChange={(e) => form.toggleCheckItem('attachedFile', m.id, e.target.checked)}
                    />
                  </TableCell>
                  <TableCell sx={{ border: '1px solid  #9CA3AF' }} align="center">
                    <TextField
                      size="small"
                      sx={{ width: '100%' }}
                      value={m.fileName}
                      onChange={(e) =>
                        form.updateItemField('attachedFile', m.id, 'fileName', e.target.value)
                      }
                    />
                  </TableCell>
                  <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                    <div className="px-2 p-2 w-full flex gap-2.5 items-center justify-center">
                      <CommonFileInput
                        className=" break-words whitespace-normal"
                        label="계약서"
                        acceptedExtensions={['pdf', 'hwp']}
                        files={form.attachedFiles.find((f) => f.id === m.id)?.files || []}
                        onChange={(newFiles) =>
                          form.updateItemField('attachedFile', m.id, 'files', newFiles)
                        }
                      />
                    </div>
                  </TableCell>
                  <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                    <TextField
                      size="small"
                      sx={{ width: '100%' }}
                      value={m.memo}
                      onChange={(e) =>
                        form.updateItemField('attachedFile', m.id, 'memo', e.target.value)
                      }
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>

      <div className="mt-10">
        <span className="font-bold border-b-2 mb-4">기사 기본 정보</span>
        <div className="grid grid-cols-2 mt-1">
          <div className="flex">
            <label className="w-36  text-[14px] flex items-center border border-gray-400  justify-center bg-gray-300  font-bold text-center">
              기사명
            </label>
            <div className="border border-gray-400 flex items-center px-2 w-full">
              <CommonInput
                placeholder="기사를 입력해!"
                value={form.ceoName}
                onChange={(value) => form.setField('ceoName', value)}
                className=" flex-1"
              />
            </div>
          </div>
          <div className="flex">
            <label className="w-36  text-[14px] flex items-center border border-gray-400  justify-center bg-gray-300  font-bold text-center">
              소속 외주업체
            </label>
            <div className="border border-gray-400 flex items-center px-2 w-full">
              <CommonInput
                placeholder="소속외주업체 입력해!"
                value={form.ceoName}
                onChange={(value) => form.setField('ceoName', value)}
                className=" flex-1"
              />
            </div>
          </div>

          <div className="flex">
            <label className="w-36  text-[14px] flex items-center border border-gray-400 justify-center bg-gray-300  font-bold text-center">
              교육 이수 여부
            </label>
            <div className="border flex items-center gap-4 border-gray-400 px-2 w-full p-2">
              <CommonSelect
                fullWidth={true}
                className="text-2xl"
                value={form.isActive}
                onChange={(value) => form.setField('isActive', value)}
                options={UseORnotOptions}
              />
            </div>
          </div>

          <div className="flex">
            <label className="w-36  text-[14px]  border border-gray-400 flex items-center justify-center bg-gray-300  font-bold text-center">
              교육 수료일
            </label>
            <div className="border border-gray-400  px-2 w-full flex gap-3 items-center ">
              <CommonDatePicker
                value={form.startDate}
                onChange={(value) => form.setField('startDate', value)}
              />
              ~
              <CommonDatePicker
                value={form.endDate}
                onChange={(value) => form.setField('endDate', value)}
              />
            </div>
          </div>

          <div className="flex">
            <label className="w-36  text-[14px]  border border-gray-400  flex items-center justify-center bg-gray-300  font-bold text-center">
              유효기간
            </label>
            <div className="border flex items-center gap-4 border-gray-400 px-2 w-full p-2">
              <CommonDatePicker
                value={form.endDate}
                onChange={(value) => form.setField('endDate', value)}
              />
            </div>
          </div>

          <div className="flex">
            <label className="w-36  text-[13px]  border border-gray-400 flex items-center justify-center bg-gray-300  font-bold text-center">
              교육기관
            </label>
            <div className="border border-gray-400 flex items-center px-2 w-full">
              <CommonInput
                placeholder="소속외주업체 입력해!"
                value={form.ceoName}
                onChange={(value) => form.setField('ceoName', value)}
                className=" flex-1"
              />
            </div>
          </div>

          <div className="flex">
            <label className="w-36  text-[14px] border border-gray-400  flex items-center justify-center bg-gray-300  font-bold text-center">
              상태
            </label>
            <div className="border flex items-center gap-4 border-gray-400 px-2 w-full p-2">
              <CommonSelect
                className="text-2xl w-3xs"
                value={form.isActive}
                onChange={(value) => form.setField('isActive', value)}
                options={UseORnotOptions}
              />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={form.sameAsOwner}
                    onChange={(e) => form.setField('sameAsOwner', e.target.checked)}
                  />
                }
                label="사업주 동일"
              />
            </div>
          </div>
          <div className="flex">
            <label className="w-36  text-[14px] border border-gray-400  flex items-center justify-center bg-gray-300  font-bold text-center">
              비고 / 메모
            </label>
            <div className="border border-gray-400 px-2 w-full ">
              <CommonInput
                value={form.memo}
                onChange={(value) => form.setField('memo', value)}
                className=" flex-1"
              />
            </div>
          </div>
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mt-10 mb-2">
          <div className="mt-4">
            <span className="font-bold border-b-2 mb-4">기사 첨부파일</span>
          </div>
          <div className="flex gap-4">
            <CommonButton
              label="삭제"
              className="px-7"
              variant="danger"
              onClick={() => form.removeCheckedItems('attachedFile')}
            />
            <CommonButton
              label="추가"
              className="px-7"
              variant="secondary"
              onClick={() => form.addItem('attachedFile')}
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
                    onChange={(e) => form.toggleCheckAllItems('attachedFile', e.target.checked)}
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
                      onChange={(e) => form.toggleCheckItem('attachedFile', m.id, e.target.checked)}
                    />
                  </TableCell>
                  <TableCell sx={{ border: '1px solid  #9CA3AF' }} align="center">
                    <TextField
                      size="small"
                      sx={{ width: '100%' }}
                      value={m.fileName}
                      onChange={(e) =>
                        form.updateItemField('attachedFile', m.id, 'fileName', e.target.value)
                      }
                    />
                  </TableCell>
                  <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                    <div className="px-2 p-2 w-full flex gap-2.5 items-center justify-center">
                      <CommonFileInput
                        className=" break-words whitespace-normal"
                        label="계약서"
                        acceptedExtensions={['pdf', 'hwp']}
                        files={form.attachedFiles.find((f) => f.id === m.id)?.files || []}
                        onChange={(newFiles) =>
                          form.updateItemField('attachedFile', m.id, 'files', newFiles)
                        }
                      />
                    </div>
                  </TableCell>
                  <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                    <TextField
                      size="small"
                      sx={{ width: '100%' }}
                      value={m.memo}
                      onChange={(e) =>
                        form.updateItemField('attachedFile', m.id, 'memo', e.target.value)
                      }
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>

      <div className="mt-4">
        <span className="font-bold border-b-2 mb-4">계약이력</span>
      </div>
      <div className="flex mt-1">
        <div className="flex flex-col w-1/4">
          <label className=" border border-gray-400 w-full flex items-center justify-center bg-gray-300  font-bold text-center">
            변경일시
          </label>
          <div className="border border-gray-400 px-2 p-2 w-full flex justify-center gap-2.5 items-center">
            <p>이경호</p>
          </div>
        </div>
        <div className="flex flex-col w-1/4">
          <label className="w-full  border border-gray-400 flex items-center justify-center bg-gray-300  font-bold text-center">
            변경 항목
          </label>
          <div className="border border-gray-400 px-2 p-2 w-full flex justify-center  gap-2.5 items-center">
            <p>이경호</p>
          </div>
        </div>
        <div className="flex flex-col w-1/4">
          <label className="w-full  border border-gray-400 flex items-center justify-center bg-gray-300 font-bold text-center">
            변경자
          </label>
          <div className="border border-gray-400 px-2 p-2 flex w-full justify-center  gap-2.5 items-center">
            <p>이경호</p>
          </div>
        </div>
        <div className="flex flex-col w-1/4">
          <label className="w-full  border border-gray-400 flex items-center justify-center bg-gray-300  font-bold text-center">
            수정 사유
          </label>
          <div className="border border-gray-400 px-2 p-2 w-full flex justify-center  gap-2.5 items-center">
            <p>이경호</p>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <span className="font-bold border-b-2 mb-4">수정이력</span>
      </div>
      <div className="flex mt-1">
        <div className="flex flex-col w-1/4">
          <label className=" border border-gray-400 w-full flex items-center justify-center bg-gray-300  font-bold text-center">
            변경일시
          </label>
          <div className="border border-gray-400 px-2 p-2 w-full flex justify-center gap-2.5 items-center">
            <p>이경호</p>
          </div>
        </div>
        <div className="flex flex-col w-1/4">
          <label className="w-full  border border-gray-400 flex items-center justify-center bg-gray-300  font-bold text-center">
            변경 항목
          </label>
          <div className="border border-gray-400 px-2 p-2 w-full flex justify-center  gap-2.5 items-center">
            <p>이경호</p>
          </div>
        </div>
        <div className="flex flex-col w-1/4">
          <label className="w-full  border border-gray-400 flex items-center justify-center bg-gray-300 font-bold text-center">
            변경자
          </label>
          <div className="border border-gray-400 px-2 p-2 flex w-full justify-center  gap-2.5 items-center">
            <p>이경호</p>
          </div>
        </div>
        <div className="flex flex-col w-1/4">
          <label className="w-full  border border-gray-400 flex items-center justify-center bg-gray-300  font-bold text-center">
            수정 사유
          </label>
          <div className="border border-gray-400 px-2 p-2 w-full flex justify-center  gap-2.5 items-center">
            <p>이경호</p>
          </div>
        </div>
      </div>

      <div className="flex justify-center gap-10 mt-10">
        <CommonButton
          label="취소"
          variant="reset"
          className="px-10"
          onClick={form.handleCancelData}
        />
        <CommonButton
          label={isEditMode ? '+ 수정' : '+ 등록'}
          className="px-10 font-bold"
          variant="secondary"
          onClick={form.newOutsouringCompany}
        />
      </div>
    </>
  )
}
