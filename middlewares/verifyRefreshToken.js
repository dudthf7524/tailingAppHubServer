const jwt = require("jsonwebtoken");
const jwtSecret = "T@iling_Pr0ject_2024_S3cur3_K3y_!@^&*";
const dotenv = require("dotenv");
dotenv.config();

const verifyRefreshToken = (req, res, next) => {
    console.log("aaa")
    console.log("aaa")
    console.log("aaa")
    console.log("aaa")
    console.log("aaa")

    if (!req.headers.authorization) {
        return res.status(401).json({ message: "토큰이 없습니다." });
    }
    console.log("aaa")
    try {
        const data = jwt.verify(
            req.headers.authorization,
            jwtSecret
        );
        console.log(data)
        res.locals.user_code = data.user_code;
        res.locals.user_id = data.user_id;
        res.locals.company_code = data.company_code;
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