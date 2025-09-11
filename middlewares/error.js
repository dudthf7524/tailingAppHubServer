const errorHandler = (err, req, res, next) => {
    console.error(err.stack);

    // Sequelize 에러 처리
    if (err.name === 'SequelizeValidationError') {
        return res.status(400).json({
            message: '입력값이 올바르지 않습니다.',
            errors: err.errors.map(e => e.message)
        });
    }

    // Sequelize 고유 제약 조건 위반
    if (err.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({
            message: '이미 존재하는 데이터입니다.',
            errors: err.errors.map(e => e.message)
        });
    }

    // 기본 에러 응답
    res.status(err.status || 500).json({
        message: err.message || '서버 오류가 발생했습니다.'
    });
};

module.exports = errorHandler; 