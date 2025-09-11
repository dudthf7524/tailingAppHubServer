const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();
const email = require('../common/email');
const { isNotLoggedIn } = require("../middlewares/auth");
const { Organization } = require("../models");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

router.post("/join", isNotLoggedIn, async (req, res, next) => {
    console.log("들어온 데이터", req.body)
    try {
        const {
            org_name,
            org_address,
            org_email,
            org_pw,
            org_phone,
            marketingAgreed,
            smsAgreed,
            emailAgreed,
            pushAgreed,
        } = req.body;
        const exUser = await Organization.findOne({ where: { org_email } });
        if (exUser) {
            return res.status(400).json({ message: "이미 가입된 아이디입니다." });
        }

        const hashedPassword = await bcrypt.hash(org_pw, 12);

        const organization = await Organization.create({
            org_name,
            org_address,
            org_pw: hashedPassword,
            org_phone,
            org_email,
            agree_marketing: marketingAgreed || 0,
            agree_sms: smsAgreed || 0,
            agree_email: emailAgreed || 0,
            agree_push: pushAgreed || 0,
            max_device_cnt: 5,
            current_device_cnt: 0,});

        res.status(201).json({
            message: "회원가입이 완료되었습니다.",
            data: {
                organization: {
                    org_email: organization.org_email,
                    org_name: organization.org_name,
                    device_code: organization.device_code,
                },
            },
        });
    } catch (e) {
        console.error(e);
        next(e);
    }
});


router.post("/email/send", async (req, res, next) => {

    const user_id = req.body.email;
    const email_verification_number = req.body.code;

    // try {
    //     const result = await user.findByEmail(user_id);
    //     if (result) {
    //         res.json("-1");
    //     } else {
    //         const result = await email.sendEmail(user_id, email_verification_number)
    //         console.log(result);
    //         res.json(true);
    //     }

    // } catch (error) {
    //     console.error(error)
    // }

    try {
        const result = await email.sendEmail(user_id, email_verification_number)
        console.log("result", result)
        res.json(true);
    } catch (error) {
        console.error(error)
    }
});

// router.post("/join", async (req, res) => {
//     console.log("프론트 에서 받아온 데이터", req.body)
// })

router.post("/login", isNotLoggedIn, async (req, res, next) => {
  console.log("req.body", req.body)
  try {
    const { org_email, org_pw } = req.body;
    const exUser = await Organization.findOne({ where: { org_email: org_email } });
    if (!exUser) {
      return res.status(400).json({ message: "존재하지 않는 아이디입니다." });
    }
    const isMatch = await bcrypt.compare(org_pw, exUser.org_pw);
    if (!isMatch) {
      return res.status(400).json({ message: "비밀번호가 일치하지 않습니다." });
    }

    // if (!exUser.isActive) {
    //   return res.status(400).json({ message: "탈퇴한 회원입니다." });
    // }

    const token = jwt.sign(
      {
        org_email : exUser.org_email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.status(200).json({
      data: { token },
      message: "로그인 성공",
    });
  } catch (e) {
    console.error(e);
    next(e);
  }
});

module.exports = router;