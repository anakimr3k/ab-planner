"use client";

import React, { useState, useEffect } from 'react';
import { LayoutDashboard, CheckCircle2, Plus, Trash2, Calendar, Moon, Sun, Table as TableIcon, ListTodo } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import Link from 'next/link';
import { createTodo, toggleDay, deleteTodo } from "@/app/actions/todo";

const DAYS_EN = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const DAYS_FR = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

export default function TodoClient({ initialTodos }: { initialTodos: any[] }) {
  const [mounted, setMounted] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [text, setText] = useState("");

  useEffect(() => {
    setMounted(true);
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    if (!darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.theme = 'light';
    }
  };

  if (!mounted) return null;

  return (
    <div className={`${darkMode ? 'dark' : ''}`}>
      <div className="min-h-screen bg-[#FBFBFA] dark:bg-[#191919] flex text-[#37352F] dark:text-[#E3E3E3] transition-colors duration-300">
        {/* SIDEBAR */}
        <aside className="w-64 bg-[#F7F6F3] dark:bg-[#202020] border-r border-gray-200 dark:border-white/5 p-4 flex flex-col fixed h-full z-20">
          <div className="flex items-center justify-between mb-6 px-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center text-white text-[10px] font-bold">AB</div>
              <span className="font-bold text-sm">A.B. Planner</span>
            </div>
            <button onClick={toggleDarkMode} className="p-2 hover:bg-gray-200 dark:hover:bg-white/10 rounded-lg transition-colors">
              {darkMode ? <Sun size={14} /> : <Moon size={14} />}
            </button>
          </div>
          <nav className="space-y-1 flex-1 text-sm font-medium">
            <Link href="/dashboard" className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-200 dark:hover:bg-white/5 rounded-md transition-colors"><LayoutDashboard size={16} /> Dashboard</Link>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-[#EBEAEA] dark:bg-white/10 rounded-md font-bold text-blue-600 dark:text-blue-400"><CheckCircle2 size={16} /> Habitudes</div>
            <Link href="/dashboard/schedule" className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-200 dark:hover:bg-white/5 rounded-md transition-colors"><Calendar size={16} /> Planning</Link>
          </nav>
          <div className="mt-auto pt-4 border-t border-gray-200 dark:border-white/5"><UserButton /></div>
        </aside>

        {/* MAIN */}
        <main className="ml-64 flex-1 p-12">
          <header className="mb-10">
            <h2 className="text-4xl font-bold tracking-tight mb-2">Habitudes</h2>
            <p className="text-gray-500 dark:text-gray-400 font-medium italic">"La discipline est la mère du succès."</p>
          </header>

          {/* INPUT */}
          <div className="mb-8 max-w-2xl">
            <div className="flex items-center gap-2 bg-white dark:bg-[#252525] rounded-xl px-4 py-3 border border-gray-200 dark:border-white/5 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
              <Plus size={18} className="text-gray-400" />
              <input 
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && createTodo(text).then(() => setText(""))}
                placeholder="Nouvel objectif hebdomadaire..."
                className="w-full bg-transparent border-none focus:ring-0 text-sm font-medium outline-none"
              />
            </div>
          </div>

          {/* GRILLE */}
          <div className="bg-white dark:bg-[#252525] border border-gray-200 dark:border-white/5 rounded-2xl shadow-sm overflow-hidden">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[#F7F6F3] dark:bg-[#2a2a2a] text-[11px] uppercase tracking-widest text-gray-400 font-bold">
                  <th className="p-4 text-left">Habitude</th>
                  {DAYS_FR.map(d => <th key={d} className="p-4 text-center">{d}</th>)}
                  <th className="p-4 w-12"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                {initialTodos.map((todo) => (
                  <tr key={todo.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02] group transition-colors">
                    <td className="p-4 text-sm font-bold">{todo.task}</td>
                    {DAYS_EN.map((day) => {
                      const isDone = todo.completedDays?.split(",").includes(day);
                      return (
                        <td key={day} className="p-4 text-center">
                          <button 
                            onClick={() => toggleDay(todo.id, day)}
                            className={`w-6 h-6 rounded-lg flex items-center justify-center m-auto transition-all ${
                              isDone ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30' : 'border-2 border-gray-200 dark:border-white/10 hover:border-blue-400'
                            }`}
                          >
                            {isDone && <CheckCircle2 size={14} />}
                          </button>
                        </td>
                      );
                    })}
                    <td className="p-4">
                      <button onClick={() => deleteTodo(todo.id)} className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 transition-all"><Trash2 size={16} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
}