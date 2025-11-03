const { User } = require("../models");
const bcrypt = require("bcrypt");

const userJoin = async (body) => {
    const {
        email,
        zipCode,
        password,
        name,
        baseAddress,
        detailAddress,
        phone,
    } = body;
    try {
        const hashedPassword = await bcrypt.hash(password, 12);

        const result = await User.create({
            email,
            password: hashedPassword,
            postcode: zipCode,
            name,
            address : baseAddress,
            detail_address : detailAddress,
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
const userInformation = async (email) => {
    try {
        const userInfo = await User.findOne({ where: { email } });
        return userInfo;
    } catch (error) {
        console.error(error);
    }
};

const userChangePassword = async (email, newPassword) => {
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    try {
        const result = await User.update(
            {
                password : hashedPassword
            },
            { where: { email } }
        );
        return result;
    } catch (error) {
        console.error(error);
    }
};

const findByUserEmail = async (email) => {
    try {
        const result = await User.findOne({ where: { email }, raw: true });
        return result
    } catch (error) {
        console.error(error);
    }
};

const userEdit = async (email, body) => {
    console.log("body", body);

    const {
        name,
        postcode,
        address,
        detail_address,
        phone,
    } = body;

    try {
        const result = await User.update(
            {
                name,
                postcode,
                address,
                detail_address,
                phone,
            },
            { where: { email } }
        );
        return result;
    } catch (error) {
        console.error(error);
    }
}

module.exports = {
    userJoin,
    userLogin,
    userEdit,
    userInformation,
    userChangePassword,
    findByUserEmail,
};