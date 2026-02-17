"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from "@/lib/supabaseClient";

const RUNS = [
  { id: "5k", name: "Bieg 5K", dist: 5.0 },
  { id: "10k", name: "Bieg 10K", dist: 10.0 },
  { id: "hm", name: "Półmaraton", dist: 21.097 },
  { id: "m", name: "Maraton", dist: 42.195 },
];

export default function Page() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRace, setSelectedRace] = useState<any>(null);
  const [time, setTime] = useState("");
  const [participants, setParticipants] = useState<any[]>([]);

  // Pobieranie prawdziwej ekipy z bazy danych
  useEffect(() => {
    async function getRunners() {
      const { data } = await supabase.from("profiles").select("display_name, id");
      if (data) setParticipants(data);
    }
    getRunners();
  }, []);

  const handleSaveResult = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { alert("Musisz być zalogowany!"); return; }

    const { error } = await supabase.from("results").insert({
      user_id: user.id,
      race_type: selectedRace.id,
      time: time,
      distance: selectedRace.dist,
      created_at: new Date()
    });

    if (!error) {
      alert("Wynik zapisany pomyślnie!");
      setModalOpen(false);
      setTime("");
    } else {
      alert("Błąd: " + error.message);
    }
  };

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <p className="text-center text-gray-400 text-[11px] mb-10 uppercase tracking-widest font-bold">
        Kliknij w kartę, aby dodać swój wynik
      </p>

      {/* Karty Biegów */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        {RUNS.map((run) => (
          <div key={run.id} onClick={() => { setSelectedRace(run); setModalOpen(true); }} className="workout-card p-8 rounded-2xl shadow-sm">
            <span className="text-[9px] font-black bg-blue-50 text-blue-500 px-2 py-1 rounded mb-4 inline-block uppercase">Bieg</span>
            <h3 className="text-xl font-bold">{run.name}</h3>
            <p className="text-gray-400 text-sm">{run.dist} km</p>
          </div>
        ))}
      </div>

      {/* Tabela Uczestników */}
      <div className="paid-table-container shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-50 flex justify-between items-center">
          <h3 className="font-bold text-slate-800 uppercase tracking-widest text-sm">Zarejestrowana Ekipa</h3>
          <span className="text-[10px] text-gray-400 font-bold uppercase">{participants.length} osób</span>
        </div>
        <table className="w-full text-left bg-white text-black">
          <thead>
            <tr className="text-[9px] text-gray-300 font-black uppercase tracking-[0.2em] border-b border-gray-50">
              <th className="p-6">Uczestnik</th>
              <th className="p-6 text-right">Status</th>
            </tr>
          </thead>
          <tbody>
            {participants.map((u, i) => (
              <tr key={i} className="border-b border-gray-50">
                <td className="p-6 font-bold text-sm text-slate-800">{u.display_name || "Biegacz"}</td>
                <td className="p-6 text-right">
                  <span className="bg-emerald-50 text-emerald-500 text-[9px] font-black px-3 py-1 rounded-full uppercase">ZAREJESTROWANY</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* OKNO (MODAL) DODAWANIA WYNIKU */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[2000] flex items-center justify-center p-4">
          <div className="bg-white p-10 rounded-[2.5rem] w-full max-w-sm shadow-2xl text-black">
            <h3 className="text-2xl font-black mb-1">{selectedRace?.name}</h3>
            <p className="text-gray-400 text-xs font-bold uppercase mb-8">Wpisz swój czas (HH:MM:SS)</p>
            <input 
              type="text" 
              value={time}
              onChange={(e) => setTime(e.target.value)}
              placeholder="00:00:00" 
              className="w-full p-5 bg-gray-50 border border-gray-100 rounded-2xl mb-8 text-center text-3xl font-mono outline-none focus:border-blue-400" 
              autoFocus 
            />
            <div className="flex gap-4">
              <button onClick={() => setModalOpen(false)} className="flex-1 py-4 font-black text-gray-400 uppercase text-xs">Anuluj</button>
              <button onClick={handleSaveResult} className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase text-xs">Zapisz</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}