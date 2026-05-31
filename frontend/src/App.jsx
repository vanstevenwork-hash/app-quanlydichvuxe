import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import ProtectedRoute from './components/ProtectedRoute';
import ClientLayout from './layouts/ClientLayout/ClientLayout';
import AdminLayout from './layouts/AdminLayout/AdminLayout';

// Client Pages
import Home from './pages/Home/Home';
import Services from './pages/Services/Services';
import Booking from './pages/Booking/Booking';
import Profile from './pages/Profile/Profile';
import Login from './pages/Login/Login';
import Contact from './pages/Contact/Contact';
import Diagnostics from './pages/Diagnostics/Diagnostics';
import MockGateway from './pages/Payment/MockGateway';
import PaymentResult from './pages/Payment/PaymentResult';

// Admin Pages
import Dashboard from './pages/Admin/Dashboard/Dashboard';
import AdminServices from './pages/Admin/Services/AdminServices';
import AdminAppointments from './pages/Admin/Appointments/AdminAppointments';
import AdminTechnicians from './pages/Admin/Technicians/AdminTechnicians';
import AdminCustomers from './pages/Admin/Customers/AdminCustomers';

// Technician Pages
import TechnicianSchedule from './pages/Technician/TechnicianSchedule';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* ====== CLIENT ROUTES ====== */}
          <Route element={<ClientLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/services" element={<Services />} />
            <Route path="/diagnostics" element={<Diagnostics />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/booking" element={<Booking />} />
            <Route path="/profile" element={
              <ProtectedRoute roles={['customer']}>
                <Profile />
              </ProtectedRoute>
            } />
            <Route path="/payment/result" element={
              <ProtectedRoute roles={['customer']}>
                <PaymentResult />
              </ProtectedRoute>
            } />
            <Route path="/technician" element={
              <ProtectedRoute roles={['technician']}>
                <TechnicianSchedule />
              </ProtectedRoute>
            } />
          </Route>

          {/* ====== ADMIN ROUTES ====== */}
          <Route element={
            <ProtectedRoute roles={['admin']}>
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route path="/admin" element={<Dashboard />} />
            <Route path="/admin/services" element={<AdminServices />} />
            <Route path="/admin/appointments" element={<AdminAppointments />} />
            <Route path="/admin/technicians" element={<AdminTechnicians />} />
            <Route path="/admin/customers" element={<AdminCustomers />} />

            <Route path="/admin/reports" element={<Dashboard />} />
          </Route>

          {/* ====== PUBLIC UTILITY ROUTES ====== */}
          <Route path="/payment/mock" element={<MockGateway />} />

          {/* ====== AUTH ROUTES ====== */}
          <Route path="/login" element={<Login />} />
        </Routes>
      </Router>
      <ToastContainer position="top-right" autoClose={3000} />
    </AuthProvider>
  );
}

export default App;
