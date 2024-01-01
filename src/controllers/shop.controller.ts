import { RequestHandler } from 'express';
import configEnv from 'src/configs/config.env';

class ShopController {
  getShop: RequestHandler = async (_req, res) => {
    try {
      return res.status(200).json({
        name: configEnv.name,
        description: configEnv.description,
        version: configEnv.version,
      });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  };
}

export default new ShopController();
