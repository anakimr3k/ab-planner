"use server";

import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function createExamen(matiere: string, date: string) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Vous devez être connecté");
  }

  await prisma.examen.create({
    data: {
      userId,
      matiere,
      date,
    },
  });

  revalidatePath("/"); // Force le site à se rafraîchir pour afficher le nouvel examen
}