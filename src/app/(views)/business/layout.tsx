// app/business/layout.tsx
export default function BusinessLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="m-8">
      <h1 className="text-2xl mb-3">사업장 관리</h1>
      {children}
    </div>
  )
}
