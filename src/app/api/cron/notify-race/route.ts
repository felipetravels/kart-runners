import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, date } = body;

    if (!title) {
      return NextResponse.json({ error: 'Brak tytułu biegu' }, { status: 400 });
    }

    const response = await fetch("https://onesignal.com/api/v1/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Basic ${process.env.ONESIGNAL_REST_API_KEY}`
      },
      body: JSON.stringify({
        app_id: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID,
        included_segments: ["All"],
        headings: { en: "Nowy start na horyzoncie! 📅" },
        contents: { en: `Dodano bieg: ${title} (${date}). Wbijaj na stronę i się zapisuj!` },
        url: "https://kart-runners.vercel.app/races"
      })
    });

    const data = await response.json();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Błąd wysyłania powiadomienia:", error);
    return NextResponse.json({ error: 'Błąd serwera' }, { status: 500 });
  }
}