const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();
const email = require('../common/email');
const { User } = require("../models");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const user = require('../service/user');
const verifyToken = require('../middlewares/verifyToken');
const { userInformation } = require("../service/user");

dotenv.config();

router.post("/join", async (req, res, next) => {
  console.log("들어온 데이터", req.body);
  try {
    const {
      email,
      password,
      name,
      address,
      phone,
      // marketingAgreed,
      // smsAgreed,
      // emailAgreed,
      // pushAgreed,
    } = req.body;
    const exUser = await User.findOne({ where: { email } });
    if (exUser) {
      return res.status(400).json({ message: "이미 가입된 아이디입니다." });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      email,
      password: hashedPassword,
      name,
      address,
      phone,
      // agree_marketing: marketingAgreed || 0,
      // agree_sms: smsAgreed || 0,
      // agree_email: emailAgreed || 0,
      // agree_push: pushAgreed || 0,
      // max_device_cnt: 5,
      // current_device_cnt: 0,
    });

    res.status(201).json({
      message: "회원가입이 완료되었습니다.",
      data: {
        user: {
          email: user.email,
          name: user.name,
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

router.post("/login", async (req, res, next) => {
  console.log("req.body", req.body)
  try {
    const { email, password } = req.body;
    const exUser = await user.userLogin(email);

    if (!exUser) {
      return res.status(401).json({ message: "존재하지 않는 아이디입니다." });
    }
    const isMatch = await bcrypt.compare(password, exUser.password);
    if (!isMatch) {
      return res.status(402).json({ message: "비밀번호가 일치하지 않습니다." });
    }

    const accessToken = jwt.sign(
      {
        sub: "access",
        id: exUser.id,
        email: exUser.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "10s" }
    );

    const refreshToken = jwt.sign(
      {
        sub: "refresh",
        id: exUser.id,
        email: exUser.email
      },
      process.env.JWT_SECRET,
      { expiresIn: "10s" }
    );

    res.status(200).json({
      data: {
        id: exUser.id,
        email: exUser.email,
        accessToken,
        refreshToken
      },
      message: "로그인 성공",
    });
  } catch (e) {
    console.error(e);
    next(e);
  }
});

router.get("/information", verifyToken, async (req, res, next) => {
  const id = res.locals.id;
  console.log("id", id);
  try {
    userInformation(id);
  } catch (error) {
    console.error(error);
  }
});

router.post("/change/password", verifyToken, async (req, res, next) => {
  const id = res.locals.id;
  console.log("id", id);
  try {
    userChangePassword(id);
  } catch (error) {

  }
})

module.exports = router;