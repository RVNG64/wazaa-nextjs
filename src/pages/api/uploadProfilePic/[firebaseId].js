// src/pages/api/uploadProfilePic/[firebaseId].js
import { createRouter } from 'next-connect';
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../../../utils/cloudinaryConfig';
import User from '../../../models/User';
import Organizer from '../../../models/Organizer';
import dbConnect from '../../../utils/dbConnect';

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'uploads/profile_pics',
    format: async (req, file) => file.mimetype.split('/')[1], // Format du fichier (extension)
    public_id: (req, file) => `profile_pic_${Date.now()}`, // Nom de fichier unique
  },
});

const upload = multer({ storage: storage });

const router = createRouter();

router.use(upload.single('file'));

router.post(async (req, res) => {
  const { firebaseId } = req.query;
  await dbConnect();

  try {
    const result = req.file.path;
    const updatedData = { profilePic: result };

    // Essayer de mettre à jour dans Organizer ou User
    let updatedUser = await Organizer.findOneAndUpdate({ firebaseId }, updatedData, { new: true });
    if (!updatedUser) {
      updatedUser = await User.findOneAndUpdate({ firebaseId }, updatedData, { new: true });
    }

    if (!updatedUser) {
      return res.status(404).json({ message: 'Utilisateur non trouvé.' });
    }
    res.json(updatedUser);
  } catch (error) {
    console.error("Erreur lors de l'upload Cloudinary ou de la mise à jour de l'utilisateur:", error);
    res.status(500).json({ message: 'Erreur du serveur.' });
  }
});

export const config = {
  api: {
    bodyParser: false, // Désactiver bodyParser par défaut pour Next.js
  },
};

export default router.handler({
  onError: (err, req, res) => {
    console.error(err.stack);
    res.status(err.statusCode || 500).end(err.message);
  },
});
