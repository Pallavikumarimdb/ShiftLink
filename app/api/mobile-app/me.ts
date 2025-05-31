
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

//@ts-ignore
export default async function handler(req, res) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'No token' });

  const token = auth.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user) return res.status(401).json({ error: 'Invalid token' });
    return res.status(200).json({ user });
  } catch (e) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}
