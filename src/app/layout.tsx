import "./globals.css";
import AuthBadge from "@/app/components/AuthBadge";

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
      <body style={{ margin: 0, padding: "16px", backgroundColor: "#000", color: "#fff", fontFamily: "sans-serif" }}>
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <div style={{ fontWeight: "bold", fontSize: "1.2rem" }}>
            <a href="/" style={{ color: "inherit", textDecoration: "none" }}>KART HUB</a>
          </div>
          <AuthBadge />
        </header>
        {children}
      </body>
    </html>
  );
}