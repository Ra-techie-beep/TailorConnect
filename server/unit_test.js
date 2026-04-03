const { validateToken } = require('./config/validatetoken');
const jwt = require('jsonwebtoken');

console.log("==========================================");
console.log("    TESTING validateToken Middleware      ");
console.log("==========================================\n");

const mockResponse = () => {
  const res = {};
  res.status = (code) => { 
    console.log("    -> RES STATUS:", code); 
    return res; 
  };
  res.json = (data) => { 
    console.log("    -> RES JSON:", data); 
    return res;
  };
  return res;
};

const mockNext = () => console.log("    -> NEXT CALLED: Middleware successfully passed!");

// Test 1: No Token Provided
console.log("--- TEST 1: No Token ---");
let req1 = { headers: {}, url: "/profile" };
validateToken(req1, mockResponse(), mockNext);

// Test 2: Invalid Authorization Format (No Bearer)
console.log("\n--- TEST 2: Invalid Header Format ---");
let req2 = { headers: { authorization: "Basic badger" }, url: "/profile" };
validateToken(req2, mockResponse(), mockNext);

// Test 3: Bad Token
console.log("\n--- TEST 3: Invalid JWT Token ---");
let req3 = { headers: { authorization: "Bearer badger" }, url: "/profile" };
validateToken(req3, mockResponse(), mockNext);

// Test 4: Valid Token
console.log("\n--- TEST 4: Valid JWT Token ---");
const validToken = jwt.sign({ id: 123, email: "test@example.com" }, process.env.JWT_SECRET || "fallback_secret", { expiresIn: '1h' });
let req4 = { headers: { authorization: `Bearer ${validToken}` }, url: "/profile" };
validateToken(req4, mockResponse(), mockNext);

console.log("\n==========================================");
console.log("              TESTS COMPLETE              ");
console.log("==========================================");
