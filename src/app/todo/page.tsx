import { SignInButton, SignedIn, SignedOut } from "@clerk/nextjs";
import Link from "next/link";
import { ArrowRight, CheckCircle, Layout, BookOpen, Cloud } from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-slate-50 to-slate-200 text-slate-900 p-6">
      
      {/* Container Principal */}
      <div className="max-w-3xl w-full text-center space-y-12 bg-white p-10 rounded-3xl shadow-xl border border-slate-100">
        
        {/* En-tête / Titre */}
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full font-semibold text-sm mb-4">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
            </span>
            Nouvelle version disponible
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight">
            AB Planner <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              Student OS
            </span>
          </h1>
          
          <p className="text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
            L'outil ultime pour organiser ta vie d'étudiant. 
            Planifie tes examens, gère tes tâches et synchronise tout dans le cloud.
          </p>
        </div>

        {/* Liste des fonctionnalités (Icônes) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-8 border-t border-gray-100 border-b">
          <div className="flex flex-col items-center space-y-3">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl">
              <BookOpen size={32} />
            </div>
            <h3 className="font-bold text-lg">Examens</h3>
            <p className="text-sm text-gray-400">Suivi des dates et matières</p>
          </div>
          
          <div className="flex flex-col items-center space-y-3">
            <div className="p-3 bg-green-100 text-green-600 rounded-2xl">
              <CheckCircle size={32} />
            </div>
            <h3 className="font-bold text-lg">To-Do List</h3>
            <p className="text-sm text-gray-400">Tâches quotidiennes</p>
          </div>

          <div className="flex flex-col items-center space-y-3">
            <div className="p-3 bg-purple-100 text-purple-600 rounded-2xl">
              <Cloud size={32} />
            </div>
            <h3 className="font-bold text-lg">Cloud Sync</h3>
            <p className="text-sm text-gray-400">Sauvegarde automatique</p>
          </div>
        </div>

        {/* Zone de Connexion (Logique Clerk) */}
        <div className="flex flex-col items-center gap-4 pt-4">
          
          {/* Si l'utilisateur n'est PAS connecté */}
          <SignedOut>
            <SignInButton mode="modal">
              <button className="group relative inline-flex items-center gap-3 justify-center rounded-full bg-blue-600 px-8 py-4 text-lg font-bold text-white transition-all hover:bg-blue-700 hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2">
                Commencer gratuitement
                <ArrowRight className="group-hover:translate-x-1 transition-transform" />
              </button>
            </SignInButton>
            <p className="text-sm text-gray-400 mt-4">
              Pas besoin de carte bancaire. Connexion via Google ou Email.
            </p>
          </SignedOut>

          {/* Si l'utilisateur EST connecté */}
          <SignedIn>
            <div className="flex flex-col items-center gap-3">
              <p className="text-lg font-medium text-gray-700">Heureux de te revoir ! 👋</p>
              <Link href="/dashboard">
                <button className="group inline-flex items-center gap-2 rounded-full bg-green-600 px-8 py-4 text-lg font-bold text-white transition-all hover:bg-green-700 hover:shadow-lg hover:-translate-y-1">
                  <Layout size={20} />
                  Accéder à mon Espace
                  <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
            </div>
          </SignedIn>

        </div>
      </div>

      {/* Footer simple */}
      <footer className="mt-12 text-center text-gray-400 text-sm">
        © 2026 AB Planner. Fait avec ❤️ pour les étudiants.
      </footer>
    </div>
  );
}