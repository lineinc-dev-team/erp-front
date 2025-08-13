// 'use client'

// import CommonSelect from '@/components/common/Select'
// import CommonButton from '@/components/common/Button'

// import CommonInput from '@/components/common/Input'
// // import  from '@/components/common/DatePicker'
// // import { useOrderingContractStore } from '@/stores/outsourcingContractStore'
// import DaumPostcodeEmbed from 'react-daum-postcode'
// import { UseORnotOptions } from '@/config/erp.confing'

// export default function WorkforceHoursRegistrationView({ isEditMode = false }) {
//   const { form } = useOrderingContractStore()

//   return (
//     <>
//       <div>
//         <span className="font-bold border-b-2 mb-4">기본 정보</span>
//         <div className="grid grid-cols-2 mt-1">
//           <div className="flex">
//             <label className="w-36  text-[14px] flex items-center border border-gray-400  justify-center bg-gray-300  font-bold text-center">
//               소속(외주업체)
//             </label>
//             <div className="border border-gray-400 px-2 w-full flex gap-3 items-center ">
//               <CommonSelect
//                 fullWidth={true}
//                 value={form.isActive}
//                 onChange={(value) => form.setField('isActive', value)}
//                 options={UseORnotOptions}
//               />
//             </div>
//           </div>
//           <div className="flex">
//             <label className="w-36  text-[14px] flex items-center border border-gray-400  justify-center bg-gray-300  font-bold text-center">
//               인력코드
//             </label>
//             <div className="border border-gray-400 flex items-center px-2 w-full">
//               <CommonInput
//                 placeholder="012가3456"
//                 value={form.ceoName}
//                 onChange={(value) => form.setField('ceoName', value)}
//                 className=" flex-1"
//               />
//             </div>
//           </div>

//           <div className="flex">
//             <label className="w-36  text-[14px] flex items-center border border-gray-400 justify-center bg-gray-300  font-bold text-center">
//               이름
//             </label>
//             <div className="border border-gray-400 flex items-center px-2 w-full">
//               <CommonInput
//                 placeholder="012가3456"
//                 value={form.ceoName}
//                 onChange={(value) => form.setField('ceoName', value)}
//                 className=" flex-1"
//               />
//             </div>
//           </div>

//           <div className="flex">
//             <label className="w-36  text-[14px]  border border-gray-400 flex items-center justify-center bg-gray-300  font-bold text-center">
//               주민등록번호
//             </label>
//             <div className="border border-gray-400 flex items-center px-2 w-full">
//               <CommonInput
//                 placeholder="012가3456"
//                 value={form.ceoName}
//                 onChange={(value) => form.setField('ceoName', value)}
//                 className=" flex-1"
//               />
//             </div>
//           </div>

//           <div className="flex">
//             <label className="w-36  text-[14px]  border border-gray-400  flex items-center justify-center bg-gray-300  font-bold text-center">
//               전화번호(휴대폰)
//             </label>
//             <div className="border border-gray-400 flex items-center px-2 w-full">
//               <CommonInput
//                 placeholder="012가3456"
//                 value={form.ceoName}
//                 onChange={(value) => form.setField('ceoName', value)}
//                 className=" flex-1"
//               />
//             </div>
//           </div>

//           <div className="flex">
//             <label className="w-36 text-[14px] flex items-center border border-gray-400 justify-center bg-gray-300 font-bold text-center">
//               주소지
//             </label>
//             <div className="border border-gray-400 w-full flex flex-col gap-2 p-2">
//               <div className="flex gap-2">
//                 <input
//                   value={form.address}
//                   readOnly
//                   placeholder="주소를 검색해 주세요."
//                   className="flex-1 border px-3 py-2 rounded"
//                 />
//                 <CommonButton
//                   label="주소찾기"
//                   variant="secondary"
//                   className="bg-gray-400 text-white px-3 rounded"
//                   onClick={() => form.setField('isModalOpen', true)}
//                 />
//               </div>
//               <input
//                 value={form.detailAddress}
//                 onChange={(e) => form.setField('detailAddress', e.target.value)}
//                 placeholder="상세주소"
//                 className="w-full border px-3 py-2 rounded"
//               />
//               {form.isModalOpen && (
//                 <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
//                   <div className="bg-white w-full max-w-lg p-4 rounded-xl shadow-lg relative flex flex-col">
//                     <div className="flex justify-end w-full">
//                       <CommonButton
//                         className="mb-2"
//                         label="X"
//                         variant="danger"
//                         onClick={() => form.setField('isModalOpen', false)}
//                       />
//                     </div>
//                     <DaumPostcodeEmbed
//                       onComplete={(data) => {
//                         form.setField('address', data.address)
//                         form.setField('isModalOpen', false)
//                       }}
//                       autoClose={false}
//                     />
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>

//           <div className="flex">
//             <label className="w-36  text-[14px] border border-gray-400  flex items-center justify-center bg-gray-300  font-bold text-center">
//               입사일
//             </label>
//             <div className="border border-gray-400 p-3 px-2 w-full flex gap-3 items-center ">
//               {/* <CommonDatePicker
//                 value={form.startDate}
//                 onChange={(value) => form.setField('startDate', value)}
//               />
//               ~
//               <CommonDatePicker
//                 value={form.endDate}
//                 onChange={(value) => form.setField('endDate', value)}
//               /> */}
//             </div>
//           </div>
//           <div className="flex">
//             <label className="w-36  text-[14px] border border-gray-400  flex items-center justify-center bg-gray-300  font-bold text-center">
//               퇴사일
//             </label>
//             <div className="border border-gray-400 px-2 w-full flex gap-3 items-center ">
//               {/* <CommonDatePicker
//                 value={form.startDate}
//                 onChange={(value) => form.setField('startDate', value)}
//               />
//               ~
//               <CommonDatePicker
//                 value={form.endDate}
//                 onChange={(value) => form.setField('endDate', value)}
//               /> */}
//             </div>
//           </div>
//         </div>
//       </div>

//       <div className="mt-10">
//         <span className="font-bold border-b-2 mb-4">근속 및 퇴직 관리</span>
//         <div className="flex mt-1">
//           <div className="flex flex-1 flex-col">
//             <label className="h-10 text-[14px] flex items-center border border-gray-400 justify-center bg-gray-300 font-bold text-center">
//               근속일수
//             </label>
//             <div className="border border-gray-400 p-2">
//               <CommonInput
//                 placeholder="근속일수는 동적으로 계산 되어야함"
//                 value={form.ceoName}
//                 onChange={(value) => form.setField('ceoName', value)}
//                 className="w-full"
//               />
//             </div>
//           </div>

//           <div className="flex flex-1 flex-col">
//             <label className="h-10 text-[14px] flex items-center border border-gray-400 justify-center bg-gray-300 font-bold text-center">
//               퇴지금 발생 여부
//             </label>
//             <div className="border border-gray-400 p-2 flex grow items-center">
//               <CommonSelect
//                 fullWidth
//                 value={form.isActive}
//                 onChange={(value) => form.setField('isActive', value)}
//                 options={UseORnotOptions}
//                 className="w-full"
//               />
//             </div>
//           </div>

//           <div className="flex flex-1 flex-col">
//             <label className="h-10 text-[14px] flex items-center border border-gray-400 justify-center bg-gray-300 font-bold text-center">
//               퇴직금 지급 여부
//             </label>
//             <div className="border border-gray-400 p-2 flex grow items-center">
//               <CommonSelect
//                 fullWidth
//                 value={form.isActive}
//                 onChange={(value) => form.setField('isActive', value)}
//                 options={UseORnotOptions}
//                 className="w-full"
//               />
//             </div>
//           </div>

//           <div className="flex flex-1 flex-col">
//             <label className="h-10 text-[14px] flex items-center border border-gray-400 justify-center bg-gray-300 font-bold text-center">
//               재등록 가능 여부
//             </label>
//             <div className="border border-gray-400 p-2 flex grow items-center">
//               <CommonSelect
//                 fullWidth
//                 value={form.isActive}
//                 onChange={(value) => form.setField('isActive', value)}
//                 options={UseORnotOptions}
//                 className="w-full"
//               />
//             </div>
//           </div>
//         </div>
//       </div>

//       <div className="mt-10">
//         <span className="font-bold border-b-2 mb-4">공수 기준 및 출역 구분</span>
//         <div className="grid grid-cols-2 mt-1">
//           <div className="flex">
//             <label className="w-36  text-[14px] flex items-center border border-gray-400  justify-center bg-gray-300  font-bold text-center">
//               현장
//             </label>
//             <div className="border border-gray-400 p-2 px-2 w-full flex gap-3 items-center ">
//               <CommonSelect
//                 fullWidth={true}
//                 value={form.isActive}
//                 onChange={(value) => form.setField('isActive', value)}
//                 options={UseORnotOptions}
//               />
//             </div>
//           </div>
//           <div className="flex">
//             <label className="w-36  text-[14px] flex items-center border border-gray-400  justify-center bg-gray-300  font-bold text-center">
//               공정명
//             </label>
//             <div className="border border-gray-400 px-2 w-full flex gap-3 items-center ">
//               <CommonSelect
//                 fullWidth={true}
//                 value={form.isActive}
//                 onChange={(value) => form.setField('isActive', value)}
//                 options={UseORnotOptions}
//               />
//             </div>
//           </div>

//           <div className="flex">
//             <label className="w-36  text-[14px] flex items-center border border-gray-400 justify-center bg-gray-300  font-bold text-center">
//               직종 / 업무
//             </label>
//             <div className="border border-gray-400 flex items-center px-2 w-full">
//               <CommonInput
//                 placeholder="텍스트 입력"
//                 value={form.ceoName}
//                 onChange={(value) => form.setField('ceoName', value)}
//                 className=" flex-1"
//               />
//             </div>
//           </div>

//           <div className="flex">
//             <label className="w-36  text-[14px]  border border-gray-400 flex items-center justify-center bg-gray-300  font-bold text-center">
//               기준공수
//             </label>
//             <div className="border border-gray-400 flex items-center px-2 w-full">
//               <CommonInput
//                 placeholder="숫자만 입력 가능"
//                 value={form.ceoName}
//                 onChange={(value) => form.setField('ceoName', value)}
//                 className=" flex-1"
//               />
//             </div>
//           </div>

//           <div className="flex">
//             <label className="w-36  text-[14px]  border border-gray-400  flex items-center justify-center bg-gray-300  font-bold text-center">
//               공수구분
//             </label>
//             <div className="border border-gray-400 px-2 w-full flex gap-3 items-center ">
//               <CommonSelect
//                 fullWidth={true}
//                 value={form.isActive}
//                 onChange={(value) => form.setField('isActive', value)}
//                 options={UseORnotOptions}
//               />
//             </div>
//           </div>

//           <div className="flex">
//             <label className="w-36  text-[14px]  border border-gray-400  flex items-center justify-center bg-gray-300  font-bold text-center">
//               공수 단위 시간
//             </label>
//             <div className="border border-gray-400 flex items-center px-2 w-full">
//               <CommonInput
//                 placeholder="숫자만 입력 가능"
//                 value={form.ceoName}
//                 onChange={(value) => form.setField('ceoName', value)}
//                 className=" flex-1"
//               />
//             </div>
//           </div>
//         </div>
//       </div>

//       <div className="mt-4">
//         <span className="font-bold border-b-2 mb-4">계약이력</span>
//       </div>
//       <div className="flex mt-1">
//         <div className="flex flex-col w-1/4">
//           <label className=" border border-gray-400 w-full flex items-center justify-center bg-gray-300  font-bold text-center">
//             변경일시
//           </label>
//           <div className="border border-gray-400 px-2 p-2 w-full flex justify-center gap-2.5 items-center">
//             <p>이경호</p>
//           </div>
//         </div>
//         <div className="flex flex-col w-1/4">
//           <label className="w-full  border border-gray-400 flex items-center justify-center bg-gray-300  font-bold text-center">
//             변경 항목
//           </label>
//           <div className="border border-gray-400 px-2 p-2 w-full flex justify-center  gap-2.5 items-center">
//             <p>이경호</p>
//           </div>
//         </div>
//         <div className="flex flex-col w-1/4">
//           <label className="w-full  border border-gray-400 flex items-center justify-center bg-gray-300 font-bold text-center">
//             변경자
//           </label>
//           <div className="border border-gray-400 px-2 p-2 flex w-full justify-center  gap-2.5 items-center">
//             <p>이경호</p>
//           </div>
//         </div>
//         <div className="flex flex-col w-1/4">
//           <label className="w-full  border border-gray-400 flex items-center justify-center bg-gray-300  font-bold text-center">
//             수정 사유
//           </label>
//           <div className="border border-gray-400 px-2 p-2 w-full flex justify-center  gap-2.5 items-center">
//             <p>이경호</p>
//           </div>
//         </div>
//       </div>

//       <div className="mt-4">
//         <span className="font-bold border-b-2 mb-4">수정이력</span>
//       </div>
//       <div className="flex mt-1">
//         <div className="flex flex-col w-1/4">
//           <label className=" border border-gray-400 w-full flex items-center justify-center bg-gray-300  font-bold text-center">
//             변경일시
//           </label>
//           <div className="border border-gray-400 px-2 p-2 w-full flex justify-center gap-2.5 items-center">
//             <p>이경호</p>
//           </div>
//         </div>
//         <div className="flex flex-col w-1/4">
//           <label className="w-full  border border-gray-400 flex items-center justify-center bg-gray-300  font-bold text-center">
//             변경 항목
//           </label>
//           <div className="border border-gray-400 px-2 p-2 w-full flex justify-center  gap-2.5 items-center">
//             <p>이경호</p>
//           </div>
//         </div>
//         <div className="flex flex-col w-1/4">
//           <label className="w-full  border border-gray-400 flex items-center justify-center bg-gray-300 font-bold text-center">
//             변경자
//           </label>
//           <div className="border border-gray-400 px-2 p-2 flex w-full justify-center  gap-2.5 items-center">
//             <p>이경호</p>
//           </div>
//         </div>
//         <div className="flex flex-col w-1/4">
//           <label className="w-full  border border-gray-400 flex items-center justify-center bg-gray-300  font-bold text-center">
//             수정 사유
//           </label>
//           <div className="border border-gray-400 px-2 p-2 w-full flex justify-center  gap-2.5 items-center">
//             <p>이경호</p>
//           </div>
//         </div>
//       </div>

//       <div className="flex justify-center gap-10 mt-10">
//         <CommonButton
//           label="취소"
//           variant="reset"
//           className="px-10"
//           onClick={form.handleCancelData}
//         />
//         <CommonButton
//           label={isEditMode ? '+ 수정' : '+ 등록'}
//           className="px-10 font-bold"
//           variant="secondary"
//           onClick={form.newOutsouringCompany}
//         />
//       </div>
//     </>
//   )
// }
