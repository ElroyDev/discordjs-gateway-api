import WebSocket from 'ws';
import process from 'node:process';

const GATEWAY_URL = "wss://gateway.discord.gg/?v=10&encoding=json";
const ws = new WebSocket(GATEWAY_URL);

ws.on('open', () => {
    console.log("WebSocket bağlantısı açıldı.");
});

ws.on('message', (data) => {
    const payload = JSON.parse(data.toString());
    const { op, t, d } = payload;

    console.log(`Gelen mesaj: ${t}`, d);


    if (op === 10) {
        const heartbeat_interval = d.heartbeat_interval;

        setInterval(() => {
            ws.send(JSON.stringify({ op: 1, d: null }));
            console.log("Heartbeat gönderildi.");
        }, heartbeat_interval);

        const identifyPayload = {
            op: 2,
            d: {
                token: process.env.DISCORD_TOKEN,
                intents: 0,
                properties: {
                    os: "linux",
                    browser: "my_library",
                    device: "my_library"
                }
            }
        };
        ws.send(JSON.stringify(identifyPayload));
        console.log("Bot tanımlama isteği gönderildi.");
    }

    if (t === "READY") {
        setTimeout(() => {
            const presenceUpdate = {
                op: 3,
                d: {
                    since: null,
                    activities: [{
                        name: "WebSocket ile bağlandım!",
                        type: 0 // 0 = Oynuyor, 1 = Yayında, 2 = Dinliyor, 3 = İzliyor
                    }],
                    status: "online", // online, idle, dnd, invisible olabilir
                    afk: false
                }
            };
            ws.send(JSON.stringify(presenceUpdate));
            console.log("Durum güncellendi: 'WebSocket ile bağlandım!'");
        }, 3000);
    }
});

ws.on('close', (code, reason) => {
    console.log(`Bağlantı kapandı: ${code}, Sebep: ${reason}`);
});

ws.on('error', (error) => {
    console.error("WebSocket hatası:", error);
});
