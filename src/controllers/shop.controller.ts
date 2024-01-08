import { RequestHandler } from 'express';
import configEnv from 'src/configs/config.env';
import { OK } from 'src/helpers/core/success.response';

class ShopController {
  static getShop: RequestHandler = async (_req, res) => {
    new OK({
      metadata: {
        name: configEnv.name,
        description: configEnv.description,
        version: configEnv.version,
      },
      options: {
        limit: 10,
        page: 1,
        total: 10,
      },
    }).send(res);
  };
}

export default ShopController;
