import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'

// Auth Pages
import LoginPage         from './pages/auth/LoginPage'
import RegisterPage      from './pages/auth/RegisterPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'

// Admin Pages
import AdminDashboard   from './pages/admin/AdminDashboard'
import AdminUsers       from './pages/admin/AdminUsers'
import AdminTrainers    from './pages/admin/AdminTrainers'
import AdminContent     from './pages/admin/AdminContent'
import AdminPricing     from './pages/admin/AdminPricing'
import AdminReports     from './pages/admin/AdminReports'
import AdminNotifications from './pages/admin/AdminNotifications'
import AdminSettings    from './pages/admin/AdminSettings'
import AdminLibrary     from './pages/admin/AdminLibrary'

// Trainer Pages
import TrainerDashboard  from './pages/trainer/TrainerDashboard'
import TrainerCards      from './pages/trainer/TrainerCards'
import TrainerQuizzes    from './pages/trainer/TrainerQuizzes'
import TrainerQuestions  from './pages/trainer/TrainerQuestions'
import TrainerAnalytics  from './pages/trainer/TrainerAnalytics'
import TrainerStudy      from './pages/trainer/TrainerStudy'
import TrainerLibrary    from './pages/trainer/TrainerLibrary'
import TrainerSettings   from './pages/trainer/TrainerSettings'

// Support Pages
import SupportDashboard  from './pages/support/SupportDashboard'
import SupportMessages   from './pages/support/SupportMessages'
import SupportComments   from './pages/support/SupportComments'
import SupportUsers      from './pages/support/SupportUsers'
import SupportContent    from './pages/support/SupportContent'
import SupportNotifications from './pages/support/SupportNotifications'
import SupportSettings   from './pages/support/SupportSettings'

// Customer Pages
import CustomerHome        from './pages/customer/CustomerHome'
import CustomerDecks       from './pages/customer/CustomerDecks'
import CustomerQuiz        from './pages/customer/CustomerQuiz'
import CustomerProgress    from './pages/customer/CustomerProgress'
import CustomerShop        from './pages/customer/CustomerShop'
import CustomerProfile     from './pages/customer/CustomerProfile'
import CustomerImageCards  from './pages/customer/CustomerImageCards'

// Layouts (shared/index.jsx içinde tanımlı)
import {
  AdminLayout,
  TrainerLayout,
  SupportLayout,
  CustomerLayout,
} from './components/shared'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 5 * 60 * 1000 }
  }
})

// ── ROUTE GUARDS ──────────────────────────────────────────────
function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth()
  if (loading) return <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',color:'white',fontFamily:'Montserrat'}}>Yükleniyor...</div>
  if (!user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />
  return children
}

function RoleRedirect() {
  const { user, loading } = useAuth()
  if (loading) return null
  if (!user) return <Navigate to="/login" replace />
  switch (user.role) {
    case 'admin':    return <Navigate to="/admin" replace />
    case 'trainer':  return <Navigate to="/trainer" replace />
    case 'support':  return <Navigate to="/support" replace />
    case 'customer': return <Navigate to="/app" replace />
    default:         return <Navigate to="/login" replace />
  }
}

// ── APP ───────────────────────────────────────────────────────
export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <BrowserRouter>
            <Toaster position="bottom-right" toastOptions={{
              style: { fontFamily: 'Montserrat', fontSize: '12px', fontWeight: '600' }
            }}/>
            <Routes>
              {/* Public */}
              <Route path="/login"           element={<LoginPage />} />
              <Route path="/register"        element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/"                element={<RoleRedirect />} />

              {/* Admin */}
              <Route path="/admin" element={
                <ProtectedRoute roles={['admin']}>
                  <AdminLayout />
                </ProtectedRoute>
              }>
                <Route index                  element={<AdminDashboard />} />
                <Route path="users"           element={<AdminUsers />} />
                <Route path="trainers"        element={<AdminTrainers />} />
                <Route path="content"         element={<AdminContent />} />
                <Route path="pricing"         element={<AdminPricing />} />
                <Route path="reports"         element={<AdminReports />} />
                <Route path="notifications"   element={<AdminNotifications />} />
                <Route path="library"         element={<AdminLibrary />} />
                <Route path="settings"        element={<AdminSettings />} />
              </Route>

              {/* Trainer */}
              <Route path="/trainer" element={
                <ProtectedRoute roles={['trainer']}>
                  <TrainerLayout />
                </ProtectedRoute>
              }>
                <Route index                element={<TrainerDashboard />} />
                <Route path="cards"         element={<TrainerCards />} />
                <Route path="quizzes"       element={<TrainerQuizzes />} />
                <Route path="questions"     element={<TrainerQuestions />} />
                <Route path="analytics"     element={<TrainerAnalytics />} />
                <Route path="study"         element={<TrainerStudy />} />
                <Route path="library"       element={<TrainerLibrary />} />
                <Route path="settings"      element={<TrainerSettings />} />
              </Route>

              {/* Support */}
              <Route path="/support" element={
                <ProtectedRoute roles={['support']}>
                  <SupportLayout />
                </ProtectedRoute>
              }>
                <Route index                  element={<SupportDashboard />} />
                <Route path="messages"        element={<SupportMessages />} />
                <Route path="comments"        element={<SupportComments />} />
                <Route path="users"           element={<SupportUsers />} />
                <Route path="content"         element={<SupportContent />} />
                <Route path="notifications"   element={<SupportNotifications />} />
                <Route path="settings"        element={<SupportSettings />} />
              </Route>

              {/* Customer */}
              <Route path="/app" element={
                <ProtectedRoute roles={['customer']}>
                  <CustomerLayout />
                </ProtectedRoute>
              }>
                <Route index               element={<CustomerHome />} />
                <Route path="decks"        element={<CustomerDecks />} />
                <Route path="quiz"         element={<CustomerQuiz />} />
                <Route path="progress"     element={<CustomerProgress />} />
                <Route path="shop"         element={<CustomerShop />} />
                <Route path="profile"      element={<CustomerProfile />} />
                <Route path="image-cards"  element={<CustomerImageCards />} />
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}
