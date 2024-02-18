const { JWT_SECRET } = require("./config");
const jwt = require("jsonwebtoken");

const authMiddleware = (req,res,next) => {
    console.log("reached authmiddleware");
    const authHeader = req.headers.authorization;
    if(!authHeader || !authHeader.startsWith('Bearer')) {
        return res.status(403).json ({})
    }

    const token = authHeader.split(' ')[1];
    console.log(token)

  
    try {
        console.log("hi from try");
        const decoded = jwt.verify(token, JWT_SECRET);
        console.log(decoded)
        req.userId = decoded.userId;
        next();
    } catch (err) {
        console.log("error caught");
        return res.status(403).json({});
    }
}

module.exports = {
    authMiddleware
}