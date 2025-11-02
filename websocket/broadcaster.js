// websocket/broadcaster.js
// WebSocket 클라이언트 관리 및 브로드캐스트 기능

const clients = new Set();

/**
 * 웹소켓 클라이언트 추가
 * @param {WebSocket} ws - 웹소켓 클라이언트
 */
function addClient(ws) {
    clients.add(ws);
    console.log(`[Broadcaster] 클라이언트 추가됨. 현재 연결: ${clients.size}개`);
}

/**
 * 웹소켓 클라이언트 제거
 * @param {WebSocket} ws - 웹소켓 클라이언트
 */
function removeClient(ws) {
    clients.delete(ws);
    console.log(`[Broadcaster] 클라이언트 제거됨. 현재 연결: ${clients.size}개`);
}

/**
 * 연결된 모든 클라이언트에게 JSON 데이터를 브로드캐스트
 * @param {Object} data - 전송할 데이터 객체
 * @returns {Object} - {success: 성공 수, fail: 실패 수, total: 전체 클라이언트 수}
 */
function broadcastJSON(data) {
    const msg = JSON.stringify(data);
    let success = 0;
    let fail = 0;

    for (const client of clients) {
        // readyState === 1 은 OPEN 상태
        if (client.readyState === 1) {
            try {
                client.send(msg);
                success++;
            } catch (error) {
                console.error("WS send fail:", error?.message);
                fail++;
            }
        }
    }

    return {
        success,
        fail,
        total: clients.size
    };
}

/**
 * 디바이스 데이터를 웹소켓으로 브로드캐스트
 * @param {Array} devicesData - 디바이스 데이터 배열 [{ deviceAddress, deviceData }, ...]
 */
function broadcastDeviceData(devicesData) {
    // console.log(`[Broadcaster] 디바이스 데이터 브로드캐스트 시작: ${devicesData.length}개 디바이스, 연결된 클라이언트: ${clients.size}개`);

    // 각 디바이스별로 데이터 파싱
    const devices = devicesData.map(device => {
        const { deviceAddress, deviceData } = device;

        return {
            deviceAddress,
            deviceData: deviceData.map(row => {
                const values = row.split(',');
                return {
                    timestamp: values[0] || '',
                    ir: values[1] || '',
                    red: values[2] || '',
                    green: values[3] || '',
                    spo2: values[4] || '',
                    hr: values[5] || '',
                    temp: values[6] || '',
                    battery: values[7] || ''
                };
            })
        };
    });

    // devices 배열만 전송
    const result = broadcastJSON(devices);
    // console.log(`[Broadcaster] 브로드캐스트 완료: ${devices.length}개 디바이스, success=${result.success}, fail=${result.fail}`);
    return result;
}

module.exports = {
    addClient,
    removeClient,
    broadcastJSON,
    broadcastDeviceData
};
