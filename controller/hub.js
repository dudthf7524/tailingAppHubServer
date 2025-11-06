const express = require("express");
const router = express.Router();
const verifyToken = require('../middlewares/verifyToken');
const hub = require("../service/hub");

router.get("/list", verifyToken, async (req, res, next) => {
    const email = res.locals.email;
    try {
        const result = await hub.hubList(email);
        return res.status(200).json({
            data: result,
        });
    } catch (error) {
        console.error(error);
    }
});

router.post("/edit", verifyToken, async (req, res, next) => {
   
    const body = req.body;
    try {
        await hub.hubEdit(body);

        return res.status(200).json({
            message: "허브 이름이 변경되었습니다."
        });
    } catch (error) {
        console.error(error)
    }
});

module.exports = router;