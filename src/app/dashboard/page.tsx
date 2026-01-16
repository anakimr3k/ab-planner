import { getTodos } from "@/app/actions/todo";
import TodoClient from "@/components/TodoClient";

/**
 * Page de la To-Do List (Côté Serveur)
 * Réalisée par Abdel-hakim B.
 */
export default async function TodoPage() {
  // Récupération des tâches depuis Neon via l'action serveur
  const todos = await getTodos();

  // On passe les données au composant client qui gère l'affichage et l'interaction
  return <TodoClient initialTodos={todos} />;
}