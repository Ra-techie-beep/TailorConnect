const express = require("express");
const router = express.Router();
const { validateToken } = require("../config/validatetoken");

const { registerUser, loginUser } = require("../controllers/AuthController");
const { 
    getRecentTailors, getAllTailors, updateProfile, getProfile, 
    getCities, getSpecialties, findTailors 
} = require("../controllers/UserController");
const { getTailorByPhone, addReview, getReviewsByEmail } = require("../controllers/ReviewController");
const { parseDocument } = require("../controllers/AIController");

// Authentication
router.post("/registerUser", registerUser);
router.post("/loginUser", loginUser);

// User Profile & Tailor Discovery
router.get("/recent-tailors", getRecentTailors);
router.get("/all-tailors", getAllTailors);
router.get("/profile", validateToken, getProfile);
router.put("/profile", validateToken, updateProfile);
router.get("/cities", getCities);
router.post("/specialties", getSpecialties);
router.post("/find-tailors", findTailors);

// Reviews
router.get("/tailor-by-phone/:phone", getTailorByPhone);
router.get("/reviews/:email", getReviewsByEmail);
router.post("/add-review", validateToken, addReview);

// AI Document Parsing
router.post("/parse-document", validateToken, parseDocument);

module.exports = router;
