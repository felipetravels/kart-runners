import "./globals.css";
import Navbar from "./components/Navbar";

export const metadata = {
  title: "KART RUNNERS",
  description: "Team management app",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl">
      <body style={{ margin: 0, background: "#000", fontFamily: "sans-serif" }}>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
