const http = require("http");
const https = require("https");
const fs = require("fs");
const path = require("path");

const DIR = __dirname;

const MIME = {
    ".html": "text/html",
    ".css": "text/css",
    ".js": "application/javascript",
    ".json": "application/json",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".svg": "image/svg+xml",
    ".ico": "image/x-icon",
    ".webmanifest": "application/manifest+json",
};

function handler(req, res) {
    let filePath = path.join(DIR, req.url === "/" ? "index.html" : req.url.split("?")[0]);
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME[ext] || "application/octet-stream";

    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404);
            res.end("Not found");
            return;
        }
        res.writeHead(200, { "Content-Type": contentType });
        res.end(data);
    });
}

// Railway sets PORT env var and handles HTTPS/SSL termination.
// Locally, use HTTPS with self-signed certs for mic access.
if (process.env.RAILWAY_ENVIRONMENT) {
    const PORT = process.env.PORT || 8080;
    http.createServer(handler).listen(PORT, "0.0.0.0", () => {
        console.log(`Running on Railway, port ${PORT}`);
    });
} else {
    const PORT = 8443;
    const certPath = path.join(DIR, "cert.pem");
    const keyPath = path.join(DIR, "key.pem");

    if (fs.existsSync(certPath) && fs.existsSync(keyPath)) {
        const options = {
            key: fs.readFileSync(keyPath),
            cert: fs.readFileSync(certPath),
        };
        https.createServer(options, handler).listen(PORT, "0.0.0.0", () => {
            console.log(`\n  Colton's Reading App (HTTPS)\n`);
            console.log(`  Local:   https://localhost:${PORT}`);
            console.log(`  Network: https://192.168.1.144:${PORT}\n`);
        });
    } else {
        http.createServer(handler).listen(PORT, "0.0.0.0", () => {
            console.log(`\n  Colton's Reading App (HTTP)\n`);
            console.log(`  Local:   http://localhost:${PORT}\n`);
        });
    }
}
