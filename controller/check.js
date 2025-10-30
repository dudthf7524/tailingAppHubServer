const express = require("express");
const check = require("../service/check");
const hub = require("../service/hub");
const router = express.Router();

router.post("/hub", async (req, res) => {
    const {
        user_email,
        mac_address
    } = req.body;

    const userId = await check.checkUser(user_email);
    const result = await check.checkHub(userId, mac_address);

    if (result == null) {
        await hub.hubRegister(mac_address, userId);
    } else {
        res.send("ok")
    }
});

module.exports = router;