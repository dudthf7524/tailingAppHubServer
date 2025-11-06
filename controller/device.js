const express = require("express");
// const { Device } = require("../models");
const device = require("../service/device");

const verifyToken = require('../middlewares/verifyToken');
const router = express.Router();

router.get("/list", async (req, res) => {
    const address = req.query.hubAddress;
    try {
        const result = await device.deviceList(address);

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
        await device.deviceRegister(body);
        res.status(200).json({
            message: "디바이스가 등록되었습니다.",
        });
    } catch (error) {
        console.error(error);
    }
})

router.post("/connect/pet", async (req, res) => {
    const body = req.body;
    try {
        await device.deviceConnectPet(body);
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
        const result = await device.deviceConnectPetList(email);
        res.status(200).json({
            data: result,
        })
    } catch (error) {
        console.error(error);
    }
})

router.get("/list/name", verifyToken, async (req, res) => {
    const email = res.locals.email;
    try {
        const result = await device.deviceListName(email);
        res.status(200).json({
            data: result
        })
    } catch (error) {
        console.error(error);
    }
})

router.post("/edit", verifyToken, async (req, res) => {
    const body = req.body;
    try {
        const result = await device.deviceEdit(body);
        return res.status(200).json({
            data : result
        })
    } catch (error) {
        console.error(error);
    }
})





module.exports = router;