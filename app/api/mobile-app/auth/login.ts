
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { corsMiddleware } from '@/lib/cors';

//@ts-ignore
export default async function handler(req, res) {
     corsMiddleware(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end(); // Handle preflight request
  }
  if (req.method !== 'POST') return res.status(405).end();

  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET!, { expiresIn: '7d' });
  return res.status(200).json({ token });
}
