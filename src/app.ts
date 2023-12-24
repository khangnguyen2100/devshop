import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';

import config from 'src/config';
import errorHandler from 'src/middleware/errorHandler';
import fourOhFour from 'src/middleware/fourOhFour';
import root from 'src/routes/root';

const app = express();

// Apply most middleware first
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  cors({
    // @ts-ignore no-implicit-any
    origin: config.clientCorsOrigins[config.nodeEnv] ?? '*',
  }),
);

app.use(helmet());
app.use(morgan('tiny'));

// Apply routes before error handling
app.use('/', root);

// Apply error handling last
app.use(fourOhFour);
app.use(errorHandler);

export default app;
