const express = require("express");
const net = require("net");
const cors = require("cors");
const app = express();

// More explicit CORS configuration
app.use(
  cors({
    origin: "*", // Be careful with this in production
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  }),
);

app.use(express.text());

// Test GET route still works
app.get("/test", (req, res) => {
  res.send("Server is running");
});

// Add OPTIONS handling for CORS preflight
app.options("/print", cors());

app.post("/print", async (req, res) => {
  console.log("Received print request with body:", req.body);

  try {
    const client = new net.Socket();

    await new Promise((resolve, reject) => {
      client.connect(9100, "192.168.1.192", () => {
        console.log("Connected to printer");
        client.write(req.body, (err) => {
          if (err) {
            reject(err);
          } else {
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
