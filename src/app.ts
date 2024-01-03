import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import configEnv from 'src/configs/config.env';
import routes from 'src/routes';

import 'src/configs/db';
import { countConnectDb } from './helpers/checkDbConnect';

const app = express();

// Apply most middleware first
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  cors({
    // @ts-ignore no-implicit-any
    origin: configEnv.clientCorsOrigins[configEnv.nodeEnv] ?? '*',
  }),
);

app.use(helmet());
app.use(morgan('dev'));
app.use(compression());

// Init DB
countConnectDb();
// checkOverload();

// Apply routes
app.use('/api', routes);

export default app;
