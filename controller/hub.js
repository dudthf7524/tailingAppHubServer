const express = require("express");
const { Hub } = require("../models");
const router = express.Router();
const jwtSecret = "T@iling_Pr0ject_2024_S3cur3_K3y_!@^&*";
const jwt = require("jsonwebtoken");

router.post("/register", async (req, res, next) => {
    console.log("req.body", req.body)
    const hub_address = req.body.mac_address;
    const org_email = req.body.org_email;

    try {
        const result = await Hub.create({
            address: hub_address,
            org_email,
            hub_name: '허브'
        });

        if (result) {
            res.status(201).json({
                message: "허브가 등록되었습니다.",
            });
        } else {
            res.status(500).json({
                message: "데이터 베이스 오류로 인해 허브가 등록되지 않았습니다.",
            });
        }

    } catch (error) {
        console.error(error)
    }
});

router.get("/get", async (req, res, next) => {

    const data = jwt.verify(
        req.headers.authorization.replace("Bearer ", ""),
        jwtSecret
    );

    const { org_email } = data;


    try {
        const result = await Hub.findOne({
            where: { org_email: org_email },
        })
        console.log("result, ", result)
        res.json(result);
        res.json(result);
    } catch (error) {
        console.error(error)
    }
    // try {
    //     const result = await Hub.create({
    //         address: hub_address,
    //         org_email,
    //         hub_name: '허브'
    //     });

    //     if (result) {
    //         res.status(201).json({
    //             message: "허브가 등록되었습니다.",
    //         });
    //     } else {
    //         res.status(500).json({
    //             message: "데이터 베이스 오류로 인해 허브가 등록되지 않았습니다.",
    //         });
    //     }

    // } catch (error) {
    //     console.error(error)
    // }

});

router.post("/register", async (req, res, next) => {
    console.log("허브에서의 응답", req.body)

    const { org_email, mac_address } = req.body;

    res.send('제발')


});

module.exports = router;