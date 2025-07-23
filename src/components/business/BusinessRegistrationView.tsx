'use client'

import CommonInput from '../common/Input'
import CommonSelect from '../common/Select'
import { BusinessRegistrationService } from '@/services/business/businessRegistrationService'
import CommonDatePicker from '../common/DatePicker'
import CommonButton from '../common/Button'
import DaumPostcodeEmbed from 'react-daum-postcode'
import { useSiteFormStore } from '@/stores/siteStore'
import { SiteOptions, SiteProgressing } from '@/config/erp.confing'
import useSite from '@/hooks/useSite'
import { formatNumber, unformatNumber } from '@/utils/formatters'

export default function BusinessRegistrationView({ isEditMode = false }) {
  const { setField, setProcessField, form } = useSiteFormStore()

  const {
    createSiteMutation,

    //본사 담당자
    setOrderSearch,
    orderOptions,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isLoading,
  } = useSite()

  const { handleCancelData } = BusinessRegistrationService()

  // 수정과 등록을 같이 사용함

  return (
    <>
      <div>
        <span className="font-bold border-b-2 mb-4">기본 정보</span>
        <div className="grid grid-cols-2 mt-1">
          <div className="flex">
            <label className="w-36 text-[14px]  flex items-center border border-gray-400  justify-center bg-gray-300  font-bold text-center">
              현장명
            </label>
            <div className="border flex  items-center border-gray-400 px-2 w-full">
              <CommonInput
                placeholder="텍스트 입력"
                value={form.name}
                onChange={(value) => setField('name', value)}
                className=" flex-1"
              />
            </div>
          </div>

          <div className="flex">
            <label className="w-36 text-[14px] flex items-center border border-gray-400 justify-center bg-gray-300  font-bold text-center">
              위치(주소)
            </label>
            <div className="border border-gray-400 w-full flex flex-col gap-2 p-2">
              <div className="flex gap-2">
                <input
                  value={form.address}
                  readOnly
                  placeholder="주소를 검색해 주세요."
                  className="flex-1 border px-3 py-2 rounded"
                />
                <CommonButton
                  label="주소찾기"
                  variant="secondary"
                  className="bg-gray-400 text-white px-3 rounded"
                  onClick={() => setField('isModalOpen', true)}
                />
              </div>
              <input
                value={form.detailAddress}
                onChange={(e) => setField('detailAddress', e.target.value)}
                placeholder="상세주소"
                className="w-full border px-3 py-2 rounded"
              />

              {form.isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                  <div className="bg-white w-full max-w-lg p-4 rounded-xl shadow-lg relative flex flex-col">
                    <div className="flex justify-end w-full">
                      <CommonButton
                        className="mb-2"
                        label="X"
                        variant="danger"
                        onClick={() => setField('isModalOpen', false)}
                      />
                    </div>
                    <DaumPostcodeEmbed
                      onComplete={(data) => {
                        setField('address', data.address)
                        setField('isModalOpen', false)
                      }}
                      autoClose={false}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex">
            <label className="w-36  text-[14px] border border-gray-400 flex items-center justify-center bg-gray-300  font-bold text-center">
              현장 유형
            </label>
            <div className="border border-gray-400 px-2 p-2 w-full flex justify-center items-center">
              <CommonSelect
                fullWidth={true}
                className="text-xl"
                value={form.type}
                displayLabel
                onChange={(value) => setField('type', value)}
                options={SiteOptions}
              />
            </div>
          </div>

          <div className="flex">
            <label className="w-36  text-[14px] flex items-center border border-gray-400 justify-center bg-gray-300 font-bold text-center">
              발주처
            </label>
            <div className="border border-gray-400 px-2 p-2 w-full flex items-center">
              <CommonSelect
                fullWidth
                className="text-xl"
                value={form.clientCompanyId}
                onChange={(value) => setField('clientCompanyId', value)}
                options={orderOptions}
                displayLabel
                onScrollToBottom={() => {
                  if (hasNextPage && !isFetching) fetchNextPage()
                }}
                onInputChange={(value) => setOrderSearch(value)}
                loading={isLoading}
              />
            </div>
          </div>

          <div className="flex">
            <label className="w-36 text-[14px]  border border-gray-400  flex items-center justify-center bg-gray-300  font-bold text-center">
              사업시작 / 종료일
            </label>
            <div className="border border-gray-400 px-2 w-full flex gap-3 items-center ">
              <CommonDatePicker
                value={form.startDate}
                onChange={(value) => setField('startDate', value)}
              />
              ~
              <CommonDatePicker
                value={form.endDate}
                onChange={(value) => setField('endDate', value)}
              />
            </div>
          </div>

          <div className="flex">
            <label className="w-36  text-[14px] flex items-center border border-gray-400 justify-center bg-gray-300 font-bold text-center">
              본사 담당자명
            </label>
            <div className="border border-gray-400 px-2 p-2 w-full flex items-center">
              <CommonSelect
                fullWidth
                className="text-xl"
                value={form.userId}
                onChange={(value) => setField('userId', value)}
                options={orderOptions}
                displayLabel
                onScrollToBottom={() => {
                  if (hasNextPage && !isFetching) fetchNextPage()
                }}
                onInputChange={(value) => setOrderSearch(value)}
                loading={isLoading}
              />
            </div>
          </div>
          <div className="flex">
            <label className="w-36 text-[14px] border border-gray-400  flex items-center justify-center bg-gray-300  font-bold text-center">
              도급금액
            </label>
            <div className="border flex  items-center border-gray-400 px-2 w-full">
              <CommonInput
                value={formatNumber(form.contractAmount)}
                onChange={(value) => {
                  const numericValue = unformatNumber(value)
                  setField('contractAmount', numericValue)
                }}
                className="flex-1"
              />
            </div>
          </div>
          <div className="flex">
            <label className="w-36  text-[14px] border border-gray-400  flex items-center justify-center bg-gray-300  font-bold text-center">
              비고 / 메모
            </label>
            <div className="border flex  items-center border-gray-400 px-2 w-full">
              <CommonInput
                value={form.memo}
                onChange={(value) => setField('memo', value)}
                className=" flex-1"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <span className="font-bold border-b-2 mb-4">공정정보</span>
        <div className="grid grid-cols-2 mt-1">
          <div className="flex">
            <label className="w-36 text-[14px]  flex items-center border border-gray-400  justify-center bg-gray-300  font-bold text-center">
              공정명
            </label>
            <div className="border flex  items-center border-gray-400 px-2 w-full">
              <CommonInput
                value={form.process.name}
                onChange={(value) => setProcessField('name', value)}
                className=" flex-1"
              />
            </div>
          </div>

          <div className="flex">
            <label className="w-36 text-[14px]  flex items-center border border-gray-400  justify-center bg-gray-300  font-bold text-center">
              공정소장
            </label>
            <div className="border flex  items-center border-gray-400 px-2 w-full">
              <CommonInput
                value={form.process.name}
                onChange={(value) => setProcessField('name', value)}
                className=" flex-1"
              />
            </div>
          </div>

          <div className="flex">
            <label className="w-36 text-[14px]  flex items-center border border-gray-400  justify-center bg-gray-300  font-bold text-center">
              사무실 연락처
            </label>
            <div className="border flex  items-center border-gray-400 px-2 w-full">
              <CommonInput
                value={form.process.officePhone}
                onChange={(value) => setProcessField('officePhone', value)}
                className=" flex-1"
              />
            </div>
          </div>

          <div className="flex">
            <label className="w-36 text-[14px]  border border-gray-400 flex items-center justify-center bg-gray-300  font-bold text-center">
              진행상태
            </label>
            <div className="border border-gray-400 px-2 p-2 w-full flex justify-center gap-2.5 items-center">
              <CommonSelect
                fullWidth={true}
                displayLabel
                value={form.process.status}
                onChange={(value) =>
                  setProcessField('status', value as 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED')
                }
                options={SiteProgressing}
              />
            </div>
          </div>
          <div className="flex">
            <label className="w-36  text-[14px] border border-gray-400  flex items-center justify-center bg-gray-300  font-bold text-center">
              비고 / 메모
            </label>
            <div className="border flex  items-center border-gray-400 px-2 w-full">
              <CommonInput
                value={form.process.memo}
                onChange={(value) => setProcessField('memo', value)}
                className=" flex-1"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <span className="font-bold border-b-2 mb-4">첨부 파일</span>
      </div>

      {/* <div className="grid grid-cols-2 mt-1">
        <div className="flex">
          <label className="w-36  text-[14px] border border-gray-400 flex items-center justify-center bg-gray-300  font-bold text-center">
            계약명
          </label>
          <div className="border flex  items-center border-gray-400 px-2 w-full">
            <CommonInput
              value={businessInfo.name}
              onChange={(value) => setField('name', value)}
              className=" flex-1"
            />
          </div>
        </div>

        <div className="flex">
          <label className="w-36 text-[14px] border border-gray-400 flex items-center justify-center bg-gray-300  font-bold text-center">
            계약금액
          </label>
          <div className="border flex  items-center border-gray-400 px-2 w-full">
            <CommonInput
              value={businessInfo.name}
              onChange={(value) => setField('name', value)}
              className=" flex-1"
            />
          </div>
        </div>
        <div className="flex">
          <label className="w-36 text-[14px] border border-gray-400 flex items-center justify-center bg-gray-300  font-bold text-center">
            계약서
          </label>
          <div className="border border-gray-400 px-2 p-2 w-full flex justify-center gap-2.5 items-center">
            <CommonFileInput
              className=" w-[420px] break-words whitespace-normal"
              label="인허가 서류"
              acceptedExtensions={['pdf', 'hwp']}
              files={permitFiles}
              onChange={setPermitFiles}
            />
          </div>
        </div>
        <div className="flex">
          <label className="w-36 text-[14px] border border-gray-400 flex items-center justify-center bg-gray-300  font-bold text-center">
            현장도면
          </label>
          <div className="border border-gray-400 px-2 p-2 w-full flex justify-center gap-2.5 items-center">
            <CommonFileInput
              className=" w-[420px] break-words whitespace-normal"
              label="인허가 서류"
              acceptedExtensions={['pdf', 'hwp']}
              files={permitFiles}
              onChange={setPermitFiles}
            />
          </div>
        </div>
        <div className="flex">
          <label className="w-36 text-[14px] border border-gray-400 flex items-center justify-center bg-gray-300  font-bold text-center">
            보증서류(보증보험)
          </label>
          <div className="border border-gray-400 px-2 p-2 w-full flex justify-center gap-2.5 items-center">
            <CommonFileInput
              className=" w-[420px] break-words whitespace-normal"
              label="인허가 서류"
              acceptedExtensions={['pdf', 'hwp']}
              files={permitFiles}
              onChange={setPermitFiles}
            />
          </div>
        </div>
        <div className="flex">
          <label className="w-36 text-[14px] border border-gray-400 flex items-center justify-center bg-gray-300  font-bold text-center">
            인허가 서류
          </label>
          <div className="border border-gray-400 px-2 p-2 w-full flex justify-center gap-2.5 items-center">
            <CommonFileInput
              className=" w-[420px] break-words whitespace-normal"
              label="인허가 서류"
              acceptedExtensions={['pdf', 'hwp']}
              files={permitFiles}
              onChange={setPermitFiles}
            />
          </div>
        </div>
        <div className="flex">
          <label className="w-36 text-[14px] border border-gray-400 flex items-center justify-center bg-gray-300  font-bold text-center">
            기타파일
          </label>
          <div className="border border-gray-400 px-2 p-2 w-full flex justify-center gap-2.5 items-center">
            <CommonFileInput
              className=" w-[420px] break-words whitespace-normal"
              label="기타파일"
              acceptedExtensions={['zip', 'xlsx', 'doc']}
              files={etcFiles}
              onChange={setEtcFiles}
            />
          </div>
        </div>
        <div className="flex">
          <label className="w-36 text-[14px] border border-gray-400 flex items-center justify-center bg-gray-300  font-bold text-center">
            첨부일자 / 등록자
          </label>
          <div className="border border-gray-400 px-2 p-2 w-full flex gap-2.5 items-center">
            <p>{getTodayDateString()}</p>
          </div>
        </div>
      </div> */}

      {/* <div className="mt-4">
        <span className="font-bold border-b-2 mb-4">변경이력</span>
      </div>

      <div className="flex mt-1">
        <div className="flex flex-col w-1/4">
          <label className=" border text-[14px] border-gray-400 w-full flex items-center justify-center bg-gray-300  font-bold text-center">
            변경일시
          </label>
          <div className="border border-gray-400 px-2 p-2 w-full flex justify-center gap-2.5 items-center">
            <p>이경호</p>
          </div>
        </div>
        <div className="flex flex-col w-1/4">
          <label className="w-full text-[14px] border border-gray-400 flex items-center justify-center bg-gray-300  font-bold text-center">
            변경 항목
          </label>
          <div className="border border-gray-400 px-2 p-2 w-full flex justify-center  gap-2.5 items-center">
            <p>이경호</p>
          </div>
        </div>
        <div className="flex flex-col w-1/4">
          <label className="w-full text-[14px] border border-gray-400 flex items-center justify-center bg-gray-300 font-bold text-center">
            변경자
          </label>
          <div className="border border-gray-400 px-2 p-2 flex w-full justify-center  gap-2.5 items-center">
            <p>이경호</p>
          </div>
        </div>
        <div className="flex flex-col w-1/4">
          <label className="w-full text-[14px] border border-gray-400 flex items-center justify-center bg-gray-300  font-bold text-center">
            수정 사유
          </label>
          <div className="border border-gray-400 px-2 p-2 w-full flex justify-center  gap-2.5 items-center">
            <p>이경호</p>
          </div>
        </div>
      </div> */}

      <div className="flex justify-center gap-10 mt-10">
        <CommonButton label="취소" variant="reset" className="px-10" onClick={handleCancelData} />
        <CommonButton
          label={isEditMode ? '+ 수정' : '+ 등록'}
          className="px-10 font-bold"
          variant="secondary"
          onClick={() => {
            // if (isEditMode) {
            //   ClientModifyMutation.mutate(clientCompanyId)
            // } else {
            createSiteMutation.mutate()
            // }
          }}
        />
      </div>
    </>
  )
}
