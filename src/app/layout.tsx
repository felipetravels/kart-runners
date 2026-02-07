import type { Metadata } from "next";
import AuthBar from "@/components/AuthBar";

export const metadata: Metadata = {
  title: "KART Runners",
  description: "Kalendarz biegów i uczestników",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl">
      <body style={{ margin: 0, fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif" }}>
        <div style={{ maxWidth: 980, margin: "0 auto", padding: 16 }}>
          <header
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 12,
              flexWrap: "wrap",
              borderBottom: "1px solid #eee",
              paddingBottom: 12,
              marginBottom: 16,
            }}
          >
            <a href="/" style={{ textDecoration: "none", color: "inherit" }}>
              <div style={{ fontSize: 18, fontWeight: 800 }}>KART Runners</div>
              <div style={{ fontSize: 12, color: "#666" }}>biegi · drużyny · uczestnicy</div>
            </a>

            <AuthBar />
          </header>

          {children}
        </div>
      </body>
    </html>
  );
}
