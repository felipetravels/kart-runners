"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push("/");
      } else {
        // Zwykłe logowanie wystarczy, ufamy użytkownikom
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <div style={{ color: "#fff", padding: "100px", textAlign: "center", background: "#000", minHeight: "100vh" }}>
        Weryfikacja autoryzacji...
      </div>
    );
  }

  return <>{children}</>;
}
