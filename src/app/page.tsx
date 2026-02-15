"use client";

import React, { useState } from 'react';

// Dystanse - uwzględniono Maraton zgodnie z prośbą
const RUNNING_EVENTS = [
  { id: '5k', title: "Bieg 5K", distance: "5.0 km" },
  { id: '10k', title: "Bieg 10K", distance: "10.0 km" },
  { id: 'half', title: "Półmaraton", distance: "21.097 km" },
  { id: 'marathon', title: "Maraton", distance: "42.195 km" },
];

// Lista opłaconych - wyświetla Imiona i Maile
const PAID_PARTICIPANTS = [
  { id: 1, name: "Marek", email: "marek.biegacz@gmail.com" },
  { id: 2, name: "Anna", email: "ania.run@example.com" },
  { id: 3, name: "Jan", email: "j.nowak@poczta.pl" },
  { id: 4, name: "Krzysztof", email: "krzys@maraton.pl" },
];

export default function AppDashboard() {
  const [editingRace, setEditingRace] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* NAVBAR - Naprawiony (z-index) */}
      <nav className="fixed top-0 left-0 w-full bg-slate-900 text-white shadow-xl z-[110]">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center font-bold">K</div>
            <h1 className="text-xl font-bold tracking-tight uppercase">Kart Runners</h1>
          </div>
          <div className="hidden md:block text-sm font-medium text-slate-400">
            Witaj w panelu zarządzania wynikami
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6 space-y-12">
        {/* SEKCJA KART BIEGÓW */}
        <section>
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-3xl font-black text-slate-900 uppercase">Twoje Starty</h2>
              <p className="text-slate-500">Kliknij w kartę, aby wprowadzić swój oficjalny rezultat</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {RUNNING_EVENTS.map((race) => (
              <div 
                key={race.id}
                onClick={() => setEditingRace(race.title)}
                className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-2xl hover:border-blue-500 hover:-translate-y-2 transition-all cursor-pointer group"
              >
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase mb-4 inline-block">Bieg</span>
                <h3 className="text-2xl font-black text-slate-900 mb-1">{race.title}</h3>
                <p className="text-slate-500 font-bold mb-6">{race.distance}</p>
                <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 w-0 group-hover:w-full transition-all duration-500"></div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* LISTA OPŁACONYCH - Tabela z Imionami i Mailami */}
        <section className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h3 className="text-xl font-black text-slate-900 uppercase">Opłacone Starty</h3>
            <span className="text-sm text-slate-500 font-bold">{PAID_PARTICIPANTS.length} osób na liście</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white text-slate-400 text-xs font-black uppercase tracking-widest">
                  <th className="px-8 py-5">Uczestnik</th>
                  <th className="px-8 py-5">Adres E-mail</th>
                  <th className="px-8 py-5 text-right">Status Wpłaty</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {PAID_PARTICIPANTS.map((user) => (
                  <tr key={user.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="px-8 py-5 font-bold text-slate-800">{user.name}</td>
                    <td className="px-8 py-5 text-slate-500 font-mono text-sm">{user.email}</td>
                    <td className="px-8 py-5 text-right">
                      <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] font-black bg-green-100 text-green-700 uppercase">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                        Opłacono
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* MODAL WPISYWANIA WYNIKU */}
      {editingRace && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center z-[200] p-4">
          <div className="bg-white rounded-[2.5rem] p-10 w-full max-w-md shadow-2xl">
            <h3 className="text-3xl font-black text-slate-900 mb-2">{editingRace}</h3>
            <p className="text-slate-500 font-bold mb-8 uppercase text-xs tracking-widest">Wprowadź swój czas</p>
            
            <input 
              type="text" 
              placeholder="00:00:00" 
              className="w-full p-6 bg-slate-50 border-2 border-slate-100 rounded-3xl mb-8 focus:border-blue-500 outline-none text-3xl font-mono text-center text-slate-800"
              autoFocus
            />
            
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => setEditingRace(null)}
                className="py-5 rounded-2xl font-black text-slate-400 hover:bg-slate-50 transition-all uppercase text-sm tracking-widest"
              >
                Anuluj
              </button>
              <button 
                onClick={() => { alert('Wynik został pomyślnie zapisany w systemie!'); setEditingRace(null); }}
                className="py-5 rounded-2xl font-black bg-blue-600 text-white hover:bg-blue-700 shadow-xl shadow-blue-200 transition-all uppercase text-sm tracking-widest"
              >
                Zapisz
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}