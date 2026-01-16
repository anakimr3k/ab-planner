"use server";

import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

// --- EXAMENS ---

// 1. Ajouter un examen (Lié à l'utilisateur connecté)
export async function createExamen(matiere: string, date: string) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Vous devez être connecté pour ajouter un examen.");
  }

  await prisma.examen.create({
    data: {
      matiere,
      date,
      userId, // On attache l'examen à TON compte
    },
  });

  // On dit à Next.js de rafraîchir la page dashboard pour afficher le nouvel examen
  revalidatePath("/dashboard");
}

// 2. Récupérer tes examens
export async function getMesExamens() {
  const { userId } = await auth();

  if (!userId) return [];

  return await prisma.examen.findMany({
    where: {
      userId: userId, // Filtre de sécurité
    },
    orderBy: {
      date: 'asc', // Trie par date
    }
  });
}

// 3. Supprimer un examen
export async function deleteExamen(id: string) {
  const { userId } = await auth();
  
  if (!userId) throw new Error("Non autorisé");

  await prisma.examen.deleteMany({
    where: {
      id: id,
      userId: userId, // Sécurité : on vérifie que c'est bien le tien
    },
  });

  revalidatePath("/dashboard");
}