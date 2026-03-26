import React, { useState } from 'react';
import { authApi } from '../api/axios';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'user' // Default to standard user
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Sends JSON: { "username": "...", "email": "...", "password": "...", "role": "..." }
      await authApi.register(formData);
      alert("Registration Successful! Redirecting to login...");
      navigate('/login');
    } catch (err) {
      // Captures the FastAPI HTTPException detail
      setError(err.response?.data?.detail || "An error occurred during registration.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="card shadow-lg border-0 rounded-3">
            <div className="card-header bg-primary text-white text-center py-3">
              <h3 className="mb-0 fw-bold">Join Primetrade.ai</h3>
            </div>
            <div className="card-body p-4">
              
              {error && (
                <div className="alert alert-danger d-flex align-items-center" role="alert">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  <div>{error}</div>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {/* Username Field */}
                <div className="mb-3">
                  <label className="form-label fw-semibold">Username</label>
                  <input
                    name="username"
                    type="text"
                    className="form-control"
                    placeholder="e.g. sahil_dev"
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Email Field */}
                <div className="mb-3">
                  <label className="form-label fw-semibold">Email Address</label>
                  <input
                    name="email"
                    type="email"
                    className="form-control"
                    placeholder="name@example.com"
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Password Field */}
                <div className="mb-3">
                  <label className="form-label fw-semibold">Password</label>
                  <input
                    name="password"
                    type="password"
                    className="form-control"
                    placeholder="Create a strong password"
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Role Selection - Critical for RBAC testing */}
                <div className="mb-4">
                  <label className="form-label fw-semibold">Assign Role</label>
                  <select 
                    name="role" 
                    className="form-select" 
                    onChange={handleChange} 
                    value={formData.role}
                  >
                    <option value="user">Standard User</option>
                    <option value="admin">Administrator (Full Access)</option>
                  </select>
                 
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary w-100 py-2 fw-bold shadow-sm"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="spinner-border spinner-border-sm me-2"></span>
                  ) : "Register Now"}
                </button>
              </form>
            </div>
            
            <div className="card-footer bg-light text-center py-3">
              <span>Already have an account? </span>
              <Link to="/login" className="text-primary fw-bold text-decoration-none">Login</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;