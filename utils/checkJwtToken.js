const jwt = require("jsonwebtoken")

function verifyToken(req, res, next) {
  const bearerHeader = req.headers["authorization"];
  if (bearerHeader) {
    const token = bearerHeader.split(" ")[1];
    jwt.verify(token, process.env.JWT_SECRET_TOKEN, (err, decoded) => {
      if (err) return res.status(403).json({ message: "Invalid token" });
      req.user = decoded;
        console.log("Authenticated : " + req.user.username)
      next();
    });
  } else {
    res.status(401).json({ message: "Token required" });
  }
}

module.exports = verifyToken