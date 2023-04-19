const jwt = require("jsonwebtoken");

const authHeader = req.get("Authorization");
try {
  if (!authHeader) {
    const error = new Error("Not authenticated !");
    error.statusCode = 401;
    throw error;
  }
  const token = authHeader;
  let decodedToken = jwt.verify(token, "secret");

  if (!decodedToken) {
    const error = new Error("Authenticated !");
    error.statusCode = 401;
    throw error;
  }
  req.userId = decodedToken.userId;
  req.role = decodedToken.role;
  req.name = decodedToken.name;
  next();
} catch (err) {
  if (!err.statusCode) {
    err.statusCode = 500;
  }
  next(err);
}
