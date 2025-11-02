const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const commonEmail = require('../common/email');
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
    } = req.body;
    const exUser = await User.findOne({ where: { email } });
    if (exUser) {
      return res.status(400).json({ message: "이미 가입된 아이디입니다." });
    }
    const body = req.body;
    const result = await user.userJoin(body);

    res.status(201).json({
      message: "회원가입이 완료되었습니다.",
      data: {
        user: {
          email: result.email,
          name: result.name,
        },
      },
    });
  } catch (e) {
    console.error(e);
    next(e);
  }
});


router.post("/email/send", async (req, res, next) => {
  const {email, emailCode} = req.body;
  try {
    const result = await commonEmail.sendEmail(email, emailCode)
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
        email: exUser.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "5m" }
    );

    const refreshToken = jwt.sign(
      {
        sub: "refresh",
        email: exUser.email
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.status(200).json({
      data: {
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