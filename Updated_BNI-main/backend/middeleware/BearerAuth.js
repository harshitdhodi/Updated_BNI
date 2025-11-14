const jwt = require('jsonwebtoken');



const bearerAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(403).json({ message: "Forbidden: Invalid or missing token" });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(403).json({ message: "Forbidden: Invalid or missing token" });
  }

  jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Forbidden: Invalid or missing token" });
    }

    req.userId = decoded.userId;
    next();
  });
};




module.exports = { bearerAuth };