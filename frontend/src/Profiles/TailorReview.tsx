import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../styles/tailorReview.css';

const TailorReview: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // Tailor info comes from navigation state (from profile page)
    const tailorEmailFromState = location.state?.tailorEmail || '';
    const tailorNameFromState = location.state?.tailorName || '';

    // Customer info from JWT login (stored in localStorage)
    const storedUser = localStorage.getItem('user');
    const user = storedUser ? JSON.parse(storedUser) : null;
    const customerName = user?.name || 'Guest User';
    const customerPhone = user?.contactNo || '';

    const [tailorName] = useState(tailorNameFromState);
    const [tailorEmail] = useState(tailorEmailFromState);
    const [customerMobile, setCustomerMobile] = useState(customerPhone);
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [review, setReview] = useState('');
    const [serviceType, setServiceType] = useState('');
    const [recommend, setRecommend] = useState<boolean | null>(null);
    const [selectedPhotos, setSelectedPhotos] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState('');

    // Validate customer mobile
    const isMobileValid = /^[6-9]\d{9}$/.test(customerMobile);

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            setSelectedPhotos(prev => [...prev, ...files]);
            const newPreviews = files.map(file => URL.createObjectURL(file));
            setPreviews(prev => [...prev, ...newPreviews]);
        }
    };

    const removePhoto = (index: number) => {
        setSelectedPhotos(prev => prev.filter((_, i) => i !== index));
        setPreviews(prev => prev.filter((_, i) => i !== index));
    };

    const handlePublish = async () => {
        if (!tailorEmail || rating === 0 || !review.trim() || !isMobileValid) return;

        setIsSubmitting(true);
        setError('');

        try {
            const token = localStorage.getItem('token');

            const formData = new FormData();
            formData.append('tailorEmail', tailorEmail);
            formData.append('rating', rating.toString());
            formData.append('comment', review);
            formData.append('mobileNumber', customerMobile);
            formData.append('customerName', customerName);
            formData.append('serviceType', serviceType);
            if (recommend !== null) formData.append('recommend', recommend.toString());

            selectedPhotos.forEach((photo, index) => {
                formData.append(`photo_${index}`, photo);
            });

            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/add-review`, {
                method: 'POST',
                headers: token ? { 'Authorization': `Bearer ${token}` } : {},
                body: formData
            });

            const data = await response.json();
            if (data.status) {
                setIsSuccess(true);
            } else {
                setError(data.msg || "Failed to publish review.");
            }
        } catch (err) {
            setError("Something went wrong. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const getRatingLabel = (r: number) => {
        if (r === 1) return 'Poor';
        if (r === 2) return 'Fair';
        if (r === 3) return 'Good';
        if (r === 4) return 'Very Good';
        if (r === 5) return 'Excellent';
        return 'Select Rating';
    };

    // If no tailor info was passed, show fallback
    if (!tailorEmail) {
        return (
            <div className="review-page">
                <div className="review-container">
                    <div className="review-card" style={{ textAlign: 'center', padding: '60px 40px' }}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>✂️</div>
                        <h2 className="review-title">No Tailor Selected</h2>
                        <p style={{ color: '#8B6F47', marginBottom: '24px' }}>
                            Please select a tailor from the dashboard first to write a review.
                        </p>
                        <button className="btn-publish" onClick={() => navigate('/customer-dashboard')}>
                            Go to Dashboard
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="review-page">
            <div className="floating-element tool-1">✂️</div>
            <div className="floating-element tool-2">🧵</div>
            <div className="floating-element tool-3">🧥</div>
            <div className="floating-element tool-4">🪡</div>
            <div className="floating-element tool-5">📏</div>
            <div className="floating-element tool-6">🎀</div>

            <div className="review-container">
                {isSuccess ? (
                    <div className="review-card success-state">
                        <div className="success-icon-wrap">
                            <span>🎉</span>
                        </div>
                        <h2 className="review-title">Review Published!</h2>
                        <p className="review-subtitle" style={{ textTransform: 'none', marginBottom: '8px', opacity: 1, color: '#C9A66B' }}>
                            Thank you for reviewing <strong>{tailorName}</strong>
                        </p>
                        <div className="star-rating" style={{ marginBottom: '20px' }}>
                            {[1, 2, 3, 4, 5].map(star => (
                                <span key={star} className={`star ${star <= rating ? 'active' : ''}`}>★</span>
                            ))}
                        </div>
                        <p className="success-quote">"{review}"</p>
                        <button className="btn-another" onClick={() => navigate('/customer-dashboard')}>BACK TO DASHBOARD</button>
                    </div>
                ) : (
                    <div className="review-card">
                        <div className="review-header">
                            <span className="review-icon">✂️</span>
                            <h1 className="review-title">Tailor Review</h1>
                            <p className="review-subtitle">SHARE YOUR EXPERIENCE</p>
                        </div>

                        <div className="review-form">
                            {/* Tailor Info (read-only, from navigation state) */}
                            <div className="review-form-group">
                                <label className="review-label">REVIEWING TAILOR</label>
                                <div className="tailor-lookup-result" style={{ marginTop: '0' }}>
                                    <div className="tailor-info">
                                        <div className="tailor-name">{tailorName}</div>
                                        <div style={{ fontSize: '12px', color: '#999', marginTop: '2px' }}>{tailorEmail}</div>
                                    </div>
                                    <span className="verified-badge">✓ Selected</span>
                                </div>
                            </div>

                            {/* Logged-in customer info */}
                            <div className="review-form-group">
                                <label className="review-label">REVIEWING AS</label>
                                <div style={{
                                    padding: '12px 16px', background: 'rgba(139,111,71,0.06)',
                                    borderRadius: '10px', fontSize: '15px', color: '#4A3728', fontWeight: 600,
                                }}>
                                    👤 {customerName}
                                </div>
                            </div>

                            {/* Customer's mobile number (validated) */}
                            <div className="review-form-group">
                                <label className="review-label">YOUR MOBILE NUMBER</label>
                                <input
                                    type="tel"
                                    className="review-input"
                                    placeholder="Enter your 10-digit mobile number"
                                    value={customerMobile}
                                    onChange={(e) => setCustomerMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                />
                                {customerMobile.length > 0 && !isMobileValid && (
                                    <p className="error-message" style={{ marginTop: '6px' }}>
                                        Please enter a valid 10-digit Indian mobile number (starts with 6-9)
                                    </p>
                                )}
                                {isMobileValid && (
                                    <p style={{ color: '#1e7e34', fontSize: '12px', fontWeight: 600, marginTop: '6px' }}>✓ Valid mobile number</p>
                                )}
                            </div>

                            {/* Review fields — always visible since tailor is pre-selected */}
                            <div className="additional-fields animate-fade-in">
                                <div className="review-form-group">
                                    <label className="review-label" style={{ textAlign: 'center' }}>RATE YOUR EXPERIENCE</label>
                                    <div className="star-rating">
                                        {[1, 2, 3, 4, 5].map(star => (
                                            <span
                                                key={star}
                                                className={`star ${star <= (hoverRating || rating) ? 'active' : ''}`}
                                                onMouseEnter={() => setHoverRating(star)}
                                                onMouseLeave={() => setHoverRating(0)}
                                                onClick={() => setRating(star)}
                                            >
                                                ★
                                            </span>
                                        ))}
                                    </div>
                                    <p className="rating-text">
                                        {getRatingLabel(hoverRating || rating)}
                                    </p>
                                </div>

                                <div className="review-form-group">
                                    <label className="review-label">SERVICE TYPE</label>
                                    <div className="service-selector">
                                        {['Custom Stitching', 'Alterations', 'Repair', 'Bridal Wear', 'Design Consultation', 'Other'].map(type => (
                                            <div
                                                key={type}
                                                className={`service-option ${serviceType === type ? 'selected' : ''}`}
                                                onClick={() => setServiceType(type)}
                                            >
                                                {type}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="review-form-group">
                                    <label className="review-label">WRITE YOUR REVIEW</label>
                                    <textarea
                                        className="review-textarea"
                                        rows={4}
                                        placeholder="Share your experience with this tailor..."
                                        value={review}
                                        onChange={(e) => setReview(e.target.value.slice(0, 300))}
                                    ></textarea>
                                    <div className="char-counter">{review.length} / 300 characters</div>
                                </div>

                                <div className="review-form-group">
                                    <label className="review-label">ADD PHOTOS (OPTIONAL)</label>
                                    <label className="upload-area">
                                        <input type="file" multiple accept="image/*" onChange={handlePhotoChange} style={{ display: 'none' }} />
                                        <div className="upload-icon">📷</div>
                                        <div className="upload-text">Drag or click to upload project photos</div>
                                    </label>
                                    {previews.length > 0 && (
                                        <div className="photo-preview">
                                            {previews.map((src, i) => (
                                                <div key={i} className="preview-it">
                                                    <img src={src} alt="Preview" />
                                                    <button onClick={(e) => { e.preventDefault(); removePhoto(i); }}>×</button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="review-form-group">
                                    <label className="review-label">WOULD YOU RECOMMEND?</label>
                                    <div style={{ display: 'flex', gap: '12px' }}>
                                        <button
                                            className={`recommend-btn ${recommend === true ? 'selected' : ''}`}
                                            onClick={() => setRecommend(true)}
                                        >
                                            👍 YES
                                        </button>
                                        <button
                                            className={`recommend-btn ${recommend === false ? 'selected' : ''}`}
                                            onClick={() => setRecommend(false)}
                                        >
                                            👎 NO
                                        </button>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    className="btn-publish"
                                    disabled={rating === 0 || !review.trim() || !isMobileValid || isSubmitting}
                                    onClick={handlePublish}
                                >
                                    {isSubmitting ? 'PUBLISHING...' : 'PUBLISH REVIEW'}
                                </button>

                                {error && (
                                    <p className="error-text">{error}</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TailorReview;
