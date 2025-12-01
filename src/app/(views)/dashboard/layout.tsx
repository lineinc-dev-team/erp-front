// import Image from 'next/image'

// export default function Layout() {
//   return (
//     <div className="text-center relative">
//       <div className=" w-full aspect-[16/9]">
//         <Image
//           src="/assets/testImg.jpeg"
//           alt="대쉬보드 이미지"
//           fill
//           style={{ objectFit: 'cover' }}
//         />
//       </div>
//       <p className="absolute top-20 left-1/2 -translate-x-1/2 text-5xl  text-white">
//         대쉬보드 업데이트 예정입니다.
//       </p>
//     </div>
//   )
// }

import PageLayout from '@/components/common/PageLayout'

export default function ManagementSteelLayout({ children }: { children: React.ReactNode }) {
  return <PageLayout entity="대쉬보드">{children}</PageLayout>
}
