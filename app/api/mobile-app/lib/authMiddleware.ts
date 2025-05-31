
import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends NextApiRequest {
  userId?: string;
}

export function authMiddleware(handler: Function) {
  return async (req: AuthRequest, res: NextApiResponse) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization token missing' });
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
      req.userId = decoded.id;
      return handler(req, res);
    } catch (error) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
  };
}
