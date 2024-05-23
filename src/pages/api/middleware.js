// pages/api/middleware.js
import { NextResponse } from 'next/server';
const morgan = require('morgan');
const cors = require('cors');
const bodyParser = require('body-parser');

export function middlewares(req) {
  // Morgan pour le logging
  morgan('dev')(req);

  // CORS
  const corsOptions = {
    origin: process.env.REACT_APP_API_URL, // "http://localhost:3000" for development, process.env.REACT_APP_API_URL for production
    // `` for production
    credentials: true, // Permettre les cookies et les sessions à travers les domaines
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Méthodes HTTP autorisées
    allowedHeaders: ['Content-Type', 'Authorization'] // En-têtes autorisés
  };
  cors(corsOptions)(req);

  // Body parser
  bodyParser.json()(req);

  return NextResponse.next();
}
