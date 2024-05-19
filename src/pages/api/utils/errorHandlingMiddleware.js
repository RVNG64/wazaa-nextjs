// pages/api/utils/errorHandlingMiddleware.js
export default function errorHandlingMiddleware(err, req, res, next) {
  if (err.name === 'ValidationError') {
    console.error(err.stack);
    res.status(400).json({ message: err.message });
  } else if (err.code && err.code === 11000) {
    console.error(err.stack);
    res.status(400).json({ message: 'Duplicate key error' });
  } else {
    console.error(err.stack);
    res.status(500).json({ message: 'An error occurred', error: err.toString() });
  }
}
