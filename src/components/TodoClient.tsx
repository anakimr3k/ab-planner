"use client";

import React, { useState } from 'react';
import { LayoutDashboard, CheckCircle2, ArrowLeft, Plus, Trash2, Loader2 } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import Link from 'next/link';
import { createTodo, toggleTodo, deleteTodo } from "@/app/actions/todo";

interface Todo {
  id: string;
  text: string;
  completed: boolean;
}

export default function TodoClient({ initialTodos }: { initialTodos: Todo[] }) {
  const [text, setText] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleAdd = async () => {
    if (!text.trim()) return;
    setIsSaving(true);
    await createTodo(text);
    setText("");
    setIsSaving(false);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r border-gray-100 p-6 flex flex-col fixed h-full z-10">
        <div className="mb-10">
          <h1 className="text-xl font-bold text-blue-600 tracking-tight">A.B. Planner</h1>
          <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">Student OS</p>
        </div>
        <nav className="space-y-2 flex-1">
          <Link href="/dashboard">
            <div className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-gray-50 rounded-xl font-semibold">
              <LayoutDashboard size={18} /> Dashboard
            </div>
          </Link>
          <div className="flex items-center gap-3 px-4 py-3 bg-blue-50 text-blue-600 rounded-xl font-bold">
            <CheckCircle2 size={18} /> To-Do List
          </div>
        </nav>
        <div className="mt-auto pt-6 border-t border-gray-50 space-y-4">
          <div className="flex items-center gap-3"><UserButton /><span className="text-xs font-bold text-gray-500">Mon Compte</span></div>
          <div className="text-[10px] text-gray-300 font-medium">
            <p>Fait par Abdel-hakim B.</p>
            <p>© 2026 Abdel-hakim Bourahla</p>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <main className="flex-1 ml-64 p-8">
        <header className="mb-10">
          <Link href="/dashboard" className="text-blue-600 flex items-center gap-2 mb-4 text-sm font-bold"><ArrowLeft size={16} /> Retour</Link>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Ma To-Do List</h2>
          <p className="text-gray-500 mt-1 font-medium">Gestion de tes tâches par Abdel-hakim B.</p>
        </header>

        <div className="max-w-2xl space-y-6">
          <div className="flex gap-3 bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
            <input 
              type="text" 
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Quelle est la prochaine étape ?" 
              className="flex-1 bg-transparent border-none px-4 py-3 text-sm font-semibold focus:ring-0" 
            />
            <button 
              onClick={handleAdd}
              disabled={isSaving}
              className="bg-blue-600 text-white rounded-xl px-6 font-bold hover:bg-blue-700 transition-all flex items-center gap-2"
            >
              {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
              Ajouter
            </button>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            {initialTodos.length === 0 ? (
              <p className="text-center py-10 text-gray-400 font-medium italic">Aucune tâche en cours. Repose-toi !</p>
            ) : (
              <div className="divide-y divide-gray-50">
                {initialTodos.map((todo) => (
                  <div key={todo.id} className="flex items-center justify-between p-5 hover:bg-gray-50/50 transition-all group">
                    <div className="flex items-center gap-4">
                      <input 
                        type="checkbox" 
                        checked={todo.completed}
                        onChange={() => toggleTodo(todo.id, !todo.completed)}
                        className="w-5 h-5 rounded-full border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                      <span className={`font-semibold text-gray-700 ${todo.completed ? 'line-through text-gray-300' : ''}`}>
                        {todo.text}
                      </span>
                    </div>
                    <button onClick={() => deleteTodo(todo.id)} className="text-gray-200 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}