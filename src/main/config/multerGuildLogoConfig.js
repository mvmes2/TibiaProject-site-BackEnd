const path = require('path');
const multer = require('multer');
const fs = require('fs');
const sharp = require('sharp');

const storageGuildLogos = multer.diskStorage({
  destination: (req, file, cb) => {
    const destinationPath = path.join(__dirname, '..', 'resources', 'guild-logos');
    if (!fs.existsSync(destinationPath)) {
      fs.mkdirSync(destinationPath, { recursive: true });
  }
    cb(null, destinationPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const fileExt = path.extname(file.originalname);
    const newFilename = uniqueSuffix + fileExt;
    cb(null, newFilename);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png'];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG and PNG files are allowed.'), false);
  }
};

const uploadGuildLogo = multer({
  storage: storageGuildLogos,
  fileFilter: fileFilter,
  limits: { fileSize: 1 * 600 * 1024 }
}).array('files', 1);

const compressImage = async (inputPath, outputPath) => {
  try {
    const { ext } = path.parse(inputPath);
    const outputFileName = outputPath + ext;
    let transformer;

    if (ext === '.jpg' || ext === '.jpeg') {
      transformer = sharp(inputPath).jpeg({ quality: 25 });
    } else if (ext === '.png') {
      transformer = sharp(inputPath).png({ quality: 25 });
    } else {
      throw new Error('Invalid file type. Only JPEG and PNG files are allowed.');
    }

    await transformer.toFile(outputFileName);
  } catch (error) {
    throw error;
  }
};

const compressGuildLogosMiddleware = async (req, res, next) => {
  try {
    if (req.files && req.files.length > 0) {
      for (let i = 0; i < req.files.length; i++) {
        const inputPath = req.files[i].path;
        const fileName = req.files[i].filename;
        const { name, ext } = path.parse(fileName);
        const outputFileName = name + '-compressed';
        const outputPath = path.join(__dirname, '..', 'resources', 'guild-logos', 'compressed', outputFileName);

        // Verificar e criar o diretório 'compressed', se necessário
        const compressedDir = path.join(__dirname, '..', 'resources', 'guild-logos', 'compressed');
        if (!fs.existsSync(compressedDir)) {
          fs.mkdirSync(compressedDir);
        }

        await compressImage(inputPath, outputPath);
        req.files[i].filename = outputFileName + ext;
        req.files[i].path = outputPath + ext;
        fs.unlinkSync(inputPath); // Exclua o arquivo original após a compressão
      }
    }
    next();
  } catch (error) {
    next(error);
  }
  //att
};

module.exports = { uploadGuildLogo, compressGuildLogosMiddleware }
