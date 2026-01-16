"use server";

import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function getTodos() {
  const { userId } = await auth();
  if (!userId) return [];
  
  return await db.todo.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

export async function createTodo(text: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Non autorisé");
  
await db.todo.create({
  data: { 
    userId, 
    text: text, // Ici, le premier 'text' est le nom dans la base, le second est ta variable
    completed: false 
  },
});
  
  revalidatePath("/dashboard/todo");
}

export async function toggleTodo(id: string, completed: boolean) {
  const { userId } = await auth();
  if (!userId) throw new Error("Non autorisé");

  await db.todo.update({
    where: { id },
    data: { completed },
  });
  
  revalidatePath("/dashboard/todo");
}

export async function deleteTodo(id: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Non autorisé");

  await db.todo.delete({
    where: { id },
  });
  
  revalidatePath("/dashboard/todo");
}