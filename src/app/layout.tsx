import "./globals.css";
import AuthBadge from "./components/AuthBadge";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl">
      <body style={{ margin: 0, padding: 0, backgroundColor: "#000", color: "#fff", fontFamily: "sans-serif", display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        
        <header style={{ 
          width: "100%",
          borderBottom: "1px solid rgba(255,255,255,0.1)", 
          backgroundColor: "rgba(0,0,0,0.95)",
          padding: "20px 0",
          position: "sticky",
          top: 0,
          zIndex: 999
        }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 20px" }}>
            
            {/* LOGO KART */}
            <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
              <a href="/" style={{ display: "flex", alignItems: "center", gap: 20, textDecoration: "none", color: "white" }}>
                <img src="/logo-kart.png" alt="KART" style={{ height: "100px", width: "auto" }} />
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span style={{ fontWeight: 900, fontSize: "1.4rem", lineHeight: "1.1" }}>Kraków Airport</span>
                  <span style={{ fontWeight: 900, fontSize: "1.4rem", lineHeight: "1.1", color: "#00d4ff" }}>Running Team</span>
                </div>
              </a>
            </div>

            {/* LOGOWANIE - wymuszam widoczność ramką */}
            <div style={{ border: "1px solid #00d4ff", padding: "10px 20px", borderRadius: "12px", background: "rgba(0,212,255,0.1)" }}>
              <AuthBadge />
            </div>

          </div>
        </header>

        <div style={{ flex: 1, padding: "40px 20px", maxWidth: "1200px", margin: "0 auto", width: "100%", boxSizing: "border-box" }}>
          {children}
        </div>

        <footer style={{ padding: "60px 20px", borderTop: "1px solid rgba(255,255,255,0.1)", textAlign: "center" }}>
          <div style={{ opacity: 0.5, marginBottom: 15, fontSize: "0.8rem" }}>BIEGAMY RAZEM DLA:</div>
          <img src="/krk-airport-logo.png" alt="KRK Airport" style={{ height: "100px", width: "auto" }} />
        </footer>
      </body>
    </html>
  );
}