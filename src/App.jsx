import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SketchboardProvider } from './contexts/SketchboardContext';

// Pages
import Landing from './pages/Landing/Landing';
import Login from './pages/Auth/Login';
import SignUp from './pages/Auth/SignUp';
import Dashboard from './pages/Dashboard/Dashboard';
import Canvas from './pages/Canvas/Canvas';

// Components
import ProtectedRoute from './components/ProtectedRoute';

// Styles
import './index.css';

function AppRoutes() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loader-pencil"></div>
        <p style={{ fontFamily: 'var(--font-label)', marginTop: '20px' }}>
          Loading MindSketch...
        </p>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Landing />} />
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />}
      />
      <Route
        path="/signup"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <SignUp />}
      />

      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <SketchboardProvider>
              <Dashboard />
            </SketchboardProvider>
          </ProtectedRoute>
        }
      />
      <Route
        path="/canvas/:boardId"
        element={
          <ProtectedRoute>
            <SketchboardProvider>
              <Canvas />
            </SketchboardProvider>
          </ProtectedRoute>
        }
      />

      {/* Catch all - redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;
