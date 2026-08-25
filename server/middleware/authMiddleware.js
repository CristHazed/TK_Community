const jwt = require('jsonwebtoken');
 
// Expects "Authorization: Bearer <token>" on the request.
// On success, attaches the decoded payload to req.admin and calls next().
// On failure, responds 401 and stops the request from reaching the route handler.
function verifyToken(req, res, next) {
    const authHeader = req.headers.authorization;
 
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token provided' });
    }
 
    const token = authHeader.split(' ')[1];
 
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.admin = decoded; // { id, username, iat, exp }
        next();
    } catch (err) {
        // Distinguish expiry from a bad/tampered token so the frontend can react appropriately
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Session expired, please log in again' });
        }
        return res.status(401).json({ error: 'Invalid token' });
    }
}
 
module.exports = verifyToken;