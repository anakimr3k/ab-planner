"use client";

import { useState, useMemo } from "react";
import { parseAndUploadSchedule } from "@/app/actions/schedule-parser";
import { deleteEvent, createManualEvent, clearAllEvents, updateEvent } from "@/app/actions/event";
import { Plus, FileUp, Trash2, MapPin, Clock, Calendar as CalendarIcon, X, Loader2, Trash } from "lucide-react";

interface Event {
  id: string;
  title: string;
  day: string;
  startTime: string;
  endTime: string;
  weekType: string;
  details?: string | null;
}

// Heures disponibles
const TIME_SLOTS = [
  "08h00", "09h00", "10h00", "11h00", "12h00", 
  "13h00", "14h00", "15h00", "16h00", "17h00", "18h00"
];

export default function ScheduleClient({ initialEvents }: { initialEvents: Event[] }) {
  const [currentWeek, setCurrentWeek] = useState<"A" | "B">("A");
  const [isUploading, setIsUploading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dragData, setDragData] = useState<{ id: string; offset: number } | null>(null);
  const [events, setEvents] = useState(initialEvents);

  const days = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];

  const filteredEvents = useMemo(() => {
    return events.filter(event => 
      event.weekType === "BOTH" || event.weekType === currentWeek
    );
  }, [events, currentWeek]);

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", e.target.files[0]);
    try {
      await parseAndUploadSchedule(formData);
      window.location.reload();
    } catch (error) {
      alert("Erreur lors de l'importation");
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  const handleClearAll = async () => {
    if (confirm("Vider tout le planning ?")) {
      try {
        await clearAllEvents();
        window.location.reload();
      } catch (error) {
        alert("Erreur");
      }
    }
  };

  // === DRAG & DROP SIMPLIFIÉ ===
  const handleDragStart = (e: React.DragEvent, eventId: string) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setDragData({ id: eventId, offset: e.clientY - rect.top });
    e.dataTransfer.setData("text/plain", eventId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = async (e: React.DragEvent, targetDay: string, targetTime: string) => {
    e.preventDefault();
    const eventId = e.dataTransfer.getData("text/plain");
    if (!eventId) return;

    const event = events.find(e => e.id === eventId);
    if (!event) return;

    // Calculer la nouvelle durée
    const startMins = parseInt(event.startTime.replace("h", ""));
    const endMins = parseInt(event.endTime.replace("h", ""));
    const duration = endMins - startMins;
    
    const targetHour = parseInt(targetTime.replace("h", ""));
    const newStartMins = targetHour * 60;
    const newEndMins = newStartMins + duration;
    
    const newStartTime = `${String(Math.floor(newStartMins / 60)).padStart(2, "0")}h${String(newStartMins % 60).padStart(2, "0")}`;
    const newEndTime = `${String(Math.floor(newEndMins / 60)).padStart(2, "0")}h${String(newEndMins % 60).padStart(2, "0")}`;

    // Mise à jour locale
    setEvents(prev => prev.map(ev => 
      ev.id === eventId 
        ? { ...ev, day: targetDay, startTime: newStartTime, endTime: newEndTime }
        : ev
    ));

    // Sauvegarder
    try {
      await updateEvent(eventId, { day: targetDay, startTime: newStartTime, endTime: newEndTime });
    } catch (error) {
      setEvents(prev => prev.map(ev => ev.id === eventId ? event : ev));
    }
    
    setDragData(null);
  };

  const handleDragEnd = () => {
    setDragData(null);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-slate-900">Mon Planning</h1>
          <p className="text-sm text-slate-500">Semaine {currentWeek}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            {["A", "B"].map((w) => (
              <button
                key={w}
                onClick={() => setCurrentWeek(w as "A" | "B")}
                className={`px-5 py-2 rounded-lg text-sm font-bold ${
                  currentWeek === w ? "bg-white text-blue-600 shadow-md" : "text-slate-500"
                }`}
              >
                Semaine {w}
              </button>
            ))}
          </div>

          <label className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold cursor-pointer border ${
            isUploading ? "bg-slate-50 text-slate-400" : "bg-white border-slate-200"
          }`}>
            {isUploading ? <Loader2 size={18} className="animate-spin" /> : <FileUp size={18} />}
            {isUploading ? "Analyse..." : "Importer PDF"}
            <input type="file" className="hidden" onChange={handleImport} accept=".pdf" disabled={isUploading} />
          </label>

          <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold">
            <Plus size={18} /> Ajouter
          </button>

          {events.length > 0 && (
            <button onClick={handleClearAll} className="flex items-center gap-2 px-4 py-2.5 text-red-600 bg-red-50 border border-red-200 rounded-xl text-sm font-semibold">
              <Trash size={18} /> Vider
            </button>
          )}
        </div>
      </div>

      {/* Grille du Planning */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        {days.map(day => (
          <div key={day} className="flex flex-col gap-2">
            <div className="text-center py-2 bg-white rounded-xl border border-slate-200 shadow-sm">
              <span className="text-xs font-black text-slate-400 uppercase">{day}</span>
            </div>
            
            <div 
              className="flex-1 space-y-2 min-h-[500px]"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, day, "08h00")}
            >
              {TIME_SLOTS.map(time => {
                // Trouver les événements à cette heure
                const eventsAtTime = filteredEvents
                  .filter(e => e.day.toLowerCase() === day.toLowerCase())
                  .sort((a, b) => a.startTime.localeCompare(b.startTime))
                  .filter(e => {
                    const hour = parseInt(e.startTime.replace("h", ""));
                    return hour === parseInt(time.replace("h", ""));
                  });

                return (
                  <div 
                    key={time}
                    className="h-16 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center bg-slate-50/50 hover:bg-blue-50 hover:border-blue-300 transition-colors"
                  >
                    {eventsAtTime.length > 0 ? (
                      eventsAtTime.map(event => (
                        <div
                          key={event.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, event.id)}
                          onDragEnd={handleDragEnd}
                          className="w-full mx-1 px-2 py-1 bg-white rounded-lg border border-slate-200 shadow-sm cursor-move hover:shadow-md hover:border-blue-400 transition-all"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-blue-600">
                              {event.startTime}-{event.endTime}
                            </span>
                            <button 
                              onClick={() => { if(confirm("Supprimer ?")) deleteEvent(event.id) }}
                              className="text-slate-400 hover:text-red-500"
                            >×</button>
                          </div>
                          <span className="text-xs font-bold text-slate-800 line-clamp-1 block">
                            {event.title}
                          </span>
                          {event.weekType !== "BOTH" && (
                            <span className="text-[9px] text-blue-500 font-semibold">Sem {event.weekType}</span>
                          )}
                        </div>
                      ))
                    ) : (
                      <span className="text-[10px] text-slate-300">{time}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Modale */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-slate-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-800">Ajouter une activité</h3>
              <button onClick={() => setIsModalOpen(false)}><X size={20} /></button>
            </div>
            
            <form action={async (formData) => {
              try {
                await createManualEvent(formData);
                setIsModalOpen(false);
              } catch (e) {
                alert("Erreur");
              }
            }} className="p-6 space-y-5">
              <div>
                <label className="text-xs font-black text-slate-400 uppercase ml-1">Matière</label>
                <input name="title" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl" placeholder="ex: Mathématiques" required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-black text-slate-400 uppercase ml-1">Jour</label>
                  <select name="day" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    {days.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-black text-slate-400 uppercase ml-1">Récurrence</label>
                  <select name="weekType" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <option value="BOTH">Toutes les semaines</option>
                    <option value="A">Semaine A uniquement</option>
                    <option value="B">Semaine B uniquement</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-black text-slate-400 uppercase ml-1">Début</label>
                  <input name="startTime" type="time" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl" required />
                </div>
                <div>
                  <label className="text-xs font-black text-slate-400 uppercase ml-1">Fin</label>
                  <input name="endTime" type="time" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl" required />
                </div>
              </div>

              <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 mt-2">
                Enregistrer
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
