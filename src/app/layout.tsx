import "./globals.css";
import Navbar from "./components/Navbar";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const currentYear = new Date().getFullYear();
  return (
    <html lang="pl">
      <body style={{ 
        margin: 0, 
        background: "#000", 
        backgroundImage: "linear-gradient(rgba(0,0,0,0.8), rgba(0,0,0,0.8)), url('/hero.png')",
        backgroundSize: "cover",
        backgroundAttachment: "fixed",
        backgroundPosition: "center",
        color: "#fff",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column"
      }}>
        <Navbar />
        <div style={{ flex: 1 }}>{children}</div>
        
        <footer style={{ 
          padding: "40px 20px", 
          textAlign: "center", 
          background: "rgba(0,0,0,0.9)", 
          borderTop: "1px solid #222",
          marginTop: "50px"
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", marginBottom: "15px" }}>
            <span style={{ fontSize: "0.8rem", opacity: 0.5 }}>POWERED BY</span>
            <img src="/krk-airport-logo.png" alt="KRK Airport" style={{ height: "30px" }} />
          </div>
          <p style={{ fontSize: "0.8rem", opacity: 0.7, margin: 0 }}>
            Made by <a href="https://felipetravels.com" style={{ color: "#00d4ff", textDecoration: "none" }}>felipetravels</a>. 
            All rights reserved {currentYear}
          </p>
        </footer>
      </body>
    </html>
  );
}
