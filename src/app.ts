import express, {Express} from 'express';

import ejs from 'ejs';
import path from 'path';

export const createApp = (): Express => {
  const app = express();
  app.use(express.urlencoded({extended: true}));
  app.use(express.json());

  app.get('/', (req, res) => {
    res.send('It works - ver. 0.0.1');
  });

  app.set('views', path.join(__dirname, '../html'));
  app.engine('html', ejs.renderFile);
  app.set('view engine', 'html');

  return app;
};
