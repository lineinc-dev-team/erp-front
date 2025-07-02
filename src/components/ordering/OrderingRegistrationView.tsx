'use client'

import CommonInput from '../common/Input'
import CommonSelect from '../common/Select'
// import CommonDatePicker from '../common/DatePicker'
import CommonButton from '../common/Button'
import DaumPostcodeEmbed from 'react-daum-postcode'
import CommonFileInput from '../common/FileInput'
import { useOrderingStore } from '@/stores/orderingStore'
import { OrderingRegistrationService } from '@/services/ordering/orderingRegistrationService'
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
import useOrderingCreateData from '@/hooks/useOrderingCreateData'

export default function OrderingRegistrationView({ isEditMode = false }) {
  const {
    orderInfo,
    setField,

    useORnot,
    setUseORnot,
  } = useOrderingStore()

  const { ProcessStatusOptions } = OrderingRegistrationService()

  const {
    managers,
    checkedFileIds,
    saveAttachedFile,
    checkedIds,
    handleAddManager,
    handleChange,
    handleCheckAll,
    handleCheck,
    isAllChecked,
    removeChecked,
    address,
    setAddress,
    detail,
    setDetail,
    isModalOpen,
    setIsModalOpen,
    contractFiles,
    setContractFiles,
    handleCancelData,
    handleNewBusiness,
    handleAddAttachedFile,
    isFileAllChecked,
  } = useOrderingCreateData()

  return (
    <>
      <div>
        <span className="font-bold border-b-2 mb-4">기본 정보</span>
        <div className="grid grid-cols-2 mt-1">
          <div className="flex">
            <label className="w-44 flex items-center border border-gray-400  justify-center bg-gray-300  font-bold text-center">
              발주처명
            </label>
            <div className="border border-gray-400 px-2 w-full">
              <CommonInput
                value={orderInfo.orderName}
                onChange={(value) => setField('orderName', value)}
                className=" flex-1"
              />
            </div>
          </div>
          <div className="flex">
            <label className="w-44 flex items-center border border-gray-400  justify-center bg-gray-300  font-bold text-center">
              사업장등록번호
            </label>
            <div className="border border-gray-400 px-2 w-full">
              <CommonInput
                value={orderInfo.businessNumber}
                onChange={(value) => setField('businessNumber', value)}
                className=" flex-1"
              />
            </div>
          </div>

          <div className="flex">
            <label className="w-44 flex items-center border border-gray-400 justify-center bg-gray-300  font-bold text-center">
              본사 주소
            </label>
            <div className="border border-gray-400 w-full flex flex-col gap-2 p-2">
              <div className="flex gap-2">
                <input
                  value={address}
                  readOnly
                  placeholder="주소를 검색해 주세요."
                  className="flex-1 border px-3 py-2 rounded"
                />
                <CommonButton
                  label="주소찾기"
                  variant="secondary"
                  className="bg-gray-400 text-white px-3 rounded"
                  onClick={() => setIsModalOpen(true)}
                />
              </div>
              <input
                value={detail}
                onChange={(e) => setDetail(e.target.value)}
                placeholder="상세주소"
                className="w-full border px-3 py-2 rounded"
              />

              {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                  <div className="bg-white w-full max-w-lg p-4 rounded-xl shadow-lg relative flex flex-col">
                    <div className="flex justify-end w-full">
                      <CommonButton
                        className=" mb-2"
                        label="X"
                        variant="danger"
                        onClick={() => setIsModalOpen(false)}
                      />
                    </div>
                    <DaumPostcodeEmbed
                      onComplete={(data) => {
                        setAddress(data.address)
                        setIsModalOpen(false)
                      }}
                      autoClose={false}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex">
            <label className="w-44  border border-gray-400 flex items-center justify-center bg-gray-300  font-bold text-center">
              대표자명
            </label>
            <div className="border border-gray-400 flex items-center px-2 w-full">
              <CommonInput
                value={orderInfo.ceoName}
                onChange={(value) => setField('ceoName', value)}
                className=" flex-1"
              />
            </div>
          </div>

          <div className="flex">
            <label className="w-44  border border-gray-400  flex items-center justify-center bg-gray-300  font-bold text-center">
              전화번호
            </label>
            <div className="border border-gray-400 px-2 w-full">
              <CommonInput
                value={orderInfo.phoneNumber}
                onChange={(value) => setField('phoneNumber', value)}
                className=" flex-1"
              />
            </div>
          </div>

          <div className="flex">
            <label className="w-44  border border-gray-400 flex items-center justify-center bg-gray-300  font-bold text-center">
              이메일(대표)
            </label>
            <div className="border border-gray-400 px-2 w-full">
              <CommonInput
                value={orderInfo.email}
                onChange={(value) => setField('email', value)}
                className=" flex-1"
              />
            </div>
          </div>

          <div className="flex">
            <label className="w-44 border border-gray-400  flex items-center justify-center bg-gray-300  font-bold text-center">
              결제정보
            </label>
            <div className="border border-gray-400 px-2 p-2 w-full flex justify-center items-center">
              <CommonInput
                value={orderInfo.email}
                onChange={(value) => setField('email', value)}
                className=" flex-1"
              />
            </div>
          </div>
          <div className="flex">
            <label className="w-44 border border-gray-400  flex items-center justify-center bg-gray-300  font-bold text-center">
              사용 여부
            </label>
            <div className="border border-gray-400 px-2 p-2 w-full flex justify-center items-center">
              <CommonSelect
                value={useORnot}
                onChange={setUseORnot}
                options={ProcessStatusOptions}
              />
            </div>
          </div>
          <div className="flex">
            <label className="w-44 border border-gray-400  flex items-center justify-center bg-gray-300  font-bold text-center">
              비고 / 메모
            </label>
            <div className="border border-gray-400 px-2 w-full">
              <CommonInput
                value={orderInfo.phoneNumber}
                onChange={(value) => setField('phoneNumber', value)}
                className=" flex-1"
              />
            </div>
          </div>
          <div className="flex">
            <label className="w-44 border border-gray-400  flex items-center justify-center bg-gray-300  font-bold text-center"></label>
            <div className="border border-gray-400  px-2 w-full flex gap-3 items-center ">
              {/* <CommonDatePicker value={startDate} onChange={setStartDate} />
              ~
              <CommonDatePicker value={endDate} onChange={setEndDate} /> */}
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
              label="삭제"
              className="px-7"
              variant="danger"
              onClick={() => removeChecked('manager')}
            />
            <CommonButton
              label="추가"
              className="px-7"
              variant="secondary"
              onClick={handleAddManager}
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
                    onChange={(e) => handleCheckAll(e.target.checked, 'manager')}
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
                      onChange={(e) => handleCheck(m.id, e.target.checked, 'manager')}
                    />
                  </TableCell>
                  <TableCell sx={{ border: '1px solid  #9CA3AF' }} align="center">
                    <TextField
                      size="small"
                      value={m.name}
                      onChange={(e) => handleChange(m.id, 'name', e.target.value, 'manager')}
                    />
                  </TableCell>
                  <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                    <TextField
                      size="small"
                      value={m.department}
                      onChange={(e) => handleChange(m.id, 'department', e.target.value, 'manager')}
                    />
                  </TableCell>
                  <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                    <TextField
                      size="small"
                      value={m.contact}
                      onChange={(e) => handleChange(m.id, 'contact', e.target.value, 'manager')}
                    />
                  </TableCell>
                  <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                    <TextField
                      size="small"
                      value={m.mobile}
                      onChange={(e) => handleChange(m.id, 'mobile', e.target.value, 'manager')}
                    />
                  </TableCell>
                  <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                    <TextField
                      size="small"
                      value={m.email}
                      onChange={(e) => handleChange(m.id, 'email', e.target.value, 'manager')}
                    />
                  </TableCell>
                  <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                    <TextField
                      size="small"
                      value={m.memo}
                      onChange={(e) => handleChange(m.id, 'memo', e.target.value, 'manager')}
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
              onClick={() => removeChecked('saveAttachedFile')}
            />
            <CommonButton
              label="추가"
              className="px-7"
              variant="secondary"
              onClick={handleAddAttachedFile}
            />
          </div>
        </div>
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: '#D1D5DB', border: '1px solid  #9CA3AF' }}>
                <TableCell padding="checkbox" sx={{ border: '1px solid  #9CA3AF' }}>
                  <Checkbox
                    checked={isFileAllChecked}
                    indeterminate={checkedFileIds.length > 0 && !isFileAllChecked}
                    onChange={(e) => handleCheckAll(e.target.checked, 'saveAttachedFile')}
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
              {saveAttachedFile.map((m) => (
                <TableRow key={m.id} sx={{ border: '1px solid  #9CA3AF' }}>
                  <TableCell
                    padding="checkbox"
                    align="center"
                    sx={{ border: '1px solid  #9CA3AF' }}
                  >
                    <Checkbox
                      checked={checkedFileIds.includes(m.id)}
                      onChange={(e) => handleCheck(m.id, e.target.checked, 'saveAttachedFile')}
                    />
                  </TableCell>
                  <TableCell sx={{ border: '1px solid  #9CA3AF' }} align="center">
                    <TextField
                      size="small"
                      sx={{ width: '100%' }}
                      value={m.fileName}
                      onChange={(e) =>
                        handleChange(m.id, 'fileName', e.target.value, 'saveAttachedFile')
                      }
                    />
                  </TableCell>
                  <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                    <div className="px-2 p-2 w-full flex gap-2.5 items-center justify-center">
                      <CommonFileInput
                        className=" break-words whitespace-normal"
                        label="계약서"
                        acceptedExtensions={['pdf', 'hwp']}
                        files={contractFiles}
                        onChange={setContractFiles}
                      />
                    </div>
                  </TableCell>
                  <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                    <TextField
                      size="small"
                      sx={{ width: '100%' }}
                      value={m.memo}
                      onChange={(e) =>
                        handleChange(m.id, 'memo', e.target.value, 'saveAttachedFile')
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
        <span className="font-bold border-b-2 mb-4">변경이력</span>
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
        <CommonButton label="취소" variant="reset" className="px-10" onClick={handleCancelData} />
        <CommonButton
          label={isEditMode ? '+ 수정' : '+ 등록'}
          className="px-10 font-bold"
          variant="secondary"
          onClick={handleNewBusiness}
        />
      </div>
    </>
  )
}
