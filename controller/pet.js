const express = require("express");
const { Pet } = require("../models");
const router = express.Router();
const verifyToken = require('../middlewares/verifyToken');
const pet = require('../service/pet');
const { petDetail } = require('../service/pet');


router.get("/list", verifyToken, async (req, res) => {
    const email = res.locals.email;
    try {
        const result = await pet.petList(email);
        res.status(200).json({
            data: result
        })
    } catch (error) {
        console.error(error);
    }
});

router.post("/register", verifyToken, async (req, res) => {
    const email = res.locals.email;
    try {
        const result = pet.petRegister(email, req.body);
        if (result) {
            res.status(200).json({
                message: "등록되었습니다",
            });
        }
    } catch (error) {
        console.error(error);
    }
})

router.get("/detail", async (req, res) => {
    const petId = req.query.id;
    console.log(petId)
    try {
        const result = await petDetail(petId)
        console.log(result)
        if (result) {
            res.status(200).json({
                data: result
            })
        }
    } catch (error) {
        console.error(error);
    }
})
module.exports = router;