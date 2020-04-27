import express, { Express } from 'express';

import cors from 'cors';

require('dotenv').config();

export const createApp = (): Express => {
  const app = express();

  app.use(cors());
  app.get('/', (req, res) => {
    res.send('It works!!!!');
  });

  return app;
};
