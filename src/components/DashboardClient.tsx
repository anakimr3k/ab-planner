"use client";

import React, { useState, useEffect } from 'react';
import { LayoutDashboard, CheckCircle2, Calendar, Plus, Trash2, Clock, Moon, Sun } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import Link from 'next/link';
import { addExamen, deleteExamen } from "@/app/actions/examen";

export default function DashboardClient({ initialExamens = [] }: { initialExamens: any[] }) {
  const [mounted, setMounted] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [subject, setSubject] = useState("");
  const [date, setDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Optionnel : vérifier si l'utilisateur avait déjà choisi le mode sombre
    if (localStorage.theme === 'dark') setDarkMode(true);
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
            {/* BOUTON SWITCH CLAIR/SOMBRE */}
            <button onClick={toggleDarkMode} className="p-2 hover:bg-gray-200 dark:hover:bg-white/10 rounded-lg transition-colors text-gray-500 dark:text-gray-400">
              {darkMode ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>
          
          <nav className="space-y-1 flex-1 text-sm font-medium">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-[#EBEAEA] dark:bg-white/10 rounded-md font-bold text-blue-600 dark:text-blue-400">
              <LayoutDashboard size={16} /> Dashboard
            </div>
            <Link href="/dashboard/todo" className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-200 dark:hover:bg-white/5 rounded-md transition-colors">
              <CheckCircle2 size={16} /> Habitudes
            </Link>
            <Link href="/dashboard/schedule" className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-200 dark:hover:bg-white/5 rounded-md transition-colors">
              <Calendar size={16} /> Planning
            </Link>
          </nav>

          <div className="mt-auto pt-4 border-t border-gray-200 dark:border-white/5 flex items-center gap-2 px-2">
            <UserButton /> <span className="text-xs font-semibold">Abdel-hakim B.</span>
          </div>
        </aside>

        {/* CONTENU PRINCIPAL */}
        <main className="ml-64 flex-1 p-12 max-w-5xl">
          <header className="mb-10">
            <h2 className="text-4xl font-bold tracking-tight mb-2">Tableau de bord</h2>
            <p className="text-gray-500 dark:text-gray-400 font-medium">Tes priorités et tes prochains contrôles.</p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* FORMULAIRE (Mode Sombre compatible) */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-[#252525] p-6 rounded-2xl border border-gray-200 dark:border-white/5 shadow-sm">
                <h3 className="font-bold mb-4 flex items-center gap-2 text-xs uppercase tracking-widest text-gray-400"><Plus size={16}/> Nouveau Contrôle</h3>
                <form onSubmit={async (e) => {
                    e.preventDefault();
                    if (!subject || !date) return;
                    setIsSubmitting(true);
                    await addExamen(subject, date);
                    setSubject("");
                    setDate("");
                    setIsSubmitting(false);
                  }} className="space-y-3">
                  <input 
                    type="text" 
                    placeholder="Matière" 
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full p-2.5 text-sm bg-gray-50 dark:bg-[#191919] border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none dark:text-white" 
                  />
                  <input 
                    type="date" 
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full p-2.5 text-sm bg-gray-50 dark:bg-[#191919] border border-gray-200 dark:border-white/10 rounded-xl outline-none dark:text-white" 
                  />
                  <button 
                    type="submit" 
                    disabled={isSubmitting || !subject || !date}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-blue-500/20 transition-all"
                  >
                    {isSubmitting ? 'Ajout...' : 'Ajouter'}
                  </button>
                </form>
              </div>
            </div>

            {/* LISTE DES EXAMENS (Mode Sombre compatible) */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="font-bold text-gray-400 text-[11px] uppercase tracking-widest mb-4 italic">Prochaines échéances</h3>
              {initialExamens.length === 0 ? (
                <div className="bg-white dark:bg-[#252525] border-2 border-dashed border-gray-100 dark:border-white/5 rounded-3xl p-12 text-center">
                  <Clock size={32} className="mx-auto mb-3 opacity-20" />
                  <p className="text-sm font-medium italic text-gray-400">Rien de prévu pour le moment.</p>
                </div>
              ) : (
                initialExamens.map((exam) => (
                  <div key={exam.id} className="bg-white dark:bg-[#252525] p-5 rounded-2xl border border-gray-200 dark:border-white/5 shadow-sm flex items-center justify-between group hover:border-blue-500/50 transition-all">
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-2xl flex items-center justify-center font-bold text-[10px] flex-col border border-red-100 dark:border-red-900/30">
                        <span className="uppercase">{new Date(exam.date).toLocaleDateString('fr-FR', { month: 'short' })}</span>
                        <span className="text-lg leading-none">{new Date(exam.date).getDate()}</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-gray-800 dark:text-[#E3E3E3]">{exam.subject}</h4>
                        <p className="text-xs text-gray-400 font-medium italic">{exam.title}</p>
                      </div>
                    </div>
                    <button 
                    onClick={() => { if(confirm("Supprimer ce contrôle ?")) deleteExamen(exam.id) }}
                    className="p-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={16}/></button>
                  </div>
                ))
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}