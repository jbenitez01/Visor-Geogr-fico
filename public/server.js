const express = require('express');
const multer = require('multer');
const fs = require('fs');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));
app.use(express.static(path.join(__dirname, 'public')));

const storage = multer.diskStorage({
  destination: path.join(__dirname, 'public/uploads'),
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (validTypes.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Solo imágenes JPEG, PNG o WebP.'));
  }
});

let dataFile = 'imagesData.json';

app.post('/save-image', upload.single('image'), (req, res) => {
  const { description, lat, lng } = req.body;

  if (!description || description.length > 300 || /(?:fuck|mierda|puto)/i.test(description)) {
    return res.status(400).send("Descripción inválida.");
  }

  const newImage = {
    id: Date.now(),
    imageUrl: `/uploads/${req.file.filename}`,
    description,
    location: { lat: parseFloat(lat), lng: parseFloat(lng) }
  };

  const images = JSON.parse(fs.readFileSync(dataFile));
  images.push(newImage);
  fs.writeFileSync(dataFile, JSON.stringify(images, null, 2));

  res.send("Imagen guardada correctamente.");
});

app.get('/get-images', (req, res) => {
  const images = JSON.parse(fs.readFileSync(dataFile));
  res.json(images);
});

app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));
