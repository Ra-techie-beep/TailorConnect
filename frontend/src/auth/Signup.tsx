import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/auth.css';
import axios from 'axios';

interface SignupFormData {
    name: string;
    email: string;
    contactNo: string;
    password: string;
    confirmPassword: string;
    agreeToTerms: boolean;
    userType: 'customer' | 'tailor';
    error: { [key: string]: string };
}

const Signup: React.FC = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState<SignupFormData>({
        name: '',
        email: '',
        contactNo: '',
        password: '',
        confirmPassword: '',
        agreeToTerms: false,
        userType: 'customer', // Default role
        error: {}
    });

    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;

        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
            // Clear error for this field when user types
            error: {
                ...prev.error,
                [name]: ''
            }
        }));
    };

    const selectRole = (role: 'customer' | 'tailor') => {
        setFormData(prev => ({
            ...prev,
            userType: role
        }));
    };

    const validate = (): boolean => {
        const newError: { [key: string]: string } = {};

        // Name validation
        if (!formData.name.trim()) {
            newError.name = 'Full Name is required';
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email) {
            newError.email = 'Email is required';
        } else if (!emailRegex.test(formData.email)) {
            newError.email = 'Please enter a valid email address';
        }

        // Password validation
        if (!formData.password) {
            newError.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newError.password = 'Password must be at least 6 characters';
        }

        // Confirm Password validation
        if (formData.password !== formData.confirmPassword) {
            newError.confirmPassword = 'Passwords do not match';
        }

        // Contact Number validation
        const phoneRegex = /^[0-9+ -]{10,15}$/;
        if (!formData.contactNo) {
            newError.contactNo = 'Contact number is required';
        } else if (!phoneRegex.test(formData.contactNo)) {
            newError.contactNo = 'Enter a valid contact number (10-15 digits)';
        }

        // Terms validation
        if (!formData.agreeToTerms) {
            newError.agreeToTerms = 'You must agree to the Terms and Privacy Policy';
        }

        setFormData(prev => ({ ...prev, error: newError }));
        return Object.keys(newError).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (validate()) {
            userSignup();
        }
    };

    const userSignup = async () => {
        setIsLoading(true);

        // Remove confirmPassword and error from data sent to backend
        const { confirmPassword, error, ...signupData } = formData;

        console.log(signupData);
        try {
            const url = `${import.meta.env.VITE_API_BASE_URL}/registerUser`;

            const response = await axios.post(url, signupData, { headers: { "Content-Type": "application/x-www-form-urlencoded", 'Authorization': `Bearer ${localStorage.getItem('token')}` } });

            console.log("Registration Response:", response.data);

            if (response.data.status) {
                // Store user data and token in localStorage
                localStorage.setItem('user', JSON.stringify(response.data.doc));
                localStorage.setItem('userType', formData.userType);
                if (response.data.token) localStorage.setItem('token', response.data.token);

                alert("User Registered Successfully! 🎉");

                // Navigate to appropriate dashboard based on user type
                if (formData.userType === 'customer') {
                    navigate('/customer-dashboard');
                } else {
                    navigate('/tailor-profile');
                }
            } else {
                alert("Registration Failed: " + (response.data.msg || "Unknown error occurred."));
            }
        } catch (error: any) {
            console.error("Signup Error:", error);
            const errorMessage = error.response?.data?.msg || error.message || "Registration failed. Please try again.";
            alert("Registration Failed: " + errorMessage);
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

            {/* Right Side - Form */}
            <div className="form-side">
                <div className="form-card">
                    <div className="form-header">
                        <h1>Create Account</h1>
                        <p className="signup-tagline">Begin your tailoring journey</p>
                    </div>

                    <form onSubmit={handleSubmit} noValidate>
                        <div className="form-group">
                            <label htmlFor="name">Full Name</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                placeholder="Your full name"
                                value={formData.name}
                                onChange={handleChange}
                                className={formData.error.name ? 'input-error' : ''}
                                required
                            />
                            {formData.error.name && <span className="error-message">{formData.error.name}</span>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="email">Email Address</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                placeholder="your.email@example.com"
                                value={formData.email}
                                onChange={handleChange}
                                className={formData.error.email ? 'input-error' : ''}
                                required
                            />
                            {formData.error.email && <span className="error-message">{formData.error.email}</span>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <div className="password-input-wrapper">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    name="password"
                                    placeholder="Create a strong password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className={formData.error.password ? 'input-error' : ''}
                                    required
                                    minLength={6}
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
                            {formData.password && (
                                <div className={`password-strength-container strength-${(() => {
                                    const pass = formData.password;
                                    let score = 0;
                                    if (pass.length >= 6) score++;
                                    if (/[A-Z]/.test(pass)) score++; // uppercase
                                    if (/[0-9]/.test(pass)) score++; // number
                                    if (/[^A-Za-z0-9]/.test(pass)) score++; // special char

                                    if (pass.length < 6) return 'weak';
                                    if (score < 2) return 'weak';
                                    if (score === 2) return 'medium';
                                    return 'strong';
                                })()
                                    }`}>
                                    <div className="strength-bars">
                                        <div className="strength-bar"></div>
                                        <div className="strength-bar"></div>
                                        <div className="strength-bar"></div>
                                    </div>
                                    <div className="strength-text">
                                        {(() => {
                                            const pass = formData.password;
                                            let score = 0;
                                            if (pass.length >= 6) score++;
                                            if (/[A-Z]/.test(pass)) score++;
                                            if (/[0-9]/.test(pass)) score++;
                                            if (/[^A-Za-z0-9]/.test(pass)) score++;

                                            if (pass.length < 6) return 'Weak';
                                            if (score < 2) return 'Weak';
                                            if (score === 2) return 'Medium';
                                            return 'Strong';
                                        })()}
                                    </div>
                                </div>
                            )}
                            {formData.error.password && <span className="error-message">{formData.error.password}</span>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="confirmPassword">Confirm Password</label>
                            <div className="password-input-wrapper">
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    placeholder="Re-enter your password"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className={formData.error.confirmPassword ? 'input-error' : ''}
                                    required
                                    minLength={8}
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    aria-label="Toggle confirm password visibility"
                                >
                                    {showConfirmPassword ? (
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
                            {formData.error.confirmPassword && <span className="error-message">{formData.error.confirmPassword}</span>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="contactNo">Contact Number</label>
                            <input
                                type="tel"
                                id="contactNo"
                                name="contactNo"
                                placeholder="+91 98765 43210"
                                value={formData.contactNo}
                                onChange={handleChange}
                                className={formData.error.contactNo ? 'input-error' : ''}
                                required
                                pattern="[0-9 +\-]+"
                            />
                            {formData.error.contactNo && <span className="error-message">{formData.error.contactNo}</span>}
                        </div>

                        {/* Role Selection Cards */}
                        <div className="role-selection">
                            <div
                                className={`role-option ${formData.userType === 'customer' ? 'active' : ''}`}
                                onClick={() => selectRole('customer')}
                            >
                                <span className="icon">👤</span>
                                <div className="label">Customer</div>
                                <div className="role-desc">Find tailors and get custom clothing</div>
                            </div>
                            <div
                                className={`role-option ${formData.userType === 'tailor' ? 'active' : ''}`}
                                onClick={() => selectRole('tailor')}
                            >
                                <span className="icon">✂️</span>
                                <div className="label">Tailor</div>
                                <div className="role-desc">Offer services and manage orders</div>
                            </div>
                        </div>

                        {/* Terms and Conditions Checkbox */}
                        <div className="terms-checkbox">
                            <label>
                                <input
                                    type="checkbox"
                                    name="agreeToTerms"
                                    checked={formData.agreeToTerms}
                                    onChange={handleChange}
                                    required
                                />
                                <span>I agree to TailorConnect's <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a></span>
                            </label>
                            {formData.error.agreeToTerms && <span className="error-message" style={{ display: 'block', marginLeft: '28px' }}>{formData.error.agreeToTerms}</span>}
                        </div>

                        <button
                            type="submit"
                            className={`submit-btn ${isLoading ? 'loading' : ''}`}
                            disabled={isLoading}
                        >
                            {isLoading ? '' : 'Create Account'}
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
                            Sign up with Google
                        </button>

                        <div className="account-link">
                            Already have an account? <Link to="/login">Sign in</Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Signup;
