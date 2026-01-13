import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { Calendar, Upload, BookOpen, Clock, ChevronRight } from "lucide-react";

export default async function Home() {
  const { userId } = await auth();

  return (
    <div className="min-h-screen bg-gray-50 flex overflow-hidden">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-white border-r border-gray-200 p-6 hidden md:flex flex-col relative z-20">
        <div className="mb-10">
          <h1 className="text-xl font-bold text-blue-700 tracking-tight">A.B. Planner</h1>
          <p className="text-[10px] text-gray-400 uppercase font-semibold">Abdel-hakim Bourahla</p>
        </div>
        
        <nav className="space-y-2 flex-1">
          <div className="flex items-center gap-3 bg-blue-50 text-blue-700 p-3 rounded-lg font-semibold cursor-pointer">
            <BookOpen size={20} /> Dashboard
          </div>
          <div className="flex items-center gap-3 text-gray-500 hover:bg-gray-50 p-3 rounded-lg transition cursor-pointer">
            <Calendar size={20} /> Mon Planning
          </div>
        </nav>

        <div className="pt-6 border-t border-gray-100">
          <div className="bg-blue-600 rounded-xl p-4 text-white">
            <p className="text-sm font-medium mb-3">Altiora Ressources</p>
            <button className="text-xs bg-white text-blue-600 px-3 py-1.5 rounded-lg font-bold w-full">
              Accéder au site
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto relative z-10">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Mon Espace</h2>
            <p className="text-gray-500 text-sm italic">Organise tes révisions et réussis tes évals.</p>
          </div>
          <div className="flex items-center gap-4">
            <UserButton afterSignOutUrl="/" />
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-6">
            {/* Zone Upload PDF */}
            <div className="bg-white p-8 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center hover:border-blue-400 transition-all group cursor-pointer active:scale-95">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                <Upload className="text-blue-600" size={28} />
              </div>
              <h3 className="font-bold text-gray-800 text-lg">Importer ton emploi du temps</h3>
              <p className="text-gray-400 text-sm mt-1 mb-6 text-center">Format PDF uniquement</p>
              <button className="bg-gray-900 text-white px-6 py-2.5 rounded-xl font-medium pointer-events-none">
                Parcourir
              </button>
            </div>

            {/* Prochains Examens */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-50 flex justify-between items-center">
                <h3 className="font-bold text-gray-800">Tes examens</h3>
              </div>
              <div className="p-6 text-center py-10">
                <p className="text-gray-400 text-sm mb-4">Aucun examen ajouté pour le moment.</p>
                <button className="py-3 px-6 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all active:scale-95">
                  + Ajouter un contrôle
                </button>
              </div>
            </div>
          </div>

          {/* Section Droite */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <h3 className="font-bold text-gray-800 mb-4">Progression</h3>
              <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                <div className="bg-blue-600 h-full w-[20%]"></div>
              </div>
              <p className="text-xs text-gray-400 mt-2">Démarrage en cours...</p>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}