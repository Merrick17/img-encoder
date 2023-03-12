const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const { promisify } = require("util");
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
    const imagePath = req.file.path;
    const imageStream = fs.createReadStream(imagePath);
    const imageResizer = sharp(); 
    const compressedImageStream = imageStream.pipe(imageResizer);
    const chunks = [];

    compressedImageStream.on("data", (chunk) => {
      chunks.push(chunk);
    });

    compressedImageStream.on("end", async () => {
      const compressedImageBuffer = Buffer.concat(chunks);
      const base64Image = compressedImageBuffer.toString("base64");
      await unlinkFile(imagePath);
      res.json({ img: base64Image });
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("An error occurred");
  }
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});