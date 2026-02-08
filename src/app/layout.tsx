import "./globals.css";
import AuthBadge from "./components/AuthBadge";

export const metadata = {
  title: "KART Runners",
  description: "Platforma dla biegaczy KART",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
        {/* BANER GÓRNY */}
        <header style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center", 
          padding: "15px 25px",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
          backgroundColor: "rgba(0,0,0,0.85)",
          backdropFilter: "blur(10px)",
          position: "sticky",
          top: 0,
          zIndex: 100
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 15 }}>
            <a href="/" style={{ display: "block" }}>
              <img 
                src="/logo-kart.png" 
                alt="KART Logo" 
                style={{ height: "70px", width: "auto", display: "block", backgroundColor: "transparent" }} 
              />
            </a>
            <span style={{ fontWeight: 900, fontSize: "1.4rem", letterSpacing: "1px" }}>HUB</span>
          </div>
          <AuthBadge />
        </header>

        {/* TREŚĆ STRONY */}
        <div style={{ flex: 1, padding: "20px" }}>
          {children}
        </div>

        {/* STOPKA */}
        <footer style={{ 
          padding: "50px 20px", 
          borderTop: "1px solid rgba(255,255,255,0.1)", 
          marginTop: "40px",
          textAlign: "center",
          backgroundColor: "#050505"
        }}>
          <div style={{ marginBottom: "20px", fontSize: "1.1rem", fontWeight: 300, opacity: 0.8 }}>
            Biegamy razem dla:
          </div>
          <img 
            src="/krk-airport-logo.png" 
            alt="KRK Airport Logo" 
            style={{ height: "80px", width: "auto", opacity: 1, backgroundColor: "transparent" }} 
          />
          <p style={{ fontSize: "0.8rem", opacity: 0.4, marginTop: "30px" }}>
            &copy; {new Date().getFullYear()} KART Runners. All rights reserved.
          </p>
        </footer>
      </body>
    </html>
  );
}