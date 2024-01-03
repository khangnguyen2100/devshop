import crypto from 'node:crypto';

import apikeyModel from 'src/models/apikey.model';
class ApiKeyService {
  // for testing
  static createApiKey = async () => {
    try {
      const apiKey = await crypto.randomBytes(64).toString('hex');
      const newApiKey = await apikeyModel.create({
        key: apiKey,
        status: true,
        permissions: ['001'],
      });
      return newApiKey;
    } catch (error: any) {
      return null;
    }
  };
  static findApiKey = async (key: string) => {
    try {
      const apiKey = await apikeyModel.findOne({ key, status: true });
      return apiKey;
    } catch (error: any) {
      return null;
    }
  };
}
export default ApiKeyService;
