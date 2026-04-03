import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/customerProfile.css';

interface UserMeasurements {
    chest: string;
    waist: string;
    shoulderWidth: string;
    sleeveLength: string;
    neck: string;
    inseam: string;
    hip: string;
    lastUpdated?: string;
}

interface UserData {
    name: string;
    email: string;
    contactNo: string;
    dos: string;
    measurements?: UserMeasurements;
    userType: string;
}

const CustomerProfile: React.FC = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');
    const [indicatorStyle, setIndicatorStyle] = useState({ left: 10, width: 0 });
    const tabsRef = useRef<(HTMLButtonElement | null)[]>([]);
    
    // Core data states
    const [user, setUser] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    
    // Form state for editing
    const [formData, setFormData] = useState({
        name: '',
        contactNo: '',
        chest: '',
        waist: '',
        shoulderWidth: '',
        sleeveLength: '',
        neck: '',
        inseam: '',
        hip: ''
    });

    const tabs = [
        { id: 'overview', label: 'Overview' },
        { id: 'orders', label: 'Order History' },
        { id: 'measurements', label: 'Measurements' },
        { id: 'addresses', label: 'Addresses' },
        { id: 'preferences', label: 'Preferences' }
    ];

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/profile`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();

            if (data.status) {
                setUser(data.user);
                // Update local storage in case it was stale
                localStorage.setItem('user', JSON.stringify(data.user));
                
                // Initialize form data
                setFormData({
                    name: data.user.name || '',
                    contactNo: data.user.contactNo || '',
                    chest: data.user.measurements?.chest || '',
                    waist: data.user.measurements?.waist || '',
                    shoulderWidth: data.user.measurements?.shoulderWidth || '',
                    sleeveLength: data.user.measurements?.sleeveLength || '',
                    neck: data.user.measurements?.neck || '',
                    inseam: data.user.measurements?.inseam || '',
                    hip: data.user.measurements?.hip || ''
                });
            } else {
                setError(data.message || 'Failed to load profile');
            }
        } catch (err) {
            setError('Error connecting to server');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateProfile = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setIsUpdating(true);
        setError('');

        try {
            const token = localStorage.getItem('token');
            const updatePayload = {
                name: formData.name,
                contactNo: formData.contactNo,
                measurements: {
                    chest: formData.chest,
                    waist: formData.waist,
                    shoulderWidth: formData.shoulderWidth,
                    sleeveLength: formData.sleeveLength,
                    neck: formData.neck,
                    inseam: formData.inseam,
                    hip: formData.hip,
                    lastUpdated: new Date().toISOString()
                }
            };

            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updatePayload)
            });

            const data = await response.json();
            if (data.status) {
                setUser(data.user);
                localStorage.setItem('user', JSON.stringify(data.user));
                setIsEditing(false);
                // Show a brief success message or just let UI update
            } else {
                setError(data.message || 'Update failed');
            }
        } catch (err) {
            setError('Network error during update');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleLogout = () => {
        if (window.confirm('Are you sure you want to logout?')) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('userType');
            localStorage.removeItem('tailorFavorites');
            navigate('/login');
        }
    };

    const handleTabClick = (tabId: string, index: number) => {
        setActiveTab(tabId);
        const tabElement = tabsRef.current[index];
        if (tabElement) {
            setIndicatorStyle({
                left: tabElement.offsetLeft,
                width: tabElement.offsetWidth
            });
        }
    };

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return 'N/A';
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric'
        });
    };

    // Initialize data and indicator on mount
    useEffect(() => {
        fetchProfile();
    }, []);

    useEffect(() => {
        const activeIndex = tabs.findIndex(tab => tab.id === activeTab);
        if (activeIndex !== -1 && tabsRef.current[activeIndex]) {
            const tabElement = tabsRef.current[activeIndex];
            setIndicatorStyle({
                left: tabElement?.offsetLeft || 10,
                width: tabElement?.offsetWidth || 0
            });
        }
    }, [activeTab]);

    if (loading) return <div className="loading-screen">Loading your style profile...</div>;

    return (
        <div className="customer-profile-page">
            {/* Header */}
            <header className="header">
                <div className="header-content">
                    <a href="#" className="logo" onClick={() => navigate('/customer-dashboard')}>TailorConnect</a>
                    <div className="header-actions">
                        <button className="btn-secondary" onClick={() => navigate('/customer-dashboard')}>Find Tailors</button>
                        <button className="btn-secondary logout-btn" onClick={handleLogout}>Logout</button>
                    </div>
                </div>
            </header>

            {/* Main Container */}
            <div className="container">
                {/* Profile Header */}
                <div className="profile-header">
                    <div className="profile-avatar">
                        <div className="avatar">{user ? getInitials(user.name) : '??'}</div>
                        <div className="avatar-badge">✓</div>
                    </div>
                    <div className="profile-info">
                        <h1 className="profile-name">{user?.name || 'Customer'}</h1>
                        <p className="profile-email">{user?.email}</p>
                        <div className="profile-stats">
                            <div className="stat-item">
                                <span className="stat-value">0</span>
                                <span className="stat-label">Orders</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-value">0</span>
                                <span className="stat-label">Reviews</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-value">
                                    {JSON.parse(localStorage.getItem('tailorFavorites') || '[]').length}
                                </span>
                                <span className="stat-label">Favorites</span>
                            </div>
                        </div>
                    </div>
                    <div className="profile-actions">
                        <button 
                            className={`btn-primary ${isEditing ? 'saving' : ''}`}
                            onClick={() => isEditing ? handleUpdateProfile() : setIsEditing(true)}
                            disabled={isUpdating}
                        >
                            {isEditing ? (isUpdating ? 'Saving...' : 'Save Changes') : 'Edit Profile'}
                        </button>
                        {isEditing && (
                            <button className="btn-outline" onClick={() => {
                                setIsEditing(false);
                                // Revert form data
                                if (user) {
                                    setFormData({
                                        name: user.name || '',
                                        contactNo: user.contactNo || '',
                                        chest: user.measurements?.chest || '',
                                        waist: user.measurements?.waist || '',
                                        shoulderWidth: user.measurements?.shoulderWidth || '',
                                        sleeveLength: user.measurements?.sleeveLength || '',
                                        neck: user.measurements?.neck || '',
                                        inseam: user.measurements?.inseam || '',
                                        hip: user.measurements?.hip || ''
                                    });
                                }
                            }}>Cancel</button>
                        )}
                    </div>
                </div>

                {/* Tabs with Indicator */}
                <div className="tabs">
                    <div
                        className="tab-indicator"
                        style={{ left: `${indicatorStyle.left}px`, width: `${indicatorStyle.width}px` }}
                    ></div>
                    {tabs.map((tab, index) => (
                        <button
                            key={tab.id}
                            ref={el => { tabsRef.current[index] = el; }}
                            className={`tab ${activeTab === tab.id ? 'active' : ''}`}
                            onClick={() => handleTabClick(tab.id, index)}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab Contents */}
                <div className="tab-contents">
                    {/* Overview Tab */}
                    {activeTab === 'overview' && (
                        <div className="tab-content fade-in">
                            <div className="grid">
                                {/* Personal Information */}
                                <div className="card">
                                    <div className="card-header">
                                        <h3 className="card-title">Personal Information</h3>
                                        <span className="card-icon">👤</span>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Full Name</label>
                                        <input 
                                            type="text" 
                                            className={`form-input ${isEditing ? 'editable' : ''}`} 
                                            value={formData.name}
                                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                                            disabled={!isEditing} 
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Email Address</label>
                                        <input type="email" className="form-input" value={user?.email || ''} disabled />
                                        <span className="input-hint">Email cannot be changed</span>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Phone Number</label>
                                        <input 
                                            type="tel" 
                                            className={`form-input ${isEditing ? 'editable' : ''}`} 
                                            value={formData.contactNo}
                                            onChange={(e) => setFormData({...formData, contactNo: e.target.value})}
                                            disabled={!isEditing} 
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Member Since</label>
                                        <input type="text" className="form-input" value={formatDate(user?.dos)} disabled />
                                    </div>
                                </div>

                                {/* Measurements Summary */}
                                <div className="card">
                                    <div className="card-header">
                                        <h3 className="card-title">My Measurements</h3>
                                        <span className="card-icon">📏</span>
                                    </div>
                                    {user?.measurements ? (
                                        <div className="measurement-summary-grid">
                                            <div className="m-item">
                                                <span className="m-label">Chest</span>
                                                <span className="m-val">{user.measurements.chest || '--'}"</span>
                                            </div>
                                            <div className="m-item">
                                                <span className="m-label">Waist</span>
                                                <span className="m-val">{user.measurements.waist || '--'}"</span>
                                            </div>
                                            <div className="m-item">
                                                <span className="m-label">Hip</span>
                                                <span className="m-val">{user.measurements.hip || '--'}"</span>
                                            </div>
                                            <div className="m-item">
                                                <span className="m-label">Shoulder</span>
                                                <span className="m-val">{user.measurements.shoulderWidth || '--'}"</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="no-data-msg">No measurements added yet.</p>
                                    )}
                                    <button className="btn-text" onClick={() => setActiveTab('measurements')}>Manage Measurements →</button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Measurements Tab */}
                    {activeTab === 'measurements' && (
                        <div className="tab-content fade-in">
                            <div className="card">
                                <div className="card-header">
                                    <h3 className="card-title">Body Measurements (inches)</h3>
                                    <button className="btn-primary" onClick={() => setIsEditing(true)}>
                                        {isEditing ? 'Update Mode Active' : 'Update Metrics'}
                                    </button>
                                </div>
                                <div className="measurements-edit-grid">
                                    {[
                                        { key: 'chest', label: 'Chest' },
                                        { key: 'waist', label: 'Waist' },
                                        { key: 'shoulderWidth', label: 'Shoulder Width' },
                                        { key: 'sleeveLength', label: 'Sleeve Length' },
                                        { key: 'neck', label: 'Neck' },
                                        { key: 'inseam', label: 'Inseam' },
                                        { key: 'hip', label: 'Hip' },
                                    ].map((field) => (
                                        <div className="m-form-group" key={field.key}>
                                            <label>{field.label}</label>
                                            <input 
                                                type="text" 
                                                value={(formData as any)[field.key]}
                                                placeholder="--"
                                                onChange={(e) => setFormData({...formData, [field.key]: e.target.value})}
                                                disabled={!isEditing}
                                            />
                                        </div>
                                    ))}
                                </div>
                                {isEditing && (
                                    <div className="save-footer">
                                        <button className="btn-primary" onClick={handleUpdateProfile} disabled={isUpdating}>
                                            {isUpdating ? 'Saving...' : 'Save All Measurements'}
                                        </button>
                                    </div>
                                )}
                                {user?.measurements?.lastUpdated && (
                                    <p className="last-updated">Last updated: {new Date(user.measurements.lastUpdated).toLocaleDateString()}</p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Other Tabs remain as placeholders for now with dynamic user context */}
                    {['orders', 'addresses', 'preferences'].includes(activeTab) && (
                        <div className="tab-content fade-in">
                            <div className="card empty-state">
                                <h3>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Coming Soon</h3>
                                <p>We're working on making your {activeTab} information dynamic. Stay tuned!</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            
            {error && (
                <div className="floating-error">
                    {error}
                    <button onClick={() => setError('')}>×</button>
                </div>
            )}
        </div>
    );
};

export default CustomerProfile;