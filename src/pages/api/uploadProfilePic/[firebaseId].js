// src/pages/api/uploadProfilePic/[firebaseId].js
import nc from 'next-connect';
import multer from 'multer';
import cloudinary from '../../../utils/cloudinary';
import { v2 as cloudinaryV2 } from 'cloudinary';
import User from '../../../models/User';
import Organizer from '../../../models/Organizer';
import dbConnect from '../../../utils/dbConnect';

// Configure Multer
const upload = multer({ dest: '/tmp' });

const handler = nc()
  .use(upload.single('file'))
  .post(async (req, res) => {
    const { firebaseId } = req.query;
    await dbConnect();

    try {
      const result = await cloudinaryV2.uploader.upload(req.file.path);
      const updatedData = { profilePic: result.secure_url };

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

export default handler;
