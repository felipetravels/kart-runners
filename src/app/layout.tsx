import "./globals.css";
import AuthBadge from "./components/AuthBadge";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl">
      <body style={{ 
        margin: 0, 
        padding: 0, 
        backgroundColor: "#000", 
        color: "#fff", 
        fontFamily: "sans-serif", 
        display: "flex", 
        flexDirection: "column", 
        minHeight: "100vh" 
      }}>
        {/* HEADER */}
        <header style={{ 
          display: "flex", 
          justifyContent: "space-between", // Rozpycha logo na lewo, a logowanie na prawo
          alignItems: "center", 
          padding: "20px 30px", 
          borderBottom: "1px solid rgba(255,255,255,0.1)", 
          backgroundColor: "rgba(0,0,0,0.9)", 
          backdropFilter: "blur(10px)", 
          position: "sticky", 
          top: 0, 
          zIndex: 100 
        }}>
          {/* LEWA STRONA: LOGO + NAZWA */}
          <div style={{ display: "flex", alignItems: "center", gap: 25 }}>
            <a href="/" style={{ display: "flex", alignItems: "center", gap: 25, textDecoration: "none", color: "white" }}>
              <img 
                src="/logo-kart.png" 
                alt="KART" 
                style={{ height: "160px", width: "auto", display: "block" }} // Powiększone logo (2x)
              />
              <span style={{ 
                fontWeight: 900, 
                fontSize: "1.8rem", // Większa czcionka nazwy
                maxWidth: "350px", 
                lineHeight: "1.1",
                textTransform: "uppercase",
                letterSpacing: "-1px"
              }}>
                Kraków Airport Running Team
              </span>
            </a>
          </div>

          {/* PRAWA STRONA: LOGOWANIE */}
          <div style={{ display: "flex", alignItems: "center" }}>
            <AuthBadge />
          </div>
        </header>

        {/* TREŚĆ STRONY */}
        <div style={{ flex: 1, padding: "20px" }}>
          {children}
        </div>

        {/* FOOTER */}
        <footer style={{ 
          padding: "60px 20px", 
          borderTop: "1px solid rgba(255,255,255,0.1)", 
          textAlign: "center", 
          backgroundColor: "#050505" 
        }}>
          <div style={{ marginBottom: "25px", opacity: 0.6, fontSize: "0.9rem", letterSpacing: "2px" }}>
            BIEGAMY RAZEM DLA:
          </div>
          <img src="/krk-airport-logo.png" alt="KRK Airport" style={{ height: "100px", width: "auto" }} />
        </footer>
      </body>
    </html>
  );
}