import type { TimeSlot } from '../components/calendar/shared-calendar';

const MICROSOFT_CLIENT_ID = import.meta.env.VITE_MICROSOFT_CLIENT_ID;

interface MsEvent {
  id: string;
  subject?: string;
  start: { dateTime: string };
  end: { dateTime: string };
}

function parseEvent(event: MsEvent): TimeSlot {
  const startDate = new Date(event.start.dateTime);
  const endDate = new Date(event.end.dateTime);
  return {
    id: `microsoft-${event.id}`,
    user_id: 'external',
    start: startDate.toISOString().slice(11,16),
    end: endDate.toISOString().slice(11,16),
    date: startDate.toISOString().slice(0,10),
    type: 'booked',
    title: event.subject || null,
    source: 'microsoft',
  };
}

export async function fetchMicrosoftCalendarEvents(): Promise<TimeSlot[]> {
  try {
    const msal: any = (window as any).msal;
    if (!msal?.PublicClientApplication) {
      return [];
    }
    const app = new msal.PublicClientApplication({
      auth: { clientId: MICROSOFT_CLIENT_ID, redirectUri: window.location.origin },
    });
    const login = await app.loginPopup({ scopes: ['Calendars.Read'] });
    const tokenResp = await app.acquireTokenSilent({
      scopes: ['Calendars.Read'],
      account: login.account,
    });
    const res = await fetch('https://graph.microsoft.com/v1.0/me/events?$select=subject,start,end', {
      headers: { Authorization: `Bearer ${tokenResp.accessToken}` },
    });
    const data = await res.json();
    const items: MsEvent[] = data.value || [];
    return items.map(parseEvent);
  } catch (err) {
    console.error('Failed to fetch Microsoft Calendar events', err);
    return [];
  }
}
