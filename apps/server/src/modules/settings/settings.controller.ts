import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../lib/prisma';

export async function getSettings(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const settings = await prisma.settings.findMany();
    const map = Object.fromEntries(settings.map((s: any) => [s.key, s.value]));
    res.json({ success: true, message: 'Settings fetched', data: map });
  } catch (error) {
    next(error);
  }
}

export async function updateSettings(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const entries = Object.entries(req.body as Record<string, string>);
    await prisma.$transaction(
      entries.map(([key, value]) =>
        prisma.settings.upsert({
          where: { key },
          update: { value },
          create: { key, value },
        })
      )
    );
    res.json({ success: true, message: 'Settings updated' });
  } catch (error) {
    next(error);
  }
}
