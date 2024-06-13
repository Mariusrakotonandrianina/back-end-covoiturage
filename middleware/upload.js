const { dirname } = require('path');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

function generateUniqueFilename(file) {
  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
  const ext = path.extname(file.originalname);
  return file.fieldname + '-' + uniqueSuffix + ext;
}

const destination2 = path.join(__dirname, '../../frontIhm/public/image');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const destination1 = path.join(__dirname, '../../frontihmutilisateur/public/images');
    cb(null, destination1);
  },
  filename: (req, file, cb) => {
    const filename = generateUniqueFilename(file);
    cb(null, filename);
  },
});

const upload = multer({ storage: storage });

const imagesUpload = (req, res, next) => {
  upload.single('imageVehicule')(req, res, (err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const originalPath = req.file.path;
    const newPath2 = path.join(destination2, req.file.filename);

    const readStream = fs.createReadStream(originalPath);
    const writeStream = fs.createWriteStream(newPath2);

    readStream.pipe(writeStream).on('finish', () => {
      next();
    }).on('error', (err) => {
      return res.status(500).json({ error: "Error saving the file" });
    });
  });
};

module.exports = imagesUpload;
