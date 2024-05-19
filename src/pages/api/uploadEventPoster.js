// src/pages/api/uploadEventPoster.js
import { createRouter } from 'next-connect';
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../../utils/cloudinaryConfig';

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'uploads/affiches',
    format: async (req, file) => file.mimetype.split('/')[1],
    public_id: (req, file) => `event_poster_${Date.now()}`,
  },
});

const upload = multer({ storage: storage });

const router = createRouter();

router.use(upload.single('file'));

router.post((req, res) => {
  if (req.file && req.file.path) {
    console.log('Fichier téléchargé:', req.file.path);
    return res.status(200).json({ url: req.file.path });
  } else {
    console.error('Erreur lors du téléchargement du fichier:', req.file);
    return res.status(500).json({ error: 'Erreur lors du téléchargement du fichier.' });
  }
});

export const config = {
  api: {
    bodyParser: false,
  },
};

export default router.handler({
  onError: (err, req, res) => {
    console.error(err.stack);
    res.status(err.statusCode || 500).end(err.message);
  },
});
