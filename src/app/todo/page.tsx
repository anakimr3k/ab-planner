import Link from "next/link";
import { LayoutDashboard, CheckCircle2, ArrowLeft, Plus, Loader2 } from "lucide-react";
import { UserButton } from "@clerk/nextjs";

export default function TodoPage() {
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
            <div className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-gray-50 hover:text-blue-600 rounded-xl font-semibold transition-all cursor-pointer group">
              <LayoutDashboard size={18} /> Dashboard
            </div>
          </Link>

          <Link href="/dashboard/todo">
            <div className="flex items-center gap-3 px-4 py-3 bg-blue-50 text-blue-600 rounded-xl font-bold cursor-pointer transition-all">
              <CheckCircle2 size={18} /> To-Do List
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
        <header className="mb-10">
          <Link href="/dashboard" className="text-blue-600 flex items-center gap-2 mb-4 text-sm font-bold group">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Retour au Dashboard
          </Link>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Ma To-Do List</h2>
          <p className="text-gray-500 mt-1 font-medium">Gestion de tes tâches par Abdel-hakim B.</p>
        </header>

        <div className="max-w-4xl">
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
            <div className="text-center py-20 border-2 border-dashed border-gray-50 rounded-2xl">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-800">Bientôt disponible</h3>
              <p className="text-gray-400 mt-2 max-w-xs mx-auto">
                Je travaille sur la connexion de cette liste avec la base de données Neon.
              </p>
            </div>

            {/* Aperçu du formulaire futur */}
            <div className="mt-8 opacity-50 pointer-events-none">
              <div className="flex gap-4">
                <input type="text" placeholder="Nouvelle tâche..." className="flex-1 bg-gray-50 border-none rounded-xl px-5 py-4 text-sm font-semibold" />
                <button className="bg-gray-900 text-white rounded-2xl px-8 py-4 font-bold flex items-center gap-2">
                  <Plus size={20} /> Ajouter
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}