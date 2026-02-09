import "./globals.css";
import Navbar from "./components/Navbar";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl">
      <head><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap" rel="stylesheet" /></head>
      <body style={{ 
        margin: 0, background: "#000", backgroundImage: "linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.8)), url('/hero.png')",
        backgroundSize: "cover", backgroundAttachment: "fixed", color: "#fff", fontFamily: "'Inter', sans-serif"
      }}>
        <Navbar />
        <div style={{ minHeight: "80vh" }}>{children}</div>
        <footer style={{ padding: "80px 20px", textAlign: "center", background: "rgba(0,0,0,0.95)", borderTop: "1px solid #333" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "20px", marginBottom: "30px" }}>
            <span style={{ fontSize: "0.8rem", opacity: 0.5, letterSpacing: "3px" }}>POWERED BY</span>
            <img src="/krk-airport-logo.png" alt="KRK Airport" style={{ height: "100px", width: "auto" }} />
          </div>
          <p style={{ fontSize: "0.9rem", opacity: 0.6 }}>
            Made by <a href="https://felipetravels.com" style={{ color: "#00d4ff", textDecoration: "none", fontWeight: 900 }}>felipetravels</a>. All rights reserved 2026
          </p>
        </footer>
      </body>
    </html>
  );
}
