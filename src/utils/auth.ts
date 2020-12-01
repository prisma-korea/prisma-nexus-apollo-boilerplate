import path from 'path';
import { verify } from 'jsonwebtoken';

const SALT_ROUND = 10;

const {
  APPLE_CLIENT_ID,
  REDIRECT_URL,
  JWT_SECRET = 'undefined', JWT_SECRET_ETC = 'etc',
} = process.env;

export const APP_SECRET = JWT_SECRET;
export const APP_SECRET_ETC = JWT_SECRET_ETC;

const env = process.env.NODE_ENV;

const envPath = env === 'development'
  ? path.resolve(__dirname, '../dotenv/dev.env')
  : env === 'test'
    ? path.resolve(__dirname, '../dotenv/test.env')
    : path.resolve(__dirname, '../dotenv/.env');

// eslint-disable-next-line
require('dotenv').config({ path: envPath });

interface Token { userId: string; }

export function getUserId({ req }: {req: ReqI18n}): string {
  const Authorization = req.get('Authorization');

  if (!Authorization) return;

  const token = Authorization.replace('Bearer ', '');
  const verifiedToken = verify(token, APP_SECRET) as Token;

  return verifiedToken && verifiedToken.userId;
}

// eslint-disable-next-line
export const getToken = (req: Request & any): string => {
  const authHeader = req.get('Authorization');

  if (!authHeader) {
    return null;
  }

  return authHeader.replace('Bearer ', '');
};
