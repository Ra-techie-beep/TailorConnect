import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const CustomerTailorView: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const tailor = location.state?.tailor;
    const [reviews, setReviews] = useState<any[]>([]);
    const [loadingReviews, setLoadingReviews] = useState(false);

    useEffect(() => {
        if (!tailor?.email) return;
        const fetchReviews = async () => {
            setLoadingReviews(true);
            try {
                const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/reviews/${encodeURIComponent(tailor.email)}`);
                const data = await res.json();
                if (data.status && data.reviews) setReviews(data.reviews);
            } catch (err) { console.error(err); }
            finally { setLoadingReviews(false); }
        };
        fetchReviews();
    }, [tailor?.email]);

    if (!tailor) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: '20px', fontFamily: "'Outfit', sans-serif", background: '#F5F1E8' }}>
                <h2 style={{ color: '#4A3728' }}>Tailor Profile Not Found</h2>
                <button onClick={() => navigate('/customer-dashboard')} style={btnStyle}>← Back to Dashboard</button>
            </div>
        );
    }

    const avgRating = reviews.length > 0
        ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
        : (tailor.rating || 5).toFixed(1);
    const totalReviews = reviews.length || tailor.reviews || 0;
    const recommendPct = reviews.length > 0
        ? Math.round((reviews.filter((r: any) => r.recommend).length / reviews.length) * 100) : 0;

    const stars = (n: number) => '★'.repeat(Math.round(n)) + '☆'.repeat(5 - Math.round(n));

    // Detail row helper
    const Row = ({ icon, label, value }: { icon: string; label: string; value: string | undefined }) =>
        value ? (
            <div style={{ display: 'flex', gap: '10px', padding: '10px 0', borderBottom: '1px solid #f0ece5' }}>
                <span style={{ fontSize: '18px', width: '28px', textAlign: 'center' }}>{icon}</span>
                <div>
                    <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: '#8B6F47', fontWeight: 700 }}>{label}</div>
                    <div style={{ fontSize: '15px', color: '#333', marginTop: '2px' }}>{value}</div>
                </div>
            </div>
        ) : null;

    return (
        <div style={{ background: '#F5F1E8', minHeight: '100vh', fontFamily: "'Outfit', sans-serif" }}>
            {/* Header */}
            <header style={{
                background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(139,111,71,0.12)',
                padding: '12px 32px', position: 'sticky', top: 0, zIndex: 100, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
                <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '22px', fontWeight: 800, color: '#4A3728' }}>TailorConnect</span>
                <button onClick={() => navigate('/customer-dashboard')} style={{
                    padding: '8px 20px', borderRadius: '8px', border: '2px solid #8B6F47', background: 'transparent',
                    color: '#8B6F47', fontWeight: 700, cursor: 'pointer', fontSize: '13px',
                }}>← Back</button>
            </header>

            {/* Content: Fixed-width centered container */}
            <div style={{ maxWidth: '900px', margin: '0 auto', padding: '28px 20px' }}>

                {/* ═══ HERO CARD ═══ */}
                <div style={{
                    background: 'white', borderRadius: '16px', padding: '32px', marginBottom: '20px',
                    boxShadow: '0 2px 12px rgba(74,55,40,0.06)', display: 'flex', gap: '28px', alignItems: 'center',
                }}>
                    {/* Avatar */}
                    <div style={{
                        width: '110px', height: '110px', borderRadius: '50%', flexShrink: 0,
                        background: tailor.gradient || 'linear-gradient(135deg, #D4896C, #C9A66B)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white', fontSize: '44px', fontWeight: 700, overflow: 'hidden',
                        boxShadow: '0 4px 16px rgba(74,55,40,0.15)',
                    }}>
                        {tailor.profileImage
                            ? <img src={tailor.profileImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            : tailor.name?.charAt(0)}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                        {/* Name + Verified badge */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '28px', fontWeight: 700, color: '#4A3728', margin: 0 }}>
                                {tailor.name}
                            </h1>
                            <span style={{
                                padding: '4px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 700,
                                background: tailor.verified ? '#e6f4ea' : '#fce8e6',
                                color: tailor.verified ? '#1e7e34' : '#c62828',
                                border: `1.5px solid ${tailor.verified ? '#1e7e3450' : '#c6282850'}`,
                            }}>
                                {tailor.verified ? '✓ Verified' : '✗ Unverified'}
                            </span>
                        </div>

                        <p style={{ fontSize: '15px', color: '#8B6F47', margin: '6px 0 14px' }}>{tailor.specialty}</p>

                        {/* Stat pills */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                            <Pill>⭐ {avgRating} ({totalReviews} reviews)</Pill>
                            {tailor.shopCity && <Pill>📍 {tailor.shopCity}</Pill>}
                            {tailor.experience && <Pill>🏆 {tailor.experience}</Pill>}
                            {tailor.since && <Pill>📅 Since {tailor.since}</Pill>}
                            {recommendPct > 0 && <Pill style={{ background: '#e6f4ea', color: '#1e7e34' }}>👍 {recommendPct}% recommend</Pill>}
                        </div>
                    </div>
                </div>

                {/* ═══ DETAILS TABLE — Two columns ═══ */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>

                    {/* LEFT: Professional Info */}
                    <div style={cardStyle}>
                        <h3 style={headingStyle}>🎯 Professional Details</h3>
                        <Row icon="👔" label="Category" value={tailor.category} />
                        <Row icon="💼" label="Work Type" value={tailor.workType} />
                        <Row icon="🕐" label="Operating Hours" value={tailor.operatingHours} />
                        <Row icon="💵" label="Starting Price" value={tailor.pricingStart ? `₹${tailor.pricingStart}` : undefined} />
                        <Row icon="🗣️" label="Languages" value={tailor.languages?.length > 0 ? tailor.languages.join(', ') : undefined} />
                        <Row icon="🚚" label="Home Delivery" value={tailor.homeDelivery ? 'Yes — Available' : undefined} />
                        {tailor.paymentMethods?.length > 0 && (
                            <div style={{ padding: '10px 0' }}>
                                <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: '#8B6F47', fontWeight: 700, marginBottom: '6px' }}>💳 Payment Methods</div>
                                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                    {tailor.paymentMethods.map((m: string, i: number) => (
                                        <span key={i} style={{ padding: '4px 12px', background: '#f5f1e8', borderRadius: '6px', fontSize: '13px', color: '#4A3728' }}>{m}</span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* RIGHT: Contact & Location */}
                    <div style={cardStyle}>
                        <h3 style={headingStyle}>📞 Contact & Location</h3>
                        <Row icon="📱" label="Phone" value={tailor.contactNo} />
                        <Row icon="✉️" label="Email" value={tailor.email} />
                        <Row icon="🏪" label="Shop Address" value={tailor.shopAddress} />
                        <Row icon="🏠" label="Address" value={tailor.address} />
                        <Row icon="🌆" label="City" value={tailor.shopCity} />

                        {/* Social links */}
                        {(tailor.socialWebsite || tailor.socialInsta || tailor.socialFb) && (
                            <div style={{ padding: '12px 0' }}>
                                <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: '#8B6F47', fontWeight: 700, marginBottom: '8px' }}>🌐 Social Links</div>
                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                    {tailor.socialWebsite && <a href={tailor.socialWebsite} target="_blank" rel="noopener noreferrer" style={socialBtn}>🌍 Website</a>}
                                    {tailor.socialInsta && <a href={tailor.socialInsta} target="_blank" rel="noopener noreferrer" style={{ ...socialBtn, background: '#E4405F' }}>📸 Instagram</a>}
                                    {tailor.socialFb && <a href={tailor.socialFb} target="_blank" rel="noopener noreferrer" style={{ ...socialBtn, background: '#1877F2' }}>👤 Facebook</a>}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* ═══ SPECIALTIES — Full width chips ═══ */}
                <div style={{ ...cardStyle, marginBottom: '20px' }}>
                    <h3 style={headingStyle}>🎨 Specialties & Services</h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '12px', overflowX: 'auto' }}>
                        {(tailor.specialties?.length > 0 ? tailor.specialties : tailor.tags || []).map((s: string, i: number) => (
                            <span key={i} style={{
                                padding: '8px 18px', background: '#E8EFE6', color: '#4A3728', borderRadius: '20px',
                                fontSize: '14px', fontWeight: 600, whiteSpace: 'nowrap',
                            }}>{s}</span>
                        ))}
                        {(!tailor.specialties?.length && !tailor.tags?.length) && (
                            <span style={{ color: '#999', fontStyle: 'italic' }}>No specialties listed</span>
                        )}
                    </div>
                </div>

                {/* ═══ BIO / ABOUT ═══ */}
                {(tailor.bio || tailor.otherInfo) && (
                    <div style={{ ...cardStyle, marginBottom: '20px' }}>
                        <h3 style={headingStyle}>📝 About</h3>
                        {tailor.bio && <p style={{ color: '#444', lineHeight: 1.7, marginTop: '10px' }}>{tailor.bio}</p>}
                        {tailor.otherInfo && <p style={{ color: '#777', lineHeight: 1.7, marginTop: '6px' }}>{tailor.otherInfo}</p>}
                    </div>
                )}

                {/* ═══ ACTION BUTTONS ═══ */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                    <button style={{ ...btnStyle, background: 'linear-gradient(135deg, #4A3728, #8B6F47)', color: 'white', border: 'none' }}>📩 Message</button>
                    <button style={{ ...btnStyle, border: '2px solid #8B6F47', color: '#8B6F47' }}>📅 Book Appointment</button>
                    <button onClick={() => navigate('/tailor-review', { state: { tailorEmail: tailor.email, tailorName: tailor.name } })}
                        style={{ ...btnStyle, border: '2px solid #A8B5A0', color: '#5a7a4f' }}>⭐ Write Review</button>
                </div>

                {/* ═══ REVIEWS SECTION ═══ */}
                <div style={cardStyle}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h3 style={{ ...headingStyle, margin: 0 }}>⭐ Reviews & Ratings</h3>
                        <span style={{ fontSize: '14px', color: '#888' }}>{totalReviews} review{totalReviews !== 1 ? 's' : ''}</span>
                    </div>

                    {/* Rating breakdown bar chart */}
                    {reviews.length > 0 && (
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: '28px', padding: '20px',
                            background: '#faf8f4', borderRadius: '12px', marginBottom: '24px',
                        }}>
                            <div style={{ textAlign: 'center', minWidth: '80px' }}>
                                <div style={{ fontSize: '40px', fontWeight: 700, color: '#4A3728' }}>{avgRating}</div>
                                <div style={{ fontSize: '18px', color: '#C9A66B', letterSpacing: '2px' }}>{stars(parseFloat(avgRating))}</div>
                                <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>{reviews.length} reviews</div>
                            </div>
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                {[5, 4, 3, 2, 1].map(s => {
                                    const ct = reviews.filter((r: any) => Math.round(r.rating) === s).length;
                                    const pct = (ct / reviews.length) * 100;
                                    return (
                                        <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span style={{ width: '22px', fontSize: '13px', color: '#888', textAlign: 'right' }}>{s}★</span>
                                            <div style={{ flex: 1, height: '8px', background: '#eee', borderRadius: '4px', overflow: 'hidden' }}>
                                                <div style={{ width: `${pct}%`, height: '100%', background: '#C9A66B', borderRadius: '4px' }} />
                                            </div>
                                            <span style={{ width: '24px', fontSize: '12px', color: '#888' }}>{ct}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Individual reviews */}
                    {loadingReviews ? (
                        <p style={{ textAlign: 'center', color: '#888', padding: '20px' }}>Loading reviews…</p>
                    ) : reviews.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            {reviews.map((r: any, i: number) => (
                                <div key={r._id || i} style={{
                                    padding: '18px', border: '1px solid #f0ece5', borderRadius: '12px', background: '#fafaf8',
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '6px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <strong style={{ color: '#4A3728' }}>{r.customerName || 'Anonymous'}</strong>
                                            {r.serviceType && <span style={{ padding: '2px 8px', background: '#E8EFE6', borderRadius: '8px', fontSize: '11px', fontWeight: 600, color: '#4A3728' }}>{r.serviceType}</span>}
                                        </div>
                                        <span style={{ fontSize: '12px', color: '#999' }}>
                                            {r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
                                        </span>
                                    </div>
                                    <div style={{ color: '#C9A66B', fontSize: '16px', marginBottom: '6px' }}>
                                        {stars(r.rating)} <span style={{ fontSize: '13px', fontWeight: 700, color: '#4A3728', marginLeft: '6px' }}>{r.rating}/5</span>
                                    </div>
                                    <p style={{ color: '#555', lineHeight: 1.7, fontSize: '14px', margin: 0 }}>{r.comment}</p>
                                    {r.recommend && <p style={{ color: '#1e7e34', fontSize: '13px', fontWeight: 600, marginTop: '6px' }}>👍 Would recommend</p>}
                                    {r.photos?.length > 0 && (
                                        <div style={{ display: 'flex', gap: '8px', marginTop: '10px', overflowX: 'auto' }}>
                                            {r.photos.map((p: string, j: number) => (
                                                <img key={j} src={p} alt="" style={{ width: '72px', height: '72px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #eee' }} />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                            <div style={{ fontSize: '32px', marginBottom: '10px', opacity: 0.5 }}>📝</div>
                            <p style={{ fontWeight: 600, color: '#888' }}>No reviews yet</p>
                            <p style={{ fontSize: '14px' }}>Be the first to review this tailor!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Reusable styles
const cardStyle: React.CSSProperties = {
    background: 'white', borderRadius: '16px', padding: '24px 28px',
    boxShadow: '0 2px 10px rgba(74,55,40,0.05)',
};
const headingStyle: React.CSSProperties = {
    fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1.2px',
    color: '#8B6F47', fontWeight: 700, marginBottom: '4px',
};
const btnStyle: React.CSSProperties = {
    padding: '14px', borderRadius: '12px', background: 'transparent',
    fontWeight: 700, fontSize: '14px', cursor: 'pointer', fontFamily: "'Outfit', sans-serif",
};
const socialBtn: React.CSSProperties = {
    padding: '8px 16px', borderRadius: '8px', background: '#4A3728',
    color: 'white', textDecoration: 'none', fontWeight: 600, fontSize: '13px',
};

const Pill = ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
    <span style={{
        padding: '5px 14px', background: 'rgba(139,111,71,0.08)', borderRadius: '20px',
        color: '#4A3728', fontWeight: 600, fontSize: '13px', whiteSpace: 'nowrap', ...style,
    }}>{children}</span>
);

export default CustomerTailorView;
