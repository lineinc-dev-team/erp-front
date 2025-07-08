'use client'

import CommonSelect from '@/components/common/Select'
import CommonButton from '@/components/common/Button'
import CommonFileInput from '@/components/common/FileInput'
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
import { UseORnotOptions } from '@/config/erp.confing'
import CommonInput from '@/components/common/Input'
import CommonDatePicker from '@/components/common/DatePicker'
import { useOrderingContractStore } from '@/stores/outsourcingContractStore'

export default function OutsourcingContractRegistrationView({ isEditMode = false }) {
  const { form } = useOrderingContractStore()

  const managers = form.headManagers
  const checkedIds = form.checkedManagerIds
  const isAllChecked = managers.length > 0 && checkedIds.length === managers.length

  const attachedFiles = form.attachedFiles
  const fileCheckIds = form.checkedAttachedFileIds
  const isFilesAllChecked = attachedFiles.length > 0 && fileCheckIds.length === attachedFiles.length

  console.log('number', form.areaNumber, form.phoneNumber, managers)

  return (
    <>
      <div>
        <span className="font-bold border-b-2 mb-4">기본 정보</span>
        <div className="grid grid-cols-2 mt-1">
          <div className="flex">
            <label className="w-36  text-[14px] flex items-center border border-gray-400  justify-center bg-gray-300  font-bold text-center">
              현장명
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
            <label className="w-36  text-[14px] flex items-center border border-gray-400  justify-center bg-gray-300  font-bold text-center">
              공정명
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
            <label className="w-36  text-[14px] flex items-center border border-gray-400 justify-center bg-gray-300  font-bold text-center">
              외주업체명
            </label>
            <div className="border border-gray-400 px-2 w-full">
              <CommonInput
                placeholder="텍스트 입력"
                value={form.businessNumber}
                onChange={(value) => form.setField('businessNumber', value)}
                className=" flex-1"
              />
            </div>
          </div>

          <div className="flex">
            <label className="w-36  text-[14px]  border border-gray-400 flex items-center justify-center bg-gray-300  font-bold text-center">
              사업자등록번호
            </label>
            <div className="border border-gray-400 flex items-center px-2 w-full">
              <CommonInput
                value={form.ceoName}
                onChange={(value) => form.setField('ceoName', value)}
                className=" flex-1"
              />
            </div>
          </div>

          <div className="flex">
            <label className="w-36  text-[14px]  border border-gray-400  flex items-center justify-center bg-gray-300  font-bold text-center">
              계약구분
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
              계약기간 (시작/종료)
            </label>
            <div className="border border-gray-400 px-2 w-full flex gap-3 items-center ">
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
            <label className="w-36  text-[14px] border border-gray-400  flex items-center justify-center bg-gray-300  font-bold text-center">
              계약금액 (총액)
            </label>
            <div className="border border-gray-400 px-2 w-full">
              <CommonInput
                placeholder="텍스트 입력"
                value={form.businessNumber}
                onChange={(value) => form.setField('businessNumber', value)}
                className=" flex-1"
              />
            </div>
          </div>
          <div className="flex">
            <label className="w-36  text-[14px] border border-gray-400  flex items-center justify-center bg-gray-300  font-bold text-center">
              단가정보
            </label>
            <div className="border border-gray-400 px-2 w-full">
              <CommonInput
                placeholder="텍스트 입력"
                value={form.businessNumber}
                onChange={(value) => form.setField('businessNumber', value)}
                className=" flex-1"
              />
            </div>
          </div>
          <div className="flex">
            <label className="w-36  text-[14px] border border-gray-400  flex items-center justify-center bg-gray-300  font-bold text-center">
              공제항목
            </label>
            <div className="border flex items-center gap-4 border-gray-400 px-2 w-full p-2">
              <CommonSelect
                className="text-2xl"
                value={form.isActive}
                onChange={(value) => form.setField('isActive', value)}
                options={UseORnotOptions}
              />
            </div>
          </div>
          <div className="flex">
            <label className="w-36  text-[14px] border border-gray-400  flex items-center justify-center bg-gray-300  font-bold text-center">
              보증서 제출여부
            </label>
            <div className="border flex items-center gap-4 border-gray-400 px-2 w-full p-2">
              <CommonSelect
                className="text-2xl"
                value={form.isActive}
                onChange={(value) => form.setField('isActive', value)}
                options={UseORnotOptions}
              />
            </div>
          </div>
          <div className="flex">
            <label className="w-36  text-[14px] border border-gray-400  flex items-center justify-center bg-gray-300  font-bold text-center">
              세금계산서 발행조건
            </label>
            <div className="border flex items-center gap-4 border-gray-400 px-2 w-full p-2">
              <CommonSelect
                className="text-2xl"
                value={form.isActive}
                onChange={(value) => form.setField('isActive', value)}
                options={UseORnotOptions}
              />
            </div>
          </div>
          <div className="flex">
            <label className="w-36  text-[14px] border border-gray-400  flex items-center justify-center bg-gray-300  font-bold text-center">
              본사담당자
            </label>
            <div className="border flex items-center gap-4 border-gray-400 px-2 w-full p-2">
              <CommonSelect
                className="text-2xl"
                value={form.isActive}
                onChange={(value) => form.setField('isActive', value)}
                options={UseORnotOptions}
              />
            </div>
          </div>
          <div className="flex">
            <label className="w-36  text-[14px] border border-gray-400  flex items-center justify-center bg-gray-300  font-bold text-center">
              세금계산서 역발행 여부
            </label>
            <div className="border flex items-center gap-4 border-gray-400 px-2 w-full p-2">
              <CommonSelect
                className="text-2xl"
                value={form.isActive}
                onChange={(value) => form.setField('isActive', value)}
                options={UseORnotOptions}
              />
            </div>
          </div>
          <div className="flex">
            <label className="w-36  text-[14px] border border-gray-400  flex items-center justify-center bg-gray-300  font-bold text-center">
              상태
            </label>
            <div className="border flex items-center gap-4 border-gray-400 px-2 w-full p-2">
              <CommonSelect
                className="text-2xl"
                value={form.isActive}
                onChange={(value) => form.setField('isActive', value)}
                options={UseORnotOptions}
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
            <span className="font-bold border-b-2 mb-4">담당자</span>
          </div>
          <div className="flex gap-4">
            <CommonButton
              label="담당자 삭제"
              className="px-7"
              variant="danger"
              onClick={() => form.removeCheckedItems('manager')}
            />
            <CommonButton
              label="담당자 추가"
              className="px-7"
              variant="secondary"
              onClick={() => form.addItem('manager')}
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
                    onChange={(e) => form.toggleCheckAllItems('manager', e.target.checked)}
                    sx={{ color: 'black' }}
                  />
                </TableCell>
                {['이름', '부서/직급', '연락처', '휴대폰', '이메일', '비고'].map((label) => (
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
                <TableRow key={m.id} sx={{ border: '1px solid  #9CA3AF' }}>
                  <TableCell
                    padding="checkbox"
                    align="center"
                    sx={{ border: '1px solid  #9CA3AF' }}
                  >
                    <Checkbox
                      checked={checkedIds.includes(m.id)}
                      onChange={(e) => form.toggleCheckItem('manager', m.id, e.target.checked)}
                    />
                  </TableCell>
                  <TableCell sx={{ border: '1px solid  #9CA3AF' }} align="center">
                    <TextField
                      size="small"
                      value={m.name}
                      onChange={(e) =>
                        form.updateItemField('manager', m.id, 'name', e.target.value)
                      }
                    />
                  </TableCell>
                  <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                    <TextField
                      size="small"
                      value={m.department}
                      onChange={(e) =>
                        form.updateItemField('manager', m.id, 'department', e.target.value)
                      }
                    />
                  </TableCell>
                  <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                    <TextField
                      size="small"
                      value={m.tel}
                      onChange={(e) => form.updateItemField('manager', m.id, 'tel', e.target.value)}
                    />
                  </TableCell>
                  <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                    <TextField
                      size="small"
                      value={m.phone}
                      onChange={(e) =>
                        form.updateItemField('manager', m.id, 'phone', e.target.value)
                      }
                    />
                  </TableCell>
                  <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                    <TextField
                      size="small"
                      value={m.email}
                      onChange={(e) =>
                        form.updateItemField('manager', m.id, 'email', e.target.value)
                      }
                    />
                  </TableCell>
                  <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                    <TextField
                      size="small"
                      value={m.memo}
                      onChange={(e) =>
                        form.updateItemField('manager', m.id, 'memo', e.target.value)
                      }
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>

      <div>
        <div className="flex justify-between items-center mt-10 mb-2">
          <div className="mt-4">
            <span className="font-bold border-b-2 mb-4">첨부파일</span>
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
