"use client";

import React, { useState } from 'react';
import { Upload, Plus, Calendar, CheckCircle2, FileText, Trash2, LayoutDashboard, Loader2 } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import Link from 'next/link';
import { createExamen, deleteExamen } from "@/app/actions/examen";

interface Examen {
  id: string;
  matiere: string;
  date: string;
}

export default function DashboardClient({ initialExamens }: { initialExamens: Examen[] }) {
  const [nomMatiere, setNomMatiere] = useState("");
  const [dateExamen, setDateExamen] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleAjouterExamen = async () => {
    if (nomMatiere && dateExamen) {
      setIsSaving(true);
      try {
        await createExamen(nomMatiere, dateExamen);
        setNomMatiere("");
        setDateExamen("");
      } catch (error) {
        alert("Erreur lors de la sauvegarde.");
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      setTimeout(() => {
        setIsUploading(false);
        alert(`Fichier "${file.name}" reçu !`);
      }, 1500);
    }
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
            <div className="flex items-center gap-3 px-4 py-3 bg-blue-50 text-blue-600 rounded-xl font-bold cursor-pointer transition-all">
              <LayoutDashboard size={18} /> Dashboard
            </div>
          </Link>

          <Link href="/dashboard/todo">
            <div className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-gray-50 hover:text-blue-600 rounded-xl font-semibold transition-all cursor-pointer group">
              <CheckCircle2 size={18} className="group-hover:text-blue-600" /> To-Do List
            </div>
          </Link>
        </nav>

        <div className="mt-auto pt-6 border-t border-gray-50 space-y-4">
          <div className="flex items-center gap-3">
            <UserButton />
            <span className="text-xs font-bold text-gray-500 tracking-tight">Mon Compte</span>
          </div>
          <div className="text-[10px] text-gray-300 font-medium leading-tight">
            <p>Fait par Abdel-hakim B.</p>
            <p>© 2026 Abdel-hakim Bourahla</p>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 ml-64 p-8">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">Mon Espace</h2>
            <p className="text-gray-500 mt-1 font-medium italic text-sm">Design & Dev par Abdel-hakim B.</p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div onClick={() => document.getElementById('fileInput')?.click()} className="relative border-2 border-dashed rounded-3xl p-12 flex flex-col items-center justify-center transition-all cursor-pointer border-gray-100 bg-white hover:border-blue-300 hover:shadow-xl hover:scale-[1.01]">
              <input type="file" id="fileInput" className="hidden" accept=".pdf" onChange={handleFileUpload} />
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 bg-blue-50 text-blue-600">
                <Upload size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-800">Importer ton emploi du temps</h3>
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-6 tracking-tight">Tes prochains examens</h3>
              
              {initialExamens.length === 0 ? (
                <div className="text-center py-12 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                  <FileText size={32} className="mx-auto text-gray-200 mb-3" />
                  <p className="text-gray-400 font-medium text-sm">Aucun examen pour le moment.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {initialExamens.map((ex) => (
                    <div key={ex.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-transparent hover:border-blue-100 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-blue-600 shadow-sm">
                          <Calendar size={18} />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 leading-none">{ex.matiere}</p>
                          <p className="text-[10px] text-gray-400 font-black uppercase mt-1">{ex.date}</p>
                        </div>
                      </div>
                      <button onClick={() => deleteExamen(ex.id)} className="text-gray-300 hover:text-red-500 p-2 transition-colors">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-8 pt-8 border-t border-gray-50 grid grid-cols-2 gap-4">
                <input type="text" placeholder="Matière" value={nomMatiere} onChange={(e) => setNomMatiere(e.target.value)} className="bg-gray-50 border-none rounded-xl px-5 py-4 text-sm font-semibold focus:ring-2 focus:ring-blue-500"/>
                <input type="date" value={dateExamen} onChange={(e) => setDateExamen(e.target.value)} className="bg-gray-50 border-none rounded-xl px-5 py-4 text-sm font-semibold focus:ring-2 focus:ring-blue-500"/>
                <button onClick={handleAjouterExamen} disabled={isSaving} className="col-span-2 bg-gray-900 text-white rounded-2xl py-4 font-bold hover:bg-blue-600 transition-all flex items-center justify-center gap-3 disabled:opacity-50 shadow-lg shadow-gray-200">
                  {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Plus size={20} />}
                  {isSaving ? "Enregistrement..." : "Ajouter et Sauvegarder"}
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-6">Productivité</h3>
              <div className="h-2 bg-gray-50 rounded-full overflow-hidden">
                <div className="w-1/3 h-full bg-blue-600"></div>
              </div>
              <p className="text-[10px] text-gray-400 mt-4 italic text-center leading-relaxed">
                Données sécurisées via Neon <br />
                © Abdel-hakim Bourahla
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}