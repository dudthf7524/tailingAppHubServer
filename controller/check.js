const express = require("express");
const check = require("../service/check");
const hub = require("../service/hub");
const router = express.Router();

router.post("/hub", async (req, res) => {
    console.log("req.body", req.body);
    const {
        user_email,
        mac_address
    } = req.body;
    console.log("user_email : ", user_email);
    console.log("mac_address : ", mac_address);
    const result = await check.checkHub(mac_address);
    
    if (result == null) {
        console.log("허브 등록 안됨")
        await check.hubRegister(mac_address, user_email);
    } else {
        console.log('허브 등록 완료')
        res.json({
            isChange : false,
            wifi_id : "iptime",
            wifi_pw : ""
        })
    }
});

module.exports = router;