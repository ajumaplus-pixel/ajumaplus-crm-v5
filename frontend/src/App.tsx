import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/common/Navbar';
import Landing from './components/pages/Landing';
import AdminLanding from './components/pages/AdminLanding';
import CustomerLogin from './components/pages/CustomerLogin';
import CustomerRegister from './components/pages/CustomerRegister';
import ISPLogin from './components/pages/ISPLogin';
import ISPRegister from './components/pages/ISPRegister';
import AdminLogin from './components/pages/AdminLogin';
import Login from './components/pages/Login';
import Register from './components/pages/Register';
import Dashboard from './components/pages/Dashboard';
import AdminDashboard from './components/pages/AdminDashboard';
import CreateJobRequest from './components/pages/CreateJobRequest';
import ProtectedRoute from './components/common/ProtectedRoute';

const theme = createTheme({
  palette: {
    primary: {
      main: '#FFD400', // AjumaPlus Yellow (Ghana Gold)
      light: '#FFE066',
      dark: '#CCAA00',
      contrastText: '#000000',
    },
    secondary: {
      main: '#006B3F', // Ghana Green
      light: '#4D8C66',
      dark: '#004D2C',
      contrastText: '#FFFFFF',
    },
    info: {
      main: '#CE1126', // Ghana Red
      light: '#E06652',
      dark: '#8B0C1A',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#F8F9FA',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1A1A1A',
      secondary: '#4A4A4A',
    },
  },
  typography: {
    fontFamily: '"Segoe UI", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
    },
    h2: {
      fontWeight: 600,
      fontSize: '2rem',
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.75rem',
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
    },
    h5: {
      fontWeight: 500,
      fontSize: '1.25rem',
    },
    h6: {
      fontWeight: 500,
      fontSize: '1rem',
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          borderRadius: 12,
          transition: 'box-shadow 0.3s ease-in-out',
          '&:hover': {
            boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '10px 24px',
          fontSize: '0.95rem',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-1px)',
          },
        },
        contained: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Navbar />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/admin" element={<AdminLanding />} />
            <Route path="/customer/login" element={<CustomerLogin />} />
            <Route path="/customer/register" element={<CustomerRegister />} />
            <Route path="/isp/login" element={<ISPLogin />} />
            <Route path="/isp/register" element={<ISPRegister />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route path="/customer/dashboard" element={
              <ProtectedRoute allowedRoles={['customer']}>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/customer/jobs/new" element={
              <ProtectedRoute allowedRoles={['customer']}>
                <CreateJobRequest />
              </ProtectedRoute>
            } />
            <Route path="/isp/dashboard" element={
              <ProtectedRoute allowedRoles={['isp']}>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/staff/dashboard" element={
              <ProtectedRoute allowedRoles={['staff']}>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/dashboard" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;