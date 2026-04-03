const jwt = require("jsonwebtoken");

const validateToken = (req, res, next) => {
    console.log("=> validateToken middleware triggered for", req.url);
    let token;

    // Check if the authorization header exists and starts with 'Bearer'
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        try {
            // Extract the token from the header
            token = req.headers.authorization.split(" ")[1];

            // Verify the token
            const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret");

            // Attach the decoded payload (e.g., email) to the request object
            req.user = decoded;

            // Move to the next middleware or route handler
            next();
        } catch (error) {
            console.error("Token verification failed:", error.message);
            return res.status(401).json({ status: false, message: "Not authorized, token failed" });
        }
    }

    if (!token) {
        return res.status(401).json({ status: false, message: "Not authorized, no token provided" });
    }
};

module.exports = { validateToken };
