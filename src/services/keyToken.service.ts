import keyTokenModel from 'src/models/keyToken,model';

class KeyTokenService {
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
}
export default KeyTokenService;
