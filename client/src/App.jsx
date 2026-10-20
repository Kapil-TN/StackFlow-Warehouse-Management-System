import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Warehouses from './pages/Warehouses';
import Inventory from './pages/Inventory';
import Receiving from './pages/Receiving';
import Orders from './pages/Orders';
import ActivityLogs from './pages/ActivityLogs';
import Users from './pages/Users';

const ThemedToaster = () => {
  const { isDark } = useTheme();
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3500,
        style: {
          background: isDark ? '#1A1A1A' : '#FFFFFF',
          color: isDark ? '#FAFAFA' : '#18181B',
          border: `1px solid ${isDark ? '#27272A' : '#E4E4E7'}`,
          fontSize: '13px',
          borderRadius: '8px',
          boxShadow: isDark ? '0 10px 30px rgba(0,0,0,0.5)' : '0 10px 30px rgba(0,0,0,0.08)',
          fontFamily: 'var(--font-sans)',
        },
        success: {
          iconTheme: {
            primary: '#10B981',
            secondary: '#FFFFFF',
          },
        },
        error: {
          iconTheme: {
            primary: '#EF4444',
            secondary: '#FFFFFF',
          },
        },
      }}
    />
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <ThemedToaster />

        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />

          {/* Protected Dashboard & App Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="products" element={<Products />} />
            <Route path="warehouses" element={<Warehouses />} />
            <Route path="inventory" element={<Inventory />} />
            <Route path="receiving" element={<Receiving />} />
            <Route path="orders" element={<Orders />} />
            <Route
              path="activity"
              element={
                <ProtectedRoute roles={['admin', 'warehouse_manager']}>
                  <ActivityLogs />
                </ProtectedRoute>
              }
            />
            <Route
              path="users"
              element={
                <ProtectedRoute roles={['admin']}>
                  <Users />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  </ThemeProvider>
  );
}

export default App;
