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

              {/* LOGO KRK: w topbar, żebyś je widział od razu */}
              <div className="krk-topbar">
                <img
                  src="/krk-airport-logo.png"
                  alt="Kraków Airport"
                  className="krk-topbar-logo"
                />
                <span className="krk-topbar-text">Representing KRK</span>
              </div>

              <nav className="nav">
                <a className="nav-link" href="/">Biegi</a>
                <a className="nav-link" href="/stats">Statystyki</a>
                <a className="nav-link" href="/dashboard">Profil</a>
                <a className="nav-link" href="/login">Logowanie</a>
              </nav>
            </div>
          </header>

          <main className="container">{children}</main>

          <footer className="footer">
            <div className="footer-inner">
              <div className="footer-left">
                <strong>KART Runners</strong> · wersja beta
              </div>

              {/* LOGO KRK: w stopce */}
              <div className="footer-right">
                <span className="krk-footer">
                  <img
                    src="/krk-airport-logo.png"
                    alt="Kraków Airport"
                    className="krk-footer-logo"
                  />
                  <span>Representing KRK (Kraków Airport)</span>
                </span>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
