'use client'

import { useBusinessStore } from '@/stores/businessStore'
import CommonInput from '../common/Input'
import CommonSelect from '../common/Select'
import { BusinessRegistrationService } from '@/services/business/businessRegistrationService'
import CommonDatePicker from '../common/DatePicker'
import CommonButton from '../common/Button'
import DaumPostcodeEmbed from 'react-daum-postcode'
import { getTodayDateString } from '@/utils/formatters'
import CommonFileInput from '../common/FileInput'

export default function BusinessRegistrationView({ isEditMode = false }) {
  const {
    businessInfo,
    setField,
    status,
    setStatus,
    startDate,
    process,
    setProcess,
    endDate,
    setStartDate,
    setEndDate,
  } = useBusinessStore()

  const {
    statusOptions,
    ProcessStatusOptions,
    address,
    setAddress,
    detail,
    setDetail,
    isModalOpen,
    setIsModalOpen,
    handleNewOrder,
    handleAddProcess,
    contractFiles,
    setContractFiles,
    siteDrawFiles,
    setSiteDrawFiles,
    permitFiles,
    setPermitFiles,
    etcFiles,
    setEtcFiles,
    handleCancelData,
    handleNewBusiness,
  } = BusinessRegistrationService()

  // 수정과 등록을 같이 사용함

  return (
    <>
      <div>
        <span className="font-bold border-b-2 mb-4">기본 정보</span>
        <div className="grid grid-cols-2 mt-1">
          <div className="flex">
            <label className="w-44 flex items-center border border-gray-400  justify-center bg-gray-300  font-bold text-center">
              사업자명
            </label>
            <div className="border border-gray-400 px-2 w-full">
              <CommonInput
                value={businessInfo.name}
                onChange={(value) => setField('name', value)}
                className=" flex-1"
              />
            </div>
          </div>
          <div className="flex">
            <label className="w-44 flex items-center border border-gray-400  justify-center bg-gray-300  font-bold text-center">
              사업장 코드
            </label>
            <div className="border border-gray-400 px-2 w-full">
              <CommonInput
                value={businessInfo.code}
                onChange={(value) => setField('code', value)}
                className=" flex-1"
              />
            </div>
          </div>

          <div className="flex">
            <label className="w-44 flex items-center border border-gray-400 justify-center bg-gray-300  font-bold text-center">
              위치(주소)
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
              사업장 유형
            </label>
            <div className="border border-gray-400 px-2 p-2 w-full flex justify-center items-center">
              <CommonSelect value={status} onChange={setStatus} options={statusOptions} />
            </div>
          </div>

          <div className="flex">
            <label className="w-44  border border-gray-400  flex items-center justify-center bg-gray-300  font-bold text-center">
              사업시작 / 종료일
            </label>
            <div className="border border-gray-400 px-2 w-full flex gap-3 items-center ">
              <CommonDatePicker value={startDate} onChange={setStartDate} />
              ~
              <CommonDatePicker value={endDate} onChange={setEndDate} />
            </div>
          </div>

          <div className="flex">
            <label className="w-44  border border-gray-400 flex items-center justify-center bg-gray-300  font-bold text-center">
              발주처
            </label>
            <div className="border border-gray-400 px-2 p-2 w-full flex justify-center gap-2.5 items-center">
              <CommonSelect value={status} onChange={setStatus} options={statusOptions} />
              <CommonButton
                label="신규등록"
                className="whitespace-nowrap text-[15px]"
                variant="secondary"
                onClick={handleNewOrder}
              />
            </div>
          </div>

          <div className="flex">
            <label className="w-44 border border-gray-400  flex items-center justify-center bg-gray-300  font-bold text-center">
              진행 상태
            </label>
            <div className="border border-gray-400 px-2 p-2 w-full flex justify-center items-center">
              <CommonSelect value={process} onChange={setProcess} options={ProcessStatusOptions} />
            </div>
          </div>
          <div className="flex">
            <label className="w-44 border border-gray-400  flex items-center justify-center bg-gray-300  font-bold text-center">
              현장소장
            </label>
            <div className="border border-gray-400 px-2 p-2 w-full flex justify-center items-center">
              <CommonSelect value={process} onChange={setProcess} options={ProcessStatusOptions} />
            </div>
          </div>
          <div className="flex">
            <label className="w-44 border border-gray-400  flex items-center justify-center bg-gray-300  font-bold text-center">
              외주 등록 여부
            </label>
            <div className="border border-gray-400 px-2 p-2 w-full flex justify-center items-center">
              <CommonSelect value={process} onChange={setProcess} options={ProcessStatusOptions} />
            </div>
          </div>
          <div className="flex">
            <label className="w-44 border border-gray-400  flex items-center justify-center bg-gray-300  font-bold text-center">
              본사 담당자
            </label>
            <div className="border border-gray-400 px-2 p-2 w-full flex justify-center items-center">
              <CommonSelect value={process} onChange={setProcess} options={ProcessStatusOptions} />
            </div>
          </div>
          <div className="flex">
            <label className="w-44 border border-gray-400  flex items-center justify-center bg-gray-300  font-bold text-center">
              정산 주기
            </label>
            <div className="border border-gray-400 px-2 p-2 w-full flex justify-center items-center">
              <CommonSelect value={process} onChange={setProcess} options={ProcessStatusOptions} />
            </div>
          </div>
          <div className="flex">
            <label className="w-44 border border-gray-400  flex items-center justify-center bg-gray-300  font-bold text-center">
              주요 공정
            </label>
            <div className="border border-gray-400 px-2 p-2 w-full flex items-center">
              <CommonButton label="추가" variant="secondary" onClick={handleAddProcess} />
            </div>
          </div>
        </div>
        <div className="flex">
          <div
            className="
                        w-[8rem]
                        [@media(min-width:1455px)]:w-[9.7rem]
                        [@media(min-width:1900px)]:w-[10.05rem]
                        flex items-center border border-gray-400 justify-center 
                        bg-gray-300 font-bold text-center
                      "
          >
            사업자 설명
          </div>

          <div className="border border-gray-400 px-2 p-2 w-full flex items-center">
            <CommonInput
              value={businessInfo.description}
              onChange={(value) => setField('description', value)}
              className=" w-full"
            />
          </div>
        </div>
      </div>

      <div className="mt-4">
        <span className="font-bold border-b-2 mb-4">첨부 파일</span>
      </div>

      <div className="grid grid-cols-2 mt-1">
        <div className="flex">
          <label className="w-44  border border-gray-400 flex items-center justify-center bg-gray-300  font-bold text-center">
            계약서
          </label>
          <div className="border border-gray-400 px-2 p-2 w-full flex gap-2.5 items-center">
            <CommonFileInput
              label="계약서"
              acceptedExtensions={['pdf', 'hwp']}
              files={contractFiles}
              onChange={setContractFiles}
            />
          </div>
        </div>

        <div className="flex">
          <label className="w-44  border border-gray-400 flex items-center justify-center bg-gray-300  font-bold text-center">
            현장도면
          </label>
          <div className="border border-gray-400 px-2 p-2 w-full flex justify-center gap-2.5 items-center">
            <CommonFileInput
              label="현장도면"
              acceptedExtensions={['pdf', 'hwp']}
              files={siteDrawFiles}
              onChange={setSiteDrawFiles}
            />
          </div>
        </div>
        <div className="flex">
          <label className="w-44  border border-gray-400 flex items-center justify-center bg-gray-300  font-bold text-center">
            인허가 서류
          </label>
          <div className="border border-gray-400 px-2 p-2 w-full flex justify-center gap-2.5 items-center">
            <CommonFileInput
              label="인허가 서류"
              acceptedExtensions={['pdf', 'hwp']}
              files={permitFiles}
              onChange={setPermitFiles}
            />
          </div>
        </div>
        <div className="flex">
          <label className="w-44  border border-gray-400 flex items-center justify-center bg-gray-300  font-bold text-center">
            기타파일
          </label>
          <div className="border border-gray-400 px-2 p-2 w-full flex justify-center gap-2.5 items-center">
            <CommonFileInput
              label="기타파일"
              acceptedExtensions={['zip', 'xlsx', 'doc']}
              files={etcFiles}
              onChange={setEtcFiles}
            />
          </div>
        </div>
        <div className="flex">
          <label className="w-44  border border-gray-400 flex items-center justify-center bg-gray-300  font-bold text-center">
            첨부일자
          </label>
          <div className="border border-gray-400 px-2 p-2 w-full flex gap-2.5 items-center">
            <p>{getTodayDateString()}</p>
          </div>
        </div>
        <div className="flex">
          <label className="w-44  border border-gray-400 flex items-center justify-center bg-gray-300  font-bold text-center">
            등록자
          </label>
          <div className="border border-gray-400 px-2 p-2 w-full flex  gap-2.5 items-center">
            <p>이경호</p>
          </div>
        </div>
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
