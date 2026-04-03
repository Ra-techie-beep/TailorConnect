import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Tesseract from 'tesseract.js';
import '../styles/tailorProfile.css';

const TailorProfile: React.FC = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('personal');
    const [indicatorStyle, setIndicatorStyle] = useState({ left: 10, width: 0 });
    const tabsRef = useRef<(HTMLButtonElement | null)[]>([]);
    const [isExtracting, setIsExtracting] = useState(false);

    // Form State
    const [formData, setFormData] = useState(() => {
        const userStr = localStorage.getItem('user');
        const user = userStr ? JSON.parse(userStr) : null;
        return {
            // Personal
            name: user?.name || '',
            email: user?.email || '',
            phone: user?.contactNo || '',
            address: user?.address || '',
            city: user?.city || '',
            aadharNo: '',
            aadharImage: null as string | null,
            // New Personal
            gender: 'Male',
            languages: '',
            education: '',

            // Professional
            category: 'Both',
            specialties: '',
            socialWebsite: '',
            socialInsta: '',
            socialFb: '',
            since: '',
            workType: 'Shop',
            serviceArea: '',
            pricingStart: '',

            // Business/Contact
            shopName: '',
            shopAddress: '',
            shopCity: '',
            profileImage: null as string | null,
            otherInfo: '',
            operatingHours: '',
            paymentMethods: '',
            homeDelivery: false
        };
    });

    const tabs = [
        { id: 'personal', label: 'Personal Info' },
        { id: 'professional', label: 'Professional Info' },
        { id: 'business', label: 'Business Info' }
    ];

    const handleLogout = () => {
        if (window.confirm('Are you sure you want to logout?')) {
            navigate('/login');
        }
    };

    const handleTabClick = (tabId: string, index: number) => {
        setActiveTab(tabId);
        updateIndicator(index);
    };

    const updateIndicator = (index: number) => {
        const tabElement = tabsRef.current[index];
        if (tabElement) {
            setIndicatorStyle({
                left: tabElement.offsetLeft,
                width: tabElement.offsetWidth
            });
        }
    };

    useEffect(() => {
        const activeIndex = tabs.findIndex(tab => tab.id === activeTab);
        if (activeIndex !== -1) {
            updateIndicator(activeIndex);
        }
    }, [activeTab]);

    useEffect(() => {
        const handleResize = () => {
            const activeIndex = tabs.findIndex(tab => tab.id === activeTab);
            if (activeIndex !== -1) {
                updateIndicator(activeIndex);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [activeTab]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
        setFormData(prev => ({ ...prev, [name]: val }));
    };

    const handleAadharUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const imageUrl = URL.createObjectURL(file);

            setFormData(prev => ({ ...prev, aadharImage: imageUrl }));
            setIsExtracting(true);

            try {
                const { data: { text } } = await Tesseract.recognize(
                    file,
                    'eng',
                    { logger: m => console.log(m) }
                );

                console.log("Raw OCR Text:", text);

                // --- AI Extraction (Gemini) ---
                console.log("Sending text to AI for parsing...");

                // Show raw text briefly or log it
                // alert(`Raw Text Scanned:\n${text.substring(0, 200)}...`); 

                try {
                    const aiResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/parse-document`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ text })
                    });

                    const result = await aiResponse.json();

                    if (result.status && result.data) {
                        const { name, aadharNo, address, city } = result.data;
                        console.log("AI Extracted Data:", result.data);

                        setFormData(prev => ({
                            ...prev,
                            // Use AI data if available, otherwise keep existing
                            name: name || prev.name,
                            aadharNo: aadharNo || prev.aadharNo,
                            address: address || prev.address,
                            city: city || prev.city,
                            // Keep the image
                            aadharImage: imageUrl
                        }));

                        alert("GenAI Extraction Complete! \nVerified with Gemini 1.5 Flash.");
                    } else {
                        throw new Error(result.message || "AI parsing failed");
                    }

                } catch (aiError: any) {
                    console.error("AI Service Error:", aiError);
                    const errorMessage = aiError.message || "Unknown error";
                    alert(`AI Parsing Failed!\nError: ${errorMessage}\n\nPlease check the backend console logs for more details.`);
                }

            } catch (err) {
                console.error("OCR Error:", err);
                alert("Failed to extract data. Is the image clear?");
            } finally {
                setIsExtracting(false);
            }
        }
    };

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData((prev: any) => ({ ...prev, profileImage: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    useEffect(() => {
        const fetchProfile = async () => {
            const userStr = localStorage.getItem('user');
            if (userStr) {
                const user = JSON.parse(userStr);
                const email = user.email;
                if (email) {
                    try {
                        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/profile?email=${email}`);
                        const result = await response.json();
                        if (result.status && result.data) {
                            const data = result.data;
                            setFormData((prev: any) => ({
                                ...prev,
                                name: data.name || prev.name,
                                email: data.email || prev.email,
                                phone: data.contactNo || prev.phone,
                                address: data.address || prev.address,
                                city: data.shopCity || prev.city, // Mapping shopCity to city for initial load
                                aadharNo: data.aadharNo || prev.aadharNo,
                                gender: data.gender || prev.gender,
                                languages: Array.isArray(data.languages) ? data.languages.join(', ') : (data.languages || prev.languages),
                                education: data.education || prev.education,
                                category: data.category || prev.category,
                                specialties: Array.isArray(data.specialties) ? data.specialties.join(', ') : (data.specialties || prev.specialties),
                                socialWebsite: data.socialWebsite || prev.socialWebsite,
                                socialInsta: data.socialInsta || prev.socialInsta,
                                socialFb: data.socialFb || prev.socialFb,
                                since: data.since || prev.since,
                                workType: data.workType || prev.workType,
                                serviceArea: data.serviceArea || prev.serviceArea,
                                pricingStart: data.pricingStart || prev.pricingStart,
                                shopName: data.shopName || prev.shopName,
                                shopAddress: data.shopAddress || prev.shopAddress,
                                shopCity: data.shopCity || prev.shopCity,
                                profileImage: data.profileImage || prev.profileImage,
                                otherInfo: data.otherInfo || prev.otherInfo,
                                operatingHours: data.operatingHours || prev.operatingHours,
                                paymentMethods: Array.isArray(data.paymentMethods) ? data.paymentMethods.join(', ') : (data.paymentMethods || prev.paymentMethods),
                                homeDelivery: data.homeDelivery || prev.homeDelivery
                            }));
                        }
                    } catch (error) {
                        console.error("Error fetching profile:", error);
                    }
                }
            }
        };
        fetchProfile();
    }, []);

    const handleSave = async () => {
        console.log("Saving Profile Data:", formData);

        const userStr = localStorage.getItem('user');
        if (!userStr) {
            alert("No user found in session. Please log in again.");
            navigate('/login');
            return;
        }

        const user = JSON.parse(userStr);
        const payload = { ...formData, email: user.email };

        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (result.status) {
                alert("Profile Saved Successfully! ✅");
                console.log("Server Response:", result);
            } else {
                throw new Error(result.msg || "Update failed");
            }
        } catch (error: any) {
            console.error("Save Error:", error);
            alert(`Failed to save profile: ${error.message}`);
        }
    };

    return (
        <div className="tailor-profile-page">
            {/* Header */}
            <header className="header">
                <div className="header-content">
                    <a href="#" className="logo">TailorConnect</a>
                    <div className="header-actions">
                        <button className="btn-secondary" onClick={() => navigate('/tailor-dashboard')}>
                            Dashboard
                        </button>
                        <button className="btn-secondary" onClick={handleLogout}>
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Container */}
            <div className="container">
                {/* Profile Header Block */}
                <div className="profile-header-compact">
                    <h1>Edit Profile</h1>
                    <p>Update your personal and professional details to attract more customers.</p>
                </div>

                {/* Tabs */}
                <div className="tabs">
                    <div
                        className="tab-indicator"
                        style={{
                            left: `${indicatorStyle.left}px`,
                            width: `${indicatorStyle.width}px`
                        }}
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

                {/* Form Content */}
                <div className="form-container-card">

                    {/* Personal Info Tab */}
                    {activeTab === 'personal' && (
                        <div className="tab-pane fade-in">
                            <div className="form-section-title">
                                <h3>Personal Details</h3>
                                <span className="icon">👤</span>
                            </div>

                            <div className="grid-2">
                                <div className="form-group">
                                    <label className="form-label">Full Name</label>
                                    <input type="text" className="form-input" name="name" value={formData.name} onChange={handleChange} placeholder="Master Thread Tailoring" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Email Address</label>
                                    <input type="email" className="form-input" name="email" value={formData.email} onChange={handleChange} placeholder="contact@masterthread.com" readOnly />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Contact Number</label>
                                    <input type="text" className="form-input" name="phone" value={formData.phone} onChange={handleChange} placeholder="(415) 555-0123" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">City</label>
                                    <input type="text" className="form-input" name="city" value={formData.city} onChange={handleChange} placeholder="San Francisco" />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Gender</label>
                                    <select className="form-input" name="gender" value={formData.gender} onChange={handleChange}>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Languages Spoken</label>
                                    <input type="text" className="form-input" name="languages" value={formData.languages} onChange={handleChange} placeholder="English, Hindi, etc." />
                                </div>
                                <div className="form-group full-width">
                                    <label className="form-label">Education / Certification</label>
                                    <input type="text" className="form-input" name="education" value={formData.education} onChange={handleChange} placeholder="Master Tailor Certification" />
                                </div>

                                <div className="form-group full-width">
                                    <label className="form-label">Personal Address</label>
                                    <input type="text" className="form-input" name="address" value={formData.address} onChange={handleChange} placeholder="123 Fashion Street" />
                                </div>
                            </div>

                            <div className="divider"></div>

                            <div className="form-section-title">
                                <h3>Identity Verification (Aadhar)</h3>
                                <span className="icon">🆔</span>
                            </div>

                            <div className="aadhar-section">
                                <div className="form-group">
                                    <label className="form-label">Upload Aadhar Card (Auto-fill)</label>
                                    <div className="file-upload-wrapper">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleAadharUpload}
                                            className="file-input"
                                        />
                                        <div className="file-upload-placeholder">
                                            {isExtracting ? (
                                                <span>⏳ Scanning Aadhar... Please wait</span>
                                            ) : (
                                                <span>📤 Click to Upload Aadhar Image</span>
                                            )}
                                        </div>
                                    </div>
                                    {formData.aadharImage && (
                                        <div className="image-preview">
                                            <img src={formData.aadharImage} alt="Aadhar Preview" />
                                        </div>
                                    )}
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Aadhar Number</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        name="aadharNo"
                                        value={formData.aadharNo}
                                        onChange={handleChange}
                                        placeholder="XXXX XXXX XXXX"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Professional Info Tab */}
                    {activeTab === 'professional' && (
                        <div className="tab-pane fade-in">
                            <div className="form-section-title">
                                <h3>Professional Expertise</h3>
                                <span className="icon">✂️</span>
                            </div>

                            <div className="form-group full-width">
                                <label className="form-label">Profile Photo</label>
                                <div className="file-upload-wrapper" style={{ marginBottom: '15px' }}>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handlePhotoUpload}
                                        className="file-input"
                                    />
                                    <div className="file-upload-placeholder">
                                        <span>📷 {formData.profileImage ? 'Change Profile Photo' : 'Upload Profile Photo'}</span>
                                    </div>
                                </div>
                                {formData.profileImage && (
                                    <div className="image-preview" style={{ width: '120px', height: '120px', borderRadius: '50%', overflow: 'hidden', margin: '0 auto 20px' }}>
                                        <img src={formData.profileImage} alt="Profile Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </div>
                                )}
                            </div>

                            <div className="grid-2">
                                <div className="form-group">
                                    <label className="form-label">Category</label>
                                    <select className="form-input" name="category" value={formData.category} onChange={handleChange}>
                                        <option value="Men">Men</option>
                                        <option value="Women">Women</option>
                                        <option value="Children">Children</option>
                                        <option value="Both">Both (Unisex)</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Experience Since (Year)</label>
                                    <input type="text" className="form-input" name="since" value={formData.since} onChange={handleChange} placeholder="1990" />
                                </div>
                                <div className="form-group full-width">
                                    <label className="form-label">Specialities (Comma separated)</label>
                                    <input type="text" className="form-input" name="specialties" value={formData.specialties} onChange={handleChange} placeholder="Custom Suits, Alterations" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Starting Price (₹)</label>
                                    <input type="text" className="form-input" name="pricingStart" value={formData.pricingStart} onChange={handleChange} placeholder="e.g. 500" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Service Area</label>
                                    <input type="text" className="form-input" name="serviceArea" value={formData.serviceArea} onChange={handleChange} placeholder="e.g. Mumbai" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Work Type</label>
                                    <select className="form-input" name="workType" value={formData.workType} onChange={handleChange}>
                                        <option value="Home">Home Based</option>
                                        <option value="Shop">Shop / Boutique</option>
                                        <option value="Both">Both</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Business Info Tab */}
                    {activeTab === 'business' && (
                        <div className="tab-pane fade-in">
                            <div className="form-section-title">
                                <h3>Business Details</h3>
                                <span className="icon">🏢</span>
                            </div>

                            <div className="grid-2">
                                <div className="form-group full-width">
                                    <label className="form-label">Shop Name</label>
                                    <input type="text" className="form-input" name="shopName" value={formData.shopName} onChange={handleChange} placeholder="Master Thread Tailoring" />
                                </div>
                                <div className="form-group full-width">
                                    <label className="form-label">Shop Address</label>
                                    <input type="text" className="form-input" name="shopAddress" value={formData.shopAddress} onChange={handleChange} placeholder="123 Fashion Street, San Francisco, CA 94102" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Shop City</label>
                                    <input type="text" className="form-input" name="shopCity" value={formData.shopCity} onChange={handleChange} placeholder="San Francisco" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Operating Hours</label>
                                    <input type="text" className="form-input" name="operatingHours" value={formData.operatingHours} onChange={handleChange} placeholder="Mon-Sat: 10AM - 8PM" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Payment Methods</label>
                                    <input type="text" className="form-input" name="paymentMethods" value={formData.paymentMethods} onChange={handleChange} placeholder="Cash, UPI, Card" />
                                </div>
                                <div className="form-group full-width">
                                    <label className="checkbox-label">
                                        <input type="checkbox" name="homeDelivery" checked={formData.homeDelivery} onChange={handleChange} />
                                        <span>Available for Home Delivery/Visits?</span>
                                    </label>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Website</label>
                                    <input type="text" className="form-input" name="socialWebsite" value={formData.socialWebsite} onChange={handleChange} placeholder="www.masterthread.com" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Instagram Handle</label>
                                    <input type="text" className="form-input" name="socialInsta" value={formData.socialInsta} onChange={handleChange} placeholder="@masterthread" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Facebook Page</label>
                                    <input type="text" className="form-input" name="socialFb" value={formData.socialFb} onChange={handleChange} placeholder="Master Thread Official" />
                                </div>
                                <div className="form-group full-width">
                                    <label className="form-label">Other Information / Bio</label>
                                    <textarea className="form-input" rows={4} name="otherInfo" value={formData.otherInfo} onChange={handleChange} placeholder="We specialize in luxury menswear, custom suits, and expert alterations."></textarea>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Footer Actions */}
                    <div className="form-actions">
                        <button className="btn-save" onClick={handleSave} disabled={isExtracting}>
                            {isExtracting ? 'Processing...' : 'Save Changes'}
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default TailorProfile;