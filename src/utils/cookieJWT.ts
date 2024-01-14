import { Response, Request } from 'express';
import configEnv from 'src/configs/config.env';

const getJWTCookies = (req: Request) => {
  const cookies = req.cookies;
  return cookies;
};

const setJWTCookies = (res: Response, token: string) => {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    sameSite: 'none',
    secure: true,
    maxAge: configEnv.cookieExpiresTime, // 7 days
  });
};
const clearJWTCookies = (res: Response) => {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    sameSite: 'none',
    secure: true,
  });
};

export { getJWTCookies, setJWTCookies, clearJWTCookies };
