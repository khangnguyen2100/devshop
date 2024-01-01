import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import configEnv from 'src/configs/config.env';
import errorHandler from 'src/middleware/errorHandler';
import fourOhFour from 'src/middleware/fourOhFour';
import routes from 'src/routes';

import 'src/configs/db';
import { checkOverload, countConnectDb } from './helpers/checkDbConnect';

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

// Apply routes before error handling
app.use('/api', routes);

// Apply error handling last
app.use(fourOhFour);
app.use(errorHandler);

export default app;
