import crypto from 'node:crypto';

const generateKeys = () => {
  const publicKey = crypto.randomBytes(64).toString('hex');
  const privateKey = crypto.randomBytes(64).toString('hex');

  return { publicKey, privateKey };
};

export default generateKeys;
