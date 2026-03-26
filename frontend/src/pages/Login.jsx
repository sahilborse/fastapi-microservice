import React, { useState } from 'react';
import { authApi } from '../api/axios';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // 💡 CRITICAL: FastAPI OAuth2 expects form-data, not JSON
    const params = new URLSearchParams();
    params.append('username', username);
    params.append('password', password);

    try {
      const response = await authApi.login(params);
      
      // 1. Store the JWT token for the Axios Interceptor
      localStorage.setItem('access_token', response.data.access_token);
      
      // 2. Store user info for the UI (Navbar, etc.)
      localStorage.setItem('username', username);
      
      // 3. Optional: Store the role if your login response provides it
      // localStorage.setItem('role', response.data.role);

      alert("Login Successful!");
      navigate('/dashboard');
    } catch (err) {
      // Handles 401 Unauthorized or 422 Validation errors
      setError(err.response?.data?.detail || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-5 col-lg-4">
          <div className="card shadow-lg border-0">
            <div className="card-header bg-primary text-white text-center py-4">
              <h3 className="mb-0 fw-bold">Welcome Back</h3>
              <p className="small mb-0 opacity-75">Sign in to manage your tasks</p>
            </div>
            <div className="card-body p-4">
              
              {error && (
                <div className="alert alert-danger py-2 text-center" role="alert">
                  <i className="bi bi-x-circle-fill me-2"></i> {error}
                </div>
              )}

              <form onSubmit={handleLogin}>
                {/* Username Input */}
                <div className="mb-3">
                  <label className="form-label fw-semibold">Username</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light">
                      <i className="bi bi-person"></i>
                    </span>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div className="mb-4">
                  <label className="form-label fw-semibold">Password</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light">
                      <i className="bi bi-lock"></i>
                    </span>
                    <input
                      type="password"
                      className="form-control"
                      placeholder="Enter password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary w-100 py-2 fw-bold shadow-sm"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="spinner-border spinner-border-sm me-2"></span>
                  ) : "Sign In"}
                </button>
              </form>
            </div>
            
            <div className="card-footer bg-light text-center py-3">
              <span className="text-muted">Don't have an account? </span>
              <Link to="/register" className="text-primary fw-bold text-decoration-none">
                Register Now
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;