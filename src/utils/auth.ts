import bcrypt from 'bcrypt';
import path from 'path';
import {verify} from 'jsonwebtoken';

const SALT_ROUND = 10;

const {
  APPLE_CLIENT_ID,
  REDIRECT_URL,
  JWT_SECRET = 'undefined',
  JWT_SECRET_ETC = 'etc',
} = process.env;

export const APP_SECRET = JWT_SECRET;
export const APP_SECRET_ETC = JWT_SECRET_ETC;

const env = process.env.NODE_ENV;

const envPath =
  env === 'development'
    ? path.resolve(__dirname, '../dotenv/dev.env')
    : env === 'test'
    ? path.resolve(__dirname, '../dotenv/test.env')
    : path.resolve(__dirname, '../dotenv/.env');

// eslint-disable-next-line
require('dotenv').config({path: envPath});

interface Token {
  userId: string;
}

/**
 * Extract userId from request.
 * @returns user id if available. null otherwise.
 */
export function getUserId(authorization: string): string | null {
  if (!authorization) {
    return null;
  }

  const token = authorization.replace('Bearer ', '');
  const verifiedToken = verify(token, APP_SECRET) as Token;

  return verifiedToken && verifiedToken.userId;
}

// eslint-disable-next-line
export const getToken = (req: Request & any): string | undefined => {
  const authHeader = req.get('Authorization');

  if (!authHeader) {
    return undefined;
  }

  const token = authHeader.replace('Bearer ', '');
  const verifiedToken = verify(token, APP_SECRET) as Token;

  return verifiedToken && verifiedToken.userId;
};

export const encryptCredential = async (password: string): Promise<string> => {
  const SALT = await bcrypt.genSalt(SALT_ROUND);
  const hash = await bcrypt.hash(password, SALT);

  // Fix the 404 ERROR that occurs when the hash contains 'slash' or 'dot' value
  return hash.replace(/\//g, 'slash').replace(/\.$/g, 'dot');
};

export const validateCredential = async (
  value: string,
  hashedValue: string,
): Promise<boolean> =>
  new Promise<boolean>((resolve, reject) => {
    // Fix the 404 ERROR that occurs when the hash contains 'slash' or 'dot' value
    hashedValue = hashedValue.replace(/slash/g, '/');
    hashedValue = hashedValue.replace(/dot$/g, '.');

    bcrypt.compare(value, hashedValue, (err, res) => {
      if (err) {
        return reject(err);
      }

      resolve(res);
    });
  });
