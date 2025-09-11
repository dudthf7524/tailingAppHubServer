const express = require("express");
const fs = require("fs");
const path = require("path");
const app = express();
const { MacAddress } = require('./models');
require('dotenv').config();

app.use(express.json());
app.use(express.text({ type: 'text/plain' }));

// 2. 또는 모든 텍스트 타입 허용
app.use(express.text({ type: 'text/*' }));
const db = require("./models/index.js");
const userRouter = require("./controller/user.js");
const hubRouter = require("./controller/hub.js");


db.sequelize
    .sync()
    .then(async () => {
        console.log("MYSQL DATABASE CONNECTED");
    })

// ── 1) 최초 한 번만 파일명 생성 (초까지 포함해도 OK) ──
function sessionFileName() {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const h = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    const s = String(d.getSeconds()).padStart(2, '0');
    return `누렁이_tailing_1999-05-04_${y}-${m}-${day}_${h}시${min}분${s}초.csv`;
}

const OUT_DIR = path.join(process.cwd(), 'data');
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

// ── 2) 버퍼 및 "세션 파일명" 고정 ──
let buffer = [];
const currentFile = sessionFileName();    // ← 여기서 한 번만 결정!
const FLUSH_MS = 1000;                    // 1초마다 파일에 쓰기

function ensureHeader(filePath) {
    if (!fs.existsSync(filePath) || fs.statSync(filePath).size === 0) {
        const header = [
            'ts', 'hr', 'spo2', 'temp', 'red', 'ir', 'green', 'battery'
        ].join(',') + '\n';
        fs.appendFileSync(filePath, header);
    }
}

function flush() {
    if (buffer.length === 0) return;

    // ── 3) 더 이상 파일명 재계산/변경하지 않음 ──
    const filePath = path.join(OUT_DIR, currentFile);
    ensureHeader(filePath);

    const chunk = buffer.join('');
    buffer = [];
    fs.appendFile(filePath, chunk, (err) => {
        if (err) console.error('CSV write error:', err);
    });
}

setInterval(flush, FLUSH_MS);

app.post('/ingest', (req, res) => {
    console.log(req.body)
    const d = req.body || {};
    if (!d.deviceId || !Number.isFinite(d.ts)) {
        return res.status(400).json({ ok: false, error: 'bad_payload' });
    }

    const line = [
        d.ts, d.hr ?? '', d.spo2 ?? '', d.temp ?? '',
        d.red ?? '', d.ir ?? '', d.green ?? '', d.battery ?? ''
    ].join(',') + '\n';

    buffer.push(line);
    res.json({ ok: true });
});

function shutdown() {
    try { flush(); } finally { process.exit(0); }
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

const port = 3060;

app.listen(port, () => {
    console.log(`server on port => ${port}`)
});



app.get('/files', async (req, res) => {
    var macAddress;
    try {
        const result = await MacAddress.findAll({
            attributes: ['mac_address', 'device_name']
        })
        macAddress = result;
        console.log("lresultst", result)
        // return res.json({result : result})
    } catch (error) {
        console.error(error)
    }
    const dir = path.join(process.cwd(), 'data');

    // 요청 호스트로 URL 자동 구성 (개발/운영 모두 동작)
    const baseUrl = `${req.protocol}://${req.get('host')}`;

    const files = fs
        .readdirSync(dir)
        .filter(n => n.endsWith('.csv') || n.endsWith('.xlsx'))
        .map(name => {
            // 확장자 분리
            const { name: base, ext } = path.parse(name); // base: 파일명(확장자 제외)
            const sub = base.split('_')

            // "누렁이_tailing_1999_05_24" -> ["누렁이","tailing","1999","05","24"]
            const parts = base.split('_');
            if (parts.length > 1) {
                // 두 번째 조각(tailing) 제거
                parts.splice(1, 1);
            }
            const displayBase = parts.join('_'); // "누렁이_1999_05_24"
            const displayName = `${displayBase}`; // 확장자 원복

            const found = macAddress.find(d => d.mac_address === sub[1])
            console.log("found", found.device_name)

            const device_name = found.device_name;

            return {
                // 실제 파일명(다운로드에 사용)
                name,
                // 화면에 보여줄 이름
                displayName,
                device_name,
                url: `${baseUrl}/download/${encodeURIComponent(name)}`,
                mime: ext === '.csv'
                    ? 'text/csv'
                    : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            };
        });

    res.json(files);
});

app.post('/data/downloadCSV', (req, res) => {
    const { filename } = req.body || {};
    if (!filename) return res.status(400).send('filename required');

    const filePath = path.join(process.cwd(), 'data', filename);
    if (!fs.existsSync(filePath)) return res.status(404).send('not found');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    // 다운로드 시 원래 이름 유지하려면:
    // res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
    const csv = fs.readFileSync(filePath, 'utf8');
    console.log("csv", csv)
    res.send(csv);
});

// 실제 다운로드 라우트
app.get('/download/:name', (req, res) => {
    const f = path.join(process.cwd(), 'data', req.params.name);
    if (!fs.existsSync(f)) return res.sendStatus(404);
    res.download(f); // Content-Disposition로 파일 전송
});

app.get('/devices', async (req, res) => {
    try {
        const result = await MacAddress.findAll({
            attributes: ['mac_address', 'device_name']
        })
        return res.json(result)
    } catch (error) {
        console.error(error)
    }
})

app.put('/devices/edit', async (req, res) => {
    try {
        const { mac_address, device_name } = req.body;

        if (!mac_address || !device_name) {
            return res.status(400).json({ ok: false, error: 'mac_address와 device_name이 필요합니다.' });
        }

        // DB 업데이트
        const [affectedRows] = await db.MacAddress.update(
            { device_name },                // 바꿀 값
            { where: { mac_address } }      // 조건
        );

        if (affectedRows === 0) {
            return res.status(404).json({ ok: false, error: '해당 기기를 찾을 수 없습니다.' });
        }

        return res.json({ ok: true, mac_address, device_name });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, error: '서버 오류' });
    }
});

// app.post('/data', async (req, res) => {
//   const now = new Date();
//   const timestamp = now.toLocaleDateString('ko-KR', { timeZone: 'Asia/Seoul' }) + ' ' +
//                     now.toLocaleTimeString('ko-KR', { timeZone: 'Asia/Seoul' }) + '.' +
//                     now.getMilliseconds().toString().padStart(3, '0');

//   console.log(`[${timestamp}] req.body:`,  req.body);



//   return res.send('응답');
// });

const dataDir = path.join(__dirname, 'data'); // data 폴더 경로
const csvPath = path.join(dataDir, 'tailing_data.csv');

// data 폴더가 없으면 생성
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}


app.post('/data', async (req, res) => {
    const now = new Date();
    const timestamp = now.toLocaleDateString('ko-KR', { timeZone: 'Asia/Seoul' }) + ' ' +
        now.toLocaleTimeString('ko-KR', { timeZone: 'Asia/Seoul' }) + '.' +
        now.getMilliseconds().toString().padStart(3, '0');

    //   console.log(`[${timestamp}] req.body:`, req.body);
    console.log("req.body", req.body.length)
    // CSV에 데이터 저장
    try {
        const lines = req.body.map(line => {
            // 'tailing,8221,39655,...' → ['tailing', '8221', '39655', ...]
            const parts = line.split(',');

            // 첫 번째 'tailing' 제거
            parts.shift();

            // CSV 문자열로 변환
            return parts.join(',');
        });

        // 한 번에 append
        fs.appendFileSync(csvPath, lines.join('\n') + '\n', 'utf8');

        res.send('데이터 저장 완료');
    } catch (err) {
        console.error('CSV 저장 오류:', err);
        res.status(500).send('저장 실패');
    }
});

app.post('/check/register/hub', async (req, res) => {
    console.log('req.body', req.body)
    const macAddress = req.body.macAddress;
    try {
        const result = await db.Hub.findOne(
            { where: { address: macAddress } }      // 조건
        );
        console.log(result.org_email)
        if (result) {
            result.org_email
            res.json(result.org_email)
        } else {
            res.json('')
        }
    } catch (error) {

    }
});

app.use("/user", userRouter);
app.use("/hub", hubRouter);