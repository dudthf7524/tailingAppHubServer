const { User } = require("../models");
const bcrypt = require("bcrypt");

const userJoin = async (body) => {
    const {
        email,
        password,
        name,
        address,
        phone,
    } = body;
    try {
        const hashedPassword = await bcrypt.hash(password, 12);

        const result = await User.create({
            email,
            password: hashedPassword,
            name,
            address,
            phone,
        });
        return result
    } catch (error) {
        console.error(error);
    }
}


const userLogin = async (email) => {
    try {
        const exUser = await User.findOne({ where: { email: email } });
        return exUser;
    } catch (error) {
        console.error(error);
    }
};
const userInformation = async (user_id) => {
    try {
        const userInfo = await User.findOne({ where: { id: user_id } });
        console.log("userInfo", userInfo);
        return userInfo;
    } catch (error) {
        console.error(error);
    }
};

const userChangePassword = async (user_id, password) => {
    try {

        return userInfo;
    } catch (error) {
        console.error(error);
    }
};

const findByUserId = async (user_id) => {
    try {
        const result = await User.findOne({ where: { id: user_id }, raw: true });
        return result
    } catch (error) {
        console.error(error);
    }
};

module.exports = {
    userJoin,
    userLogin,
    userInformation,
    userChangePassword,
    findByUserId,
};