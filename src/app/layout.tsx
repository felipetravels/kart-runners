import "./globals.css";
import Navbar from "./components/Navbar";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const currentYear = new Date().getFullYear();
  return (
    <html lang="pl">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap" rel="stylesheet" />
      </head>
      <body style={{ 
        margin: 0, 
        background: "#000", 
        backgroundImage: "linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.8)), url('/hero.png')",
        backgroundSize: "cover",
        backgroundAttachment: "fixed",
        backgroundPosition: "center",
        color: "#fff",
        fontFamily: "'Inter', sans-serif",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column"
      }}>
        <Navbar />
        <div style={{ flex: 1 }}>{children}</div>
        
        <footer style={{ 
          padding: "60px 20px", 
          textAlign: "center", 
          background: "rgba(0,0,0,0.95)", 
          borderTop: "1px solid #333",
          marginTop: "80px"
        }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "15px", marginBottom: "20px" }}>
            <span style={{ fontSize: "0.7rem", opacity: 0.5, letterSpacing: "2px" }}>POWERED BY</span>
            <img src="/krk-airport-logo.png" alt="KRK Airport" style={{ height: "50px", width: "auto" }} />
          </div>
          <p style={{ fontSize: "0.85rem", opacity: 0.6, margin: 0 }}>
            Made by <a href="https://felipetravels.com" style={{ color: "#00d4ff", textDecoration: "none", fontWeight: "bold" }}>felipetravels</a>. 
            All rights reserved {currentYear}
          </p>
        </footer>
      </body>
    </html>
  );
}
