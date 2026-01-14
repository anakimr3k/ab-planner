"use client";

import React, { useState, useEffect } from 'react';
import { Upload, Plus, Calendar, CheckCircle2, FileText, Trash2, LayoutDashboard, Loader2 } from "lucide-react";
import Link from 'next/link';
import { createExamen } from "./actions/examen"; // Import de l'action de sauvegarde

interface Examen {
  id: string;
  matiere: string;
  date: string;
}

export default function Page() {
  const [examens, setExamens] = useState<Examen[]>([]);
  const [nomMatiere, setNomMatiere] = useState("");
  const [dateExamen, setDateExamen] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Fonction pour sauvegarder réellement dans Neon
  const handleAjouterExamen = async () => {
    if (nomMatiere && dateExamen) {
      setIsSaving(true);
      try {
        // 1. Appel de l'action serveur qui parle à Prisma & Neon
        await createExamen(nomMatiere, dateExamen);
        
        // 2. Mise à jour locale pour le visuel immédiat
        const nouvelExamen = {
          id: Date.now().toString(),
          matiere: nomMatiere,
          date: dateExamen
        };
        setExamens([...examens, nouvelExamen]);
        
        // 3. Reset du formulaire
        setNomMatiere("");
        setDateExamen("");
      } catch (error) {
        alert("Erreur lors de la sauvegarde. Vérifie ta connexion.");
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
        alert(`Fichier "${file.name}" reçu ! Analyse en cours...`);
      }, 1500);
    }
  };

  const supprimerExamen = (id: string) => {
    setExamens(examens.filter(ex => ex.id !== id));
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      {/* SIDEBAR FIXE */}
      <aside className="w-64 bg-white border-r border-gray-100 p-6 flex flex-col fixed h-full z-10">
        <div className="mb-10">
          <h1 className="text-xl font-bold text-blue-600 tracking-tight">A.B. Planner</h1>
          <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">Student OS</p>
        </div>
        
        <nav className="space-y-2">
          <Link href="/">
            <div className="flex items-center gap-3 px-4 py-3 bg-blue-50 text-blue-600 rounded-xl font-bold cursor-pointer transition-all">
              <LayoutDashboard size={18} /> Dashboard
            </div>
          </Link>

          <Link href="/todo">
            <div className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-gray-50 hover:text-blue-600 rounded-xl font-semibold transition-all cursor-pointer group">
              <CheckCircle2 size={18} className="group-hover:text-blue-600" /> To-Do List
            </div>
          </Link>
        </nav>

        <div className="mt-auto pt-6 border-t border-gray-50">
          <p className="text-[10px] text-gray-300 text-center font-medium">© 2026 AB Planner</p>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 ml-64 p-8">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">Mon Espace</h2>
            <p className="text-gray-500 mt-1 font-medium">Tes données sont maintenant sauvegardées dans le cloud.</p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            
            {/* ZONE UPLOAD */}
            <div 
              onClick={() => document.getElementById('fileInput')?.click()}
              className={`relative border-2 border-dashed rounded-3xl p-12 flex flex-col items-center justify-center transition-all cursor-pointer
                ${isUploading ? 'border-blue-400 bg-blue-50' : 'border-gray-100 bg-white hover:border-blue-300 hover:shadow-2xl hover:scale-[1.01]'}`}
            >
              <input type="file" id="fileInput" className="hidden" accept=".pdf" onChange={handleFileUpload} />
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 ${isUploading ? 'bg-blue-600 text-white animate-bounce' : 'bg-blue-50 text-blue-600'}`}>
                <Upload size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-800">
                {isUploading ? "Analyse du PDF..." : "Importer ton emploi du temps"}
              </h3>
            </div>

            {/* LISTE DES EXAMENS */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">Tes prochains examens</h3>
              </div>

              {examens.length === 0 ? (
                <div className="text-center py-12 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                  <FileText size={32} className="mx-auto text-gray-200 mb-3" />
                  <p className="text-gray-400 font-medium text-sm">Aucun examen pour le moment.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {examens.map((ex) => (
                    <div key={ex.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-transparent hover:border-blue-100 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-blue-600 shadow-sm">
                          <Calendar size={18} />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{ex.matiere}</p>
                          <p className="text-xs text-gray-400 font-bold uppercase">{ex.date}</p>
                        </div>
                      </div>
                      <button onClick={() => supprimerExamen(ex.id)} className="text-gray-300 hover:text-red-500 p-2">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* FORMULAIRE D'AJOUT RÉEL */}
              <div className="mt-8 pt-8 border-t border-gray-50 grid grid-cols-2 gap-4">
                <input 
                  type="text" placeholder="Matière" 
                  value={nomMatiere} onChange={(e) => setNomMatiere(e.target.value)}
                  className="bg-gray-50 border-none rounded-xl px-5 py-4 text-sm font-semibold focus:ring-2 focus:ring-blue-500"
                />
                <input 
                  type="date" 
                  value={dateExamen} onChange={(e) => setDateExamen(e.target.value)}
                  className="bg-gray-50 border-none rounded-xl px-5 py-4 text-sm font-semibold focus:ring-2 focus:ring-blue-500"
                />
                <button 
                  onClick={handleAjouterExamen}
                  disabled={isSaving}
                  className="col-span-2 bg-gray-900 text-white rounded-2xl py-4 font-bold hover:bg-blue-600 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Plus size={20} />}
                  {isSaving ? "Enregistrement..." : "Ajouter et Sauvegarder"}
                </button>
              </div>
            </div>
          </div>

          {/* STATS RAPIDES */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-6">Productivité</h3>
              <div className="h-2 bg-gray-50 rounded-full overflow-hidden">
                <div className="w-1/3 h-full bg-blue-600"></div>
              </div>
              <p className="text-[11px] text-gray-400 mt-4 italic text-center">Données synchronisées avec Neon</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}