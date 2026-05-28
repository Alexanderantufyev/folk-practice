import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthGate } from './components/AuthGate'
import { PublicEvents } from './pages/PublicEvents'
import { RegisterPage } from './pages/RegisterPage'
import { AdminLayout } from './pages/admin/AdminLayout'
import { AdminEvents } from './pages/admin/AdminEvents'
import { AdminEventDetail } from './pages/admin/AdminEventDetail'
import { AdminEventForm } from './pages/admin/AdminEventForm'
import { AdminReport } from './pages/admin/AdminReport'

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<PublicEvents />} />
        <Route path="/register/:id" element={<RegisterPage />} />
        <Route path="/admin" element={<AuthGate><AdminLayout /></AuthGate>}>
          <Route index element={<Navigate to="events" replace />} />
          <Route path="events" element={<AdminEvents />} />
          <Route path="events/new" element={<AdminEventForm />} />
          <Route path="events/:id" element={<AdminEventDetail />} />
          <Route path="events/:id/edit" element={<AdminEventForm />} />
          <Route path="report/:phase" element={<AdminReport />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 3000,
          style: { borderRadius: '10px', fontSize: '14px', fontWeight: 500 },
        }}
      />
    </>
  )
}
