import "./globals.css";

export const metadata = {
  title: "KART Runners",
  description: "Biegi, drużyny i statystyki roczne",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl">
      <body>
        <div className="app-bg">
          <header className="topbar">
            <div className="topbar-inner">
              <a href="/" className="brand">
                <div className="brand-logo">K</div>
                <div className="brand-text">
                  <div className="brand-title">KART Runners</div>
                  <div className="brand-subtitle">Biegi • Drużyny • Statystyki</div>
                </div>
              </a>

              <nav className="nav">
                <a className="nav-link" href="/">
                  Biegi
                </a>
                <a className="nav-link" href="/dashboard">
                  Profil
                </a>
                <a className="nav-link" href="/login">
                  Logowanie
                </a>
              </nav>
            </div>
          </header>

          <main className="container">{children}</main>

          <footer className="footer">
            <div className="footer-inner">
              <div className="footer-left">
                <strong>KART Runners</strong> · wersja beta
              </div>
              <div className="footer-right">
                Made with questionable decisions and Supabase.
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
