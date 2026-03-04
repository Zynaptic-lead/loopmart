import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { SubscriptionProvider } from './contexts/SubscriptionContext'
import { NotificationProvider } from './contexts/NotificationContext'
import RootLayout from './layouts/RootLayout'
import HomePage from './pages/HomePage'
import PricingPage from './pages/PricingPage'
import { ToastProvider } from './contexts/ToastContext'
import NotificationsPage from './pages/NotificationsPage'
import ProductDetails from './pages/ProductDetails'
import SellingSuccessPage from './pages/SellingSuccessPage'
import StartSelling from './pages/StartSelling'
import ShopPage from './pages/ShopPage';
import DashboardPage from './pages/DashboardPage'
// Remove this line: import ReviewPromptModal from '../src/components/ReviewPromptModal';
import ProtectedRoute from './components/ProtectedRoute' 

function App() {
  return (
    <SubscriptionProvider>
      <NotificationProvider>
        <ToastProvider>
          <Router>
            <RootLayout>
              <Routes>
                {/* Public routes - accessible to everyone */}
                <Route path="/" element={<HomePage />} />
                <Route path="/pricing" element={<PricingPage />} />
                <Route path="/products/:id" element={<ProductDetails />} />
                <Route path="/shop/:slug" element={<ShopPage />} />
                
                {/* Protected routes - require login */}
                <Route path="/notifications" element={
                  <ProtectedRoute>
                    <NotificationsPage />
                  </ProtectedRoute>
                } />
                <Route path="/start-selling" element={
                  <ProtectedRoute>
                    <StartSelling />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                } />
                <Route path="/selling-success" element={
                  <ProtectedRoute>
                    <SellingSuccessPage />
                  </ProtectedRoute>
                } />
              </Routes>
            </RootLayout>
          </Router>
        </ToastProvider>
      </NotificationProvider>
    </SubscriptionProvider>
  )
}

export default App