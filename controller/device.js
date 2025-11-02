const express = require("express");
const { Device } = require("../models");
const { deviceRegister } = require("../service/device");
const { deviceConnectPet } = require("../service/device");
const { deviceConnectPetList } = require("../service/device");
const verifyToken = require('../middlewares/verifyToken');
const router = express.Router();

router.get("/list", async (req, res) => {
    console.log("req.params", req.params);
    try {
        const result = await Device.findAll({
        })
        return res.status(200).json({
            data: result,
        });
    } catch (error) {
        console.error(error);
    }
});

router.post("/register", async (req, res) => {
    const body = req.body;
    try {
        await deviceRegister(body);
        res.status(200).json({
            message: "디바이스가 등록되었습니다.",
        });
    } catch (error) {
        console.error(error);
    }
})

router.post("/connect/pet", async (req, res) => {
    const body = req.body;
    console.log("req.body", req.body);

    try {
        await deviceConnectPet(body);
        res.status(200).json({
            message: "펫이 매칭 되었습니다.",
        });
    } catch (error) {
        console.error(error);
    }
})

router.get("/connect/pet/list", verifyToken, async (req, res) => {

    const email = res.locals.email;
    try {
        const result = await deviceConnectPetList(email);
       res.status(200).json({
        data : result,
       })
    } catch (error) {
        console.error(error);
    }
})

module.exports = router;