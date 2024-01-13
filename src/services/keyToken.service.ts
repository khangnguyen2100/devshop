import keyTokenModel from 'src/models/keyToken,model';
import { Types } from 'mongoose';
class KeyTokenService {
  static findById = async (userId: string) => {
    return await keyTokenModel
      .findOne({
        user: new Types.ObjectId(userId),
      })
      .lean();
  };
  static removeById = async (_id: Types.ObjectId) => {
    return await keyTokenModel.deleteOne({
      _id,
    });
  };
  static createKeyToken = async ({
    userId,
    publicKey,
    privateKey,
    refreshToken,
    refreshTokenUsed,
  }: {
    userId: string;
    publicKey: string;
    privateKey: string;
    refreshToken?: string;
    refreshTokenUsed?: string;
  }) => {
    try {
      const oldRefreshToken = await keyTokenModel
        .findOne({
          user: userId,
        })
        .lean();
      const filter = {
        user: userId,
      };

      const updateData = {
        user: userId,
        publicKey,
        privateKey,
        refreshToken: refreshToken || null,
        refreshTokensUsed: refreshTokenUsed
          ? [...(oldRefreshToken?.refreshTokensUsed || []), refreshTokenUsed]
          : oldRefreshToken?.refreshTokensUsed || [],
      };

      const options = {
        upsert: true,
        new: true,
      };

      const tokens = await keyTokenModel
        .findOneAndUpdate(filter, updateData, options)
        .lean();

      return tokens ? tokens.publicKey : null;
    } catch (error) {
      console.error('ERROR when store keys:', error);
      return null;
    }
  };
  static findByUsedRefreshToken = async (refreshToken: string) => {
    return await keyTokenModel.findOne({
      refreshTokensUsed: refreshToken,
    });
  };
  static findByRefreshToken = async (refreshToken: string) => {
    return await keyTokenModel
      .findOne({
        refreshToken,
      })
      .populate('user');
  };
}
export default KeyTokenService;
