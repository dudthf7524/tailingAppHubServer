const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'naver',
    auth: {
        user: process.env.EMAILADDRESS,
        pass: process.env.EMAILPASSWORD,
    },
});

async function sendEmail(user_id, email_verification_number) {
    console.log(user_id, email_verification_number)
    try {
        await transporter.sendMail({
            from: 'creamoff2021@naver.com',
            to: user_id,
            subject: '이메일 인증',
            text: `인증 번호는 ${email_verification_number} 입니다.`,
        });

        return true;
    } catch (error) {
        console.error('이메일 발송 실패:', error);
        return false;
    }
}

module.exports = {
    sendEmail
};
