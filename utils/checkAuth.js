import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export default (req, res, next) => {
  const token = (req.headers.authorization || "").replace(/Bearer\s?/, "");
  console.log("Received token:", token);

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_KEY);
      req.userId = decoded._id;
      next();
    } catch (err) {
      console.error("Error verifying token:", err);
      if (err.name === "JsonWebTokenError") {
        console.log("Invalid token");
        return res.status(403).json({ message: "Invalid token" });
      } else {
        console.log("No token");
        return res.status(403).json({ message: "No token" });
      }
    }
  } else {
    console.log("No token");
    return res.status(403).json({ message: "No token" });
  }
};
