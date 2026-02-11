import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const authHeader = request.headers.get('authorization');
  
  // Sprawdzamy token z nagłówka lub z parametru URL (ułatwia testowanie)
  const token = authHeader?.split(' ')[1] || searchParams.get('token');

  if (token !== process.env.CRON_SECRET) {
    return new Response('Unauthorized', { status: 401 });
  }

  const today = new Date().toISOString().split('T')[0];

  const { data: races, error } = await supabase
    .from('races')
    .select('title')
    .eq('race_date', today);

  if (error || !races || races.length === 0) {
    return NextResponse.json({ message: 'Brak biegów na dziś.' });
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
        headings: { en: "To już dzisiaj! 🏃" },
        contents: { en: `Powodzenia na biegu: ${race.title}! Dajcie z siebie wszystko!` },
        url: "https://kart-runners.vercel.app"
      })
    });
  }

  return NextResponse.json({ message: `Wysłano powiadomienia dla: ${races.length} biegów.` });
}
