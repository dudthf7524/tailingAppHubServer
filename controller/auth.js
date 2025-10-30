const express = require("express");
const verifyRefreshToken = require('../middlewares/verifyRefreshToken');
const router = express.Router();
const jwt = require("jsonwebtoken");
const jwtSecret = process.env.JWT_SECRET;
const { findByUserId } = require('../service/user')

router.post("/refreshToken", verifyRefreshToken, async (req, res, next) => {
    const accessToken = jwt.sign(
        {
            sub: "access",
            id: res.locals.id,
            email: res.locals.email,
        },
        jwtSecret,
        { expiresIn: "5s" }
    );
    const result = await findByUserId(res.locals.id);
    console.log(result)
    if (result) {
        const id = result.id
        const email = result.email
        return res.json({
            data: {
                id,
                email,
                accessToken,
            },
        });

    }
    // if (!users[res.locals.email]) {
    //     return res.status(404).json({ message: "가입되지 않은 회원입니다." });
    // }

});

module.exports = router;