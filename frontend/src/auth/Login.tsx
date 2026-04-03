import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/auth.css';
import axios from 'axios';

interface LoginFormData {
    email: string;
    password: string;
    userType: 'customer' | 'tailor';
}

const Login: React.FC = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState<LoginFormData>({
        email: '',
        password: '',
        userType: 'customer'
    });
    const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error when user types
        if (errors[name as keyof typeof errors]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };

    const validateForm = (): boolean => {
        let isValid = true;
        const newErrors: { email?: string; password?: string } = {};

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email) {
            newErrors.email = 'Email is required';
            isValid = false;
        } else if (!emailRegex.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
            isValid = false;
        }

        // Password validation
        if (!formData.password) {
            newErrors.password = 'Password is required';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsLoading(true);

        try {
            console.log('Login data:', formData);
            const url = `${import.meta.env.VITE_API_BASE_URL}/loginUser`;

            const response = await axios.post(url, formData, { headers: { "Content-Type": "application/x-www-form-urlencoded", 'Authorization': `Bearer ${localStorage.getItem('token')}` } });

            console.log("Login Response:", response.data);

            // Store user data and token in localStorage
            localStorage.setItem('user', JSON.stringify(response.data.data));
            localStorage.setItem('userType', formData.userType);
            if (response.data.token) localStorage.setItem('token', response.data.token);

            alert(`Login Successful! Welcome back ${response.data.data.email}`);

            // Navigate to appropriate dashboard based on user type
            if (formData.userType === 'customer') {
                navigate('/customer-dashboard');
            } else {
                // Check if profile is complete for tailors
                if (!response.data.data.isProfileComplete) {
                    navigate('/profile-setup');
                } else {
                    navigate('/tailor-dashboard');
                }
            }

        } catch (error: any) {
            console.error("Login Error:", error);
            const errorMessage = error.response?.data?.message || "Login failed. Please try again.";
            alert(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container">
            {/* Left Side - Animation Scene */}
            <div className="animation-side">
                <div className="bg-pattern"></div>
                <div className="decorative-circle circle-1"></div>
                <div className="decorative-circle circle-2"></div>

                <div className="brand-section">
                    <div className="brand-text">TailorConnect</div>
                    <div className="tagline">Crafted with Care</div>
                </div>

                <div className="tailor-workspace">
                    {/* Cartoon Uncle Tailor */}
                    <div className="tailor-uncle">
                        <div className="uncle-head">
                            <div className="uncle-hair">
                                <div className="bald-spot"></div>
                            </div>
                            <div className="eye eye-left"></div>
                            <div className="eye eye-right"></div>
                            <div className="glasses">
                                <div className="glasses-bridge"></div>
                            </div>
                            <div className="mustache"></div>
                            <div className="smile"></div>
                        </div>
                        <div className="uncle-body">
                            <div className="apron-strap apron-strap-left"></div>
                            <div className="apron-strap apron-strap-right"></div>
                            <div className="apron-pocket"></div>
                            <div className="uncle-arm arm-left"></div>
                            <div className="uncle-arm arm-right"></div>
                        </div>
                        <div className="hand hand-left"></div>
                        <div className="hand hand-right"></div>
                        <div className="needle"></div>
                        <div className="thread-line"></div>
                    </div>

                    {/* Fabric being sewn */}
                    <div className="fabric-work">
                        <div className="fabric-pattern"></div>
                    </div>

                    {/* Sewing machine on table */}
                    <div className="sewing-machine-small">
                        <div className="machine-top"></div>
                        <div className="machine-base"></div>
                    </div>

                    {/* Workbench */}
                    <div className="workbench"></div>

                    {/* Floating tools */}
                    <div className="floating-tool tool-scissors">✂️</div>
                    <div className="floating-tool tool-thread">🧵</div>
                    <div className="floating-tool tool-button">🔘</div>
                    <div className="floating-tool tool-ruler">📏</div>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="form-side">
                <div className="login-form-card">
                    <div className="form-header">
                        <h1>Welcome Back</h1>
                        <p className="welcome-tagline">Continue your journey with us</p>
                    </div>

                    <form onSubmit={handleSubmit} noValidate>
                        <div className="form-group">
                            <label htmlFor="email">Email Address</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                placeholder="your.email@example.com"
                                value={formData.email}
                                onChange={handleChange}
                                className={errors.email ? 'input-error' : ''}
                                required
                            />
                            {errors.email && <span className="error-message">{errors.email}</span>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <div className="password-input-wrapper">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    name="password"
                                    placeholder="Enter your password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className={errors.password ? 'input-error' : ''}
                                    required
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowPassword(!showPassword)}
                                    aria-label="Toggle password visibility"
                                >
                                    {showPassword ? (
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                                            <line x1="1" y1="1" x2="23" y2="23" />
                                        </svg>
                                    ) : (
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                            <circle cx="12" cy="12" r="3" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                            {errors.password && <span className="error-message">{errors.password}</span>}
                        </div>

                        {/* Role Selection Cards */}
                        <div className="role-selection">
                            <label className="role-label">User Type:</label>
                            <div className="role-cards-container">
                                <div
                                    className={`role-option ${formData.userType === 'customer' ? 'active' : ''}`}
                                    onClick={() => setFormData({ ...formData, userType: 'customer' })}
                                >
                                    <span className="icon">👤</span>
                                    <div className="label">Customer</div>
                                </div>
                                <div
                                    className={`role-option ${formData.userType === 'tailor' ? 'active' : ''}`}
                                    onClick={() => setFormData({ ...formData, userType: 'tailor' })}
                                >
                                    <span className="icon">✂️</span>
                                    <div className="label">Tailor</div>
                                </div>
                            </div>
                        </div>

                        <div className="forgot-password">
                            <a href="#">Forgot your password?</a>
                        </div>

                        <button
                            type="submit"
                            className={`submit-btn ${isLoading ? 'loading' : ''}`}
                            disabled={isLoading}
                        >
                            {isLoading ? '' : 'Sign In'}
                        </button>

                        <div className="divider">
                            <span>OR</span>
                        </div>

                        <button type="button" className="google-signup-btn">
                            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4" />
                                <path d="M9.003 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.96v2.332C2.44 15.983 5.485 18 9.003 18z" fill="#34A853" />
                                <path d="M3.964 10.712c-.18-.54-.282-1.117-.282-1.71 0-.593.102-1.17.282-1.71V4.96H.957C.347 6.175 0 7.55 0 9.002c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05" />
                                <path d="M9.003 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.464.891 11.426 0 9.003 0 5.485 0 2.44 2.017.96 4.958L3.967 7.29c.708-2.127 2.692-3.71 5.033-3.71z" fill="#EA4335" />
                            </svg>
                            Sign in with Google
                        </button>

                        <div className="account-link">
                            New to TailorConnect? <Link to="/signup">Create an account</Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
