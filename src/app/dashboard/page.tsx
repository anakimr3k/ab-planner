import { getMesExamens } from "@/app/actions/examen";
import DashboardClient from "@/components/DashboardClient";

export default async function DashboardPage() {
  // 1. On récupère les examens depuis Neon (Server Side)
  // Cette fonction utilise l'ID de l'utilisateur connecté via Clerk
  const examens = await getMesExamens();

  // 2. On passe ces données à ton composant Client (ton design)
  // On utilise "initialExamens" pour que la liste s'affiche immédiatement
  return <DashboardClient initialExamens={examens} />;
}