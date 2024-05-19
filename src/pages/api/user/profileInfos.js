// pages/api/user/profileInfos.js
import dbConnect from '../../../utils/dbConnect';
import User from '../../../models/User';
import { normalizeCountry, normalizeCity } from '../../../services/normalizer';

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

    // Update user
    const user = await User.findOneAndUpdate(
      { firebaseId },
      { hasCompletedProfile, ...profileData },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'User updated!', user });
  } catch (error) {
    console.error('Error in /user/profileInfos:', error);
    res.status(500).json({ message: 'Internal Server Error', error });
  }
}
