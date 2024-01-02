import express from 'express';
import {
  checkApiKey,
  checkApiPermission,
} from 'src/helpers/checkApiPermission';
import v1Routes from 'src/routes/v1';

const routes = express.Router();

// check api permission middleware
routes.use(checkApiKey);
routes.use(checkApiPermission('001'));

routes.use('/v1', v1Routes);

export default routes;
