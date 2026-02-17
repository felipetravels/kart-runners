"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from "@/lib/supabaseClient";

const RUNS = [
  { id: 1, name: "Bieg 5K", dist: "5.0 km" },
  { id: 2, name: "Bieg 10K", dist: "10.0 km" },
  { id: 3, name: "Półmaraton", dist: "21.097 km" },
  { id: 4, name: "Maraton", dist: "42.195 km" },
];

export default function Page() {
  const [modal, setModal] = useState<string | null>(null);
  const [participants, setParticipants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // POBIERANIE PRAWDZIWYCH DANYCH Z SUPABASE
  useEffect(() => {
    async function fetchParticipants() {
      const { data, error } = await supabase
        .from("profiles")
        .select("display_name, id"); // Pobieramy display_name (Imię) z Twojej tabeli profili
      
      if (!error && data) {
        setParticipants(data);
      }
      setLoading(false);
    }
    fetchParticipants();
  }, []);

  return (
    <div className="min-h-screen">
      {/* NAVBAR USUNIĘTY - JEST JUŻ W LAYOUT.TSX */}

      <main className="max-w-6xl mx-auto pt-12 px-4">
        <p className="text-center text-gray-400 text-[11px] mb-10 font-medium uppercase tracking-widest">
          Kliknij w kartę, aby wprowadzić swój oficjalny rezultat
        </p>
        
        {/* KARTY BIEGÓW */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {RUNS.map((run) => (
            <div key={run.id} onClick={() => setModal(run.name)} className="workout-card p-8 rounded-2xl shadow-sm hover:shadow-md">
              <span className="text-[9px] font-black bg-blue-50 text-blue-500 px-2 py-1 rounded-md mb-4 inline-block uppercase tracking-wider">Bieg</span>
              <h3 className="text-xl font-bold text-slate-900">{run.name}</h3>
              <p className="text-gray-400 text-sm font-medium">{run.dist}</p>
            </div>
          ))}
        </div>

        {/* TABELA OPŁACONYCH (PRAWDZIWE DANE) */}
        <div className="paid-table-container shadow-sm">
          <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-white">
            <h3 className="font-bold text-slate-800 text-sm uppercase tracking-widest">Zarejestrowani Uczestnicy</h3>
            <span className="text-[10px] text-gray-400 font-bold uppercase">{participants.length} osób na liście</span>
          </div>
          <table className="w-full text-left bg-white">
            <thead>
              <tr className="text-[9px] text-gray-300 font-black uppercase tracking-[0.2em] border-b border-gray-50">
                <th className="p-6">Uczestnik</th>
                <th className="p-6 text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={2} className="p-6 text-center text-gray-400">Ładowanie ekipy...</td></tr>
              ) : participants.map((u, i) => (
                <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/30 transition-colors">
                  <td className="p-6 font-bold text-slate-800 text-sm">{u.display_name || "Anonimowy Biegacz"}</td>
                  <td className="p-6 text-right">
                    <span className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-500 text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider">
                      <span className="w-1 h-1 bg-emerald-500 rounded-full"></span> Zarejestrowany
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md z-[2000] flex items-center justify-center p-4">
          <div className="bg-white p-10 rounded-[2.5rem] w-full max-w-sm shadow-2xl">
            <h3 className="text-2xl font-black mb-1 text-slate-900">{modal}</h3>
            <p className="text-gray-400 text-xs font-bold uppercase mb-8 tracking-widest">Wprowadź czas</p>
            <input type="text" placeholder="00:00:00" className="w-full p-5 bg-gray-50 border border-gray-100 rounded-2xl mb-8 text-center text-3xl font-mono text-slate-800 outline-none focus:border-blue-400" autoFocus />
            <div className="flex gap-4">
              <button onClick={() => setModal(null)} className="flex-1 py-4 font-black text-gray-400 text-xs uppercase tracking-widest">Anuluj</button>
              <button onClick={() => setModal(null)} className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-200">Zapisz</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}