import express from 'express';
import notesRoutes from './notes';
import walletsRoutes from './wallets';

const router = express.Router();

const setupRoutes = (app) => {
  app.use('/api/notes', notesRoutes);
  app.use('/api/wallets', walletsRoutes);
};

export default setupRoutes;