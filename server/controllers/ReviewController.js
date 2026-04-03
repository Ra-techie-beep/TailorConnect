const ReviewColRef = require("../models/model_review");
const UserColRef = require("../models/model_user");
const cloudinary = require('cloudinary').v2;
const { cloudobj } = require('../config/config');
cloudinary.config(cloudobj);

async function getTailorByPhone(req, res) {
    try {
        const { phone } = req.params;
        const tailor = await UserColRef.findOne({ contactNo: phone, userType: 'tailor' });
        if (!tailor) {
            return res.status(404).json({ status: false, msg: "Tailor not found" });
        }
        res.status(200).json({ 
            status: true, 
            name: tailor.name, 
            email: tailor.email,
            location: tailor.shopCity || tailor.city 
        });
    } catch (error) {
        res.status(500).json({ status: false, msg: error.message });
    }
}

async function addReview(req, res) {
    try {
        const { 
            tailorEmail, rating, comment, mobileNumber, customerName,
            serviceType, visitDate, location, recommend
        } = req.body;
        
        let photos = [];
        if (req.files) {
            const fileKeys = Object.keys(req.files);
            for (const key of fileKeys) {
                const file = req.files[key];
                const result = await new Promise((resolve, reject) => {
                    const uploadStream = cloudinary.uploader.upload_stream(
                        { folder: "tailor_reviews" },
                        (error, result) => {
                            if (error) reject(error);
                            else resolve(result);
                        }
                    );
                    uploadStream.end(file.data);
                });
                photos.push(result.secure_url);
            }
        }

        const newReview = new ReviewColRef({
            tailorEmail,
            rating,
            comment,
            mobileNumber,
            customerName,
            serviceType,
            visitDate: visitDate || undefined,
            location,
            recommend: recommend === 'true' || recommend === true,
            photos
        });
        await newReview.save();
        res.status(200).json({ status: true, msg: "Review Published!" });
    } catch (error) {
        console.error("Add Review Error:", error);
        res.status(500).json({ status: false, msg: error.message });
    }
}

async function getReviewsByEmail(req, res) {
    try {
        const { email } = req.params;
        const reviews = await ReviewColRef.find({ tailorEmail: email }).sort({ createdAt: -1 });
        res.status(200).json({ status: true, reviews });
    } catch (error) {
        res.status(500).json({ status: false, msg: error.message });
    }
}

module.exports = { getTailorByPhone, addReview, getReviewsByEmail };
