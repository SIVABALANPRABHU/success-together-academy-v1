const { PrismaClient } = require('@prisma/client');
const prisma = const prisma = new PrismaClient();

exports.getUserByClerkId = async (clerkId) => {
  return prisma.user.findUnique({ where: { clerkId } });
};

exports.upsertUser = async ({ clerkId, firstName, lastName, role }) => {
  return prisma.user.upsert({
    where: { clerkId },
    update: { firstName, lastName, role },
    create: { clerkId, firstName, lastName, role },
  });
};
