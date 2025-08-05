import type { TimeSlot } from '@/components/calendar/shared-calendar';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

interface GoogleEvent {
  id: string;
  start: { dateTime?: string; date?: string };
  end: { dateTime?: string; date?: string };
  summary?: string;
}

function parseEvent(event: GoogleEvent): TimeSlot | null {
  const start = event.start.dateTime || event.start.date;
  const end = event.end.dateTime || event.end.date;
  if (!start || !end) return null;
  const startDate = new Date(start);
  const endDate = new Date(end);
  return {
    id: `google-${event.id}`,
    user_id: 'external',
    start: startDate.toISOString().slice(11,16),
    end: endDate.toISOString().slice(11,16),
    date: startDate.toISOString().slice(0,10),
    type: 'booked',
    title: event.summary || null,
    source: 'google',
  };
}

export async function fetchGoogleCalendarEvents(): Promise<TimeSlot[]> {
  try {
    const token: string | null = await new Promise((resolve) => {
      const google: any = (window as any).google;
      if (!google?.accounts?.oauth2) {
        resolve(null);
        return;
      }
      const client = google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: 'https://www.googleapis.com/auth/calendar.readonly',
        callback: (resp: any) => resolve(resp.access_token),
      });
      client.requestAccessToken();
    });
    if (!token) return [];
    const now = new Date();
    const max = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${now.toISOString()}&timeMax=${max.toISOString()}`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    const items: GoogleEvent[] = data.items || [];
    return items.map(parseEvent).filter(Boolean) as TimeSlot[];
  } catch (err) {
    console.error('Failed to fetch Google Calendar events', err);
    return [];
  }
}
