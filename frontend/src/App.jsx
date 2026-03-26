import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';

// Import your pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';

// --- 1. PROTECTED ROUTE COMPONENT ---
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('access_token');
  return token ? children : <Navigate to="/login" replace />;
};

// --- 2. NAVIGATION COMPONENT ---
const Navigation = () => {
  const [token, setToken] = useState(localStorage.getItem('access_token'));
  const [username, setUsername] = useState(localStorage.getItem('username'));
  const location = useLocation();

  // Update state whenever the route changes (e.g., after login/logout)
  useEffect(() => {
    setToken(localStorage.getItem('access_token'));
    setUsername(localStorage.getItem('username'));
  }, [location]); 

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    
    // Update local state so UI reacts immediately before redirect
    setToken(null);
    setUsername(null);
    
    window.location.href = '/login';
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm mb-4">
      <div className="container">
        <Link className="navbar-brand fw-bold text-info" to="/">
          <i className="bi bi-cpu-fill me-2"></i>Primetrade.ai
        </Link>
        
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto align-items-center">
            {!token ? (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/login">Login</Link>
                </li>
                <li className="nav-item ms-lg-2">
                  <Link className="btn btn-info btn-sm px-3 fw-bold" to="/register">Register</Link>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <span className="nav-link text-light me-3">
                    Welcome, <b className="text-info">{username}</b>
                  </span>
                </li>
                <li className="nav-item">
                  <button className="btn btn-outline-danger btn-sm px-3" onClick={handleLogout}>
                    <i className="bi bi-box-arrow-right me-1"></i>Logout
                  </button>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

// --- 3. MAIN APP COMPONENT ---
function App() {
  return (
    <Router>
      <div className="min-vh-100 bg-light">
        <Navigation />
        
        <main className="container">
          <Routes>
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

            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            <Route path="*" element={
              <div className="text-center mt-5 p-5 bg-white shadow-sm rounded">
                <h1 className="display-1 fw-bold text-danger">404</h1>
                <p className="lead">Oops! We couldn't find that page.</p>
                <Link to="/" className="btn btn-primary">Go to Dashboard</Link>
              </div>
            } />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;