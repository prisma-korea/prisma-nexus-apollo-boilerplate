import type {Express} from 'express';
import express from 'express';

import {altairExpress} from 'altair-express-middleware';
import cors from 'cors';
import ejs from 'ejs';
import path from 'path';

const {PORT = 6001} = process.env;

export const createApp = (): Express => {
  const app = express();

  app.use(cors());

  app.get('/', (req, res) => {
    res.send('It works - ver. 0.0.1');
  });

  app.use(
    '/altair',
    altairExpress({
      endpointURL: '/graphql',
      subscriptionsEndpoint: `ws://localhost:${PORT}/graphql`,
    }),
  );

  app.set('views', path.join(__dirname, '../html'));
  app.engine('html', ejs.renderFile);
  app.set('view engine', 'html');

  return app;
};
