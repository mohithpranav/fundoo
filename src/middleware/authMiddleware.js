import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      return res.status(401).json({ message: "Token is not valid" });
    }
    req.user = decoded;
    console.log("auth done");
    next();
  } catch (error) {
    res.status(401).json({ message: "Token is not valid" });
  }
};
export default authMiddleware;
