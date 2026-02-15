"use client";

import React, { useState } from 'react';

const RUNS = [
  { id: 1, name: "Bieg 5K", dist: "5.0 km" },
  { id: 2, name: "Bieg 10K", dist: "10.0 km" },
  { id: 3, name: "Półmaraton", dist: "21.097 km" },
  { id: 4, name: "Maraton", dist: "42.195 km" },
];

const PAID = [
  { name: "Marek", email: "marek.biegacz@gmail.com" },
  { name: "Anna", email: "ania.run@example.com" },
  { name: "Jan", email: "j.nowak@poczta.pl" },
  { name: "Krzysztof", email: "krzys@maraton.pl" },
];

export default function Page() {
  const [modal, setModal] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* NAVBAR Z TWOJEGO SCREENA */}
      <nav className="fixed top-0 left-0 w-full bg-[#0a0a0a] text-white p-4 h-[80px]">
        <div className="max-w-7xl mx-auto flex justify-between items-center h-full">
          <div className="flex items-center gap-4">
            <img src="/logo.png" alt="Logo" className="h-12 w-auto" />
            <div className="font-bold leading-tight">
              <span className="block text-xl">KRAKÓW AIRPORT</span>
              <span className="block text-blue-400">RUNNING TEAM</span>
            </div>
          </div>
          <div className="flex gap-6 items-center text-xs font-bold uppercase tracking-widest">
            <a href="#">Ekipa</a>
            <a href="#">Logistyka</a>
            <a href="#">Wyniki</a>
            <div className="bg-blue-500 px-4 py-2 rounded text-white">Profil</div>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto pt-12 px-4">
        <p className="text-center text-gray-400 text-sm mb-10">Kliknij w kartę, aby wprowadzić swój oficjalny rezultat</p>
        
        {/* KARTY BIEGÓW */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {RUNS.map((run) => (
            <div key={run.id} onClick={() => setModal(run.name)} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-all">
              <span className="text-[10px] font-bold bg-blue-100 text-blue-600 px-2 py-1 rounded mb-4 inline-block uppercase">Bieg</span>
              <h3 className="text-xl font-bold text-slate-800">{run.name}</h3>
              <p className="text-gray-400 text-sm">{run.dist}</p>
            </div>
          ))}
        </div>

        {/* TABELA OPŁACONYCH */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex justify-between items-center">
            <h3 className="font-bold text-slate-800 uppercase tracking-wider">Opłacone Starty</h3>
            <span className="text-xs text-gray-400 font-bold">4 osoby na liście</span>
          </div>
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] text-gray-300 font-bold uppercase tracking-[0.2em] border-b border-gray-50">
                <th className="p-6">Uczestnik</th>
                <th className="p-6">Adres E-mail</th>
                <th className="p-6 text-right">Status Wpłaty</th>
              </tr>
            </thead>
            <tbody>
              {PAID.map((u, i) => (
                <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="p-6 font-bold text-slate-700">{u.name}</td>
                  <td className="p-6 text-gray-400 font-mono text-sm">{u.email}</td>
                  <td className="p-6 text-right">
                    <span className="inline-flex items-center gap-2 bg-green-50 text-green-500 text-[10px] font-bold px-3 py-1 rounded-full uppercase">
                      <span className="w-1 h-1 bg-green-500 rounded-full"></span> Opłacono
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {/* MODAL */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[2000] flex items-center justify-center p-4">
          <div className="bg-white p-10 rounded-[2rem] w-full max-w-md shadow-2xl">
            <h3 className="text-2xl font-bold mb-6">{modal}</h3>
            <input type="text" placeholder="00:00:00" className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl mb-6 text-center text-2xl font-mono" autoFocus />
            <div className="flex gap-4">
              <button onClick={() => setModal(null)} className="flex-1 py-4 font-bold text-gray-400">Anuluj</button>
              <button onClick={() => setModal(null)} className="flex-1 py-4 bg-blue-600 text-white rounded-xl font-bold">Zapisz</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
