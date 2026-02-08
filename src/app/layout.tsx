import "./globals.css";
import AuthBadge from "./components/AuthBadge";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl">
      <body style={{ margin: 0, padding: 0, backgroundColor: "#000", color: "#fff", fontFamily: "sans-serif", display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <header style={{ 
          display: "flex", justifyContent: "space-between", alignItems: "center", 
          padding: "15px 25px", borderBottom: "1px solid rgba(255,255,255,0.1)", 
          backgroundColor: "rgba(0,0,0,0.85)", backdropFilter: "blur(10px)", 
          position: "sticky", top: 0, zIndex: 100 
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 15 }}>
            <a href="/" style={{ display: "flex", alignItems: "center", gap: 15, textDecoration: "none", color: "white" }}>
              <img src="/logo-kart.png" alt="KART" style={{ height: "80px", width: "auto" }} />
              <span style={{ fontWeight: 900, fontSize: "1.2rem", maxWidth: "200px", lineHeight: "1.2" }}>
                Kraków Airport Running Team
              </span>
            </a>
          </div>
          <AuthBadge />
        </header>

        <div style={{ flex: 1, padding: "20px" }}>{children}</div>

        <footer style={{ padding: "50px 20px", borderTop: "1px solid rgba(255,255,255,0.1)", textAlign: "center", backgroundColor: "#050505" }}>
          <div style={{ marginBottom: "20px", opacity: 0.8 }}>Biegamy razem dla:</div>
          <img src="/krk-airport-logo.png" alt="KRK Airport" style={{ height: "80px", width: "auto" }} />
        </footer>
      </body>
    </html>
  );
}