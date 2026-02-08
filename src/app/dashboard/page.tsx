"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

type Profile = {
  id: string;
  display_name: string | null;
  team: string | null;
  role: string | null;
};

export default function AdminDashboard() {
  const router = useRouter();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [adminUser, setAdminUser] = useState<any>(null);

  useEffect(() => {
    async function checkAdminAndLoad() {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push("/login");
        return;
      }

      // Sprawdzamy czy zalogowany użytkownik to admin
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profile?.role !== "admin") {
        // Jeśli nie jesteś adminem, wracasz na główną
        router.push("/");
        return;
      }

      setAdminUser(user);

      // Pobieramy listę wszystkich biegaczy
      const { data: allProfiles } = await supabase
        .from("profiles")
        .select("*")
        .order("display_name", { ascending: true });

      setProfiles(allProfiles || []);
      setLoading(false);
    }

    checkAdminAndLoad();
  }, [router]);

  // Funkcja wysyłająca link do resetu hasła (Metoda zalecana przez kod)
  const handleResetRequest = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) alert("Błąd: " + error.message);
    else alert("Link do resetu hasła został wysłany na: " + email);
  };

  if (loading) return <main style={{ padding: 50, textAlign: "center", color: "#fff" }}>Sprawdzanie uprawnień...</main>;

  return (
    <main style={{ maxWidth: 1000, margin: "0 auto", padding: "40px 20px", color: "#fff" }}>
      <header style={{ marginBottom: 40, borderBottom: "1px solid #333", paddingBottom: 20 }}>
        <h1>Panel Administratora</h1>
        <p style={{ opacity: 0.6 }}>Zalogowany jako: {adminUser?.email}</p>
      </header>

      <section>
        <h2>Zarządzanie Biegaczami</h2>
        <div style={{ overflowX: "auto", marginTop: 20 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", background: "rgba(255,255,255,0.05)", borderRadius: 15 }}>
            <thead>
              <tr style={{ textAlign: "left", borderBottom: "1px solid #444" }}>
                <th style={thStyle}>Imię i Nazwisko</th>
                <th style={thStyle}>Drużyna</th>
                <th style={thStyle}>Rola</th>
                <th style={thStyle}>Akcje</th>
              </tr>
            </thead>
            <tbody>
              {profiles.map((p) => (
                <tr key={p.id} style={{ borderBottom: "1px solid #222" }}>
                  <td style={tdStyle}>{p.display_name || "Brak imienia"}</td>
                  <td style={tdStyle}>
                    <span style={{ 
                      padding: "4px 10px", 
                      borderRadius: 8, 
                      fontSize: "0.8rem", 
                      background: p.team === "KART" ? "#00d4ff22" : "#00ff0022",
                      color: p.team === "KART" ? "#00d4ff" : "#00ff00"
                    }}>
                      {p.team || "Nieprzypisany"}
                    </span>
                  </td>
                  <td style={tdStyle}>{p.role || "user"}</td>
                  <td style={tdStyle}>
                    <button 
                      onClick={() => handleResetRequest(adminUser.email)} // Tu docelowo email użytkownika z auth.users
                      style={actionButtonStyle}
                    >
                      Resetuj Hasło
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

const thStyle: React.CSSProperties = { padding: "15px", opacity: 0.7, fontWeight: 400 };
const tdStyle: React.CSSProperties = { padding: "15px" };
const actionButtonStyle: React.CSSProperties = {
  background: "none",
  border: "1px solid #444",
  color: "#fff",
  padding: "6px 12px",
  borderRadius: 8,
  cursor: "pointer",
  fontSize: "0.8rem"
};