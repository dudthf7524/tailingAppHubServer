const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();
const jwtSecret = process.env.JWT_SECRET;

const verifyRefreshToken = (req, res, next) => {
    console.log("aaa")
    console.log("aaa")
    console.log("req.headers.authorization", req.headers.authorization)

    if (!req.headers.authorization) {
        return res.status(401).json({ message: "토큰이 없습니다." });
    }
    try {
        const data = jwt.verify(
            req.headers.authorization,
            jwtSecret
        );
        console.log(data)
        res.locals.email = data.email;
    } catch (error) {
        console.error(error);
        if (error.name === "TokenExpiredError") {
            return res
                .status(419)
                .json({ message: "만료된 리프레시 토큰입니다.", code: "refresh_expired" });
        }
        return res
            .status(401)
            .json({ message: "유효하지 않은 리프레시 토큰입니다." });
    }
    next();
};

module.exports = verifyRefreshToken;