// pages/api/user/profileInfos.js
import dbConnect from '../../../utils/dbConnect';
import Organizer from '../../../models/Organizer';
import { normalizeCountry, normalizeCity } from '../../../utils/normalizer';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { profileData, firebaseId, hasCompletedProfile } = req.body;

  try {
    await dbConnect();

    // Normalization
    if (profileData.country) {
      profileData.country = normalizeCountry(profileData.country);
    }
    if (profileData.city) {
      profileData.city = normalizeCity(profileData.city);
    }

    // Phone number validation
    if (profileData.phone) {
      const phone = profileData.phone;
      const validPhoneNumber = /^[0-9]{10}$/.test(phone);
      const uniqueChars = new Set(phone.split(''));

      if (!validPhoneNumber || uniqueChars.size === 1) {
        return res.status(400).json({ message: 'Invalid phone number' });
      }
    }

    // Update organizer
    const organizer = await Organizer.findOneAndUpdate(
      { firebaseId },
      { hasCompletedProfile, ...profileData },
      { new: true }
    );

    if (!organizer) {
      return res.status(404).json({ message: 'Organizer not found' });
    }

    res.status(200).json({ message: 'Organizer updated!', organizer });
  } catch (error) {
    console.error('Error in /user/profileInfosPro:', error);
    res.status(500).json({ message: 'Internal Server Error', error });
  }
}
