import cloudinary from 'cloudinary';

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: `Method '${req.method}' Not Allowed` });
  }

  const { public_id } = req.body;

  if (!public_id) {
    return res.status(400).json({ error: "ID de l'image manquant." });
  }

  try {
    const result = await cloudinary.v2.uploader.destroy(public_id);

    if (result && result.result === 'ok') {
      res.json({ status: 'Image supprimée avec succès.' });
    } else {
      console.error('Échec de la suppression de l\'image:', result);
      res.status(500).json({ error: 'Échec de la suppression de l\'image.' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur interne.' });
  }
}
