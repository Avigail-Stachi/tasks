import jwt from "jsonwebtoken";

export const authenticateToken = (req, res, next) => {
    const authHeader = req.header("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "access denied. no token provided" });
    }

    const token = authHeader.split(" ")[1]; //לוקח את הטוקן מההדר
    try {
        const verified = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        req.user = verified; 
        console.log("req.user", req.user)
        next(); 
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({ message: "session expired. please log in again" });
        } else {
            return res.status(403).json({ message: "invalid token" });
        }
    }
};

export const authorizeOwner = (req, res, next) => {
    console.log("enter authorizeOwner")
    if (req.user.role !== "owner") {
        return res.status(403).json({ message: "access denied. only the store owner can access this" });
    }
    next();
};

export const authorizeSupplier = (req, res, next) => {
    if (req.user.role !== "supplier") {
        return res.status(403).json({ message: "access denied. only suppliers can access this" });
    }
    console.log("enter authorizeSupplier")
    console.log("req.user", req.user)
    next();
};

export const authorizeOwnerOrSupplier = (req, res, next) => {
    if (req.user.role !== "owner" && req.user.role !== "supplier") {
        return res.status(403).json({ message: "access denied. only the store owner or suppliers can access this" });
    }
    console.log("enter authorizeOwnerOrSupplier")
    next();
}