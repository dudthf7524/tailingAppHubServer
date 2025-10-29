const express = require("express");
const verifyRefreshToken = require('../middlewares/verifyRefreshToken');
const router = express.Router();

router.post("/refreshToken", verifyRefreshToken, async (req, res, next) => {
    const accessToken = jwt.sign(
        {
            sub: "access",
            user_id: res.locals.user_id,
            user_code: res.locals.user_code,
            company_code: res.locals.company_code,
        },
        jwtSecret,
        { expiresIn: "5m" }
    );
    const result = await user.findByUserId(res.locals.user_id);
    console.log(result)
    if (result) {
        const user_code = result.user_code
        const user_name = result.user_name
        return res.json({
            data: {
                user_name: user_name,
                user_code: user_code,
                accessToken,
            },
        });

    }
    // if (!users[res.locals.email]) {
    //     return res.status(404).json({ message: "가입되지 않은 회원입니다." });
    // }

});

module.exports = router;