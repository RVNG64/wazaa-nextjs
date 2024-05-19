// pages/api/geocode.js
import axios from 'axios';

export default async function handler(req, res) {
  const { address } = req.query;
  try {
    const response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
      params: {
        address: address,
        key: process.env.GOOGLE_MAPS_API_KEY,
      },
    });

    console.log("Address to geocode:", address);
    console.log("Google Maps API response:", response.data);
    res.status(200).json(response.data);
  } catch (error) {
    console.error("Error during geocoding:", error);
    res.status(500).json({ message: 'Error during geocoding', error: error.message });
  }
}
