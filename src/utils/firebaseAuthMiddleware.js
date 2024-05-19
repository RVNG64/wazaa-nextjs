// utils/firebaseAdmin.js
import * as admin from 'firebase-admin';

const serviceAccount = JSON.parse(Buffer.from(process.env.FIREBASE_CREDENTIALS_BASE64, 'base64').toString('ascii'));

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export async function authenticate(req, res, next) {
  const token = req.headers.authorization?.split('Bearer ')[1];
  if (!token) {
    return res.status(401).send('Access denied. No token provided.');
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Error verifying Firebase token:', error);
    res.status(403).send('Invalid token.');
  }
}
