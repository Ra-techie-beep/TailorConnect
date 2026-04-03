require("dotenv").config(); // Load from current dir
const axios = require('axios');
const jwt = require('jsonwebtoken');

const BASE_URL = 'http://localhost:3000/api';

async function testTokens() {
    console.log("=== Testing Token Validity on Protected Routes ===");

    // 1. Request WITHOUT token
    try {
        console.log("\n[Test 1] Hitting /profile without Token...");
        await axios.get(`${BASE_URL}/profile?email=test@example.com`);
        console.log("❌ Failed: Request went through without token.");
    } catch (error) {
        if (error.response && error.response.status === 401) {
            console.log("✅ Passed: Blocked request correctly. Message:", error.response.data.message);
        } else {
            console.log("❌ Failed: Unexpected error:", error.message);
        }
    }

    // 2. Request WITH INVALID token
    try {
        console.log("\n[Test 2] Hitting /profile with INVALID Token...");
        await axios.get(`${BASE_URL}/profile?email=test@example.com`, {
            headers: { Authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid.signature" }
        });
        console.log("❌ Failed: Request went through with an invalid token.");
    } catch (error) {
        if (error.response && error.response.status === 401) {
            console.log("✅ Passed: Blocked invalid token correctly. Message:", error.response.data.message);
        } else {
            console.log("❌ Failed: Unexpected error:", error.message);
        }
    }

    // 3. Request WITH VALID token
    try {
        console.log("\n[Test 3] Hitting /profile with MINTED VALID Token...");
        const validToken = jwt.sign(
            { email: "test@example.com" }, 
            process.env.JWT_SECRET || "fallback_secret", 
            { expiresIn: "1h" }
        );
        
        const res = await axios.get(`${BASE_URL}/profile?email=test@example.com`, {
            headers: { Authorization: `Bearer ${validToken}` }
        });
        console.log("✅ Passed: Token accepted by middleware! Server replied:", res.data);
    } catch (error) {
        if (error.response && error.response.status === 404) {
             console.log("✅ Passed: Token accepted and processed. (User not found in DB is fine for this simulated email).");
        } else if (error.response && error.response.status === 401) {
             console.log("❌ Failed: Token rejected despite being valid!");
        } else {
             console.log("❌ Failed: Unexpected error:", error.message);
        }
    }
}

testTokens();
