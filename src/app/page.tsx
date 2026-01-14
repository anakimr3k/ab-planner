"use client";

import React, { useState } from 'react';
import { Upload, Plus, Calendar, CheckCircle2, FileText, Trash2, LayoutDashboard } from "lucide-react";
import Link from 'next/link'; // Import indispensable pour la navigation

// Structure d'un examen
interface Examen {
  id: number;
  matiere: string;
  date: string;
}

export default function Page() {
  const [examens, setExamens] = useState<Examen[]>([]);
  const [nomMatiere, setNomMatiere] = useState("");
  const [dateExamen, setDateExamen] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  // Moteur d'importation de fichier
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

  // Moteur pour ajouter un examen manuellement
  const ajouterExamen = () => {
    if (nomMatiere && dateExamen) {
      const nouvelExamen = {
        id: Date.now(),
        matiere: nomMatiere,
        date: dateExamen
      };
      setExamens([...examens, nouvelExamen]);
      setNomMatiere("");
      setDateExamen("");
    }
  };

  const supprimerExamen = (id: number) => {
    setExamens(examens.filter(ex => ex.id !== id));
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      {/* SIDEBAR AMÉLIORÉE AVEC ONGLETS */}
      <aside className="w-64 bg-white border-r border-gray-100 p-6 flex flex-col fixed h-full">
        <div className="mb-10">
          <h1 className="text-xl font-bold text-blue-600 tracking-tight">A.B. Planner</h1>
          <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">Student OS</p>
        </div>
        
        <nav className="space-y-2">
          {/* Lien vers le Dashboard (Page actuelle) */}
          <Link href="/">
            <div className="flex items-center gap-3 px-4 py-3 bg-blue-50 text-blue-600 rounded-xl font-bold cursor-pointer transition-all">
              <LayoutDashboard size={18} /> Dashboard
            </div>
          </Link>

          {/* NOUVEAU : Lien vers la To-Do List */}
          <Link href="/todo">
            <div className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-gray-50 hover:text-blue-600 rounded-xl font-semibold transition-all cursor-pointer group">
              <CheckCircle2 size={18} className="group-hover:text-blue-600" /> To-Do List
            </div>
          </Link>
        </nav>

        {/* Footer Sidebar */}
        <div className="mt-auto pt-6 border-t border-gray-50">
          <p className="text-[10px] text-gray-300 text-center font-medium">© 2026 AB Planner</p>
        </div>
      </aside>

      {/* Main Content - On ajoute un margin-left de 64 pour ne pas être sous la sidebar fixe */}
      <main className="flex-1 ml-64 p-8">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">Mon Espace</h2>
            <p className="text-gray-500 mt-1 font-medium">Organise tes révisions et réussis tes évals.</p>
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
              <p className="text-gray-400 text-sm mt-2 font-medium">Format PDF uniquement</p>
            </div>

            {/* LISTE DES EXAMENS */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">Tes prochains examens</h3>
                <span className="bg-blue-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase">
                  {examens.length} Examens
                </span>
              </div>

              {examens.length === 0 ? (
                <div className="text-center py-12 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                  <FileText size={32} className="mx-auto text-gray-200 mb-3" />
                  <p className="text-gray-400 font-medium text-sm">Aucun examen programmé.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {examens.map((ex) => (
                    <div key={ex.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl group hover:bg-white hover:shadow-xl hover:scale-[1.02] transition-all border border-transparent hover:border-blue-100">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm border border-gray-50">
                          <Calendar size={20} />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{ex.matiere}</p>
                          <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">{ex.date}</p>
                        </div>
                      </div>
                      <button onClick={() => supprimerExamen(ex.id)} className="text-gray-300 hover:text-red-500 transition-colors p-2">
                        <Trash2 size={20} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* FORMULAIRE D'AJOUT */}
              <div className="mt-8 pt-8 border-t border-gray-50 grid grid-cols-2 gap-4">
                <input 
                  type="text" placeholder="Matière (ex: Mathématiques)" 
                  value={nomMatiere} onChange={(e) => setNomMatiere(e.target.value)}
                  className="bg-gray-50 border-none rounded-xl px-5 py-4 text-sm font-semibold focus:ring-2 focus:ring-blue-500 transition-all shadow-inner"
                />
                <input 
                  type="date" 
                  value={dateExamen} onChange={(e) => setDateExamen(e.target.value)}
                  className="bg-gray-50 border-none rounded-xl px-5 py-4 text-sm font-semibold focus:ring-2 focus:ring-blue-500 transition-all shadow-inner"
                />
                <button 
                  onClick={ajouterExamen}
                  className="col-span-2 bg-gray-900 text-white rounded-2xl py-4 font-bold hover:bg-blue-600 transition-all hover:shadow-lg active:scale-95 flex items-center justify-center gap-3"
                >
                  <Plus size={20} /> Ajouter l'examen
                </button>
              </div>
            </div>
          </div>

          {/* COLONNE DROITE : STATS */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-6">Objectif Révisions</h3>
              <div className="relative pt-1">
                <div className="flex mb-3 items-center justify-between">
                  <span className="text-[10px] font-black inline-block py-1 px-3 uppercase rounded-full text-blue-600 bg-blue-50">
                    Niveau Global
                  </span>
                  <span className="text-sm font-black text-blue-600">
                    {examens.length > 0 ? "24%" : "0%"}
                  </span>
                </div>
                <div className="overflow-hidden h-3 mb-4 text-xs flex rounded-full bg-gray-50">
                  <div style={{ width: examens.length > 0 ? "24%" : "0%" }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-600 transition-all duration-1000"></div>
                </div>
                <p className="text-[11px] text-gray-400 font-medium italic">"Le succès est la somme de petits efforts répétés."</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}