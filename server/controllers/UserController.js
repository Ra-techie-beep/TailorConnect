const UserColRef = require("../models/model_user");

const getTailorAggregationPipeline = (matchQuery = {}, sortQuery = {}, limitNum = null) => {
    const pipeline = [
        { $match: { userType: "tailor", ...matchQuery } }
    ];
    if (Object.keys(sortQuery).length > 0) pipeline.push({ $sort: sortQuery });
    if (limitNum) pipeline.push({ $limit: limitNum });
    
    pipeline.push(
        {
            $lookup: {
                from: "tailorreviews",
                localField: "email",
                foreignField: "tailorEmail",
                as: "reviewsData"
            }
        },
        {
            $addFields: {
                avgRating: { $avg: "$reviewsData.rating" },
                reviewCount: { $size: "$reviewsData" }
            }
        },
        {
            $project: { reviewsData: 0 }
        }
    );
    return pipeline;
};

const getRecentTailors = async (req, res) => {
    try {
        let matchStage = {};
        if (req.query.city) {
            matchStage.shopCity = new RegExp(req.query.city, "i");
        }
        const tailors = await UserColRef.aggregate(getTailorAggregationPipeline(matchStage, { dos: -1 }, 10));
        res.status(200).json({ status: true, tailors });
    } catch (error) {
        res.status(500).json({ status: false, message: error.message });
    }
};

const getAllTailors = async (req, res) => {
    try {
        const tailors = await UserColRef.aggregate(getTailorAggregationPipeline({}, { dos: -1 }));
        res.status(200).json({ status: true, tailors });
    } catch (error) {
        res.status(500).json({ status: false, message: error.message });
    }
};

const updateProfile = async (req, res) => {
    try {
        const email = req.user.email; // From validateToken middleware
        const updateData = req.body;
        
        // If updating name, or other top level fields, findOneAndUpdate with $set is fine
        const updatedUser = await UserColRef.findOneAndUpdate(
            { email }, 
            { $set: updateData }, 
            { new: true, runValidators: true }
        );
        
        if (!updatedUser) return res.status(404).json({ status: false, message: "User not found" });
        
        res.status(200).json({ status: true, user: updatedUser });
    } catch (error) {
        res.status(500).json({ status: false, message: error.message });
    }
};

const getProfile = async (req, res) => {
    try {
        // Use req.user.email if it exists (from token), otherwise fallback to query for admin/debug
        const email = req.user?.email || req.query.email;
        const user = await UserColRef.findOne({ email });
        
        if (!user) return res.status(404).json({ status: false, message: "User not found" });
        res.status(200).json({ status: true, user });
    } catch (error) {
        res.status(500).json({ status: false, message: error.message });
    }
};

const getCities = async (req, res) => {
    try {
        const cities = await UserColRef.distinct("shopCity", { userType: "tailor" });
        res.status(200).json({ status: true, cities: cities.filter(Boolean) });
    } catch (error) {
        res.status(500).json({ status: false, message: error.message });
    }
};

const getSpecialties = async (req, res) => {
    try {
        const tailors = await UserColRef.find({ userType: "tailor" });
        // Extract distinct specialties from the array in the documents
        const specialties = [...new Set(tailors.flatMap(t => t.specialties || []))];
        res.status(200).json({ status: true, specialties: specialties.filter(Boolean) });
    } catch (error) {
        res.status(500).json({ status: false, message: error.message });
    }
};

const findTailors = async (req, res) => {
    try {
        const { city, specialty } = req.body;
        let matchStage = {};
        if (city) matchStage.shopCity = new RegExp(city, "i");
        if (specialty) matchStage.specialties = { $in: [specialty] };
        
        const tailors = await UserColRef.aggregate(getTailorAggregationPipeline(matchStage));
        res.status(200).json({ status: true, tailors });
    } catch (error) {
        res.status(500).json({ status: false, message: error.message });
    }
};

module.exports = {
    getRecentTailors,
    getAllTailors,
    updateProfile,
    getProfile,
    getCities,
    getSpecialties,
    findTailors
};
