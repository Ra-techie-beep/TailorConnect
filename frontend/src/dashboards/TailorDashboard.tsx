import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/dashboards.css';

const TailorDashboard: React.FC = () => {
    const navigate = useNavigate();

    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const handleLogout = () => {
        if (window.confirm('Are you sure you want to logout?')) {
            localStorage.removeItem('user');
            localStorage.removeItem('userType');
            navigate('/login');
        }
    };

    const stats = [
        { label: 'Total Orders', value: '48', icon: '📦', trend: '+12%', trendType: 'positive' },
        { label: 'Pending', value: '8', icon: '⏳', trend: '3 New', trendType: 'neutral' },
        { label: 'Completed', value: '40', icon: '✅', trend: '+5', trendType: 'positive' },
        { label: 'Revenue', value: '$12,450', icon: '💰', trend: '+18%', trendType: 'positive' }
    ];

    const pendingOrders = [
        {
            id: '#ORD-2024-0045',
            customer: 'Sarah Johnson',
            service: 'Wedding Dress Alteration',
            deadline: 'Feb 18, 2024',
            priority: 'high',
            status: 'in-progress'
        },
        {
            id: '#ORD-2024-0044',
            customer: 'Michael Chen',
            service: 'Suit Tailoring',
            deadline: 'Feb 20, 2024',
            priority: 'medium',
            status: 'pending'
        },
        {
            id: '#ORD-2024-0043',
            customer: 'Emma Davis',
            service: 'Pants Hemming',
            deadline: 'Feb 15, 2024',
            priority: 'low',
            status: 'in-progress'
        },
        {
            id: '#ORD-2024-0042',
            customer: 'Olivia Wilson',
            service: 'Custom Blouse',
            deadline: 'Feb 22, 2024',
            priority: 'medium',
            status: 'pending'
        }
    ];

    const recentReviews = [
        {
            id: 1,
            customer: 'John Doe',
            rating: 5,
            comment: 'Excellent work! Very professional and timely.',
            date: 'Feb 10, 2024'
        },
        {
            id: 2,
            customer: 'Alice Smith',
            rating: 4,
            comment: 'Great service, minor delay but quality was perfect.',
            date: 'Feb 8, 2024'
        }
    ];

    return (
        <div className="dashboard-page tailor-dashboard">
            {/* Header */}
            <header className="dashboard-header">
                <div className="header-content">
                    <a href="#" className="logo">TailorConnect</a>
                    <div className="header-right">
                        <div className="user-actions">
                            <button className="icon-btn" title="Notifications">
                                🔔
                                <span className="badge">3</span>
                            </button>
                            <button className="icon-btn" onClick={() => navigate('/tailor-profile')} title="Settings">
                                ⚙️
                            </button>
                            <button className="user-profile-btn" onClick={() => navigate('/tailor-profile')}>
                                <div className="user-avatar-small">{user?.name ? user.name.charAt(0).toUpperCase() : 'T'}</div>
                                <span className="user-name">{user?.name || 'Tailor'}</span>
                            </button>
                            <button className="btn-secondary" onClick={handleLogout} style={{ marginLeft: '10px' }}>
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="container">

                {/* Welcome Section */}
                <div className="welcome-section">
                    <div className="welcome-content">
                        <h1 className="welcome-title">Welcome back, {user?.shopName || user?.name || 'Master Tailor'}!</h1>
                        <p className="welcome-subtitle">{user?.email}</p>
                        <p className="welcome-subtitle">Here's what's happening in your shop today.</p>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="stats-grid">
                    {stats.map((stat, index) => (
                        <div key={index} className="stat-card-large">
                            <div className="stat-header">
                                <span className="stat-icon-large">{stat.icon}</span>
                                <span className={`stat-trend ${stat.trendType === 'positive' ? 'positive' : 'negative'}`}>
                                    {stat.trend}
                                </span>
                            </div>
                            <div className="stat-content">
                                <span className="stat-value-large">{stat.value}</span>
                                <span className="stat-label-large">{stat.label}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Dashboard Grid Layout */}
                <div className="dashboard-grid">

                    {/* Main Column - Orders */}
                    <div className="main-content">
                        <div className="section-header">
                            <h2 className="section-title">Recent Orders</h2>
                            <button className="btn-primary-small">+ New Order</button>
                        </div>

                        <div className="orders-list-container">
                            {/* Header Row */}
                            <div className="orders-grid-layout orders-list-header">
                                <span className="header-cell">Order ID</span>
                                <span className="header-cell">Customer</span>
                                <span className="header-cell">Service</span>
                                <span className="header-cell">Deadline</span>
                                <span className="header-cell">Priority</span>
                                <span className="header-cell">Status</span>
                                <span className="header-cell" style={{ textAlign: 'right' }}>Actions</span>
                            </div>

                            {/* Order Rows */}
                            {pendingOrders.map((order) => (
                                <div key={order.id} className="orders-grid-layout order-row">
                                    <div className="cell-id">{order.id}</div>
                                    <div className="cell-customer">
                                        <span role="img" aria-label="user">👤</span> {order.customer}
                                    </div>
                                    <div className="cell-service">{order.service}</div>
                                    <div className="cell-deadline">📅 {order.deadline}</div>
                                    <div>
                                        <span className={`status-badge priority-${order.priority}`}>
                                            {order.priority}
                                        </span>
                                    </div>
                                    <div>
                                        <span className={`status-badge status-${order.status}`}>
                                            {order.status === 'in-progress' ? 'In Progress' : 'Pending'}
                                        </span>
                                    </div>
                                    <div className="action-btn-group">
                                        <button className="btn-action-sm">View</button>
                                        <button className="btn-action-sm secondary">Update</button>
                                        <button className="btn-action-sm primary">Complete</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button className="btn-text-link">View All Orders →</button>
                    </div>

                    {/* Sidebar Column */}
                    <div className="sidebar">

                        {/* Quick Actions */}
                        <div className="sidebar-card">
                            <h3 className="sidebar-title">Quick Actions</h3>
                            <div className="quick-actions">
                                <button className="action-btn">
                                    <span className="action-icon">📊</span>
                                    <span className="action-text">Analytics</span>
                                </button>
                                <button className="action-btn">
                                    <span className="action-icon">💬</span>
                                    <span className="action-text">Messages</span>
                                </button>
                                <button className="action-btn">
                                    <span className="action-icon">📅</span>
                                    <span className="action-text">Calendar</span>
                                </button>
                                <button className="action-btn">
                                    <span className="action-icon">⚙️</span>
                                    <span className="action-text">Settings</span>
                                </button>
                            </div>
                        </div>

                        {/* Recent Reviews */}
                        <div className="sidebar-card">
                            <h3 className="sidebar-title">Recent Reviews</h3>
                            <div className="reviews-list">
                                {recentReviews.map((review) => (
                                    <div key={review.id} className="review-item">
                                        <div className="review-header">
                                            <span className="reviewer-name">{review.customer}</span>
                                            <span className="review-rating">
                                                {'⭐'.repeat(review.rating)}
                                            </span>
                                        </div>
                                        <p className="review-comment">"{review.comment}"</p>
                                        <span className="review-date">{review.date}</span>
                                    </div>
                                ))}
                            </div>
                            <button className="btn-text-link">All Reviews →</button>
                        </div>

                        {/* Business Hours */}
                        <div className="sidebar-card">
                            <h3 className="sidebar-title">Shop Hours</h3>
                            <div className="business-hours">
                                <div className="hours-item">
                                    <span className="day">Mon - Fri</span>
                                    <span className="time">9:00 AM - 6:00 PM</span>
                                </div>
                                <div className="hours-item">
                                    <span className="day">Saturday</span>
                                    <span className="time">10:00 AM - 4:00 PM</span>
                                </div>
                                <div className="hours-item">
                                    <span className="day">Sunday</span>
                                    <span className="time">Closed</span>
                                </div>
                            </div>
                            <button className="btn-text-link">Edit Hours →</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TailorDashboard;