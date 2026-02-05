import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import DashboardClient from "@/components/DashboardClient";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect("/");
  }

  // Récupération des examens triés par date la plus proche
  const examens = await db.examen.findMany({
    where: { userId },
    orderBy: { date: 'asc' }
  });

  return (
    <DashboardClient initialExamens={examens} />
  );
}