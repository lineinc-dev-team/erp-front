// app/business/layout.tsx
export default function BusinessLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <nav className="bg-gray-100 p-4">비즈니스 전용 메뉴</nav>
      <main>{children}</main>
    </div>
  )
}
