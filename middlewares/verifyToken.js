const jwt = require("jsonwebtoken");
const jwtSecret = "T@iling_Pr0ject_2024_S3cur3_K3y_!@^&*";
const dotenv = require("dotenv");
dotenv.config();

const verifyToken = (req, res, next) => {
    console.log("여기까지")
    console.log(req.headers.authorization)
    if (!req.headers.authorization) {
        return res.status(401).json({ message: "토큰이 없습니다." });
    }
    try {
        const data = jwt.verify(
            req.headers.authorization,
            jwtSecret,
        );
        res.locals.id = data.id;
        res.locals.email = data.email;
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return res
                .status(419)
                .json({ message: "만료된 액세스 토큰입니다.", code: "expired" });
        }
        return res
            .status(401)
            .json({ message: "유효하지 않은 액세스 토큰입니다." });
    }
    next();
};

module.exports = verifyToken;