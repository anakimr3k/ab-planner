"use server";

import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function getEvents() {
  const { userId } = await auth();
  if (!userId) return [];
  try {
    return await db.event.findMany({
      where: { userId },
      orderBy: { startTime: 'asc' }
    });
  } catch (error) {
    return [];
  }
}

export async function deleteEvent(id: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Non autorisé");
  await db.event.deleteMany({ where: { id, userId } });
  revalidatePath("/dashboard/schedule");
}

export async function createManualEvent(formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Non autorisé");

  await db.event.create({
    data: {
      userId,
      title: formData.get("title") as string,
      day: formData.get("day") as string,
      startTime: formData.get("startTime") as string,
      endTime: formData.get("endTime") as string,
      weekType: formData.get("weekType") as string,
      details: "Ajout manuel",
      color: "Bleu",
    }
  });
  revalidatePath("/dashboard/schedule");
}

// Vider tout le planning
export async function clearAllEvents() {
  const { userId } = await auth();
  if (!userId) throw new Error("Non autorisé");
  
  await db.event.deleteMany({ where: { userId } });
  revalidatePath("/dashboard/schedule");
}

// Mettre à jour un événement (pour drag & drop)
export async function updateEvent(id: string, data: { day?: string; startTime?: string; endTime?: string; title?: string; weekType?: string }) {
  const { userId } = await auth();
  if (!userId) throw new Error("Non autorisé");
  
  await db.event.updateMany({
    where: { id, userId },
    data
  });
  
  revalidatePath("/dashboard/schedule");
}