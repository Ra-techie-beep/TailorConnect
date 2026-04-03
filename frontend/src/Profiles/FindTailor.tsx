import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import "../styles/findTailor.css";

// ───────────────────────────────────────────────────────────────────────────────
// TYPE DEFINITIONS
// ───────────────────────────────────────────────────────────────────────────────

interface TailorCard {
    _id: string;
    name: string;
    specialty: string;
    city: string;
    profilepic: string;
    worktype: string;
    shopCity: string;
    since: string;
    contact: string;
    social: string;
}

interface SearchForm {
    city: string;
    category: string;
    specialty: string;
}

// ───────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ───────────────────────────────────────────────────────────────────────────────

const CATEGORIES = [
    { value: "Men", label: "Men", icon: "👔" },
    { value: "Women", label: "Women", icon: "👗" },
    { value: "Children", label: "Children", icon: "🧒" },
    { value: "Both", label: "Both", icon: "👨👩👧" },
];

const BASE = import.meta.env.VITE_API_BASE_URL; // uses env variable for API base
const PAGE_SIZE = 6;

// ───────────────────────────────────────────────────────────────────────────────
// GooglePlacesCityInput COMPONENT
// ───────────────────────────────────────────────────────────────────────────────
function GooglePlacesCityInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
    const [input, setInput] = useState(value);
    const inputRef = (node: HTMLInputElement | null) => {
        if (!node || !(window as any).google) return;
        const autocomplete = new (window as any).google.maps.places.Autocomplete(node, {
            types: ['(cities)'],
        });
        autocomplete.addListener('place_changed', () => {
            const place = autocomplete.getPlace();
            const city = place.name || '';
            setInput(city);
            onChange(city);
        });
    };

    useEffect(() => {
        if (!value) setInput("");
    }, [value]);

    return (
        <div className="city-input-wrapper">
            <span className="city-icon">📍</span>
            <input
                ref={inputRef}
                value={input}
                onChange={(e) => {
                    setInput(e.target.value);
                    onChange(e.target.value);
                }}
                placeholder="Search city with Google…"
                className="filter-input city-input"
            />
            {input && (
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        setInput("");
                        onChange("");
                    }}
                    className="city-clear-btn"
                >Clear</button>
            )}
        </div>
    );
}

// ───────────────────────────────────────────────────────────────────────────────
// TailorCardUI COMPONENT
// ───────────────────────────────────────────────────────────────────────────────
function TailorCardUI({ tailor, index }: { tailor: TailorCard; index: number }) {
    const exp = tailor.since ? new Date().getFullYear() - parseInt(tailor.since) : null;
    const displayCity = tailor.worktype === "Shop" && tailor.shopCity ? tailor.shopCity : tailor.city;

    return (
        <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: index * 0.06 }}
            className="tailor-card"
        >
            <div className="tailor-photo-wrapper">
                <img
                    src={tailor.profilepic || "https://res.cloudinary.com/drzyrhs2v/image/upload/v1/tailor_profiles/default_nopic.jpg"}
                    alt={tailor.name}
                    onError={(e: any) => { e.target.src = "https://res.cloudinary.com/drzyrhs2v/image/upload/v1/tailor_profiles/default_nopic.jpg"; }}
                    className="tailor-photo"
                />
                <div className="tailor-badge">{tailor.worktype || "Freelance"}</div>
                {exp !== null && exp >= 0 && (
                    <div className="tailor-exp-badge">🏅 {exp}+ yrs</div>
                )}
            </div>

            <div className="tailor-info">
                <h3 className="tailor-name">{tailor.name}</h3>
                <p className="tailor-specialty"><span>✂️</span> {tailor.specialty}</p>
                <p className="tailor-location"><span>📍</span> {displayCity}</p>

                <div className="tailor-actions">
                    <a href={`tel:${tailor.contact}`} className="call-btn">📞 Call</a>
                    {tailor.social && (
                        <a href={tailor.social} target="_blank" rel="noreferrer" className="social-btn">🔗</a>
                    )}
                </div>
            </div>
        </motion.div>
    );
}

// ───────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ───────────────────────────────────────────────────────────────────────────────
export default function FindTailor() {
    const [form, setForm] = useState<SearchForm>({ city: "", category: "", specialty: "" });
    const [specialties, setSpecialties] = useState<string[]>([]);
    const [specialtyLoading, setSpecialtyLoading] = useState(false);
    const [tailors, setTailors] = useState<TailorCard[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);

    useEffect(() => {
        setForm((p) => ({ ...p, specialty: "" }));
        setSpecialties([]);
        if (!form.category) return;

        setSpecialtyLoading(true);
        axios.post(`${BASE}/specialties`, { category: form.category })
            .then((r) => {
                setSpecialties(r.data.status ? r.data.specialties : []);
            })
            .catch(() => setSpecialties([]))
            .finally(() => setSpecialtyLoading(false));
    }, [form.category]);

    const doSearch = useCallback((pageNum = 1) => {
        setLoading(true);
        setSearched(true);
        setPage(pageNum);

        axios.post(`${BASE}/find-tailors`, { ...form, page: pageNum, limit: PAGE_SIZE })
            .then((r) => {
                if (r.data.status) {
                    setTailors(r.data.docs);
                    setTotal(r.data.total);
                    setTotalPages(r.data.totalPages);
                } else {
                    setTailors([]); setTotal(0); setTotalPages(0);
                }
            })
            .catch(() => {
                setTailors([]); setTotal(0); setTotalPages(0);
            })
            .finally(() => setLoading(false));
    }, [form]);

    const handlePageChange = (p: number) => {
        doSearch(p);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleClear = () => {
        setForm({ city: "", category: "", specialty: "" });
        setSpecialties([]);
        setTailors([]);
        setTotal(0);
        setTotalPages(0);
        setSearched(false);
    };

    return (
        <div className="find-tailor-container">
            <style>{`@import url('https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap');`}</style>

            <header className="find-tailor-header">
                <h1 className="find-tailor-title">Find a Tailor</h1>
                <p className="find-tailor-subtitle">Discover skilled tailors near you</p>
            </header>

            <div className="search-layout">
                <motion.aside
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4 }}
                    className="filters-sidebar"
                >
                    <div className="filters-header">
                        <h2><span>🔍</span> Search Filters</h2>
                    </div>

                    <div className="filters-content">
                        <div className="filter-group">
                            <label className="filter-group-label">City</label>
                            <GooglePlacesCityInput
                                value={form.city}
                                onChange={(v: string) => setForm((p) => ({ ...p, city: v }))}
                            />
                        </div>

                        <div className="filter-group">
                            <label className="filter-group-label">Category</label>
                            <div className="category-list">
                                {CATEGORIES.map((cat) => (
                                    <label
                                        key={cat.value}
                                        className={`category-option ${form.category === cat.value ? "selected" : ""}`}
                                    >
                                        <input
                                            type="radio"
                                            name="category"
                                            value={cat.value}
                                            checked={form.category === cat.value}
                                            onChange={() => setForm((p) => ({ ...p, category: cat.value, specialty: "" }))}
                                        />
                                        <span className="category-label-text">{cat.icon} {cat.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <AnimatePresence>
                            {form.category && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.25 }}
                                    style={{ overflow: "hidden" }}
                                >
                                    <label className="filter-group-label">Dress Type</label>
                                    {specialtyLoading ? (
                                        <div className="filter-input flex items-center gap-2">
                                            <div className="spinner">⌛</div> Loading…
                                        </div>
                                    ) : specialties.length === 0 ? (
                                        <div className="filter-input italic opacity-60">No dress types registered</div>
                                    ) : (
                                        <select
                                            value={form.specialty}
                                            onChange={(e) => setForm((p) => ({ ...p, specialty: e.target.value }))}
                                            className="filter-select"
                                        >
                                            <option value="">— All Dress Types —</option>
                                            {specialties.map((s) => (
                                                <option key={s} value={s}>{s}</option>
                                            ))}
                                        </select>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <motion.button
                            onClick={() => doSearch(1)}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            disabled={loading}
                            className="search-btn"
                        >
                            {loading ? <>Searching…</> : <>✦ Find Tailors</>}
                        </motion.button>

                        {(form.city || form.category || form.specialty) && (
                            <button onClick={handleClear} className="clear-btn">✕ Clear Filters</button>
                        )}
                    </div>
                </motion.aside>

                <main className="results-area">
                    <AnimatePresence>
                        {searched && !loading && (
                            <motion.div
                                initial={{ opacity: 0, y: -6 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="results-summary"
                            >
                                <p className="results-count">
                                    {total > 0 ? `${total} tailor${total !== 1 ? "s" : ""} found` : "No tailors found"}
                                    {form.category ? ` · ${form.category}` : ""}
                                    {form.specialty ? ` · ${form.specialty}` : ""}
                                    {form.city ? ` in ${form.city}` : ""}
                                </p>
                                {totalPages > 1 && (
                                    <p className="page-info">Page {page} of {totalPages}</p>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {loading && (
                        <div className="tailor-grid">
                            {Array.from({ length: PAGE_SIZE }).map((_, i) => (
                                <div key={i} className="tailor-card" style={{ opacity: 0.5 }}>
                                    <div className="tailor-photo-wrapper" style={{ background: 'rgba(255,255,255,0.05)' }} />
                                    <div className="tailor-info" style={{ gap: '1rem' }}>
                                        <div style={{ height: '2rem', background: 'rgba(201, 166, 107, 0.2)', borderRadius: '8px', width: '70%' }} />
                                        <div style={{ height: '1rem', background: 'rgba(139, 111, 71, 0.2)', borderRadius: '4px', width: '50%' }} />
                                        <div style={{ height: '1rem', background: 'rgba(139, 111, 71, 0.1)', borderRadius: '4px', width: '40%' }} />
                                        <div style={{ height: '3rem', background: 'rgba(201, 166, 107, 0.1)', borderRadius: '12px', marginTop: 'auto' }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {!loading && tailors.length > 0 && (
                        <div className="tailor-grid">
                            {tailors.map((t, i) => (
                                <TailorCardUI key={t._id} tailor={t} index={i} />
                            ))}
                        </div>
                    )}

                    {!loading && searched && tailors.length === 0 && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="empty-state">
                            <span className="empty-icon">🧥</span>
                            <h3 className="empty-title">Still Searching…</h3>
                            <p className="empty-msg">We couldn't find any tailors matching these specific filters. Try expanding your search area or category.</p>
                        </motion.div>
                    )}

                    {!loading && !searched && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="empty-state">
                            <span className="empty-icon">✨</span>
                            <h3 className="empty-title">Your Next Masterpiece</h3>
                            <p className="empty-msg">Select a <strong>city</strong> and <strong>category</strong> to discover the finest craftsmanship near you.</p>
                        </motion.div>
                    )}

                    {!loading && tailors.length > 0 && totalPages > 1 && (
                        <div className="pagination">
                            <button
                                onClick={() => handlePageChange(page - 1)}
                                disabled={page === 1}
                                className="page-btn"
                            >‹ Prev</button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                                <button
                                    key={p}
                                    onClick={() => handlePageChange(p)}
                                    className={`page-btn ${p === page ? "active" : ""}`}
                                >
                                    {p}
                                </button>
                            ))}
                            <button
                                onClick={() => handlePageChange(page + 1)}
                                disabled={page === totalPages}
                                className="page-btn"
                            >Next ›</button>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
