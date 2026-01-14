"use client";

import React, { useState } from 'react';
import { CheckCircle2, Circle, Plus, Calendar, Star, Flame, Trash2, ArrowLeft } from "lucide-react";
import Link from 'next/link';

interface Item {
  id: string;
  text: string;
  type: 'habit' | 'goal';
  completedDays: boolean[]; // [Lun, Mar, Mer, Jeu, Ven, Sam, Dim]
}

export default function TodoPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [selectedType, setSelectedType] = useState<'habit' | 'goal'>('goal');

  const jours = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

  const addItem = () => {
    if (!inputValue) return;
    const newItem: Item = {
      id: Math.random().toString(36).substr(2, 9),
      text: inputValue,
      type: selectedType,
      completedDays: new Array(7).fill(false),
    };
    setItems([...items, newItem]);
    setInputValue("");
  };

  const toggleDay = (itemId: string, dayIndex: number) => {
    setItems(items.map(item => {
      if (item.id === itemId) {
        const newDays = [...item.completedDays];
        newDays[dayIndex] = !newDays[dayIndex];
        return { ...item, completedDays: newDays };
      }
      return item;
    }));
  };

  const deleteItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  return (
    <div className="min-h-screen bg-[#fcfcfc] p-8">
      {/* Header */}
      <div className="max-w-5xl mx-auto mb-10">
        <Link href="/" className="text-gray-400 hover:text-blue-600 flex items-center gap-2 mb-4 transition-colors">
          <ArrowLeft size={18} /> Retour au Dashboard
        </Link>
        <h1 className="text-4xl font-black text-gray-900 mb-2">Ma To-Do List 📝</h1>
        <p className="text-gray-500">Organise tes habitudes et tes objectifs exceptionnels.</p>
      </div>

      <div className="max-w-5xl mx-auto space-y-8">
        {/* Barre d'ajout façon Notion */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm flex gap-4 items-center">
          <select 
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as 'habit' | 'goal')}
            className="bg-gray-50 border-none rounded-lg text-sm font-bold text-gray-700 focus:ring-2 focus:ring-blue-500"
          >
            <option value="goal">🎯 Goal Exceptionnel</option>
            <option value="habit">🔥 Habitude Quotidienne</option>
          </select>
          <input 
            type="text" 
            placeholder="Ajouter une tâche... (ex: Aller au spectacle, Méditer)"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addItem()}
            className="flex-1 border-none focus:ring-0 text-gray-800"
          />
          <button onClick={addItem} className="bg-blue-600 text-white p-2 rounded-xl hover:bg-blue-700 transition-all">
            <Plus size={20} />
          </button>
        </div>

        {/* Tableau des objectifs */}
        <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm">
          <div className="grid grid-cols-[1fr_repeat(7,60px)_50px] border-b border-gray-100 bg-gray-50/50 p-4 text-xs font-black text-gray-400 uppercase tracking-wider text-center">
            <div className="text-left pl-4">Objectif / Habitude</div>
            {jours.map(j => <div key={j}>{j}</div>)}
            <div></div>
          </div>

          <div className="divide-y divide-gray-50">
            {items.map((item) => (
              <div key={item.id} className="grid grid-cols-[1fr_repeat(7,60px)_50px] items-center p-4 hover:bg-gray-50/50 transition-colors group">
                <div className="flex items-center gap-3 pl-4">
                  {item.type === 'habit' ? <Flame size={18} className="text-orange-500" /> : <Star size={18} className="text-yellow-500" />}
                  <span className={`font-semibold ${item.type === 'habit' ? 'text-gray-800' : 'text-blue-900'}`}>{item.text}</span>
                </div>
                
                {item.completedDays.map((checked, idx) => (
                  <div key={idx} className="flex justify-center">
                    <button 
                      onClick={() => toggleDay(item.id, idx)}
                      className={`w-6 h-6 rounded-md border-2 transition-all flex items-center justify-center
                        ${checked 
                          ? 'bg-blue-600 border-blue-600 text-white' 
                          : 'border-gray-200 hover:border-blue-400 bg-white'}`}
                    >
                      {checked && <CheckCircle2 size={14} />}
                    </button>
                  </div>
                ))}

                <button onClick={() => deleteItem(item.id)} className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 transition-all">
                  <Trash2 size={18} />
                </button>
              </div>
            ))}

            {items.length === 0 && (
              <div className="p-20 text-center text-gray-300 italic">
                Rien de prévu pour le moment. Ajoute ton premier objectif !
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}