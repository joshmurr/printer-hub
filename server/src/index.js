const express = require("express");
const net = require("net");
const cors = require("cors");
const app = express();

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  }),
);

// Add raw body parsing for binary data
app.use((req, _, next) => {
  if (req.headers["content-type"] === "application/octet-stream") {
    let data = [];
    req.on("data", (chunk) => {
      data.push(chunk);
    });
    req.on("end", () => {
      req.body = Buffer.concat(data);
      next();
    });
  } else {
    next();
  }
});

// Keep text middleware for text requests
app.use(express.text());

app.options("/print", cors());

app.get("/test", (_, res) => {
  console.log("Received test request");
  res.status(200).send("Test request received");
});

app.post("/print", async (req, res) => {
  console.log(
    "Received print request with content-type:",
    req.headers["content-type"],
  );
  console.log("Body length:", req.body.length);

  try {
    const client = new net.Socket();

    await new Promise((resolve, reject) => {
      client.connect(9100, "192.168.1.192", () => {
        console.log("Connected to printer");
        client.write(req.body, (err) => {
          if (err) {
            console.error("Printer error:", err);
            reject(err);
          } else {
            console.log("Print job sent successfully");
            client.end();
            resolve();
          }
        });
      });

      client.on("error", (err) => {
        console.error("Printer error:", err);
        reject(err);
      });
    });

    console.log("Print job completed");
    res.status(200).send("Print job sent");
  } catch (error) {
    console.error("Error in print job:", error);
    res.status(500).send(error.message);
  }
});

app.listen(3001, "0.0.0.0", () => {
  console.log("Server running on port 3001");
});
