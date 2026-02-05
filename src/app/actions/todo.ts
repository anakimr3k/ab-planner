"use server";

import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

/**
 * Récupère tous les objectifs de l'utilisateur connecté
 */
export async function getTodos() {
  const { userId } = await auth();
  if (!userId) return [];
  
  return await db.todo.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Crée un nouvel objectif (Habitude)
 * Utilise 'task' pour correspondre à ton schéma Prisma corrigé
 */
export async function createTodo(text: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Non autorisé");
  
  await db.todo.create({
    data: { 
      userId, 
      task: text, 
      completedDays: "" // Initialisé vide pour la grille hebdomadaire
    },
  });
  
  revalidatePath("/dashboard/todo");
}

/**
 * Alterne l'état d'un jour spécifique (ex: "Mon", "Tue") pour un objectif
 */
export async function toggleDay(id: string, day: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Non autorisé");

  // Récupération de l'objectif pour modifier sa liste de jours
  const todo = await db.todo.findUnique({
    where: { id, userId },
  });

  if (!todo) throw new Error("Objectif introuvable");

  // Gestion de la liste des jours (format CSV : "Mon,Wed")
  let currentDays = todo.completedDays ? todo.completedDays.split(",") : [];
  
  let newDays;
  if (currentDays.includes(day)) {
    // Si déjà coché, on retire le jour
    newDays = currentDays.filter((d) => d !== day);
  } else {
    // Sinon, on ajoute le jour
    newDays = [...currentDays, day];
  }

  await db.todo.update({
    where: { id },
    data: {
      completedDays: newDays.join(","),
    },
  });
  
  revalidatePath("/dashboard/todo");
}

/**
 * Supprime un objectif
 */
export async function deleteTodo(id: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Non autorisé");

  await db.todo.delete({
    where: { id, userId },
  });
  
  revalidatePath("/dashboard/todo");
}