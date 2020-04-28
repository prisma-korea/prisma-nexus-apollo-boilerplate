import { Context } from './context';
import { verify } from 'jsonwebtoken';

const { JWT_SECRET } = process.env;

export const APP_SECRET = JWT_SECRET;

interface Token {
  userId: string;
}

export function getUserId(context: Context): string {
  const Authorization = context.request.get('Authorization');
  if (Authorization) {
    const token = Authorization.replace('Bearer ', '');
    const verifiedToken = verify(token, JWT_SECRET) as Token;
    return verifiedToken && verifiedToken.userId;
  }
}
