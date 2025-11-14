const jwt = require('jsonwebtoken');

const requireAuth = async (req, res, next) => {
  console.log(req.cookies)

  try {
    const token = req.cookies.token;
    console.log(token)
    if (!token) {
      console.log("Unauthorized user: no token provided");
      throw new Error("Unauthenticated user");
    }

    const decodedToken = await jwt.verify(token, process.env.JWT_SECRET_KEY);
console.log('decodeToken', decodedToken)

if(!decodedToken.userId) {
  console.log("token doesn't contain userId")
}
    // Attach the user ID to the request object
    req.userId = decodedToken.userId
        console.log("userId:" , req.userId);

    console.log("Authorized user, proceeding to the next middleware or route");
    next();
  } catch (err) {
    console.log(err.message);
    console.log("Unauthorized access: invalid token or no token provided");
    res.status(403).json({ message: "Forbidden: Invalid or missing token" });
  }
};



const authMiddleware = async (req, res, next) => {
    let token;

    if (req?.headers?.authorization?.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1];

        try {
            if (token) {
                const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY); 
                console.log(decoded)
                // req.user = await User.findById(decoded.id).select("password");
                next();
            }
        } catch (error) {
            res.status(401).json({ msg: "Not authorized, token failed" });
        }
    } else {
        res.status(401).json({ msg: "Not authorized, no token" });
    }
};


module.exports = { requireAuth ,authMiddleware };