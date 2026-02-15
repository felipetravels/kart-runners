"use client";

import React, { useState } from 'react';

// Dane o dystansach - uwzględniono Maraton
const DISTANCES = [
  { id: '5k', name: 'Bieg 5K', km: 5 },
  { id: '10k', name: 'Bieg 10K', km: 10 },
  { id: 'half', name: 'Półmaraton', km: 21.097 },
  { id: 'marathon', name: 'Maraton', km: 42.195 },
];

// Przykładowa lista opłaconych
const PAID_USERS = [
  { id: 1, name: "Marek", email: "marek.biegacz@gmail.com" },
  { id: 2, name: "Anna", email: "ania.run@example.com" },
  { id: 3, name: "Jan", email: "j.nowak@poczta.pl" },
];

export default function RunnerDashboard() {
  const [selectedRace, setSelectedRace] = useState<string | null>(null);

  return (
    <main className="container mx-auto px-4">
      {/* Navbar - uproszczony pod Next.js */}
      <nav className="fixed top-0 left-0 w-full bg-slate-900 text-white p-4 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <span className="text-xl font-bold">Runner HUB</span>
          <span className="text-sm opacity-70">Witaj, Biegaczu</span>
        </div>
      </nav>

      {/* Sekcja Biegów */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Twoje Biegi (Kliknij, aby dopisać wynik)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {DISTANCES.map((race) => (
            <div 
              key={race.id} 
              className="workout-card"
              onClick={() => setSelectedRace(race.name)}
            >
              <h3 className="font-bold text-lg">{race.name}</h3>
              <p className="text-gray-500">{race.km} km</p>
              <div className="mt-4 text-xs font-semibold text-blue-600">KLIKNIJ, ABY EDYTOWAĆ</div>
            </div>
          ))}
        </div>
      </section>

      {/* Lista Opłaconych */}
      <section className="paid-table-container">
        <div className="bg-gray-50 p-4 border-b border-gray-200">
          <h3 className="font-bold">Lista opłaconych startów</h3>
        </div>
        <table className="w-full text-left">
          <thead>
            <tr className="text-sm text-gray-500 border-b">
              <th className="p-4">Imię</th>
              <th className="p-4">Adres E-mail</th>
              <th className="p-4 text-right">Status</th>
            </tr>
          </thead>
          <tbody>
            {PAID_USERS.map((user) => (
              <tr key={user.id} className="border-b hover:bg-gray-50">
                <td className="p-4 font-medium">{user.name}</td>
                <td className="p-4 text-gray-600">{user.email}</td>
                <td className="p-4 text-right">
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
                    Opłacono
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Prosty Modal Result (wyświetlany po kliknięciu) */}
      {selectedRace && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
          <div className="bg-white p-6 rounded-2xl w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-bold mb-4">Dodaj wynik dla: {selectedRace}</h3>
            <input 
              type="text" 
              placeholder="HH:MM:SS" 
              className="w-full p-3 border rounded-lg mb-4"
              autoFocus
            />
            <div className="flex gap-2">
              <button 
                onClick={() => setSelectedRace(null)}
                className="flex-1 bg-gray-200 p-3 rounded-lg font-bold"
              >
                Anuluj
              </button>
              <button 
                onClick={() => { alert('Zapisano!'); setSelectedRace(null); }}
                className="flex-1 bg-blue-600 text-white p-3 rounded-lg font-bold"
              >
                Zapisz
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}