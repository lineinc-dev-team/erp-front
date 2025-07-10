'use client'

import CommonSelect from '@/components/common/Select'
import CommonButton from '@/components/common/Button'

import { useOutsourcingCompanyStore } from '@/stores/outsourcingCompanyStore'
import CommonInput from '@/components/common/Input'
import { AreaCode, UseORnotOptions } from '@/config/erp.confing'

export default function ManagementRegistrationView({ isEditMode = false }) {
  const { form } = useOutsourcingCompanyStore()

  // const managers = form.headManagers
  // const checkedIds = form.checkedManagerIds
  // const isAllChecked = managers.length > 0 && checkedIds.length === managers.length

  // const attachedFiles = form.attachedFiles
  // const fileCheckIds = form.checkedAttachedFileIds
  // const isFilesAllChecked = attachedFiles.length > 0 && fileCheckIds.length === attachedFiles.length

  console.log('number', form.areaNumber, form.phoneNumber)

  return (
    <>
      <div>
        <span className="font-bold border-b-2 mb-4">기본 정보</span>
        <div className="grid grid-cols-2 mt-1">
          <div className="flex">
            <label className="w-36  text-[14px] flex items-center border border-gray-400  justify-center bg-gray-300  font-bold text-center">
              로그인 ID
            </label>
            <div className="border border-gray-400 px-2 w-full">
              <CommonInput
                placeholder="텍스트 입력"
                value={form.companyName}
                onChange={(value) => form.setField('companyName', value)}
                className=" flex-1"
              />
            </div>
          </div>
          <div className="flex">
            <label className="w-36 text-[14px] flex items-center border border-gray-400  justify-center bg-gray-300  font-bold text-center">
              이름
            </label>
            <div className="border border-gray-400 px-2 w-full">
              <CommonInput
                placeholder="홍길동"
                value={form.businessNumber}
                onChange={(value) => form.setField('businessNumber', value)}
                className=" flex-1"
              />
            </div>
          </div>

          <div className="flex">
            <label className="w-36  text-[14px] flex items-center border border-gray-400 justify-center bg-gray-300  font-bold text-center">
              부서(소속)
            </label>
            <div className="border flex items-center gap-4 border-gray-400 px-2 w-full">
              <CommonSelect
                fullWidth={true}
                className="text-2xl"
                value={form.areaNumber}
                onChange={(value) => form.setField('areaNumber', value)}
                options={AreaCode}
              />
            </div>
          </div>

          <div className="flex">
            <label className="w-36 text-[14px]  border border-gray-400 flex items-center justify-center bg-gray-300  font-bold text-center">
              담당현장
            </label>
            <div className="border border-gray-400 px-2 p-2 w-full flex justify-center items-center">
              <CommonSelect
                fullWidth={true}
                value={form.areaNumber}
                onChange={(value) => form.setField('areaNumber', value)}
                options={AreaCode}
              />
            </div>
          </div>

          <div className="flex">
            <label className="w-36 text-[14px] border border-gray-400  flex items-center justify-center bg-gray-300  font-bold text-center">
              직책
            </label>
            <div className="border border-gray-400 px-2 p-2 w-full flex justify-center items-center">
              <CommonSelect
                fullWidth={true}
                value={form.areaNumber}
                onChange={(value) => form.setField('areaNumber', value)}
                options={AreaCode}
              />
            </div>
          </div>

          <div className="flex">
            <label className="w-36 text-[14px] border border-gray-400 flex items-center justify-center bg-gray-300  font-bold text-center">
              직급
            </label>
            <div className="border border-gray-400 px-2 p-2 w-full flex justify-center items-center">
              <CommonSelect
                fullWidth={true}
                value={form.areaNumber}
                onChange={(value) => form.setField('areaNumber', value)}
                options={AreaCode}
              />
            </div>
          </div>

          <div className="flex">
            <label className="w-36 text-[14px] border border-gray-400  flex items-center justify-center bg-gray-300  font-bold text-center">
              휴대폰
            </label>
            <div className="border border-gray-400 px-2 w-full">
              <CommonInput
                placeholder="텍스트 입력"
                value={form.companyName}
                onChange={(value) => form.setField('companyName', value)}
                className=" flex-1"
              />
            </div>
          </div>
          <div className="flex">
            <label className="w-36  text-[14px] border border-gray-400  flex items-center justify-center bg-gray-300  font-bold text-center">
              연락처
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
            <label className="w-36 text-[14px] border border-gray-400  flex items-center justify-center bg-gray-300  font-bold text-center">
              이메일
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
            <label className="w-36 text-[14px] border border-gray-400  flex items-center justify-center bg-gray-300  font-bold text-center">
              권한 그룹
            </label>
            <div className="border flex items-center gap-4 border-gray-400 px-2 w-full">
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
            <label className="w-36 text-[14px] border border-gray-400  flex items-center justify-center bg-gray-300  font-bold text-center">
              계정 상태
            </label>
            <div className="border flex items-center gap-4 border-gray-400 px-2 w-full">
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
            <label className="w-36 text-[14px] border border-gray-400  flex items-center justify-center bg-gray-300  font-bold text-center">
              최종 로그인
            </label>
            <div className="border border-gray-400 px-2 w-full">
              <CommonInput
                placeholder="날짜 형태로 입력??"
                value={form.memo}
                onChange={(value) => form.setField('memo', value)}
                className=" flex-1"
              />
            </div>
          </div>
          <div className="flex">
            <label className="w-36 text-[14px] border border-gray-400  flex items-center justify-center bg-gray-300  font-bold text-center">
              계정 생성일
            </label>
            <div className="border border-gray-400 px-2 w-full">
              <CommonInput
                placeholder="날짜 형태로 입력??"
                value={form.memo}
                onChange={(value) => form.setField('memo', value)}
                className=" flex-1"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10">
        <span className="font-bold border-b-2 mb-4">비밀번호 정보</span>
        <div className="grid grid-cols-2 mt-1">
          <div className="flex">
            <label className="w-36  text-[14px] flex items-center border border-gray-400  justify-center bg-gray-300  font-bold text-center">
              비밀번호
            </label>
            <div className="border border-gray-400 px-2 w-full">
              <CommonInput
                placeholder="비밀번호를 입력해주세요."
                type="password"
                value={form.companyName}
                onChange={(value) => form.setField('companyName', value)}
                className=" flex-1"
              />
            </div>
          </div>
          <div className="flex">
            <label className="w-36 text-[14px] flex items-center border border-gray-400  justify-center bg-gray-300  font-bold text-center">
              비밀번호 확인
            </label>
            <div className="border border-gray-400 px-2 w-full">
              <CommonInput
                placeholder="비밀번호를 입력해주세요."
                type="password"
                value={form.businessNumber}
                onChange={(value) => form.setField('businessNumber', value)}
                className=" flex-1"
              />
            </div>
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
