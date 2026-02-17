"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

const RUNS = [
  { id: "5k", name: "Bieg 5K", dist: "5.0 km" },
  { id: "10k", name: "Bieg 10K", dist: "10.0 km" },
  { id: "hm", name: "Półmaraton", dist: "21.097 km" },
  { id: "m", name: "Maraton", dist: "42.195 km" },
];

export default function Page() {
  const [participants, setParticipants] = useState<any[]>([]);

  useEffect(() => {
    async function fetchParticipants() {
      const { data } = await supabase.from("profiles").select("display_name, id");
      if (data) setParticipants(data);
    }
    fetchParticipants();
  }, []);

  return (
    <main className="max-w-6xl mx-auto px-4 py-12">
      <p className="text-center text-gray-400 text-[11px] mb-10 font-medium uppercase tracking-widest">
        Kliknij w kartę, aby zobaczyć szczegóły lub dodać wynik
      </p>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        {RUNS.map((run) => (
          <Link href={`/races/${run.id}`} key={run.id} style={{ textDecoration: 'none' }}>
            <div className="workout-card p-8 rounded-2xl shadow-sm hover:shadow-md border border-gray-100 bg-white">
              <span className="text-[9px] font-black bg-blue-50 text-blue-500 px-2 py-1 rounded-md mb-4 inline-block uppercase tracking-wider">Bieg</span>
              <h3 className="text-xl font-bold text-slate-900">{run.name}</h3>
              <p className="text-gray-400 text-sm font-medium">{run.dist}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="paid-table-container shadow-sm bg-white rounded-3xl overflow-hidden border border-gray-100">
        <div className="p-6 border-b border-gray-50 flex justify-between items-center">
          <h3 className="font-bold text-slate-800 text-sm uppercase tracking-widest">Ekipa KART</h3>
          <span className="text-[10px] text-gray-400 font-bold uppercase">{participants.length} osób</span>
        </div>
        <table className="w-full text-left">
          <thead>
            <tr className="text-[9px] text-gray-300 font-black uppercase tracking-[0.2em] border-b border-gray-50">
              <th className="p-6">Uczestnik</th>
              <th className="p-6 text-right">Status</th>
            </tr>
          </thead>
          <tbody>
            {participants.map((u, i) => (
              <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50">
                <td className="p-6 font-bold text-slate-800 text-sm">{u.display_name || "Biegacz"}</td>
                <td className="p-6 text-right">
                  <span className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-500 text-[9px] font-black px-3 py-1.5 rounded-full uppercase">
                    OPŁACONO
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}