import LoginView from '@/components/login/LoginView'
import SideMenu from '@/components/layout/Header'

export default function Home() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <SideMenu />
      <LoginView />
    </div>
  )
}
