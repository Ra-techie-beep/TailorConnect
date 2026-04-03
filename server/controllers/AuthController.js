var UserColRef = require("../models/model_user");
const { sendWelcomeEmail } = require("../utils/emailService");
const jwt = require("jsonwebtoken");

async function registerUser(req, res) {
    let objcolRef = new UserColRef(req.body);
    objcolRef
        .save()
        .then((doc) => {
            console.log(doc);
            // Send Welcome Email (Non-blocking)
            sendWelcomeEmail(doc.email, doc.name);

            // Generate JWT Token
            const token = jwt.sign(
                { email: doc.email },
                process.env.JWT_SECRET || "fallback_secret",
                { expiresIn: "7d" }
            );

            res.status(200).json({
                status: true,
                msg: "User Registered Successfully",
                token: token,
                doc: doc,
            });
        })
        .catch((err) => {
            console.log(err.message);
            res.status(500).json({
                status: false,
                msg: err.message,
            });
        });
}

async function loginUser(req, res) {
    try {
        const { email, password, userType } = req.body;
        console.log("Login User Request:", req.body);

        const user = await UserColRef.findOne({ email });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        if (user.password !== password) {
            return res.status(401).json({
                success: false,
                message: "Invalid password"
            });
        }

        if (user.userType !== userType) {
            return res.status(403).json({
                success: false,
                message: "Incorrect user role"
            });
        }

        // Generate JWT Token
        const token = jwt.sign(
            { email: user.email },
            process.env.JWT_SECRET || "fallback_secret",
            { expiresIn: "7d" }
        );

        res.status(200).json({
            success: true,
            message: "Login successful",
            token: token,
            data: {
                id: user._id,
                email: user.email,
                userType: user.userType,
                name: user.name,
                shopName: user.shopName,
                isProfileComplete: user.isProfileComplete
            }
        });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({
            success: false,
            message: "Login failed",
            error: error.message
        });
    }
}

module.exports = { registerUser, loginUser };