
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

  const { email, password, name } = req.body;
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return res.status(400).json({ error: 'User already exists' });

  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { email, name, password: hashed },
  });

  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET!, { expiresIn: '7d' });
  return res.status(200).json({ token });
}
