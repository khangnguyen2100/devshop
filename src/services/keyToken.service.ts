import keyTokenModel from 'src/models/keyToken,model';

class KeyTokenService {
  static createKeyToken = async ({
    userId,
    publicKey,
    privateKey,
  }: {
    userId: string;
    publicKey: string;
    privateKey: string;
  }) => {
    try {
      const createToken = await keyTokenModel.create({
        user: userId,
        publicKey,
        privateKey,
      });

      return createToken ? createToken.publicKey : null;
    } catch (error) {
      console.error('ERROR when store keys:', error);
      return null;
    }
  };
}
export default KeyTokenService;
