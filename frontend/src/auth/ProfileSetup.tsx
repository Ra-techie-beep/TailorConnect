import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/auth.css'; // Reusing auth styles for consistency
import axios from 'axios';

const ProfileSetup: React.FC = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        shopName: '',
        bio: '',
        specialties: '',
        experience: '',
        address: ''
    });
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const userStr = localStorage.getItem('user');
            if (!userStr) {
                alert('Session expired. Please login again.');
                navigate('/login');
                return;
            }
            const user = JSON.parse(userStr);

            // Convert comma-separated specialties to array
            const specialtiesArray = formData.specialties.split(',').map(s => s.trim()).filter(s => s !== '');

            const payload = {
                email: user.email, // Identify user
                shopName: formData.shopName,
                bio: formData.bio,
                specialties: specialtiesArray,
                experience: formData.experience,
                address: formData.address
            };

            const response = await axios.put(`${import.meta.env.VITE_API_BASE_URL}/profile`, payload);

            if (response.data.status) {
                // Update local storage with new data
                const updatedUser = response.data.data;
                localStorage.setItem('user', JSON.stringify(updatedUser)); // Important: Sync local state

                alert('Profile Setup Complete!');
                navigate('/tailor-dashboard');
            }
        } catch (error: any) {
            console.error("Setup Error:", error);
            alert("Failed to save profile. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#F5F1E8' }}>
            <div className="login-form-card" style={{ maxWidth: '600px', width: '100%', padding: '40px' }}>
                <div className="form-header">
                    <h1>Complete Your Profile</h1>
                    <p className="welcome-tagline">Tell us about your tailoring business</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="shopName">Shop Name / Business Name *</label>
                        <input
                            type="text"
                            name="shopName"
                            required
                            placeholder="e.g. Master Thread Tailoring"
                            value={formData.shopName}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="experience">Years of Experience</label>
                        <input
                            type="text"
                            name="experience"
                            placeholder="e.g. 15 Years"
                            value={formData.experience}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="specialties">Specialties (comma separated)</label>
                        <input
                            type="text"
                            name="specialties"
                            placeholder="Suits, Dresses, Alterations, Bridal"
                            value={formData.specialties}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="address">Shop Address / Location</label>
                        <input
                            type="text"
                            name="address"
                            placeholder="City, State or Full Address"
                            value={formData.address}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="bio">Short Bio</label>
                        <textarea
                            name="bio"
                            rows={3}
                            placeholder="Describe your expertise and services..."
                            value={formData.bio}
                            onChange={handleChange}
                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ccc' }}
                        />
                    </div>

                    <button
                        type="submit"
                        className={`submit-btn ${isLoading ? 'loading' : ''}`}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Saving...' : 'Complete Setup'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ProfileSetup;
