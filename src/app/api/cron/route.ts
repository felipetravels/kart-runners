import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET(request: Request) {
  // Autoryzacja Vercel (opcjonalna, ale zalecana)
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  const today = new Date().toISOString().split('T')[0];

  // Szukamy biegów zaplanowanych na dziś
  const { data: races, error } = await supabase
    .from('races')
    .select('title')
    .eq('race_date', today);

  if (error || !races || races.length === 0) {
    return NextResponse.json({ message: 'Brak biegów na dziś.' });
  }

  // Jeśli są biegi, wysyłamy powiadomienie przez OneSignal
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
        headings: { en: "To już dzisiaj! 🏃" },
        contents: { en: `Powodzenia na biegu: ${race.title}! Dajcie z siebie wszystko!` },
        url: "https://kart-runners.vercel.app"
      })
    });
  }

  return NextResponse.json({ message: `Wysłano powiadomienia dla: ${races.length} biegów.` });
}
