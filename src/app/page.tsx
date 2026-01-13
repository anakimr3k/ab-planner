"use client";

import React, { useState } from 'react';
import { Upload, Plus, Calendar, CheckCircle2, FileText, Trash2 } from "lucide-react";

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

  // 1. Moteur d'importation de fichier
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      // Simulation d'analyse du PDF (On ajoutera l'IA plus tard)
      setTimeout(() => {
        setIsUploading(false);
        alert(`Fichier "${file.name}" reçu ! Analyse en cours...`);
      }, 1500);
    }
  };

  // 2. Moteur pour ajouter un examen manuellement
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

  // 3. Supprimer un examen
  const supprimerExamen = (id: number) => {
    setExamens(examens.filter(ex => ex.id !== id));
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      {/* Sidebar - Design fixe */}
      <aside className="w-64 bg-white border-r border-gray-100 p-6 flex flex-col">
        <div className="mb-10">
          <h1 className="text-xl font-bold text-blue-600 tracking-tight">A.B. Planner</h1>
          <p className="text-[10px] text-gray-400 font-medium">STUDENT OS v1.0</p>
        </div>
        <nav className="space-y-1">
          <div className="flex items-center gap-3 px-4 py-3 bg-blue-50 text-blue-600 rounded-xl font-semibold cursor-pointer">
            <Calendar size={18} /> Dashboard
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Mon Espace</h2>
            <p className="text-gray-500 mt-1">Gère tes révisions et réussis tes évals.</p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ZONE UPLOAD INTERACTIVE */}
          <div className="lg:col-span-2 space-y-8">
            <div 
              onClick={() => document.getElementById('fileInput')?.click()}
              className={`relative border-2 border-dashed rounded-3xl p-12 flex flex-col items-center justify-center transition-all cursor-pointer
                ${isUploading ? 'border-blue-400 bg-blue-50' : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-xl'}`}
            >
              <input type="file" id="fileInput" className="hidden" accept=".pdf" onChange={handleFileUpload} />
              
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 ${isUploading ? 'bg-blue-600 text-white animate-bounce' : 'bg-blue-50 text-blue-600'}`}>
                <Upload size={28} />
              </div>
              
              <h3 className="text-xl font-bold text-gray-800">
                {isUploading ? "Analyse du PDF..." : "Importer ton emploi du temps"}
              </h3>
              <p className="text-gray-400 text-sm mt-2">Clique pour parcourir tes fichiers (PDF)</p>
            </div>

            {/* LISTE DES EXAMENS DYNAMIQUE */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-50">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">Tes examens</h3>
                <span className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full">
                  {examens.length} TOTAL
                </span>
              </div>

              {examens.length === 0 ? (
                <div className="text-center py-10">
                  <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                    <FileText size={24} />
                  </div>
                  <p className="text-gray-400">Aucun examen pour le moment.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {examens.map((ex) => (
                    <div key={ex.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl group hover:bg-white hover:shadow-md transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm">
                          <CheckCircle2 size={20} />
                        </div>
                        <div>
                          <p className="font-bold text-gray-800">{ex.matiere}</p>
                          <p className="text-sm text-gray-400">{ex.date}</p>
                        </div>
                      </div>
                      <button onClick={() => supprimerExamen(ex.id)} className="text-gray-300 hover:text-red-500 p-2">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* FORMULAIRE D'AJOUT RAPIDE */}
              <div className="mt-8 pt-8 border-t border-gray-100 grid grid-cols-2 gap-4">
                <input 
                  type="text" placeholder="Matière (ex: Maths)" 
                  value={nomMatiere} onChange={(e) => setNomMatiere(e.target.value)}
                  className="bg-gray-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500"
                />
                <input 
                  type="date" 
                  value={dateExamen} onChange={(e) => setDateExamen(e.target.value)}
                  className="bg-gray-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500"
                />
                <button 
                  onClick={ajouterExamen}
                  className="col-span-2 bg-blue-600 text-white rounded-xl py-3 font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Plus size={18} /> Ajouter manuellement
                </button>
              </div>
            </div>
          </div>

          {/* SIDEBAR DROITE - PROGRESSION */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-50">
              <h3 className="font-bold text-gray-800 mb-6">Progression</h3>
              <div className="relative pt-1">
                <div className="flex mb-2 items-center justify-between">
                  <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-100">
                    Objectif Révisions
                  </span>
                  <span className="text-xs font-semibold inline-block text-blue-600">
                    {examens.length > 0 ? "15%" : "0%"}
                  </span>
                </div>
                <div className="overflow-hidden h-2 mb-4 text-xs flex rounded-full bg-gray-100">
                  <div style={{ width: examens.length > 0 ? "15%" : "0%" }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500 transition-all duration-500"></div>
                </div>
                <p className="text-[11px] text-gray-400 italic">Continue comme ça !</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}