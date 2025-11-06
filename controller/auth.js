const express = require("express");
const verifyRefreshToken = require('../middlewares/verifyRefreshToken');
const router = express.Router();
const jwt = require("jsonwebtoken");
const jwtSecret = process.env.JWT_SECRET;
const user = require('../service/user')

router.post("/refreshToken", verifyRefreshToken, async (req, res, next) => {
    const accessToken = jwt.sign(
        {
            sub: "access",
            email: res.locals.email,
        },
        jwtSecret,
        { expiresIn: "5s" }
    );
    const result = await user.findByUserEmail(res.locals.email);
    if (result) {
        const email = result.email
        return res.json({
            data: {
                email,
                accessToken,
            },
        });

    }
});

module.exports = router;