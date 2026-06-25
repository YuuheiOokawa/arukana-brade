import type { VercelRequest, VercelResponse } from '@vercel/node';
import bcrypt from 'bcryptjs';
import { prisma } from '../../lib/prisma.js';
import { signToken, setCookieHeader } from '../../lib/auth.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { email, password } = req.body as { email?: string; password?: string };

  if (!email || !password) {
    return res.status(400).json({ error: 'メールアドレスとパスワードは必須です' });
  }
  if (!EMAIL_RE.test(email)) {
    return res.status(400).json({ error: 'メールアドレスの形式が正しくありません' });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: 'パスワードは8文字以上で入力してください' });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return res.status(409).json({ error: 'このメールアドレスは既に登録されています' });
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      player: {
        create: {
          playerName: '勇者',
          tutorialCompleted: false,
        },
      },
    },
    include: { player: true },
  });

  const token = signToken({ userId: user.id, email: user.email });
  res.setHeader('Set-Cookie', setCookieHeader(token));

  return res.status(201).json({
    user: { id: user.id, email: user.email },
    player: user.player,
  });
}
