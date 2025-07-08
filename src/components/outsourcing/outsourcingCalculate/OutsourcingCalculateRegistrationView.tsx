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
// import CommonDatePicker from '@/components/common/DatePicker'
import { useOrderingContractStore } from '@/stores/outsourcingContractStore'

export default function OutsourcingCalculateRegistrationView({ isEditMode = false }) {
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
              현장명
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
              외주업체명
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
              계약명/계약번호
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
              정산기간
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
              세금계산서 역발행여부
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
              정산상태
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

      <div className="flex justify-between items-center mt-10 mb-2">
        <div className="mt-4">
          <span className="font-bold border-b-2 mb-4">정산</span>
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
            <TableRow sx={{ backgroundColor: '#D1D5DB' }}>
              <TableCell rowSpan={2} padding="checkbox" sx={{ border: '1px solid #9CA3AF' }}>
                <Checkbox
                  checked={isFilesAllChecked}
                  indeterminate={fileCheckIds.length > 0 && !isFilesAllChecked}
                  onChange={(e) => form.toggleCheckAllItems('attachedFile', e.target.checked)}
                  sx={{ color: 'black' }}
                />
              </TableCell>
              <TableCell
                rowSpan={2}
                align="center"
                sx={{
                  border: '1px solid #9CA3AF',
                  color: 'black',
                  fontWeight: 'bold',
                  backgroundColor: '#D1D5DB',
                }}
              >
                투입공수
              </TableCell>
              <TableCell
                rowSpan={2}
                align="center"
                sx={{
                  border: '1px solid #9CA3AF',
                  color: 'black',
                  fontWeight: 'bold',
                  backgroundColor: '#D1D5DB',
                }}
              >
                계약단가
              </TableCell>
              <TableCell
                colSpan={4}
                align="center"
                sx={{
                  border: '1px solid #9CA3AF',
                  color: 'black',
                  fontWeight: 'bold',
                  backgroundColor: '#D1D5DB',
                }}
              >
                공제항목
              </TableCell>
              <TableCell
                rowSpan={2}
                align="center"
                sx={{
                  border: '1px solid #9CA3AF',
                  color: 'black',
                  fontWeight: 'bold',
                  backgroundColor: '#D1D5DB',
                }}
              >
                총공제액
              </TableCell>
              <TableCell
                rowSpan={2}
                align="center"
                sx={{
                  border: '1px solid #9CA3AF',
                  color: 'black',
                  fontWeight: 'bold',
                  backgroundColor: '#D1D5DB',
                }}
              >
                실지급액
              </TableCell>
            </TableRow>
            <TableRow sx={{ backgroundColor: '#D1D5DB' }}>
              {['재료비', '노무비', '유류비', '관리비'].map((label) => (
                <TableCell
                  key={label}
                  align="center"
                  sx={{
                    border: '1px solid #9CA3AF',
                    color: 'black',
                    fontWeight: 'bold',
                    backgroundColor: '#D1D5DB',
                  }}
                >
                  {label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {attachedFiles.map((m) => (
              <TableRow key={m.id}>
                <TableCell padding="checkbox" sx={{ border: '1px solid #9CA3AF' }}>
                  <Checkbox
                    checked={fileCheckIds.includes(m.id)}
                    onChange={(e) => form.toggleCheckItem('attachedFile', m.id, e.target.checked)}
                  />
                </TableCell>
                <TableCell sx={{ border: '1px solid #9CA3AF', textAlign: 'center' }}>
                  <TextField
                    size="small"
                    value={m.inputLabor}
                    onChange={(e) =>
                      form.updateItemField('attachedFile', m.id, 'inputLabor', e.target.value)
                    }
                  />
                </TableCell>
                <TableCell sx={{ border: '1px solid #9CA3AF', textAlign: 'center' }}>
                  <TextField
                    size="small"
                    value={m.contractUnit}
                    onChange={(e) =>
                      form.updateItemField('attachedFile', m.id, 'contractUnit', e.target.value)
                    }
                  />
                </TableCell>
                {['materialCost', 'laborCost', 'fuelCost', 'adminCost'].map((field) => (
                  <TableCell key={field} sx={{ border: '1px solid #9CA3AF', textAlign: 'center' }}>
                    <TextField
                      size="small"
                      value={m[field]}
                      onChange={(e) =>
                        form.updateItemField('attachedFile', m.id, field, e.target.value)
                      }
                    />
                  </TableCell>
                ))}
                <TableCell sx={{ border: '1px solid #9CA3AF', textAlign: 'center' }}>
                  <TextField
                    size="small"
                    value={m.totalDeduction}
                    onChange={(e) =>
                      form.updateItemField('attachedFile', m.id, 'totalDeduction', e.target.value)
                    }
                  />
                </TableCell>
                <TableCell sx={{ border: '1px solid #9CA3AF', textAlign: 'center' }}>
                  <TextField
                    size="small"
                    value={m.actualPayment}
                    onChange={(e) =>
                      form.updateItemField('attachedFile', m.id, 'actualPayment', e.target.value)
                    }
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

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
