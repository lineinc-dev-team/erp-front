'use client'

import CommonSelect from '@/components/common/Select'
import CommonButton from '@/components/common/Button'

import CommonInput from '@/components/common/Input'
import { useAccountFormStore } from '@/stores/accountManagementStore'
import { useUserMg } from '@/hooks/useUserMg'
import { formatAreaNumber, formatPhoneNumber } from '@/utils/formatPhoneNumber'

import { UseORnotOptions } from '@/config/erp.confing'
import { useParams } from 'next/navigation'
import { UserDetailService } from '@/services/account/accountManagementService'
import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import { FormState } from '@/types/accountManagement'

export default function ManagementRegistrationView({ isEditMode = false }) {
  const {
    createUserMutation,
    updateUserMutation,
    handleAccountCancel,
    departmentOptions,
    positionOptions,
    gradeOptions,
    resetPasswordMutation,
  } = useUserMg()

  const { form, reset, setField } = useAccountFormStore()

  // 상세페이지 로직

  const params = useParams()
  const userDetailId = Number(params?.id)

  const { data } = useQuery({
    queryKey: ['UserDetailInfo'],
    queryFn: () => UserDetailService(userDetailId),
    enabled: isEditMode && !!userDetailId, // 수정 모드일 때만 fetch
  })

  useEffect(() => {
    if (data && isEditMode) {
      const client = data.data

      console.log('@@client', client)

      // 기존 값과 다르면 업데이트 (방어 코드)
      if (client.loginId !== form.loginId) setField('loginId', client.loginId ?? '')
      if (client.username !== form.username) setField('username', client.username ?? '')
      if (client.email !== form.email) setField('email', client.email ?? '')
      if (client.phoneNumber !== form.phoneNumber) setField('phoneNumber', client.phoneNumber ?? '')
      if (client.landlineNumber !== form.landlineNumber)
        setField('landlineNumber', client.landlineNumber ?? '')

      const departmentId = departmentOptions.find((opt) => opt.name === client.department)?.id ?? 0
      if (departmentId !== form.departmentId) setField('departmentId', departmentId)

      const positionId = positionOptions.find((opt) => opt.name === client.position)?.id ?? 0
      if (positionId !== form.positionId) setField('positionId', positionId)

      const gradeId = gradeOptions.find((opt) => opt.name === client.grade)?.id ?? 0
      if (gradeId !== form.gradeId) setField('gradeId', gradeId)

      const isActiveId = client.isActive === true ? '1' : client.isActive === false ? '2' : '0'
      if (isActiveId !== form.isActive) setField('isActive', isActiveId)
    } else {
      reset()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, isEditMode]) // 의존성은 핵심 데이터만 넣음

  function validateForm(form: FormState) {
    if (!form.loginId.trim()) return 'ID를 입력하세요.'
    if (!form.username.trim()) return '이름을 입력하세요.'
    if (form.departmentId === 0) return '부서를 선택하세요.'
    if (form.positionId === 0) return '직급을 선택하세요.'
    if (form.gradeId === 0) return '직책을 선택하세요.'
    if (!form.email.trim()) return '이메일을 입력하세요.'
    if (!/\S+@\S+\.\S+/.test(form.email)) return '유효한 이메일을 입력하세요.'
    if (!form.phoneNumber.trim()) return '휴대폰 번호를 입력하세요.'
    if (!form.landlineNumber.trim()) return '연락처를 입력하세요.'
    // if (!form.password.trim()) return '비밀번호를 입력하세요.'
    // if (form.password !== form.checkPassword) return '비밀번호가 일치하지 않습니다.'
    if (form.isActive === '0' || !form.isActive) return '계정 상태를 선택하세요.'
    return null
  }

  const handleSubmit = () => {
    const errorMsg = validateForm(form)
    if (errorMsg) {
      alert(errorMsg)
      return
    }

    if (isEditMode) {
      updateUserMutation.mutate(userDetailId)
    } else {
      createUserMutation.mutate()
    }
  }

  const handleResetPassword = (userDetailId: number) => {
    resetPasswordMutation.mutate(userDetailId)
    // const length = 8
    // const numbers = '0123456789'
    // const lower = 'abcdefghijklmnopqrstuvwxyz'
    // const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

    // // 숫자, 소문자, 대문자 최소 1개씩 포함하도록 강제하기 위해
    // // 각각에서 1글자씩 뽑아서 배열에 넣고 나머지는 랜덤으로 채움
    // const passwordChars = [
    //   numbers[Math.floor(Math.random() * numbers.length)],
    //   lower[Math.floor(Math.random() * lower.length)],
    //   upper[Math.floor(Math.random() * upper.length)],
    // ]

    // const allChars = numbers + lower + upper
    // for (let i = passwordChars.length; i < length; i++) {
    //   passwordChars.push(allChars[Math.floor(Math.random() * allChars.length)])
    // }

    // // 배열 셔플 (비밀번호 문자 순서 섞기)
    // for (let i = passwordChars.length - 1; i > 0; i--) {
    //   const j = Math.floor(Math.random() * (i + 1))
    //   ;[passwordChars[i], passwordChars[j]] = [passwordChars[j], passwordChars[i]]
    // }

    // const newPassword = passwordChars.join('')

    // setField('password', newPassword)
    // setField('checkPassword', newPassword)
  }

  return (
    <>
      <div>
        <span className="font-bold border-b-2 mb-4">기본 정보</span>
        <div className="grid grid-cols-2 mt-1">
          <div className="flex">
            <label className="w-36  text-[14px] flex items-center border border-gray-400  justify-center bg-gray-300  font-bold text-center">
              ID
            </label>
            <div className="border border-gray-400 px-2 w-full">
              <CommonInput
                placeholder="텍스트 입력"
                value={form.loginId}
                onChange={(value) => setField('loginId', value)}
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
                value={form.username}
                onChange={(value) => setField('username', value)}
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
                value={form.departmentId}
                onChange={(value) => setField('departmentId', value)}
                options={departmentOptions}
              />
            </div>
          </div>

          <div className="flex">
            <label className="w-36 text-[14px]  border border-gray-400 flex items-center justify-center bg-gray-300  font-bold text-center">
              직급
            </label>
            <div className="border border-gray-400 px-2 p-2 w-full flex justify-center items-center">
              <CommonSelect
                fullWidth={true}
                className="text-2xl"
                value={form.positionId}
                onChange={(value) => setField('positionId', value)}
                options={positionOptions}
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
                value={form.gradeId}
                onChange={(value) => setField('gradeId', value)}
                options={gradeOptions}
              />
            </div>
          </div>
          <div className="flex">
            <label className="w-36 text-[14px] border border-gray-400  flex items-center justify-center bg-gray-300  font-bold text-center">
              휴대폰
            </label>
            <div className="border border-gray-400 px-2 w-full">
              <CommonInput
                placeholder="'-'없이 숫자만 입력"
                value={form.phoneNumber}
                onChange={(value) => {
                  const clientPhone = formatPhoneNumber(value)
                  setField('phoneNumber', clientPhone)
                }}
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
                placeholder="'-'없이 숫자만 입력"
                value={form.landlineNumber}
                onChange={(value) => {
                  const resultAreaNumber = formatAreaNumber(value)
                  setField('landlineNumber', resultAreaNumber)
                }}
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
                value={form.email}
                onChange={(value) => setField('email', value)}
                className=" flex-1"
              />
            </div>
          </div>
          <div className="flex">
            <label className="w-36 text-[14px] border border-gray-400  flex items-center justify-center bg-gray-300  font-bold text-center">
              계정 상태
            </label>
            <div className="border flex items-center gap-4 p-2 border-gray-400 px-2 w-full">
              <CommonSelect
                fullWidth={true}
                className="text-2xl"
                value={form.isActive}
                onChange={(value) => setField('isActive', value)}
                options={UseORnotOptions}
              />
            </div>
          </div>

          {isEditMode && (
            <>
              <div className="flex">
                <label className="w-36 text-[14px] border border-gray-400 flex items-center justify-center bg-gray-300 font-bold text-center">
                  계정생성일 / 수정일
                </label>
                <div className="border border-gray-400 px-2 w-full flex items-center text-sm text-gray-600">
                  {data?.data.createdAt?.slice(0, 10)} / {data?.data.updatedAt?.slice(0, 10)}
                </div>
              </div>

              <div className="flex">
                <label className="w-36 text-[14px] border border-gray-400 flex items-center justify-center bg-gray-300 font-bold text-center">
                  최종 로그인
                </label>
                <div className="border border-gray-400 p-4 px-2 w-full flex items-center text-sm text-gray-600">
                  {data?.data.lastLoginAt ? data.data.lastLoginAt.slice(0, 10) : '기록 없음'}
                </div>
              </div>
              <div className="flex">
                <label className="w-36 text-[14px] border border-gray-400 flex items-center justify-center bg-gray-300 font-bold text-center">
                  비밀번호 초기화
                </label>
                <div className="border border-gray-400 p-4 px-2 w-full flex items-center text-sm text-gray-600">
                  <CommonButton label="초기화" onClick={() => handleResetPassword(userDetailId)} />
                </div>
              </div>
            </>
          )}

          <div className="flex">
            <label className="w-36 text-[14px] border border-gray-400  flex items-center justify-center bg-gray-300  font-bold text-center">
              비고 / 메모
            </label>
            <div className="border flex items-center gap-4 p-2 border-gray-400 px-2 w-full">
              <CommonInput
                placeholder="텍스트 입력"
                value={form.memo}
                onChange={(value) => setField('memo', value)}
                className=" flex-1"
              />
            </div>
          </div>
        </div>
      </div>

      {/* <div className="mt-10">
        <div className="flex justify-between mb-4">
          <div>
            <span className="font-bold border-b-2 mb-4">비밀번호 정보</span>
          </div>
        </div>
        <div className="grid grid-cols-2 mt-1">
          <div className="flex">
            <label className="w-36  text-[14px] flex items-center border border-gray-400  justify-center bg-gray-300  font-bold text-center">
              비밀번호
            </label>
            <div className="border border-gray-400 px-2 w-full">
              <CommonInput
                placeholder="비밀번호를 입력해주세요."
                type="text"
                value={form.password}
                onChange={(value) => setField('password', value)}
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
                type="text"
                value={form.checkPassword}
                onChange={(value) => setField('checkPassword', value)}
                className=" flex-1"
              />
            </div>
          </div>
        </div>
      </div> */}

      <div className="flex justify-center gap-10 mt-10">
        <CommonButton
          label="취소"
          variant="reset"
          className="px-10"
          onClick={handleAccountCancel}
        />

        <CommonButton
          label={isEditMode ? '+ 수정' : '+ 등록'}
          className="px-10 font-bold"
          variant="secondary"
          onClick={handleSubmit}
        />
      </div>
    </>
  )
}
