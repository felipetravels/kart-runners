import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  // Logujemy dla diagnostyki w konsoli Vercel
  console.log("Otrzymany token:", token);
  console.log("Oczekiwany token:", process.env.CRON_SECRET);

  if (!token || token !== process.env.CRON_SECRET) {
    return new Response('Unauthorized - Sprawdz token w URL', { status: 401 });
  }

  const today = new Date().toISOString().split('T')[0];

  const { data: races } = await supabase
    .from('races')
    .select('title')
    .eq('race_date', today);

  if (!races || races.length === 0) {
    return NextResponse.json({ message: 'Brak biegow na dzis. System dziala poprawnie.' });
  }

  for (const race of races) {
    await fetch("https://onesignal.com/api/v1/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Basic ${process.env.ONESIGNAL_REST_API_KEY}`
      },
      body: JSON.stringify({
        app_id: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID,
        included_segments: ["All"],
        headings: { en: "To juz dzisiaj! 🏃" },
        contents: { en: `Powodzenia na biegu: ${race.title}!` },
        url: "https://kart-runners.vercel.app"
      })
    });
  }

  return NextResponse.json({ message: 'Powiadomienia wyslane.' });
}
