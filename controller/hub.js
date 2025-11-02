const express = require("express");
const router = express.Router();
const verifyToken = require('../middlewares/verifyToken');
const hub = require("../service/hub");

router.get("/list", verifyToken, async (req, res, next) => {
    console.log("req.params", req.params);
    const email = res.locals.email;

    console.log("유저 고유 값 : ", email)
    try {
        const result = await hub.hubList(email);
        return res.status(200).json({
            data: result,
        });
    } catch (error) {
        console.error(error);
    }
});

module.exports = router;