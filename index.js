const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const { promisify } = require("util");
const readFile = promisify(fs.readFile);
const unlinkFile = promisify(fs.unlink);
const sharp = require("sharp");

const app = express();
const port = 3500;

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
app.use(cors());
const upload = multer({ storage: storage });

app.post("/upload", upload.single("image"), async (req, res) => {
  try {
    const imageBuffer = await sharp(req.file.path)
      .resize({ width: 500 })
      .toBuffer();
    const base64Image = imageBuffer.toString("base64");
    await unlinkFile(req.file.path);
    res.json({ img: base64Image });
  } catch (err) {
    console.error(err);
    res.status(500).send("An error occurred");
  }
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
