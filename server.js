// server.js (CommonJS)
const express = require("express");
const fs = require("fs");
const path = require("path");
const { createServer } = require("http");
const { Server: WebSocketServer } = require("ws");
require("dotenv").config();

const db = require("./models/index.js");
const { MacAddress } = require("./models");
const userController = require("./controller/user.js");
const hubController = require("./controller/hub.js");
const deviceController = require("./controller/device.js");
const petController = require("./controller/pet.js");
const authController = require("./controller/auth.js");
const checkController = require("./controller/check.js");

const app = express();
const port = Number(process.env.PORT || 3080);
const WS_PATH = process.env.WS_PATH || "/ws";

// ---------- Middleware ----------
app.use(express.json());
app.use(express.text());

// ---------- DB Connect ----------
db.sequelize.sync().then(async () => {
    console.log("MYSQL DATABASE CONNECTED");
});

// ---------- CSV Buffering Utilities ----------
const OUT_DIR = path.join(process.cwd(), "data");
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

function sessionFileName(macAddress) {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const h = String(d.getHours()).padStart(2, "0");
    const min = String(d.getMinutes()).padStart(2, "0");
    const s = String(d.getSeconds()).padStart(2, "0");
    return `tailing_${macAddress}_${y}-${m}-${day}_${h}시${min}분${s}초.csv`;
}

function ensureHeader(filePath) {
    if (!fs.existsSync(filePath) || fs.statSync(filePath).size === 0) {
        const header = [
            "ts",
            "hr",
            "spo2",
            "temp",
            "red",
            "ir",
            "green",
            "battery",
        ].join(",") + "\n";
        fs.appendFileSync(filePath, header);
    }
}

const buffers = new Map(); // mac -> { buffer: [], fileName, lastFlush }
function getOrCreateBuffer(macAddress) {
    if (!buffers.has(macAddress)) {
        buffers.set(macAddress, {
            buffer: [],
            fileName: sessionFileName(macAddress),
            lastFlush: Date.now(),
        });
    };
    return buffers.get(macAddress);
}

function flushAll() {
    const now = Date.now();
    for (const [macAddress, buf] of buffers.entries()) {
        if (buf.buffer.length === 0) continue;
        const filePath = path.join(OUT_DIR, buf.fileName);
        ensureHeader(filePath);
        const chunk = buf.buffer.join("");
        buf.buffer = [];
        buf.lastFlush = now;
        try {
            fs.appendFileSync(filePath, chunk);
        } catch (err) {
            console.error(`[${macAddress}] CSV write error:`, err);
        }
    }
}

// ---------- WebSocket (Apps) ----------
const server = createServer(app);
const wss = new WebSocketServer({ server, path: WS_PATH });
const clients = new Set();

wss.on("connection", (ws, req) => {
    const ip = req.socket.remoteAddress;
    console.log("🔌 WS client connected:", ip);
    clients.add(ws);

    ws.send(JSON.stringify({ type: "welcome", message: "connected to telemetry WS" }));

    ws.on("message", (msg) => {
        let data = null;
        try { data = JSON.parse(msg.toString()); } catch { }
        if (data?.type === "ping") {
            ws.send(JSON.stringify({ type: "pong", ts: Date.now() }));
            return;
        }
        console.log("💬 WS from client:", msg.toString());
    });

    ws.on("close", () => {
        console.log("🔌 WS client disconnected:", ip);
        clients.delete(ws);
    });

    ws.on("error", (err) => {
        console.error("WS error:", err?.message);
        clients.delete(ws);
    });
});

// body가 hubs 또는 events 어떤 형태로 와도 { hubs: {...} }로 통일
function toHubsShape(body) {
    // 이미 hubs 구조면 그대로 감싸서 반환
    if (body?.hubs) {
        return { hubs: body.hubs };
    }

    // events 배치일 경우 단순 변환 (latest 기준만 생성, history는 빈 배열)
    if (Array.isArray(body?.events)) {
        const hubId = body.hubId || 'hub1';
        const devices = {};

        for (const e of body.events) {
            if (!e?.deviceId) continue;
            const latest = {
                ts: e.ts,
                cnt: e.cnt,
                hr: e.hr,
                spo2: e.spo2,
                temp: e.temp,
                red: e.red,
                ir: e.ir,
                green: e.green,
                battery: e.battery,
            };
            // 가장 최근(ts 또는 cnt)만 latest에 남도록 갱신
            const prev = devices[e.deviceId]?.latest;
            const isNewer =
                prev == null ||
                (Number.isFinite(latest.ts) && latest.ts > prev.ts) ||
                (Number.isFinite(latest.cnt) && latest.cnt > (prev.cnt ?? -1));

            if (isNewer) {
                devices[e.deviceId] = { latest, history: [] };
            } else if (!devices[e.deviceId]) {
                devices[e.deviceId] = { latest, history: [] };
            }
        }

        return { hubs: { [hubId]: { devices } } };
    }

    // 알 수 없는 형태면 빈 hubs
    return { hubs: {} };
}

function broadcastJSON(obj) {
    const msg = JSON.stringify(obj);
    let success = 0, fail = 0;
    for (const c of clients) {
        if (c.readyState === 1) {
            try { c.send(msg); success++; }
            catch (e) { console.error("WS send fail:", e?.message); fail++; }
        }
    }
    // const hubsPayload = toHubsShape(body);
    // const stats = broadcastJSON(hubsPayload);
    return { success, fail, total: clients.size };
}

// ---------- HTTP: Hub ingest(s) ----------
// CSV 저장용(배열 or 단건) — 기존 /ingest 와 충돌하므로 경로를 변경
app.post("/ingest-csv", (req, res) => {
    const now = new Date();
    const timestamp =
        now.toLocaleString("ko-KR", { timeZone: "Asia/Seoul" }) +
        "." +
        now.getMilliseconds().toString().padStart(3, "0");
    console.log("\n[CSV Ingest]", timestamp);

    if (Array.isArray(req.body)) {
        const dataArray = req.body;
        const macGroups = new Map();
        let validCount = 0;

        for (const d of dataArray) {
            if (!d.deviceId || !Number.isFinite(d.ts) || !d.macAddress) continue;
            if (!macGroups.has(d.macAddress)) macGroups.set(d.macAddress, []);
            macGroups.get(d.macAddress).push(d);
            validCount++;
        }

        for (const [macAddress, list] of macGroups.entries()) {
            const buf = getOrCreateBuffer(macAddress);
            for (const d of list) {
                const line = [
                    d.ts,
                    d.hr ?? "",
                    d.spo2 ?? "",
                    d.temp ?? "",
                    d.red ?? "",
                    d.ir ?? "",
                    d.green ?? "",
                    d.battery ?? "",
                ].join(",") + "\n";
                buf.buffer.push(line);
            }
        }

        for (const [mac, buf] of buffers.entries()) {
            console.log(`[MAC: ${mac}] 버퍼 크기: ${buf.buffer.length}줄`);
        }

        flushAll(); // 즉시 기록
        console.log("[CSV Ingest] flush done");
        return res.json({ ok: true, received: dataArray.length, processed: validCount });
    }

    // 단건
    const d = req.body || {};
    if (!d.deviceId || !Number.isFinite(d.ts) || !d.macAddress) {
        return res.status(400).json({ ok: false, error: "bad_payload" });
    }
    const buf = getOrCreateBuffer(d.macAddress);
    const line = [
        d.ts,
        d.hr ?? "",
        d.spo2 ?? "",
        d.temp ?? "",
        d.red ?? "",
        d.ir ?? "",
        d.green ?? "",
        d.battery ?? "",
    ].join(",") + "\n";
    buf.buffer.push(line);
    flushAll();
    return res.json({ ok: true });
});

// 텔레메트리(허브 → 서버 → 앱 WS 브로드캐스트) — JSON(hubs|events)
async function handleIngest(req, res) {
    try {
        const body = req.body;

        console.log("body : ", JSON.stringify(body));

        const now = new Date();
        const today = now.toLocaleString("ko-KR", {
            timeZone: "Asia/Seoul",
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        }) + "." + now.getMilliseconds().toString().padStart(3, "0");
        console.log("today", today);
        if (!body || typeof body !== "object") {
            return res.status(400).json({ error: "Invalid JSON body" });
        }

        const hub = body?.hub;
        const events = body?.events;
        if (!hub && !events) {
            return res.status(400).json({ error: 'Missing "hubs" or "events" in body' });
        }

        // console.log("📦 허브 데이터 수신됨");
        // console.log("-------------------------------");
        // console.log("Time:", new Date().toISOString());
        // console.log("Type:", hubs ? "hubs" : "events");
        // console.log(
        //     "Hub ID:",
        //     hubs ? Object.keys(hubs)[0] : body?.hubId
        // );
        // console.log(
        //     "Device Count:",
        //     hubs
        //         ? Object.keys(hubs[Object.keys(hubs)[0]]?.devices ?? {}).length
        //         : (events?.length ?? 0)
        // );
        // console.log(
        //     "샘플 데이터:",
        //     hubs
        //         ? hubs[Object.keys(hubs)[0]]?.devices &&
        //         Object.entries(hubs[Object.keys(hubs)[0]].devices)[0]
        //         : events?.[0]
        // );
        // console.log("-------------------------------\n");

        // 앱으로 브로드캐스트
        const envelope = {
            type: "telemetry",
            ts: Date.now(),
            data: body, // hubs 또는 events 원본 그대로
        };
        const stats = broadcastJSON(body);
        // console.log(
        //     `📤 앱으로 브로드캐스트: success=${stats.success}, fail=${stats.fail}, total=${stats.total}`
        // ); 

        // 빠른 ACK
        return res.status(202).json({ ok: true });
    } catch (err) {
        console.error("❌ ingest error:", err.message);
        return res.status(500).json({ error: "internal error" });
    }
}

app.post("/", handleIngest);
app.post("/ingest", handleIngest);

app.post("/hub", async (req, res) => {
    console.log("req.body : ", req.body);
    console.log("req.body : ", req.body);
    console.log("req.body : ", req.body);
    console.log("req.body : ", req.body);
    console.log("req.body : ", req.body);
});

app.post("/external", async (req, res) => {
    console.log("req.body : ", req.body.data);

    const now = new Date();
    const today = now.toLocaleString("ko-KR", {
        timeZone: "Asia/Seoul",
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    }) + "." + now.getMilliseconds().toString().padStart(3, "0");
    console.log("today", today)
    res.send("ok")
});

app.post("/sum", async (req, res) => {
    console.log("req.body", req.body.length);
    const now = new Date();
    const today = now.toLocaleString("ko-KR", {
        timeZone: "Asia/Seoul",
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    }) + "." + now.getMilliseconds().toString().padStart(3, "0");
    console.log("today", today);
    res.send("ok");
})

// ---------- 기타 라우트(파일/디바이스) ----------
app.get("/files", async (req, res) => {
    let macAddress = [];
    try {
        macAddress = await MacAddress.findAll({ attributes: ["mac_address", "device_name"] });
    } catch (error) {
        console.error(error);
    }

    const dir = path.join(process.cwd(), "data");
    const baseUrl = `${req.protocol}://${req.get("host")}`;

    const files = fs
        .readdirSync(dir)
        .filter((n) => n.endsWith(".csv") || n.endsWith(".xlsx"))
        .map((name) => {
            const { name: base, ext } = path.parse(name);
            const sub = base.split("_");

            const parts = base.split("_");
            if (parts.length > 1) parts.splice(1, 1); // 두번째(tailing) 제거
            const displayBase = parts.join("_");

            const found = macAddress.find((d) => d.mac_address === sub[1]);
            const device_name = found?.device_name || "";

            return {
                name,
                displayName: `${displayBase}`,
                device_name,
                url: `${baseUrl}/download/${encodeURIComponent(name)}`,
                mime:
                    ext === ".csv"
                        ? "text/csv"
                        : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            };
        });

    res.json(files);
});

app.post("/data/downloadCSV", (req, res) => {
    const { filename } = req.body || {};
    if (!filename) return res.status(400).send("filename required");
    const filePath = path.join(process.cwd(), "data", filename);
    if (!fs.existsSync(filePath)) return res.status(404).send("not found");
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    const csv = fs.readFileSync(filePath, "utf8");
    res.send(csv);
});

app.get("/download/:name", (req, res) => {
    const f = path.join(process.cwd(), "data", req.params.name);
    if (!fs.existsSync(f)) return res.sendStatus(404);
    res.download(f);
});

app.get("/devices", async (req, res) => {
    try {
        const result = await MacAddress.findAll({
            attributes: ["mac_address", "device_name"],
        });
        return res.json(result);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ ok: false });
    }
});

app.put("/devices/edit", async (req, res) => {
    try {
        const { mac_address, device_name } = req.body;
        if (!mac_address || !device_name) {
            return res
                .status(400)
                .json({ ok: false, error: "mac_address와 device_name이 필요합니다." });
        }
        const [affectedRows] = await db.MacAddress.update(
            { device_name },
            { where: { mac_address } }
        );
        if (affectedRows === 0) {
            return res
                .status(404)
                .json({ ok: false, error: "해당 기기를 찾을 수 없습니다." });
        }
        return res.json({ ok: true, mac_address, device_name });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, error: "서버 오류" });
    }
});

// 예시 /data 라우트(중복 제거; 필요한 한 개만 유지하세요)
app.post("/data", async (req, res) => {
    const now = new Date();
    const timestamp =
        now.toLocaleDateString("ko-KR", { timeZone: "Asia/Seoul" }) +
        " " +
        now.toLocaleTimeString("ko-KR", { timeZone: "Asia/Seoul" }) +
        "." +
        now.getMilliseconds().toString().padStart(3, "0");
    console.log(`[${timestamp}] /data length:`, Array.isArray(req.body) ? req.body.length : 1);
    return res.send("응답");
});

// ---------- Controllers ----------
app.use("/user", userController);
app.use("/hub", hubController);
app.use("/device", deviceController);
app.use("/pet", petController);
app.use("/auth", authController);
app.use("/check", checkController);

// ---------- Start (single listen) ----------
server.listen(port, () => {
    console.log(`✅ HTTP+WS server listening on :${port}`);
    console.log(`   - HTTP ingest: POST http://<host>:${port}/  or /ingest`);
    console.log(`   - CSV ingest : POST http://<host>:${port}/ingest-csv`);
    console.log(`   - WS for apps: ws://<host>:${port}${WS_PATH}`);
});

// ---------- Graceful Shutdown ----------
function shutdown() {
    try { flushAll(); } finally { process.exit(0); }
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
