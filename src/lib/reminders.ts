import { supabase } from '@/integrations/supabase/client';
import { withRetry } from '@/lib/retry';

interface ReminderSlot {
  id: string;
  date: string;
  start: string;
}

export const scheduleReminder = async (userId: string, slot: ReminderSlot) => {
  const slotTime = new Date(`${slot.date}T${slot.start}`);
  const remindAt = new Date(slotTime.getTime() - 2 * 60 * 60 * 1000);
  await withRetry(() =>
    supabase.from('reminders').insert({
      user_id: userId,
      time_slot_id: slot.id,
      remind_at: remindAt.toISOString(),
    })
  );
};

export const scheduleSurprise = async (
  userId: string,
  idea: string,
  dateTime: string
) => {
  const isoDate = new Date(dateTime).toISOString();
  const { data } = await withRetry(() =>
    supabase
      .from('scheduled_surprises')
      .insert({
        user_id: userId,
        idea,
        scheduled_at: isoDate,
      })
      .select()
      .single()
  );

  if (data) {
    const remindAt = new Date(new Date(isoDate).getTime() - 2 * 60 * 60 * 1000);
    await withRetry(() =>
      supabase.from('reminders').insert({
        user_id: userId,
        time_slot_id: data.id,
        remind_at: remindAt.toISOString(),
      })
    );
  }
};
