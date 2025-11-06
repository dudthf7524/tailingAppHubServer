const express = require("express");
const check = require("../service/check");
const hub = require("../service/hub");
const router = express.Router();

router.post("/hub", async (req, res) => {
    const {
        user_email,
        mac_address
    } = req.body;
    const result = await check.checkHub(mac_address);
    
    if (result == null) {
        await check.hubRegister(mac_address, user_email);
    } else {
        res.json({
            isChange : false,
            wifi_id : "iptime",
            wifi_pw : ""
        })
    }
});

module.exports = router;