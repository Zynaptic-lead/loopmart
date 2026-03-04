import Preloader from '../components/Preloader'

export default function RootLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Preloader />
      <main>{children}</main>
    </div>
  )
}