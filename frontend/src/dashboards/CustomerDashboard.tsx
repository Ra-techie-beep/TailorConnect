import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/dashboards.css';
import '../styles/customerFilters.css';

// --- Keyword → Specialty Mapping ---
// When a user types something like "wedding" we map it to known specialties
const KEYWORD_MAP: Record<string, string[]> = {
    wedding: ['Bridal Wear', 'Wedding Wear', 'Lehenga', 'Sherwani', 'Custom Suits'],
    bridal: ['Bridal Wear', 'Wedding Wear', 'Lehenga'],
    suit: ['Custom Suits', 'Bespoke', 'Formal Wear'],
    alter: ['Alterations', 'Tailoring', 'Repairs'],
    shirt: ['Shirts', 'Formal Wear'],
    kids: ['Children', 'Kids Wear'],
    children: ['Children', 'Kids Wear'],
    traditional: ['Traditional', 'Ethnic Wear', 'Kurta', 'Saree'],
    ethnic: ['Traditional', 'Ethnic Wear', 'Kurta'],
    embroidery: ['Embroidery', 'Zari Work'],
    casual: ['Casual Wear', 'T-Shirts'],
    dress: ['Dresses', 'Gowns', 'Evening Wear'],
    gown: ['Gowns', 'Evening Wear', 'Bridal Wear'],
    blouse: ['Blouses', 'Saree Blouse'],
    saree: ['Saree', 'Blouses', 'Traditional'],
    kurta: ['Kurta', 'Traditional', 'Ethnic Wear'],
    lehenga: ['Lehenga', 'Bridal Wear'],
    sherwani: ['Sherwani', 'Custom Suits'],
    jacket: ['Jackets', 'Formal Wear'],
    local: ['Local'],
    online: ['Online'],
};

// Expand the user's search text into a set of tag/specialty keywords to match against tailors
function expandSearchQuery(query: string): string[] {
    const lower = query.toLowerCase().trim();
    if (!lower) return [];
    const expanded = new Set<string>([lower]);
    for (const [keyword, values] of Object.entries(KEYWORD_MAP)) {
        if (lower.includes(keyword)) {
            values.forEach(v => expanded.add(v.toLowerCase()));
        }
    }
    return Array.from(expanded);
}

const MOCK_TAILORS = [
    {
        id: 'm1',
        name: 'Master Thread Tailoring',
        category: 'Both',
        specialty: 'Custom Suits & Alterations',
        rating: 4.9, reviews: 128,
        shopCity: 'Mumbai',
        tags: ['Custom Suits', 'Alterations'],
        verified: true,
        gradient: 'linear-gradient(135deg, #6B4F35, #8B6F47)'
    },
    {
        id: 'm2',
        name: 'Elegant Stitches Boutique',
        category: 'Women',
        specialty: 'Bridal & Evening Wear',
        rating: 4.8, reviews: 95,
        shopCity: 'Delhi',
        tags: ['Bridal Wear', 'Dresses'],
        verified: true,
        gradient: 'linear-gradient(135deg, #C4714D, #D4926A)'
    },
    {
        id: 'm3',
        name: 'Savile Row Classics',
        category: 'Men',
        specialty: "Bespoke Men's Suiting",
        rating: 5.0, reviews: 210,
        shopCity: 'Bangalore',
        tags: ['Shirts', 'Custom Suits'],
        verified: true,
        gradient: 'linear-gradient(135deg, #9C8561, #B89C71)'
    },
    {
        id: 'm4',
        name: 'The Golden Needle',
        category: 'Both',
        specialty: 'Traditional & Ethnic Wear',
        rating: 4.6, reviews: 42,
        shopCity: 'Hyderabad',
        tags: ['Traditional', 'Embroidery'],
        verified: false,
        gradient: 'linear-gradient(135deg, #DE8A6D, #E2A089)'
    },
    {
        id: 'm5',
        name: 'Zari Boutique',
        category: 'Women',
        specialty: 'Lehenga & Bridal Wear',
        rating: 4.7, reviews: 77,
        shopCity: 'Jaipur',
        tags: ['Lehenga', 'Bridal Wear', 'Embroidery'],
        verified: true,
        gradient: 'linear-gradient(135deg, #A0506D, #C0708D)'
    },
    {
        id: 'm6',
        name: 'Singh Tailors',
        category: 'Men',
        specialty: 'Sherwani & Kurta Specialists',
        rating: 4.5, reviews: 53,
        shopCity: 'Amritsar',
        tags: ['Sherwani', 'Kurta', 'Traditional'],
        verified: true,
        gradient: 'linear-gradient(135deg, #5E7A6B, #7E9A8B)'
    },
];

const GRADIENTS = [
    'linear-gradient(135deg, #6B4F35, #8B6F47)',
    'linear-gradient(135deg, #C4714D, #D4926A)',
    'linear-gradient(135deg, #9C8561, #B89C71)',
    'linear-gradient(135deg, #DE8A6D, #E2A089)',
    'linear-gradient(135deg, #A0506D, #C0708D)',
    'linear-gradient(135deg, #5E7A6B, #7E9A8B)',
];

const CustomerDashboard: React.FC = () => {
    const navigate = useNavigate();

    // Hero search (by NAME)
    const [nameInput, setNameInput] = useState('');
    const [appliedName, setAppliedName] = useState('');

    // Sidebar specialty search (by keyword → mapped to specialties)
    const [specialtyInput, setSpecialtyInput] = useState('');
    const [appliedSpecialty, setAppliedSpecialty] = useState('');

    // Sidebar filters (draft = not yet applied)
    const [gender, setGender] = useState('All');
    const [selectedCity, setSelectedCity] = useState('All');
    const [draftServices, setDraftServices] = useState<string[]>([]);

    // Applied sidebar filters
    const [appliedGender, setAppliedGender] = useState('All');
    const [appliedCity, setAppliedCity] = useState('All');
    const [appliedServices, setAppliedServices] = useState<string[]>([]);

    const [favorites, setFavorites] = useState<string[]>(() => {
        try { return JSON.parse(localStorage.getItem('tailorFavorites') || '[]'); } catch { return []; }
    });
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [tailors, setTailors] = useState<any[]>([]);
    const [availableCities, setAvailableCities] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Toggle favorite + persist
    const toggleFavorite = (id: string) => {
        setFavorites(prev => {
            const updated = prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id];
            localStorage.setItem('tailorFavorites', JSON.stringify(updated));
            return updated;
        });
    };

    // Toggle a draft service filter
    const toggleService = (s: string) => {
        setDraftServices(prev => prev.includes(s) ? prev.filter(f => f !== s) : [...prev, s]);
    };

    // Apply sidebar filters
    const applyFilters = () => {
        setAppliedGender(gender);
        setAppliedCity(selectedCity);
        setAppliedServices([...draftServices]);
    };

    // Clear everything
    const clearAll = () => {
        setNameInput(''); setAppliedName('');
        setSpecialtyInput(''); setAppliedSpecialty('');
        setGender('All'); setSelectedCity('All'); setDraftServices([]);
        setAppliedGender('All'); setAppliedCity('All'); setAppliedServices([]);
    };

    // Fetch all tailors (no city filter — show everyone)
    useEffect(() => {
        const fetchAll = async () => {
            setIsLoading(true);
            try {
                const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/all-tailors`);
                const data = await res.json();
                if (data.status && data.tailors && data.tailors.length > 0) {
                    const mapped = data.tailors.map((t: any, i: number) => ({
                        id: t._id,
                        name: t.shopName || t.name || 'New Tailor',
                        category: t.category || 'Both',
                        specialty: t.bio || (Array.isArray(t.specialties) && t.specialties.length > 0 ? t.specialties[0] : 'General Tailoring'),
                        rating: t.reviewCount > 0 ? parseFloat(t.avgRating.toFixed(1)) : 5.0,
                        reviews: t.reviewCount || 0,
                        shopCity: t.shopCity || t.serviceArea || '',
                        tags: Array.isArray(t.specialties) ? t.specialties.slice(0, 5) : [],
                        verified: !!t.aadharNo,
                        gradient: GRADIENTS[i % GRADIENTS.length],
                        // Raw DB fields for profile view
                        email: t.email,
                        contactNo: t.contactNo,
                        shopAddress: t.shopAddress,
                        address: t.address,
                        experience: t.experience,
                        since: t.since,
                        workType: t.workType,
                        operatingHours: t.operatingHours,
                        pricingStart: t.pricingStart,
                        languages: t.languages,
                        paymentMethods: t.paymentMethods,
                        homeDelivery: t.homeDelivery,
                        socialWebsite: t.socialWebsite,
                        socialInsta: t.socialInsta,
                        socialFb: t.socialFb,
                        profileImage: t.profileImage,
                        bio: t.bio,
                        specialties: t.specialties || [],
                        otherInfo: t.otherInfo,
                    }));
                    setTailors(mapped);
                    // Extract unique cities
                    const cities = [...new Set(mapped.map((t: any) => t.shopCity).filter(Boolean))] as string[];
                    setAvailableCities(cities);
                } else {
                    setTailors(MOCK_TAILORS);
                    setAvailableCities([...new Set(MOCK_TAILORS.map(t => t.shopCity))]);
                }
            } catch {
                setTailors(MOCK_TAILORS);
                setAvailableCities([...new Set(MOCK_TAILORS.map(t => t.shopCity))]);
            } finally {
                setIsLoading(false);
            }
        };
        fetchAll();
    }, []);

    // Sync service filter options when gender changes
    const serviceOptions = useMemo(() => {
        if (gender === 'Men') return ['Custom Suits', 'Shirts', 'Sherwani', 'Kurta', 'Blazer', 'Trousers', 'Waistcoat', 'Formal Wear', 'Traditional', 'Pathani Suit', 'Jodhpuri', 'Alterations'];
        if (gender === 'Women') return ['Bridal Wear', 'Lehenga', 'Blouses', 'Saree', 'Salwar Kameez', 'Anarkali', 'Gowns', 'Dresses', 'Kurti', 'Sharara', 'Embroidery', 'Evening Wear', 'Alterations'];
        if (gender === 'Children') return ['Kids Wear', 'School Uniforms', 'Ethnic Kids', 'Party Wear Kids', 'Frock', 'Kurta Pajama', 'Alterations'];
        return ['Custom Suits', 'Bridal Wear', 'Lehenga', 'Sherwani', 'Shirts', 'Blouses', 'Saree', 'Kurta', 'Gowns', 'Dresses', 'Traditional', 'Embroidery', 'Formal Wear', 'Kids Wear', 'Alterations'];
    }, [gender]);

    useEffect(() => {
        setDraftServices(prev => prev.filter(s => serviceOptions.includes(s)));
    }, [gender]);

    // --- Core filter logic ---
    const displayedTailors = useMemo(() => {
        const expandedTerms = expandSearchQuery(appliedSpecialty);

        return tailors.filter(t => {
            // 1. Name search (hero bar — matches name only)
            if (appliedName.trim()) {
                const lowerName = (t.name || '').toLowerCase();
                if (!lowerName.includes(appliedName.toLowerCase())) return false;
            }

            // 2. Specialty search (sidebar bar — maps keywords to specialties/tags)
            if (appliedSpecialty.trim()) {
                const lowerSpec = (t.specialty || '').toLowerCase();
                const lowerTags = (t.tags || []).map((x: string) => x.toLowerCase());
                const lowerCity = (t.shopCity || '').toLowerCase();

                const matchesText = expandedTerms.some(term =>
                    lowerSpec.includes(term) ||
                    lowerTags.some((tag: string) => tag.includes(term)) ||
                    lowerCity.includes(term)
                );
                if (!matchesText) return false;
            }

            // 3. Gender filter
            if (appliedGender !== 'All') {
                if (t.category !== appliedGender && t.category !== 'Both') return false;
            }

            // 4. City filter
            if (appliedCity !== 'All') {
                if ((t.shopCity || '').toLowerCase() !== appliedCity.toLowerCase()) return false;
            }

            // 5. Service pill filters (tailor must match AT LEAST ONE selected service)
            if (appliedServices.length > 0) {
                const lowerTags = (t.tags || []).map((x: string) => x.toLowerCase());
                const lowerSpec = (t.specialty || '').toLowerCase();
                const matchesService = appliedServices.some(s =>
                    lowerTags.some((tag: string) => tag.includes(s.toLowerCase())) ||
                    lowerSpec.includes(s.toLowerCase())
                );
                if (!matchesService) return false;
            }

            return true;
        });
    }, [tailors, appliedName, appliedSpecialty, appliedGender, appliedCity, appliedServices]);

    const hasActiveFilters = appliedName || appliedSpecialty || appliedGender !== 'All' || appliedCity !== 'All' || appliedServices.length > 0;

    return (
        <div className="dashboard-page customer-dashboard">
            {/* ── Header ── */}
            <header className="dashboard-header">
                <div className="header-content">
                    <a href="#" className="logo">TailorConnect</a>
                    <div className="header-right">
                        <div className="user-actions">
                            <button className="icon-btn" title="Notifications">
                                🔔<span className="badge">3</span>
                            </button>
                            <button className="icon-btn" onClick={() => navigate('/customer-profile')} title="Settings">⚙️</button>
                            <button className="user-profile-btn" onClick={() => navigate('/customer-profile')}>
                                <div className="user-avatar-small">JD</div>
                                <span className="user-name">John Doe</span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* ── Hero + Smart Search ── */}
            <section className="hero">
                <div className="hero-content">
                    <div className="hero-text">
                        <h1 className="hero-title">Find Your Perfect Tailor</h1>
                        <p className="hero-subtitle">
                            Search by tailor name to find exactly who you're looking for.
                        </p>
                        <div className="search-bar" style={{ display: 'flex', gap: '8px', width: '100%' }}>
                            <input
                                type="text"
                                className="search-input"
                                placeholder='Search by tailor name…'
                                value={nameInput}
                                onChange={e => setNameInput(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && setAppliedName(nameInput)}
                                style={{ flex: 1 }}
                            />
                            <button className="btn-primary" onClick={() => setAppliedName(nameInput)}>Search</button>
                            {appliedName && (
                                <button onClick={() => { setNameInput(''); setAppliedName(''); }} style={{ padding: '0 14px', borderRadius: '10px', border: '1px solid #ccc', background: '#fff', cursor: 'pointer', fontWeight: 700 }}>✕</button>
                            )}
                        </div>
                        {appliedName && (
                            <p style={{ marginTop: '8px', fontSize: '13px', color: 'var(--warm-brown)' }}>
                                Searching name: <strong>"{appliedName}"</strong>
                            </p>
                        )}
                    </div>

                    <div className="hero-animation">
                        <div className="tailor-uncle">
                            <div className="uncle-head">
                                <div className="uncle-hair"><div className="bald-spot"></div></div>
                                <div className="eye eye-left"></div>
                                <div className="eye eye-right"></div>
                                <div className="glasses"><div className="glasses-bridge"></div></div>
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
                        <div className="fabric-work"><div className="fabric-pattern"></div></div>
                        <div className="sewing-machine-small"><div className="machine-top"></div><div className="machine-base"></div></div>
                        <div className="workbench"></div>
                        <div className="floating-tool tool-scissors">✂️</div>
                        <div className="floating-tool tool-thread">🧵</div>
                        <div className="floating-tool tool-button">🔘</div>
                        <div className="floating-tool tool-ruler">📏</div>
                    </div>
                </div>
            </section>

            {/* ── Main Content ── */}
            <div className="container">
                {/* Title Row */}
                <div className="section-header" style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                    <h2 className="section-title" style={{ margin: 0 }}>
                        {isLoading ? 'Loading Tailors…' : `${displayedTailors.length} Tailor${displayedTailors.length !== 1 ? 's' : ''} Found`}
                    </h2>
                    <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
                        <button className={`toggle-btn ${viewMode === 'grid' ? 'active' : ''}`} onClick={() => setViewMode('grid')} title="Grid">⊞</button>
                        <button className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`} onClick={() => setViewMode('list')} title="List">☰</button>
                    </div>
                </div>

                <div className="dashboard-layout">
                    {/* ── Sidebar ── */}
                    <aside className="dashboard-sidebar">
                        <div className="sidebar-header">
                            <h3 className="sidebar-title">🎛️ Filters</h3>
                        </div>

                        {/* Specialty Search Bar */}
                        <div className="filter-section">
                            <h4 className="filter-section-title">🔍 Search by Specialty</h4>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'stretch' }}>
                                <input
                                    type="text"
                                    placeholder='e.g. "wedding", "bridal", "suit"…'
                                    value={specialtyInput}
                                    onChange={e => setSpecialtyInput(e.target.value)}
                                    onKeyDown={e => { if (e.key === 'Enter') setAppliedSpecialty(specialtyInput); }}
                                    style={{
                                        flex: 1, padding: '12px 14px', fontSize: '14px', borderRadius: '10px',
                                        border: '2px solid rgba(139,111,71,0.2)', outline: 'none', background: 'white',
                                        fontFamily: 'inherit',
                                    }}
                                />
                                <button
                                    onClick={() => setAppliedSpecialty(specialtyInput)}
                                    style={{
                                        padding: '12px 20px', fontSize: '14px', fontWeight: 700, borderRadius: '10px',
                                        border: 'none', background: 'var(--warm-brown)', color: 'white', cursor: 'pointer',
                                        whiteSpace: 'nowrap',
                                    }}
                                >Go</button>
                            </div>
                            {appliedSpecialty && (
                                <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', background: 'rgba(139,111,71,0.08)', borderRadius: '8px' }}>
                                    <span style={{ fontSize: '13px', color: 'var(--warm-brown)' }}>Filtering: <strong>"{appliedSpecialty}"</strong></span>
                                    <button onClick={() => { setSpecialtyInput(''); setAppliedSpecialty(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', color: '#999', lineHeight: 1 }}>✕</button>
                                </div>
                            )}
                        </div>

                        {/* Gender */}
                        <div className="filter-section">
                            <h4 className="filter-section-title">Gender Focus</h4>
                            <select
                                className="search-input"
                                style={{ width: '100%', padding: '10px', fontSize: '14px' }}
                                value={gender}
                                onChange={e => setGender(e.target.value)}
                            >
                                <option value="All">All</option>
                                <option value="Men">Men</option>
                                <option value="Women">Women</option>
                                <option value="Children">Children</option>
                            </select>
                        </div>

                        {/* Location (customer-controlled) */}
                        <div className="filter-section">
                            <h4 className="filter-section-title">📍 Location / City</h4>
                            <select
                                className="search-input"
                                style={{ width: '100%', padding: '10px', fontSize: '14px' }}
                                value={selectedCity}
                                onChange={e => setSelectedCity(e.target.value)}
                            >
                                <option value="All">All Cities</option>
                                {availableCities.map(city => (
                                    <option key={city} value={city}>{city}</option>
                                ))}
                            </select>
                        </div>

                        {/* Services (cascaded by gender) */}
                        <div className="filter-section">
                            <h4 className="filter-section-title">Clothes & Services</h4>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                {serviceOptions.map(s => (
                                    <button
                                        key={s}
                                        onClick={() => toggleService(s)}
                                        style={{
                                            padding: '8px 16px',
                                            borderRadius: '20px',
                                            border: draftServices.includes(s) ? '2px solid var(--warm-brown)' : '2px solid rgba(139,111,71,0.2)',
                                            background: draftServices.includes(s) ? 'var(--warm-brown)' : 'white',
                                            color: draftServices.includes(s) ? 'white' : 'var(--deep-brown)',
                                            fontSize: '13px',
                                            fontWeight: 600,
                                            cursor: 'pointer',
                                            transition: 'all 0.25s ease',
                                        }}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Action buttons */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '8px' }}>
                            <button className="btn-primary" onClick={applyFilters} style={{ width: '100%', padding: '12px' }}>
                                Apply Filters
                            </button>
                            {(draftServices.length > 0 || gender !== 'All' || selectedCity !== 'All' || hasActiveFilters) && (
                                <button className="clear-filters-btn" onClick={clearAll} style={{ width: '100%' }}>
                                    Clear All
                                </button>
                            )}
                        </div>
                    </aside>

                    {/* ── Cards Grid ── */}
                    <main className="dashboard-main">
                        {isLoading ? (
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px', fontSize: '18px', color: 'var(--warm-brown)' }}>
                                🧵 Loading tailors…
                            </div>
                        ) : displayedTailors.length > 0 ? (
                            <div className={`tailors-grid ${viewMode}`}>
                                {displayedTailors.map(tailor => (
                                    <div
                                        key={tailor.id}
                                        className="tailor-card"
                                        onClick={() => navigate(`/tailor-view/${tailor.id}`, { state: { tailor } })}
                                    >
                                        <div className="tailor-card-image" style={{ background: tailor.gradient }}>
                                            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px', fontWeight: 700, color: 'rgba(255,255,255,0.7)', letterSpacing: '-1px' }}>
                                                {tailor.name.charAt(0)}
                                            </div>
                                            {tailor.verified && <div className="verified-icon">✓</div>}
                                        </div>
                                        <div className="tailor-card-content">
                                            <h3 className="tailor-name">{tailor.name}</h3>
                                            <p className="tailor-specialty">{tailor.specialty}</p>
                                            <div className="tailor-meta">
                                                <div className="meta-item-inline">
                                                    <span className="rating-stars">{'★'.repeat(Math.round(tailor.rating))}{'☆'.repeat(5 - Math.round(tailor.rating))}</span>
                                                    <span className="rating-value">{tailor.rating}</span>
                                                    <span style={{ color: '#888', fontSize: '12px' }}>({tailor.reviews} reviews)</span>
                                                </div>
                                                {tailor.shopCity && (
                                                    <div className="meta-item-inline">
                                                        📍 <span>{tailor.shopCity}</span>
                                                    </div>
                                                )}
                                            </div>
                                            {tailor.tags.length > 0 && (
                                                <div className="tailor-tags">
                                                    {tailor.tags.slice(0, 4).map((tag: string, i: number) => (
                                                        <span key={i} className="tag">{tag}</span>
                                                    ))}
                                                </div>
                                            )}
                                            <div className="tailor-card-footer">
                                                <button className="btn-view-profile">View Profile</button>
                                                <button
                                                    className={`btn-favorite ${favorites.includes(tailor.id) ? 'active' : ''}`}
                                                    onClick={e => { e.stopPropagation(); toggleFavorite(tailor.id); }}
                                                >
                                                    {favorites.includes(tailor.id) ? '♥' : '♡'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="dashboard-empty-state">
                                <div className="empty-state-icon">✂️</div>
                                <h3 className="empty-state-title">No tailors found</h3>
                                <p className="empty-state-desc">
                                    {(appliedName || appliedSpecialty)
                                        ? `No results for your search. Try broader terms or adjust filters.`
                                        : 'No tailors match your selected filters. Try adjusting them.'}
                                </p>
                                <button className="btn-primary" onClick={clearAll} style={{ marginTop: '16px' }}>
                                    Clear All Filters
                                </button>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
};

export default CustomerDashboard;