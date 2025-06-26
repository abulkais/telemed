// server.js (or your backend file)
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 8080;

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'public/uploads/doctors';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'doctor-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// Upload endpoint
app.post('/api/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  res.json({ 
    filename: req.file.filename,
    path: `/uploads/doctors/${req.file.filename}`
  });
});

// Delete image endpoint
app.delete('/api/images/:filename', (req, res) => {
  const filePath = path.join(__dirname, 'public', 'uploads', 'doctors', req.params.filename);
  
  fs.unlink(filePath, (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to delete image' });
    }
    res.json({ success: true });
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});