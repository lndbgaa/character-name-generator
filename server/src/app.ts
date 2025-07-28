import express from "express";

import config from "@/config/app.config.js";

const app = express();
const PORT = config.port;

app.get("/", (req, res) => {
  res.json({ status: "Server is up and running!" });
});

app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});
