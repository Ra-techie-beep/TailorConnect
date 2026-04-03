const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    tailorEmail: { type: String, required: true },
    customerName: { type: String, default: 'Anonymous' },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    mobileNumber: { type: String, required: true },
    serviceType: { type: String },
    visitDate: { type: Date },
    location: { type: String },
    recommend: { type: Boolean },
    photos: [{ type: String }],
    createdAt: { type: Date, default: Date.now }
}, { versionKey: false });

module.exports = mongoose.model('TailorReview', reviewSchema);
