import { prisma } from "@/backend/db";

export const sessionRepo = {
  async create(data: {
    sessionToken: string;
    userId: string;
    expires: Date;
  }) {
    return prisma.session.create({
      data,
    });
  },

  async findByToken(token: string) {
    return prisma.session.findUnique({
      where: { sessionToken: token },
      include: { user: true },
    });
  },

  async delete(token: string) {
    return prisma.session.delete({
      where: { sessionToken: token },
    });
  },

  async deleteExpired() {
    return prisma.session.deleteMany({
      where: {
        expires: {
          lt: new Date(),
        },
      },
    });
  },

  async deleteUserSessions(userId: string) {
    return prisma.session.deleteMany({
      where: { userId },
    });
  },
};
