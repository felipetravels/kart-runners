import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  // Zabezpieczenie przed niepowołanym odpaleniem
  if (!token || token !== process.env.CRON_SECRET) {
    return new Response('Unauthorized - Sprawdź token', { status: 401 });
  }

  // Pobieramy dzisiejszą datę
  const today = new Date().toISOString().split('T')[0];

  // 1. Sprawdzamy czy na dzisiaj zaplanowano jakieś biegi
  const { data: races } = await supabase
    .from('races')
    .select('id, title')
    .eq('race_date', today);

  if (!races || races.length === 0) {
    return NextResponse.json({ message: 'Brak biegów na dziś. System śpi.' });
  }

  // 2. Dla każdego dzisiejszego biegu szukamy zapisanych zawodników
  for (const race of races) {
    const { data: participants } = await supabase
      .from('participations')
      .select('profiles(display_name)')
      .eq('race_id', race.id);

    // 3. Składamy listę imion
    let namesString = "";
    if (participants && participants.length > 0) {
      // Wyciągamy same imiona z zagnieżdżonego obiektu, ignorujemy puste
      const names = participants
        .map((p: any) => p.profiles?.display_name)
        .filter(Boolean);
      
      if (names.length > 0) {
        namesString = `Dzisiaj biegną: ${names.join(', ')}! `;
      }
    }

    // 4. Budujemy ostateczną treść wiadomości
    const messageContent = namesString 
      ? `${namesString}Trzymajmy kciuki na: ${race.title}! 🏆` 
      : `Dzisiaj odbywa się bieg: ${race.title}! Ktoś z ekipy startuje?`;

    // 5. Wysyłamy komendę do OneSignal
    await fetch("https://onesignal.com/api/v1/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Basic ${process.env.ONESIGNAL_REST_API_KEY}`
      },
      body: JSON.stringify({
        app_id: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID,
        included_segments: ["All"],
        headings: { en: "KART - To już dzisiaj! 🏃" },
        contents: { en: messageContent },
        url: "https://kart-runners.vercel.app/races"
      })
    });
  }

  return NextResponse.json({ message: 'Poranne powiadomienia z imionami zostały wysłane!' });
}