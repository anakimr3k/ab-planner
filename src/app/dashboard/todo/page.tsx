import { getTodos } from "@/app/actions/todo";
import TodoClient from "@/components/TodoClient";

export default async function TodoPage() {
  const todos = await getTodos(); // Récupère les vraies tâches
  return <TodoClient initialTodos={todos} />;
}