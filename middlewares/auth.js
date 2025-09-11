const jwt = require('jsonwebtoken');
const { Organization } = require('../models');

// 로그인 상태 확인 미들웨어
const isLoggedIn = async (req, res, next) => {
    try {
        // 헤더나 요청 본문에서 토큰 찾기
        const token = req.headers.authorization?.split(' ')[1] || req.body.device_code;
        
        if (!token) {
            return res.status(401).json({ message: '로그인이 필요합니다.' });
        }

        // device_code로 요청이 온 경우
        if (req.body.device_code) {
            const organization = await Organization.findOne({
                where: { device_code: token }
            });

            if (!organization) {
                return res.status(401).json({ message: '유효하지 않은 디바이스 코드입니다.' });
            }

            req.organization = organization;
            return next();
        }

        // JWT 토큰으로 요청이 온 경우
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const organization = await Organization.findOne({
            where: { org_id: decoded.org_id }
        });

        if (!organization) {
            return res.status(401).json({ message: '유효하지 않은 사용자입니다.' });
        }

        req.organization = organization;
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: '유효하지 않은 토큰입니다.' });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: '만료된 토큰입니다.' });
        }
        return res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
};

// 비로그인 상태 확인 미들웨어
const isNotLoggedIn = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1] || req.body.device_code;
        
        if (token) {
            return res.status(400).json({ message: '이미 로그인되어 있습니다.' });
        }
        
        next();
    } catch (error) {
        next(error);
    }
};

module.exports = {
    isLoggedIn,
    isNotLoggedIn
}; 