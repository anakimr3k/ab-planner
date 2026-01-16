import { PrismaClient } from "@prisma/client";

// Cette configuration permet d'éviter de créer une nouvelle instance de 
// Prisma à chaque fois que Next.js rafraîchit une page en mode développement.
const prismaClientSingleton = () => {
  return new PrismaClient();
};

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

export const prisma = globalThis.prisma ?? prismaClientSingleton();
export const db = prisma;

if (process.env.NODE_ENV !== "production") globalThis.prisma = prisma;