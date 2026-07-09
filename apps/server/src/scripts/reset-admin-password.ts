/**
 * Emergency Admin Password Reset Script
 * Usage: npm run reset-admin-password -- <email> <newPassword>
 */

import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma';

async function main() {
  const args = process.argv.slice(2);
  const email = args[0] || 'admin@stationery.com';
  const newPassword = args[1] || 'Admin@123456';

  console.log(`\n🔒 [Emergency Recovery] Resetting Admin Password...`);
  console.log(`📧 Target Email: ${email}`);

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    console.error(`❌ Error: User with email "${email}" not found.`);
    process.exit(1);
  }

  if (user.role !== 'ADMIN') {
    console.warn(`⚠️ Warning: User role is "${user.role}", not "ADMIN". Proceeding with reset anyway...`);
  }

  const hashedPassword = await bcrypt.hash(newPassword, 12);

  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashedPassword, isActive: true },
  });

  // Clear any active sessions/refresh tokens and OTPs
  await prisma.refreshToken.deleteMany({ where: { userId: user.id } });
  await prisma.passwordResetOtp.deleteMany({ where: { email: user.email } });

  console.log(`✅ Success! Password for ${email} has been updated.`);
  console.log(`👉 New Password: ${newPassword}\n`);
  process.exit(0);
}

main().catch((err) => {
  console.error('❌ Fatal error during password reset:', err);
  process.exit(1);
});
