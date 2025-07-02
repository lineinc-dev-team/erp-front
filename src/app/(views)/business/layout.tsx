import PageLayout from '@/components/common/PageLayout'

export default function BusinessLayout({ children }: { children: React.ReactNode }) {
  return <PageLayout entity="사업장">{children}</PageLayout>
}
